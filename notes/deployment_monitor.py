import boto3
import json
import os
from datetime import datetime, timedelta
from botocore.exceptions import ClientError

class DeploymentMonitor:
    def __init__(self):
        self.validate_environment()
        self.metadata = self._get_metadata()
        session = boto3.Session(
            profile_name=os.getenv('AWS_PROFILE'),
            region_name=os.getenv('AWS_REGION')
        )
        self.ecs = session.client('ecs')
        self.ec2 = session.client('ec2')
        self.logs = session.client('logs')
        self.cloudwatch = session.client('cloudwatch')

    def validate_environment(self):
        """Validate required environment variables are set."""
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

    def _get_metadata(self):
        """Get basic metadata about the deployment."""
        return {
            'timestamp': datetime.now().isoformat(),
            'environment': {
                'profile': os.getenv('AWS_PROFILE'),
                'region': os.getenv('AWS_REGION'),
                'account_id': os.getenv('AWS_ACCOUNT_ID')
            },
            'network': {
                'vpc_id': os.getenv('AWS_VPC_ID'),
                'subnet_ids': [
                    os.getenv('AWS_SUBNET_ID_1'),
                    os.getenv('AWS_SUBNET_ID_2')
                ],
                'security_group_id': os.getenv('AWS_SECURITY_GROUP_ID')
            }
        }

    def _get_service_state(self):
        """Get ECS service state information."""
        try:
            services = self.ecs.list_services(cluster='my-chess')
            if not services['serviceArns']:
                return {'error': 'No services found'}

            service_details = self.ecs.describe_services(
                cluster='my-chess',
                services=services['serviceArns']
            )['services']

            return [{
                'name': service['serviceName'],
                'status': service['status'],
                'running_count': service['runningCount'],
                'desired_count': service['desiredCount'],
                'task_definition': service['taskDefinition'],
                'health_check': service.get('healthCheck', {}),
                'deployment_status': [
                    {
                        'status': deploy['status'],
                        'desired': deploy['desiredCount'],
                        'running': deploy['runningCount'],
                        'pending': deploy['pendingCount'],
                        'failed': deploy.get('failedTasks', 0),
                    } for deploy in service.get('deployments', [])
                ]
            } for service in service_details]

        except ClientError as e:
            return {'error': str(e)}

    def _get_recent_logs(self):
        """Get recent logs from both services."""
        try:
            services = ['connector', 'asciichessts']
            logs_info = {}
            
            for service in services:
                log_group_name = f"/ecs/my-chess-{service}"
                streams = self.logs.describe_log_streams(
                    logGroupName=log_group_name,
                    orderBy='LastEventTime',
                    descending=True,
                    limit=1
                )

                if streams['logStreams']:
                    latest_stream = streams['logStreams'][0]
                    events = self.logs.get_log_events(
                        logGroupName=log_group_name,
                        logStreamName=latest_stream['logStreamName'],
                        startFromHead=False,
                        limit=20
                    )
                    
                    logs_info[service] = {
                        'latest_stream': latest_stream['logStreamName'],
                        'last_event': latest_stream.get('lastEventTimestamp'),
                        'recent_events': [{
                            'timestamp': event['timestamp'],
                            'message': event['message']
                        } for event in events['events']]
                    }
                else:
                    logs_info[service] = {'error': 'No log streams found'}

            return logs_info

        except ClientError as e:
            return {'error': str(e)}

    def _get_metrics(self):
        """Get recent CloudWatch metrics."""
        try:
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=1)
            
            metrics = ['CPUUtilization', 'MemoryUtilization']
            services = ['connector', 'asciichessts']
            metrics_data = {}
            
            for service in services:
                metrics_data[service] = {}
                for metric in metrics:
                    response = self.cloudwatch.get_metric_statistics(
                        Namespace='AWS/ECS',
                        MetricName=metric,
                        Dimensions=[
                            {'Name': 'ServiceName', 'Value': f'my-chess-{service}'},
                            {'Name': 'ClusterName', 'Value': 'my-chess'}
                        ],
                        StartTime=start_time,
                        EndTime=end_time,
                        Period=300,
                        Statistics=['Average']
                    )
                    
                    metrics_data[service][metric] = [{
                        'timestamp': point['Timestamp'].isoformat(),
                        'value': point['Average']
                    } for point in response['Datapoints']]
            
            return metrics_data

        except ClientError as e:
            return {'error': str(e)}

    def _save_state(self, state):
        """Save the deployment state to a single JSON file."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'chess_deployment_state_{timestamp}.json'
        with open(filename, 'w') as f:
            json.dump(state, f, indent=2, default=str)
        return filename

    def get_deployment_state(self):
        """Collect comprehensive deployment state."""
        try:
            state = {
                'metadata': self.metadata,
                'timestamp': datetime.now().isoformat(),
                'services': self._get_service_state(),
                'logs': self._get_recent_logs(),
                'metrics': self._get_metrics()
            }
            
            filename = self._save_state(state)
            print(f"Deployment state saved to {filename}")
            
            return state
            
        except Exception as e:
            error_state = {
                'metadata': self.metadata,
                'timestamp': datetime.now().isoformat(),
                'error': str(e)
            }
            filename = self._save_state(error_state)
            print(f"Error state saved to {filename}")
            return error_state

def main():
    try:
        monitor = DeploymentMonitor()
        state = monitor.get_deployment_state()
        
        if 'error' in state:
            print(f"Error collecting deployment state: {state['error']}")
            return 1
        return 0
        
    except Exception as e:
        print(f"Fatal error in deployment monitor: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())
