#!/bin/bash

echo "========================================"
echo "K-LENS Development Mode (Hot Reload)"
echo "========================================"
echo ""

if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    exit 1
fi

echo "Starting K-LENS in development mode..."
echo "Changes will auto-reload without rebuild!"
echo ""

docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "========================================"
echo "K-LENS Development Server Running!"
echo "========================================"
echo ""
echo "Frontend: http://localhost"
echo "Backend: http://localhost:3000"
echo ""
echo "Changes will auto-reload!"
echo "To view logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "To stop: docker-compose -f docker-compose.dev.yml down"
echo ""
