@echo off
setlocal
cd /d "%~dp0"
title Fake News Verification - Flask Server
set PYTHONUNBUFFERED=1

if exist ".venv\Scripts\activate.bat" (
  call ".venv\Scripts\activate.bat"
) else (
  echo No project .venv found. Using Python from PATH.
)

echo.
echo ================================================================
echo Starting the production-like Waitress server; model metrics are available at /api/model-metrics.
echo The canonical evidence API does not require the legacy article model.
echo Open http://127.0.0.1:5000 after the server starts.
echo Press Ctrl+C to stop the server.
echo ================================================================
echo.
python -u -m waitress --listen=127.0.0.1:5000 backend.wsgi:app
set SERVER_EXIT=%ERRORLEVEL%
echo.
echo Flask server stopped with exit code %SERVER_EXIT%.
pause
exit /b %SERVER_EXIT%
