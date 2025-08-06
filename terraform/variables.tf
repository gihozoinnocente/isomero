  type        = string  1z
variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "The CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "db_instance_class" {
  description = "The RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "The allocated storage for the RDS instance"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "The name of the RDS database"
  type        = string
  default     = "isomero_db"
}

variable "db_username" {
  description = "The RDS database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "The RDS database password"
  type        = string
  sensitive   = true
  default     = "postgres123"
}
