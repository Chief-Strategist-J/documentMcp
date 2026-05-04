# 🚀 Deployment Guide

## Overview

This guide covers deploying the Document Management SDK to various environments, including development, staging, and production. It includes Docker deployment, cloud deployment, environment configuration, monitoring, and maintenance procedures.

## 🐳 Docker Deployment

### Quick Start with Docker Compose

The easiest way to deploy the application is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/your-org/document-management-sdk.git
cd document-management-sdk

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
```

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: document_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/document_management
      - PORT=3000
      - CORS_ORIGIN=${CORS_ORIGIN}
      - API_KEY=${API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./generated-documents:/app/generated-documents
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
```

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Create directories
RUN mkdir -p /app/generated-documents
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/index.js"]
```

### Environment Configuration

Create `.env` file:

```bash
# Database Configuration
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/document_management

# API Configuration
NODE_ENV=production
PORT=3000
API_KEY=your-secure-api-key
CORS_ORIGIN=https://yourdomain.com

# Storage Configuration
STORAGE_TYPE=local
STORAGE_PATH=/app/generated-documents

# Ceph Storage (optional)
CEPH_ENDPOINT=https://your-ceph-endpoint.com
CEPH_ACCESS_KEY=your-ceph-access-key
CEPH_SECRET_KEY=your-ceph-secret-key
CEPH_BUCKET=document-management

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. ECS Deployment with Fargate

```yaml
# ecs-task-definition.json
{
  "family": "document-management-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/document-management-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "postgresql://user:pass@rds-endpoint:5432/dbname"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/document-management-api",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

#### 2. RDS Configuration

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier document-management-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password your-secure-password \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --multi-az false \
  --storage-encrypted true
```

#### 3. ECR Repository

```bash
# Create ECR repository
aws ecr create-repository --repository-name document-management-api

# Build and push image
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-west-2.amazonaws.com

docker build -t document-management-api .
docker tag document-management-api:latest your-account.dkr.ecr.us-west-2.amazonaws.com/document-management-api:latest
docker push your-account.dkr.ecr.us-west-2.amazonaws.com/document-management-api:latest
```

### Google Cloud Platform Deployment

#### 1. Cloud Run Deployment

```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/your-project/document-management-api

# Deploy to Cloud Run
gcloud run deploy document-management-api \
  --image gcr.io/your-project/document-management-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DATABASE_URL=postgresql://user:pass@cloud-sql-proxy:5432/dbname \
  --memory 1Gi \
  --cpu 1
```

#### 2. Cloud SQL Configuration

```bash
# Create Cloud SQL instance
gcloud sql instances create document-management-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --authorized-networks=0.0.0.0/0

# Create database
gcloud sql databases create document_management \
  --instance=document-management-db
```

### Azure Deployment

#### 1. Container Instances

```bash
# Create resource group
az group create --name document-management-rg --location eastus

# Create container instance
az container create \
  --resource-group document-management-rg \
  --name document-management-api \
  --image your-registry.azurecr.io/document-management-api:latest \
  --cpu 1 \
  --memory 2 \
  --ports 3000 \
  --environment-variables NODE_ENV=production DATABASE_URL=postgresql://... \
  --dns-name-label document-management-api-unique
```

## 🔧 Configuration Management

### Environment-Specific Configurations

#### Development Environment

```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/document_management_dev
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
ENABLE_METRICS=false
```

#### Staging Environment

```bash
# .env.staging
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://postgres:password@staging-db:5432/document_management_staging
CORS_ORIGIN=https://staging.yourdomain.com
LOG_LEVEL=info
ENABLE_METRICS=true
```

#### Production Environment

```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:password@prod-db:5432/document_management
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
ENABLE_METRICS=true
API_KEY=your-production-api-key
```

### Configuration Validation

```typescript
// src/config/ConfigValidator.ts
export interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  corsOrigin: string;
  apiKey?: string;
  logLevel: string;
  enableMetrics: boolean;
}

export function validateConfig(): Config {
  const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    databaseUrl: process.env.DATABASE_URL || '',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    apiKey: process.env.API_KEY,
    logLevel: process.env.LOG_LEVEL || 'info',
    enableMetrics: process.env.ENABLE_METRICS === 'true'
  };

  // Validate required fields
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  if (config.nodeEnv === 'production' && !config.apiKey) {
    throw new Error('API_KEY is required in production');
  }

  return config;
}
```

## 📊 Monitoring and Logging

### Application Monitoring

#### 1. Prometheus Metrics

```typescript
// src/metrics/MetricsCollector.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const metrics = {
  httpRequestsTotal: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  }),

  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5]
  }),

  activeConnections: new Gauge({
    name: 'active_connections',
    help: 'Number of active database connections'
  }),

  documentsGenerated: new Counter({
    name: 'documents_generated_total',
    help: 'Total number of documents generated',
    labelNames: ['format']
  })
};

// Metrics middleware
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    metrics.httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();
    metrics.httpRequestDuration
      .labels(req.method, req.route?.path || req.path)
      .observe(duration);
  });
  
  next();
}
```

