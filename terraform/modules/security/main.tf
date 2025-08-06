resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "Security group for Isomero application"
  vpc_id      = var.vpc_id
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-app-sg"
    }
  )

  ingress {
    description = "Allow HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow API access from app"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "Security group for Isomero database"
  vpc_id      = var.vpc_id
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-db-sg"
    }
  )

  ingress {
    description = "Allow database access from app"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    description = "Allow database to access VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }
}
