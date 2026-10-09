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
- Basic Phase 8 protections are enabled locally: JSON request-size limits,
  in-memory per-client rate limiting, and security response headers. A public
  deployment still needs a shared rate limiter, authentication if required by
  the deployment, secret management, TLS, network policy, and monitoring.
- A Dockerfile is provided for reproducible local/container execution. Cloud
  deployment, TLS termination, reverse-proxy configuration, and autoscaling
  are not included.
- Recent-news mode filters timestamped provider results to a configurable
  window (the UI requests four hours). Undated reference sources can still
  remain, and a recent article cannot be classified as fake or real without
  corroborating or contradicting evidence.
- FEVER and SciFact labeled claim records are matched when the submitted claim
  matches a stored dataset claim. The SciFact corpus is also searched as
  scientific evidence. The article-level `REAL`/`FAKE` CSV remains a training
  artifact and is not treated as independent proof for arbitrary claims.
