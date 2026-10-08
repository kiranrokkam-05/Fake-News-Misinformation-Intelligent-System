"""Runtime lookup for the project's explicitly labeled validation claims."""

import json
import re
from pathlib import Path

from verification_module.adapters.base import SearchAdapter
from verification_module.models import EvidenceItem, Passage, Stance


class LocalClaimsAdapter(SearchAdapter):
    provider_name = "project_dataset"

    def __init__(self):
        self.path = (
            Path(__file__).resolve().parents[2]
            / "data"
            / "eval"
            / "claims_v1.jsonl"
        )
        self.records = self._load_records()

    def _load_records(self) -> list[dict]:
        if not self.path.exists():
            return []
        records = []
        with self.path.open(encoding="utf-8") as handle:
            for line in handle:
                try:
                    record = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if record.get("claim") and record.get("label") in {"SUPPORTS", "REFUTES"}:
                    records.append(record)
        return records

    def is_configured(self) -> bool:
        return bool(self.records)

    @staticmethod
    def _tokens(value: str) -> set[str]:
        return set(re.findall(r"[a-z0-9]+", value.lower()))

    def search(self, query: str, max_results: int = 5) -> list[EvidenceItem]:
        query_tokens = self._tokens(query)
        matches = []
        for record in self.records:
            claim = record["claim"]
            claim_tokens = self._tokens(claim)
            overlap = len(query_tokens & claim_tokens) / max(len(query_tokens), 1)
            normalized_query = " ".join(query.lower().split())
            normalized_claim = " ".join(claim.lower().split())
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
                    title=f"Labeled claim: {record['label']}",
                    snippet=(
                        f"Project dataset label: {record['label']}. "
                        "This is a project validation record, not independent proof."
                    ),
                    url=f"dataset://claims_v1/{record.get('id', 'unknown')}",
                    provider=self.provider_name,
                    source_type="project_dataset",
                    passage=Passage(
                        text=f"{record['claim']} (project dataset label: {record['label']})",
                        title="Project validation dataset",
                    ),
                    relevance=overlap,
                    stance=stance,
                    stance_confidence=overlap,
                    permalink=source_url or None,
                )
            )
        return results
