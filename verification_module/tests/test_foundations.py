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


def test_http_errors_do_not_echo_provider_url_or_credentials(monkeypatch):
    import requests

    class Response:
        status_code = 429

    client = RetrievalHttpClient({"example.com"})
    monkeypatch.setattr(
        client.session,
        "get",
        lambda *args, **kwargs: (_ for _ in ()).throw(
            requests.HTTPError("429 for https://example.com?q=test&key=NEVER-ECHO", response=Response())
        ),
    )
    with pytest.raises(RetrievalHTTPError) as exc:
        client.get("https://example.com/resource")
    assert str(exc.value) == "Provider returned HTTP 429"
    assert "NEVER-ECHO" not in str(exc.value)


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


def test_provider_http_failure_is_reported_without_negative_evidence(monkeypatch):
    from verification_module import evidence_retrieval

    class BrokenProvider:
        provider_name = "broken_test_provider"

        def is_configured(self):
            return True

        def search(self, query, max_results=5):
            raise RetrievalHTTPError("Provider returned HTTP 429")

    monkeypatch.setattr(evidence_retrieval, "ALL_ADAPTERS", [BrokenProvider()])
    result = evidence_retrieval.retrieve_evidence_with_status("The test result is 42.")
    assert result.evidence == []
    assert len(result.provider_statuses) == 1
    assert result.provider_statuses[0].status == ProviderStatusValue.ERROR
    assert "429" in result.provider_statuses[0].reason
