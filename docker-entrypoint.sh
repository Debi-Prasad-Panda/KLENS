#!/bin/sh
set -e

# Install dependencies if node_modules is empty or package.json changed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Execute the command passed to docker run
exec "$@"
