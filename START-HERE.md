# 🚀 START HERE - K-LENS Quick Start

## ⚡ Fastest Way to Run

### Windows
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Double-click `start-docker.bat`
3. Edit `.env` file - Add your [Gemini API Key](https://makersuite.google.com/app/apikey)
4. Wait 2-3 minutes
5. Open: **http://localhost**

### Linux/Mac
```bash
chmod +x start-docker.sh
./start-docker.sh
# Edit .env and add GEMINI_API_KEY
# Open: http://localhost
```

---

## 🔑 Get Gemini API Key (Required)

1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Open `.env` file in project root
5. Replace `your_gemini_api_key_here` with your key
6. Save and restart: `docker-compose restart backend`

---

## 🌐 Access K-LENS

**Open browser:** http://localhost

**You should see:**
- K-LENS login page
- Dark theme with cyan accents
- Login form

---

## 👤 Create Admin Account

**Windows PowerShell:**
```powershell
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@klens.local\",\"password\":\"Admin@123\",\"name\":\"System Admin\",\"role\":\"admin\",\"department\":\"IT\"}"
```

**Linux/Mac:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@klens.local","password":"Admin@123","name":"System Admin","role":"admin","department":"IT"}'
```

**Login:**
- Email: `admin@klens.local`
- Password: `Admin@123`

---

## ✅ Verify Everything Works

**Run health check:**
```bash
# Windows
check-health.bat

# Linux/Mac
./check-health.sh
```

All services should show: ✓ OK

---

## 🎯 What's Running?

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost | Web interface |
| Backend API | http://localhost:3000 | REST API |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |
| MQTT | localhost:1883 | IoT sensors |

---

## 🚨 Common Issues

### Docker not running
```bash
# Windows: Start Docker Desktop from Start Menu
# Linux: sudo systemctl start docker
# Mac: Open Docker Desktop app
```

### Port 80 already in use
Edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Change to 8080
```
Then access: http://localhost:8080

### Services won't start
```bash
docker-compose down
docker-compose up -d --build
```

### Can't create admin account
User might already exist - just login directly

---

## 🛑 Stop Services

```bash
docker-compose down
```

---

## 🔄 Alternative: Local Setup (Without Docker)

**Requirements:** PostgreSQL, Redis, Mosquitto, Node.js 20+

**Windows:** Double-click `start-local.bat`
**Linux/Mac:** `./start-local.sh`

**Access:** http://localhost:8080

See [SETUP.md](./SETUP.md) for detailed instructions.

---

## 📚 Next Steps

1. ✅ Start services
2. ✅ Add Gemini API key
3. ✅ Create admin account
4. ✅ Login and explore
5. 📖 Read [FEATURES.md](./FEATURES.md) for all capabilities
6. 🚀 Deploy using [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📞 Need Help?

- **Setup issues:** [SETUP.md](./SETUP.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Features:** [FEATURES.md](./FEATURES.md)
- **Access guide:** [HOW-TO-ACCESS.md](./HOW-TO-ACCESS.md)

---

**You're all set! Enjoy K-LENS! 🎉**
