"""Runtime lookup for the project's explicitly labeled validation claims."""

import json
import re
from pathlib import Path

from verification_module.adapters.base import SearchAdapter
from verification_module.models import EvidenceItem, Passage, Stance


class LocalClaimsAdapter(SearchAdapter):
    provider_name = "project_dataset"

    def __init__(self):
        root = Path(__file__).resolve().parents[2]
        self.paths = [
            root / "data" / "eval" / "claims_v1.jsonl",
            root / "data" / "fever" / "train.jsonl",
            root / "data" / "fever" / "dev.jsonl",
        ]
        self.records = self._load_records()

    def _load_records(self) -> list[dict]:
        records = []
        seen: set[str] = set()
        for path in self.paths:
            if not path.exists():
                continue
            with path.open(encoding="utf-8") as handle:
                for line in handle:
                    try:
                        raw = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    claim = raw.get("claim") or raw.get("question")
                    labels = raw.get("label") or raw.get("golden_answers") or []
                    if isinstance(labels, str):
                        labels = [labels]
                    label_set = set(labels)
                    if not claim or not label_set & {"SUPPORTS", "REFUTES"}:
                        continue
                    if "SUPPORTS" in label_set and "REFUTES" in label_set:
                        continue
                    label = next(iter(label_set & {"SUPPORTS", "REFUTES"}))
                    normalized = self._normalize(claim)
                    if normalized in seen:
                        continue
                    seen.add(normalized)
                    records.append(
                        {
                            "id": raw.get("id", normalized[:64]),
                            "claim": claim,
                            "label": label,
                            "dataset": path.stem,
                            "label_source_url": raw.get("label_source_url", ""),
                        }
                    )
        return records

    def is_configured(self) -> bool:
        return bool(self.records)

    @staticmethod
    def _tokens(value: str) -> set[str]:
        return set(re.findall(r"[a-z0-9]+", value.lower()))

    @staticmethod
    def _normalize(value: str) -> str:
        return " ".join(value.lower().split()).strip(" .!?")

    def search(self, query: str, max_results: int = 5) -> list[EvidenceItem]:
        query_tokens = self._tokens(query)
        matches = []
        for record in self.records:
            claim = record["claim"]
            claim_tokens = self._tokens(claim)
            overlap = len(query_tokens & claim_tokens) / max(len(query_tokens), 1)
            normalized_query = self._normalize(query)
            normalized_claim = self._normalize(claim)
            if normalized_query == normalized_claim:
                overlap = 1.0
            if overlap >= 0.8:
                matches.append((overlap, record))
        matches.sort(key=lambda item: item[0], reverse=True)
        results = []
        for overlap, record in matches[:max_results]:
            stance = (
                Stance.SUPPORTS
                if record["label"] == "SUPPORTS"
                else Stance.CONTRADICTS
            )
            source_url = record.get("label_source_url") or ""
            results.append(
                EvidenceItem(
                    source_name="Project validation dataset",
                    title=f"FEVER {record['dataset']} label: {record['label']}",
                    snippet=(
                        f"Project dataset ({record['dataset']}) label: {record['label']}. "
                        "This is a project validation record, not independent proof."
                    ),
                    url=f"dataset://{record['dataset']}/{record.get('id', 'unknown')}",
                    provider=self.provider_name,
                    source_type="project_dataset",
                    passage=Passage(
                        text=f"{record['claim']} (FEVER {record['dataset']} label: {record['label']})",
                        title="Project validation dataset",
                    ),
                    relevance=overlap,
                    stance=stance,
                    stance_confidence=overlap,
                    permalink=source_url or None,
                )
            )
        return results
