# The production environment. Applied by .github/workflows/infra.yml on every push
# to the `production` branch; planned on pull requests into `production`.
# Shares the Google Cloud project, the state bucket and its key with the other
# environment; see infra/shared/main.tf for how project_id is passed.

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
    prefix = "production"
  }

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

provider "google" {
  project = var.project_id
  region  = var.region
}

module "environment" {
  source = "../../modules/environment"

  project_id    = var.project_id
  region        = var.region
  environment   = "production"
  deploy_branch = "production"
  api_url       = "https://api.example.com"

  # The audience Apple's identity tokens are checked against (auth/utils/oauth/verify.ts).
  # Staging and production builds share the bundle ID. RESEND_FROM is the sender of
  # email codes, on the domain verified in Resend.
  api_env = {
    APPLE_SIGN_IN_IOS_BUNDLE_ID = "com.example.starterapp"
    RESEND_FROM                 = "Starter App <contact@example.com>"
  }

  api_optional_secrets = ["GOOGLE_OAUTH_CLIENT_IDS", "RESEND_API_KEY"]

  # Created outside OpenTofu: the external Redis used for rate limiting.
  api_external_secrets = {
    REDIS_URL = "REDIS_URL_PROD"
  }
}

output "api_url" {
  value = module.environment.api_url
}

output "web_url" {
  value = module.environment.web_url
}
