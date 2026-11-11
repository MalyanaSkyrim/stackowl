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
# openssl required for Prisma
RUN apk add --no-cache libc6-compat openssl && apk update

# Set working directory
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune --scope=@starter/api --docker


#######################
# Installer stage
#######################
FROM base AS installer

# libc6-compat required for Turborepo
# openssl required for Prisma
RUN apk add --no-cache libc6-compat openssl && apk update

WORKDIR /app

# Environment variables for building the API
ENV CI=true
ENV SKIP_ENV_VALIDATION=true
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Copy .npmrc so pnpm respects node-linker=hoisted during install.
# Without this, transitive deps are buried in .pnpm/ and not resolvable by
# Node at runtime.
COPY .gitignore .gitignore
COPY .npmrc .npmrc
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm config set network-timeout 1000000 && pnpm install --frozen-lockfile

# Get the output from the builder stage
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Remote caching
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

# Build the project and its dependencies
RUN pnpm turbo run build --filter=@starter/api...

#######################
# Runner stage
#######################
FROM base AS runner

# libc6-compat required for Turborepo
# openssl required for Prisma
RUN apk add --no-cache libc6-compat openssl && apk update

WORKDIR /app

# Get the output from the installer stage
COPY --from=installer /app .

# Don't run production as root
RUN addgroup --system --gid 1001 app && \
  adduser --system --uid 1001 app
USER app

CMD ["node", "apps/api/build/app.js"]