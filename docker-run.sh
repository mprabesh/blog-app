#!/bin/bash

# Docker Run Setup Script for Blog App
set -e

echo "🚀 Setting up Blog Application with Docker Run..."

# Load environment variables
if [ -f .env ]; then
    source .env
    echo "✅ Environment variables loaded from .env"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Create network if it doesn't exist
echo "🌐 Creating Docker network..."
docker network create blog-app-network 2>/dev/null || echo "Network already exists"

# Stop and remove existing containers if they exist
echo "🧹 Cleaning up existing containers..."
docker stop blog-app-backend blog-app-frontend 2>/dev/null || true
docker rm blog-app-backend blog-app-frontend 2>/dev/null || true

# Run backend container
echo "🔧 Starting backend container..."
docker run -d \
  --name blog-app-backend \
  --network blog-app-network \
  -p 8081:8081 \
  -e PROD_PORT="${PROD_PORT}" \
  -e DEV_PORT="${DEV_PORT}" \
  -e TEST_PORT="${TEST_PORT}" \
  -e MONGO_URL="${MONGO_URL}" \
  -e TEST_MONGO_URL="${TEST_MONGO_URL}" \
  -e SECRET_KEY="${SECRET_KEY}" \
  --restart unless-stopped \
  backend:v1

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be healthy..."
sleep 15

# Check backend health
if curl -f http://localhost:8081/api/ping > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Run frontend container
echo "🎨 Starting frontend container..."
docker run -d \
  --name blog-app-frontend \
  --network blog-app-network \
  -p 3001:80 \
  -e VITE_API_URL="${VITE_API_URL}" \
  --restart unless-stopped \
  frontend:v1

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 10

# Check frontend health
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo ""
echo "🎉 Blog Application is running!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔌 Backend API: http://localhost:8081"
echo ""
echo "📊 Container Status:"
docker ps --filter "name=blog-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📝 To view logs: docker logs blog-app-backend or docker logs blog-app-frontend"
echo "🛑 To stop: docker stop blog-app-backend blog-app-frontend"
echo "🗑️  To cleanup: docker rm blog-app-backend blog-app-frontend && docker network rm blog-app-network"
