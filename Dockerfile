FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache sqlite

COPY backend/package.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ && npm install --omit=dev && apk del .build-deps

COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./public

RUN mkdir -p /app/data /app/downloads

EXPOSE 3579

CMD ["node", "server.js"]
