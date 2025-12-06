@echo off
echo ========================================
echo K-LENS Development Mode (Hot Reload)
echo ========================================
echo.

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    pause
    exit /b 1
)

echo Starting K-LENS in development mode...
echo Changes will auto-reload without rebuild!
echo.

docker-compose -f docker-compose.dev.yml up -d

echo.
echo ========================================
echo K-LENS Development Server Running!
echo ========================================
echo.
echo Frontend: http://localhost
echo Backend: http://localhost:3000
echo.
echo Changes will auto-reload!
echo To view logs: docker-compose -f docker-compose.dev.yml logs -f
echo To stop: docker-compose -f docker-compose.dev.yml down
echo.
pause
