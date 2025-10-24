from flask import Flask, request, jsonify
import jwt, datetime
from functools import wraps

SECRET = 'supersecretkey_for_demo'  # change for production!

app = Flask(__name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split('Bearer ')[-1]
        if not token:
            return jsonify({'message':'Token is missing'}), 401
        try:
            data = jwt.decode(token, SECRET, algorithms=['HS256'])
            request.user = data['sub']
        except Exception as e:
            return jsonify({'message':'Token is invalid', 'error': str(e)}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/login', methods=['POST'])
def login():
    creds = request.json or {}
    username = creds.get('username')
    password = creds.get('password')
    # Demo acceptance: any username/password; in real app validate credentials.
    if not username or not password:
        return jsonify({'message':'username & password required'}), 400
    token = jwt.encode({'sub': username, 'iat': datetime.datetime.utcnow().timestamp(), 'exp': (datetime.datetime.utcnow() + datetime.timedelta(hours=8)).timestamp()}, SECRET, algorithm='HS256')
    return jsonify({'token': token})

@app.route('/whoami', methods=['GET'])
@token_required
def whoami():
    return jsonify({'user': request.user})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
