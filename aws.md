## Load environment variables
```bash
export $(cat .env | xargs)
```

## Create ECR repositories

Connector: 

```bash
aws ecr create-repository \
  --repository-name my-chess-connector \
  --profile ${AWS_PROFILE} \
  --region ${AWS_REGION} > create-connector-repo.json
```

Ascii Chess TS:

```bash
aws ecr create-repository \
  --repository-name my-chess-asciichessts \
  --profile ${AWS_PROFILE} \
  --region ${AWS_REGION} > create-ui-repo.json
```

## Build images for AMD64 architecture

Connector:

```bash
docker buildx build \
    --platform linux/amd64 \
    --push \
    --tag ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/my-chess-connector:latest \
    -f connector/Dockerfile \
    ./connector
```

Ascii Chess TS:

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

## Push images to ECR

Connector:

```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/my-chess-connector:latest
```

Ascii Chess TS:

```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/my-chess-asciichessts:latest
```

## Create ECS cluster

```bash
aws ecs create-cluster \
  --cluster-name my-chess \
  --capacity-providers FARGATE \
  --profile ${AWS_PROFILE} \
  --region ${AWS_REGION} > create-cluster.json
```

## Create service discovery namespace

```bash
aws servicediscovery create-private-dns-namespace \
  --name chess.local \
  --vpc ${AWS_VPC_ID} \
  --profile ${AWS_PROFILE} \
  --region ${AWS_REGION} > create-namespace.json
```

## Register task definitions

Connector:

```bash
aws ecs register-task-definition \
  --cli-input-json file://connector-task-definition.json \
  --profile ${AWS_PROFILE} \
  --region ${AWS_REGION} > register-connector-task.json
```

Ascii Chess TS:

```bash
aws ecs register-task-definition \
  --cli-input-json file://asciichessts-task-definition.json \
  --profile ${AWS_PROFILE} \
  --region ${AWS_REGION} > register-ui-task.json
```

## Create ECS services

Connector:

```bash
aws ecs create-service \
  --cluster my-chess \
  --service-name connector \
  --task-definition my-chess-connector \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${AWS_SUBNET_ID_1},${AWS_SUBNET_ID_2}],securityGroups=[${AWS_SECURITY_GROUP_ID}],assignPublicIp=ENABLED}" \
  --profile ${AWS_PROFILE} \
  --region ${AWS_REGION} > create-connector-service.json
```

Ascii Chess TS:

```bash
aws ecs create-service \
  --cluster my-chess \
  --service-name asciichessts \
  --task-definition my-chess-asciichessts \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${AWS_SUBNET_ID_1},${AWS_SUBNET_ID_2}],securityGroups=[${AWS_SECURITY_GROUP_ID}],assignPublicIp=ENABLED}" \
  --profile ${AWS_PROFILE} \
  --region ${AWS_REGION} > create-ui-service.json
```

## Update ECS services

Connector:

```bash
aws ecs update-service \
    --cluster my-chess \
    --service connector \
    --force-new-deployment \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > update-connector-execute.json
```

Ascii Chess TS:

```bash
aws ecs update-service \
    --cluster my-chess \
    --service asciichessts \
    --force-new-deployment \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > update-asciichessts-execute.json
```

## Monitor deployment status

Connector:

```bash
aws ecs describe-services \
    --cluster my-chess \
    --services connector \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > describe-connector-service.json
```

Ascii Chess TS:

```bash
aws ecs describe-services \
    --cluster my-chess \
    --services asciichessts \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > describe-asciichessts-service.json
```

## Watch for new task status

Connector:

```bash
aws ecs list-tasks \
    --cluster my-chess \
    --service-name connector \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > list-connector-tasks.json
```

Ascii Chess TS:

```bash
aws ecs list-tasks \
    --cluster my-chess \
    --service-name asciichessts \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} > list-asciichessts-tasks.json
```
