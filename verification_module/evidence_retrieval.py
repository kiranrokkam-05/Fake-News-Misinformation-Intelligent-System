"""
Evidence Retrieval Pipeline.

    Extracted Claim -> Query Generation -> Search Adapters (parallel)
    -> Aggregate -> Deduplicate -> return list[EvidenceItem]

Query generation itself belongs to the NLP & ML Developer's module
(Step 14 in the project doc). Here we provide a simple stand-in so
this module runs on its own; swap `generate_queries()` for the real
NLP module's output once it's ready.
"""

import time
from dataclasses import dataclass
from typing import List

from verification_module import config
from verification_module.adapters import ALL_ADAPTERS
from verification_module.models import EvidenceItem, ProviderStatus, ProviderStatusValue
from verification_module.retrieval.http_client import RetrievalHTTPError
from verification_module.logging_setup import logger


@dataclass
class RetrievalResult:
    evidence: List[EvidenceItem]
    provider_statuses: List[ProviderStatus]


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

    return retrieve_evidence_with_status(claim).evidence


def retrieve_evidence_with_status(claim: str) -> RetrievalResult:
    queries = generate_queries(claim)
    all_results: List[EvidenceItem] = []
    statuses: List[ProviderStatus] = []

    for adapter in ALL_ADAPTERS:
        started = time.perf_counter()
        if not adapter.is_configured():
            statuses.append(
                ProviderStatus(
                    adapter.provider_name,
                    ProviderStatusValue.SKIPPED,
                    "provider is not configured",
                )
            )
            continue  # skip providers with no API key set
        for query in queries:
            try:
                results = adapter.search(
                    query, max_results=config.MAX_RESULTS_PER_ADAPTER
                )
                all_results.extend(results)
                statuses.append(
                    ProviderStatus(
                        adapter.provider_name,
                        ProviderStatusValue.OK,
                        latency_ms=(time.perf_counter() - started) * 1000,
                        n_results=len(results),
                    )
                )
            except (RetrievalHTTPError, ValueError, RuntimeError) as exc:
                logger.warning(
                    "provider retrieval failed: %s (%s)", adapter.provider_name, exc
                )
                statuses.append(
                    ProviderStatus(
                        adapter.provider_name,
                        ProviderStatusValue.ERROR,
                        reason=str(exc),
                        latency_ms=(time.perf_counter() - started) * 1000,
                    )
                )

    return RetrievalResult(_deduplicate(all_results), statuses)


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
