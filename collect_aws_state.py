import boto3
import json
import os
from datetime import datetime
from botocore.exceptions import ClientError

def get_deployment_state():
    """Collect essential deployment state with networking and health metrics."""
    required_vars = [
        'AWS_PROFILE',
        'AWS_ACCOUNT_ID',
        'AWS_REGION',
        'AWS_VPC_ID',
        'AWS_SUBNET_ID_1',
        'AWS_SUBNET_ID_2',
        'AWS_SECURITY_GROUP_ID'
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

    session = boto3.Session(
        profile_name=os.getenv('AWS_PROFILE'),
        region_name=os.getenv('AWS_REGION')
    )
    ecs = session.client('ecs')
    ecr = session.client('ecr')
    logs = session.client('logs')
    servicediscovery = session.client('servicediscovery')
    ec2 = session.client('ec2')

    state = {
        'metadata': {
            'timestamp': datetime.now().isoformat(),
            'profile': os.getenv('AWS_PROFILE'),
            'region': os.getenv('AWS_REGION'),
            'account_id': os.getenv('AWS_ACCOUNT_ID'),
            'vpc_id': os.getenv('AWS_VPC_ID'),
            'subnet_ids': [
                os.getenv('AWS_SUBNET_ID_1'),
                os.getenv('AWS_SUBNET_ID_2')
            ],
            'security_group_id': os.getenv('AWS_SECURITY_GROUP_ID')
        },
        'services': {},
        'images': {},
        'recent_logs': {},
        'networking': {}
    }

    try:
        try:
            namespaces = servicediscovery.list_namespaces()['Namespaces']
            state['networking']['namespaces'] = [{
                'id': ns['Id'],
                'name': ns['Name'],
                'arn': ns['Arn']
            } for ns in namespaces]
        except ClientError:
            state['networking']['namespaces'] = []

        clusters = ecs.list_clusters()['clusterArns']
        for cluster_arn in clusters:
            cluster_name = cluster_arn.split('/')[-1]
            services = ecs.list_services(cluster=cluster_name)['serviceArns']

            if services:
                service_details = ecs.describe_services(
                    cluster=cluster_name,
                    services=services
                )['services']

                for service in service_details:
                    service_name = service['serviceName']

                    tasks = ecs.list_tasks(
                        cluster=cluster_name,
                        serviceName=service_name,
                        desiredStatus='RUNNING'
                    )['taskArns']

                    task_details = []
                    if tasks:
                        task_details = ecs.describe_tasks(
                            cluster=cluster_name,
                            tasks=tasks
                        )['tasks']

                    network_info = []
                    for task in task_details:
                        if 'attachments' in task:
                            for attachment in task['attachments']:
                                if attachment['type'] == 'ElasticNetworkInterface':
                                    eni_id = next((detail['value'] for detail in attachment['details']
                                                 if detail['name'] == 'networkInterfaceId'), None)
                                    if eni_id:
                                        eni = ec2.describe_network_interfaces(
                                            NetworkInterfaceIds=[eni_id]
                                        )['NetworkInterfaces'][0]
                                        network_info.append({
                                            'private_ip': eni.get('PrivateIpAddress'),
                                            'public_ip': eni.get('Association', {}).get('PublicIp'),
                                            'status': eni.get('Status')
                                        })

                    service_discovery_info = {}
                    if 'serviceRegistries' in service:
                        for registry in service['serviceRegistries']:
                            registry_arn = registry['registryArn']
                            service_discovery_info = {
                                'registry_arn': registry_arn,
                                'port': registry.get('port', None),
                                'container_name': registry.get('containerName', None),
                                'container_port': registry.get('containerPort', None)
                            }

                    state['services'][service_name] = {
                        'status': service['status'],
                        'desired_count': service['desiredCount'],
                        'running_count': service['runningCount'],
                        'pending_count': service['pendingCount'],
                        'task_definition': service['taskDefinition'],
                        'deployments': [{
                            'status': d['status'],
                            'desired': d['desiredCount'],
                            'running': d['runningCount'],
                            'failed': d['failedTasks'],
                            'rollout_state': d.get('rolloutState'),
                            'rollout_reason': d.get('rolloutStateReason'),
                            'updated_at': d['updatedAt']
                        } for d in service['deployments']],
                        'events': [e for e in service['events'][:5]
                                 if not e['message'].startswith('(service') or 'has started 1 tasks' in e['message']],
                        'network': {
                            'endpoints': network_info,
                            'service_discovery': service_discovery_info
                        },
                        'health': {
                            'task_states': [{
                                'last_status': task['lastStatus'],
                                'desired_status': task['desiredStatus'],
                                'health_status': task.get('healthStatus'),
                                'exit_code': next((c.get('exitCode') for c in task.get('containers', [])
                                                 if c.get('exitCode') is not None), None)
                            } for task in task_details]
                        }
                    }

                    task_def_arn = service['taskDefinition']
                    task_def = ecs.describe_task_definition(
                        taskDefinition=task_def_arn
                    )['taskDefinition']

                    state['services'][service_name]['task_definition_details'] = {
                        'cpu_architecture': task_def.get('runtimePlatform', {}).get('cpuArchitecture'),
                        'os_family': task_def.get('runtimePlatform', {}).get('operatingSystemFamily'),
                        'container_definitions': [{
                            'name': c['name'],
                            'image': c['image'],
                            'status': c.get('lastStatus', 'UNKNOWN'),
                            'health_check': c.get('healthCheck', None)
                        } for c in task_def['containerDefinitions']]
                    }

        repositories = ecr.describe_repositories()['repositories']
        for repo in repositories:
            repo_name = repo['repositoryName']
            images = ecr.describe_images(
                repositoryName=repo_name,
                filter={'tagStatus': 'TAGGED'},
                maxResults=1
            )['imageDetails']

            if images:
                latest = images[0]
                state['images'][repo_name] = {
                    'latest_tag': latest.get('imageTags', ['unknown'])[0],
                    'pushed_at': latest['imagePushedAt'],
                    'size': latest['imageSizeInBytes'],
                    'digest': latest['imageDigest']
                }

        for service_name in state['services'].keys():
            log_group_name = f"/ecs/my-chess-{service_name}"
            try:
                streams = logs.describe_log_streams(
                    logGroupName=log_group_name,
                    orderBy='LastEventTime',
                    descending=True,
                    limit=1
                )['logStreams']

                if streams:
                    latest_events = logs.get_log_events(
                        logGroupName=log_group_name,
                        logStreamName=streams[0]['logStreamName'],
                        limit=10
                    )['events']

                    state['recent_logs'][service_name] = [{
                        'timestamp': event['timestamp'],
                        'message': event['message']
                    } for event in latest_events]
            except ClientError:
                state['recent_logs'][service_name] = []

    except ClientError as e:
        state['error'] = str(e)

    return state

if __name__ == "__main__":
    try:
        state = get_deployment_state()
        filename = f"chess_deployment_state_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(state, f, indent=2, default=str)
        print(f"Deployment state saved to {filename}")

        print("\nDeployment Status Summary:")
        print("=" * 50)
        print(f"Using AWS Profile: {os.getenv('AWS_PROFILE')}")
        print(f"Region: {os.getenv('AWS_REGION')}")

        for service_name, service in state['services'].items():
            print(f"\n{service_name}:")
            print(f"Status: {service['status']}")
            print(f"Tasks: {service['running_count']}/{service['desired_count']} running")

            if service['network']['endpoints']:
                endpoint = service['network']['endpoints'][0]
                print(f"Network: Private IP: {endpoint['private_ip']}, Public IP: {endpoint['public_ip']}")

            if service['network']['service_discovery']:
                print(f"Service Discovery: {service['network']['service_discovery']['registry_arn']}")

            for task in service['health']['task_states']:
                print(f"Health: {task['health_status'] or task['last_status']}")
                if task.get('exit_code'):
                    print(f"Last Exit Code: {task['exit_code']}")

            if state['recent_logs'].get(service_name):
                print("Latest Log:")
                print(f"  {state['recent_logs'][service_name][0]['message']}")
    except Exception as e:
        print(f"Error collecting deployment state: {str(e)}")
