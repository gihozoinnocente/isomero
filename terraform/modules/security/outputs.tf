output "app_security_group_id" {
  description = "The ID of the application security group"
  value       = aws_security_group.app.id
}

output "db_security_group_id" {
  description = "The ID of the database security group"
  value       = aws_security_group.db.id
}

output "app_security_group_name" {
  description = "The name of the application security group"
  value       = aws_security_group.app.name
}

output "db_security_group_name" {
  description = "The name of the database security group"
  value       = aws_security_group.db.name
}
