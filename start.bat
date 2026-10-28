@echo off
echo Starting VidyaQuest STEM Platform...
cd /d "%~dp0"
where node >nul 2>&1 || (echo Node.js not found. Download from https://nodejs.org/ && pause && exit)
if not exist "backend\node_modules" (
    if not exist "node_modules" (
        echo Installing dependencies...
        cd backend
        call npm install
        cd ..
    )
)
echo Server starting at http://localhost:3000
node backend/server.js
pause
