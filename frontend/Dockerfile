## Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

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

# Static assets
COPY --from=builder /app/dist /srv

# Expose HTTP port
EXPOSE 80

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]