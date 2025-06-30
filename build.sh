#!/bin/bash

# Blog App Build and Deploy Script
set -e

echo "🚀 Building Blog Application..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env with your actual values before running again."
    exit 1
fi

# Load environment variables
source .env

echo "📦 Building backend image..."
docker build -t backend:v1 ./blog-list/

echo "📦 Building frontend image..."
docker build -t frontend:v1 ./bloglist-frontend/

echo "🐳 Starting services with Docker Compose..."
docker compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🔍 Checking service status..."
docker compose ps

echo "✅ Build complete!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔌 Backend API: http://localhost:8081"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
