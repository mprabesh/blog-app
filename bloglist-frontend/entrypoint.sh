#!/bin/sh

# Frontend Container Entrypoint Script
# 
# This script allows environment variables to be injected at container runtime
# instead of being baked into the image at build time. This enables the same
# Docker image to be deployed across different environments (dev, staging, prod)
# with different configurations.
#
# How it works:
# 1. Replace placeholders in the built JavaScript files with actual environment variables
# 2. Start nginx to serve the updated files
#
# Environment Variables:
# - VITE_API_URL: The backend API URL (defaults to http://localhost:8081/api)

set -e

echo "=== Frontend Container Starting ==="
echo "Injecting runtime environment variables..."

# Default values
VITE_API_URL=${VITE_API_URL:-"http://localhost:8081/api"}

echo "API URL: $VITE_API_URL"

# Find all JavaScript files in the built assets and replace the placeholder
# We use a placeholder __VITE_API_URL__ that gets replaced at runtime
find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|__VITE_API_URL__|$VITE_API_URL|g" {} \;

# Also update any potential occurrences in HTML files
find /usr/share/nginx/html -name "*.html" -type f -exec sed -i "s|__VITE_API_URL__|$VITE_API_URL|g" {} \;

echo "Environment variables injected successfully"
echo "Starting nginx..."

# Start nginx in the foreground
exec nginx -g "daemon off;"
