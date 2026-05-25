@echo off
echo ====================================================
echo Starting Maududi's Legacy Servers...
echo ====================================================

:: Start backend server in a new window
echo Starting Backend FastAPI Server...
start "Maududi's Legacy Backend" cmd /k "cd backend && (if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) else (echo No virtual environment found, running python directly...)) && python main.py"

:: Start frontend server in the current window
echo Starting Frontend Next.js Dev Server...
npm run dev

pause
