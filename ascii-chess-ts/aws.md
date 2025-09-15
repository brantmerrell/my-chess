# AWS Cleanup Guide

## Status: ECS Services Stopped ✅
All ECS services have been scaled down to 0 replicas (no more compute charges).

## Immediate Actions (Safe to do now)

### 1. Delete ECR Repositories
These container registries are no longer needed:

```bash
aws ecr delete-repository --repository-name my-chess-connector --force --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

```bash
aws ecr delete-repository --repository-name my-chess-asciichessts --force --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

### 2. Check DNS Propagation
Verify the DNS change is working:

```bash
dig chess.jbm.eco +short
```

Expected result: Should show GitHub Pages IPs (185.199.108.x)

```bash
nslookup chess.jbm.eco
```

## Wait Period Actions (Do after DNS propagates)

### 3. Delete ECS Services (Wait 24 hours)
**Important**: Wait for all tasks to fully stop before deleting services.

Check if tasks are stopped:
```bash
aws ecs list-tasks --cluster my-chess --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

If no tasks running, delete services:
```bash
aws ecs delete-service --cluster my-chess --service asciichessts --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

```bash
aws ecs delete-service --cluster my-chess --service connector --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

```bash
aws ecs delete-service --cluster my-chess --service chess-ui-direct --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

```bash
aws ecs delete-service --cluster my-chess --service chess-api-direct --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

```bash
aws ecs delete-service --cluster my-chess --service my-chess-prototype-shiny --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

### 4. Delete ECS Cluster
After all services are deleted:
```bash
aws ecs delete-cluster --cluster my-chess --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

## CloudFront Cleanup (Wait 48 hours)

**Critical**: Do NOT delete CloudFront distributions until DNS has fully propagated globally.

### Chess-related distributions to eventually delete:
- `E2H24NSI4X5H1A` - Chess UI Distribution (chess.jbm.eco)
- `E37WDMIUYYS2NM` - Chess API Distribution
- `E1CSXH9LLBKZTJ` - ALB origin (check if chess-related)

### Keep this distribution:
- `E1G3I66AL1W4R5` - jbm.eco static site (main site)

### Steps to delete CloudFront distributions:

1. **Disable distributions first**:
```bash
aws cloudfront get-distribution-config --id E2H24NSI4X5H1A --profile ${AWS_PROFILE:-default}
```
Edit the returned JSON to set `"Enabled": false`, then update it.

2. **Wait for deployment to complete** (15-20 minutes)

3. **Delete the distribution**:
```bash
aws cloudfront delete-distribution --id E2H24NSI4X5H1A --if-match [ETAG] --profile ${AWS_PROFILE:-default}
```

## S3 Bucket Cleanup (Optional)

### Buckets to keep:
- `jbm.eco` - Main domain assets
- `jbmbucket` - General purpose bucket

### Safe to delete (if not using these services):
- `cdk-hnb659fds-assets-*` - CDK deployment assets
- `cdktempstack-*` - CDK temporary stack
- `elasticbeanstalk-*` - Elastic Beanstalk assets

**Check bucket contents before deleting!**

```bash
aws s3 ls s3://bucket-name --profile ${AWS_PROFILE:-default}
```

If empty or contains only deployment artifacts:
```bash
aws s3 rb s3://bucket-name --force --profile ${AWS_PROFILE:-default}
```

## Verification Commands

### Check ECS cleanup:
```bash
aws ecs describe-clusters --clusters my-chess --profile ${AWS_PROFILE:-default} --region ${AWS_REGION:-us-west-2}
```

### Check DNS:
```bash
dig chess.jbm.eco
curl -I https://chess.jbm.eco
```

### Check CloudFront:
```bash
aws cloudfront list-distributions --profile ${AWS_PROFILE:-default} --query 'DistributionList.Items[].{Id:Id,Comment:Comment,Enabled:Enabled}'
```

## Cost Savings Summary
- **ECS services**: ~$20-50/month saved
- **ECR repositories**: ~$0.10/GB/month saved
- **CloudFront distributions**: ~$0.085/month per distribution saved
- **Unused S3 buckets**: ~$0.023/GB/month saved

## Timeline
- **Now**: ECS stopped, ECR can be deleted
- **24 hours**: DNS propagated, can delete ECS services/cluster
- **48 hours**: Safe to delete CloudFront distributions
- **Anytime**: Clean up unused S3 buckets