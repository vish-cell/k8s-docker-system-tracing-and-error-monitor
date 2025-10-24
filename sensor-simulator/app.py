import time, requests, random, os, uuid
from datetime import datetime

MODEL_SVC = os.environ.get('MODEL_SERVICE_URL', 'http://model-service:5001/detect')

# Simulated Kubernetes environment
NAMESPACES = ['default', 'monitoring', 'app']
PODS = {
    'default': ['web-frontend', 'api-backend', 'cache'],
    'monitoring': ['prometheus', 'grafana'],
    'app': ['auth-service', 'data-processor', 'queue']
}

# Log levels and message templates
LOG_LEVELS = ['INFO', 'WARN', 'ERROR']
LOG_TEMPLATES = {
    'INFO': [
        'Processing request from {source}',
        'Successfully handled {request_type} request',
        'Connection established with {dest}',
    ],
    'WARN': [
        'High latency detected on {dest}',
        'Retry attempt {retry} for {request_type}',
        'Resource usage above threshold',
    ],
    'ERROR': [
        'Connection failed to {dest}',
        'Request timeout after {timeout}ms',
        'Internal server error processing {request_type}',
    ]
}

def generate_connection_event():
    # Pick random source and destination pods
    src_ns = random.choice(NAMESPACES)
    dst_ns = random.choice(NAMESPACES)
    src_pod = random.choice(PODS[src_ns])
    dst_pod = random.choice(PODS[dst_ns])
    
    # Simulate connection metrics
    latency = random.gauss(100, 50)  # mean 100ms, stddev 50ms
    status = 'active' if random.random() > 0.1 else 'error'
    
    return {
        'source_pod': f"{src_ns}/{src_pod}",
        'dest_pod': f"{dst_ns}/{dst_pod}",
        'latency': max(1, latency),
        'status': status,
        'timestamp': datetime.now().isoformat()
    }

def generate_log_entry():
    ns = random.choice(NAMESPACES)
    pod = random.choice(PODS[ns])
    level = random.choices(LOG_LEVELS, weights=[0.7, 0.2, 0.1])[0]
    
    context = {
        'source': f"{random.choice(NAMESPACES)}/{random.choice(PODS['default'])}",
        'dest': f"{random.choice(NAMESPACES)}/{random.choice(PODS['default'])}",
        'request_type': random.choice(['GET', 'POST', 'PUT', 'DELETE']),
        'retry': random.randint(1, 3),
        'timeout': random.randint(1000, 5000)
    }
    
    return {
        'pod': pod,
        'namespace': ns,
        'level': level,
        'message': random.choice(LOG_TEMPLATES[level]).format(**context),
        'correlationId': str(uuid.uuid4()),
        'timestamp': datetime.now().isoformat()
    }

def send_connection(event):
    try:
        url = f"{MODEL_SVC.rstrip('/detect')}/connections"
        r = requests.post(url, json=event, timeout=5)
        print(f"Connection event sent: {r.status_code}")
    except Exception as e:
        print(f"Error sending connection event: {e}")

def send_log(log):
    try:
        url = f"{MODEL_SVC.rstrip('/detect')}/logs"
        r = requests.post(url, json=log, timeout=5)
        print(f"Log entry sent: {r.status_code}")
    except Exception as e:
        print(f"Error sending log: {e}")

if __name__ == '__main__':
    print(f'Sensor simulator starting, sending events to {MODEL_SVC}')
    
    while True:
        # Generate and send connection event
        conn_event = generate_connection_event()
        send_connection(conn_event)
        
        # Generate and send 1-3 log entries
        for _ in range(random.randint(1, 3)):
            log_entry = generate_log_entry()
            send_log(log_entry)
            
        # Wait before next iteration
        time.sleep(float(os.environ.get('SIM_INTERVAL', '2.0')))
