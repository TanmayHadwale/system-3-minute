@echo off

:: Change to the directory where this script resides
cd /d "%~dp0"

echo Starting backend server...
cd server
start "backend" cmd /c "npm run dev"

echo Starting frontend development server...
cd ..\client
start "frontend" cmd /c "npm run dev"

echo All services launched. Use the opened windows to view logs.
