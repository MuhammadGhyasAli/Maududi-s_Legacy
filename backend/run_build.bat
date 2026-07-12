@echo off
cd /d "E:\AI Projects\Maududi's legacy\backend"
echo [%date% %time%] Starting vector DB build...
python build_v2.py >> build_v2_output.log 2>&1
echo [%date% %time%] Build finished with exit code %ERRORLEVEL%
