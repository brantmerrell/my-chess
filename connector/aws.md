## Authenticate with ECR
```bash
aws ecr get-login-password \
    --region ${AWS_REGION} \
    --profile ${AWS_PROFILE} | \
docker login \
    --username AWS \
    --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

## Build image for AMD64 architecture and push

```bash
docker buildx build \
    --platform linux/amd64 \
    --push \
    --tag ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/my-chess-connector:latest \
    -f Dockerfile .
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

