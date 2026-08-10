"""
Base interface every search/evidence adapter must implement.

Why an adapter pattern: the project spec says not to hard-code one
search provider. Any new provider just needs a subclass with a
`search()` method that returns a list of EvidenceItem -- the rest of
the pipeline never changes.
"""

from abc import ABC, abstractmethod
from typing import List

from verification_module.models import EvidenceItem


class SearchAdapter(ABC):
    #: short machine-readable name, e.g. "newsapi"
    provider_name: str = "base"

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if this adapter has what it needs (e.g. an API
        key) to actually run. Unconfigured adapters are skipped."""
        raise NotImplementedError

    @abstractmethod
    def search(self, query: str, max_results: int = 5) -> List[EvidenceItem]:
        """Run a search and return normalized EvidenceItem objects.
        Must never raise on network/API errors -- catch and return
        an empty list so one flaky provider can't break the pipeline."""
        raise NotImplementedError
