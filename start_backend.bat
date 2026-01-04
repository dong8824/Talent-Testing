@echo off
echo Installing dependencies...
E:\python\python.exe -m pip install fastapi uvicorn python-dotenv pydantic
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b %errorlevel%
)

echo Starting Backend Server...
cd backend
E:\python\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
if %errorlevel% neq 0 (
    echo Backend server failed to start.
    pause
)
