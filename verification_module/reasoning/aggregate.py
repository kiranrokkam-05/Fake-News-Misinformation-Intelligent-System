from verification_module.models import Aggregation, EvidenceItem, Stance


def _noisy_or(values: list[float]) -> float:
    result = 0.0
    for value in values:
        result = 1.0 - (1.0 - result) * (1.0 - max(0.0, min(1.0, value)))
    return result


def aggregate_evidence(evidence: list[EvidenceItem]) -> Aggregation:
    support = []
    refute = []
    seen_sources = set()
    selected = []
    for item in sorted(evidence, key=lambda value: value.relevance, reverse=True):
        source_key = item.url.split("/")[2] if "://" in item.url else item.provider
        if source_key in seen_sources:
            continue
        seen_sources.add(source_key)
        selected.append(item)
        weight = item.weight or max(0.5, min(1.0, item.credibility_score / 100.0))
        strength = item.stance_confidence
        if item.stance == Stance.SUPPORTS:
            support.append(weight * strength)
        elif item.stance == Stance.CONTRADICTS:
            refute.append(weight * strength)
    support_score = _noisy_or(support)
    refute_score = _noisy_or(refute)
    return Aggregation(
        support_score=support_score,
        refute_score=refute_score,
        margin=abs(support_score - refute_score),
        selected_sources=len(selected),
        contested=support_score > 0.3 and refute_score > 0.3,
    )
