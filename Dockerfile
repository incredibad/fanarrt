FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache sqlite

COPY backend/package.json ./
RUN npm install --omit=dev

COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./public

RUN mkdir -p /app/data /app/downloads

EXPOSE 3579

CMD ["node", "server.js"]
