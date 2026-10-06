"""Single constrained HTTP client for evidence providers."""

from dataclasses import dataclass
from urllib.parse import urlparse

import requests

from verification_module import config


class RetrievalHTTPError(RuntimeError):
    """A provider request failed or violated retrieval constraints."""


@dataclass
class HttpResponse:
    status_code: int
    headers: dict
    content: bytes

    def json(self):
        import json

        return json.loads(self.content.decode("utf-8"))


class RetrievalHttpClient:
    def __init__(self, allowed_hosts: set[str] | None = None):
        self.allowed_hosts = allowed_hosts or set()
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": config.WIKIPEDIA_USER_AGENT})

    def get(self, url: str, *, params: dict | None = None) -> HttpResponse:
        host = (urlparse(url).hostname or "").lower()
        if self.allowed_hosts and host not in self.allowed_hosts:
            raise RetrievalHTTPError(f"Outbound host is not allowlisted: {host}")
        try:
            response = self.session.get(
                url,
                params=params,
                timeout=config.REQUEST_TIMEOUT_SECONDS,
                allow_redirects=False,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            status = getattr(getattr(exc, "response", None), "status_code", None)
            if status is not None:
                message = f"Provider returned HTTP {int(status)}"
            elif isinstance(exc, requests.Timeout):
                message = "Provider request timed out"
            elif isinstance(exc, requests.ConnectionError):
                message = "Provider connection failed"
            else:
                message = f"Provider request failed ({type(exc).__name__})"
            # requests exception strings include full URLs. Provider URLs may
            # contain keys in their query strings, so never forward them.
            raise RetrievalHTTPError(message) from None
        if len(response.content) > config.MAX_RESPONSE_BYTES:
            raise RetrievalHTTPError("Provider response exceeded the configured size cap")
        return HttpResponse(response.status_code, dict(response.headers), response.content)


DEFAULT_HTTP_CLIENT = RetrievalHttpClient(
    {
        "en.wikipedia.org",
        "newsapi.org",
        "gnews.io",
        "www.googleapis.com",
        "factchecktools.googleapis.com",
    }
)
