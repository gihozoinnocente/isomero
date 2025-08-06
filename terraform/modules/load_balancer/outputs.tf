output "load_balancer_dns_name" {
  description = "The DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "api_target_group_arn" {
  description = "The ARN of the API target group"
  value       = aws_lb_target_group.api.arn
}

output "client_target_group_arn" {
  description = "The ARN of the client target group"
  value       = aws_lb_target_group.client.arn
}

output "load_balancer_arn" {
  description = "The ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "api_listener_arn" {
  description = "The ARN of the API listener"
  value       = aws_lb_listener.api.arn
}

output "client_listener_arn" {
  description = "The ARN of the client listener"
  value       = aws_lb_listener.http.arn
}

output "api_listener_rule_arn" {
  description = "The ARN of the API path-based listener rule"
  value       = aws_lb_listener_rule.api_path.arn
}
