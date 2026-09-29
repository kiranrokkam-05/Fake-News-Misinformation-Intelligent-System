const claimInput = document.getElementById("claim-text");
const startButton = document.getElementById("start-btn");
const resultsCard = document.querySelector(".results-card");

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function addRow(parent, label, value) {
  const row = makeElement("div", "verification-row");
  row.append(makeElement("strong", "", label), makeElement("span", "", value));
  parent.appendChild(row);
}

function clearResults() {
  while (resultsCard.firstChild) resultsCard.removeChild(resultsCard.firstChild);
  resultsCard.classList.remove("dashboard-hidden-on-load");
  resultsCard.appendChild(makeElement("h2", "results-title", "Evidence-backed claim assessment"));
}

function showMessage(className, message) {
  clearResults();
  resultsCard.appendChild(makeElement("p", className, message));
}

function renderEvidence(result) {
  clearResults();

  const claim = result.claim || {};
  const verdict = result.verdict || "INSUFFICIENT";
  const verdictLabel = {
    SUPPORTS: "Supports",
    REFUTES: "Refutes",
    INSUFFICIENT: "Insufficient evidence",
  }[verdict] || "Insufficient evidence";

  const verdictBadge = makeElement("div", `verdict-badge verdict-${verdict.toLowerCase()}`, verdictLabel);
  resultsCard.appendChild(verdictBadge);
  resultsCard.appendChild(makeElement("p", "submitted-claim", claim.text || "Claim unavailable"));

  const summary = makeElement("section", "verification-section");
  summary.appendChild(makeElement("h3", "", "Assessment"));
  addRow(summary, "Evidence strength", result.strength_band || "insufficient");
  summary.appendChild(makeElement("p", "uncalibrated-note", "NLI evidence scores are uncalibrated and are not probabilities of factual truth."));
  resultsCard.appendChild(summary);

  if (result.aggregation && result.aggregation.contested) {
    const contradictions = makeElement("section", "verification-section contradictions");
    contradictions.appendChild(makeElement("h3", "", "Contradictions"));
    contradictions.appendChild(makeElement("p", "", "Retrieved evidence contains competing support and refutation signals."));
    resultsCard.appendChild(contradictions);
  }

  const evidenceSection = makeElement("section", "verification-section");
  evidenceSection.appendChild(makeElement("h3", "", "Evidence"));
  const evidence = Array.isArray(result.evidence) ? result.evidence : [];
  if (!evidence.length) {
    evidenceSection.appendChild(makeElement("p", "empty-state", "No evidence passages were returned."));
  } else {
    evidence.forEach((item) => {
      const card = makeElement("article", "evidence-card");
      card.appendChild(makeElement("blockquote", "", item.passage || "No quotation returned."));
      addRow(card, "Stance", item.stance || "NEUTRAL");
      const source = item.source || {};
      addRow(card, "Source", source.title || "Unnamed source");
      addRow(card, "Provider", source.provider || "Unknown provider");
      addRow(card, "Date", source.published_at || source.retrieved_at || "Date unavailable");
      if (source.url) {
        const link = makeElement("a", "", "Open source");
        link.href = source.permalink || source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
      }
      evidenceSection.appendChild(card);
    });
  }
  resultsCard.appendChild(evidenceSection);

  const providerSection = makeElement("section", "verification-section");
  providerSection.appendChild(makeElement("h3", "", "Provider status"));
  const providers = result.retrieval && Array.isArray(result.retrieval.providers)
    ? result.retrieval.providers
    : [];
  if (!providers.length) {
    providerSection.appendChild(makeElement("p", "empty-state", "No provider status was returned."));
  } else {
    providers.forEach((provider) => {
      addRow(providerSection, provider.name || "Provider", provider.status || "unknown");
    });
  }
  resultsCard.appendChild(providerSection);

  const explanation = result.explanation || {};
  const reasoningSection = makeElement("section", "verification-section");
  reasoningSection.appendChild(makeElement("h3", "", "Reasoning steps"));
  const steps = Array.isArray(explanation.steps) ? explanation.steps : [];
  if (!steps.length) {
    reasoningSection.appendChild(makeElement("p", "empty-state", "No reasoning steps were returned."));
  } else {
    const list = makeElement("ol", "");
    steps.forEach((step) => list.appendChild(makeElement("li", "", step)));
    reasoningSection.appendChild(list);
  }
  resultsCard.appendChild(reasoningSection);

  const limitations = Array.isArray(result.limitations) ? result.limitations : [];
  const limitationsSection = makeElement("section", "limitations-banner");
  limitationsSection.appendChild(makeElement("h3", "", "Limitations"));
  limitationsSection.appendChild(makeElement("p", "", "This is a machine-learning evidence assessment; it does not independently prove a claim."));
  limitations.forEach((limitation) => limitationsSection.appendChild(makeElement("p", "", limitation)));
  resultsCard.appendChild(limitationsSection);

  const baseline = makeElement("details", "pattern-baseline");
  baseline.hidden = true;
  baseline.appendChild(makeElement("summary", "", "Pattern baseline, not evidence"));
  resultsCard.appendChild(baseline);
}

async function verifyClaim() {
  const claim = claimInput.value.trim();
  if (!claim) {
    showMessage("error-state", "Enter a claim before starting verification.");
    return;
  }

  startButton.disabled = true;
  startButton.textContent = "Checking evidence...";
  showMessage("loading-state", "Retrieving evidence and assessing passages...");
  try {
    const response = await fetch("/api/v1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error && payload.error.message ? payload.error.message : "Verification request failed.");
    }
    renderEvidence(payload);
  } catch (error) {
    showMessage("error-state", error.message || "Unable to verify this claim.");
  } finally {
    startButton.disabled = false;
    startButton.textContent = "Start Verification";
  }
}

claimInput.addEventListener("input", () => {
  const counter = document.getElementById("char-counter");
  if (counter) counter.textContent = `${claimInput.value.length}/2000`;
});
startButton.addEventListener("click", verifyClaim);
