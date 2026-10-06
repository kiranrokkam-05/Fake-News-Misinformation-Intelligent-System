"""Report exact, normalized, and high TF-IDF-similarity evaluation overlaps.

Similarity matches are leads for human review, not automatic duplicate labels.
This script never edits or deletes training/evaluation rows.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ml.train import load_dataset


def _normalize(text: str) -> str:
    value = unicodedata.normalize("NFKC", str(text)).casefold()
    value = re.sub(r"[^\w]+", " ", value, flags=re.UNICODE)
    return " ".join(value.split())


def _article_text(frame: pd.DataFrame) -> list[str]:
    title = frame["title"].fillna("").astype(str) if "title" in frame else pd.Series([""] * len(frame))
    body = frame["text"].fillna("").astype(str) if "text" in frame else pd.Series([""] * len(frame))
    return (title + " " + body).str.strip().tolist()


def _id(frame: pd.DataFrame, index: int) -> str:
    if "id" in frame and pd.notna(frame.iloc[index]["id"]):
        return str(frame.iloc[index]["id"])
    return str(index)


def audit(dataset_path: Path, threshold: float, title_threshold: float, output_path: Path) -> dict:
    if not dataset_path.is_file():
        raise FileNotFoundError(f"Evaluation CSV not found: {dataset_path}")
    evaluation = pd.read_csv(dataset_path)
    required = {"text"}
    missing = sorted(required - set(evaluation.columns))
    if missing:
        raise ValueError(f"Evaluation CSV is missing required columns: {', '.join(missing)}")
    train = load_dataset(str(ROOT / "data"))
    train_texts = train["full_text"].astype(str).tolist()
    eval_texts = _article_text(evaluation)
    training_source = pd.read_csv(ROOT / "data" / "fake_and_real_news_dataset.csv")
    train_titles = training_source.get("title", pd.Series(dtype=str)).fillna("").astype(str).tolist()
    eval_titles = evaluation["title"].fillna("").astype(str).tolist() if "title" in evaluation else [""] * len(evaluation)

    train_exact: dict[str, list[int]] = defaultdict(list)
    train_normalized: dict[str, list[int]] = defaultdict(list)
    for index, text in enumerate(train_texts):
        train_exact[text].append(index)
        normalized = _normalize(text)
        if normalized:
            train_normalized[normalized].append(index)

    eval_exact: dict[str, list[int]] = defaultdict(list)
    eval_normalized: dict[str, list[int]] = defaultdict(list)
    for index, text in enumerate(eval_texts):
        if text:
            eval_exact[text].append(index)
            normalized = _normalize(text)
            if normalized:
                eval_normalized[normalized].append(index)

    exact_train_matches = []
    normalized_train_matches = []
    for index, text in enumerate(eval_texts):
        for train_index in train_exact.get(text, []) if text else []:
            exact_train_matches.append({"evaluation_id": _id(evaluation, index), "evaluation_row": index, "training_row_after_cleaning": train_index})
        normalized = _normalize(text)
        for train_index in train_normalized.get(normalized, []) if normalized else []:
            normalized_train_matches.append({"evaluation_id": _id(evaluation, index), "evaluation_row": index, "training_row_after_cleaning": train_index})

    train_exact_titles: dict[str, list[int]] = defaultdict(list)
    train_normalized_titles: dict[str, list[int]] = defaultdict(list)
    eval_exact_titles: dict[str, list[int]] = defaultdict(list)
    eval_normalized_titles: dict[str, list[int]] = defaultdict(list)
    for index, title in enumerate(train_titles):
        if title.strip():
            train_exact_titles[title].append(index)
            train_normalized_titles[_normalize(title)].append(index)
    for index, title in enumerate(eval_titles):
        if title.strip():
            eval_exact_titles[title].append(index)
            eval_normalized_titles[_normalize(title)].append(index)
    exact_title_matches = []
    normalized_title_matches = []
    for index, title in enumerate(eval_titles):
        if not title.strip():
            continue
        for train_index in train_exact_titles.get(title, []):
            exact_title_matches.append({"evaluation_id": _id(evaluation, index), "evaluation_row": index, "training_row": train_index})
        for train_index in train_normalized_titles.get(_normalize(title), []):
            normalized_title_matches.append({"evaluation_id": _id(evaluation, index), "evaluation_row": index, "training_row": train_index})

    def groups(index: dict[str, list[int]]) -> list[list[int]]:
        return [rows for rows in index.values() if len(rows) > 1]

    within_eval_exact = groups(eval_exact)
    within_eval_normalized = groups(eval_normalized)
    within_eval_exact_titles = groups(eval_exact_titles)
    within_eval_normalized_titles = groups(eval_normalized_titles)
    similarity_matches = []
    if eval_texts and train_texts and any(eval_texts):
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=60000, stop_words="english", sublinear_tf=True)
        train_matrix = vectorizer.fit_transform(train_texts)
        eval_matrix = vectorizer.transform(eval_texts)
        similarities = eval_matrix @ train_matrix.T
        max_similarities = np.asarray(similarities.max(axis=1).toarray()).ravel()
        for index in np.flatnonzero(max_similarities >= threshold):
            row = similarities.getrow(int(index))
            best = int(row.data.argmax())
            train_index = int(row.indices[best])
            similarity_matches.append({
                "evaluation_id": _id(evaluation, int(index)),
                "evaluation_row": int(index),
                "training_row_after_cleaning": train_index,
                "cosine_similarity": float(row.data[best]),
                "heuristic_only": True,
            })

    title_similarity_matches = []
    indexed_training_titles = [(index, title) for index, title in enumerate(train_titles) if title.strip()]
    indexed_evaluation_titles = [(index, title) for index, title in enumerate(eval_titles) if title.strip()]
    if indexed_training_titles and indexed_evaluation_titles:
        title_vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=30000, stop_words="english", sublinear_tf=True)
        title_train_matrix = title_vectorizer.fit_transform([title for _, title in indexed_training_titles])
        title_eval_matrix = title_vectorizer.transform([title for _, title in indexed_evaluation_titles])
        title_similarities = title_eval_matrix @ title_train_matrix.T
        title_max_similarities = np.asarray(title_similarities.max(axis=1).toarray()).ravel()
        for offset in np.flatnonzero(title_max_similarities >= title_threshold):
            row = title_similarities.getrow(int(offset))
            best = int(row.data.argmax())
            title_similarity_matches.append({
                "evaluation_id": _id(evaluation, indexed_evaluation_titles[int(offset)][0]),
                "evaluation_row": indexed_evaluation_titles[int(offset)][0],
                "training_row": indexed_training_titles[int(row.indices[best])][0],
                "cosine_similarity": float(row.data[best]),
                "heuristic_only": True,
            })

    result = {
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "evaluation_dataset": str(dataset_path.resolve()),
        "cleaned_training_rows_compared": len(train_texts),
        "evaluation_rows_scanned": len(evaluation),
        "tfidf": {
            "method": "word unigram/bigram TF-IDF cosine similarity; vectorizer fitted on training text only",
            "flag_threshold": threshold,
            "matches_at_or_above_threshold": similarity_matches,
            "warning": "TF-IDF similarity is a lexical heuristic and does not prove that two records are duplicate articles.",
        },
        "title_overlap": {
            "exact_train_evaluation_matches": exact_title_matches,
            "normalized_train_evaluation_matches": normalized_title_matches,
            "exact_duplicate_groups_within_evaluation": within_eval_exact_titles,
            "normalized_duplicate_groups_within_evaluation": within_eval_normalized_titles,
            "tfidf_method": "word unigram/bigram TF-IDF cosine over title text; fitted on raw training titles only",
            "tfidf_flag_threshold": title_threshold,
            "tfidf_matches_at_or_above_threshold": title_similarity_matches,
        },
        "exact_text_train_evaluation_matches": exact_train_matches,
        "normalized_text_train_evaluation_matches": normalized_train_matches,
        "exact_duplicate_groups_within_evaluation": within_eval_exact,
        "normalized_duplicate_groups_within_evaluation": within_eval_normalized,
        "records_modified_or_deleted": 0,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))
    print(f"\nSaved leakage audit to {output_path}")
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=ROOT / "evaluation" / "external_evaluation.csv")
    parser.add_argument("--threshold", type=float, default=0.95, help="Flag maximum train/evaluation cosine similarity at or above this value (default: 0.95).")
    parser.add_argument("--title-threshold", type=float, default=0.85, help="Flag maximum title cosine similarity at or above this value (default: 0.85).")
    parser.add_argument("--output", type=Path, default=ROOT / "evaluation" / "results" / "leakage_audit.json")
    args = parser.parse_args()
    if not 0 <= args.threshold <= 1 or not 0 <= args.title_threshold <= 1:
        parser.error("similarity thresholds must be between 0 and 1")
    try:
        audit(args.dataset, args.threshold, args.title_threshold, args.output)
    except Exception as exc:
        print(f"Evaluation leakage audit failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
