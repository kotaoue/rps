FROM node:alpine AS builder

WORKDIR /app

COPY astro/package.json astro/package-lock.json ./
RUN npm ci

COPY astro/ ./
RUN npm run build

FROM node:alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
