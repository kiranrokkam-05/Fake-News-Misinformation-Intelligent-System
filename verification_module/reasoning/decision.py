from verification_module.models import Aggregation, Verdict


def decide_from_aggregation(
    aggregation: Aggregation,
    *,
    minimum_score: float = 0.65,
    contested_threshold: float = 0.3,
    minimum_margin: float = 0.1,
) -> Verdict:
    support = aggregation.support_score
    refute = aggregation.refute_score
    if max(support, refute) < minimum_score:
        return Verdict.INSUFFICIENT
    if support >= minimum_score and refute < contested_threshold:
        return Verdict.SUPPORTS
    if refute >= minimum_score and support < contested_threshold:
        return Verdict.REFUTES
    if abs(support - refute) < minimum_margin:
        return Verdict.INSUFFICIENT
    return Verdict.SUPPORTS if support > refute else Verdict.REFUTES
