FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Install dependencies and build
RUN npm install
RUN npm run prisma:generate --workspace=apps/backend
RUN npm run build --workspace=apps/backend

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
COPY packages/shared ./packages/shared
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]
