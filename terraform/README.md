# Isomero Infrastructure as Code

This directory contains the Terraform configuration for deploying the Isomero application to AWS. The infrastructure is designed to be modular and reusable, following AWS best practices for security and scalability.

## Architecture Overview

The infrastructure is organized into several interconnected modules:

1. **Network Module**
   - VPC with public and private subnets
   - NAT Gateway for private subnet access
   - Internet Gateway
   - Route Tables and Associations

2. **Security Module**
   - Security Groups for application and database
   - Network ACLs
   - Security group rules for HTTP, HTTPS, and database access

3. **Database Module**
   - RDS PostgreSQL instance
   - Database subnet group
   - Database security group
   - Secrets Manager integration for database credentials

4. **Containers Module**
   - ECR repositories for API and client
   - ECS cluster
   - ECS task definitions for both services
   - ECS services with desired count and scaling
   - CloudWatch logging configuration

5. **Load Balancer Module**
   - Application Load Balancer
   - Target groups for API and client
   - Health checks
   - Path-based routing for API endpoints

6. **IAM Module**
   - IAM roles and policies for ECS, ECR, and RDS
   - Proper permissions for container deployment and database access

## Prerequisites

Before using this Terraform configuration, ensure you have:

1. AWS CLI configured with appropriate credentials
2. Terraform installed (version >= 0.14)
3. AWS provider configured in your Terraform configuration

## Usage

1. Initialize Terraform:
```bash
terraform init
```

2. Review the planned changes:
```bash
terraform plan
```

3. Apply the configuration:
```bash
terraform apply
```

## Environment Variables

The following environment variables are used:

```bash
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_DEFAULT_REGION
```

## Security Considerations

1. All sensitive data (like database passwords) is stored in AWS Secrets Manager
2. Private subnets are used for sensitive services
3. Security groups follow least privilege principle
4. No hard-coded credentials in the configuration
5. All resources are tagged for better organization and cost tracking

## Cost Considerations

1. The configuration uses cost-effective instance types:
   - RDS: db.t3.micro
   - ECS: Fargate (serverless)
   - ECR: Pay-per-use

2. Resources are properly tagged for cost allocation

## Monitoring and Logging

1. CloudWatch logs are configured for both services
2. Health checks are implemented for both services
3. Load balancer metrics are available in CloudWatch

## Module Dependencies

The modules depend on each other in the following order:

1. Network → Security → IAM → Database → Containers → Load Balancer

## Resource Outputs

The root module exports several important outputs:

- `load_balancer_dns_name`: The DNS name of the Application Load Balancer
- `database_endpoint`: The endpoint of the RDS instance
- `ecr_api_repository_url`: The URL for the API ECR repository
- `ecr_client_repository_url`: The URL for the client ECR repository

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

## Infrastructure Components

- **Networking**
  - VPC with CIDR 10.0.0.0/16
  - Public subnet in us-east-1a
  - Security groups for application access

- **Database**
  - PostgreSQL RDS instance (db.t3.micro)
  - 20GB storage
  - Secure access through security groups

- **Container Registry**
  - ECR repository for Docker images
  - Automatic image scanning enabled

- **Container Orchestration**
  - ECS cluster using Fargate
  - Load balanced service with 2 instances
  - Health checks and auto-scaling

- **Load Balancing**
  - Application Load Balancer
  - Target group for ECS service
  - Health check configuration

## Security Notes

- All resources are tagged for better organization and cost tracking
- Security groups are configured with minimal necessary access
- Database credentials are stored securely in Terraform variables
- Container images are scanned for vulnerabilities
- ECS tasks run in Fargate for better isolation

## Environment Variables

The following environment variables can be configured:

- `AWS_REGION`: AWS region to deploy resources (default: us-east-1)
- `VPC_CIDR`: CIDR block for VPC (default: 10.0.0.0/16)
- `PUBLIC_SUBNET_CIDR`: CIDR block for public subnet (default: 10.0.1.0/24)
- `DB_INSTANCE_CLASS`: RDS instance class (default: db.t3.micro)
- `DB_ALLOCATED_STORAGE`: RDS storage in GB (default: 20)
- `DB_NAME`: Database name (default: isomero_db)
- `DB_USERNAME`: Database username (default: postgres)
- `DB_PASSWORD`: Database password (default: postgres123)
