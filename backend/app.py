import json
import sys
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

try:
    from backend.nlp_pipeline import MODEL_PATH, METRICS_PATH, analyze, load_bundle
except ImportError:
    from nlp_pipeline import MODEL_PATH, METRICS_PATH, analyze, load_bundle

BASE_DIR = Path(__file__).resolve().parent.parent
app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")


def get_bundle():
    return load_bundle()


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
    try:
        result = analyze(text, get_bundle())
        return jsonify(result)
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc), "code": "MODEL_NOT_READY"}), 503
    except Exception as exc:
        app.logger.exception("Analysis failed")
        return jsonify({"error": f"Analysis failed: {exc}"}), 500


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:path>")
def static_files(path):
    return send_from_directory(BASE_DIR, path)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
