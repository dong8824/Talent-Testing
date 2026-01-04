@echo off
setlocal

echo Checking environment...

:: Check Python
E:\python\python.exe --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found at E:\python\python.exe
    pause
    exit /b 1
)

:: Check Node.js (using npm.cmd to bypass PowerShell policy)
call npm.cmd -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npm not found. Please install Node.js LTS from https://nodejs.org/
    pause
    exit /b 1
)

echo Environment OK. Starting services...

:: Start Backend in a new window
echo Starting Backend...
start "Talent Backend" cmd /k "cd backend && E:\python\python.exe -m uvicorn main:app --reload"

:: Start Frontend in a new window
echo Starting Frontend...
start "Talent Frontend" cmd /k "cd frontend && call npm.cmd install && call npm.cmd run dev"

echo.
echo ========================================================
echo Services are starting in new windows.
echo Please wait for the Frontend window to show:
echo "Local: http://localhost:5173/"
echo ========================================================
echo.
pause
