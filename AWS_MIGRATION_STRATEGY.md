# AWS Infrastructure Migration Strategy

## Current State: MIGRATING FROM LEGACY TO MODERN

This document defines the infrastructure migration in progress. When consulting this project, treat this as the source of truth for architectural decisions.

## 🚫 LEGACY COMPONENTS (TO BE REMOVED)
These components exist but should NOT be enhanced or replicated:

### ECS/Fargate Setup
- **Cluster**: `my-chess` 
- **Services**: `connector`, `asciichessts`
- **Network**: Complex VPC with Subnet 1 & 2 configuration
- **Files**: 
  - `ecs-params.yml` - LEGACY
  - `ecs.docker-compose.yml` - LEGACY
  - `aws.md` - LEGACY deployment instructions
- **Load Balancer**: `chess-lb-689103240.us-west-2.elb.amazonaws.com`
- **Target Groups**: Multiple complex target groups
- **Status**: Running but overengineered. Keep alive during migration only.

### Why Legacy Architecture Is Bad:
- Unnecessary VPC complexity for public services
- Idle ECS tasks costing money even with no traffic
- Complex subnet configuration adds fragility
- No actual need for private networking

## ✅ TARGET ARCHITECTURE (BUILD THIS)

### Modern Serverless Architecture
Simple, scalable, pay-per-use architecture:

### Frontend
- **Hosting**: S3 static website
- **CDN**: CloudFront distribution
- **Tech**: React (existing `ascii-chess-ts/` codebase)
- **URL**: Will be `chess.domain.com` or CloudFront URL

### Backend API
- **Compute**: AWS Lambda functions
- **API**: API Gateway REST/HTTP API
- **Language**: Python (existing `connector/` codebase)
- **URL**: Will be `api.chess.domain.com` or API Gateway URL

### Future Additions (As Needed)
- **Database**: DynamoDB (no VPC) or RDS (minimal VPC)
- **Auth**: Cognito or Lambda + Secrets Manager for Lichess OAuth
- **WebSockets**: API Gateway WebSocket API if needed
- **Container Fallback**: Can run containers in Lambda if needed

## 📁 FILE STRUCTURE INTERPRETATION

### Active Development Directories
- `ascii-chess-ts/` - Frontend React application ✅ KEEP
- `connector/` - Backend Python API ✅ KEEP
- `prototype-shiny/` - R Shiny prototype (reference only)

### New Infrastructure Files (TO BE CREATED)
- `infrastructure/serverless/` - New CloudFormation/CDK templates
- `deploy-static.sh` - S3/CloudFront deployment script
- `deploy-lambda.sh` - Lambda deployment script
- `.env.serverless` - New simplified environment variables

### Migration Status Tracker
```yaml
legacy_systems:
  ecs_cluster: RUNNING - DO NOT ENHANCE
  load_balancer: RUNNING - DO NOT ENHANCE
  
new_systems:
  s3_frontend: NOT_STARTED
  cloudfront: NOT_STARTED
  api_gateway: NOT_STARTED
  lambda_functions: NOT_STARTED

migration_phase: PLANNING
```

## 📋 MIGRATION CHECKLIST

### Phase 1: Setup New Frontend Infrastructure
- [ ] Create S3 bucket for static hosting
- [ ] Configure S3 bucket policy for public access
- [ ] Build production version of ascii-chess-ts
- [ ] Upload built files to S3
- [ ] Create CloudFront distribution
- [ ] Test frontend via CloudFront URL
- [ ] Configure custom domain (optional)

### Phase 2: Setup New Backend Infrastructure  
- [ ] Create API Gateway (REST or HTTP API)
- [ ] Create first Lambda function from connector code
- [ ] Configure Lambda environment variables
- [ ] Set up API Gateway routes to Lambda
- [ ] Test API endpoints
- [ ] Configure CORS for frontend access
- [ ] Migrate all connector endpoints to Lambda

### Phase 3: Integration Testing
- [ ] Update frontend to use new API Gateway URL
- [ ] Test all frontend features with new backend
- [ ] Performance testing (compare with ECS)
- [ ] Set up CloudWatch monitoring
- [ ] Document any issues or limitations

### Phase 4: Data & State Migration
- [ ] Identify stateful components (if any)
- [ ] Choose database solution (DynamoDB/RDS)
- [ ] Migrate any persistent data
- [ ] Set up backup strategy

### Phase 5: Production Cutover
- [ ] Run both systems in parallel for 1 week
- [ ] Monitor error rates and performance
- [ ] Update DNS to point to new infrastructure
- [ ] Monitor for 24 hours post-cutover
- [ ] Create rollback procedure documentation

### Phase 6: Cleanup Legacy Infrastructure
- [ ] Confirm new system stable for 2 weeks
- [ ] Stop ECS tasks
- [ ] Delete ECS services
- [ ] Delete ECS cluster
- [ ] Delete unused target groups
- [ ] Delete unused load balancer
- [ ] Delete ECR images (keep as backup?)
- [ ] Archive legacy configuration files

### Future Enhancements (Post-Migration)
- [ ] Add Lichess OAuth integration
- [ ] Implement user authentication (Cognito)
- [ ] Add WebSocket support for real-time games
- [ ] Set up CI/CD pipeline
- [ ] Implement auto-scaling policies

## 🎯 ARCHITECTURE PRINCIPLES

1. **Default to Serverless**: Lambda > ECS unless proven otherwise
2. **No Unnecessary VPCs**: Use managed services that don't require VPC
3. **Pay Per Use**: Avoid idle resources
4. **Simple First**: Add complexity only when required
5. **Public by Design**: Both frontend and API are public-facing

## ⚠️ IMPORTANT REMINDERS

- **DO NOT** add features to ECS infrastructure
- **DO NOT** create new VPC configurations
- **DO NOT** assume existing architecture is correct
- **DO** question any request to enhance legacy components
- **DO** propose serverless alternatives for new features

## 🔄 MIGRATION COMMANDS REFERENCE

### Check Legacy System Status
```bash
aws ecs describe-services --cluster my-chess --services connector asciichessts
```

### Deploy New Frontend (FUTURE)
```bash
aws s3 sync ./ascii-chess-ts/build s3://chess-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

### Deploy New Backend (FUTURE)
```bash
cd connector && zip -r function.zip . 
aws lambda update-function-code --function-name chess-api --zip-file fileb://function.zip
```

---

**Document Purpose**: Ensure any AI assistant or developer understands that the complex ECS/VPC infrastructure is LEGACY and should be replaced with simple serverless architecture. This is not a refactor—it's a migration to a fundamentally different and better approach.

**Last Updated**: 2025-09-06
**Migration Status**: Planning Phase