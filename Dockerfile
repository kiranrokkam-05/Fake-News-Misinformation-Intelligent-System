FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/app/.cache/huggingface

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY frontend ./frontend
COPY verification_module ./verification_module
COPY nlp ./nlp
COPY models ./models

EXPOSE 5000
CMD ["python", "-m", "waitress", "--listen=0.0.0.0:5000", "backend.wsgi:app"]
