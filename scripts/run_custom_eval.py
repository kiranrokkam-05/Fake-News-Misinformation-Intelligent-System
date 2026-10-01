"""Run the report-only custom validation claims through retrieval and NLI."""

import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from verification_module.evidence_retrieval import retrieve_evidence_with_status
from verification_module.reasoning.nli import load_nli_model
from scripts.run_eval import classify


def main() -> None:
    records = [
        json.loads(line)
        for line in (ROOT / "data" / "eval" / "claims_v1.jsonl")
        .read_text(encoding="utf-8")
        .splitlines()
    ]
    nli = load_nli_model()
    results = []
    for record in records:
        started = time.perf_counter()
        retrieval = retrieve_evidence_with_status(record["claim"])
        prediction, scores = classify(nli, record["claim"], retrieval.evidence[:3])
        results.append(
            {
                "id": record["id"],
                "claim": record["claim"],
                "expected_label": record["label"],
                "prediction": prediction,
                "scores": scores,
                "seconds": time.perf_counter() - started,
                "providers": [
                    {
                        "name": status.name,
                        "status": status.status.value,
                        "reason": status.reason,
                        "n_results": status.n_results,
                    }
                    for status in retrieval.provider_statuses
                ],
                "evidence": [
                    {
                        "title": item.title,
                        "url": item.url,
                        "permalink": item.permalink,
                        "revision_id": item.revision_id,
                        "passage": item.passage.text if item.passage else None,
                    }
                    for item in retrieval.evidence[:3]
                ],
            }
        )
        print(record["id"], prediction, f"{results[-1]['seconds']:.2f}s", flush=True)
    output = {
        "note": "Report-only custom validation; claims were not used for training or tuning.",
        "results": results,
    }
    reports = ROOT / "reports"
    reports.mkdir(exist_ok=True)
    (reports / "custom_validation.json").write_text(
        json.dumps(output, indent=2), encoding="utf-8"
    )
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
