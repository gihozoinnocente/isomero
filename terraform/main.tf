terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "isomero-vpc"
  }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = {
    Name = "isomero-public-subnet"
  }
}

# Security Group for Application
resource "aws_security_group" "app" {
  name        = "isomero-app-sg"
  description = "Allow HTTP and HTTPS access"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS Database
resource "aws_db_instance" "postgres" {
  identifier            = "isomero-db"
  engine               = "postgres"
  engine_version       = "14.5"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  name                 = "isomero_db"
  username             = "postgres"
  password             = "postgres123"
  skip_final_snapshot  = true
  vpc_security_group_ids = [aws_security_group.app.id]
  subnet_id            = aws_subnet.public.id

  tags = {
    Name = "isomero-db"
  }
}

# ECR Repository
resource "aws_ecr_repository" "isomero" {
  name                 = "isomero"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "isomero-ecr"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "isomero-cluster"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "isomero" {
  family                   = "isomero-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512

  execution_role_arn = aws_iam_role.ecs_task_execution.arn
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

# ECS Service
resource "aws_ecs_service" "isomero" {
  name            = "isomero-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.isomero.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.app.id]
    subnets         = [aws_subnet.public.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.isomero.arn
    container_name   = "isomero-api"
    container_port   = 5000
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution" {
  name = "isomero-ecs-task-execution-role"

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

# Load Balancer
resource "aws_lb" "isomero" {
  name               = "isomero-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.app.id]
  subnets           = [aws_subnet.public.id]
}

# Target Group
resource "aws_lb_target_group" "isomero" {
  name     = "isomero-tg"
  port     = 5000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = 5
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Listener
resource "aws_lb_listener" "isomero" {
  load_balancer_arn = aws_lb.isomero.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.isomero.arn
  }
}
