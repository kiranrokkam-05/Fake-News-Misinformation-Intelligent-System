"""Run fixed-seed, report-only SciFact subsets with checkpoints."""

import json
import random
import sys
import time
from pathlib import Path

from sklearn.metrics import classification_report, confusion_matrix

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from verification_module.adapters.local_corpus_adapter import LocalSciFactCorpus
from verification_module.reasoning.nli import load_nli_model

DATA = ROOT / "data" / "eval" / "scifact"
REPORTS = ROOT / "reports"
SEED = 42
LABELS = ["SUPPORTS", "REFUTES", "INSUFFICIENT"]


def gold_label(record: dict) -> str:
    labels = [
        item["label"]
        for evidence in record.get("evidence", {}).values()
        for item in evidence
    ]
    if "CONTRADICT" in labels:
        return "REFUTES"
    if "SUPPORT" in labels:
        return "SUPPORTS"
    return "INSUFFICIENT"


def classify(nli, claim: str, items) -> tuple[str, dict]:
    pairs = [(item.passage.text, claim) for item in items if item.passage]
    scores = nli.score_batch(
        [pair[0] for pair in pairs], [pair[1] for pair in pairs]
    )
    support = max((score["entailment"] for score in scores), default=0.0)
    refute = max((score["contradiction"] for score in scores), default=0.0)
    prediction = (
        "INSUFFICIENT"
        if max(support, refute) < 0.5
        else "SUPPORTS"
        if support >= refute
        else "REFUTES"
    )
    return prediction, {"support": support, "refute": refute}


def run_split(name: str, records: list[dict], corpus, nli) -> dict:
    REPORTS.mkdir(exist_ok=True)
    checkpoint = REPORTS / f"scifact_{name}_progress.jsonl"
    predictions, gold, durations = [], [], []
    started = time.perf_counter()
    with checkpoint.open("w", encoding="utf-8") as handle:
        for offset in range(0, len(records), 16):
            batch = records[offset : offset + 16]
            batch_started = time.perf_counter()
            evidence = [corpus.search(record["claim"], max_results=3) for record in batch]
            pairs = [
                (item.passage.text, record["claim"])
                for record, items in zip(batch, evidence)
                for item in items
                if item.passage
            ]
            all_scores = nli.score_batch(
                [pair[0] for pair in pairs], [pair[1] for pair in pairs]
            )
            score_index = 0
            for local_index, (record, items) in enumerate(zip(batch, evidence), 1):
                claim_started = time.perf_counter()
                item_count = len([item for item in items if item.passage])
                item_scores = all_scores[score_index : score_index + item_count]
                score_index += item_count
                support = max((score["entailment"] for score in item_scores), default=0.0)
                refute = max((score["contradiction"] for score in item_scores), default=0.0)
                prediction = (
                    "INSUFFICIENT"
                    if max(support, refute) < 0.5
                    else "SUPPORTS"
                    if support >= refute
                    else "REFUTES"
                )
                duration = (time.perf_counter() - claim_started) or (
                    (time.perf_counter() - batch_started) / len(batch)
                )
                durations.append(duration)
                predictions.append(prediction)
                if name == "dev":
                    gold.append(gold_label(record))
                row = {
                    "index": offset + local_index,
                    "id": record.get("id"),
                    "claim": record["claim"],
                    "prediction": prediction,
                    "scores": {"support": support, "refute": refute},
                    "seconds": round(duration, 4),
                }
                handle.write(json.dumps(row) + "\n")
                handle.flush()
                print(
                    f"{name} {offset + local_index}/{len(records)} "
                    f"batch={time.perf_counter() - batch_started:.2f}s",
                    flush=True,
                )
    output = {
        "dataset": f"SciFact {name}",
        "note": "Small-sample, not a full benchmark. The NLI model has FEVER/ANLI training overlap.",
        "seed": SEED,
        "rows": len(records),
        "retrieval_max_results": 3,
        "average_seconds_per_claim": sum(durations) / len(durations),
        "p95_seconds_per_claim": sorted(durations)[max(0, int(len(durations) * 0.95) - 1)],
        "latency_seconds": time.perf_counter() - started,
        "predictions": predictions,
    }
    if name == "dev":
        report = classification_report(
            gold, predictions, labels=LABELS, output_dict=True, zero_division=0
        )
        output.update(
            {
                "accuracy": report["accuracy"],
                "macro_f1": report["macro avg"]["f1-score"],
                "classification_report": report,
                "confusion_matrix": confusion_matrix(
                    gold, predictions, labels=LABELS
                ).tolist(),
            }
        )
    else:
        output["note"] += " SciFact test claims are unlabeled in the downloaded release; no accuracy is reported."
    (REPORTS / f"scifact_{name}.json").write_text(
        json.dumps(output, indent=2), encoding="utf-8"
    )
    return output


def main() -> None:
    random.seed(SEED)
    corpus = LocalSciFactCorpus(DATA / "corpus.jsonl")
    nli = load_nli_model()
    dev = [
        json.loads(line)
        for line in (DATA / "claims_dev.jsonl").read_text(encoding="utf-8").splitlines()
    ]
    test = [
        json.loads(line)
        for line in (DATA / "claims_test.jsonl").read_text(encoding="utf-8").splitlines()
    ]
    dev_subset = random.sample(dev, 60)
    test_subset = random.sample(test, 60)
    print(json.dumps(run_split("dev", dev_subset, corpus, nli), indent=2))
    print(json.dumps(run_split("test", test_subset, corpus, nli), indent=2))


if __name__ == "__main__":
    main()