#### 2. Health Checks

```typescript
// src/health/HealthChecker.ts
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
  };
}

export interface HealthCheck {
  status: 'pass' | 'fail';
  message?: string;
  duration?: number;
}

export class HealthChecker {
  constructor(private databaseManager: IDatabaseManager) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkDisk()
    ]);

    const [database, memory, disk] = checks.map(result => 
      result.status === 'fulfilled' ? result.value : { status: 'fail', message: result.reason }
    );

    const allHealthy = [database, memory, disk].every(check => check.status === 'pass');

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database,
        memory,
        disk
      }
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      await this.databaseManager.healthCheck();
      return {
        status: 'pass',
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        status: 'fail',
        message: error.message,
        duration: Date.now() - start
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    return {
      status: memoryUsagePercent < 90 ? 'pass' : 'fail',
      message: `Memory usage: ${memoryUsagePercent.toFixed(2)}%`
    };
  }

  private async checkDisk(): Promise<HealthCheck> {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const stats = fs.statSync(process.cwd());
      return {
        status: 'pass',
        message: 'Disk accessible'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Disk not accessible'
      };
    }
  }
}
```

### Structured Logging

```typescript
// src/logging/Logger.ts
import winston from 'winston';

export interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  error?: Error;
}

export class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'document-management-api',
        version: process.env.npm_package_version || '1.0.0'
      },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }
}

export const logger = new Logger();
```

## 🔒 Security Configuration

### SSL/TLS Configuration

#### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # API proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Health check
        location /health {
            proxy_pass http://api/api/health;
            access_log off;
        }
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }
}
```

### API Security

```typescript
// src/middleware/SecurityMiddleware.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
  
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    optionsSuccessStatus: 200
  }),

  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // API key validation
  (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.API_KEY;
    
    if (process.env.NODE_ENV === 'production' && apiKey !== expectedApiKey) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid API key' 
      });
    }
    
    next();
  }
];
```

## 🔄 CI/CD Pipeline

### GitHub Actions Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
    
    - name: Run linting
      run: npm run lint
    
    - name: Build
      run: npm run build

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: document-management-api
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster document-management --service api-service --force-new-deployment
```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_name ON documents(name);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_sections_document_id ON sections(document_id);
CREATE INDEX IF NOT EXISTS idx_sections_type ON sections(section_type);
CREATE INDEX IF NOT EXISTS idx_section_content_section_id ON section_content(section_id);

-- Partition large tables if needed
CREATE TABLE section_content_partitioned (
    LIKE section_content INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE section_content_2024 PARTITION OF section_content_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Caching Strategy

```typescript
// src/cache/CacheManager.ts
import Redis from 'ioredis';

export class CacheManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
}
```

## 🛠️ Maintenance Procedures

### Database Maintenance

```bash
#!/bin/bash
# scripts/maintenance.sh

# Database backup
pg_dump -h localhost -U postgres document_management > backup_$(date +%Y%m%d_%H%M%S).sql

# Vacuum and analyze
psql -h localhost -U postgres -d document_management -c "VACUUM ANALYZE;"

# Update statistics
psql -h localhost -U postgres -d document_management -c "ANALYZE;"

# Check for long-running queries
psql -h localhost -U postgres -d document_management -c "
  SELECT query, pid, now() - pg_stat_activity.query_start AS duration, state
  FROM pg_stat_activity
  WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
"
```

### Log Rotation

```bash
# /etc/logrotate.d/document-management-api
/var/log/document-management-api/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        systemctl reload document-management-api
    endscript
}
```

### Health Monitoring Script

```bash
#!/bin/bash
# scripts/health-check.sh

API_URL="http://localhost:3000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "API is healthy"
    exit 0
else
    echo "API is unhealthy (HTTP $RESPONSE)"
    # Send alert
    curl -X POST "https://hooks.slack.com/your-webhook" \
         -H 'Content-type: application/json' \
         --data "{\"text\":\"API Health Check Failed: HTTP $RESPONSE\"}"
    exit 1
fi
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Check connection logs
docker-compose logs postgres

# Test connection from API container
docker-compose exec api npm run db:test
```

#### 2. Memory Issues

```bash
# Check memory usage
docker stats

# Monitor Node.js memory
docker-compose exec api node --inspect=0.0.0.0:9229 dist/index.js
```

#### 3. Performance Issues

```bash
# Check slow queries
psql -h localhost -U postgres -d document_management -c "
  SELECT query, mean_time, calls, total_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Run with Node.js inspector
node --inspect=0.0.0.0:9229 dist/index.js

# Generate heap dump
kill -USR2 <node-process-id>
```

This deployment guide provides comprehensive information for deploying and maintaining the Document Management SDK in various environments. For additional information, see the [API Documentation](./API.md) and [Development Guide](./Development.md).
