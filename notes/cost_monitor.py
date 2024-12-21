import boto3
import json
import os
from datetime import datetime, timedelta
from botocore.exceptions import ClientError

class CostMonitor:
    def __init__(self):
        session = boto3.Session(
            profile_name=os.getenv('AWS_PROFILE'),
            region_name=os.getenv('AWS_REGION')
        )
        self.ce = session.client('ce')
        self.ecs = session.client('ecs')
        self.ecr = session.client('ecr')
        self.cloudwatch = session.client('cloudwatch')

    def collect_cost_info(self):
        """Collect comprehensive cost and resource utilization information."""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            cost_info = {
                'timestamp': datetime.now().isoformat(),
                'service_costs': self._get_service_costs(start_date, end_date),
                'resource_utilization': self._get_resource_utilization(),
                'repository_storage': self._get_repository_storage(),
                'service_metrics': self._get_service_metrics(start_date, end_date)
            }
            
            self._save_state(cost_info)
            return cost_info
            
        except ClientError as e:
            error_state = {
                'timestamp': datetime.now().isoformat(),
                'error': str(e)
            }
            self._save_state(error_state)
            return error_state

    def _save_state(self, state):
        """Save the monitoring state to a single JSON file."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'cost_state_{timestamp}.json'
        with open(filename, 'w') as f:
            json.dump(state, f, indent=2, default=str)
        return filename

    def _get_service_costs(self, start_date, end_date):
        """Get detailed cost breakdown by service."""
        try:
            response = self.ce.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date.strftime('%Y-%m-%d'),
                    'End': end_date.strftime('%Y-%m-%d')
                },
                Granularity='MONTHLY',
                Metrics=['UnblendedCost', 'UsageQuantity'],
                GroupBy=[
                    {'Type': 'DIMENSION', 'Key': 'SERVICE'},
                    {'Type': 'DIMENSION', 'Key': 'USAGE_TYPE'}
                ]
            )
            
            costs_by_service = {}
            for result in response['ResultsByTime']:
                for group in result['Groups']:
                    service = group['Keys'][0]
                    usage_type = group['Keys'][1]
                    cost = float(group['Metrics']['UnblendedCost']['Amount'])
                    quantity = float(group['Metrics']['UsageQuantity']['Amount'])
                    
                    if service not in costs_by_service:
                        costs_by_service[service] = {
                            'total_cost': 0,
                            'usage_breakdown': {}
                        }
                    
                    costs_by_service[service]['total_cost'] += cost
                    costs_by_service[service]['usage_breakdown'][usage_type] = {
                        'cost': cost,
                        'quantity': quantity
                    }
            
            return costs_by_service
        except ClientError as e:
            return {'error': str(e)}

    def _get_resource_utilization(self):
        """Get ECS resource utilization metrics."""
        try:
            clusters = self.ecs.list_clusters()['clusterArns']
            utilization = {}
            
            for cluster_arn in clusters:
                cluster_name = cluster_arn.split('/')[-1]
                
                services = self.ecs.list_services(cluster=cluster_name)
                services_response = self.ecs.describe_services(
                    cluster=cluster_name,
                    services=services['serviceArns']
                ) if services['serviceArns'] else {'services': []}
                
                utilization[cluster_name] = {
                    'services': [{
                        'name': service['serviceName'],
                        'running_count': service['runningCount'],
                        'desired_count': service['desiredCount'],
                        'pending_count': service['pendingCount'],
                        'cpu_reservation': self._get_task_cpu(service),
                        'memory_reservation': self._get_task_memory(service)
                    } for service in services_response['services']]
                }
            
            return utilization
        except ClientError as e:
            return {'error': str(e)}

    def _get_task_cpu(self, service):
        """Get task CPU reservation."""
        if 'deployments' in service and service['deployments']:
            task_def = self.ecs.describe_task_definition(
                taskDefinition=service['deployments'][0]['taskDefinition']
            )['taskDefinition']
            return float(task_def.get('cpu', 0))
        return 0

    def _get_task_memory(self, service):
        """Get task memory reservation."""
        if 'deployments' in service and service['deployments']:
            task_def = self.ecs.describe_task_definition(
                taskDefinition=service['deployments'][0]['taskDefinition']
            )['taskDefinition']
            return float(task_def.get('memory', 0))
        return 0

    def _get_repository_storage(self):
        """Get ECR repository storage metrics."""
        try:
            repositories = self.ecr.describe_repositories()['repositories']
            storage_info = {}
            
            for repo in repositories:
                images = self.ecr.describe_images(
                    repositoryName=repo['repositoryName']
                )['imageDetails']
                
                storage_info[repo['repositoryName']] = {
                    'image_count': len(images),
                    'total_size_mb': sum(image['imageSizeInBytes'] for image in images) / (1024 * 1024),
                    'latest_pushed': max(image['imagePushedAt'] for image in images),
                    'layers_count': sum(len(image.get('imageLayers', [])) for image in images)
                }
            
            return storage_info
        except ClientError as e:
            return {'error': str(e)}

    def _get_service_metrics(self, start_date, end_date):
        """Get CloudWatch metrics for services."""
        try:
            metrics = {
                'CPUUtilization': 'Average',
                'MemoryUtilization': 'Average'
            }
            services = ['connector', 'asciichessts']
            service_metrics = {}
            
            for service in services:
                service_metrics[service] = {}
                for metric_name, stat in metrics.items():
                    response = self.cloudwatch.get_metric_statistics(
                        Namespace='AWS/ECS',
                        MetricName=metric_name,
                        Dimensions=[
                            {'Name': 'ServiceName', 'Value': f'my-chess-{service}'},
                            {'Name': 'ClusterName', 'Value': 'my-chess'}
                        ],
                        StartTime=start_date,
                        EndTime=end_date,
                        Period=3600,
                        Statistics=[stat]
                    )
                    
                    service_metrics[service][metric_name] = [{
                        'timestamp': dp['Timestamp'].isoformat(),
                        'value': dp[stat]
                    } for dp in sorted(response['Datapoints'], key=lambda x: x['Timestamp'])]
            
            return service_metrics
        except ClientError as e:
            return {'error': str(e)}

if __name__ == "__main__":
    try:
        if not os.getenv('AWS_PROFILE') or not os.getenv('AWS_REGION'):
            raise ValueError("AWS_PROFILE and AWS_REGION environment variables are required")
            
        monitor = CostMonitor()
        state = monitor.collect_cost_info()
        
        if 'error' in state:
            print(f"Error collecting cost state: {state['error']}")
            exit(1)
            
        print(f"Cost state saved successfully")
        exit(0)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1)
