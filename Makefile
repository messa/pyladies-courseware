run-frontend:
	cd frontend && npm install
	cd frontend && npm run dev

run-backend:
	cd backend && make run

run-mongod:
	mkdir -p mongo_data
	mongod --dbpath=mongo_data --bind_ip 127.0.0.1

run-frontend-in-docker:
	docker run --rm -it \
		-v $(PWD)/frontend:/src \
		-w /src \
		--network=host \
		node:16 \
		bash -c "npm install; npm run dev"

run-mongod-in-docker:
	mkdir -p mongo_data
	docker run --rm -it \
		-v $(PWD)/mongo_data:/data/db \
		--network=host \
		mongo:4-xenial
