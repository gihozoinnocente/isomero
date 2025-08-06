resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-db-subnet-group"
  subnet_ids  = var.private_subnet_ids
  description = "Subnet group for Isomero database"
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-db-subnet-group"
    }
  )
}

resource "aws_secretsmanager_secret" "db_password" {
  name = "${var.project_name}-db-password"
  description = "Database password for Isomero"
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-db-password"
    }
  )
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

resource "aws_db_instance" "main" {
  identifier              = "${var.project_name}-db"
  engine                  = "postgres"
  engine_version          = var.db_engine_version
  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  storage_type            = "gp2"
  name                    = var.db_name
  username                = var.db_username
  password                = aws_secretsmanager_secret_version.db_password.secret_string
  skip_final_snapshot     = true
  vpc_security_group_ids  = [var.db_security_group_id]
  db_subnet_group_name    = aws_db_subnet_group.main.name
  publicly_accessible     = false
  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-db"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}
