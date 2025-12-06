@echo off
echo ========================================
echo K-LENS Local Startup Script
echo ========================================
echo.

REM Check if .env exists
if not exist backend\.env (
    echo Creating backend\.env file...
    copy .env.local.example backend\.env
    echo.
    echo IMPORTANT: Edit backend\.env and add your GEMINI_API_KEY
    echo Press any key after editing...
    pause >nul
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 20+ from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js found...
echo.

REM Install backend dependencies
if not exist backend\node_modules (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Install frontend dependencies
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)

echo.
echo ========================================
echo Starting K-LENS locally...
echo ========================================
echo.
echo NOTE: Make sure PostgreSQL, Redis, and Mosquitto are running locally
echo.

REM Start backend in new window
start "K-LENS Backend" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Start frontend
start "K-LENS Frontend" cmd /k "npm run dev"

echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8080
echo.
pause
