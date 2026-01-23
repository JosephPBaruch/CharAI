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

## Stage 2: Serve the production build with Nginx
FROM nginx:alpine

# Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE  5173

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]