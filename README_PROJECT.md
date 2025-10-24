## How to build images locally (example)
# Build auth-service
cd auth-service
docker build -t auth-service:latest .
cd ..
# Build model-service
cd model-service
docker build -t model-service:latest .
cd ..
# Build sensor-simulator
cd sensor-simulator
docker build -t sensor-simulator:latest .
cd ..
# Build nginx-proxy
cd nginx-proxy
docker build -t nginx-proxy:latest .
cd ..
# UI: use 'npm install' and 'npm run build' or containerize as needed
