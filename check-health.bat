@echo off
echo Checking K-LENS Health...
echo.

echo [1/5] Checking Frontend...
curl -s http://localhost > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend: OK
) else (
    echo ✗ Frontend: DOWN
)

echo [2/5] Checking Backend API...
curl -s http://localhost:3000/api > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend API: OK
) else (
    echo ✗ Backend API: DOWN
)

echo [3/5] Checking PostgreSQL...
docker exec klens-postgres pg_isready -U klens_user > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL: OK
) else (
    echo ✗ PostgreSQL: DOWN
)

echo [4/5] Checking Redis...
docker exec klens-redis redis-cli ping > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Redis: OK
) else (
    echo ✗ Redis: DOWN
)

echo [5/5] Checking MQTT...
docker ps | findstr klens-mosquitto > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MQTT: OK
) else (
    echo ✗ MQTT: DOWN
)

echo.
echo Health check complete!
pause
