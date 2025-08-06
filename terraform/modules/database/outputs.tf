output "db_endpoint" {
  description = "The endpoint of the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "db_password" {
  description = "The password for the RDS instance"
  value       = aws_secretsmanager_secret_version.db_password.secret_string
  sensitive   = true
}

output "db_username" {
  description = "The username for the RDS instance"
  value       = aws_db_instance.main.username
}

output "db_name" {
  description = "The name of the RDS database"
  value       = aws_db_instance.main.name
}

output "db_subnet_group_name" {
  description = "The name of the DB subnet group"
  value       = aws_db_subnet_group.main.name
}

output "db_security_group_id" {
  description = "The ID of the DB security group"
  value       = var.db_security_group_id
}
