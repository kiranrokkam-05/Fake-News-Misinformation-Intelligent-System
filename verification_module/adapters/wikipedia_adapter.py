"""
Adapter for the Wikipedia REST API.

No API key required, so this adapter is ALWAYS available -- it is
what powers the "does this topic already exist" check used by the
EXISTING TOPIC / STATUS NOT ESTABLISHED verdict, even when zero paid
API keys are configured.

Docs: https://www.mediawiki.org/wiki/API:Search
"""

from datetime import datetime, timezone
from typing import List

from verification_module import config
from verification_module.adapters.base import SearchAdapter
from verification_module.models import EvidenceItem
from verification_module.retrieval.http_client import DEFAULT_HTTP_CLIENT
from verification_module.retrieval.passages import sentence_windows


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

        resp = DEFAULT_HTTP_CLIENT.get(self.ENDPOINT, params=params)
        data = resp.json()

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
            page_data = self._fetch_page(title)
            extract = page_data.get("extract", "")
            passages = sentence_windows(extract, title)
            revision_id = page_data.get("revision_id")
            permalink = (
                f"https://en.wikipedia.org/w/index.php?oldid={revision_id}"
                if revision_id
                else page_url
            )

            results.append(
                EvidenceItem(
                    source_name="Wikipedia",
                    title=title,
                    snippet=snippet,
                    url=page_url,
                    published_at=None,
                    provider=self.provider_name,
                    permalink=permalink,
                    revision_id=revision_id,
                    retrieved_at=datetime.now(timezone.utc),
                    source_type="encyclopedia",
                    license_note="Wikipedia text is available under CC BY-SA; verify current page terms.",
                    passage=passages[0] if passages else None,
                    relevance=0.0,
                )
            )
        return results

    def _fetch_page(self, title: str) -> dict:
        params = {
            "action": "query",
            "prop": "extracts|revisions",
            "explaintext": "1",
            "exintro": "0",
            "rvprop": "ids",
            "rvlimit": "1",
            "titles": title,
            "format": "json",
        }
        data = DEFAULT_HTTP_CLIENT.get(self.ENDPOINT, params=params).json()
        pages = data.get("query", {}).get("pages", {})
        page = next(iter(pages.values()), {})
        revisions = page.get("revisions", [])
        return {
            "extract": page.get("extract", ""),
            "revision_id": str(revisions[0].get("revid"))
            if revisions and revisions[0].get("revid")
            else None,
        }
