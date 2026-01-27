## Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments with defaults
ARG VITE_API_URL="http://localhost/api"
ARG VITE_APP_URL="http://localhost"

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL

# Install dependencies with lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source and build
COPY . .
RUN npm run build

## Stage 2: Serve the production build with Caddy
FROM caddy:alpine

# Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Default backend target; can be overridden at runtime
ENV BACKEND_HOST=host.docker.internal \
	BACKEND_PORT=8000

# Static assets
COPY --from=builder /app/dist /srv

# Expose HTTP port
EXPOSE 80

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]