# Troubleshooting Guide

## 403 Forbidden Error During Docker Build

**Problem**: `403 Forbidden [IP: 20.2.0.1 8090]`

**Cause**: Network/proxy blocking Docker from downloading packages

**Solutions**:

### Option 1: Configure Docker Proxy (If behind corporate proxy)
1. Open Docker Desktop
2. Settings → Resources → Proxies
3. Enable "Manual proxy configuration"
4. Add your proxy details
5. Restart Docker Desktop

### Option 2: Use Mobile Hotspot
1. Connect to mobile hotspot
2. Run `start.bat` again

### Option 3: Pull Pre-built Images
```bash
docker pull python:3.11-slim
docker pull node:20-alpine
docker pull nginx:alpine
docker pull pgvector/pgvector:pg16
docker pull redis:7-alpine
docker pull neo4j:5-community
```

Then run `start.bat`

### Option 4: Use Pre-built Backend Image
If you have the backend image:
```bash
docker load -i klens-backend.tar
docker-compose -f docker-compose.python.yml up -d
```

## Missing .env.example File

**Problem**: "The system cannot find the file specified"

**Solution**: Ensure you cloned the full repository:
```bash
git clone <repo-url>
cd KLENS
dir backend-python\.env.example
```

If missing, create it manually:
```
# backend-python/.env.example
DATABASE_URL=postgresql://klens_user:klens_secure_password_2024@postgres:5432/klens
REDIS_URL=redis://redis:6379
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=klens_neo4j_2024
JWT_SECRET=klens_jwt_secret_key_change_in_production_min_32_chars
GEMINI_API_KEY=your_key_here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

## Services Won't Start

**Check Docker is running**:
```bash
docker ps
```

**Check logs**:
```bash
docker-compose -f docker-compose.python.yml logs backend
```

**Fresh start**:
```bash
stop.bat
docker system prune -a
start.bat
```

## Login Issues

**Problem**: "Invalid email or password"

**Solution**: 
1. Ensure backend is running: http://localhost:8000/health
2. Create admin manually: http://localhost:8000/docs
3. Use correct credentials:
   - Email: `admin@example.com`
   - Password: `Admin@123`

## Port Already in Use

**Problem**: Port 80, 8000, 5432, etc. already in use

**Solution**:
```bash
# Find what's using the port
netstat -ano | findstr :80
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

Or change ports in `docker-compose.python.yml`
