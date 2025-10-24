# TARP - C2 Attack Prevention in Kubernetes (Full Project)

This repository contains a self-contained implementation of a Kubernetes-based C2 (Command & Control) attack prevention demo. It's designed to run as containerized microservices and to be deployed on Kubernetes. The project is intentionally simple and educational — it demonstrates detection (model-service), simulation (sensor-simulator), auth, an nginx proxy, and a minimal React UI that can generate Kubernetes NetworkPolicy YAML.

## Structure
See the `tree /F` layout shared in the project prompt.

## Quick local run (developer)
Each service has a Dockerfile. To run locally (without Kubernetes), you can build and run each container. Example for model-service:
```bash
cd model-service
docker build -t tarp-model-service .
docker run -p 5001:5001 tarp-model-service
```

## Kubernetes manifests
Kubernetes manifests are in the `k8s/` folder. They include Deployments and Services for each microservice and a sample NetworkPolicy (`network-policy.yaml`).

## Notes
- The model-service contains a very simple rule-based detection for outbound connections to known malicious domains (simulated C2 list).
- The sensor-simulator will send sample "outbound connection" events to the model-service to simulate C2 activity.
- The UI contains a `C2PolicyGenerator.jsx` component which generates a NetworkPolicy YAML snippet for blocking outbound traffic to listed domains (conceptual — NetworkPolicy works with IPs and CIDRs; in a real system you'd resolve domains to IPs or use egress proxies).
- No external cloud or paid hardware is required to run this demo.



# Build all containers directly from root directory
docker build -t tarp-model:latest .\model-service
docker build -t tarp-simulator:latest .\sensor-simulator
docker build -t tarp-ui:latest .\ui

# Start Minikube if not already running
minikube start

# Set docker to use minikube's docker daemon
minikube docker-env | Invoke-Expression

# Rebuild images in minikube's context (no need for cd commands)
docker build -t tarp-model:latest .\model-service
docker build -t tarp-simulator:latest .\sensor-simulator
docker build -t tarp-ui:latest .\ui

# Apply Kubernetes configurations
kubectl apply -f k8s/

# Get service URLs
Write-Host "Access URLs:"
minikube service ui --url
minikube service model-service --url





Set-Location 'C:\Users\visha\Desktop\TARP-3'; docker build -t tarp-model:latest .\model-service; docker build -t tarp-simulator:latest .\sensor-simulator; docker build -t tarp-ui:latest .\ui; minikube start; minikube -p minikube docker-env --shell powershell | Invoke-Expression; docker build -t tarp-model:latest .\model-service; docker build -t tarp-simulator:latest .\sensor-simulator; docker build -t tarp-ui:latest .\ui; kubectl apply -f .\k8s\; kubectl get pods -o wide

