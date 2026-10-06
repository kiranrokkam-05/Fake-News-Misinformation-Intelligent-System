"""Transparent synthesis of article-classifier and evidence-verification signals."""


REAL = "REAL"
FAKE = "FAKE"
UNCERTAIN = "SUSPICIOUS / UNCERTAIN"
UNVERIFIED = "UNVERIFIED"
STRONG_MARGIN = 1.0


def _status_value(status):
    if isinstance(status, dict):
        return str(status.get("status", "")).lower()
    return str(getattr(getattr(status, "status", ""), "value", "")).lower()


def decide_final(classification: dict | None, verification: dict | None) -> dict:
    """Combine independent signals without interpreting missing evidence as falsity.

    Evidence may corroborate a claim, but contradictory high-quality signals
    remain uncertain. Provider failure and inconclusive retrieval always yield
    UNVERIFIED when there is no usable evidence and no decisive classifier
    result backed by a completed search.
    """
    classification = classification or {}
    verification = verification or {}
    applicable = classification.get("applicable", True)
    ml_verdict = str(classification.get("verdict", "")).upper()
    margin = classification.get("decision_margin")
    try:
        strong_ml = margin is not None and abs(float(margin)) >= STRONG_MARGIN
    except (TypeError, ValueError):
        strong_ml = False
    ml_label = FAKE if ml_verdict == FAKE else REAL if ml_verdict == REAL else None

    evidence_verdict = str(verification.get("verdict", "")).upper()
    evidence_items = verification.get("evidence") or []
    statuses = verification.get("provider_statuses") or []
    status_values = [_status_value(status) for status in statuses]
    usable_provider = any(value == "ok" for value in status_values)
    all_providers_unavailable = bool(status_values) and not usable_provider
    has_evidence = bool(evidence_items)

    evidence_signal = {
        "verdict": verification.get("verdict", "UNVERIFIED"),
        "confidence": verification.get("confidence"),
        "evidence_count": len(evidence_items),
        "sources": verification.get("sources_checked", []),
        "provider_statuses": statuses,
    }
    classifier_signal = {
        "verdict": classification.get("verdict", "NOT APPLIED" if not applicable else "UNAVAILABLE"),
        "fake_score": classification.get("fake_score", classification.get("fake_probability")),
        "real_score": classification.get("real_score", classification.get("real_probability")),
        "score_kind": classification.get("score_kind", "unknown"),
        "probability_calibrated": bool(classification.get("probability_calibrated", False)),
        "decision_margin": margin,
        "strong_margin_threshold": STRONG_MARGIN,
    }

    # Evidence verdicts are generated only from retrieved items. If those
    # items strongly establish the focal claim but the classifier disagrees,
    # surface the disagreement instead of silently choosing a side.
    if has_evidence and evidence_verdict == "VERIFIED":
        if applicable and ml_label == FAKE and strong_ml:
            return _result(UNCERTAIN, "Strong supporting evidence conflicts with a strong fake-classifier margin; human review is needed.", "conflicting_strong_signals", classifier_signal, evidence_signal)
        return _result(REAL, "Retrieved evidence supports the focal claim. The article classifier is shown separately and is not factual proof.", "evidence_supports_claim", classifier_signal, evidence_signal)

    if has_evidence and evidence_verdict in {"FALSE / CONTRADICTED", "REFUTES"}:
        if applicable and ml_label == REAL and strong_ml:
            return _result(UNCERTAIN, "Retrieved evidence contradicts the focal claim while the classifier strongly favors REAL; review the sources and article context.", "conflicting_strong_signals", classifier_signal, evidence_signal)
        return _result(FAKE, "Retrieved evidence contradicts the focal claim.", "evidence_contradicts_claim", classifier_signal, evidence_signal)

    if evidence_verdict == "PARTIALLY TRUE":
        return _result(UNCERTAIN, "Retrieved evidence is mixed or establishes only part of the focal claim.", "mixed_evidence", classifier_signal, evidence_signal)

    if not has_evidence:
        if all_providers_unavailable or not usable_provider:
            reason = "Evidence retrieval was unavailable or returned no usable sources; provider errors are not evidence against the claim."
            return _result(UNVERIFIED, reason, "retrieval_unavailable", classifier_signal, evidence_signal)
        if applicable and strong_ml and ml_label in {REAL, FAKE}:
            return _result(ml_label, "No evidence was retrieved. This result relies on a strong SVM margin only and is not externally verified.", "classifier_only_strong_margin", classifier_signal, evidence_signal)
        return _result(UNVERIFIED, "Search completed but did not find evidence that establishes the focal claim; the classifier signal is not decisive.", "no_establishing_evidence", classifier_signal, evidence_signal)

    # Evidence was retrieved but could not establish a stance (including the
    # existing-topic state). It must not be mistaken for support or refutation.
    return _result(UNVERIFIED, verification.get("reason") or "Evidence was retrieved but remains inconclusive.", "inconclusive_evidence", classifier_signal, evidence_signal)


def _result(status, reason, rule, classifier_signal, evidence_signal):
    return {
        "status": status,
        "reason": reason,
        "rule": rule,
        "classifier_signal": classifier_signal,
        "evidence_signal": evidence_signal,
    }
