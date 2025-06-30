#!/bin/bash

# ===================================================================
# Blog Application Build and Deployment Script
# ===================================================================
#
# This script automates the complete build and deployment process for
# the containerized blog application. It handles:
#
# Features:
# - Environment validation and setup
# - Docker image building for both services
# - Service orchestration with Docker Compose
# - Health checks and status monitoring
# - User-friendly progress indicators and error handling
#
# Prerequisites:
# - Docker and Docker Compose installed
# - .env file with required environment variables
# - Source code in blog-list/ and bloglist-frontend/ directories
#
# Usage:
#   ./build.sh                    # Build and deploy entire application
#   chmod +x build.sh             # Make script executable (first time)
#
# Output:
# - Backend API running on port 8081
# - Frontend web app running on port 3001
# - Docker containers with health checks enabled
# ===================================================================

# Enable strict error handling
# -e: Exit immediately if any command fails
# This ensures the script stops on errors rather than continuing
set -e

echo "🚀 Building Blog Application..."

# ===================================================================
# Environment Configuration Check
# ===================================================================
# Verify that required environment file exists before proceeding.
# If .env doesn't exist, create it from template and prompt user.
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env with your actual values before running again."
    echo "   Required variables: MONGO_URL, SECRET_KEY, VITE_API_URL"
    exit 1
fi

# Load environment variables from .env file into current shell session
# This makes variables available for Docker Compose variable substitution
source .env

# ===================================================================
# Docker Image Building Phase
# ===================================================================
# Build Docker images for both backend and frontend services.
# Images are tagged with version numbers for consistent deployment.

echo "📦 Building backend image..."
# Build Node.js/Express backend API image
# Uses multi-stage Dockerfile with security optimizations
docker build -t backend:v1 ./blog-list/

echo "📦 Building frontend image..."
# Build React frontend image with nginx web server
# Uses multi-stage build: Node.js for building, nginx for serving
docker build -t frontend:v1 ./bloglist-frontend/

# ===================================================================
# Service Deployment Phase
# ===================================================================
# Deploy all services using Docker Compose orchestration.
# This handles networking, dependencies, and health checks.

echo "🐳 Starting services with Docker Compose..."
# Start all services in detached mode (-d)
# Docker Compose will handle service dependencies and health checks
docker compose up -d

# ===================================================================
# Health Check and Verification Phase
# ===================================================================
# Wait for services to initialize and verify they're running correctly.

echo "⏳ Waiting for services to be healthy..."
# Allow time for containers to start and pass health checks
# Backend must be healthy before frontend starts (dependency)
sleep 10

# Check service health and display status
echo "🔍 Checking service status..."
# Display container status, health, and port mappings
docker compose ps

# ===================================================================
# Deployment Success Information
# ===================================================================
# Provide user with access URLs and management commands.

echo "✅ Build complete!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔌 Backend API: http://localhost:8081"
echo ""
echo "📋 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Update: ./build.sh (rebuilds and redeploys)"
