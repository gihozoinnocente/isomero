locals {
  # Project Configuration
  environment = "production"
  project_name = var.project_name

  # AWS Configuration
  region = var.aws_region

  # Network Configuration
  vpc_cidr = var.vpc_cidr
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"]

  # Security Configuration
  common_tags = {
    Environment = local.environment
    Project     = local.project_name
    ManagedBy   = "terraform"
  }

  # Database Configuration
  db_engine_version = var.db_engine_version
  db_instance_class = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_name = var.db_name
  db_username = var.db_username

  # ECS Configuration
  api_cpu = 256
  api_memory = 512
  api_desired_count = 1
  client_cpu = 256
  client_memory = 512
  client_desired_count = 1

  # Logging Configuration
  log_group_prefix = "${local.project_name}-"
  api_log_group = "${local.log_group_prefix}api-logs"
  client_log_group = "${local.log_group_prefix}client-logs"

  # Security Group Rules
  app_ingress_rules = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow HTTP"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow HTTPS"
    }
  ]

  # Health Check Configuration
  health_check = {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200-299"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  # ECS Task Definition
  task_definition = {
    container_definitions = jsonencode([
      {
        name      = "isomero-api"
        image     = "${var.ecr_repository_url}:latest"
        memory    = local.api_memory
        cpu       = local.api_cpu
        essential = true
        portMappings = [
          {
            containerPort = 5000
            hostPort     = 5000
          }
        ]
        environment = [
          {
            name  = "NODE_ENV"
            value = "production"
          },
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
            value = aws_db_instance.postgres.db_name
          }
        ]
      }
    ])
  }
}
