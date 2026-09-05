FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm install
RUN npm run build --workspace=apps/web

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

EXPOSE 3000

CMD ["node_modules/.bin/next", "start", "apps/web", "-p", "3000"]
