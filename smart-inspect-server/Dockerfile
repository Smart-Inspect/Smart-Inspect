FROM node:23-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000 8080

CMD ["npm", "start"]