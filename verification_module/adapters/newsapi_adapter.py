"""
Adapter for NewsAPI.org (free developer tier).

Docs: https://newsapi.org/docs/endpoints/everything
Free tier: 100 requests/day, articles from the last month only.
"""

from datetime import datetime
from typing import List

from verification_module import config
from verification_module.adapters.base import SearchAdapter
from verification_module.models import EvidenceItem
from verification_module.retrieval.http_client import DEFAULT_HTTP_CLIENT


class NewsAPIAdapter(SearchAdapter):
    provider_name = "newsapi"
    ENDPOINT = "https://newsapi.org/v2/everything"

    def is_configured(self) -> bool:
        return bool(config.NEWSAPI_KEY)

    def search(self, query: str, max_results: int = 5) -> List[EvidenceItem]:
        if not self.is_configured():
            return []

        params = {
            "q": query,
            "apiKey": config.NEWSAPI_KEY,
            "pageSize": max_results,
            "sortBy": "relevancy",
            "language": "en",
        }

        resp = DEFAULT_HTTP_CLIENT.get(self.ENDPOINT, params=params)
        data = resp.json()

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
                    snippet=article.get("description") or article.get("content") or "",
                    url=article.get("url", ""),
                    published_at=published_at,
                    provider=self.provider_name,
                )
            )
        return results
