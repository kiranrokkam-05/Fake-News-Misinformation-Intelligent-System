"""
Configuration.

All API keys are read from environment variables (never hard-code
keys). Copy .env.example to .env and fill in whichever free-tier
keys you actually have -- adapters whose key is missing are simply
skipped at runtime instead of crashing, so the pipeline still works
with zero keys configured (using Wikipedia + mock evidence only).
"""

import os
from dataclasses import dataclass
from pathlib import Path

# Load the project-local secrets file automatically. The file remains ignored
# by Git, so credentials never need to be committed or exported manually.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOTENV_PATH = PROJECT_ROOT / "verification_module" / ".env"
try:
    from dotenv import load_dotenv
    load_dotenv(DOTENV_PATH)
except ImportError:
    # Keep first-run startup working before dependencies are installed.
    if DOTENV_PATH.exists():
        for line in DOTENV_PATH.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"\''))

# ---------------------------------------------------------------------
# Search / evidence provider API keys (all optional; free tiers)
# ---------------------------------------------------------------------
NEWSAPI_KEY = os.environ.get("NEWSAPI_KEY", "")          # newsapi.org
GNEWS_KEY = os.environ.get("GNEWS_KEY", "")               # gnews.io
GOOGLE_CSE_KEY = os.environ.get("GOOGLE_CSE_KEY", "")      # Google Custom Search JSON API
GOOGLE_CSE_CX = os.environ.get("GOOGLE_CSE_CX", "")        # Custom Search Engine ID
GOOGLE_FACTCHECK_KEY = os.environ.get("GOOGLE_FACTCHECK_KEY", "")  # Fact Check Tools API

# Wikipedia's REST API needs no key -- always available as a
# baseline "does this topic exist" source.
WIKIPEDIA_ENABLED = True
WIKIPEDIA_USER_AGENT = os.environ.get(
    "WIKIPEDIA_USER_AGENT",
    "FakeNewsClaimVerifier/0.1 (local development)",
)

# ---------------------------------------------------------------------
# Pipeline behaviour
# ---------------------------------------------------------------------
MAX_RESULTS_PER_ADAPTER = 5
REQUEST_TIMEOUT_SECONDS = 8
MAX_RESPONSE_BYTES = 2_000_000


@dataclass(frozen=True)
class Settings:
    """Small compatibility view of shared retrieval safety settings."""

    request_timeout_seconds: int = REQUEST_TIMEOUT_SECONDS
    max_response_bytes: int = MAX_RESPONSE_BYTES


settings = Settings()


def get_api_key(name: str) -> str:
    """Read credentials dynamically so runtime env changes and tests apply."""
    return os.environ.get(name, "")

# Verdict thresholds (0-1 scale of aggregated support). Tune these
# once real similarity/NLI scores are wired in.
SUPPORT_THRESHOLD = 0.65
CONTRADICTION_THRESHOLD = 0.65
MIN_EVIDENCE_FOR_DECISION = 1
