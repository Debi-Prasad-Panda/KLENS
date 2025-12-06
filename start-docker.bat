@echo off
echo ========================================
echo K-LENS Docker Startup Script
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    echo Falling back to local setup...
    call start-local.bat
    exit /b 1
)

echo Docker is running...
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env file and add your GEMINI_API_KEY
    echo Press any key after editing .env file...
    pause >nul
)

echo Starting K-LENS services with Docker Compose...
docker-compose up -d

echo.
echo ========================================
echo K-LENS is starting up!
echo ========================================
echo.
echo Frontend: http://localhost
echo Backend API: http://localhost:3000
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause
