#!/bin/bash

echo "========================================"
echo "K-LENS Docker Startup Script"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    echo ""
    echo "Falling back to local setup..."
    ./start-local.sh
    exit 1
fi

echo "Docker is running..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Edit .env file and add your GEMINI_API_KEY"
    echo "Press Enter after editing .env file..."
    read
fi

echo "Starting K-LENS services with Docker Compose..."
docker-compose up -d

echo ""
echo "========================================"
echo "K-LENS is starting up!"
echo "========================================"
echo ""
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:3000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""
