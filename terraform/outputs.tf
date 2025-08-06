output "load_balancer_dns_name" {
  description = "The DNS name of the Application Load Balancer"
  value       = module.load_balancer.load_balancer_dns_name
}

output "database_endpoint" {
  description = "The endpoint of the RDS instance"
  value       = module.database.db_endpoint
}

output "ecr_api_repository_url" {
  description = "The URL of the API ECR repository"
  value       = module.containers.ecr_api_repository_url
}

output "ecr_client_repository_url" {
  description = "The URL of the client ECR repository"
  value       = module.containers.ecr_client_repository_url
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = module.containers.ecs_cluster_name
}

output "api_service_arn" {
  description = "The ARN of the API ECS service"
  value       = module.containers.api_service_arn
}

output "client_service_arn" {
  description = "The ARN of the client ECS service"
  value       = module.containers.client_service_arn
}

output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = module.network.private_subnet_ids
}

output "app_security_group_id" {
  description = "The ID of the application security group"
  value       = module.security.app_security_group_id
}

output "db_security_group_id" {
  description = "The ID of the database security group"
  value       = module.security.db_security_group_id
}

output "ecs_task_execution_role_arn" {
  description = "The ARN of the ECS task execution role"
  value       = module.iam.ecs_task_execution_role_arn
}
