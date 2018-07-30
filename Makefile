nginx=nginx

run-frontend:
	cd frontend && npm install
	cd frontend && npm run dev

run-backend:
	cd backend && make run

run-nginx:
	$(nginx) -c $(PWD)/nginx.conf

run-mongod:
	mkdir -p mongo_data
	mongod --dbpath=mongo_data --bind_ip 127.0.0.1 
