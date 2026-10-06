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

if not exist "models\fake_news_model.joblib" (
  echo.
  echo Missing models\fake_news_model.joblib.
  echo Train it with: python -m ml.train
  pause
  exit /b 1
)

echo.
echo ================================================================
echo Starting Flask; model metrics will print below.
echo Console output includes NLP summaries and retrieved evidence.
echo Open http://127.0.0.1:5000 after the server starts.
echo Press Ctrl+C to stop the server.
echo ================================================================
echo.
python -u -m backend.app
set SERVER_EXIT=%ERRORLEVEL%
echo.
echo Flask server stopped with exit code %SERVER_EXIT%.
pause
exit /b %SERVER_EXIT%
