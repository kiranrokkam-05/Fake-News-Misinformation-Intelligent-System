"""
Adapter for GNews.io (free tier).

Docs: https://gnews.io/docs/v4
Free tier: 100 requests/day.
"""

from datetime import datetime
from typing import List

import requests

from verification_module import config
from verification_module.adapters.base import SearchAdapter
from verification_module.models import EvidenceItem


class GNewsAdapter(SearchAdapter):
    provider_name = "gnews"
    ENDPOINT = "https://gnews.io/api/v4/search"

    def is_configured(self) -> bool:
        return bool(config.GNEWS_KEY)

    def search(self, query: str, max_results: int = 5) -> List[EvidenceItem]:
        if not self.is_configured():
            return []

        params = {
            "q": query,
            "token": config.GNEWS_KEY,
            "max": max_results,
            "lang": "en",
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
        for article in data.get("articles", [])[:max_results]:
            published_at = None
            if article.get("publishedAt"):
                try:
                    published_at = datetime.fromisoformat(
                        article["publishedAt"].replace("Z", "+00:00")
                    )
                except ValueError:
                    published_at = None

            results.append(
                EvidenceItem(
                    source_name=(article.get("source") or {}).get("name", "Unknown"),
                    title=article.get("title", ""),
                    snippet=article.get("description", ""),
                    url=article.get("url", ""),
                    published_at=published_at,
                    provider=self.provider_name,
                )
            )
        return results
