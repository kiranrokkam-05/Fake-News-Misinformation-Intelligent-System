"""
Adapter for Google's Fact Check Tools API (free).

Docs: https://developers.google.com/fact-check/tools/api
This queries a database of fact-checks already published by
organizations like PolitiFact, Full Fact, etc. -- very useful evidence
when it hits, since it comes with a built-in "rating" (True/False/
Misleading/...) rather than just a raw article.
"""

from typing import List

import requests

from verification_module import config
from verification_module.adapters.base import SearchAdapter
from verification_module.models import EvidenceItem


class FactCheckAdapter(SearchAdapter):
    provider_name = "google_factcheck"
    ENDPOINT = "https://factchecktools.googleapis.com/v1alpha1/claims:search"

    def is_configured(self) -> bool:
        return bool(config.GOOGLE_FACTCHECK_KEY)

    def search(self, query: str, max_results: int = 5) -> List[EvidenceItem]:
        if not self.is_configured():
            return []

        params = {
            "query": query,
            "key": config.GOOGLE_FACTCHECK_KEY,
            "pageSize": max_results,
        }

        try:
            resp = requests.get(
                self.ENDPOINT, params=params, timeout=config.REQUEST_TIMEOUT_SECONDS
            )
            resp.raise_for_status()
            data = resp.json()
        except (requests.RequestException, ValueError):
            return []

        results = []
        for claim in data.get("claims", [])[:max_results]:
            reviews = claim.get("claimReview", [])
            if not reviews:
                continue
            review = reviews[0]
            rating = review.get("textualRating", "Unrated")

            results.append(
                EvidenceItem(
                    source_name=review.get("publisher", {}).get("name", "Fact-checker"),
                    title=claim.get("text", ""),
                    snippet=f"Fact-check rating: {rating}",
                    url=review.get("url", ""),
                    published_at=None,
                    provider=self.provider_name,
                )
            )
        return results
