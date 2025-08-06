output "ecr_api_repository_url" {
  description = "The URL of the API ECR repository"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_client_repository_url" {
  description = "The URL of the client ECR repository"
  value       = aws_ecr_repository.client.repository_url
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "api_task_definition_arn" {
  description = "The ARN of the API task definition"
  value       = aws_ecs_task_definition.api.arn
}

output "client_task_definition_arn" {
  description = "The ARN of the client task definition"
  value       = aws_ecs_task_definition.client.arn
}

output "api_service_arn" {
  description = "The ARN of the API ECS service"
  value       = aws_ecs_service.api.arn
}

output "client_service_arn" {
  description = "The ARN of the client ECS service"
  value       = aws_ecs_service.client.arn
}

output "task_execution_role_arn" {
  description = "The ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.arn
}
