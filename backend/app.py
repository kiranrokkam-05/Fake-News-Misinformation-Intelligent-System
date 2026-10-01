import json
import logging
import sys
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.nlp_ml_pipeline import FakeNewsNLPPipeline
from verification_module.verify_pipeline import verify_claim

BASE_DIR = Path(__file__).resolve().parent.parent
app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
logger = logging.getLogger(__name__)
MODEL_PATH = BASE_DIR / "models" / "fake_news_model.joblib"
METRICS_PATH = BASE_DIR / "models" / "model_metrics.json"
_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = FakeNewsNLPPipeline(model_path=str(MODEL_PATH))
    return _pipeline


@app.get("/api/health")
def health():
    ready = MODEL_PATH.exists()
    metrics = {}
    if METRICS_PATH.exists():
        try:
            metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return jsonify({
        "status": "healthy" if ready else "model_not_trained",
        "service": "NLP & ML Fake News Analysis Backend",
        "modelReady": ready,
        "bestModel": metrics.get("best_model"),
        "trainingRows": metrics.get("training_rows", 0),
    })


@app.get("/api/model-metrics")
def model_metrics():
    if not METRICS_PATH.exists():
        return jsonify({"error": "Model metrics not found. Run python setup_ml.py"}), 404
    return jsonify(json.loads(METRICS_PATH.read_text(encoding="utf-8")))


@app.post("/api/analyze")
def api_analyze():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", "")).strip()
    if len(text) < 5:
        return jsonify({"error": "Please provide at least 5 characters of claim/news text."}), 400
    if not MODEL_PATH.exists():
        return jsonify({"error": "Fake-news model is not ready.", "code": "MODEL_NOT_READY"}), 503
    try:
        result = get_pipeline().analyze_text(text)
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result)
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc), "code": "MODEL_NOT_READY"}), 503
    except Exception:
        logger.exception("Analysis failed")
        return jsonify({"error": "Analysis failed. Check the backend logs."}), 500


@app.route("/api/verify", methods=["GET", "POST"])
def api_verify():
    if request.method == "GET":
        return jsonify({
            "endpoint": "/api/verify",
            "method": "POST",
            "body": {"claim": "Your claim or news text here"},
            "message": "Send a POST request with JSON to verify a claim against configured evidence sources.",
        })
    payload = request.get_json(silent=True) or {}
    claim = str(payload.get("claim", payload.get("text", ""))).strip()
    if len(claim) < 5:
        return jsonify({"error": "Please provide at least 5 characters of claim text."}), 400
    try:
        return jsonify(verify_claim(claim).to_dict())
    except Exception:
        logger.exception("Verification failed")
        return jsonify({"error": "Verification failed. Check the backend logs."}), 502


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:path>")
def static_files(path):
    return send_from_directory(BASE_DIR, path)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
