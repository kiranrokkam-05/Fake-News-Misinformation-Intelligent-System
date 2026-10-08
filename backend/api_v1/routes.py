import json
from functools import wraps
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from pydantic import ValidationError
import requests

from .errors import error_payload
from .schemas import ArticleRequest, BatchRequest, UrlRequest, VerifyRequest
from .service import evidence_service
from verification_module.reasoning.nli import ModelUnavailable
from verification_module.adapters import ALL_ADAPTERS

api_v1 = Blueprint("api_v1", __name__, url_prefix="/api/v1")


def _json_only(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not request.is_json:
            return jsonify(error_payload("unsupported_media_type", "JSON content type is required")), 415
        return view(*args, **kwargs)
    return wrapped


@api_v1.errorhandler(ValidationError)
def validation_error(error):
    return jsonify(error_payload("validation_error", "Request validation failed", error.errors())), 400


@api_v1.errorhandler(ModelUnavailable)
def model_unavailable(error):
    return jsonify(error_payload("models_not_ready", str(error))), 503


@api_v1.errorhandler(ValueError)
def value_error(error):
    return jsonify(error_payload("invalid_request", str(error))), 400


@api_v1.errorhandler(requests.RequestException)
def upstream_request_error(error):
    return jsonify(error_payload("article_fetch_failed", "Unable to fetch that article URL.")), 422


@api_v1.post("/verify")
@_json_only
def verify():
    payload = VerifyRequest.model_validate(request.get_json(silent=True))
    return jsonify(
        evidence_service.verify(
            payload.claim,
            payload.options.max_evidence,
            payload.options.include_baseline,
            payload.options.recent_window_hours,
        )
    )


@api_v1.post("/verify/batch")
@_json_only
def verify_batch():
    payload = BatchRequest.model_validate(request.get_json(silent=True))
    return jsonify(
        {
            "results": [
                evidence_service.verify(
                    item.claim,
                    item.options.max_evidence,
                    item.options.include_baseline,
                    item.options.recent_window_hours,
                )
                for item in payload.claims
            ]
        }
    )


@api_v1.post("/verify/article")
@_json_only
def verify_article():
    payload = ArticleRequest.model_validate(request.get_json(silent=True))
    sentences = [sentence.strip() for sentence in payload.text.split(".") if sentence.strip()]
    return jsonify(
        {
            "results": [
                evidence_service.verify(sentence, 5, False, 4)
                for sentence in sentences[:20]
                if len(sentence) >= 5
            ]
        }
    )


@api_v1.post("/verify/url")
@_json_only
def verify_url():
    payload = UrlRequest.model_validate(request.get_json(silent=True))
    return jsonify(evidence_service.verify_url(payload.url))


@api_v1.get("/health/live")
def health_live():
    return jsonify({"status": "alive"})


@api_v1.get("/health/ready")
def health_ready():
    readiness = evidence_service.readiness()
    return jsonify(
        {
            "status": "ready" if readiness["ready"] else "not_ready",
            **readiness,
            "providers": "configured through verification_module settings",
        }
    ), 200 if readiness["ready"] else 503


@api_v1.get("/version")
def version():
    return jsonify({"api_version": "v1", "pipeline_version": "api-v1-evidence-nli"})


@api_v1.get("/models")
def models():
    return jsonify(
        {
            "evidence_assessment": {
                "name": "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli",
                "calibration": "uncalibrated",
            },
            "baseline": {
                "name": "binary_claim_classifier_v2",
                "role": "diagnostic non-evidence baseline",
            },
        }
    )


@api_v1.get("/providers")
def providers():
    return jsonify(
        {
            "providers": [
                {
                    "name": adapter.provider_name,
                    "configured": adapter.is_configured(),
                }
                for adapter in ALL_ADAPTERS
            ]
        }
    )
