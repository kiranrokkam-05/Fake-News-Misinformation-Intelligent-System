import json
from pathlib import Path

from verification_module.models import EvidenceItem, Passage
from verification_module.retrieval.hybrid import hybrid_relevance


class LocalSciFactCorpus:
    def __init__(self, corpus_path: str | Path):
        self.documents = []
        with Path(corpus_path).open(encoding="utf-8") as handle:
            for line in handle:
                document = json.loads(line)
                text = " ".join(document.get("abstract", []))
                self.documents.append((document, text))

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
                provider="scifact_local",
                source_type="scientific_corpus",
                passage=Passage(
                    text=f"{document.get('title', '')}: {text}",
                    title=document.get("title", ""),
                ),
                relevance=hybrid_relevance(query, text),
            )
            for document, text in ranked
        ]
