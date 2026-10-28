FROM node:22-alpine AS base

# Install OpenSSL and libc6-compat for Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Stage 1: Dependencies for build (including devDependencies)
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm ci --workspace=api

# Stage 2: Builder (generate Prisma client & compile TypeScript)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY package.json package-lock.json ./
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Stage 3: Production dependencies only
FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm ci --workspace=api --omit=dev
WORKDIR /app/apps/api
COPY apps/api/prisma ./prisma
RUN npx prisma generate

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3001

# Copy only production dependencies and compiled artifacts with non-root ownership
COPY --from=prod-deps --chown=node:node /app/node_modules /app/node_modules
COPY --from=prod-deps --chown=node:node /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist
COPY --from=builder --chown=node:node /app/apps/api/prisma ./prisma
COPY --from=builder --chown=node:node /app/apps/api/package.json ./package.json

USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]
