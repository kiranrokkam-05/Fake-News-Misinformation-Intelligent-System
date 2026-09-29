import json
import sys
from functools import lru_cache
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from backend.api_v1 import api_v1

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

try:
    from backend.nlp_pipeline_v2 import MODEL_PATH, METRICS_PATH, analyze, load_bundle
except ImportError:
    from nlp_pipeline_v2 import MODEL_PATH, METRICS_PATH, analyze, load_bundle

BASE_DIR = Path(__file__).resolve().parent.parent
app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
app.register_blueprint(api_v1)


@lru_cache(maxsize=1)
def get_bundle():
    return load_bundle()


@app.get("/api/health")
def health():
    required_artifacts = [
        MODEL_PATH,
        MODEL_PATH.with_name("pytorch_claim_binary_v2_tfidf.joblib"),
        MODEL_PATH.with_name("pytorch_claim_binary_v2_label_encoder.joblib"),
        METRICS_PATH,
    ]
    ready = all(path.exists() for path in required_artifacts)
    metrics = {}
    if METRICS_PATH.exists():
        try:
            metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return jsonify({
        "status": "healthy" if ready else "model_not_trained",
        "service": "NLP & ML FEVER Claim Classification Backend",
        "modelReady": ready,
        "bestModel": metrics.get("best_model") or metrics.get("model"),
        "modelFile": MODEL_PATH.name,
        "trainingRows": metrics.get("total_usable_samples", 0),
    })


@app.get("/api/model-metrics")
def model_metrics():
    if not METRICS_PATH.exists():
        return jsonify({"error": "Model metrics not found. Run python setup_ml.py"}), 404
    return jsonify(json.loads(METRICS_PATH.read_text(encoding="utf-8")))


@app.post("/api/analyze")
def api_analyze():
    if not request.is_json:
        return jsonify({"error": "Request body must be valid JSON with a text field."}), 400
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object with a text field."}), 400
    text = str(payload.get("text", "")).strip()
    if len(text) < 5:
        return jsonify({"error": "Please provide at least 5 characters of claim/news text."}), 400
    try:
        result = analyze(text, get_bundle())
        result["warning"] = (
            "Deprecated pattern baseline only; this response is not evidence-based. "
            "Use POST /api/v1/verify for evidence assessment."
        )
        return jsonify(result)
    except (FileNotFoundError, ValueError, RuntimeError) as exc:
        app.logger.exception("Binary model analysis unavailable")
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
