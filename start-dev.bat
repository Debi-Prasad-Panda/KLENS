@echo off
echo ========================================
echo K-LENS Development Mode (Live Reload)
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    if exist ".env.example" (
        echo Creating root .env file...
        copy .env.example .env
        echo.
        echo IMPORTANT: Edit .env and set your API keys before continuing.
        notepad .env
        echo.
        echo Press any key after saving your .env file...
        pause
    )
)

REM Check if backend .env exists
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
    )
)

echo Starting services with live reload...
echo.
echo Changes to code will automatically reload!
echo - Backend: Python files in backend-python/
echo - Frontend: React files in src/
echo.
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

pause
