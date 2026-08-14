"""NLP + ML pipeline for Fake News Detection & Claim Verification.

The pipeline supports the public Fake/Real News CSV format with columns such as
`title`, `text`, and `label`, and also accepts a generic `text,label` CSV.
"""
from __future__ import annotations

import json
import os
import re
from collections import Counter
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity

try:
    from xgboost import XGBClassifier
except Exception:  # pragma: no cover
    XGBClassifier = None

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)
MODEL_PATH = MODEL_DIR / "fake_news_models.joblib"
METRICS_PATH = MODEL_DIR / "model_metrics.json"

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "then", "than", "to", "of", "in", "on",
    "for", "with", "from", "by", "at", "as", "is", "are", "was", "were", "be", "been",
    "this", "that", "these", "those", "it", "its", "they", "their", "he", "she", "we", "you",
    "i", "has", "have", "had", "will", "would", "can", "could", "should", "may", "might"
}

POSITIVE_WORDS = {"good", "success", "successful", "benefit", "benefits", "safe", "true", "confirmed", "improve", "improved"}
NEGATIVE_WORDS = {"fake", "false", "fraud", "danger", "dangerous", "deadly", "scam", "hoax", "wrong", "crisis", "threat"}
ASSERTIVE_WORDS = {"definitely", "certainly", "proven", "confirmed", "always", "never", "must", "guaranteed"}
HEDGING_WORDS = {"may", "might", "could", "possibly", "reportedly", "allegedly", "appears", "suggests"}


