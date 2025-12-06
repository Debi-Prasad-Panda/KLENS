#!/bin/bash

echo "========================================"
echo "K-LENS Local Startup Script"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env file..."
    cp .env.local.example backend/.env
    echo ""
    echo "IMPORTANT: Edit backend/.env and add your GEMINI_API_KEY"
    echo "Press Enter after editing..."
    read
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

echo "Node.js found..."
echo ""

# Install backend dependencies
if [ ! -d backend/node_modules ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Install frontend dependencies
if [ ! -d node_modules ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo ""
echo "========================================"
echo "Starting K-LENS locally..."
echo "========================================"
echo ""
echo "NOTE: Make sure PostgreSQL, Redis, and Mosquitto are running locally"
echo ""

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait 3 seconds
sleep 3

# Start frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
