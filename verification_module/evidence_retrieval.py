"""
Evidence Retrieval Pipeline.

    Extracted Claim -> Query Generation -> Search Adapters (parallel)
    -> Aggregate -> Deduplicate -> return list[EvidenceItem]

Queries are generated from content terms, named-entity-like tokens, and
quantities. Provider failures are recorded as status and never become
negative evidence.
"""

import time
from dataclasses import dataclass
from typing import List

from verification_module import config
from verification_module.adapters import ALL_ADAPTERS
from verification_module.models import EvidenceItem, ProviderStatus, ProviderStatusValue
from verification_module.retrieval.http_client import RetrievalHTTPError
from verification_module.logging_setup import logger
from verification_module.retrieval.queries import generate_claim_queries


@dataclass
class RetrievalResult:
    evidence: List[EvidenceItem]
    provider_statuses: List[ProviderStatus]
    queries: List[str]


def generate_queries(claim: str) -> List[str]:
    """Generate concise claim-focused provider queries."""
    return generate_claim_queries(claim)


def retrieve_evidence(claim: str) -> List[EvidenceItem]:
    """Run the claim through every configured adapter and return a
    single deduplicated list of EvidenceItem."""

    return retrieve_evidence_with_status(claim).evidence


def retrieve_evidence_with_status(claim: str) -> RetrievalResult:
    queries = generate_queries(claim)
    all_results: List[EvidenceItem] = []
    statuses: List[ProviderStatus] = []

    for adapter in ALL_ADAPTERS:
        if not adapter.is_configured():
            reason = (
                "dataset file unavailable"
                if adapter.provider_name == "project_dataset"
                else "provider is not configured"
            )
            statuses.append(
                ProviderStatus(
                    adapter.provider_name,
                    ProviderStatusValue.SKIPPED,
                    reason,
                )
            )
            continue  # skip providers with no API key set
        started = time.perf_counter()
        provider_results = []
        failures = []
        successes = 0
        adapter_queries = [claim] if adapter.provider_name == "project_dataset" else queries[:2]
        for query in adapter_queries:
            try:
                results = adapter.search(
                    query, max_results=config.MAX_RESULTS_PER_ADAPTER
                )
                provider_results.extend(results)
                successes += 1
            except Exception as exc:
                # Catch provider/network/HTTP/JSON failures at the boundary so
                # one broken key or a 400/429 cannot fail verification or add
                # a negative stance vote.
                if isinstance(exc, (KeyboardInterrupt, SystemExit)):
                    raise
                safe_reason = (
                    str(exc)
                    if isinstance(exc, RetrievalHTTPError)
                    else f"provider response failed ({type(exc).__name__})"
                )
                failures.append(safe_reason)
                logger.warning(
                    "provider retrieval failed: %s (%s)", adapter.provider_name, safe_reason
                )
        all_results.extend(provider_results)
        if successes:
            status = ProviderStatusValue.OK
            reason = f"{len(failures)} query request(s) failed" if failures else ""
        else:
            status = ProviderStatusValue.ERROR
            reason = "; ".join(failures)[:500] or "No search query was generated"
        statuses.append(ProviderStatus(
            adapter.provider_name,
            status,
            reason=reason,
            latency_ms=(time.perf_counter() - started) * 1000,
            n_results=len(provider_results),
        ))

    return RetrievalResult(_deduplicate(all_results), statuses, queries[:2])


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
