#!/bin/bash

set -ex

mkdir -p /mongo-data

export COURSES_FILE=/data/courses.yaml
export BACKEND_PROXY=1

/usr/bin/mongod --dbpath /mongo-data &
( cd /frontend && npm run start & )
/venv/bin/cw-backend &

wait
