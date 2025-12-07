@echo off
echo Stopping all K-LENS services...
docker-compose -f docker-compose.python.yml down
echo.
echo All services stopped!
pause
