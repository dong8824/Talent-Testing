@echo off
echo Installing dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies.
    pause
    exit /b %errorlevel%
)

echo Starting Frontend Server...
call npm run dev
if %errorlevel% neq 0 (
    echo Frontend server failed to start.
    pause
)
