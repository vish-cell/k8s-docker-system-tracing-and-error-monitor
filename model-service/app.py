from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import json
import os
import time
from datetime import datetime
from collections import defaultdict

app = Flask(__name__)
socketio = SocketIO(app, 
                   cors_allowed_origins="*",
                   async_mode='threading',
                   logger=True,
                   engineio_logger=True,
                   ping_timeout=20,
                   ping_interval=10,
                   always_connect=True,
                   allow_upgrades=True,
                   websocket=True,
                   debug=True)

# In-memory storage for connection metrics and logs
connections = defaultdict(lambda: {
    'status': 'active',
    'latency': [],
    'error_count': 0,
    'last_seen': None,
    'request_count': 0
})

log_buffer = []
MAX_LOG_BUFFER = 1000

@socketio.on('connect')
def handle_connect():
    print('Client connected via WebSocket')
    return None

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    return None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status':'ok'})

@app.route('/metrics', methods=['GET'])
def get_metrics():
    return jsonify(dict(connections))

@app.route('/connections', methods=['POST'])
def process_connection():
    payload = request.json or {}
    source_pod = payload.get('source_pod')
    dest_pod = payload.get('dest_pod')
    latency = payload.get('latency', 0)
    status = payload.get('status', 'active')
    
    if not (source_pod and dest_pod):
        return jsonify({'error': 'Missing required fields'}), 400
        
    conn_id = f"{source_pod}->{dest_pod}"
    
    # Update connection metrics
    connections[conn_id].update({
        'status': status,
        'last_seen': datetime.now().isoformat(),
        'request_count': connections[conn_id]['request_count'] + 1
    })
    
    # Track latency
    connections[conn_id]['latency'].append(latency)
    if len(connections[conn_id]['latency']) > 100:
        connections[conn_id]['latency'] = connections[conn_id]['latency'][-100:]
        
    # Detect anomalies
    avg_latency = sum(connections[conn_id]['latency']) / len(connections[conn_id]['latency'])
    if avg_latency > 1000:  # 1 second threshold
        connections[conn_id]['status'] = 'slow'
    elif status == 'error':
        connections[conn_id]['error_count'] += 1
        connections[conn_id]['status'] = 'error'
        
    # Emit update via WebSocket
    socketio.emit('connection_update', {
        'id': conn_id,
        'metrics': connections[conn_id]
    })
    
    return jsonify({
        'id': conn_id,
        'metrics': connections[conn_id]
    })

@app.route('/logs', methods=['POST'])
def process_log():
    payload = request.json or {}
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'pod': payload.get('pod'),
        'namespace': payload.get('namespace'),
        'message': payload.get('message'),
        'level': payload.get('level', 'INFO'),
        'correlationId': payload.get('correlationId')
    }
    
    log_buffer.append(log_entry)
    if len(log_buffer) > MAX_LOG_BUFFER:
        log_buffer.pop(0)
        
    # Emit log via WebSocket
    socketio.emit('log_entry', log_entry)
    
    return jsonify(log_entry)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, allow_unsafe_werkzeug=True)
