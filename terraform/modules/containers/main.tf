resource "aws_ecr_repository" "api" {
  name = "${var.project_name}-api"
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-api"
    }
  )

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecr_repository" "client" {
  name = "${var.project_name}-client"
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-client"
    }
  )

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecs_cluster" "main" {
  name = var.project_name
  tags = merge(
    var.common_tags,
    {
      Name = var.project_name
    }
  )
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name  = "api"
      image = "${aws_ecr_repository.api.repository_url}:latest"
      cpu   = var.api_cpu
      memory = var.api_memory
      portMappings = [
        {
          containerPort = 5000
          hostPort      = 5000
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DB_HOST"
          value = aws_db_instance.main.address
        },
        {
          name  = "DB_PORT"
          value = "5432"
        },
        {
          name  = "DB_USER"
          value = aws_db_instance.main.username
        },
        {
          name  = "DB_PASSWORD"
          value = aws_secretsmanager_secret_version.db_password.secret_string
        },
        {
          name  = "DB_NAME"
          value = aws_db_instance.main.name
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${var.project_name}-api-logs"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "api"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "client" {
  family                   = "${var.project_name}-client"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.client_cpu
  memory                   = var.client_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name  = "client"
      image = "${aws_ecr_repository.client.repository_url}:latest"
      cpu   = var.client_cpu
      memory = var.client_memory
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${var.project_name}-client-logs"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "client"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [var.app_security_group_id]
    subnets          = var.public_subnet_ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 5000
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_ecs_service" "client" {
  name            = "${var.project_name}-client"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.client.arn
  desired_count   = var.client_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [var.app_security_group_id]
    subnets          = var.public_subnet_ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.client.arn
    container_name   = "client"
    container_port   = 80
  }

  lifecycle {
    create_before_destroy = true
  }
}
