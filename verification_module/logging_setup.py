"""Structured logging helpers that avoid logging claim contents at INFO."""

import hashlib
import json
import logging
import time


class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        return json.dumps(payload, separators=(",", ":"))


logger = logging.getLogger("verification_module")


def claim_metadata(claim: str) -> dict:
    return {
        "claim_sha256": hashlib.sha256(claim.encode("utf-8")).hexdigest(),
        "claim_length": len(claim),
    }
