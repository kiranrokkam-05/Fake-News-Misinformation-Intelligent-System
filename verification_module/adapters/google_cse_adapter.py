"""
Adapter for Google Programmable / Custom Search JSON API (free tier).

Docs: https://developers.google.com/custom-search/v1/overview
Free tier: 100 queries/day.

Needs TWO values: an API key and a Search Engine ID ("cx"), both
free to create at https://programmablesearchengine.google.com/
"""

from typing import List

import requests

from verification_module import config
from verification_module.adapters.base import SearchAdapter
from verification_module.models import EvidenceItem


class GoogleCSEAdapter(SearchAdapter):
    provider_name = "google_cse"
    ENDPOINT = "https://www.googleapis.com/customsearch/v1"

    def is_configured(self) -> bool:
        return bool(config.GOOGLE_CSE_KEY and config.GOOGLE_CSE_CX)

    def search(self, query: str, max_results: int = 5) -> List[EvidenceItem]:
        if not self.is_configured():
            return []

        params = {
            "key": config.GOOGLE_CSE_KEY,
            "cx": config.GOOGLE_CSE_CX,
            "q": query,
            "num": min(max_results, 10),  # API max is 10 per request
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
        for item in data.get("items", [])[:max_results]:
            results.append(
                EvidenceItem(
                    source_name=item.get("displayLink", "Unknown"),
                    title=item.get("title", ""),
                    snippet=item.get("snippet", ""),
                    url=item.get("link", ""),
                    published_at=None,  # CSE doesn't reliably return dates
                    provider=self.provider_name,
                )
            )
        return results
