## Load environment variables
```bash
export $(cat .env | xargs)
```

## Build image for AMD64 architecture

```bash
docker buildx build \
    --platform linux/amd64 \
    --tag ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/my-chess-connector:latest \
    -f Dockerfile .
```

## Authenticate with ECR
```bash
aws ecr get-login-password \
    --region ${AWS_REGION} \
    --profile ${AWS_PROFILE} | \
docker login \
    --username AWS \
    --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

## Push image to ECR

```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/my-chess-connector:latest
```

## Update ECS service

```bash
aws ecs update-service \
    --cluster my-chess \
    --service connector \
    --force-new-deployment \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > update-connector-execute.json
```

## Monitor deployment status

```bash
aws ecs describe-services \
    --cluster my-chess \
    --services connector \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > describe-connector-service.json
```

## Watch for new task status
```bash
aws ecs list-tasks \
    --cluster my-chess \
    --service-name connector \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > list-connector-tasks.json
```
