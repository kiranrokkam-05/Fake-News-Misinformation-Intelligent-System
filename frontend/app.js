(() => {
  const input = document.getElementById('article-text');
  const button = document.getElementById('analyze-button');
  const result = document.getElementById('result');
  const progress = document.getElementById('progress');
  const steps = document.getElementById('steps');
  const error = document.getElementById('error-message');
  const sample = 'The Earth orbits the Sun.';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const percent = value => Math.max(0, Math.min(100, Number(value) || 0));
  const safeUrl = value => {
    try {
      const url = new URL(value, window.location.origin);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch (_) {
      return '';
    }
  };

  document.getElementById('sample-button').addEventListener('click', () => {
    input.value = sample;
    input.focus();
  });
  button.addEventListener('click', analyze);

  async function postJson(url, body) {
    const response = await fetch(url, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
    return payload;
  }

  async function analyze() {
    const text = input.value.trim();
    error.hidden = true;
    if (text.length < 5) {
      error.textContent = 'Enter at least 5 characters to analyze.';
      error.hidden = false;
      input.focus();
      return;
    }
    if (text.length > 20000) {
      error.textContent = 'Text must be 20,000 characters or fewer.';
      error.hidden = false;
      return;
    }

    const labels = ['Running fake/real text classification', 'Searching configured evidence sources', 'Preparing the verification report'];
    steps.innerHTML = labels.map(label => `<li><i aria-hidden="true"></i>${label}</li>`).join('');
    const items = [...steps.children];
    progress.hidden = false;
    result.hidden = true;
    button.disabled = true;
    try {
      items[0].className = 'on';
      const payload = await postJson('/api/check', {text});
      items[0].className = 'done';
      items[1].className = 'on';
      await new Promise(resolve => setTimeout(resolve, 250));
      items[1].className = 'done';
      items[2].className = 'on';
      render(text, payload);
      items[2].className = 'done';
    } catch (cause) {
      error.textContent = cause.message || 'Analysis failed. Please try again.';
      error.hidden = false;
    } finally {
      button.disabled = false;
      progress.hidden = true;
    }
  }

  function verdictStyle(value) {
    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('support') || normalized === 'true' || normalized === 'real') return ['--ok', '--okbg'];
    if (normalized.includes('contradict') || normalized === 'false' || normalized === 'fake' || normalized.includes('refut')) return ['--fake', '--fakebg'];
    return ['--unv', '--unvbg'];
  }

  function render(claim, payload) {
    const analysis = payload?.analysis || {};
    const verification = payload?.verification || {};
    const finalDecision = payload?.final_decision || {status: 'UNVERIFIED', reason: 'The combined decision was not returned.'};
    const classification = analysis?.classification || {};
    const shortClaim = classification.applicable === false;
    const classifierVerdict = classification.verdict || analysis?.prediction || 'Unavailable';
    const evidenceVerdict = verification?.verdict || 'Unavailable';
    const [color, background] = verdictStyle(finalDecision.status);
    const evidenceConfidence = percent(verification?.confidence);
    const confidenceLabel = verification?.confidence == null ? '—' : `${evidenceConfidence.toFixed(1)}%`;
    const fakeScore = classification.fake_score ?? classification.fake_probability;
    const evidence = Array.isArray(verification?.evidence) ? verification.evidence : [];
    const sources = Array.isArray(verification?.sources_checked) ? verification.sources_checked : [];
    const entities = analysis?.claims_and_entities?.entities;
    const entityEntries = Array.isArray(entities) ? entities.map(entity => [entity.text, entity.label]).filter(([value]) => value) : [];
    const confidencePercent = verification?.confidence == null ? 0 : evidenceConfidence;
    const statusNotes = payload?.verification_error ? `<div class="card"><h2>Evidence retrieval unavailable</h2><p class="empty">${esc(payload.verification_error)}</p></div>` : '';
    const evidenceMarkup = evidence.length ? evidence.map(item => {
      const stance = item.stance || 'Unclear';
      const [tagClass] = verdictStyle(stance);
      const tone = tagClass === '--ok' ? 't-s' : tagClass === '--fake' ? 't-c' : 't-n';
      const title = item.title || item.source_name || item.provider || 'Evidence source';
      const detail = item.passage || item.snippet || item.url || 'No excerpt available.';
      const url = safeUrl(item.url);
      const sourceLink = url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open source</a>` : '';
      return `<div class="reason"><span class="tag ${tone}">${esc(stance)}</span> <b>${esc(title)}</b><p>${esc(detail)}</p><p class="muted">Source: ${esc(item.source_name || item.provider || 'Unknown')} · Credibility ${percent(item.credibility_score).toFixed(0)}%</p>${sourceLink ? `<p>${sourceLink}</p>` : ''}` + (item.published_at ? `<p class="muted">Published: ${esc(item.published_at)}</p>` : '') + `</div>`;
    }).join('') : '<p class="empty">No evidence passages were returned.</p>';
    const providerStatuses = Array.isArray(verification?.provider_statuses) ? verification.provider_statuses : [];
    const queryList = Array.isArray(verification?.search_queries) ? verification.search_queries : [];
    const providerMarkup = providerStatuses.length ? providerStatuses.map(item => `<div class="reason"><b>${esc(item.name)}</b><p class="muted">${esc(item.status)}${item.n_results ? ` · ${Number(item.n_results)} results` : ''}${item.reason ? ` · ${esc(item.reason)}` : ''}</p></div>`).join('') : '<p class="empty">No provider status details returned.</p>';
    const claimList = analysis?.claims_and_entities?.claims || [];
    const claimMarkup = claimList.length ? claimList.slice(0, 8).map(item => `<div class="reason"><b>${esc(item.text || item.claim || item)}</b></div>`).join('') : '<p class="empty">No separate claims were extracted.</p>';
    result.innerHTML = `
      <div class="card verdict" style="--vc:var(${color});--vb:var(${background});--p:${confidencePercent}">
        <div class="ring"><div><span><b>${confidenceLabel}</b><br><small>evidence score</small></span></div></div>
        <div><span class="badge">Final assessment: ${esc(finalDecision.status)}</span><h2>${esc(payload?.verification_focus || claim.slice(0, 180))}${!payload?.verification_focus && claim.length > 180 ? '…' : ''}</h2>
        <p class="muted">${esc(finalDecision.reason || 'No decision explanation was returned.')}</p>
        <p class="muted">Evidence outcome: <strong>${esc(evidenceVerdict)}</strong>${verification?.reason ? ` · ${esc(verification.reason)}` : ''}</p>
        <p class="muted">${shortClaim ? 'Article classifier not applied to this short claim.' : `Article classifier signal: ${esc(classifierVerdict)}.`} ${fakeScore == null ? '' : `Fake score (uncalibrated): ${percent(Number(fakeScore) * 100).toFixed(1)}%.`}</p></div>
      </div>
      <div class="grid">
        <div class="stack">
          <div class="card"><h2>Evidence and sources</h2><p class="muted">${evidence.length} evidence passages · ${sources.length} providers returned results</p><button class="btn secondary" id="open-evidence" type="button">View searched sources</button>${payload?.verification_scope ? `<p class="muted">Evidence scope: ${esc(payload.verification_scope)}.</p>` : ''}${sources.length ? `<p class="muted">Results from: ${sources.map(esc).join(', ')}</p>` : ''}</div>
          <div class="card"><h2>Extracted claims</h2>${claimMarkup}</div>
        </div>
        <div class="stack">
          <div class="card"><h2>Analysis details</h2>
            <div class="meter"><div class="meter-label"><span>Article classifier</span><span>${esc(shortClaim ? 'Not applied to short claims' : classifierVerdict)}</span></div><p class="muted">${classification.decision_margin == null ? 'No SVM margin available.' : `SVM decision margin: ${Number(classification.decision_margin).toFixed(3)} (decisive beyond ±${Number(classification.margin_threshold || 1).toFixed(1)}).`}</p></div>
            <div class="meter"><div class="meter-label"><span>Evidence confidence</span><span>${verification?.confidence == null ? 'Not provided' : `${evidenceConfidence.toFixed(1)}%`}</span></div><div class="bar"><i style="width:${evidenceConfidence}%"></i></div></div>
            <p class="muted">${Number(analysis?.input_text_summary?.word_count ?? 0)} words · ${Number(analysis?.claims_and_entities?.total_entities ?? 0)} entities detected</p>
            <div class="chips">${entityEntries.slice(0, 18).map(([value, kind]) => `<span class="chip">${esc(value)} <span class="muted">${esc(kind)}</span></span>`).join('') || '<span class="empty">No entities extracted.</span>'}</div>
          </div>
          ${statusNotes}
        </div>
      </div>
      <dialog class="evidence-dialog" id="evidence-dialog" aria-labelledby="evidence-dialog-title">
        <div class="dialog-head"><div><h2 id="evidence-dialog-title">Search results and sources</h2><p class="muted">Queries and passages retrieved for this claim.</p></div><button class="link" id="close-evidence" type="button" aria-label="Close source details">Close</button></div>
        <section><h3>Search queries</h3>${queryList.length ? `<ul>${queryList.map(query => `<li>${esc(query)}</li>`).join('')}</ul>` : '<p class="empty">Search queries were not reported by the API.</p>'}</section>
        <section><h3>Source providers</h3>${providerMarkup}</section>
        <section><h3>Evidence passages</h3>${evidenceMarkup}</section>
      </dialog>
      <p class="note">Automated classification is a model output, not proof of truth. Evidence availability and source quality can vary; review linked sources yourself.</p>`;
    const dialog = result.querySelector('#evidence-dialog');
    result.querySelector('#open-evidence').addEventListener('click', () => dialog.showModal());
    result.querySelector('#close-evidence').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    result.hidden = false;
    result.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
})();
