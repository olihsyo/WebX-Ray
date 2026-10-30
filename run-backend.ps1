Set-Location $PSScriptRoot
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting WebX-Ray AI Backend on http://localhost:8000" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
& "$PSScriptRoot\venv\Scripts\python.exe" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload --loop none
