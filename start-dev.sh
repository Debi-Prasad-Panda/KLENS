#!/bin/bash
echo "========================================"
echo "K-LENS Development Mode (Live Reload)"
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
    fi
fi

echo "Starting services with live reload..."
echo ""
echo "Changes to code will automatically reload!"
echo "- Backend: Python files in backend-python/"
echo "- Frontend: React files in src/"
echo ""
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
