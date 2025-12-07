@echo off
echo ========================================
echo K-LENS Quick Start
echo ========================================
echo.

REM Check if .env exists
if not exist "backend-python\.env" (
    echo Creating .env file...
    copy backend-python\.env.example backend-python\.env
    echo.
    echo IMPORTANT: Edit backend-python\.env and add your Gemini API key!
    echo Press any key after adding your API key...
    pause
)

echo Starting all services...
docker-compose -f docker-compose.python.yml up -d --build

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
