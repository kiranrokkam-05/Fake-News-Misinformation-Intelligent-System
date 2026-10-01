import os

import pytest

from verification_module import config
from verification_module.evidence_retrieval import retrieve_evidence_with_status
from verification_module.models import ProviderStatusValue
from verification_module.retrieval.http_client import (
    RetrievalHTTPError,
    RetrievalHttpClient,
)


def test_settings_load_with_safe_defaults():
    assert config.settings.request_timeout_seconds > 0
    assert config.settings.max_response_bytes > 0
    assert config.WIKIPEDIA_USER_AGENT


def test_http_client_rejects_non_allowlisted_host():
    client = RetrievalHttpClient({"example.com"})
    with pytest.raises(RetrievalHTTPError, match="not allowlisted"):
        client.get("https://not-example.com/resource")


def test_empty_optional_providers_are_reported_as_skipped(monkeypatch):
    for name in (
        "NEWSAPI_KEY",
        "GNEWS_KEY",
        "GOOGLE_CSE_KEY",
        "GOOGLE_CSE_CX",
        "GOOGLE_FACTCHECK_KEY",
    ):
        monkeypatch.delenv(name, raising=False)
    result = retrieve_evidence_with_status("A test claim")
    names = {status.name for status in result.provider_statuses}
    assert {"newsapi", "gnews", "google_cse", "google_factcheck"} <= names
    assert all(
        status.status == ProviderStatusValue.SKIPPED
        for status in result.provider_statuses
        if status.name != "wikipedia"
    )
