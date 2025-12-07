#!/bin/bash
echo "========================================"
echo "K-LENS Quick Start"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f "backend-python/.env" ]; then
    if [ -f "backend-python/.env.example" ]; then
        echo "Creating .env file..."
        cp backend-python/.env.example backend-python/.env
        echo ""
        echo "IMPORTANT: Edit backend-python/.env and add your Gemini API key!"
        echo "Press Enter after editing..."
        read
    else
        echo "ERROR: backend-python/.env.example not found!"
        exit 1
    fi
fi

echo "Starting all services..."
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Docker build failed!"
    echo "Common fixes:"
    echo "1. Check Docker is running"
    echo "2. Check internet connection"
    echo "3. Try: docker system prune -a"
    exit 1
fi

echo ""
echo "Waiting for services to start (30 seconds)..."
sleep 30

echo ""
echo "========================================"
echo "Services Started!"
echo "========================================"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Neo4j Browser: http://localhost:7474"
echo ""
echo "Creating admin user..."
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123","name":"System Admin","role":"admin","department":"IT"}' 2>/dev/null

echo ""
echo ""
echo "========================================"
echo "LOGIN CREDENTIALS"
echo "========================================"
echo "Email: admin@example.com"
echo "Password: Admin@123"
echo ""
echo "Open http://localhost to login"
echo "========================================"
