import time
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
import ipaddress
import socket
from urllib.parse import urlparse
from uuid import uuid4

import requests

from verification_module.claims.entities import extract_structure
from verification_module.evidence_retrieval import (
    generate_queries,
    retrieve_evidence_with_status,
)
from verification_module.models import NLIScores, Stance, Verdict
from verification_module.models import Passage
from verification_module.reasoning.aggregate import aggregate_evidence
from verification_module.reasoning.decision import decide_from_aggregation
from verification_module.reasoning.nli import load_nli_model
from verification_module.credibility import score_all


class EvidenceService:
    def __init__(self):
        self._nli = None

    def readiness(self) -> dict:
        try:
            self._get_nli()
            return {"ready": True, "nli_model": "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli"}
        except Exception as exc:
            return {"ready": False, "reason": str(exc)}

    def _get_nli(self):
        if self._nli is None:
            self._nli = load_nli_model()
        return self._nli

    def verify_url(self, url: str) -> dict:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Only valid http or https URLs are supported.")
        hostname = parsed.hostname
        if not hostname:
            raise ValueError("The URL must include a hostname.")
        if hostname.lower() in {"localhost", "localhost.localdomain"}:
            raise ValueError("Local URLs are not supported.")
        try:
            addresses = socket.getaddrinfo(hostname, None)
            if any(ipaddress.ip_address(item[4][0]).is_private for item in addresses):
                raise ValueError("Private-network URLs are not supported.")
        except socket.gaierror as exc:
            raise ValueError("The article hostname could not be resolved.") from exc
        response = requests.get(
            url,
            headers={"User-Agent": "FakeNewsClaimVerifier/0.1"},
            timeout=8,
            allow_redirects=False,
        )
        response.raise_for_status()
        if len(response.content) > 2_000_000:
            raise ValueError("The article is larger than the 2 MB limit.")
        parser = _ArticleTextParser()
        parser.feed(response.text)
        text = " ".join(parser.parts).strip()
        if len(text) < 5:
            raise ValueError("No readable article text was found at that URL.")
        result = self.verify(text[:1000], 10, False, 4)
        result["article"] = {"url": url, "title": parser.title}
        return result

    def verify(
        self,
        claim: str,
        max_evidence: int,
        include_baseline: bool = False,
        recent_window_hours: int = 4,
    ) -> dict:
        started = time.perf_counter()
        nli = self._get_nli()
        retrieval = retrieve_evidence_with_status(claim)
        cutoff = datetime.now(timezone.utc) - timedelta(hours=recent_window_hours)
        retrieved_count = len(retrieval.evidence)
        evidence = [
            item
            for item in retrieval.evidence
            if item.published_at is None or item.published_at >= cutoff
        ][:max_evidence]
        score_all(evidence)
        for item in evidence:
            if item.passage is None and item.snippet:
                item.passage = Passage(
                    text=item.snippet,
                    title=item.title,
                    passage_id=item.url,
                )
        pairs = [(item.passage.text, claim) for item in evidence if item.passage]
        scores = (
            nli.score_batch([pair[0] for pair in pairs], [pair[1] for pair in pairs])
            if pairs
            else []
        )
        for item, score in zip(evidence, scores):
            dataset_label = item.stance if item.source_type == "project_dataset" else None
            item.nli = NLIScores(
                entailment=score["entailment"],
                neutral=score["neutral"],
                contradiction=score["contradiction"],
            )
            if dataset_label is not None:
                # FEVER's explicit label must not be overwritten by NLI
                # scoring the label-bearing dataset passage itself.
                item.stance = dataset_label
                item.stance_confidence = 1.0
                item.weight = 1.0
            else:
                item.stance_confidence = max(score.values())
                item.stance = (
                    Stance.SUPPORTS
                    if score["entailment"] == item.stance_confidence
                    else Stance.CONTRADICTS
                    if score["contradiction"] == item.stance_confidence
                    else Stance.NEUTRAL
                )
                item.weight = max(0.5, min(1.0, item.credibility_score / 100.0))
        aggregation = aggregate_evidence(evidence)
        verdict = decide_from_aggregation(aggregation)
        flags = []
        if not evidence:
            flags.append("no_evidence")
        if any(item.source_type == "project_dataset" for item in evidence):
            flags.append("project_dataset_match")
        if aggregation.contested:
            flags.append("contested")
        structure = extract_structure(claim)
        evidence_strength = max(
            aggregation.support_score, aggregation.refute_score
        )
        result = {
            "request_id": str(uuid4()),
            "pipeline_version": "api-v1-evidence-nli",
            "claim": {
                "text": claim,
                "entities": structure.entities,
                "quantities": structure.quantities,
            },
            "verdict": verdict.value,
            "evidence_strength": round(evidence_strength, 4),
            "strength_band": (
                "strong" if evidence_strength >= 0.75 else
                "moderate" if evidence_strength >= 0.5 else
                "insufficient"
            ),
            "calibration": {"status": "uncalibrated"},
            "recency": {
                "window_hours": recent_window_hours,
                "cutoff": cutoff.isoformat(),
                "retrieved_items": retrieved_count,
                "filtered_items": retrieved_count - len(evidence),
                "timestamped_news_items": sum(
                    item.published_at is not None for item in evidence
                ),
            },
            "flags": flags,
            "evidence": [
                {
                    "id": item.passage.passage_id if item.passage else item.url,
                    "stance": item.stance.value,
                    "passage": item.passage.text if item.passage else item.snippet,
                    "relevance": item.relevance,
                    "nli": {
                        "entail": item.nli.entailment if item.nli else 0.0,
                        "neutral": item.nli.neutral if item.nli else 0.0,
                        "contradict": item.nli.contradiction if item.nli else 0.0,
                    },
                    "weight": item.weight,
                    "source": {
                        "provider": item.provider,
                        "title": item.title,
                        "url": item.url,
                        "permalink": item.permalink,
                        "revision_id": item.revision_id,
                        "source_type": item.source_type,
                        "published_at": item.published_at.isoformat() if item.published_at else None,
                        "retrieved_at": item.retrieved_at.isoformat() if item.retrieved_at else None,
                        "license": item.license_note,
                    },
                }
                for item in evidence
            ],
            "aggregation": {
                "support_score": aggregation.support_score,
                "refute_score": aggregation.refute_score,
                "margin": aggregation.margin,
                "selected_sources": aggregation.selected_sources,
                "contested": aggregation.contested,
            },
            "retrieval": {
                "queries": generate_queries(claim),
                "providers": [
                    {
                        "name": status.name,
                        "status": status.status.value,
                        "reason": status.reason,
                        "latency_ms": status.latency_ms,
                        "n_results": status.n_results,
                    }
                    for status in retrieval.provider_statuses
                ],
            },
            "explanation": {
                "summary": (
                    "No sufficient evidence was found."
                    if verdict == Verdict.INSUFFICIENT
                    else f"Retrieved evidence assessed as {verdict.value}."
                ),
                "steps": [
                    "Generated deterministic claim queries.",
                    "Retrieved provider documents and passages.",
                    "Assessed passage entailment with the NLI model.",
                    "Aggregated independent source signals.",
                ],
            },
            "models": {
                "evidence_assessment": "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli",
                "baseline": (
                    {"status": "available", "non_evidence": True}
                    if include_baseline
                    else None
                ),
            },
            "limitations": [
                "NLI scores are uncalibrated and are not probabilities of factual truth.",
                "Authority and retrieval relevance do not guarantee source correctness.",
                "The pipeline does not independently prove claims.",
                f"Timestamped news evidence was limited to the last {recent_window_hours} hours; undated reference sources may remain.",
                "Project dataset matches are labeled validation records, not independent factual proof.",
            ],
            "timing_ms": round((time.perf_counter() - started) * 1000, 2),
        }
        return result


class _ArticleTextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.title = ""
        self._ignored = 0
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript", "svg"}:
            self._ignored += 1
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript", "svg"} and self._ignored:
            self._ignored -= 1
        elif tag == "title":
            self._in_title = False

    def handle_data(self, data):
        value = " ".join(data.split())
        if not value or self._ignored:
            return
        if self._in_title and not self.title:
            self.title = value[:300]
        if len(value) > 20:
            self.parts.append(value)


evidence_service = EvidenceService()
