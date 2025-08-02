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
BACKEND_URL=${BACKEND_URL:-"http://localhost:8081"}

echo "API URL: $VITE_API_URL"
echo "Backend URL: $BACKEND_URL"

# Find all JavaScript files in the built assets and replace the placeholder
# We use a placeholder __VITE_API_URL__ that gets replaced at runtime
echo "Replacing placeholders in JavaScript files..."
find /usr/share/nginx/html -name "*.js" -type f -exec sh -c 'echo "Processing: $1"; sed -i "s|__VITE_API_URL__|'"$VITE_API_URL"'|g" "$1"' _ {} \;

# Also update any potential occurrences in HTML files
echo "Replacing placeholders in HTML files..."
find /usr/share/nginx/html -name "*.html" -type f -exec sh -c 'echo "Processing: $1"; sed -i "s|__VITE_API_URL__|'"$VITE_API_URL"'|g" "$1"' _ {} \;

# Verify replacement worked
echo "Verifying placeholder replacement..."
if find /usr/share/nginx/html -name "*.js" -type f -exec grep -l "__VITE_API_URL__" {} \; | head -1; then
    echo "WARNING: Some placeholders were not replaced!"
else
    echo "All placeholders successfully replaced with: $VITE_API_URL"
fi

# Replace backend URL in nginx configuration
sed -i "s|__BACKEND_URL__|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf

echo "Environment variables injected successfully"
echo "Starting nginx..."

# Start nginx in the foreground
exec nginx -g "daemon off;"
