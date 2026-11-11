# What staging and production share in the one Google Cloud project: APIs,
# the image registry, the GitHub login and the identities CI uses.
# Applied by .github/workflows/infra.yml on every push to `main`, before staging.
#
# project_id comes from TF_VAR_project_id (the GCP_PROJECT_ID GitHub variable
# in CI). OpenTofu evaluates it early, so the backend and the state encryption
# can use it.

terraform {
  required_version = "~> 1.12"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.10"
    }
  }

  backend "gcs" {
    bucket = "${var.project_id}-tofu-state"
    prefix = "shared"
  }

  # State and saved plans are encrypted client-side with the Cloud KMS key made
  # by infra/bootstrap.sh, so nothing readable sits in the bucket.
  encryption {
    key_provider "gcp_kms" "state" {
      kms_encryption_key = "projects/${var.project_id}/locations/${var.region}/keyRings/tofu/cryptoKeys/state"
      key_length         = 32
    }

    method "aes_gcm" "state" {
      keys = key_provider.gcp_kms.state
    }

    state {
      method   = method.aes_gcm.state
      enforced = true
    }

    plan {
      method   = method.aes_gcm.state
      enforced = true
    }
  }
}

variable "project_id" {
  description = "The Google Cloud project that holds both environments."
  type        = string
}

variable "region" {
  type    = string
  default = "europe-west1"
}

variable "github_repository" {
  description = "owner/name of the only repository allowed to log in from GitHub Actions."
  type        = string
  default     = "your-github-user/starter-app"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  services = [
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudkms.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "serviceusage.googleapis.com",
    "storage.googleapis.com",
    "sts.googleapis.com",
  ]

  state_bucket = "${var.project_id}-tofu-state"
  state_key    = "projects/${var.project_id}/locations/${var.region}/keyRings/tofu/cryptoKeys/state"
}

resource "google_project_service" "this" {
  for_each = toset(local.services)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# ---------------------------------------------------------------------------
# Images, shared by both environments (tagged with the commit they came from)
# ---------------------------------------------------------------------------

resource "google_artifact_registry_repository" "docker" {
  project       = var.project_id
  location      = var.region
  repository_id = "starter-app-docker"
  format        = "DOCKER"

  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"
    most_recent_versions {
      keep_count = 20
    }
  }

  cleanup_policies {
    id     = "delete-old"
    action = "DELETE"
    condition {
      older_than = "2592000s" # 30 days, except the 20 kept above
    }
  }

  depends_on = [google_project_service.this]
}

# ---------------------------------------------------------------------------
# Keyless login from GitHub Actions (Workload Identity Federation)
# ---------------------------------------------------------------------------

resource "google_iam_workload_identity_pool" "github" {
  project                   = var.project_id
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"

  depends_on = [google_project_service.this]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "starter-app"
  display_name                       = "starter-app repository"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Tokens from any other repository are rejected outright.
  attribute_condition = "assertion.repository == \"${var.github_repository}\""

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

locals {
  pool    = google_iam_workload_identity_pool.github.name
  any_ref = "principalSet://iam.googleapis.com/${local.pool}/attribute.repository/${var.github_repository}"
  # Only these branches may apply (main = staging, production = production).
  apply_refs = {
    main       = "principalSet://iam.googleapis.com/${local.pool}/attribute.ref/refs/heads/main"
    production = "principalSet://iam.googleapis.com/${local.pool}/attribute.ref/refs/heads/production"
  }
}

# tofu-plan: read-only, used by plans on pull requests from any branch.
resource "google_service_account" "tofu_plan" {
  project      = var.project_id
  account_id   = "tofu-plan"
  display_name = "OpenTofu plan (pull requests)"
}

resource "google_project_iam_member" "tofu_plan" {
  for_each = toset(["roles/viewer", "roles/iam.securityReviewer"])

  project = var.project_id
  role    = each.value
  member  = google_service_account.tofu_plan.member
}

resource "google_service_account_iam_member" "tofu_plan_github" {
  service_account_id = google_service_account.tofu_plan.name
  role               = "roles/iam.workloadIdentityUser"
  member             = local.any_ref
}

# tofu-apply: owner, because applying creates IAM bindings, service accounts
# and identity pools, which no narrower predefined role covers together.
# Only workflows running on main or production can use it.
resource "google_service_account" "tofu_apply" {
  project      = var.project_id
  account_id   = "tofu-apply"
  display_name = "OpenTofu apply (main and production branches)"
}

resource "google_project_iam_member" "tofu_apply" {
  project = var.project_id
  role    = "roles/owner"
  member  = google_service_account.tofu_apply.member
}

resource "google_service_account_iam_member" "tofu_apply_github" {
  for_each = local.apply_refs

  service_account_id = google_service_account.tofu_apply.name
  role               = "roles/iam.workloadIdentityUser"
  member             = each.value
}

# Both OpenTofu identities read and lock the state (plans write a lock file).
resource "google_storage_bucket_iam_member" "state" {
  for_each = {
    plan  = google_service_account.tofu_plan.member
    apply = google_service_account.tofu_apply.member
  }

  bucket = local.state_bucket
  role   = "roles/storage.objectUser"
  member = each.value
}

resource "google_kms_crypto_key_iam_member" "state" {
  for_each = {
    plan  = google_service_account.tofu_plan.member
    apply = google_service_account.tofu_apply.member
  }

  crypto_key_id = local.state_key
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = each.value
}

# ---------------------------------------------------------------------------
# Cloud Build: the identity deploys run as, and where their sources land
# ---------------------------------------------------------------------------

resource "google_storage_bucket" "build_source" {
  project                     = var.project_id
  name                        = "${var.project_id}-build-source"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 7
    }
  }
}

resource "google_service_account" "cloud_build" {
  project      = var.project_id
  account_id   = "cloud-build"
  display_name = "Cloud Build deploys"
}

resource "google_project_iam_member" "cloud_build" {
  for_each = toset(["roles/run.developer", "roles/logging.logWriter"])

  project = var.project_id
  role    = each.value
  member  = google_service_account.cloud_build.member
}

resource "google_artifact_registry_repository_iam_member" "cloud_build" {
  project    = var.project_id
  location   = var.region
  repository = google_artifact_registry_repository.docker.name
  role       = "roles/artifactregistry.writer"
  member     = google_service_account.cloud_build.member
}

resource "google_storage_bucket_iam_member" "cloud_build_source" {
  bucket = google_storage_bucket.build_source.name
  role   = "roles/storage.objectViewer"
  member = google_service_account.cloud_build.member
}

output "workload_identity_provider" {
  description = "Value for the GCP_WIF_PROVIDER GitHub variable."
  value       = google_iam_workload_identity_pool_provider.github.name
}
