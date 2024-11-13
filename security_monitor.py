import boto3
import os
import json
from datetime import datetime
from botocore.exceptions import ClientError

class SecurityMonitor:
    def __init__(self):
        session = boto3.Session(
            profile_name=os.getenv('AWS_PROFILE'),
            region_name=os.getenv('AWS_REGION')
        )
        self.ec2 = session.client('ec2')
        self.iam = session.client('iam')

    def collect_security_info(self, security_group_id):
        """Collect security groups and IAM role information."""
        try:
            security_info = {
                'timestamp': datetime.now().isoformat(),
                'security_group_rules': self._get_security_group_rules(security_group_id),
                'task_execution_role': self._get_iam_role_details('ecsTaskExecutionRole')
            }
            
            self._save_state(security_info)
            return security_info
            
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
        filename = f'security_state_{timestamp}.json'
        with open(filename, 'w') as f:
            json.dump(state, f, indent=2, default=str)
        return filename

    def _get_security_group_rules(self, group_id):
        """Get detailed security group rules."""
        try:
            response = self.ec2.describe_security_group_rules(
                Filters=[{'Name': 'group-id', 'Values': [group_id]}]
            )
            rules = response['SecurityGroupRules']
            return [{
                'type': 'egress' if rule.get('IsEgress', False) else 'ingress',
                'protocol': rule.get('IpProtocol'),
                'from_port': rule.get('FromPort'),
                'to_port': rule.get('ToPort'),
                'cidr': rule.get('CidrIpv4'),
                'description': rule.get('Description')
            } for rule in rules]
        except ClientError as e:
            return {'error': str(e)}

    def _get_iam_role_details(self, role_name):
        """Get IAM role details including policies and trust relationships."""
        try:
            response = self.iam.get_role(RoleName=role_name)
            role = response['Role']
            
            policies_response = self.iam.list_attached_role_policies(RoleName=role_name)
            attached_policies = policies_response['AttachedPolicies']
            
            create_date_str = role['CreateDate'].isoformat() if isinstance(role['CreateDate'], datetime) else str(role['CreateDate'])
            
            return {
                'arn': role['Arn'],
                'name': role['RoleName'],
                'create_date': create_date_str,
                'trust_relationship': role['AssumeRolePolicyDocument'],
                'attached_policies': [{
                    'name': p['PolicyName'],
                    'arn': p['PolicyArn']
                } for p in attached_policies]
            }
        except ClientError as e:
            return {'error': str(e)}

if __name__ == "__main__":
    try:
        if not os.getenv('AWS_SECURITY_GROUP_ID'):
            raise ValueError("AWS_SECURITY_GROUP_ID environment variable is required")
        
        monitor = SecurityMonitor()
        state = monitor.collect_security_info(os.getenv('AWS_SECURITY_GROUP_ID'))
        
        if 'error' in state:
            print(f"Error collecting security state: {state['error']}")
            exit(1)
            
        print(f"Security state saved successfully")
        exit(0)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1)
