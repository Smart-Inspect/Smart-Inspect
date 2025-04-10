FROM node:23-slim

WORKDIR /usr/src/app

COPY ./smart-inspect-server/* .
RUN npm install
RUN npm run build

WORKDIR /usr/src/app/smart-inspect-web
COPY ./smart-inspect-web/* .
RUN npm install
RUN npm run build

WORKDIR /usr/src/app
RUN cp -r ./smart-inspect-web/build ./dist
RUN mv ./dist/build ./dist/web

EXPOSE 3000 8080

CMD ["npm", "start"]