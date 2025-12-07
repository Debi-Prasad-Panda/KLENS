# 🐳 K-LENS Docker Cheat Sheet

This guide provides all the essential commands for managing the K-LENS project.

## 🚀 Quick Start (Recommended)

### Development Mode (Live Reload)
*Use this for daily coding. Updates to code typically reflect immediately.*
```powershell
.\start-dev.bat       # Windows
./start-dev.sh        # Linux/Mac
```
**What actually runs:**
`docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build`

### Production Mode
*Use this to test the final build.*
```powershell
.\start.bat           # Windows
./start.sh            # Linux/Mac
```
**What actually runs:**
`docker-compose up -d --build`

---

## 🛠️ Manual Docker Commands

Run these commands in the project root (`KLENS/`).

### 1. Start & Stop All Services

| Action | Command |
|--------|---------|
| **Start Everything** | `docker-compose -f docker-compose.yml -f docker-compose.override.yml up` |
| **Start Detached** (Backgound) | Add `-d` flag: `... up -d` |
| **Stop Everything** | `docker-compose down` |
| **Stop & Delete Data** (Reset DB) | `docker-compose down -v` **(WARNING: Deletes all data)** |

### 2. Managing Specific Services

**Service Names:** `backend`, `frontend`, `postgres`, `redis`, `neo4j`

**Restart a Service** (e.g., after changing a config file that live-reload missed):
```powershell
docker-compose restart backend
docker-compose restart frontend
```

**Rebuild a Specific Service** (e.g., after adding a new Python package or npm library):
*Note: We use the full command to ensure dev overrides (ports/volumes) are included.*
```powershell
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d --build backend
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d --build frontend
```

**Stop a Specific Service:**
```powershell
docker-compose stop neo4j
```

### 3. Viewing Logs

**View All Logs (Follow):**
```powershell
docker-compose logs -f
```

**View Specific Service Logs:**
```powershell
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 4. Container Access (Shell)

**Open Shell in Backend:**
```powershell
docker-compose exec backend sh
```

**Open Shell in Database:**
```powershell
docker-compose exec postgres psql -U klens_user -d klens
```

---

## ⚠️ Troubleshooting

**"Port already allocated" error:**
1. Stop everything: `docker-compose down`
2. Check what's running: `docker ps`
3. Restart: `.\start-dev.bat`

**"Database does not exist" or Login fails:**
1. Hard reset (deletes data): `docker-compose down -v`
2. Restart: `.\start-dev.bat`
3. Login with `admin@example.com` / `Admin@123`
