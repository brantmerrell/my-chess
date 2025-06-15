#!/bin/bash

PROFILE="jbm1"
REGION="us-west-2"

if ! aws sts get-caller-identity --profile $PROFILE >/dev/null 2>&1; then
    echo "Please configure AWS CLI profile $PROFILE first"
    exit 1
fi

output_dir="aws_inventory_$(date +%Y%m%d)"
mkdir -p "${output_dir}"

echo "🔍 Starting AWS inventory collection..."

# Basic resources first
echo "📦 Collecting basic AWS resources..."

aws ec2 describe-instances \
    --profile $PROFILE --region $REGION \
    --query 'Reservations[].Instances[].{InstanceId:InstanceId,Name:Tags[?Key==`Name`].Value|[0],Type:InstanceType,State:State.Name,Zone:Placement.AvailabilityZone,VpcId:VpcId}' \
    --output json > "${output_dir}/ec2_instances.json" 2>/dev/null || echo "{}" > "${output_dir}/ec2_instances.json"

aws lambda list-functions \
    --profile $PROFILE --region $REGION \
    --query 'Functions[].{Name:FunctionName,Runtime:Runtime,Memory:MemorySize,Timeout:Timeout,State:State}' \
    --output json > "${output_dir}/lambda_functions.json" 2>/dev/null || echo "[]" > "${output_dir}/lambda_functions.json"

aws s3api list-buckets \
    --profile $PROFILE \
    --query 'Buckets[].{Name:Name,CreationDate:CreationDate}' \
    --output json > "${output_dir}/s3_buckets.json" 2>/dev/null || echo "[]" > "${output_dir}/s3_buckets.json"

aws rds describe-db-instances \
    --profile $PROFILE --region $REGION \
    --query 'DBInstances[].{DBName:DBInstanceIdentifier,Engine:Engine,Version:EngineVersion,Size:DBInstanceClass,Storage:AllocatedStorage}' \
    --output json > "${output_dir}/rds_instances.json" 2>/dev/null || echo "[]" > "${output_dir}/rds_instances.json"

aws apigateway get-rest-apis \
    --profile $PROFILE --region $REGION \
    --query 'items[].{Name:name,ID:id,Description:description,Version:version}' \
    --output json > "${output_dir}/api_gateways.json" 2>/dev/null || echo "[]" > "${output_dir}/api_gateways.json"

aws dynamodb list-tables \
    --profile $PROFILE --region $REGION \
    --query 'TableNames[]' \
    --output json > "${output_dir}/dynamodb_tables.json" 2>/dev/null || echo "[]" > "${output_dir}/dynamodb_tables.json"

aws sns list-topics \
    --profile $PROFILE --region $REGION \
    --query 'Topics[].TopicArn' \
    --output json > "${output_dir}/sns_topics.json" 2>/dev/null || echo "[]" > "${output_dir}/sns_topics.json"

aws sqs list-queues \
    --profile $PROFILE --region $REGION \
    --query 'QueueUrls[]' \
    --output json > "${output_dir}/sqs_queues.json" 2>/dev/null || echo "[]" > "${output_dir}/sqs_queues.json"

aws ecr describe-repositories \
    --profile $PROFILE --region $REGION \
    --query 'repositories[].{Name:repositoryName,URI:repositoryUri}' \
    --output json > "${output_dir}/ecr_repositories.json" 2>/dev/null || echo "[]" > "${output_dir}/ecr_repositories.json"

aws ec2 describe-security-groups \
    --profile $PROFILE --region $REGION \
    --output json > "${output_dir}/security_groups.json" 2>/dev/null || echo "{}" > "${output_dir}/security_groups.json"

# ECR Images
echo "🐳 Collecting ECR images..."
if [ -f "${output_dir}/ecr_repositories.json" ]; then
    for repo in $(cat "${output_dir}/ecr_repositories.json" | jq -r '.[].Name' 2>/dev/null); do
        if [ "$repo" != "null" ] && [ ! -z "$repo" ]; then
            echo "  📷 Getting images for repository: $repo"
            aws ecr describe-images --profile $PROFILE --region $REGION --repository-name "$repo" \
                --query 'imageDetails[*].{registryId:registryId,repositoryName:repositoryName,imageDigest:imageDigest,imageTags:imageTags,imageSizeInBytes:imageSizeInBytes,imagePushedAt:imagePushedAt,imageManifestMediaType:imageManifestMediaType,artifactMediaType:artifactMediaType,lastRecordedPullTime:lastRecordedPullTime}' \
                --output json > "${output_dir}/ecr_images_${repo}.json" 2>/dev/null || echo "[]" > "${output_dir}/ecr_images_${repo}.json"
        fi
    done
fi

# ECS Resources
echo "🚢 Collecting ECS resources..."
aws ecs list-clusters --profile $PROFILE --region $REGION --output json > "${output_dir}/ecs_clusters.json" 2>/dev/null || echo "{}" > "${output_dir}/ecs_clusters.json"

