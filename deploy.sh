#!/bin/bash

# Abu Kartona Deployment Script
# This script helps deploy the application to different platforms

set -e

echo "🚀 Abu Kartona Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to deploy to Netlify
deploy_netlify() {
    echo "📦 Deploying to Netlify..."
    
    # Build frontend
    echo "🔨 Building frontend..."
    cd frontend
    npm run build
    
    echo "✅ Frontend built successfully!"
    echo "📝 Push to GitHub and connect to Netlify to complete deployment"
    echo "🔗 Don't forget to set environment variables in Netlify dashboard"
    
    cd ..
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "📦 Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "📥 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "✅ Deployed to Vercel!"
    echo "📝 Set environment variables in Vercel dashboard"
}

# Function to deploy with Docker
deploy_docker() {
    echo "📦 Deploying with Docker..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Error: Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Error: Docker Compose is not installed"
        exit 1
    fi
    
    echo "🔨 Building Docker images..."
    docker-compose build
    
    echo "🚀 Starting containers..."
    docker-compose up -d
    
    echo "✅ Docker deployment complete!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:5001"
}

# Function to setup environment files
setup_env() {
    echo "⚙️ Setting up environment files..."
    
    # Frontend env
    if [ ! -f "frontend/.env.production" ]; then
        echo "📝 Creating frontend .env.production..."
        cp frontend/.env.production frontend/.env.local
        echo "✅ Frontend .env.local created"
    fi
    
    # Backend env
    if [ ! -f "backend/.env.production" ]; then
        echo "📝 Creating backend .env.production..."
        cp backend/.env.production backend/.env
        echo "✅ Backend .env created"
    fi
    
    echo "⚠️ Please update the environment variables with your actual values"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  netlify    Deploy to Netlify (frontend only)"
    echo "  vercel     Deploy to Vercel (full-stack)"
    echo "  docker     Deploy with Docker (local)"
    echo "  env        Setup environment files"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 netlify"
    echo "  $0 vercel"
    echo "  $0 docker"
    echo "  $0 env"
}

# Main script logic
case "$1" in
    "netlify")
        deploy_netlify
        ;;
    "vercel")
        deploy_vercel
        ;;
    "docker")
        deploy_docker
        ;;
    "env")
        setup_env
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac

echo "🎉 Deployment process completed!"
