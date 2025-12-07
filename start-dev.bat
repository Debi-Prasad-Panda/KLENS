@echo off
echo ========================================
echo K-LENS Development Mode (Auto-Reload)
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

echo Starting databases only...
docker-compose -f docker-compose.python.yml up -d postgres redis neo4j

echo.
echo Waiting for databases (20 seconds)...
timeout /t 20 /nobreak

echo.
echo ========================================
echo Starting Backend (Auto-Reload)...
echo ========================================
cd backend-python
start cmd /k "venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
cd ..

echo.
echo ========================================
echo Starting Frontend (Auto-Reload)...
echo ========================================
start cmd /k "npm run dev"

timeout /t 10 /nobreak

echo.
echo ========================================
echo Development Mode Started!
echo ========================================
echo Frontend: http://localhost:5173 (Vite dev server)
echo Backend: http://localhost:8000 (Auto-reload enabled)
echo.
echo Changes will auto-reload!
echo Close the terminal windows to stop.
echo ========================================
pause
