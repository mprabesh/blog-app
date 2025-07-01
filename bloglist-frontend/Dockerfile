# Multi-stage build for React Frontend (Public Subnet)
# Stage 1: Build the React application
FROM node:20-alpine AS builder

LABEL maintainer="blog-app"
LABEL service="frontend"
LABEL tier="public"

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY src/ ./src/
COPY index.html ./
COPY vite.config.js ./
COPY index.css ./

# Build the application
# Note: The API URL will be injected at runtime via entrypoint script
RUN npm run build

# Stage 2: Production nginx server with runtime environment variable injection
FROM nginx:1.25-alpine

# Install security updates and curl for health checks
RUN apk update && apk upgrade && apk add --no-cache curl

# Create nginx user and group
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001 -G nginx-app

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script for runtime environment variable injection
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Make entrypoint script executable and set proper permissions
RUN chmod +x /usr/local/bin/entrypoint.sh && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    chown -R nginx-app:nginx-app /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid && \
    chown nginx-app:nginx-app /usr/local/bin/entrypoint.sh

# Switch to non-root user
USER nginx-app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Use entrypoint script to inject environment variables at runtime
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
