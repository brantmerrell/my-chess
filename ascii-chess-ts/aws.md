## Load environment variables
```bash
export $(cat ../.env | xargs)
```

## Build image for AMD64 architecture

```bash
docker buildx build \
    --platform linux/amd64 \
    --push \
    --tag ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/my-chess-asciichessts:latest \
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
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/my-chess-asciichessts:latest
```

## Update ECS service

```bash
aws ecs update-service \
    --cluster my-chess \
    --service asciichessts \
    --force-new-deployment \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > update-asciichessts-execute.json
```

## Monitor deployment status

```bash
aws ecs describe-services \
    --cluster my-chess \
    --services asciichessts \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > describe-asciichessts-service.json
```

## Watch for new task status
```bash
aws ecs list-tasks \
    --cluster my-chess \
    --service-name asciichessts \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > list-asciichessts-tasks.json
```

