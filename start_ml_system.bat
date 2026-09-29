@echo off
setlocal
cd /d "%~dp0"

echo Installing or verifying Python dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo.
  echo Dependency setup failed. Fix the error above before starting the backend.
  pause
  exit /b 1
)

if not exist "models\pytorch_claim_binary_v2_model.pt" (
  echo.
  echo Missing v2 model artifact:
  echo   models\pytorch_claim_binary_v2_model.pt
  echo Training is intentionally not started by this launcher.
  echo Run python setup_ml.py manually only when a retraining decision is approved.
  pause
  exit /b 1
)
if not exist "models\pytorch_claim_binary_v2_tfidf.joblib" (
  echo.
  echo Missing v2 TF-IDF artifact.
  pause
  exit /b 1
)
if not exist "models\pytorch_claim_binary_v2_label_encoder.joblib" (
  echo.
  echo Missing v2 label encoder artifact.
  pause
  exit /b 1
)
if not exist "models\pytorch_claim_binary_v2_metrics.json" (
  echo.
  echo Missing v2 metrics artifact.
  pause
  exit /b 1
)

echo Existing v2 artifacts verified. Starting Flask without retraining...
python -m backend.app
pause
