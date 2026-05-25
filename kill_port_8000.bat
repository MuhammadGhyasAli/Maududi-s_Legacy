@echo off
echo Finding process using port 8000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    echo Killing process with PID %%a...
    taskkill /PID %%a /F
)

echo.
echo Port 8000 is now free. You can start the backend with:
echo   cd backend
echo   python main.py
pause
