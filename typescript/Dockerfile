FROM node:alpine AS builder

WORKDIR /app

COPY typescript/package.json ./
RUN npm install

COPY typescript/server.ts typescript/tsconfig.json ./
RUN npm run build

FROM node:alpine

WORKDIR /app

COPY --from=builder /app/dist/server.js ./dist/server.js
COPY style.css /style.css

EXPOSE 8080

CMD ["node", "dist/server.js"]
