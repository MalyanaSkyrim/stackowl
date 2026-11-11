variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "environment" {
  type = string
}

variable "name" {
  description = "App name under apps/, e.g. api. The service is <name>-<environment>."
  type        = string
}

variable "port" {
  type    = number
  default = 3000
}

variable "cpu" {
  type    = string
  default = "1"
}

variable "memory" {
  type    = string
  default = "512Mi"
}

variable "min_instances" {
  type    = number
  default = 0
}

variable "max_instances" {
  type    = number
  default = 3
}

variable "env" {
  description = "Plain environment variables."
  type        = map(string)
  default     = {}
}

variable "secret_env" {
  description = "Environment variable name => Secret Manager secret id."
  type        = map(string)
  default     = {}
}
