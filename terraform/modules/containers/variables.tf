variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "app_security_group_id" {
  description = "ID of the application security group"
  type        = string
}

variable "db_host" {
  description = "Database host"
  type        = string
}

variable "db_port" {
  description = "Database port"
  type        = string
  default     = "5432"
}

variable "db_user" {
  description = "Database user"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "api_cpu" {
  description = "CPU units for API service"
  type        = number
  default     = 256
}

variable "api_memory" {
  description = "Memory (MiB) for API service"
  type        = number
  default     = 512
}

variable "api_desired_count" {
  description = "Number of API service instances"
  type        = number
  default     = 1
}

variable "client_cpu" {
  description = "CPU units for client service"
  type        = number
  default     = 256
}

variable "client_memory" {
  description = "Memory (MiB) for client service"
  type        = number
  default     = 512
}

variable "client_desired_count" {
  description = "Number of client service instances"
  type        = number
  default     = 1
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
}
