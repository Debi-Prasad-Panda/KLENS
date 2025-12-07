@echo off
echo Restarting K-LENS...
docker-compose -f docker-compose.python.yml restart
echo.
echo Services restarted!
echo Frontend: http://localhost
echo Backend: http://localhost:8000
pause
