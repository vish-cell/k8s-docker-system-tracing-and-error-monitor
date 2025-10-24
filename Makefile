.PHONY: all build images up down k8s-apply k8s-delete clean

all: build up

build: images

images:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

k8s-apply:
	kubectl apply -f k8s/

k8s-delete:
	kubectl delete -f k8s/

clean:
	docker compose down --rmi all --volumes --remove-orphans
	rm -rf ui/node_modules ui/build
