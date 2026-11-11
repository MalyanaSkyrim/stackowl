# syntax=docker/dockerfile:1

# Pin Node.js version
ARG NODE_VERSION="24"

# Pin Alpine version
ARG ALPINE_VERSION="3.21"

# Pin pnpm version
ARG PNPM_VERSION="10.10.0"


# Base image
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

# Install pnpm globally using npm and configure it
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@${PNPM_VERSION} && \
  pnpm config set store-dir /pnpm/store


#######################
# Builder stage
#######################
FROM base AS builder

# libc6-compat required for Turborepo
RUN apk add --no-cache libc6-compat && apk update

WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune --scope=@starter/web --docker


# Installer stage
#######################
FROM base AS installer

# libc6-compat required for Turborepo
# openssl required for Prisma
# python3, make and g++ are required for native binaries compilation
RUN apk add --no-cache libc6-compat openssl python3 make g++ && apk update

WORKDIR /app

# Environment variables for building Next.js
ENV CI=true
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_TELEMETRY_DISABLED=1

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY .npmrc .npmrc
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm config set network-timeout 1000000 && pnpm install --frozen-lockfile

# Get the full source from the pruned workspace
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Create empty placeholders to satisfy Next.js/dotenv stat calls during build.
# This prevents ENOENT errors without needing the actual .env file.
RUN touch .env apps/web/.env

# Remote caching
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

# Build the project and its dependencies via Turbo
RUN pnpm turbo run build --filter=@starter/web...


#######################
# Runner stage
#######################
FROM base AS runner

# openssl required for Prisma at runtime
RUN apk add --no-cache openssl && apk update

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# next start uses PORT env var
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Don't run production as root
RUN addgroup --system --gid 1001 app && \
  adduser --system --uid 1001 app

# Copy the standalone output — this is a self-contained Node server
COPY --from=installer --chown=app:app /app/apps/web/.next/standalone ./
# Copy static assets (CSS, JS chunks, images)
COPY --from=installer --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
# Copy the public directory (fonts, icons, etc.)
COPY --from=installer --chown=app:app /app/apps/web/public ./apps/web/public

USER app

EXPOSE 3000

# next start is replaced by the server.js emitted by standalone output
CMD ["node", "apps/web/server.js"]
