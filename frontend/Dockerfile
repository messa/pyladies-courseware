FROM node:10-alpine

ENV NDOE_ENV=production
WORKDIR /cw_frontend

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