def clean_text(text: str) -> str:
    text = str(text or "")
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[^\w\s'%-]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text).strip().lower()
    return text


def tokenize(text: str) -> List[str]:
    return [t for t in re.findall(r"\b[\w'-]+\b", clean_text(text)) if t not in STOPWORDS]


def extract_claims(text: str) -> List[str]:
    """Extract declarative sentences as candidate claims."""
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+|\n+", str(text or "")) if s.strip()]
    candidates = []
    for sentence in sentences:
        words = re.findall(r"\b\w+\b", sentence)
        if len(words) >= 4:
            candidates.append(sentence)
    if not candidates and str(text).strip():
        candidates = [str(text).strip()]
    return candidates[:8]


def extract_entities(text: str) -> List[Dict[str, str]]:
    """Lightweight NER that works without downloading a language model."""
    text = str(text or "")
    entities: List[Dict[str, str]] = []
    seen = set()

    patterns = [
        (r"\b(?:19|20)\d{2}\b", "DATE"),
        (r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b", "DATE"),
        (r"\b(?:NASA|ISRO|WHO|UN|EU|CDC|FDA|NATO|Reuters|BBC|Google|Microsoft|OpenAI)\b", "ORG"),
        (r"\b(?:India|United States|USA|UK|China|Russia|Europe|Mars|Earth|Moon|Jupiter)\b", "LOC"),
        (r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b", "PERSON_OR_ORG"),
    ]
    for pattern, label in patterns:
        for match in re.finditer(pattern, text):
            value = match.group(0).strip()
            key = (value.lower(), label)
            if key not in seen:
                seen.add(key)
                entities.append({"text": value, "label": label})
    return entities[:20]


def sentiment(text: str) -> str:
    toks = set(tokenize(text))
    pos = len(toks & POSITIVE_WORDS)
    neg = len(toks & NEGATIVE_WORDS)
    if pos > neg:
        return "Positive"
    if neg > pos:
        return "Negative"
    return "Neutral"


def stance(text: str) -> str:
    toks = set(tokenize(text))
    if toks & ASSERTIVE_WORDS:
        return "Assertive"
    if toks & HEDGING_WORDS:
        return "Hedging"
    return "Informative"


def readability_profile(text: str) -> Dict[str, float | str]:
    words = re.findall(r"\b\w+\b", str(text or ""))
    sentences = max(1, len(re.findall(r"[.!?]+", str(text or ""))))
    avg_words = len(words) / sentences
    complexity = "Low" if avg_words < 14 else "Moderate" if avg_words < 24 else "High"
    return {"word_count": len(words), "sentence_count": sentences, "avg_words_per_sentence": round(avg_words, 2), "complexity": complexity}


def preprocessing_report(text: str) -> Dict:
    cleaned = clean_text(text)
    tokens = tokenize(text)
    claims = extract_claims(text)
    return {
        "cleaned_text": cleaned,
        "tokens": tokens[:80],
        "token_count": len(tokens),
        "claims": claims,
        "claim_count": len(claims),
        "entities": extract_entities(text),
        "sentiment": sentiment(text),
        "stance": stance(text),
        "readability": readability_profile(text),
    }


def load_dataset(path: str | os.PathLike) -> Tuple[pd.Series, pd.Series]:
    df = pd.read_csv(path)
    cols = {c.lower().strip(): c for c in df.columns}
    label_col = cols.get("label") or cols.get("class") or cols.get("target")
    if not label_col:
        raise ValueError("Dataset must contain a label/class/target column.")

    if "text" in cols and "title" in cols:
        text = df[cols["title"]].fillna("").astype(str) + " " + df[cols["text"]].fillna("").astype(str)
    elif "text" in cols:
        text = df[cols["text"]].fillna("").astype(str)
    elif "content" in cols:
        text = df[cols["content"]].fillna("").astype(str)
    else:
        raise ValueError("Dataset must contain text/content, or title + text columns.")

    labels = df[label_col].astype(str).str.upper().str.strip()
    valid = text.str.len() > 10
    text, labels = text[valid], labels[valid]
    if labels.nunique() < 2:
        raise ValueError("Dataset must contain at least two classes.")
    return text.reset_index(drop=True), labels.reset_index(drop=True)


def train_models(dataset_path: str, random_state: int = 42) -> Dict:
    texts, labels = load_dataset(dataset_path)
    # Normalize common FAKE/REAL labels while preserving generic binary labels.
    if set(labels.unique()) <= {"FAKE", "REAL"}:
        labels = labels.map({"FAKE": "FALSE", "REAL": "TRUE"})

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=random_state, stratify=labels
    )

    vectorizer = TfidfVectorizer(
        preprocessor=clean_text,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.98,
        sublinear_tf=True,
        max_features=50000,
    )
    Xtr = vectorizer.fit_transform(X_train)
    Xte = vectorizer.transform(X_test)

    classes = sorted(labels.unique())
    le = LabelEncoder().fit(classes)
    ytr = le.transform(y_train)
    yte = le.transform(y_test)

    models = {
        "logistic_regression": LogisticRegression(max_iter=1500, class_weight="balanced"),
        "random_forest": RandomForestClassifier(n_estimators=300, random_state=random_state, class_weight="balanced_subsample", n_jobs=-1),
    }
    if XGBClassifier is not None and len(classes) == 2:
        models["xgboost"] = XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.08,
            subsample=0.9,
            colsample_bytree=0.8,
            objective="binary:logistic",
            eval_metric="logloss",
            random_state=random_state,
            n_jobs=4,
        )

    metrics = {}
    trained = {}
    for name, model in models.items():
        model.fit(Xtr, ytr)
        pred = model.predict(Xte)
        precision, recall, f1, _ = precision_recall_fscore_support(yte, pred, average="weighted", zero_division=0)
        entry = {
            "accuracy": round(float(accuracy_score(yte, pred)), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1": round(float(f1), 4),
        }
        if hasattr(model, "predict_proba") and len(classes) == 2:
            try:
                entry["roc_auc"] = round(float(roc_auc_score(yte, model.predict_proba(Xte)[:, 1])), 4)
            except Exception:
                entry["roc_auc"] = None
        metrics[name] = entry
        trained[name] = model

    best_model = max(metrics, key=lambda k: metrics[k]["f1"])
    bundle = {
        "vectorizer": vectorizer,
        "label_encoder": le,
        "models": trained,
        "best_model": best_model,
        "classes": classes,
        "dataset_path": str(dataset_path),
        "training_rows": int(len(texts)),
    }
    joblib.dump(bundle, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps({"best_model": best_model, "training_rows": len(texts), "classes": classes, "metrics": metrics}, indent=2), encoding="utf-8")
    return {"best_model": best_model, "training_rows": len(texts), "classes": classes, "metrics": metrics}


def load_bundle() -> Dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Trained model not found. Run: python setup_ml.py")
    return joblib.load(MODEL_PATH)


def predict_with_models(text: str, bundle: Dict) -> Dict:
    vectorizer = bundle["vectorizer"]
    le = bundle["label_encoder"]
    X = vectorizer.transform([text])
    outputs = {}
    for name, model in bundle["models"].items():
        pred_id = int(model.predict(X)[0])
        pred_label = str(le.inverse_transform([pred_id])[0])
        probs = model.predict_proba(X)[0] if hasattr(model, "predict_proba") else None
        confidence = float(np.max(probs)) if probs is not None else 0.5
        outputs[name] = {"label": pred_label, "confidence": round(confidence * 100, 2)}
    best = bundle["best_model"]
    return {"best_model": best, "predictions": outputs, "label": outputs[best]["label"], "confidence": outputs[best]["confidence"]}


def semantic_similarity(text: str, claims: List[str], bundle: Dict) -> float:
    if not claims:
        return 0.0
    vectorizer = bundle["vectorizer"]
    matrix = vectorizer.transform([text] + claims)
    sims = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    return round(float(np.max(sims)), 4) if len(sims) else 0.0


def analyze(text: str, bundle: Dict) -> Dict:
    prep = preprocessing_report(text)
    pred = predict_with_models(text, bundle)
    similarity = semantic_similarity(text, prep["claims"], bundle)
    return {
        "prediction": pred["label"],
        "confidence": pred["confidence"],
        "model": pred["best_model"],
        "model_predictions": pred["predictions"],
        "semantic_similarity": round(similarity * 100, 2),
        "embeddings": {
            "type": "TF-IDF semantic embedding",
            "dimensions": len(bundle["vectorizer"].vocabulary_),
            "non_zero_features": int(bundle["vectorizer"].transform([text]).nnz),
        },
        "preprocessing": prep,
        "claims": prep["claims"],
        "entities": prep["entities"],
        "sentiment": prep["sentiment"],
        "stance": prep["stance"],
    }
