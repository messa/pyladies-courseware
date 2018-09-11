FROM python:3.7-alpine

RUN apk add build-base libffi-dev openssl-dev

COPY requirements.txt /cw_backend/
RUN pip install -r /cw_backend/requirements.txt

COPY . /cw_backend/
RUN pip install /cw_backend

RUN cw-backend --help

EXPOSE 5000

CMD ["cw-backend"]
