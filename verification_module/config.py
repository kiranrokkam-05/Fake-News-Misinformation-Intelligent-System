"""Typed, environment-backed verification settings."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "verification_module/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    newsapi_key: str = Field(default="", validation_alias="NEWSAPI_KEY")
    gnews_key: str = Field(default="", validation_alias="GNEWS_KEY")
    google_cse_key: str = Field(default="", validation_alias="GOOGLE_CSE_KEY")
    google_cse_cx: str = Field(default="", validation_alias="GOOGLE_CSE_CX")
    google_factcheck_key: str = Field(
        default="", validation_alias="GOOGLE_FACTCHECK_KEY"
    )
    wikipedia_enabled: bool = Field(default=True, validation_alias="WIKIPEDIA_ENABLED")
    wikipedia_user_agent: str = Field(
        default="FakeNewsClaimVerifier/0.1 (contact@example.invalid)",
        validation_alias="WIKIPEDIA_USER_AGENT",
    )
    max_results_per_adapter: int = Field(
        default=5, validation_alias="MAX_RESULTS_PER_ADAPTER"
    )
    request_timeout_seconds: float = Field(
        default=8.0, validation_alias="REQUEST_TIMEOUT_SECONDS"
    )
    max_response_bytes: int = Field(
        default=2_000_000, validation_alias="MAX_RESPONSE_BYTES"
    )
    support_threshold: float = Field(default=0.65, validation_alias="SUPPORT_THRESHOLD")
    contradiction_threshold: float = Field(
        default=0.65, validation_alias="CONTRADICTION_THRESHOLD"
    )
    min_evidence_for_decision: int = Field(
        default=1, validation_alias="MIN_EVIDENCE_FOR_DECISION"
    )


settings = Settings()

# Compatibility aliases for the existing adapters and tests.
NEWSAPI_KEY = settings.newsapi_key
GNEWS_KEY = settings.gnews_key
GOOGLE_CSE_KEY = settings.google_cse_key
GOOGLE_CSE_CX = settings.google_cse_cx
GOOGLE_FACTCHECK_KEY = settings.google_factcheck_key
WIKIPEDIA_ENABLED = settings.wikipedia_enabled
WIKIPEDIA_USER_AGENT = settings.wikipedia_user_agent
MAX_RESULTS_PER_ADAPTER = settings.max_results_per_adapter
REQUEST_TIMEOUT_SECONDS = settings.request_timeout_seconds
MAX_RESPONSE_BYTES = settings.max_response_bytes
SUPPORT_THRESHOLD = settings.support_threshold
CONTRADICTION_THRESHOLD = settings.contradiction_threshold
MIN_EVIDENCE_FOR_DECISION = settings.min_evidence_for_decision


def configuration_warnings() -> list[str]:
    warnings = []
    if "example.invalid" in settings.wikipedia_user_agent:
        warnings.append("WIKIPEDIA_USER_AGENT still uses the placeholder contact")
    return warnings
