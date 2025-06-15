import json
import yaml
import sys
from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime

def load_json(base_path: Path, filename: str) -> Any:
    try:
        file_path = base_path / filename
        print(f"Attempting to load: {file_path}")
        with open(file_path, 'r') as f:
            content = f.read().strip()
            if not content:
                print(f"Warning: {filename} is empty")
                return []
            return json.loads(content)
    except FileNotFoundError:
        print(f"Warning: {filename} not found")
        return []
    except json.JSONDecodeError as e:
        print(f"Warning: Invalid JSON in {filename}: {e}")
        return []
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return []

def safe_process(data, processor_name="Unknown"):
    """Safely process data with error handling"""
    try:
        if not data:
            return {}
        return data
    except Exception as e:
        print(f"Error in {processor_name}: {e}")
        return {}

def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python3 generate_summary.py <data_directory>")
        sys.exit(1)

    data_dir = Path(sys.argv[1])
    if not data_dir.exists():
        print(f"Directory {data_dir} does not exist")
        sys.exit(1)

    print(f"Processing AWS inventory from {data_dir}")
    
    # List all files in the directory
    print("\nFiles found:")
    for file in sorted(data_dir.glob("*.json")):
        print(f"  - {file.name}")
    
    inventory: Dict[str, Any] = {
        'generated_at': datetime.now().isoformat(),
        'data_directory': str(data_dir)
    }

    # Define all the files we expect and their processors
    file_processors = {
        'ec2_instances.json': ('EC2 Instances', lambda x: {
            inst['InstanceId']: {
                'name': inst.get('Name', ''),
                'type': inst.get('Type', ''),
                'state': inst.get('State', ''),
                'zone': inst.get('Zone', ''),
                'vpc_id': inst.get('VpcId', '')
            } for inst in (x if isinstance(x, list) else [])
        }),
        
        'lambda_functions.json': ('Lambda Functions', lambda x: {
            func['Name']: {
                'runtime': func.get('Runtime', ''),
                'memory': func.get('Memory', 0),
                'timeout': func.get('Timeout', 0),
                'state': func.get('State', '')
            } for func in (x if isinstance(x, list) else [])
        }),
        
        's3_buckets.json': ('S3 Buckets', lambda x: {
            bucket['Name']: {
                'created': bucket.get('CreationDate', '')
            } for bucket in (x if isinstance(x, list) else [])
        }),
        
        'rds_instances.json': ('RDS Instances', lambda x: {
            db['DBName']: {
                'engine': db.get('Engine', ''),
                'version': db.get('Version', ''),
                'size': db.get('Size', ''),
                'storage': db.get('Storage', '')
            } for db in (x if isinstance(x, list) else [])
        }),
        
        'ecr_repositories.json': ('ECR Repositories', lambda x: {
            repo['Name']: {
                'uri': repo.get('URI', '')
            } for repo in (x if isinstance(x, list) else [])
        }),
        
        'api_gateways.json': ('API Gateways', lambda x: {
            api['ID']: {
                'name': api.get('Name', ''),
                'description': api.get('Description', ''),
                'version': api.get('Version', '')
            } for api in (x if isinstance(x, list) else [])
        }),
        
        'dynamodb_tables.json': ('DynamoDB Tables', lambda x: {
            f"table_{i}": table for i, table in enumerate(x if isinstance(x, list) else [])
        }),
        
        'sns_topics.json': ('SNS Topics', lambda x: {
            f"topic_{i}": topic for i, topic in enumerate(x if isinstance(x, list) else [])
        }),
        
        'sqs_queues.json': ('SQS Queues', lambda x: {
            f"queue_{i}": queue for i, queue in enumerate(x if isinstance(x, list) else [])
        }),
        
        'load_balancers.json': ('Load Balancers', lambda x: {
            lb['LoadBalancerName']: {
                'dns_name': lb.get('DNSName', ''),
                'type': lb.get('Type', ''),
                'scheme': lb.get('Scheme', ''),
                'vpc_id': lb.get('VpcId', ''),
                'arn': lb.get('LoadBalancerArn', '')
            } for lb in (x if isinstance(x, list) else [])
        }),
        
        'target_groups.json': ('Target Groups', lambda x: {
            tg['name']: {
                'protocol': tg.get('protocol', ''),
                'port': tg.get('port', ''),
                'vpc': tg.get('vpc', ''),
                'health_check': tg.get('healthCheck', {})
            } for tg in (x if isinstance(x, list) else [])
        }),
        
        'security_groups.json': ('Security Groups', lambda x: {
            sg['GroupId']: {
                'name': sg.get('GroupName', ''),
                'description': sg.get('Description', ''),
                'vpc_id': sg.get('VpcId', ''),
                'ingress_count': len(sg.get('IpPermissions', [])),
                'egress_count': len(sg.get('IpPermissionsEgress', []))
            } for sg in (x.get('SecurityGroups', []) if isinstance(x, dict) else (x if isinstance(x, list) else []))
        }),
        
        'ecs_clusters.json': ('ECS Clusters', lambda x: {
            cluster.split('/')[-1]: {
                'arn': cluster
            } for cluster in (x.get('clusterArns', []) if isinstance(x, dict) else (x if isinstance(x, list) else []))
        }),
        
        'ecs_tasks.json': ('ECS Tasks', lambda x: {
            f"task_{i}": task for i, task in enumerate(x.get('taskArns', []) if isinstance(x, dict) else (x if isinstance(x, list) else []))
        })
    }

    # Process each file
    for filename, (resource_type, processor) in file_processors.items():
        print(f"\n--- Processing {filename} ---")
        data = load_json(data_dir, filename)
        
        if data:
            try:
                processed = processor(data)
                if processed:
                    inventory[resource_type] = processed
                    print(f"✓ Processed {len(processed)} {resource_type}")
                else:
                    print(f"⚠ No data processed for {resource_type}")
            except Exception as e:
                print(f"✗ Error processing {resource_type}: {e}")
                # Still include raw data for debugging
                inventory[f"{resource_type} (raw)"] = data
        else:
            print(f"⚠ No data found in {filename}")

    # Write summary
    output_file = 'aws_summary.yml'
    try:
        with open(output_file, 'w') as f:
            yaml.dump(inventory, f, default_flow_style=False, sort_keys=False, indent=2)
        
        print(f"\n✅ Complete AWS summary written to {output_file}")
        print(f"📊 Summary includes {len([k for k in inventory.keys() if k not in ['generated_at', 'data_directory']])} resource categories")
        
        # Show a brief summary
        print(f"\n📋 Resource Summary:")
        for key, value in inventory.items():
            if key not in ['generated_at', 'data_directory'] and isinstance(value, dict):
                print(f"  - {key}: {len(value)} items")
                
    except Exception as e:
        print(f"✗ Error writing summary: {e}")

if __name__ == "__main__":
    main()
