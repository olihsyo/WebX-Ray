@echo off
cd /d "%~dp0"
echo ===================================================
echo Starting WebX-Ray AI Backend on http://localhost:8000
echo ===================================================
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload --loop none
