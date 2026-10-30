@echo off
cd /d "%~dp0"
echo Starting WebX-Ray AI (Backend + Frontend)...
start "WebX-Ray Backend" cmd /k "run-backend.bat"
start "WebX-Ray Frontend" cmd /k "run-frontend.bat"
echo Services are launching!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
pause