# Check what clusters we found
if [ -f "${output_dir}/ecs_clusters.json" ]; then
    clusters=$(cat "${output_dir}/ecs_clusters.json" | jq -r '.clusterArns[]?' 2>/dev/null)
    if [ ! -z "$clusters" ]; then
        for cluster_arn in $clusters; do
            cluster_name=$(basename "$cluster_arn")
            echo "  🎯 Processing cluster: $cluster_name"
            
            # List services
            aws ecs list-services --profile $PROFILE --region $REGION --cluster "$cluster_arn" \
                --query 'serviceArns[]' \
                --output json > "${output_dir}/ecs_services_${cluster_name}.json" 2>/dev/null || echo "[]" > "${output_dir}/ecs_services_${cluster_name}.json"
            
            # List tasks for this cluster
            echo "    📋 Getting tasks for cluster $cluster_name..."
            aws ecs list-tasks --profile $PROFILE --region $REGION --cluster "$cluster_arn" \
                --output json > "${output_dir}/ecs_tasks_${cluster_name}.json" 2>/dev/null || echo "[]" > "${output_dir}/ecs_tasks_${cluster_name}.json"
            
            # Get detailed task information
            if [ -f "${output_dir}/ecs_tasks_${cluster_name}.json" ]; then
                task_arns=$(cat "${output_dir}/ecs_tasks_${cluster_name}.json" | jq -r '.taskArns[]?' 2>/dev/null)
                for task_arn in $task_arns; do
                    if [ ! -z "$task_arn" ] && [ "$task_arn" != "null" ]; then
                        task_id=$(basename "$task_arn")
                        echo "      🔍 Getting details for task: $task_id"
                        aws ecs describe-tasks --profile $PROFILE --region $REGION --cluster "$cluster_arn" --tasks "$task_arn" \
                            --output json > "${output_dir}/ecs_task_${task_id}.json" 2>/dev/null
                    fi
                done
            fi
            
            # Process services
            if [ -f "${output_dir}/ecs_services_${cluster_name}.json" ]; then
                service_arns=$(cat "${output_dir}/ecs_services_${cluster_name}.json" | jq -r '.[]?' 2>/dev/null)
                for service_arn in $service_arns; do
                    if [ ! -z "$service_arn" ] && [ "$service_arn" != "null" ]; then
                        service_name=$(basename "$service_arn")
                        echo "    🔧 Processing service: $service_name"
                        
                        # Service details
                        aws ecs describe-services --profile $PROFILE --region $REGION --cluster "$cluster_arn" --services "$service_arn" \
                            --query 'services[*].{status:status,taskDef:taskDefinition,desiredCount:desiredCount,runningCount:runningCount,networkConfig:networkConfiguration,loadBalancers:loadBalancers}' \
                            --output json > "${output_dir}/ecs_service_${cluster_name}_${service_name}.json" 2>/dev/null
                        
                        # Task definition details
                        if [ -f "${output_dir}/ecs_service_${cluster_name}_${service_name}.json" ]; then
                            task_def=$(cat "${output_dir}/ecs_service_${cluster_name}_${service_name}.json" | jq -r '.[0].taskDef?' 2>/dev/null)
                            if [ ! -z "$task_def" ] && [ "$task_def" != "null" ]; then
                                aws ecs describe-task-definition --profile $PROFILE --region $REGION --task-definition "$task_def" \
                                    --query 'taskDefinition.{family:family,containers:containerDefinitions[*].{name:name,image:image,portMappings:portMappings,environment:environment,healthCheck:healthCheck}}' \
                                    --output json > "${output_dir}/ecs_taskdef_${cluster_name}_${service_name}.json" 2>/dev/null
                            fi
                        fi
                        
                        # CloudWatch Logs
                        log_group="/ecs/${service_name}"
                        echo "      📊 Checking logs for: $log_group"
                        aws logs describe-log-groups --profile $PROFILE --region $REGION --log-group-name-prefix "$log_group" --query "logGroups[?logGroupName=='$log_group']" --output text > /tmp/log_check 2>/dev/null
                        if [ -s /tmp/log_check ]; then
                            aws logs describe-log-streams --profile $PROFILE --region $REGION --log-group-name "$log_group" \
                                --order-by LastEventTime --descending --max-items 5 \
                                --output json > "${output_dir}/logs_streams_${service_name}.json" 2>/dev/null || echo "{}" > "${output_dir}/logs_streams_${service_name}.json"
                            
                            # Get recent log events
                            if [ -f "${output_dir}/logs_streams_${service_name}.json" ]; then
                                streams=$(cat "${output_dir}/logs_streams_${service_name}.json" | jq -r '.logStreams[]?.logStreamName' 2>/dev/null | head -2)
                                for stream in $streams; do
                                    if [ ! -z "$stream" ] && [ "$stream" != "null" ]; then
                                        stream_file="${output_dir}/logs_events_${service_name}_${stream##*/}.json"
                                        aws logs get-log-events --profile $PROFILE --region $REGION --log-group-name "$log_group" \
                                            --log-stream-name "$stream" --limit 50 \
                                            --output json > "$stream_file" 2>/dev/null || echo "{}" > "$stream_file"
                                    fi
                                done
                            fi
                        else
                            echo "{}" > "${output_dir}/logs_streams_${service_name}.json"
                            echo "{}" > "${output_dir}/logs_events_${service_name}_None.json"
                        fi
                    fi
                done
            fi
        done
    else
        echo "  ⚠️  No ECS clusters found"
    fi
