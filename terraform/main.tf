terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Root module variables
variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "isomero"
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_engine_version" {
  description = "The engine version for the RDS instance"
  type        = string
  default     = "14.5"
}

variable "db_instance_class" {
  description = "The instance class for the RDS instance"
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
  description = "The username for the RDS database"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "The password for the RDS database"
  type        = string
  default     = "postgres123"
}

# Common tags
locals {
  common_tags = {
    Project = local.project_name
    Environment = "dev"
  }
  app_ingress_rules = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow HTTP access"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow HTTPS access"
    }
  ]
  task_definition = {
    container_definitions = jsonencode([
      {
        name  = "isomero-api"
        image = "${aws_ecr_repository.isomero.repository_url}:latest"
        portMappings = [
          {
            containerPort = 5000
            hostPort      = 5000
          }
        ]
        environment = [
          {
            name  = "DB_HOST"
            value = aws_db_instance.postgres.endpoint
          },
          {
            name  = "DB_PORT"
            value = aws_db_instance.postgres.port
          },
          {
            name  = "DB_USER"
            value = aws_db_instance.postgres.username
          },
          {
            name  = "DB_PASSWORD"
            value = aws_db_instance.postgres.password
          },
          {
            name  = "DB_NAME"
            value = aws_db_instance.postgres.name
          }
        ]
      }
    ])
  }
}

# Network Resources
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-vpc"
    }
  )
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidr
  availability_zone = "${var.aws_region}a"
  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-public-subnet"
    }
  )
}

# Security Resources
resource "aws_security_group" "app" {
  name        = "${local.project_name}-app-sg"
  description = "Security group for Isomero application"
  vpc_id      = aws_vpc.main.id

  dynamic "ingress" {
    for_each = local.app_ingress_rules
    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
      description = ingress.value.description
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-app-sg"
    }
  )
}

# Database Resources
resource "aws_db_instance" "postgres" {
  identifier            = "${local.project_name}-db"
  engine               = "postgres"
  engine_version       = "14.5"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_allocated_storage
  name                 = var.db_name
  username             = var.db_username
  password             = var.db_password
  skip_final_snapshot  = true
  vpc_security_group_ids = [aws_security_group.app.id]
  subnet_id            = aws_subnet.public.id

  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-db"
    }
  )
}

# Container Registry
resource "aws_ecr_repository" "isomero" {
  name                 = local.project_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-ecr"
    }
  )
}

# ECS Resources
resource "aws_ecs_cluster" "main" {
  name = "${local.project_name}-cluster"

  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-cluster"
    }
  )
}

resource "aws_ecs_task_definition" "isomero" {
  family                   = "${local.project_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_execution.arn

  container_definitions = local.task_definition.container_definitions

  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-task"
    }
  )
}

resource "aws_ecs_service" "isomero" {
  name            = "${local.project_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.isomero.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.app.id]
    subnets          = [aws_subnet.public.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.isomero.arn
    container_name   = "isomero-api"
    container_port   = 5000
  }

  depends_on = [
    aws_lb_listener.isomero
  ]

  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-service"
    }
  )
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution" {
  name = "${local.project_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Role Policy for ECS Task Execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Load Balancer Resources
resource "aws_lb" "isomero" {
  name               = "${local.project_name}-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.app.id]
  subnets           = [aws_subnet.public.id]

  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-lb"
    }
  )
}

resource "aws_lb_target_group" "isomero" {
  name     = "${local.project_name}-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200-299"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-tg"
    }
  )
}

resource "aws_lb_listener" "isomero" {
  load_balancer_arn = aws_lb.isomero.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.isomero.arn
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.project_name}-listener"
    }
  )
}
