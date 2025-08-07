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
placeholder_files=$(find /usr/share/nginx/html -name "*.js" -type f -exec grep -l "__VITE_API_URL__" {} \; 2>/dev/null | head -1)
if [ -n "$placeholder_files" ]; then
    echo "WARNING: Some placeholders were not replaced in: $placeholder_files"
    echo "Showing unreplaced content:"
    grep -n "__VITE_API_URL__" "$placeholder_files" | head -3
else
    echo "All placeholders successfully replaced with: $VITE_API_URL"
fi

# Debug: Show what files we're actually working with
echo "Debug: JavaScript files found:"
find /usr/share/nginx/html -name "*.js" -type f | head -3

# Debug: Show a sample of the actual content
echo "Debug: Sample content from main JS file:"
main_js=$(find /usr/share/nginx/html -name "*.js" -type f | head -1)
if [ -n "$main_js" ]; then
    echo "File: $main_js"
    head -c 500 "$main_js" | tr '\n' ' ' | sed 's/.\{80\}/&\n/g' | head -5
fi

# Show what's actually in the JavaScript files for debugging
echo "Checking actual API URL in built files..."
api_url_lines=$(grep -r "API_BASE_URL.*=" /usr/share/nginx/html/*.js 2>/dev/null | head -3)
if [ -n "$api_url_lines" ]; then
    echo "Found API_BASE_URL assignments:"
    echo "$api_url_lines"
else
    echo "No API_BASE_URL assignments found - checking for any API URL patterns..."
    echo "Searching for all URLs in JS files:"
    grep -r "http.*api\|localhost.*api\|blog-backend" /usr/share/nginx/html/*.js 2>/dev/null | head -5 || echo "No API URL patterns found"
    echo "Searching for any string containing 'api':"
    grep -ri "api" /usr/share/nginx/html/*.js 2>/dev/null | head -3 || echo "No 'api' strings found"
fi

# Replace backend URL in nginx configuration
sed -i "s|__BACKEND_URL__|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf

echo "Environment variables injected successfully"
echo "Starting nginx..."

# Start nginx in the foreground
exec nginx -g "daemon off;"
