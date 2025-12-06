# K-LENS Production Deployment Guide

## Prerequisites

- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+
- MQTT Broker (Mosquitto)
- Node.js 20+
- Google Gemini API Key

## Quick Start with Docker

### 1. Environment Setup

Create `.env` file in root:

```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Start All Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Mosquitto MQTT (port 1883)
- Backend API (port 3000)
- Frontend (port 80)

### 3. Initialize Database

```bash
docker-compose exec backend npm run migrate
```

### 4. Create Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@klens.railway.in",
    "password": "SecurePassword123!",
    "name": "System Admin",
    "role": "admin",
    "department": "IT"
  }'
```

## Manual Installation

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend Setup

```bash
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

### Database Setup

```bash
# Install PostgreSQL
sudo apt install postgresql-16

# Create database
sudo -u postgres psql
CREATE DATABASE klens;
CREATE USER klens_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE klens TO klens_user;
```

### Redis Setup

```bash
sudo apt install redis-server
sudo systemctl start redis
```

### MQTT Setup

```bash
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
```

## Production Configuration

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name klens.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/klens.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/klens.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d klens.yourdomain.com
```

### Systemd Service

Create `/etc/systemd/system/klens-backend.service`:

```ini
[Unit]
Description=K-LENS Backend
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=klens
WorkingDirectory=/opt/klens/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable klens-backend
sudo systemctl start klens-backend
```

## Monitoring & Logging

### PM2 Process Manager

```bash
npm install -g pm2
cd backend
pm2 start dist/server.js --name klens-backend
pm2 startup
pm2 save
```

### Log Rotation

```bash
sudo nano /etc/logrotate.d/klens
```

```
/var/log/klens/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 klens klens
    sharedscripts
}
```

## Backup Strategy

### Database Backup

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backup/klens"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U klens_user klens | gzip > $BACKUP_DIR/klens_$DATE.sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### File Backup

```bash
rsync -avz /opt/klens/uploads /backup/klens/uploads/
```

## Security Hardening

### Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### PostgreSQL Security

```bash
# Edit /etc/postgresql/16/main/pg_hba.conf
host    klens    klens_user    127.0.0.1/32    scram-sha-256
```

### Environment Variables

Never commit `.env` files. Use secrets management:

```bash
# AWS Secrets Manager
aws secretsmanager create-secret --name klens/prod --secret-string file://.env

# Retrieve in production
aws secretsmanager get-secret-value --secret-id klens/prod --query SecretString --output text > .env
```

## Performance Optimization

### PostgreSQL Tuning

```sql
-- /etc/postgresql/16/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Redis Configuration

```conf
# /etc/redis/redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
```

### Node.js Clustering

```javascript
// backend/src/cluster.ts
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  import('./server.js');
}
```

## Scaling

### Horizontal Scaling

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: klens-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: klens-backend
  template:
    metadata:
      labels:
        app: klens-backend
    spec:
      containers:
      - name: backend
        image: klens/backend:latest
        ports:
        - containerPort: 3000
```

### Load Balancing

```nginx
upstream klens_backend {
    least_conn;
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}
```

## Troubleshooting

### Check Service Status

```bash
docker-compose ps
systemctl status klens-backend
journalctl -u klens-backend -f
```

### Database Connection Issues

```bash
# Test connection
psql -U klens_user -h localhost -d klens

# Check connections
SELECT * FROM pg_stat_activity WHERE datname = 'klens';
```

### MQTT Issues

```bash
# Test MQTT
mosquitto_sub -h localhost -t 'sensors/#' -v
mosquitto_pub -h localhost -t 'sensors/test' -m '{"test": true}'
```

## Maintenance

### Update Application

```bash
git pull origin main
docker-compose build
docker-compose up -d
```

### Database Migration

```bash
docker-compose exec backend npm run migrate
```

### Clear Cache

```bash
docker-compose exec redis redis-cli FLUSHALL
```

## Support

For production support:
- Email: support@klens.railway.in
- Docs: https://docs.klens.railway.in
- Status: https://status.klens.railway.in
