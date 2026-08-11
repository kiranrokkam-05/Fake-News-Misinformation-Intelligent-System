/**
 * Fake News Detection & Claim Verification System
 * Frontend Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE MANAGEMENT ---
  const state = {
    activeTab: 'text',
    claimText: '',
    uploadedFile: null,
    currentStep: 1,
    isVerifying: false,
    verdictData: null
  };

  // --- DOM ELEMENTS ---
  const textarea = document.getElementById('claim-text');
  const charCounter = document.getElementById('char-counter');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const fileInputs = document.querySelectorAll('.file-input');
  const uploadLabels = document.querySelectorAll('.upload-btn-label');
  const startBtn = document.getElementById('start-btn');
  const prevBtn = document.getElementById('prev-step-btn');
  const nextBtn = document.getElementById('next-step-btn');
  const stepCardContainer = document.getElementById('step-card-container');
  const stepBadgePill = document.getElementById('step-badge-pill');
  const stepContentBody = document.getElementById('step-content-body');
  const stepsSummaryDesc = document.getElementById('steps-summary-desc');
  
  // Progress Elements
  const stepNodes = document.querySelectorAll('.top-steps-bar .step-node');
  const sidebarChecklistItems = document.querySelectorAll('.progress-sidebar-card .checklist-item');
  
  // Results Elements
  const resultsBanner = document.getElementById('results-banner');
  const resultsCardTitle = document.querySelector('.results-card h2');
  const resultWidgets = document.querySelectorAll('.result-widget');
  const confidenceCircle = document.getElementById('confidence-circle');
  const confidenceText = document.getElementById('confidence-text');
  const verdictWidget = document.getElementById('widget-verdict');
  const typeText = document.getElementById('type-text');
  const starsContainer = document.getElementById('reliability-stars');
  const explanationText = document.getElementById('explanation-text');
  const sourcesText = document.getElementById('sources-text');
  const summaryText = document.getElementById('summary-text');
  const insightsText = document.getElementById('insights-text');

  // SPA navigation links & section lists
  const navLinks = document.querySelectorAll('.nav-link');
  const viewSections = document.querySelectorAll('.view-section');

  // Navigation click handlers for SPA page switching
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      navLinks.forEach(nl => nl.classList.remove('active'));
      link.classList.add('active');
      
      const targetId = link.id.replace('nav-', '') + '-view';
      viewSections.forEach(sec => {
        if (sec.id === targetId) {
          sec.style.display = sec.tagName === 'MAIN' ? 'grid' : 'block';
        } else {
          sec.style.display = 'none';
        }
      });
    });
  });

  // Re-verify buttons in History Table
  const reVerifyBtns = document.querySelectorAll('.re-verify-btn');
  reVerifyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const claimTextVal = btn.getAttribute('data-claim');
      textarea.value = claimTextVal;
      state.claimText = claimTextVal;
      updateCharCounter();
      
      // Navigate to home-view
      document.getElementById('nav-home').click();
      
      // Automatically trigger verification click
      startBtn.click();
    });
  });

  // --- INITIALIZATION ---
  // Sync textarea character count on load
  updateCharCounter();

  // --- CLAIM TEXTAREA & CHAR COUNT ---
  textarea.addEventListener('input', (e) => {
    state.claimText = e.target.value;
    updateCharCounter();
  });

  function updateCharCounter() {
    const len = textarea.value.length;
    charCounter.textContent = `${len}/2000`;
  }

  // --- TAB SWITCHING ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tabType = btn.getAttribute('data-tab');
      state.activeTab = tabType;
      
      // Update UI feedback based on tabs
      if (tabType === 'text') {
        textarea.placeholder = "Type your claim statement here...";
        if (state.claimText.startsWith('Extracted text from')) {
          textarea.value = "";
          state.claimText = "";
          updateCharCounter();
        }
      } else if (tabType === 'image') {
        textarea.placeholder = "Upload an image using the buttons below to extract claim text...";
      } else if (tabType === 'pdf') {
        textarea.placeholder = "Upload a PDF using the buttons below to extract claim text...";
      }
    });
  });

  // --- FILE UPLOADS ---
  fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        state.uploadedFile = file;
        
        // Show upload success visual on label
        const isImage = input.id === 'image-upload';
        const label = document.querySelector(`label[for="${input.id}"]`);
        label.style.borderColor = 'var(--success)';
        label.style.backgroundColor = 'var(--success-light)';
        label.querySelector('span').textContent = `${file.name.substring(0, 12)}...`;
        
        // Switch tab active state to match file type
        const targetTab = isImage ? 'image' : 'pdf';
        document.querySelector(`.tab-btn[data-tab="${targetTab}"]`).click();
        
        // Mock OCR text extraction into textarea
        if (isImage) {
          textarea.value = `Extracted text from image "${file.name}": Verifying file assets scan.`;
        } else {
          textarea.value = `Extracted text from document "${file.name}": Verifying file assets scan.`;
        }
        state.claimText = textarea.value;
        updateCharCounter();
        
        // Create verification data
        generateVerdictData(file.name);
      }
    });
  });

  // Drag and drop feedback
  uploadLabels.forEach(label => {
    ['dragenter', 'dragover'].forEach(eventName => {
      label.addEventListener(eventName, (e) => {
        e.preventDefault();
        label.style.borderColor = 'var(--primary)';
        label.style.backgroundColor = 'var(--primary-light)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      label.addEventListener(eventName, (e) => {
        e.preventDefault();
        label.style.borderColor = 'var(--border-color)';
        label.style.backgroundColor = 'var(--bg-main)';
      }, false);
    });
  });

  // --- START VERIFICATION ---
  startBtn.addEventListener('click', () => {
    const claim = textarea.value.trim();
    if (!claim) {
      alert("Please enter a claim statement or upload a file first.");
      return;
    }
    
    state.claimText = claim;
    state.isVerifying = true;
    
    // Generate results data based on text content
    generateVerdictData(claim);

    // Reset results widget states to locked
    resetResultsToLocked();

    // Set step to 1 and render
    goToStep(1);
  });

  // --- NAVIGATION STEPS BUTTONS ---
  prevBtn.addEventListener('click', () => {
    if (state.currentStep > 1) {
      goToStep(state.currentStep - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (state.currentStep < 7) {
      goToStep(state.currentStep + 1);
    } else if (state.currentStep === 7) {
      // Reveal Verdict (Step 7 finish)
      revealFinalVerdict();
    }
  });

  // Handle direct clicks on steps horizontal bar (navigation only if verification started)
  stepNodes.forEach(node => {
    node.addEventListener('click', () => {
      if (state.isVerifying) {
        const stepNum = parseInt(node.getAttribute('data-step'));
        goToStep(stepNum);
      }
    });
  });

  // --- DYNAMIC RESULTS ENGINE ---
  function generateVerdictData(text) {
    const cleanText = text.toLowerCase();
    
    // Exact Mars prompt match
    if (cleanText.includes('isro') && cleanText.includes('mars') && cleanText.includes('2025')) {
      state.verdictData = {
        verdict: 'FALSE',
        verdictClass: 'unlocked-false',
        confidence: 98,
        type: 'Space & Tech',
        reliability: 1,
        explanation: 'No human Mars mission has been conducted by ISRO as of 2025. ISRO\'s current human spaceflight program is Gaganyaan, aimed only at Earth orbit.',
        sources: 'isro.gov.in (Official Space Agency), pib.gov.in (Fact Check), space.com',
        summary: 'Official statements confirm ISRO has no manned Mars landing scheduled. Current missions are focused on low Earth orbit and unmanned lunar/solar probes.',
        insights: 'Sentiment: Neutral\nToxicity: 0%\nStance: Assertive\nConfidence: Extremely High'
      };
    } 
    // Flat earth match
    else if (cleanText.includes('flat') && cleanText.includes('earth')) {
      state.verdictData = {
        verdict: 'FALSE',
        verdictClass: 'unlocked-false',
        confidence: 99,
        type: 'Conspiracy',
        reliability: 1,
        explanation: 'Satellite imaging and physics prove Earth is an oblate spheroid. Flat Earth claims violate fundamental physics laws and astronomical observations.',
        sources: 'nasa.gov (Space Agency), britannica.com, physics.org',
        summary: 'All scientific, geodetic, and satellite records confirm Earth is spherical. Claims of a flat disk are debunked by centuries of gravity and physics evidence.',
        insights: 'Sentiment: Subjective\nToxicity: 2%\nStance: Dogmatic\nFactual Match: 0%'
      };
    }
    // COVID vaccine chips match
    else if ((cleanText.includes('vaccine') || cleanText.includes('covid')) && cleanText.includes('chip')) {
      state.verdictData = {
        verdict: 'FALSE',
        verdictClass: 'unlocked-false',
        confidence: 96,
        type: 'Medical Misinfo',
        reliability: 1,
        explanation: 'Vaccines contain biological formulas for immunity, not electronics. Ingredients list is publicly reviewed and audited by health regulators.',
        sources: 'who.int (World Health Org), cdc.gov (Health agency), fda.gov',
        summary: 'Rigorous regulatory analyses and audits confirm COVID-19 vaccines contain no microchips or tracking hardware. Claims are biologically and technically impossible.',
        insights: 'Sentiment: Negative\nToxicity: 4%\nStance: Alarmist\nTruthfulness: 0%'
      };
    }
    // Scientific facts that are True
    else if (cleanText.includes('boil') || cleanText.includes('water') && cleanText.includes('100') || cleanText.includes('round') && cleanText.includes('earth')) {
      state.verdictData = {
        verdict: 'TRUE',
        verdictClass: 'unlocked-true',
        confidence: 95,
        type: 'General Science',
        reliability: 5,
        explanation: 'This statement is scientifically accurate and corresponds to established facts regarding thermodynamics and physics.',
        sources: 'britannica.com, chem.libretexts.org, nature.com',
        summary: 'Evidence perfectly supports this claim under standard environments. The statements are verifiable in classroom settings and peer-reviewed material.',
        insights: 'Sentiment: Objective\nToxicity: 0%\nStance: Informative\nEvidence Score: 95%'
      };
    }
    // Default fallback (Misleading / Debatable)
    else {
      state.verdictData = {
        verdict: 'MISLEADING',
        verdictClass: 'unlocked-misleading',
        confidence: 74,
        type: 'General News',
        reliability: 2,
        explanation: 'The statement contains some verifiable elements but is packaged with unverified assumptions or out-of-context details.',
        sources: 'reuters.com, apnews.com, factcheck.org',
        summary: 'Independent news bureaus report mixed evidence regarding this specific combination of facts. Recommend caution before sharing.',
        insights: 'Sentiment: Speculative\nToxicity: 1%\nStance: Suggestive\nVerify Rate: Medium'
      };
    }
  }

  // Set initial verdict data on load
  generateVerdictData(state.claimText);

  // --- RESET RESULTS VIEW ---
  function resetResultsToLocked() {
    resultsBanner.style.backgroundColor = 'var(--warning-light)';
    resultsBanner.style.borderColor = 'var(--warning-border)';
    resultsBanner.style.color = '#b45309';
    resultsBanner.querySelector('span').textContent = 'Please go through all 7 steps. The complete analysis and final verdict will be displayed at the end.';
    resultsCardTitle.textContent = 'Final Result (Available after Step 7)';

    resultWidgets.forEach(widget => {
      widget.classList.add('locked');
      
      // Clear contents in UI
      const content = widget.querySelector('.result-widget-content');
      const subtext = widget.querySelector('.result-widget-subtext');
      
      if (widget.id === 'widget-verdict') {
        content.textContent = '-';
        widget.className = 'result-widget locked verdict-widget';
      } else if (widget.id === 'widget-confidence') {
        confidenceCircle.style.strokeDashoffset = 125.6;
        confidenceText.textContent = '-%';
      } else if (widget.id === 'widget-reliability') {
        // Reset stars
        starsContainer.className = 'reliability-stars';
      } else {
        content.textContent = '-';
      }
      subtext.textContent = 'Will be shown at the end';
      
      // Make sure lock icon is visible
      let lock = widget.querySelector('.widget-lock-icon');
      if (!lock) {
        lock = document.createElement('div');
        lock.className = 'widget-lock-icon';
        lock.innerHTML = `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>`;
        widget.appendChild(lock);
      }
      lock.style.display = 'flex';
    });
  }

  // --- VERDICT REVEAL ACTION ---
  function revealFinalVerdict() {
    if (!state.verdictData) return;
    
    const d = state.verdictData;
    
    // Unlock results card title & banner
    resultsCardTitle.textContent = 'Final Result (Verified)';
    resultsBanner.style.backgroundColor = 'var(--success-light)';
    resultsBanner.style.borderColor = 'var(--success-border)';
    resultsBanner.style.color = 'var(--success)';
    resultsBanner.querySelector('span').textContent = 'Verification complete. Claim evaluation finalized and unlocked.';

    // Populate widgets
    resultWidgets.forEach(widget => {
      widget.classList.remove('locked');
      
      // Remove lock icon
      const lockIcon = widget.querySelector('.widget-lock-icon');
      if (lockIcon) lockIcon.style.display = 'none';

      const subtext = widget.querySelector('.result-widget-subtext');
      subtext.textContent = 'Verified Result';
    });

    // 1. Verdict Widget
    const verdictContent = verdictWidget.querySelector('.result-widget-content');
    verdictContent.innerHTML = `<span class="verdict-text">${d.verdict}</span>`;
    verdictWidget.classList.add(d.verdictClass);

    // 2. Confidence Score Widget
    confidenceText.textContent = `${d.confidence}%`;
    const offset = 125.6 * (1 - d.confidence / 100);
    confidenceCircle.style.strokeDashoffset = offset;

    // 3. Claim Type Widget
    typeText.textContent = d.type;

    // 4. Reliability Stars Widget
    starsContainer.className = 'reliability-stars active-stars';
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= d.reliability) {
        starsHTML += `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill: var(--warning);"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
      } else {
        starsHTML += `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill: var(--text-muted);"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
      }
    }
    starsContainer.innerHTML = starsHTML;

    // 5. Explanation
    explanationText.textContent = d.explanation;

    // 6. Sources
    sourcesText.textContent = d.sources;

    // 7. Summary
    summaryText.textContent = d.summary;

    // 8. Insights
    insightsText.innerHTML = d.insights.replace(/\n/g, '<br>');

    // Smooth Scroll to Results Section
    document.querySelector('.results-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // --- STEP TRANSITIONS / CONTENT BUILDER ---
  function goToStep(stepNum) {
    state.currentStep = stepNum;
    
    // Update progress steps visual states
    stepNodes.forEach(node => {
      const n = parseInt(node.getAttribute('data-step'));
      node.classList.remove('active', 'completed');
      if (n === stepNum) {
        node.classList.add('active');
      } else if (n < stepNum) {
        node.classList.add('completed');
      }
    });

    sidebarChecklistItems.forEach(item => {
      const n = parseInt(item.getAttribute('data-sidebar-step'));
      item.classList.remove('active', 'completed');
      if (n === stepNum) {
        item.classList.add('active');
      } else if (n < stepNum) {
        item.classList.add('completed');
      }
    });

    // Update pill badges & subtexts
    stepBadgePill.textContent = `Step ${stepNum} of 7`;
    
    // Configure buttons
    if (stepNum === 1) {
      prevBtn.style.display = 'none';
      nextBtn.innerHTML = `Next <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>`;
    } else {
      prevBtn.style.display = 'flex';
      if (stepNum === 7) {
        nextBtn.innerHTML = `Verify & Reveal <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`;
      } else {
        nextBtn.innerHTML = `Next <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
      }
    }

    // Render corresponding step data
    renderStepBody(stepNum);
  }

  function renderStepBody(stepNum) {
    const stepConfig = getStepData(stepNum);
    stepsSummaryDesc.textContent = stepConfig.summaryText;
    
    // Inject step container content
    stepContentBody.innerHTML = `
      <div class="step-illustration-panel">
        ${stepConfig.illustration}
      </div>
      <div class="step-details-panel">
        <div class="step-title-group">
          <div class="step-title-icon" style="color: var(--step-${stepNum});">
            ${stepConfig.icon}
          </div>
          <h2>${stepConfig.title}</h2>
        </div>
        <p>${stepConfig.desc}</p>
        <div class="step-detail-interactive">
          ${stepConfig.detailsHTML}
        </div>
      </div>
    `;

    // Trigger simulation animations if any
    triggerStepSimulations(stepNum);
  }

  // --- DYNAMIC DATA STORAGE FOR EACH STEP ---
  function getStepData(stepNum) {
    const claim = state.claimText;
    
    switch (stepNum) {
      case 1:
        return {
          title: 'Input Claim',
          summaryText: 'We verify your claim in 7 simple steps. Click "Next" to see how it works.',
          desc: 'We have received your claim. Click "Next" to continue.',
          icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`,
          illustration: `
            <svg class="svg-illustration" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="120" cy="120" r="100" fill="#f0f7ff" />
              <path d="M40 80C30 95 32 120 40 135" stroke="#dbeafe" stroke-width="3" stroke-linecap="round" />
              <path d="M200 160C210 145 208 120 200 105" stroke="#dbeafe" stroke-width="3" stroke-linecap="round" />
              <g filter="url(#drop-shadow-s1)">
                <rect x="70" y="50" width="100" height="120" rx="8" fill="white" stroke="#e2e8f0" stroke-width="2"/>
                <rect x="85" y="65" width="45" height="12" rx="2" fill="#eff6ff" />
                <line x1="85" y1="92" x2="155" y2="92" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" />
                <line x1="85" y1="105" x2="155" y2="105" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" />
                <line x1="85" y1="118" x2="135" y2="118" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" />
              </g>
              <circle cx="65" cy="165" r="16" fill="#ef4444" stroke="white" stroke-width="3" />
              <path d="M65 158V166M65 171H65.01" stroke="white" stroke-width="3" stroke-linecap="round" />
              <g filter="url(#drop-shadow-heavy-s1)">
                <circle cx="130" cy="130" r="24" fill="white" stroke="#2563eb" stroke-width="4" />
                <line x1="147" y1="147" x2="175" y2="175" stroke="#2563eb" stroke-width="5" stroke-linecap="round" />
                <path d="M122 130L127 135L138 124" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              </g>
              <defs>
                <filter id="drop-shadow-s1" x="60" y="44" width="120" height="140"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.05"/></filter>
                <filter id="drop-shadow-heavy-s1" x="98" y="98" width="90" height="90"><feDropShadow dx="2" dy="8" stdDeviation="6" flood-color="#1e3a8a" flood-opacity="0.12"/></filter>
              </defs>
            </svg>`,
          detailsHTML: `
            <div class="your-claim-box">
              <h4>Your Claim</h4>
              <p>${claim}</p>
            </div>`
        };

      case 2:
        return {
          title: 'Extract Text',
          summaryText: 'Extracting key textual claims and structural statements.',
          desc: 'Our system parses the submission structure and performs OCR extraction if needed.',
          icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
          illustration: `
            <svg class="svg-illustration" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="position:relative;">
              <circle cx="120" cy="120" r="100" fill="#ecfdf5" />
              <g filter="url(#drop-shadow-s2)">
                <rect x="75" y="45" width="90" height="130" rx="8" fill="white" stroke="#a7f3d0" stroke-width="2"/>
                <line x1="90" y1="70" x2="150" y2="70" stroke="#a7f3d0" stroke-width="3" stroke-linecap="round"/>
                <line x1="90" y1="85" x2="150" y2="85" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
                <line x1="90" y1="100" x2="140" y2="100" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
                <line x1="90" y1="115" x2="150" y2="115" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
                <line x1="90" y1="130" x2="120" y2="130" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
              </g>
              <!-- Scanner line -->
              <line x1="60" y1="100" x2="180" y2="100" id="scan-laser-line" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
            </svg>`,
          detailsHTML: `
            <div class="your-claim-box">
              <h4 style="color: var(--success);">Extraction Process</h4>
              <div id="ocr-status" style="font-size: 0.85rem; color: #065f46; font-weight: 500; margin-bottom: 6px;">Initializing extraction...</div>
              <div class="ocr-text-preview" id="ocr-preview">Processing...</div>
            </div>`
        };

      case 3:
        return {
          title: 'NLP Analysis',
          summaryText: 'Analyzing semantic syntax, claim stance, and entity mapping.',
          desc: 'Natural Language Processing helps us understand the sentiment and linguistic profile.',
          icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>`,
          illustration: `
            <svg class="svg-illustration" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="120" cy="120" r="100" fill="#f5f3ff" />
              <!-- Pulsing nodes -->
              <circle cx="120" cy="90" r="12" fill="#8b5cf6" opacity="0.8" />
              <circle cx="80" cy="140" r="10" fill="#c084fc" opacity="0.8" />
              <circle cx="160" cy="140" r="10" fill="#c084fc" opacity="0.8" />
              <!-- Lines between nodes -->
              <line x1="120" y1="90" x2="80" y2="140" stroke="#ddd6fe" stroke-width="2" />
              <line x1="120" y1="90" x2="160" y2="140" stroke="#ddd6fe" stroke-width="2" />
              <line x1="80" y1="140" x2="160" y2="140" stroke="#ddd6fe" stroke-width="2" />
              <circle cx="120" cy="135" r="28" fill="white" stroke="#8b5cf6" stroke-width="3" />
              <!-- Microchip paths -->
              <path d="M120 120V150" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>
              <circle cx="120" cy="120" r="4" fill="#8b5cf6" />
            </svg>`,
          detailsHTML: `
            <div class="your-claim-box">
              <h4 style="color: #7c3aed;">NLP Diagnostics</h4>
              <div id="nlp-diagnostics" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem; color: #4c1d95;">
                <div>Stance: <span style="font-weight: 700;">Assertive</span></div>
                <div>Sentiment: <span style="font-weight: 700;">Neutral</span></div>
                <div>Language: <span style="font-weight: 700;">English</span></div>
                <div>Complexity: <span style="font-weight: 700;">Moderate</span></div>
              </div>
              <div style="font-size: 0.75rem; border-top: 1px solid #ddd6fe; padding-top: 6px; margin-top: 6px; color: #6d28d9;">
                Entities: <span style="font-weight: 600; font-family: monospace;" id="nlp-entities">Scanning...</span>
              </div>
            </div>`
        };

      case 4:
        return {
          title: 'Search Evidence',
          summaryText: 'Generating query keywords and searching fact-checking APIs.',
          desc: 'We cross-reference multiple indices, search engines, and official agency records.',
          icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`,
          illustration: `
            <svg class="svg-illustration" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="120" cy="120" r="100" fill="#fff7ed" />
              <circle cx="120" cy="115" r="42" stroke="#fed7aa" stroke-width="3" stroke-dasharray="6 6" />
              <g filter="url(#drop-shadow-s4)">
                <circle cx="120" cy="115" r="30" fill="white" stroke="#f97316" stroke-width="3"/>
                <!-- Globe lines -->
                <path d="M120 85C125 100 125 130 120 145" stroke="#fdba74" stroke-width="2" />
                <path d="M120 85C115 100 115 130 120 145" stroke="#fdba74" stroke-width="2" />
                <line x1="90" y1="115" x2="150" y2="115" stroke="#fdba74" stroke-width="2" />
              </g>
              <line x1="141" y1="136" x2="175" y2="170" stroke="#f97316" stroke-width="6" stroke-linecap="round" />
            </svg>`,
          detailsHTML: `
            <div class="your-claim-box">
              <h4 style="color: #ea580c;">Simulated Web Queries</h4>
              <div class="queries-box" id="queries-container">
                <!-- Loaded via simulation script -->
              </div>
            </div>`
        };

      case 5:
        return {
          title: 'Verify Sources',
          summaryText: 'Evaluating credibility and authority weights of sources.',
          desc: 'Our models evaluate domain reputation, institutional trust, and citation trails.',
          icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`,
          illustration: `
            <svg class="svg-illustration" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="120" cy="120" r="100" fill="#fdf2f8" />
              <g filter="url(#drop-shadow-s5)">
                <path d="M120 45L60 70V125C60 165 120 195 120 195C120 195 180 165 180 125V70L120 45Z" fill="white" stroke="#ec4899" stroke-width="3"/>
                <path d="M95 115L110 130L145 95" stroke="#ec4899" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              </g>
            </svg>`,
          detailsHTML: `
            <div class="your-claim-box">
              <h4 style="color: #db2777;">Credibility Ratings</h4>
              <div class="sources-list" id="sources-list-container">
                <!-- Sources items updated by simulations -->
              </div>
            </div>`
        };

      case 6:
        return {
          title: 'Compare & Evaluate',
          summaryText: 'Checking claims assertions against evidence records.',
          desc: 'We map subject-verb-object relationships to identify factual contradictions.',
          icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
          illustration: `
            <svg class="svg-illustration" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="120" cy="120" r="100" fill="#f0fdf4" />
              <!-- Left item -->
              <rect x="50" y="90" width="55" height="55" rx="6" fill="white" stroke="#ef4444" stroke-width="2"/>
              <line x1="60" y1="105" x2="95" y2="105" stroke="#fee2e2" stroke-width="3" stroke-linecap="round"/>
              <line x1="60" y1="118" x2="95" y2="118" stroke="#fee2e2" stroke-width="3" stroke-linecap="round"/>
              <line x1="60" y1="131" x2="85" y2="131" stroke="#fee2e2" stroke-width="3" stroke-linecap="round"/>
              <!-- Right item -->
              <rect x="135" y="90" width="55" height="55" rx="6" fill="white" stroke="#10b981" stroke-width="2"/>
              <line x1="145" y1="105" x2="180" y2="105" stroke="#d1fae5" stroke-width="3" stroke-linecap="round"/>
              <line x1="145" y1="118" x2="180" y2="118" stroke="#d1fae5" stroke-width="3" stroke-linecap="round"/>
              <line x1="145" y1="131" x2="170" y2="131" stroke="#d1fae5" stroke-width="3" stroke-linecap="round"/>
              <!-- Scales balance or evaluation gear -->
              <circle cx="120" cy="117" r="14" fill="#0d9488" />
              <path d="M115 117L125 117" stroke="white" stroke-width="2" stroke-linecap="round" />
            </svg>`,
          detailsHTML: `
            <div class="your-claim-box">
              <h4 style="color: #047857;">Fact Alignment</h4>
              <div class="comparison-grid" id="comparison-container">
                <!-- Dynamic comparison sides -->
              </div>
            </div>`
        };

      case 7:
        return {
          title: 'Final Verdict',
          summaryText: 'Consolidating verdicts, reliability index, and explanation parameters.',
          desc: 'All verification modules succeeded. Final reports are ready for reveal.',
          icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`,
          illustration: `
            <svg class="svg-illustration" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="120" cy="120" r="100" fill="#eff6ff" />
              <g filter="url(#drop-shadow-s7)">
                <rect x="70" y="50" width="100" height="130" rx="8" fill="white" stroke="#2563eb" stroke-width="2"/>
                <!-- Ribbon seal -->
                <circle cx="120" cy="115" r="22" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
                <path d="M110 132L112 152L120 145L128 152L130 132" fill="#3b82f6" opacity="0.7" />
                <circle cx="120" cy="115" r="14" fill="#2563eb" />
                <path d="M115 115L118 118L125 111" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
            </svg>`,
          detailsHTML: `
            <div class="your-claim-box">
              <h4 style="color: var(--primary);">Summary Statement</h4>
              <p style="font-size: 0.85rem; color: #1e40af; font-weight: 500;">
                Click "Verify & Reveal" below to populate the full diagnostic grid and review sources, reliability star indices, confidence scopes, and detailed explanation text.
              </p>
            </div>`
        };

      default:
        return {};
    }
  }

  // --- INTERACTIVE MICRO-SIMULATION ALGORITHMS ---
  function triggerStepSimulations(stepNum) {
    const d = state.verdictData;
    
    if (stepNum === 2) {
      const statusText = document.getElementById('ocr-status');
      const previewText = document.getElementById('ocr-preview');
      
      // Step 2 OCR Scanner animation loop simulation
      setTimeout(() => {
        statusText.textContent = "Scanning characters...";
        previewText.textContent = "[OCR Reading active...]";
        
        setTimeout(() => {
          statusText.textContent = "Text extracted successfully!";
          previewText.innerHTML = `<span style="color:#047857; font-weight:600;">"${state.claimText}"</span>`;
        }, 1200);
      }, 600);
    }
    
    else if (stepNum === 3) {
      const entitiesSpan = document.getElementById('nlp-entities');
      setTimeout(() => {
        if (state.claimText.toLowerCase().includes('isro')) {
          entitiesSpan.textContent = "ISRO [ORG], Mars [LOC], 2025 [DATE]";
        } else if (state.claimText.toLowerCase().includes('earth')) {
          entitiesSpan.textContent = "Earth [LOC], Flat [ATTRIB]";
        } else if (state.claimText.toLowerCase().includes('vaccine') || state.claimText.toLowerCase().includes('covid')) {
          entitiesSpan.textContent = "COVID-19 [VIRUS], Vaccines [MED], Microchip [TECH]";
        } else {
          entitiesSpan.textContent = "Text [STRING], Entities mapped.";
        }
      }, 700);
    }
    
    else if (stepNum === 4) {
      const queriesContainer = document.getElementById('queries-container');
      const queries = [];
      const cleanText = state.claimText.toLowerCase();

      if (cleanText.includes('isro')) {
        queries.push("ISRO Mars landing 2025", "Gaganyaan crew launch schedules", "ISRO human planetary flight");
      } else if (cleanText.includes('earth')) {
        queries.push("Flat Earth physical debunking", "NASA oblate spheroid earth photos", "Curvature measurements satellite");
      } else if (cleanText.includes('vaccine')) {
        queries.push("COVID vaccine microchip components WHO", "FDA vaccine raw ingredients registry", "Vaccine tracking conspiracy origins");
      } else {
        queries.push("Claim validation cross-index search", "Factual credibility match lookup");
      }

      queriesContainer.innerHTML = '';
      
      // Add queries sequentially to simulate searching
      queries.forEach((q, idx) => {
        setTimeout(() => {
          const tag = document.createElement('div');
          tag.className = 'query-tag searching';
          tag.innerHTML = `
            <svg class="pulse-spinner-micro" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:10px; height:10px;"><circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.2"/><path d="M12 2A10 10 0 0122 12" stroke="currentColor" stroke-linecap="round"/></svg>
            <span>"${q}"</span>`;
          queriesContainer.appendChild(tag);

          // Change to "Completed" search state after a delay
          setTimeout(() => {
            tag.className = 'query-tag';
            tag.innerHTML = `
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:10px; height:10px; color:#10b981; stroke-width:3;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span>"${q}"</span>`;
          }, 800);
          
        }, idx * 400);
      });
    }
    
    else if (stepNum === 5) {
      const sourcesContainer = document.getElementById('sources-list-container');
      const sources = [];
      const cleanText = state.claimText.toLowerCase();

      if (cleanText.includes('isro')) {
        sources.push({ name: 'isro.gov.in', score: 100, class: 'high' });
        sources.push({ name: 'pib.gov.in (Fact Check)', score: 100, class: 'high' });
        sources.push({ name: 'breakingnewsblog.xyz', score: 12, class: 'low' });
      } else if (cleanText.includes('earth')) {
        sources.push({ name: 'nasa.gov', score: 100, class: 'high' });
        sources.push({ name: 'britannica.com', score: 98, class: 'high' });
        sources.push({ name: 'flatearthsociety.org', score: 8, class: 'low' });
      } else if (cleanText.includes('vaccine')) {
        sources.push({ name: 'who.int', score: 100, class: 'high' });
        sources.push({ name: 'cdc.gov', score: 100, class: 'high' });
        sources.push({ name: 'healthblogsite.info', score: 14, class: 'low' });
      } else {
        sources.push({ name: 'wikipedia.org', score: 94, class: 'high' });
        sources.push({ name: 'reuters.com', score: 96, class: 'high' });
        sources.push({ name: 'unverified-claims-post.net', score: 18, class: 'low' });
      }

      sourcesContainer.innerHTML = 'Analyzing database reputability...';
      
      setTimeout(() => {
        sourcesContainer.innerHTML = '';
        sources.forEach((src, idx) => {
          setTimeout(() => {
            const item = document.createElement('div');
            item.className = 'source-item';
            item.innerHTML = `
              <span class="source-name">${src.name}</span>
              <span class="source-trust ${src.class}">${src.score}% Trust</span>`;
            sourcesContainer.appendChild(item);
          }, idx * 250);
        });
      }, 500);
    }
    
    else if (stepNum === 6) {
      const comparisonContainer = document.getElementById('comparison-container');
      const cleanText = state.claimText.toLowerCase();
      let claimSummary = "";
      let factSummary = "";

      if (cleanText.includes('isro')) {
        claimSummary = "ISRO landed astronauts on Mars in 2025.";
        factSummary = "Gaganyaan (manned orbital) is active. No human Mars mission planned for 2025.";
      } else if (cleanText.includes('earth')) {
        claimSummary = "The Earth is static, flat, and circular.";
        factSummary = "Physical measurements, satellites, and orbit metrics show Earth is an oblate spheroid.";
      } else if (cleanText.includes('vaccine')) {
        claimSummary = "COVID vaccines contain hardware microchips.";
        factSummary = "Audited components contain biochemical immunity solutions. Chips do not exist in doses.";
      } else if (cleanText.includes('boil') || cleanText.includes('water')) {
        claimSummary = "Water boils at 100 degrees Celsius.";
        factSummary = "Thermodynamic standards confirm boiling point is 100°C under normal sea level pressures.";
      } else {
        claimSummary = state.claimText.substring(0, 45) + "...";
        factSummary = d.summary;
      }

      comparisonContainer.innerHTML = 'Computing comparative matrices...';
      
      setTimeout(() => {
        comparisonContainer.innerHTML = `
          <div class="comparison-box claim-side">
            <h5>Statement Claims</h5>
            <p>${claimSummary}</p>
          </div>
          <div class="comparison-box fact-side">
            <h5>Evidence Base</h5>
            <p>${factSummary}</p>
          </div>
        `;
      }, 600);
    }
  }

  // --- LASER SCAN LINE EFFECTS FOR STEP 2 illustration ---
  setInterval(() => {
    const laser = document.getElementById('scan-laser-line');
    if (laser) {
      // Toggle laser scan position between 60px and 180px
      const currentY = parseFloat(laser.getAttribute('y1'));
      const newY = currentY === 100 ? 150 : (currentY === 150 ? 70 : 100);
      laser.setAttribute('y1', newY);
      laser.setAttribute('y2', newY);
      laser.style.transition = "all 0.8s ease-in-out";
    }
  }, 1000);

  // --- LANGUAGE SELECTOR DROPDOWN ---
  const langContainer = document.querySelector('.lang-selector-container');
  const langBtn = document.getElementById('lang-btn');
  const langDropdown = document.getElementById('lang-dropdown');
  const currentLangSpan = document.getElementById('current-lang');
  const langOptions = document.querySelectorAll('.lang-option');

  if (langBtn && langDropdown) {
    // Toggle dropdown
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langContainer.classList.toggle('open');
    });

    // Close dropdown on click outside
    document.addEventListener('click', () => {
      if (langContainer) langContainer.classList.remove('open');
    });

    // Select language option
    langOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const langName = opt.textContent.split(' ')[0]; // E.g., "English" or "తెలుగు"
        currentLangSpan.textContent = langName;
        
        langOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        
        // Hide dropdown
        langContainer.classList.remove('open');
      });
    });
  }

});

