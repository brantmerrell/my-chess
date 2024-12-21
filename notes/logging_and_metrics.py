import boto3
import json
import os
from datetime import datetime, timedelta
from botocore.exceptions import ClientError

class LoggingMonitor:
    def __init__(self):
        session = boto3.Session(
            profile_name=os.getenv('AWS_PROFILE'),
            region_name=os.getenv('AWS_REGION')
        )
        self.logs = session.client('logs')
        self.cloudwatch = session.client('cloudwatch')

    def collect_logging_info(self):
        """Collect comprehensive logging and metrics information."""
        try:
            logging_info = {
                'timestamp': datetime.now().isoformat(),
                'container_logs': self._get_container_logs(),
                'metric_data': self._get_metric_data(),
                'alarms': self._get_alarms()
            }
            
            self._save_state(logging_info)
            return logging_info
            
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
        filename = f'logging_state_{timestamp}.json'
        with open(filename, 'w') as f:
            json.dump(state, f, indent=2, default=str)
        return filename

    def _get_container_logs(self):
        """Get container logs from CloudWatch Logs."""
        services = ['connector', 'asciichessts']
        logs_info = {}
        
        for service in services:
            log_group_name = f"/ecs/my-chess-{service}"
            try:
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
                        limit=100
                    )
                    
                    logs_info[service] = {
                        'latest_stream': latest_stream['logStreamName'],
                        'last_event': latest_stream.get('lastEventTimestamp'),
                        'stored_bytes': latest_stream.get('storedBytes'),
                        'events': [{
                            'timestamp': event['timestamp'],
                            'message': event['message']
                        } for event in events['events']]
                    }
                else:
                    logs_info[service] = {'error': 'No log streams found'}
                    
            except ClientError as e:
                logs_info[service] = {'error': str(e)}
        
        return logs_info

    def _get_metric_data(self):
        """Get CloudWatch metrics data."""
        try:
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=3)
            
            metrics = {
                'CPUUtilization': {
                    'namespace': 'AWS/ECS',
                    'metric_name': 'CPUUtilization'
                },
                'MemoryUtilization': {
                    'namespace': 'AWS/ECS',
                    'metric_name': 'MemoryUtilization'
                },
                'RunningTaskCount': {
                    'namespace': 'AWS/ECS',
                    'metric_name': 'RunningTaskCount'
                }
            }
            
            metric_data = {}
            for name, info in metrics.items():
                response = self.cloudwatch.get_metric_data(
                    MetricDataQueries=[
                        {
                            'Id': 'connector',
                            'MetricStat': {
                                'Metric': {
                                    'Namespace': info['namespace'],
                                    'MetricName': info['metric_name'],
                                    'Dimensions': [
                                        {'Name': 'ServiceName', 'Value': 'my-chess-connector'},
                                        {'Name': 'ClusterName', 'Value': 'my-chess'}
                                    ]
                                },
                                'Period': 300,
                                'Stat': 'Average'
                            }
                        },
                        {
                            'Id': 'asciichessts',
                            'MetricStat': {
                                'Metric': {
                                    'Namespace': info['namespace'],
                                    'MetricName': info['metric_name'],
                                    'Dimensions': [
                                        {'Name': 'ServiceName', 'Value': 'my-chess-asciichessts'},
                                        {'Name': 'ClusterName', 'Value': 'my-chess'}
                                    ]
                                },
                                'Period': 300,
                                'Stat': 'Average'
                            }
                        }
                    ],
                    StartTime=start_time,
                    EndTime=end_time
                )
                
                metric_data[name] = {
                    'connector': [{
                        'timestamp': t.isoformat(),
                        'value': v
                    } for t, v in zip(response['MetricDataResults'][0]['Timestamps'],
                                    response['MetricDataResults'][0]['Values'])],
                    'asciichessts': [{
                        'timestamp': t.isoformat(),
                        'value': v
                    } for t, v in zip(response['MetricDataResults'][1]['Timestamps'],
                                    response['MetricDataResults'][1]['Values'])]
                }
            
            return metric_data
            
        except ClientError as e:
            return {'error': str(e)}

    def _get_alarms(self):
        """Get CloudWatch alarms."""
        try:
            response = self.cloudwatch.describe_alarms(
                AlarmNamePrefix='my-chess'
            )
            
            return [{
                'name': alarm['AlarmName'],
                'metric_name': alarm['MetricName'],
                'namespace': alarm['Namespace'],
                'state': alarm['StateValue'],
                'state_reason': alarm['StateReason'],
                'state_updated': alarm['StateUpdatedTimestamp'].isoformat(),
                'actions_enabled': alarm['ActionsEnabled'],
                'alarm_actions': alarm.get('AlarmActions', []),
                'ok_actions': alarm.get('OKActions', [])
            } for alarm in response['MetricAlarms']]
            
        except ClientError as e:
            return {'error': str(e)}

if __name__ == "__main__":
    try:
        monitor = LoggingMonitor()
        state = monitor.collect_logging_info()
        print(f"Logging state saved successfully")
        
    except Exception as e:
        print(f"Error collecting logging state: {str(e)}")
