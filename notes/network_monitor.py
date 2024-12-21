import boto3
import json
import os
from datetime import datetime
from botocore.exceptions import ClientError

class NetworkMonitor:
    def __init__(self):
        session = boto3.Session(
            profile_name=os.getenv('AWS_PROFILE'),
            region_name=os.getenv('AWS_REGION')
        )
        self.ec2 = session.client('ec2')
        self.elbv2 = session.client('elbv2')
        self.servicediscovery = session.client('servicediscovery')

    def collect_network_info(self):
        """Collect comprehensive networking information."""
        try:
            network_info = {
                'timestamp': datetime.now().isoformat(),
                'vpc': self._get_vpc_info(),
                'subnets': self._get_subnet_info(),
                'load_balancers': self._get_load_balancer_info(),
                'service_discovery': self._get_service_discovery_info()
            }
            
            self._save_state(network_info)
            return network_info
            
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
        filename = f'network_state_{timestamp}.json'
        with open(filename, 'w') as f:
            json.dump(state, f, indent=2, default=str)
        return filename

    def _get_vpc_info(self):
        """Get VPC configuration and settings."""
        try:
            vpc_response = self.ec2.describe_vpcs(
                VpcIds=[os.getenv('AWS_VPC_ID')]
            )
            
            vpc = vpc_response['Vpcs'][0]
            
            dns_support = self.ec2.describe_vpc_attribute(
                VpcId=vpc['VpcId'],
                Attribute='enableDnsSupport'
            )
            dns_hostnames = self.ec2.describe_vpc_attribute(
                VpcId=vpc['VpcId'],
                Attribute='enableDnsHostnames'
            )
            
            endpoints = self.ec2.describe_vpc_endpoints(
                Filters=[{'Name': 'vpc-id', 'Values': [vpc['VpcId']]}]
            )
            
            peering = self.ec2.describe_vpc_peering_connections(
                Filters=[{'Name': 'requester-vpc-info.vpc-id', 'Values': [vpc['VpcId']]}]
            )
            
            return {
                'vpc_id': vpc['VpcId'],
                'cidr_block': vpc['CidrBlock'],
                'state': vpc['State'],
                'dns_support': dns_support['EnableDnsSupport']['Value'],
                'dns_hostnames': dns_hostnames['EnableDnsHostnames']['Value'],
                'endpoints': [{
                    'id': endpoint['VpcEndpointId'],
                    'service': endpoint['ServiceName'],
                    'type': endpoint['VpcEndpointType'],
                    'state': endpoint['State']
                } for endpoint in endpoints.get('VpcEndpoints', [])],
                'peering_connections': [{
                    'id': peer['VpcPeeringConnectionId'],
                    'requester_vpc': peer['RequesterVpcInfo']['VpcId'],
                    'accepter_vpc': peer['AccepterVpcInfo']['VpcId'],
                    'status': peer['Status']['Code']
                } for peer in peering.get('VpcPeeringConnections', [])]
            }
        except ClientError as e:
            return {'error': str(e)}

    def _get_subnet_info(self):
        """Get subnet configuration and availability."""
        try:
            subnet_ids = [
                os.getenv('AWS_SUBNET_ID_1'),
                os.getenv('AWS_SUBNET_ID_2')
            ]
            response = self.ec2.describe_subnets(SubnetIds=subnet_ids)
            
            return [{
                'subnet_id': subnet['SubnetId'],
                'vpc_id': subnet['VpcId'],
                'cidr_block': subnet['CidrBlock'],
                'availability_zone': subnet['AvailabilityZone'],
                'available_ips': subnet['AvailableIpAddressCount'],
                'auto_assign_public_ip': subnet['MapPublicIpOnLaunch'],
                'state': subnet['State']
            } for subnet in response['Subnets']]
        except ClientError as e:
            return {'error': str(e)}

    def _get_load_balancer_info(self):
        """Get load balancer configuration and health."""
        try:
            response = self.elbv2.describe_load_balancers()
            
            lb_info = {}
            for lb in response['LoadBalancers']:
                listeners = self.elbv2.describe_listeners(
                    LoadBalancerArn=lb['LoadBalancerArn']
                )['Listeners']
                
                target_groups = self.elbv2.describe_target_groups(
                    LoadBalancerArn=lb['LoadBalancerArn']
                )['TargetGroups']
                
                target_health = {}
                for tg in target_groups:
                    health = self.elbv2.describe_target_health(
                        TargetGroupArn=tg['TargetGroupArn']
                    )['TargetHealthDescriptions']
                    target_health[tg['TargetGroupName']] = health
                
                lb_info[lb['LoadBalancerName']] = {
                    'dns_name': lb['DNSName'],
                    'scheme': lb['Scheme'],
                    'vpc_id': lb['VpcId'],
                    'type': lb['Type'],
                    'state': lb['State']['Code'],
                    'listeners': [{
                        'port': listener['Port'],
                        'protocol': listener['Protocol']
                    } for listener in listeners],
                    'target_groups': [{
                        'name': tg['TargetGroupName'],
                        'protocol': tg['Protocol'],
                        'port': tg['Port'],
                        'health_check': {
                            'protocol': tg['HealthCheckProtocol'],
                            'port': tg['HealthCheckPort'],
                            'path': tg.get('HealthCheckPath'),
                            'interval': tg['HealthCheckIntervalSeconds'],
                            'timeout': tg['HealthCheckTimeoutSeconds']
                        },
                        'targets': [{
                            'id': target['Target']['Id'],
                            'port': target['Target']['Port'],
                            'health': target['TargetHealth']['State'],
                            'reason': target['TargetHealth'].get('Description')
                        } for target in target_health.get(tg['TargetGroupName'], [])]
                    } for tg in target_groups]
                }
            
            return lb_info
        except ClientError as e:
            return {'error': str(e)}

    def _get_service_discovery_info(self):
        """Get service discovery namespaces and services."""
        try:
            response = self.servicediscovery.list_namespaces()
            
            namespaces = []
            for ns in response['Namespaces']:
                services = self.servicediscovery.list_services(
                    Filters=[{'Name': 'NAMESPACE_ID', 'Values': [ns['Id']]}]
                )['Services']
                
                namespaces.append({
                    'id': ns['Id'],
                    'name': ns['Name'],
                    'arn': ns['Arn'],
                    'type': ns['Type'],
                    'services': [{
                        'id': svc['Id'],
                        'name': svc['Name'],
                        'arn': svc['Arn'],
                        'type': svc.get('Type')
                    } for svc in services]
                })
            
            return namespaces
        except ClientError as e:
            return {'error': str(e)}

if __name__ == "__main__":
    try:
        required_vars = ['AWS_PROFILE', 'AWS_REGION', 'AWS_VPC_ID', 'AWS_SUBNET_ID_1', 'AWS_SUBNET_ID_2']
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        monitor = NetworkMonitor()
        state = monitor.collect_network_info()
        
        if 'error' in state:
            print(f"Error collecting network state: {state['error']}")
            exit(1)
            
        print(f"Network state saved successfully")
        exit(0)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1)
