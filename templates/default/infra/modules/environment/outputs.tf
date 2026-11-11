output "api_url" {
  value = module.api.url
}

output "web_url" {
  value = module.web.url
}

output "deployer_service_account" {
  value = google_service_account.deployer.email
}
