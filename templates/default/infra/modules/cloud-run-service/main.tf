# One public Cloud Run service. OpenTofu owns its settings (size, env vars,
# secrets, access); the deploy workflows own the image it runs.

resource "google_service_account" "runtime" {
  project      = var.project_id
  account_id   = "run-${var.name}-${var.environment}"
  display_name = "Cloud Run runtime: ${var.name}-${var.environment}"
}

resource "google_secret_manager_secret_iam_member" "runtime" {
  for_each = toset(values(var.secret_env))

  project   = var.project_id
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.runtime.member
}

resource "google_cloud_run_v2_service" "this" {
  project             = var.project_id
  name                = "${var.name}-${var.environment}"
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  deletion_protection = var.environment == "production"

  template {
    service_account = google_service_account.runtime.email

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      # Placeholder until the first deploy. Real images come from the deploy
      # workflows (apps/<name>/cloudbuild.yaml), see ignore_changes below.
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      ports {
        container_port = var.port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      dynamic "env" {
        for_each = var.env
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.secret_env
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value
              version = "latest"
            }
          }
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }

  depends_on = [google_secret_manager_secret_iam_member.runtime]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.this.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
