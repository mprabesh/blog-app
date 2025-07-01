#!/bin/bash

# ===================================================================
# Standalone Frontend Build and Run Script
# ===================================================================
#
# This script builds and runs the frontend container independently,
# allowing you to easily deploy the frontend with different API
# endpoints for various environments.
#
# Features:
# - Builds optimized standalone frontend image
# - Supports runtime environment variable injection
# - Easy environment switching
# - Health check monitoring
#
# Usage:
#   ./run-frontend.sh                           # Use default settings
#   ./run-frontend.sh --api-url=https://api.example.com
#   ./run-frontend.sh --port=8080 --api-url=http://localhost:3000/api
#   ./run-frontend.sh --env=production
# ===================================================================

set -e

# Default configuration
DEFAULT_API_URL="http://localhost:8081/api"
DEFAULT_PORT="3001"
DEFAULT_ENV="development"

# Parse command line arguments
API_URL="$DEFAULT_API_URL"
PORT="$DEFAULT_PORT"
ENVIRONMENT="$DEFAULT_ENV"

while [[ $# -gt 0 ]]; do
    case $1 in
        --api-url=*)
            API_URL="${1#*=}"
            shift
            ;;
        --port=*)
            PORT="${1#*=}"
            shift
            ;;
        --env=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        --help|-h)
            echo "Standalone Frontend Build and Run Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --api-url=URL     Backend API URL (default: $DEFAULT_API_URL)"
            echo "  --port=PORT       Frontend port (default: $DEFAULT_PORT)"
            echo "  --env=ENV         Environment (default: $DEFAULT_ENV)"
            echo "  --help, -h        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0"
            echo "  $0 --api-url=https://api.example.com"
            echo "  $0 --port=8080 --api-url=http://localhost:3000/api"
            echo "  $0 --env=production --api-url=https://prod-api.example.com"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🚀 Building and Running Standalone Blog Frontend"
echo "================================================"
echo "📍 API URL: $API_URL"
echo "🔌 Port: $PORT"
echo "🌍 Environment: $ENVIRONMENT"
echo "================================================"

# Stop any existing frontend container
echo "🧹 Cleaning up existing containers..."
docker stop blog-frontend-standalone 2>/dev/null || true
docker rm blog-frontend-standalone 2>/dev/null || true

# Build the standalone frontend image
echo "🔨 Building frontend image..."
docker build -f Dockerfile.standalone -t blog-frontend:latest .

# Run the container with specified configuration
echo "🏃 Starting frontend container..."
docker run -d \
    --name blog-frontend-standalone \
    -p "$PORT:80" \
    -e VITE_API_URL="$API_URL" \
    -e NODE_ENV="$ENVIRONMENT" \
    --restart unless-stopped \
    blog-frontend:latest

# Wait a moment for container to start
echo "⏳ Waiting for container to start..."
sleep 3

# Check container status
if docker ps | grep -q blog-frontend-standalone; then
    echo "✅ Frontend container started successfully!"
    echo ""
    echo "🌐 Frontend URL: http://localhost:$PORT"
    echo "🔗 API Endpoint: $API_URL"
    echo ""
    echo "📋 Management Commands:"
    echo "   View logs:    docker logs -f blog-frontend-standalone"
    echo "   Stop:         docker stop blog-frontend-standalone"
    echo "   Remove:       docker rm blog-frontend-standalone"
    echo "   Restart:      docker restart blog-frontend-standalone"
    echo ""
    echo "🏥 Health Check:"
    echo "   curl http://localhost:$PORT"
else
    echo "❌ Failed to start frontend container"
    echo "📋 Check logs: docker logs blog-frontend-standalone"
    exit 1
fi
