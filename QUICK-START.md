# 🚀 K-LENS Quick Start Guide

## ✅ Automatic Setup (Recommended)

### Windows
```cmd
start-fresh.bat
```

### Linux/Mac
```bash
chmod +x start-fresh.sh
./start-fresh.sh
```

This will:
- ✅ Stop any existing containers
- ✅ Start all services
- ✅ Automatically create admin account
- ✅ Show you the login credentials

## 🌐 Access Application

**URL:** http://localhost

**Default Login:**
- Email: `admin@klens.local`
- Password: `Admin@123`

## 🔄 Daily Usage

### Start Development Mode
```cmd
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Services
```cmd
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```cmd
docker-compose -f docker-compose.dev.yml logs -f
```

## 🎯 Features

- ✅ **Auto-reload**: Edit code and see changes instantly
- ✅ **Auto-admin**: Admin account created automatically on first start
- ✅ **Hot-reload**: No need to rebuild containers for code changes

## 📝 Admin Account

The admin account is **automatically created** when the backend starts:
- Email: `admin@klens.local`
- Password: `Admin@123`

**Change password after first login!**

## 🔧 Troubleshooting

### Can't Login?
```cmd
docker restart klens-backend
```
Wait 10 seconds, then try again.

### Services Won't Start?
```cmd
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --force-recreate
```

### Check Status
```cmd
docker-compose -f docker-compose.dev.yml ps
```

## 📚 More Help

- Full documentation: `README.md`
- Setup guide: `SETUP.md`
- Troubleshooting: `TROUBLESHOOTING.md`
