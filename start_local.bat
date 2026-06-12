@echo off
REM Sports Registration System - Local Startup Script for Windows
REM This script helps you start both backend and frontend servers

echo ========================================
echo Sports Registration System - Local Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 14 or higher
    pause
    exit /b 1
)

echo Starting backend server on port 8001...
cd backend
start "Backend Server" cmd /k "python -m pip install -r requirements.txt && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo Backend started in new window
echo.

REM Wait for backend to start
timeout /t 5 /nobreak >nul

echo Starting frontend server on port 3000...
cd ..\frontend
start "Frontend Server" cmd /k "yarn install && yarn start"
echo Frontend started in new window
echo.

echo ========================================
echo Servers are starting...
echo ========================================
echo.
echo Credentials:
echo    Use the admin credentials configured in backend\.env
echo.
echo URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8001
echo    API Docs: http://localhost:8001/docs
echo.
echo Both servers will open in separate windows
echo Close those windows to stop the servers
echo.
echo Press any key to exit this window...
pause >nul
