# One environment (staging or production) inside the shared project: its
# secrets, its Cloud Run services and the identity its deploy workflow uses.
# infra/shared must be applied first (APIs, registry, GitHub login, Cloud Build).

data "google_project" "this" {
  project_id = var.project_id
}

locals {
  suffix = upper(var.environment) # secrets are named <NAME>_STAGING, <NAME>_PRODUCTION

  # Secret containers only. Values are added outside of code:
  #   gcloud secrets versions add DATABASE_URL_STAGING --data-file=-
  required_secrets = ["DATABASE_URL", "AUTH_SECRET", "API_KEY"]
  optional_secrets = ["RESEND_API_KEY", "GOOGLE_OAUTH_CLIENT_IDS"]

  pool          = "projects/${data.google_project.this.number}/locations/global/workloadIdentityPools/github"
  deploy_ref    = "principalSet://iam.googleapis.com/${local.pool}/attribute.ref/refs/heads/${var.deploy_branch}"
  cloud_build   = "cloud-build@${var.project_id}.iam.gserviceaccount.com"
  source_bucket = "${var.project_id}-build-source"
}

# ---------------------------------------------------------------------------
# Secrets
# ---------------------------------------------------------------------------

resource "google_secret_manager_secret" "this" {
  for_each = toset(concat(local.required_secrets, local.optional_secrets))

  project   = var.project_id
  secret_id = "${each.value}_${local.suffix}"

  labels = {
    environment = var.environment
  }

  replication {
    auto {}
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Cloud Run refuses to start a revision that points at a secret with no
# version, so each required secret starts with a placeholder. It is write-only
# (never stored in state); the real value you add with gcloud becomes "latest".
resource "google_secret_manager_secret_version" "placeholder" {
  for_each = toset(local.required_secrets)

  secret                 = google_secret_manager_secret.this[each.value].id
  secret_data_wo         = "placeholder-set-a-real-value"
  secret_data_wo_version = 1
}

# ---------------------------------------------------------------------------
# Cloud Run services
# ---------------------------------------------------------------------------

module "api" {
  source = "../cloud-run-service"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  name        = "api"
  memory      = "512Mi"

  env = merge({
    APP_ENV  = var.environment
    NODE_ENV = "production"
    API_PORT = "3000"
    API_URL  = var.api_url
  }, var.api_env)

  # Optional secrets join once they hold a value (see api_optional_secrets).
  # External secrets are created outside OpenTofu and only read here.
  secret_env = merge({
    for name in concat(local.required_secrets, var.api_optional_secrets) :
    name => google_secret_manager_secret.this[name].secret_id
  }, var.api_external_secrets)

  depends_on = [google_secret_manager_secret_version.placeholder]
}

module "web" {
  source = "../cloud-run-service"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  name        = "web"
  memory      = "1Gi"

  env = merge({
    NODE_ENV = "production"
  }, var.web_env)

  # The marketing site has no database and reads no secrets.
}

# Cloud Build deploys new revisions that run as each app's runtime account.
resource "google_service_account_iam_member" "cloud_build_acts_as_runtime" {
  for_each = {
    api = module.api.runtime_service_account
    web = module.web.runtime_service_account
  }

  service_account_id = "projects/${var.project_id}/serviceAccounts/${each.value}"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${local.cloud_build}"
}

# ---------------------------------------------------------------------------
# Deploy identity: used by .github/workflows/deploy-<env>.yml, from the
# environment's branch only. It reads only this environment's secrets.
# ---------------------------------------------------------------------------

resource "google_service_account" "deployer" {
  project      = var.project_id
  account_id   = "deploy-${var.environment}"
  display_name = "GitHub deploy workflow (${var.environment}, ${var.deploy_branch} branch)"
}

resource "google_project_iam_member" "deployer" {
  for_each = toset([
    "roles/cloudbuild.builds.editor",
    "roles/logging.viewer", # gcloud builds submit streams the build logs
    "roles/run.viewer",
    "roles/serviceusage.serviceUsageConsumer",
  ])

  project = var.project_id
  role    = each.value
  member  = google_service_account.deployer.member
}

# Database migrations read this environment's secrets.
resource "google_secret_manager_secret_iam_member" "deployer" {
  for_each = google_secret_manager_secret.this

  project   = var.project_id
  secret_id = each.value.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.deployer.member
}

resource "google_storage_bucket_iam_member" "deployer_source" {
  bucket = local.source_bucket
  role   = "roles/storage.objectAdmin"
  member = google_service_account.deployer.member
}

# `gcloud builds submit --gcs-source-staging-dir` reads the bucket itself
# (storage.buckets.get) before it uploads, which objectAdmin does not allow.
resource "google_storage_bucket_iam_member" "deployer_source_bucket" {
  bucket = local.source_bucket
  role   = "roles/storage.legacyBucketReader"
  member = google_service_account.deployer.member
}

resource "google_service_account_iam_member" "deployer_acts_as_cloud_build" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${local.cloud_build}"
  role               = "roles/iam.serviceAccountUser"
  member             = google_service_account.deployer.member
}

resource "google_service_account_iam_member" "deployer_github" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = local.deploy_ref
}
