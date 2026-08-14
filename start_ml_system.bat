@echo off
setlocal
cd /d "%~dp0"
python -m pip install -r requirements.txt
python setup_ml.py
if errorlevel 1 (
  echo.
  echo ML setup failed. Fix the error above before starting the backend.
  pause
  exit /b 1
)
python -m backend.app
pause
