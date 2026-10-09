(() => {
  const $ = (id) => document.getElementById(id);
  const input = $("txt");
  const urlInput = $("url");
  const button = $("go");
  const result = $("result");
  const progress = $("progress");
  const steps = $("steps");
  const error = $("error-message");
  const verdictStyles = {
    SUPPORTS: ["Supports", "--ok", "--okbg"],
    REFUTES: ["Refutes", "--fake", "--fakebg"],
    INSUFFICIENT: ["Insufficient evidence", "--unv", "--unvbg"],
  };
  const node = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = String(text);
    return item;
  };
  const clear = (item) => { while (item.firstChild) item.removeChild(item.firstChild); };
  const append = (parent, ...children) => children.forEach((child) => parent.appendChild(child));
  const row = (parent, label, value) => {
    const item = node("div", "reason");
    append(item, node("b", "", label), node("p", "", value || "Unavailable"));
    parent.appendChild(item);
  };
  const sourceLink = (source) => {
    try {
      const url = new URL(source.permalink || source.url || "", window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };
  const setMode = (mode) => {
    const text = mode === "text";
    input.hidden = !text;
    urlInput.hidden = text;
    $("tText").setAttribute("aria-pressed", String(text));
    $("tUrl").setAttribute("aria-pressed", String(!text));
  };
  const renderMeter = (parent, label, value, band) => {
    const meter = node("div", "meter");
    const labels = node("div", "lbl");
    append(labels, node("span", "", label), node("span", "", band));
    const bar = node("div", "bar");
    const fill = node("i");
    fill.style.width = `${Math.max(0, Math.min(100, value * 100))}%`;
    bar.appendChild(fill);
    append(meter, labels, bar);
    parent.appendChild(meter);
  };
  const render = (payload) => {
    clear(result);
    const [label, color, background] = verdictStyles[payload.verdict] || verdictStyles.INSUFFICIENT;
    const strength = Number(payload.evidence_strength || 0);
    const header = node("div", "card verdict");
    header.style.setProperty("--vc", `var(${color})`);
    header.style.setProperty("--vb", `var(${background})`);
    header.style.setProperty("--p", Math.round(strength * 100));
    const ring = node("div", "ring");
    const ringInner = node("div");
    const strengthText = strength > 0 ? `${Math.round(strength * 100)}%` : "—";
    ringInner.appendChild(node("span", "", strengthText));
    ringInner.firstChild.appendChild(node("br"));
    ringInner.firstChild.appendChild(node("small", "", strength > 0 ? "evidence strength" : "insufficient evidence"));
    ring.appendChild(ringInner);
    const summary = node("div");
    append(summary, node("span", "badge", label), node("h2", "", payload.claim?.text || "Submitted claim"));
    summary.appendChild(node("p", "", payload.explanation?.summary || "No summary was returned."));
    append(header, ring, summary);
    result.appendChild(header);

    const grid = node("div", "grid");
    const left = node("div", "stack");
    const why = node("div", "card");
    why.appendChild(node("h2", "", "Why this result"));
    (payload.evidence || []).forEach((item) => {
      const reason = node("div", "reason");
      const stance = (item.stance || "neutral").toLowerCase();
      const tagClass = stance === "supports" ? "t-s" : stance === "contradicts" ? "t-c" : "t-n";
      append(reason, node("span", `tag ${tagClass}`, stance), node("b", "", item.source?.title || "Source"));
      reason.appendChild(node("p", "", item.passage || "No quotation returned."));
      why.appendChild(reason);
    });
    if (!payload.evidence?.length) why.appendChild(node("p", "empty", "No evidence passages were returned."));
    left.appendChild(why);
    const sources = node("div", "card");
    sources.appendChild(node("h2", "", "Sources searched"));
    (payload.retrieval?.providers || []).forEach((provider) => {
      const item = node("div", "src");
      const icon = node("div", "ico", (provider.name || "?").slice(0, 1).toUpperCase());
      const details = node("div");
      append(details, node("b", "", provider.name), node("span", "", `${provider.status}${provider.n_results ? ` · ${provider.n_results} results` : ""}`));
      append(item, icon, details, node("span", "tag t-n", provider.status));
      sources.appendChild(item);
    });
    left.appendChild(sources);

    const right = node("div", "stack");
    const analysis = node("div", "card");
    analysis.appendChild(node("h2", "", "Evidence analysis"));
    const supportScore = payload.aggregation?.support_score || 0;
    const refuteScore = payload.aggregation?.refute_score || 0;
    renderMeter(analysis, "Supports (TRUE signal)", supportScore, `${Math.round(supportScore * 100)}%`);
    renderMeter(analysis, "Refutes (FALSE signal)", refuteScore, `${Math.round(refuteScore * 100)}%`);
    analysis.appendChild(node("p", "hint", "These are uncalibrated evidence signals, not probabilities that the claim is true or false."));
    const sec = node("div", "sec");
    sec.appendChild(node("h3", "", "Claim entities"));
    const chips = node("div", "chips");
    (payload.claim?.entities || []).forEach((entity) => chips.appendChild(node("span", "chip", entity)));
    sec.appendChild(chips);
    analysis.appendChild(sec);
    right.appendChild(analysis);
    const wording = node("div", "card");
    wording.appendChild(node("h2", "", "Submitted text"));
    wording.appendChild(node("div", "excerpt", payload.claim?.text || ""));
    right.appendChild(wording);
    append(grid, left, right);
    result.appendChild(grid);

    const note = node("p", "note", "NLI scores are uncalibrated and are not probabilities of factual truth. Review linked sources before sharing.");
    result.appendChild(note);
    result.hidden = false;
  };
  async function verify() {
    const claim = (input.hidden ? urlInput.value : input.value).trim();
    error.hidden = true;
    if (claim.length < 5) {
      error.textContent = "Enter at least 5 characters to verify.";
      error.hidden = false;
      return;
    }
    clear(steps);
    ["Reading and cleaning the article", "Searching available sources", "Comparing claims with sources"].forEach((label) => {
      const item = node("li");
      append(item, node("i"), node("span", "", label));
      steps.appendChild(item);
    });
    progress.hidden = false;
    result.hidden = true;
    button.disabled = true;
    try {
      const endpoint = input.hidden ? "/api/v1/verify/url" : "/api/v1/verify";
      const body = input.hidden
        ? {url: claim}
        : {claim, options: {max_evidence: 10, recent_window_hours: 4}};
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
      });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json().catch(() => ({}))
        : {};
      if (!response.ok) throw new Error(payload.error?.message || "Verification request failed.");
      render(payload);
    } catch (cause) {
      error.textContent = cause.message || "Verification failed. Try again.";
      error.hidden = false;
    } finally {
      button.disabled = false;
      progress.hidden = true;
    }
  }
  $("tText").addEventListener("click", () => setMode("text"));
  $("tUrl").addEventListener("click", () => setMode("url"));
  document.querySelectorAll("[data-sample]").forEach((item) => item.addEventListener("click", () => {
    setMode("text");
    input.value = item.dataset.sample;
    input.focus();
  }));
  button.addEventListener("click", verify);
})();
