"""
Source Credibility Scoring.

Assigns each EvidenceItem a 0-100 credibility score based on domain
reputation, source type, and provider. This is intentionally a
simple, transparent rule-based scorer for the project skeleton --
easy to explain in a viva, and easy to extend later with a proper
domain-reputation dataset or third-party API.
"""

from urllib.parse import urlparse

from verification_module.models import EvidenceItem

# Domains considered high-credibility (government, official, major
# wire services, established fact-checkers). Extend this list as
# needed -- this is deliberately a small illustrative set.
HIGH_CREDIBILITY_DOMAINS = {
    "gov", "gov.in", "nic.in", "who.int", "un.org", "nasa.gov", "isro.gov.in",
    "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "thehindu.com",
    "pib.gov.in", "wikipedia.org",
}

MEDIUM_CREDIBILITY_DOMAINS = {
    "cnn.com", "nytimes.com", "theguardian.com", "ndtv.com",
    "indianexpress.com", "hindustantimes.com", "timesofindia.indiatimes.com",
}

# Fact-checking organizations get a boost because they already do
# verification work themselves.
FACT_CHECK_PROVIDERS = {"google_factcheck"}


def _domain_of(url: str) -> str:
    try:
        netloc = urlparse(url).netloc.lower()
        return netloc[4:] if netloc.startswith("www.") else netloc
    except Exception:
        return ""


def score_source(item: EvidenceItem) -> float:
    """Return a 0-100 credibility score for a single evidence item.

    TODO (real version): incorporate publication date recency,
    author/publisher metadata, and multi-source corroboration counts
    instead of only a static domain list.
    """

    domain = _domain_of(item.url)
    score = 40.0  # neutral baseline for an unrecognized domain

    if item.provider in FACT_CHECK_PROVIDERS:
        score = 90.0
    elif any(domain == d or domain.endswith("." + d) for d in HIGH_CREDIBILITY_DOMAINS):
        score = 90.0
    elif any(domain == d or domain.endswith("." + d) for d in MEDIUM_CREDIBILITY_DOMAINS):
        score = 70.0
    elif domain.endswith(".gov") or ".gov." in domain:
        score = 90.0
    elif domain.endswith(".edu") or ".ac." in domain:
        score = 75.0

    return max(0.0, min(100.0, score))


def score_all(items: list) -> list:
    """Mutate and return the list with credibility_score filled in."""
    for item in items:
        item.credibility_score = score_source(item)
    return items
