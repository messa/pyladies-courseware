# This Dockerfile creates all-in-one image - for now.sh for example.
# It's pretty messy - it's for demonstration purposes only.
# Real deployment should have separate images for each component - frontend and backend.

FROM node:10-stretch AS build_frontend
COPY frontend/package.json frontend/package-lock.json /frontend/
RUN cd /frontend && npm install
COPY frontend /frontend
RUN cd /frontend && npm run build

FROM python:3.7-stretch AS build_backend
RUN python3 -m venv /venv
RUN /venv/bin/pip install --upgrade pip wheel
COPY backend/requirements.txt /backend/
RUN /venv/bin/pip install -r /backend/requirements.txt
COPY backend /backend/
RUN /venv/bin/pip install /backend

FROM debian:stretch
ENV DEBIAN_FRONTEND=noninteractive ALLOW_DEV_LOGIN=1
RUN apt-get update
RUN apt-get install -y nginx-light
COPY --from=mongo:3.6-jessie /usr/bin/mongod /usr/bin/
COPY --from=mongo:3.6-jessie /usr/lib /usr/lib
COPY --from=build_frontend /usr/local /usr/local
COPY --from=build_frontend /frontend /frontend
COPY --from=build_backend /usr/local /usr/local
COPY --from=build_backend /usr/lib /usr/lib
COPY --from=build_backend /venv /venv
COPY courses /data/courses
RUN ldconfig
COPY nginx.conf docker_entrypoint.sh /
EXPOSE 8000
CMD ["/docker_entrypoint.sh"]
