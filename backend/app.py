import json
import logging
import sys
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from nlp.pipeline import FakeNewsNLPPipeline
from verification_module.verify_pipeline import verify_claim

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
logger = logging.getLogger(__name__)
MODEL_PATH = BASE_DIR / "models" / "fake_news_model.joblib"
METRICS_PATH = BASE_DIR / "models" / "model_metrics.json"
_pipeline = None


def print_startup_report():
    """Print the dataset/model report before Flask starts serving requests."""
    print("\n" + "=" * 68)
    print("FAKE-NEWS NLP/ML SYSTEM STARTUP REPORT")
    print("=" * 68)
    print("NLP preprocessing: normalization, sentence/word tokenization, claim extraction, entity extraction")
    print("NLP features: TF-IDF text features + linguistic/sensationalism features")
    try:
        import nltk
        from nltk.data import find
        try:
            find("corpora/stopwords")
            stopwords_ready = True
        except LookupError:
            stopwords_ready = False
        try:
            find("corpora/wordnet")
            wordnet_ready = True
        except LookupError:
            wordnet_ready = False
        print(f"NLTK: {nltk.__version__} (stopwords={'ready' if stopwords_ready else 'missing'}, wordnet={'ready' if wordnet_ready else 'missing'})")
    except Exception as exc:
        print(f"NLTK: unavailable ({exc})")

    if MODEL_PATH.exists():
        print(f"Model artifact: {MODEL_PATH.name} (ready)")
    else:
        print(f"Model artifact: {MODEL_PATH.name} (missing; run python setup_ml.py)")

    if METRICS_PATH.exists():
        try:
            metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
            print(f"Dataset rows: {metrics.get('training_rows', 'n/a')}")
            print(f"Classes: {', '.join(metrics.get('classes', []))}")
            print("\nModel metrics:")
            for model_name, values in metrics.get("metrics", {}).items():
                print(
                    f"  {model_name}: accuracy={values.get('accuracy', 0):.4f}, "
                    f"precision={values.get('precision', 0):.4f}, "
                    f"recall={values.get('recall', 0):.4f}, "
                    f"f1={values.get('f1', 0):.4f}, "
                    f"roc_auc={values.get('roc_auc', 0):.4f}"
                )
            print(f"Selected model: {metrics.get('best_model', 'n/a')}")
        except Exception as exc:
            print(f"Metrics: could not read {METRICS_PATH.name} ({exc})")
    else:
        print("Metrics: unavailable; run python setup_ml.py")

    print("\nStarting Flask server at http://127.0.0.1:5000")
    print("=" * 68 + "\n")


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
    return send_from_directory(BASE_DIR / "frontend", "index.html")


@app.get("/<path:path>")
def static_files(path):
    return send_from_directory(BASE_DIR / "frontend", path)


if __name__ == "__main__":
    print_startup_report()
    app.run(host="127.0.0.1", port=5000, debug=False)
