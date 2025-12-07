@echo off
echo ========================================
echo   K-LENS Python Backend Setup
echo ========================================
echo.

echo [1/4] Copying environment file...
copy backend-python\.env.example backend-python\.env

echo.
echo [2/4] Stopping old containers...
docker-compose down

echo.
echo [3/4] Starting Python backend stack...
docker-compose -f docker-compose.python.yml up -d --build

echo.
echo [4/4] Waiting for services (30 seconds)...
timeout /t 30 /nobreak

echo.
echo ========================================
echo   Python Backend Started!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost
echo Neo4j Browser: http://localhost:7474
echo.
echo Neo4j Credentials:
echo   Username: neo4j
echo   Password: klens_neo4j_2024
echo.
echo IMPORTANT: Edit backend-python/.env and add your GEMINI_API_KEY
echo.
pause
