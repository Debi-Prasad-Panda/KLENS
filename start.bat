@echo off
echo ========================================
echo K-LENS Quick Start
echo ========================================
echo.

REM Check if .env exists
if not exist "backend-python\.env" (
    if exist "backend-python\.env.example" (
        echo Creating .env file...
        copy backend-python\.env.example backend-python\.env
        echo.
        echo IMPORTANT: Edit backend-python\.env and add your Gemini API key!
        notepad backend-python\.env
        echo.
        echo Press any key after saving your API key...
        pause
    ) else (
        echo ERROR: backend-python\.env.example not found!
        echo Please ensure you're in the KLENS directory.
        pause
        exit /b 1
    )
)

echo Starting all services...
echo.
docker-compose up -d --build

echo.
if errorlevel 1 (
    echo.
    echo ERROR: Docker build failed!
    echo.
    echo Common fixes:
    echo 1. Check Docker Desktop is running
    echo 2. Check internet connection
    echo 3. If behind proxy, configure Docker proxy settings
    echo 4. Try: docker system prune -a
    echo.
    pause
    exit /b 1
)
echo.
echo Waiting for services to start (30 seconds)...
timeout /t 30 /nobreak

echo.
echo ========================================
echo Services Started!
echo ========================================
echo Frontend: http://localhost
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Neo4j Browser: http://localhost:7474
echo.
echo Creating admin user...
curl -X POST http://localhost:8000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"Admin@123\",\"name\":\"System Admin\",\"role\":\"admin\",\"department\":\"IT\"}" 2>nul

echo.
echo.
echo ========================================
echo LOGIN CREDENTIALS
echo ========================================
echo Email: admin@example.com
echo Password: Admin@123
echo.
echo Open http://localhost to login
echo ========================================
pause
