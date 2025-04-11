FROM node:23-slim AS frontend-builder

WORKDIR /usr/src/app/frontend

COPY ./smart-inspect-web/package*.json ./
RUN npm install
COPY ./smart-inspect-web ./
RUN npm run build


FROM node:23-slim AS backend-builder

WORKDIR /usr/src/app/backend

COPY ./smart-inspect-server/package*.json ./
RUN npm install
COPY ./smart-inspect-server ./
RUN npm run build

FROM node:23-slim AS production

WORKDIR /usr/src/app

# Copy backend and built frontend
COPY --from=backend-builder /usr/src/app/backend ./
COPY --from=frontend-builder /usr/src/app/frontend/build ./dist/web
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]