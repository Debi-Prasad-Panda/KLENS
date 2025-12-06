#!/bin/bash

echo "Checking K-LENS Health..."
echo ""

echo "[1/5] Checking Frontend..."
if curl -s http://localhost > /dev/null 2>&1; then
    echo "✓ Frontend: OK"
else
    echo "✗ Frontend: DOWN"
fi

echo "[2/5] Checking Backend API..."
if curl -s http://localhost:3000/api > /dev/null 2>&1; then
    echo "✓ Backend API: OK"
else
    echo "✗ Backend API: DOWN"
fi

echo "[3/5] Checking PostgreSQL..."
if docker exec klens-postgres pg_isready -U klens_user > /dev/null 2>&1; then
    echo "✓ PostgreSQL: OK"
else
    echo "✗ PostgreSQL: DOWN"
fi

echo "[4/5] Checking Redis..."
if docker exec klens-redis redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis: OK"
else
    echo "✗ Redis: DOWN"
fi

echo "[5/5] Checking MQTT..."
if docker ps | grep klens-mosquitto > /dev/null 2>&1; then
    echo "✓ MQTT: OK"
else
    echo "✗ MQTT: DOWN"
fi

echo ""
echo "Health check complete!"
