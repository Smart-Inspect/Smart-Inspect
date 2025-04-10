FROM node:23-slim

WORKDIR /usr/src/app

COPY ./smart-inspect-server/* .
RUN npm install
RUN npm run build

COPY ./smart-inspect-web/* ./smart-inspect-web/
RUN npm install --prefix ./smart-inspect-web/
RUN npm run build --prefix ./smart-inspect-web/
RUN cp -r ./smart-inspect-web/build ./dist
RUN mv ./dist/build ./dist/web
RUN rm -rf ./smart-inspect-web

EXPOSE 3000 8080

CMD ["npm", "start"]