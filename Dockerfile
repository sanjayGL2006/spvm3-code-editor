# ==============================================================================
# SPVM3 Code Editor (CodeForge Desktop & Web IDE) - Docker Containerfile
# Multi-stage Docker build for local preview & containerized web development
# ==============================================================================

# --- Stage 1: Build & Dependencies ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies needed for native modules
RUN apk add --no-libc6-compat python3 make g++ git

# Copy package descriptors
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy full application source code
COPY . .

# Build production web bundle (Vite)
RUN npm run build

# --- Stage 2: Web Preview & Runner Environment ---
FROM nginx:alpine-slim AS runner

LABEL maintainer="Sanjay G L <sanjaygl2006@github.com>"
LABEL description="SPVM3 CodeForge Desktop & Web Code Editor Container"
LABEL version="1.0.0"

# Copy custom Nginx web server config for SPA routing
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80 for web workspace access
EXPOSE 80

# Health check to ensure container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
