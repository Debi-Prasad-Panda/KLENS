# How to Access K-LENS Website

## 🚀 Quick Access

**After starting Docker:**

1. Open your web browser (Chrome, Firefox, Edge, Safari)
2. Go to: **http://localhost**
3. You should see the K-LENS login page

---

## 🔐 First Time Login

### Step 1: Create Admin Account

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

### Step 2: Login

- **Email:** `admin@klens.local`
- **Password:** `Admin@123`

---

## 🎯 What You'll See After Login

1. **Dashboard** - Main overview with analytics
2. **Morning Briefing** - Personalized task list
3. **Sidebar Navigation** - Access all features
4. **IoT Telemetry** - Real-time sensor data
5. **Document Upload** - Drag and drop files
6. **Knowledge Graph** - 3D visualization
7. **Profile** - Click user avatar at bottom

---

## 🔗 Important URLs

| Setup | URL | Port |
|-------|-----|------|
| Docker | http://localhost | 80 |
| Local | http://localhost:8080 | 8080 |
| Backend API | http://localhost:3000 | 3000 |

---

## 🛠️ Useful Commands

### Check Services
```bash
docker-compose ps
```

Should show all services as "Up" and "healthy"

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart frontend
```

### Health Check
```bash
# Windows
check-health.bat

# Linux/Mac
./check-health.sh
```

---

## 🚨 Troubleshooting

### "This site can't be reached"

**Check if services are running:**
```bash
docker-compose ps
```

**Restart services:**
```bash
docker-compose restart
```

**Check logs:**
```bash
docker-compose logs frontend
```

---

### "Connection refused"

**Wait 2-3 minutes** - Services take time to fully start

**Check backend:**
```bash
curl http://localhost:3000/api
```

**Restart backend:**
```bash
docker-compose restart backend
docker-compose logs backend
```

---

### Login page not showing

**Rebuild frontend:**
```bash
docker-compose up -d --build frontend
```

**Clear browser cache:**
- Press `Ctrl+Shift+Delete` (Windows/Linux)
- Press `Cmd+Shift+Delete` (Mac)
- Clear cache and reload

---

### "Cannot create admin account"

**Check if user already exists:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@klens.local","password":"Admin@123"}'
```

If you get a token response, user exists - just login directly.

---

### Blank page after login

**Check browser console:**
- Press `F12`
- Go to Console tab
- Look for errors

**Restart frontend:**
```bash
docker-compose restart frontend
```

---

## 📱 Access from Other Devices

**Find your computer's IP:**
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

**Access from phone/tablet:**
```
http://YOUR_IP_ADDRESS
```

Example: `http://192.168.1.100`

---

## 🎯 Quick Test

**Test backend:**
```bash
curl http://localhost:3000/api
```

**Test frontend:**
```bash
curl http://localhost
```

Both should return HTML/JSON response (not error).

---

## 🔄 Complete Workflow

```bash
# 1. Navigate to project
cd "a:\Cording\Hack Pro\KLENS"

# 2. Start services
docker-compose up -d

# 3. Wait 2-3 minutes
# Windows: timeout /t 180 /nobreak
# Linux/Mac: sleep 180

# 4. Create admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@klens.local","password":"Admin@123","name":"System Admin","role":"admin","department":"IT"}'

# 5. Open browser
# Windows: start http://localhost
# Linux: xdg-open http://localhost
# Mac: open http://localhost
```

---

## 💾 Backup & Reset

**Backup data:**
```bash
docker-compose exec postgres pg_dump -U klens_user klens > backup.sql
```

**Reset everything:**
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## ✅ Success Checklist

- [ ] Docker services running
- [ ] Admin account created
- [ ] Can access http://localhost
- [ ] Can see login page
- [ ] Can login successfully
- [ ] Can see dashboard

**If all checked, you're ready to use K-LENS!** 🎉

---

## 🎓 Next Steps

1. **Upload a document** - Go to "Upload Documents"
2. **View IoT data** - Go to "IoT & UNS"
3. **Explore graph** - Go to "Knowledge Graph"
4. **Check profile** - Click user avatar at bottom
5. **Try advanced features** - Nuclear Keys, Cinderella Access

---

## 📞 Still Not Working?

1. **Check Docker is running:**
   ```bash
   docker info
   ```

2. **Check ports are not in use:**
   ```bash
   # Windows
   netstat -ano | findstr :80
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :80
   lsof -i :3000
   ```

3. **View all logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Check documentation:**
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - [SETUP.md](./SETUP.md)
   - [START-HERE.md](./START-HERE.md)

---

**Remember:** http://localhost (that's it!)
