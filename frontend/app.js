(() => {
  const input = document.getElementById("article-text");
  const button = document.getElementById("analyze-button");
  const result = document.getElementById("result");
  const progress = document.getElementById("progress");
  const steps = document.getElementById("steps");
  const error = document.getElementById("error-message");
  const sampleButton = document.getElementById("sample-button");
  const sample = "The Earth orbits the Sun.";

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };

  const clear = (node) => {
    while (node.firstChild) node.removeChild(node.firstChild);
  };

  const safeUrl = (value) => {
    try {
      const url = new URL(value, window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };

  const showError = (message) => {
    error.textContent = message;
    error.hidden = false;
  };

  const addRow = (parent, label, value) => {
    const row = element("div", "reason");
    row.append(element("b", "", label), element("p", "muted", value || "Unavailable"));
    parent.appendChild(row);
  };

  const renderEvidence = (payload) => {
    clear(result);
    result.hidden = false;

    const verdict = payload.verdict || "INSUFFICIENT";
    const label = {
      SUPPORTS: "Supports",
      REFUTES: "Refutes",
      INSUFFICIENT: "Insufficient evidence",
    }[verdict] || "Insufficient evidence";
    const header = element("section", "card verdict");
    header.append(
      element("span", "badge", label),
      element("h2", "", payload.claim?.text || "Submitted claim"),
      element("p", "muted", `Evidence strength: ${payload.strength_band || "insufficient"}`),
      element("p", "muted", "NLI scores are uncalibrated and are not probabilities of factual truth.")
    );
    result.appendChild(header);

    if (payload.aggregation?.contested) {
      const section = element("section", "card");
      section.append(element("h2", "", "Contradictory evidence"), element("p", "empty", "Retrieved evidence contains competing support and refutation signals."));
      result.appendChild(section);
    }

    const evidenceSection = element("section", "card");
    evidenceSection.append(element("h2", "", "Evidence and sources"));
    const evidence = Array.isArray(payload.evidence) ? payload.evidence : [];
    if (!evidence.length) {
      evidenceSection.appendChild(element("p", "empty", "No evidence passages were returned."));
    }
    evidence.forEach((item) => {
      const card = element("article", "reason");
      const source = item.source || {};
      card.append(
        element("span", "tag t-n", item.stance || "neutral"),
        element("blockquote", "", item.passage || "No quotation returned.")
      );
      addRow(card, "Source", source.title || "Unnamed source");
      addRow(card, "Provider", source.provider || "Unknown provider");
      addRow(card, "Date", source.published_at || source.retrieved_at || "Date unavailable");
      const href = safeUrl(source.permalink || source.url);
      if (href) {
        const link = element("a", "", "Open source");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
      }
      evidenceSection.appendChild(card);
    });
    result.appendChild(evidenceSection);

    const providerSection = element("section", "card");
    providerSection.appendChild(element("h2", "", "Provider status"));
    const providers = payload.retrieval?.providers || [];
    if (!providers.length) providerSection.appendChild(element("p", "empty", "No provider status was returned."));
    providers.forEach((provider) => {
      addRow(providerSection, provider.name, `${provider.status}${provider.n_results ? ` (${provider.n_results} results)` : ""}${provider.reason ? ` — ${provider.reason}` : ""}`);
    });
    result.appendChild(providerSection);

    const reasoningSection = element("section", "card");
    reasoningSection.appendChild(element("h2", "", "Reasoning steps"));
    const stepsList = element("ol", "");
    (payload.explanation?.steps || []).forEach((step) => stepsList.appendChild(element("li", "", step)));
    reasoningSection.appendChild(stepsList);
    result.appendChild(reasoningSection);

    const limitations = element("section", "card limitations");
    limitations.append(
      element("h2", "", "Limitations"),
      element("p", "", "This is an evidence assessment system. It does not independently prove a claim."),
      element("p", "", "The pattern baseline is hidden and is not evidence.")
    );
    (payload.limitations || []).forEach((item) => limitations.appendChild(element("p", "", item)));
    result.appendChild(limitations);
  };

  async function verify() {
    const claim = input.value.trim();
    error.hidden = true;
    if (claim.length < 5) {
      showError("Enter at least 5 characters to verify.");
      input.focus();
      return;
    }
    clear(steps);
    ["Retrieve evidence", "Assess passages", "Prepare report"].forEach((label) => {
      const item = element("li", "", label);
      steps.appendChild(item);
    });
    progress.hidden = false;
    result.hidden = true;
    button.disabled = true;
    try {
      const response = await fetch("/api/v1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim, options: { max_evidence: 10, recent_window_hours: 4 } }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.message || "Verification request failed.");
      renderEvidence(payload);
    } catch (cause) {
      showError(cause.message || "Verification failed. Try again.");
    } finally {
      button.disabled = false;
      progress.hidden = true;
    }
  }

  sampleButton.addEventListener("click", () => {
    input.value = sample;
    input.focus();
  });
  button.addEventListener("click", verify);
})();
