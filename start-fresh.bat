@echo off
echo ========================================
echo   K-LENS - Fresh Start with Auto-Setup
echo ========================================
echo.

echo [1/4] Stopping existing containers...
docker-compose -f docker-compose.dev.yml down

echo.
echo [2/4] Starting services...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo [3/4] Waiting for services to initialize (15 seconds)...
timeout /t 15 /nobreak

echo.
echo [4/4] Checking admin account...
docker logs klens-backend --tail 20 | findstr "admin"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Frontend: http://localhost
echo Backend:  http://localhost:3000
echo.
echo Login Credentials:
echo   Email:    admin@klens.local
echo   Password: Admin@123
echo.
echo Press any key to view logs...
pause
docker-compose -f docker-compose.dev.yml logs -f
