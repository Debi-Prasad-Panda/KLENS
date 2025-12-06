# K-LENS Setup Guide

## Option 1: Docker Setup (Recommended)

### Prerequisites
- Docker Desktop installed and running
- 4GB RAM minimum
- 10GB free disk space

### Windows

1. **Double-click** `start-docker.bat`
2. Edit `.env` file and add your `GEMINI_API_KEY`
3. Press any key to continue
4. Wait for services to start (2-3 minutes)
5. Open browser: http://localhost

### Linux/Mac

```bash
chmod +x start-docker.sh
./start-docker.sh
```

### Manual Docker Commands

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add GEMINI_API_KEY
nano .env  # or use any text editor

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Verify Docker Setup

```bash
# Check running containers
docker-compose ps

# Should show:
# klens-postgres    (healthy)
# klens-redis       (healthy)
# klens-mosquitto   (running)
# klens-backend     (running)
# klens-frontend    (running)
```

---

## Option 2: Local Setup (Without Docker)

### Prerequisites

#### Windows
1. **PostgreSQL 16**: Download from https://www.postgresql.org/download/windows/
2. **Redis**: Download from https://github.com/microsoftarchive/redis/releases
3. **Mosquitto**: Download from https://mosquitto.org/download/
4. **Node.js 20+**: Download from https://nodejs.org

#### Linux (Ubuntu/Debian)
```bash
# PostgreSQL
sudo apt update
sudo apt install postgresql-16

# Redis
sudo apt install redis-server

# Mosquitto
sudo apt install mosquitto mosquitto-clients

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

#### Mac
```bash
# Using Homebrew
brew install postgresql@16 redis mosquitto node@20
```

### Setup Steps

#### 1. Configure PostgreSQL

```bash
# Start PostgreSQL
# Windows: Start from Services
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql

# Create database
psql -U postgres
CREATE DATABASE klens;
CREATE USER klens_user WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE klens TO klens_user;
\q
```

#### 2. Start Services

**Windows:**
```bash
# Start Redis (run redis-server.exe)
# Start Mosquitto (run mosquitto.exe)
```

**Linux:**
```bash
sudo systemctl start redis
sudo systemctl start mosquitto
```

**Mac:**
```bash
brew services start redis
brew services start mosquitto
```

#### 3. Run K-LENS

**Windows:** Double-click `start-local.bat`

**Linux/Mac:**
```bash
chmod +x start-local.sh
./start-local.sh
```

---

## Troubleshooting

### Docker Issues

**Problem:** "Docker is not running"
```bash
# Windows: Start Docker Desktop from Start Menu
# Linux: sudo systemctl start docker
# Mac: Open Docker Desktop app
```

**Problem:** "Port already in use"
```bash
# Stop conflicting services
docker-compose down
# Or change ports in docker-compose.yml
```

**Problem:** "Cannot connect to database"
```bash
# Check if postgres is healthy
docker-compose ps
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Local Setup Issues

**Problem:** "PostgreSQL connection refused"
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Linux: sudo systemctl status postgresql
# Mac: brew services list

# Check connection
psql -U postgres -h localhost
```

**Problem:** "Redis connection refused"
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

**Problem:** "MQTT connection failed"
```bash
# Test MQTT
mosquitto_sub -h localhost -t test
# In another terminal:
mosquitto_pub -h localhost -t test -m "hello"
```

**Problem:** "Module not found"
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ..
rm -rf node_modules package-lock.json
npm install
```

---

## First Time Setup

### 1. Create Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@klens.local",
    "password": "Admin@123",
    "name": "System Admin",
    "role": "admin",
    "department": "IT"
  }'
```

### 2. Login

Open http://localhost and login with:
- Email: admin@klens.local
- Password: Admin@123

### 3. Test Upload

1. Go to "Upload Documents"
2. Drag and drop a PDF file
3. Watch the processing stages
4. View analyzed document in Dashboard

---

## Stopping Services

### Docker
```bash
docker-compose down
```

### Local
Press `Ctrl+C` in terminal windows

---

## Updating

### Docker
```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Local
```bash
git pull
cd backend && npm install && cd ..
npm install
```

---

## Getting Help

- Check logs: `docker-compose logs -f backend`
- Database issues: `docker-compose exec postgres psql -U klens_user -d klens`
- Redis issues: `docker-compose exec redis redis-cli`
- Backend API: http://localhost:3000/api
- Frontend: http://localhost

---

## Quick Reference

| Service | Docker Port | Local Port |
|---------|-------------|------------|
| Frontend | 80 | 8080 |
| Backend API | 3000 | 3000 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| MQTT | 1883 | 1883 |

**Default Credentials:**
- Database: klens_user / klens_secure_password_2024
- Admin: admin@klens.local / Admin@123