fi

# Create a consolidated ecs_tasks.json for backward compatibility
echo "[]" > "${output_dir}/ecs_tasks.json"

# Load Balancers
echo "⚖️  Collecting Load Balancer information..."
aws elbv2 describe-load-balancers \
    --profile $PROFILE --region $REGION \
    --query 'LoadBalancers[].{Name:LoadBalancerName,DNSName:DNSName,Type:Type,Scheme:Scheme,VpcId:VpcId,LoadBalancerArn:LoadBalancerArn}' \
    --output json > "${output_dir}/load_balancers.json" 2>/dev/null || echo "[]" > "${output_dir}/load_balancers.json"

aws elbv2 describe-target-groups \
    --profile $PROFILE --region $REGION \
    --query 'TargetGroups[*].{name:TargetGroupName,arn:TargetGroupArn,protocol:Protocol,port:Port,vpc:VpcId,healthCheck:{path:HealthCheckPath,port:HealthCheckPort,protocol:HealthCheckProtocol,timeout:HealthCheckTimeoutSeconds,interval:HealthCheckIntervalSeconds}}' \
    --output json > "${output_dir}/target_groups.json" 2>/dev/null || echo "[]" > "${output_dir}/target_groups.json"

# Target Group Health
if [ -f "${output_dir}/target_groups.json" ]; then
    target_groups=$(cat "${output_dir}/target_groups.json" | jq -r '.[].arn' 2>/dev/null)
    for tg_arn in $target_groups; do
        if [ ! -z "$tg_arn" ] && [ "$tg_arn" != "null" ]; then
            tg_name=$(cat "${output_dir}/target_groups.json" | jq -r ".[] | select(.arn==\"$tg_arn\") | .name" 2>/dev/null)
            if [ ! -z "$tg_name" ] && [ "$tg_name" != "null" ]; then
                echo "  🎯 Getting health for target group: $tg_name"
                aws elbv2 describe-target-health --profile $PROFILE --region $REGION --target-group-arn "$tg_arn" \
                    --output json > "${output_dir}/target_health_${tg_name}.json" 2>/dev/null || echo "{}" > "${output_dir}/target_health_${tg_name}.json"
            fi
        fi
    done
fi

# Load Balancer Listeners and Rules
if [ -f "${output_dir}/load_balancers.json" ]; then
    load_balancers=$(cat "${output_dir}/load_balancers.json" | jq -r '.[].LoadBalancerArn' 2>/dev/null)
    for lb_arn in $load_balancers; do
        if [ ! -z "$lb_arn" ] && [ "$lb_arn" != "null" ]; then
            lb_name=$(cat "${output_dir}/load_balancers.json" | jq -r ".[] | select(.LoadBalancerArn==\"$lb_arn\") | .Name" 2>/dev/null)
            if [ ! -z "$lb_name" ] && [ "$lb_name" != "null" ]; then
                echo "  🔗 Getting listeners for load balancer: $lb_name"
                aws elbv2 describe-listeners --profile $PROFILE --region $REGION --load-balancer-arn "$lb_arn" \
                    --query 'Listeners[*].{arn:ListenerArn,port:Port,protocol:Protocol,sslPolicy:SslPolicy,certificates:Certificates,defaultActions:DefaultActions}' \
                    --output json > "${output_dir}/lb_listeners_${lb_name}.json" 2>/dev/null || echo "[]" > "${output_dir}/lb_listeners_${lb_name}.json"
                
                # Get rules for each listener
                if [ -f "${output_dir}/lb_listeners_${lb_name}.json" ]; then
                    listener_arns=$(cat "${output_dir}/lb_listeners_${lb_name}.json" | jq -r '.[].arn' 2>/dev/null)
                    for listener_arn in $listener_arns; do
                        if [ ! -z "$listener_arn" ] && [ "$listener_arn" != "null" ]; then
                            listener_id=$(basename "$listener_arn")
                            echo "    📝 Getting rules for listener: $listener_id"
                            aws elbv2 describe-rules --profile $PROFILE --region $REGION --listener-arn "$listener_arn" \
                                --query 'Rules[*].{priority:Priority,conditions:Conditions[*],actions:Actions[*],isDefault:IsDefault}' \
                                --output json > "${output_dir}/lb_rules_${lb_name}_${listener_id}.json" 2>/dev/null || echo "[]" > "${output_dir}/lb_rules_${lb_name}_${listener_id}.json"
                        fi
                    done
                fi
            fi
        fi
    done
fi

echo ""
echo "🎉 AWS inventory collection complete!"
echo "📁 Output directory: ${output_dir}"
echo "📊 Generating summary..."

# Run the summary generator
python3 generate_summary.py "${output_dir}"
