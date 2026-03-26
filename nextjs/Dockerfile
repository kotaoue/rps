FROM node:alpine AS builder

WORKDIR /app

COPY nextjs/package.json nextjs/package-lock.json ./
RUN npm ci

COPY nextjs/ ./
RUN npm run build

FROM node:alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]
