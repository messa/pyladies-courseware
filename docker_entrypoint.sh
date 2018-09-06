#!/bin/bash

set -ex

mkdir -p /mongo-data

export DATA_DIR=/data

/usr/bin/mongod --dbpath /mongo-data &
( cd /frontend && npm run start & )
/venv/bin/cw-backend &
/usr/sbin/nginx -c /nginx.conf &

wait
