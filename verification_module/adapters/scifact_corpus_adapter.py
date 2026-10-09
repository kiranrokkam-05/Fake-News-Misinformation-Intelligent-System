"""Search the bundled SciFact scientific corpus as neutral evidence."""

import json
from pathlib import Path

from verification_module.adapters.base import SearchAdapter
from verification_module.models import EvidenceItem, Passage
from verification_module.retrieval.hybrid import hybrid_relevance


class SciFactCorpusAdapter(SearchAdapter):
    provider_name = "scifact_corpus"

    def __init__(self):
        self.path = (
            Path(__file__).resolve().parents[2]
            / "data"
            / "eval"
            / "scifact"
            / "corpus.jsonl"
        )
        self.documents = self._load()

    def _load(self) -> list[tuple[dict, str]]:
        if not self.path.exists():
            return []
        documents = []
        with self.path.open(encoding="utf-8") as handle:
            for line in handle:
                try:
                    document = json.loads(line)
                except json.JSONDecodeError:
                    continue
                text = " ".join(document.get("abstract", []))
                if text:
                    documents.append((document, text))
        return documents

    def is_configured(self) -> bool:
        return bool(self.documents)

    def search(self, query: str, max_results: int = 5) -> list[EvidenceItem]:
        ranked = sorted(
            self.documents,
            key=lambda item: hybrid_relevance(query, item[1]),
            reverse=True,
        )[:max_results]
        return [
            EvidenceItem(
                source_name="SciFact corpus",
                title=document.get("title", ""),
                snippet=text,
                url=f"scifact://{document.get('doc_id')}",
                provider=self.provider_name,
                source_type="scientific_corpus",
                passage=Passage(
                    text=f"{document.get('title', '')}: {text}",
                    title=document.get("title", ""),
                ),
                relevance=hybrid_relevance(query, text),
            )
            for document, text in ranked
        ]
