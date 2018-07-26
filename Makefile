nginx=nginx

run-frontend:
	cd frontend && npm install
	cd frontend && npm run dev

run-backend:
	cd backend && make run

run-nginx:
	$(nginx) -c $(PWD)/nginx.conf
