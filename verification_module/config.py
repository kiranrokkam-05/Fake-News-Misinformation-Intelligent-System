"""
Configuration.

All API keys are read from environment variables (never hard-code
keys). Copy .env.example to .env and fill in whichever free-tier
keys you actually have -- adapters whose key is missing are simply
skipped at runtime instead of crashing, so the pipeline still works
with zero keys configured (using Wikipedia + mock evidence only).
"""

import os

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

# ---------------------------------------------------------------------
# Pipeline behaviour
# ---------------------------------------------------------------------
MAX_RESULTS_PER_ADAPTER = 5
REQUEST_TIMEOUT_SECONDS = 8

# Verdict thresholds (0-1 scale of aggregated support). Tune these
# once real similarity/NLI scores are wired in.
SUPPORT_THRESHOLD = 0.65
CONTRADICTION_THRESHOLD = 0.65
MIN_EVIDENCE_FOR_DECISION = 1
