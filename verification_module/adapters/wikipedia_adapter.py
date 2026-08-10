"""
Adapter for the Wikipedia REST API.

No API key required, so this adapter is ALWAYS available -- it is
what powers the "does this topic already exist" check used by the
EXISTING TOPIC / STATUS NOT ESTABLISHED verdict, even when zero paid
API keys are configured.

Docs: https://www.mediawiki.org/wiki/API:Search
"""

from typing import List

import requests

from verification_module import config
from verification_module.adapters.base import SearchAdapter
from verification_module.models import EvidenceItem


class WikipediaAdapter(SearchAdapter):
    provider_name = "wikipedia"
    ENDPOINT = "https://en.wikipedia.org/w/api.php"

    def is_configured(self) -> bool:
        return config.WIKIPEDIA_ENABLED

    def search(self, query: str, max_results: int = 5) -> List[EvidenceItem]:
        if not self.is_configured():
            return []

        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": max_results,
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
        for item in data.get("query", {}).get("search", [])[:max_results]:
            title = item.get("title", "")
            # strip the HTML <span> highlight tags Wikipedia puts in snippets
            snippet = (
                item.get("snippet", "")
                .replace('<span class="searchmatch">', "")
                .replace("</span>", "")
            )
            page_url = "https://en.wikipedia.org/wiki/" + title.replace(" ", "_")

            results.append(
                EvidenceItem(
                    source_name="Wikipedia",
                    title=title,
                    snippet=snippet,
                    url=page_url,
                    published_at=None,
                    provider=self.provider_name,
                )
            )
        return results
