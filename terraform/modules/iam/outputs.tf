output "ecs_task_execution_role_arn" {
  description = "The ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_service_role_arn" {
  description = "The ARN of the ECS service role"
  value       = aws_iam_role.ecs_service.arn
}

output "ecr_push_role_arn" {
  description = "The ARN of the ECR push role"
  value       = aws_iam_role.ecr_push.arn
}

output "rds_role_arn" {
  description = "The ARN of the RDS role"
  value       = aws_iam_role.rds.arn
}

output "ecs_task_execution_role_name" {
  description = "The name of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.name
}

output "ecs_service_role_name" {
  description = "The name of the ECS service role"
  value       = aws_iam_role.ecs_service.name
}

output "ecr_push_role_name" {
  description = "The name of the ECR push role"
  value       = aws_iam_role.ecr_push.name
}

output "rds_role_name" {
  description = "The name of the RDS role"
  value       = aws_iam_role.rds.name
}
