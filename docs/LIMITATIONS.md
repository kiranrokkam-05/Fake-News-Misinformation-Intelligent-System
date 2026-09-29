# Limitations

- Evidence and NLI decision thresholds are currently untuned for production
  use.
- No complete SciFact benchmark was completed. Only a small custom validation
  set was run, and its results are not a general performance estimate.
- The NLI scores are uncalibrated and must not be interpreted as probabilities
  of factual truth.
- Retrieval quality and source authority are not guarantees that a claim is
  correct.
- The system can return insufficient evidence and requires human review for
  consequential decisions.
- Phase 8 security hardening is not complete.
- Phase 9 Docker and deployment work is not complete.
