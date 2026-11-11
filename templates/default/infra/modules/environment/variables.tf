variable "project_id" {
  description = "The Google Cloud project that holds both environments."
  type        = string
}

variable "environment" {
  description = "staging or production."
  type        = string

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production."
  }
}

variable "region" {
  type    = string
  default = "europe-west1"
}

variable "deploy_branch" {
  description = "Only workflows running on this branch can deploy this environment (main for staging, production for production)."
  type        = string
}

variable "api_url" {
  description = "Public address of the API (accounts and progress sync), used in emails and OAuth callbacks."
  type        = string
}

variable "api_env" {
  description = "Extra plain environment variables for api (non-secret ids such as APPLE_SIGN_IN_IOS_BUNDLE_ID, RESEND_FROM...)."
  type        = map(string)
  default     = {}
}

variable "api_optional_secrets" {
  description = "Optional secrets passed to api, by base name. Add one only after its secret holds a value."
  type        = list(string)
  default     = []

  validation {
    condition     = alltrue([for s in var.api_optional_secrets : contains(["RESEND_API_KEY", "GOOGLE_OAUTH_CLIENT_IDS"], s)])
    error_message = "Use RESEND_API_KEY or GOOGLE_OAUTH_CLIENT_IDS."
  }
}

variable "api_external_secrets" {
  description = "Secrets created outside OpenTofu (it never creates or changes them), passed to api as environment variable name => Secret Manager secret id. Each must already hold a value."
  type        = map(string)
  default     = {}
}

variable "web_env" {
  description = "Plain environment variables for web."
  type        = map(string)
  default     = {}
}
