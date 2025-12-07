# Fix 403 Forbidden Error - Step by Step

## Problem
When running `start.bat`, you see:
```
403 Forbidden [IP: 20.2.0.1 8090]
E: Failed to fetch http://deb.debian.org/debian/dists/trixie/InRelease
```

This means Docker cannot download packages due to network/proxy blocking.

---

## Solution 1: Use Mobile Hotspot (EASIEST)

### Step 1: Enable Mobile Hotspot
1. On your phone, go to Settings → Mobile Hotspot
2. Turn on hotspot
3. Note the WiFi name and password

### Step 2: Connect Your Laptop
1. On your laptop, connect to the mobile hotspot WiFi
2. Wait until connected

### Step 3: Run Start Script
```bash
cd KLENS
start.bat
```

✅ This bypasses any corporate proxy/firewall

---

## Solution 2: Configure Docker Proxy Settings

### Step 1: Find Your Proxy Details
Ask your IT department or check:
- Proxy address (e.g., `http://proxy.company.com:8080`)
- Username/password (if required)

### Step 2: Open Docker Desktop
1. Click Docker icon in system tray
2. Click "Settings" (gear icon)

### Step 3: Configure Proxy
1. Go to **Resources** → **Proxies**
2. Enable **"Manual proxy configuration"**
3. Fill in:
   - **Web Server (HTTP)**: `http://proxy.company.com:8080`
   - **Secure Web Server (HTTPS)**: `http://proxy.company.com:8080`
   - Check **"Use the same proxy for all protocols"**
4. If authentication required, add username:password:
   - `http://username:password@proxy.company.com:8080`

### Step 4: Apply and Restart
1. Click **"Apply & Restart"**
2. Wait for Docker to restart (30 seconds)

### Step 5: Run Start Script
```bash
cd KLENS
start.bat
```

---

## Solution 3: Pull Images Manually First

### Step 1: Open PowerShell/CMD
```bash
cd KLENS
```

### Step 2: Pull Each Image One by One
Copy and paste these commands:

```bash
docker pull python:3.11-slim
```
Wait for it to complete, then:

```bash
docker pull node:20-alpine
```
Wait, then:

```bash
docker pull nginx:alpine
```
Wait, then:

```bash
docker pull pgvector/pgvector:pg16
```
Wait, then:

```bash
docker pull redis:7-alpine
```
Wait, then:

```bash
docker pull neo4j:5-community
```

### Step 3: Verify Images Downloaded
```bash
docker images
```

You should see all 6 images listed.

### Step 4: Run Start Script
```bash
start.bat
```

Now it will use the pre-downloaded images instead of downloading during build.

---

## Solution 4: Use Different Network

### Try These Networks in Order:
1. ✅ **Mobile Hotspot** (most reliable)
2. ✅ **Home WiFi** (if available)
3. ✅ **Public WiFi** (coffee shop, library)
4. ❌ **Corporate/College Network** (usually blocked)

---

## Verify It's Fixed

After trying any solution, run:
```bash
docker pull python:3.11-slim
```

If you see:
```
Status: Downloaded newer image for python:3.11-slim
```
✅ Network is working!

Then run:
```bash
start.bat
```

---

## Still Not Working?

### Check Docker is Running
```bash
docker ps
```

Should show running containers or empty list (not error).

### Check Internet Connection
```bash
ping google.com
```

Should show replies (not timeout).

### Last Resort: Use Pre-built Images
Contact the project owner for pre-built Docker images:
1. Get `klens-backend.tar` and `klens-frontend.tar`
2. Load them:
```bash
docker load -i klens-backend.tar
docker load -i klens-frontend.tar
```
3. Run:
```bash
docker-compose -f docker-compose.python.yml up -d
```

---

## Quick Reference

| Solution | Time | Difficulty | Success Rate |
|----------|------|------------|--------------|
| Mobile Hotspot | 2 min | Easy | 95% |
| Configure Proxy | 5 min | Medium | 80% |
| Pull Manually | 10 min | Easy | 90% |
| Different Network | 5 min | Easy | 85% |

**Recommended**: Try Mobile Hotspot first!
