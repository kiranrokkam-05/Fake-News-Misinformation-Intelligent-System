"""
Explainability layer.

Turns a VerificationResult into the human-readable report format
shown in the project doc (Section 15), instead of returning a bare
verdict label.
"""

from verification_module.models import VerificationResult


def format_report(result: VerificationResult) -> str:
    lines = [
        f"Verdict: {result.verdict.value}",
        "",
        "Reason:",
        result.reason,
    ]

    if result.topic_exists is not None:
        lines += ["", f"Topic already exists: {'Yes' if result.topic_exists else 'No'}"]

    if result.evidence:
        lines += ["", "Evidence:"]
        for item in result.evidence[:5]:
            lines.append(
                f"- [{item.stance.value.upper()}, credibility {item.credibility_score:.0f}] "
                f"{item.source_name}: {item.title}"
            )

    if result.sources_checked:
        lines += ["", "Sources checked:"]
        for i, src in enumerate(result.sources_checked, 1):
            lines.append(f"{i}. {src}")

    lines += ["", f"Confidence: {result.confidence:.0f}%"]

    if result.notes:
        lines += ["", f"Note: {result.notes}"]

    return "\n".join(lines)
