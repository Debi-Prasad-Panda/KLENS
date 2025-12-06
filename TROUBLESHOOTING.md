# K-LENS Troubleshooting Guide

## Quick Fixes

### 1. Services Won't Start

**Docker:**
```bash
# Stop everything
docker-compose down

# Remove old containers
docker-compose rm -f

# Rebuild and start
docker-compose up -d --build
```

**Local:**
```bash
# Kill all node processes
# Windows: taskkill /F /IM node.exe
# Linux/Mac: pkill node

# Restart
./start-local.sh
```

### 2. "Port Already in Use"

**Find what's using the port:**
```bash
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :80
lsof -i :3000
```

**Kill the process or change port in docker-compose.yml**

### 3. Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres

# If still failing, recreate
docker-compose down
docker volume rm klens_postgres_data
docker-compose up -d
```

### 4. "Module Not Found" Error

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install
```

### 5. Gemini API Not Working

**Check API key:**
```bash
# View current key
cat .env | grep GEMINI_API_KEY

# Test API key
curl https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY
```

**Get new key:** https://makersuite.google.com/app/apikey

### 6. Frontend Shows Blank Page

```bash
# Check browser console (F12)
# Common issues:

# 1. Backend not running
curl http://localhost:3000/api

# 2. CORS error - check backend logs
docker-compose logs backend

# 3. Build issue - rebuild
npm run build
```

### 7. Upload Not Working

```bash
# Check upload directory exists
docker-compose exec backend ls -la /app/uploads

# Check permissions
docker-compose exec backend chmod 777 /app/uploads

# Check file size limit in .env
MAX_FILE_SIZE=52428800  # 50MB
```

### 8. IoT Data Not Streaming

```bash
# Check MQTT broker
docker-compose logs mosquitto

# Test MQTT
docker-compose exec mosquitto mosquitto_sub -t 'sensors/#' -v

# Publish test message
docker-compose exec mosquitto mosquitto_pub -t 'sensors/test' -m '{"test":true}'
```

## Common Error Messages

### "ECONNREFUSED"
**Cause:** Service not running
**Fix:**
```bash
docker-compose ps  # Check which service is down
docker-compose up -d SERVICE_NAME
```

### "EADDRINUSE"
**Cause:** Port already in use
**Fix:** Change port or kill process using it

### "Cannot find module"
**Cause:** Dependencies not installed
**Fix:** `npm install`

### "Authentication failed"
**Cause:** Wrong credentials or expired token
**Fix:** Login again or check JWT_SECRET in .env

### "Database does not exist"
**Cause:** Database not initialized
**Fix:**
```bash
docker-compose exec postgres psql -U klens_user -c "CREATE DATABASE klens;"
```

## Performance Issues

### Slow Document Processing

**Check:**
1. Gemini API rate limits
2. File size (reduce if > 10MB)
3. Backend CPU usage: `docker stats klens-backend`

**Fix:**
```bash
# Increase backend resources in docker-compose.yml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Restart services
docker-compose restart

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### Slow Database Queries

```bash
# Check active connections
docker-compose exec postgres psql -U klens_user -d klens -c "SELECT * FROM pg_stat_activity;"

# Vacuum database
docker-compose exec postgres psql -U klens_user -d klens -c "VACUUM ANALYZE;"
```

## Docker-Specific Issues

### "Cannot connect to Docker daemon"

**Windows:**
1. Start Docker Desktop
2. Wait for "Docker Desktop is running"

**Linux:**
```bash
sudo systemctl start docker
sudo usermod -aG docker $USER
# Logout and login again
```

### "No space left on device"

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a
```

### "Container keeps restarting"

```bash
# View logs
docker-compose logs SERVICE_NAME

# Common causes:
# 1. Missing environment variables
# 2. Port conflict
# 3. Database connection failed
```

## Local Setup Issues

### PostgreSQL Won't Start

**Windows:**
- Check Services (services.msc)
- Start "postgresql-x64-16"

**Linux:**
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Redis Connection Failed

```bash
# Check if running
redis-cli ping  # Should return PONG

# Start Redis
# Windows: Run redis-server.exe
# Linux: sudo systemctl start redis
# Mac: brew services start redis
```

### Mosquitto Not Working

```bash
# Test connection
mosquitto_sub -h localhost -t test

# Start Mosquitto
# Windows: Run mosquitto.exe
# Linux: sudo systemctl start mosquitto
# Mac: brew services start mosquitto
```

## Reset Everything

### Complete Reset (Docker)

```bash
# Stop and remove everything
docker-compose down -v

# Remove all data
docker volume rm klens_postgres_data klens_redis_data klens_mosquitto_data klens_uploads

# Rebuild from scratch
docker-compose up -d --build
```

### Complete Reset (Local)

```bash
# Drop database
psql -U postgres -c "DROP DATABASE klens;"
psql -U postgres -c "CREATE DATABASE klens;"

# Clear Redis
redis-cli FLUSHALL

# Remove uploads
rm -rf backend/uploads/*

# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd .. && rm -rf node_modules && npm install
```

## Still Having Issues?

1. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Run health check:**
   ```bash
   ./check-health.sh  # or check-health.bat
   ```

3. **Verify environment:**
   ```bash
   cat .env
   cat backend/.env
   ```

4. **Check system resources:**
   ```bash
   docker stats
   ```

5. **Review documentation:**
   - [SETUP.md](./SETUP.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)
   - [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)

## Get Help

If none of these solutions work:

1. Collect logs: `docker-compose logs > logs.txt`
2. Note your OS and Docker version
3. Describe the exact error message
4. Share what you've tried

---

**Most issues are solved by:**
1. Restarting services
2. Checking environment variables
3. Ensuring all dependencies are installed
4. Verifying ports are not in use
