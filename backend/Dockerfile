# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --production

COPY --from=builder /app/src ./src
COPY --from=builder /app/uploads ./uploads

EXPOSE 5000

CMD ["node", "src/server.js"]
