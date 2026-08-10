"""
Evidence Retrieval Pipeline.

    Extracted Claim -> Query Generation -> Search Adapters (parallel)
    -> Aggregate -> Deduplicate -> return list[EvidenceItem]

Query generation itself belongs to the NLP & ML Developer's module
(Step 14 in the project doc). Here we provide a simple stand-in so
this module runs on its own; swap `generate_queries()` for the real
NLP module's output once it's ready.
"""

from typing import List

from verification_module import config
from verification_module.adapters import ALL_ADAPTERS
from verification_module.models import EvidenceItem


def generate_queries(claim: str) -> List[str]:
    """STUB query generation.

    TODO: replace with the NLP & ML Developer's real query-generation
    step (keyphrase extraction + NER-driven query variants, per
    project doc Step 14). For now we just use the raw claim -- good
    enough to exercise the full pipeline end-to-end.
    """
    return [claim]


def retrieve_evidence(claim: str) -> List[EvidenceItem]:
    """Run the claim through every configured adapter and return a
    single deduplicated list of EvidenceItem."""

    queries = generate_queries(claim)
    all_results: List[EvidenceItem] = []

    for adapter in ALL_ADAPTERS:
        if not adapter.is_configured():
            continue  # skip providers with no API key set
        for query in queries:
            try:
                results = adapter.search(
                    query, max_results=config.MAX_RESULTS_PER_ADAPTER
                )
                all_results.extend(results)
            except Exception:
                # A single misbehaving adapter should never take down
                # the whole pipeline.
                continue

    return _deduplicate(all_results)


def _deduplicate(items: List[EvidenceItem]) -> List[EvidenceItem]:
    """Remove evidence items that point at the same URL."""
    seen = set()
    deduped = []
    for item in items:
        key = item.url or (item.source_name, item.title)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped
