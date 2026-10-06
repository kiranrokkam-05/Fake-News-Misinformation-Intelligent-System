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
from backend.final_decision import decide_final
from backend.api_v1 import api_v1

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
app.register_blueprint(api_v1)
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
        print(f"Model artifact: {MODEL_PATH.name} (missing; run python -m ml.train)")

    if METRICS_PATH.exists():
        try:
            metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
            print(f"Dataset rows: {metrics.get('training_rows', 'n/a')}")
            print(f"Classes: {', '.join(metrics.get('classes', []))}")
            print("\nModel metrics:")
            columns = [
                ("Model", "model"),
                ("Train Acc", "train_accuracy"),
                ("Accuracy", "accuracy"),
                ("Precision", "precision"),
                ("Recall", "recall"),
                ("F1", "f1"),
                ("Macro F1", "macro_f1"),
                ("ROC AUC", "roc_auc"),
            ]
            rows = []
            for model_name, values in metrics.get("metrics", {}).items():
                row = {"model": model_name}
                train_accuracy = metrics.get("training_accuracy")
                row["train_accuracy"] = (
                    f"{train_accuracy:.4f}"
                    if isinstance(train_accuracy, (int, float))
                    else "N/A"
                )
                for _, key in columns[1:]:
                    value = values.get(key)
                    row[key] = f"{value:.4f}" if isinstance(value, (int, float)) else "N/A"
                rows.append(row)
            widths = {
                key: max(len(label), *(len(row[key]) for row in rows)) if rows else len(label)
                for label, key in columns
            }
            border = "+-" + "-+-".join("-" * widths[key] for _, key in columns) + "-+"
            header = "| " + " | ".join(label.ljust(widths[key]) for label, key in columns) + " |"
            print(f"  {border}")
            print(f"  {header}")
            print(f"  {border}")
            for row in rows:
                cells = [row[key].ljust(widths[key]) for _, key in columns]
                print("  | " + " | ".join(cells) + " |")
            print(f"  {border}")
            print(f"Selected model: {metrics.get('best_model', 'n/a')}")
        except Exception as exc:
            print(f"Metrics: could not read {METRICS_PATH.name} ({exc})")
    else:
        print("Metrics: unavailable; run python -m ml.train")

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
        return jsonify({"error": "Model metrics not found. Train the article classifier with python -m ml.train"}), 404
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
        summary = result.get("input_text_summary", {})
        classification = result.get("classification", {})
        claims = result.get("claims_and_entities", {})
        confidence = result.get("confidence_assessment") or {}
        print("\n[NLP analysis]", flush=True)
        print(f"  Input: {summary.get('word_count', 0)} words, {summary.get('sentence_count', 0)} sentences", flush=True)
        print(f"  Classifier: {classification.get('verdict', 'unavailable')} (applicable={classification.get('applicable', True)})", flush=True)
        if classification.get("fake_probability") is not None:
            print(f"  Fake score (uncalibrated): {classification['fake_probability']:.1%}; real score: {classification['real_probability']:.1%}; SVM margin: {classification.get('decision_margin')}", flush=True)
        if confidence:
            print(f"  Classifier score calibration: {confidence.get('confidence_type', 'unknown')}; verdict={confidence.get('verdict', 'unrated')}", flush=True)
        print(f"  Claims extracted: {claims.get('extracted_claims_count', 0)}; entities: {claims.get('total_entities', 0)}", flush=True)
        for item in claims.get("claims", [])[:5]:
            print(f"    Claim: {item.get('text', '')}", flush=True)
        entity_summary = claims.get("entity_summary", {})
        if entity_summary:
            print(f"  Entity summary: {entity_summary}", flush=True)
        result["warning"] = "The article classifier is a pattern-based baseline and is not evidence-based fact verification. Use /api/check to combine it with retrieved evidence."
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
        result = verify_claim(claim)
        print("\n[Evidence verification]", flush=True)
        print(f"  Verdict: {result.verdict.value} ({result.confidence:.1f}% confidence)", flush=True)
        print(f"  Search queries: {', '.join(result.search_queries) or 'none'}", flush=True)
        for status in result.provider_statuses:
            print(f"  Provider {status.name}: {status.status.value}, {status.n_results} results{(': ' + status.reason) if status.reason else ''}", flush=True)
        for item in result.evidence[:8]:
            excerpt = (item.passage.text if item.passage else item.snippet).replace("\n", " ")
            print(f"    [{item.stance.value}] {item.source_name}: {item.title}", flush=True)
            print(f"      {excerpt[:320]}", flush=True)
            if item.url:
                print(f"      {item.url}", flush=True)
        return jsonify(result.to_dict())
    except Exception:
        logger.exception("Verification failed")
        return jsonify({"error": "Verification failed. Check the backend logs."}), 502


@app.post("/api/check")
def api_check():
    """Run both independent signals and return a transparent final assessment."""
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", payload.get("claim", ""))).strip()
    if len(text) < 5:
        return jsonify({"error": "Please provide at least 5 characters of claim/news text."}), 400
    if not MODEL_PATH.exists():
        return jsonify({"error": "Fake-news model is not ready.", "code": "MODEL_NOT_READY"}), 503

    try:
        analysis = get_pipeline().analyze_text(text)
        if "error" in analysis:
            return jsonify(analysis), 400
    except Exception:
        logger.exception("Combined analysis failed in classifier stage")
        return jsonify({"error": "Analysis failed. Check the backend logs."}), 500

    # Search the most verifiable extracted sentence, not the entire article.
    # A short claim is used directly. The selected focal claim is returned so
    # the UI makes clear exactly what the evidence verdict covers.
    claims = (analysis.get("claims_and_entities") or {}).get("claims") or []
    focus = max(
        claims,
        key=lambda item: (
            float(item.get("verifiability_score", 0) or 0),
            len(item.get("entities", []) or []),
            bool(item.get("has_numerical_data")),
            -int(item.get("sentence_index", 0) or 0),
        ),
        default=None,
    )
    verification_claim = (focus or {}).get("text", text)
    verification_error = None
    try:
        verification = verify_claim(verification_claim).to_dict()
    except Exception as exc:
        logger.error("Combined analysis failed in evidence stage (%s)", type(exc).__name__)
        verification_error = "Evidence verification failed; no evidence was counted against the claim."
        verification = {
            "claim": verification_claim,
            "verdict": "UNVERIFIED",
            "confidence": 0.0,
            "reason": verification_error,
            "evidence": [],
            "sources_checked": [],
            "search_queries": [],
            "provider_statuses": [{"name": "verification", "status": "error", "reason": f"Verification processing failed ({type(exc).__name__})", "latency_ms": 0, "n_results": 0}],
        }

    final_decision = decide_final(analysis.get("classification"), verification)
    return jsonify({
        "analysis": analysis,
        "verification": verification,
        "verification_focus": verification_claim,
        "verification_scope": "one representative extracted claim" if focus else "submitted text",
        "final_decision": final_decision,
        "verification_error": verification_error,
    })


@app.get("/")
def index():
    return send_from_directory(BASE_DIR / "frontend", "index.html")


@app.get("/<path:path>")
def static_files(path):
    return send_from_directory(BASE_DIR / "frontend", path)


if __name__ == "__main__":
    print_startup_report()
    app.run(host="127.0.0.1", port=5000, debug=False)
