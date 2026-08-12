/**
 * Fake News Detection & Claim Verification System
 * Frontend Application Logic & Multi-lingual Translations
 */

// --- GLOBAL MULTI-LINGUAL DICTIONARY ---
const translations = {
  en: {
    logo_title: "Fake News Detection <span>&</span><br>Claim Verification System",
    nav_home: "Home",
    nav_history: "History",
    nav_how: "How it Works",
    nav_about: "About Us",
    input_title: "1. Input Your Claim",
    input_sub: "Enter text or upload image / PDF",
    tab_text: "Text",
    tab_image: "Image",
    tab_pdf: "PDF",
    textarea_placeholder: "Type your claim statement here...",
    upload_title: "Or upload files",
    upload_img: "Upload Image",
    upload_pdf: "Upload PDF",
    upload_sub: "Supports JPG, PNG, PDF (Max 10MB)",
    tips_title: "Tips",
    tips_1: "Enter specific claims for better results.",
    tips_2: "Our system searches reliable sources and provides an explainable verdict.",
    btn_verify: "Start Verification",
    steps_banner: 'We verify your claim in 7 simple steps. Click "Next" to see how it works.',
    step1_title: "Input Claim",
    step2_title: "Extract Text",
    step3_title: "NLP Analysis",
    step4_title: "Search Evidence",
    step5_title: "Verify Sources",
    step6_title: "Compare & Evaluate",
    step7_title: "Final Verdict",
    step1_desc: "We have received your claim. Click \"Next\" to continue.",
    step2_desc: "Our system parses the submission structure and performs OCR extraction if needed.",
    step3_desc: "Natural Language Processing helps us understand the sentiment and linguistic profile.",
    step4_desc: "We cross-reference multiple indices, search engines, and official agency records.",
    step5_desc: "Our models evaluate domain reputation, institutional trust, and citation trails.",
    step6_desc: "We map subject-verb-object relationships to identify factual contradictions.",
    step7_desc: "All verification modules succeeded. Final reports are ready for reveal.",
    step_pill: "Step {step} of 7",
    your_claim: "Your Claim",
    btn_back: "Back",
    btn_next: "Next",
    btn_verify_reveal: "Verify & Reveal",
    results_title: "Final Result (Available after Step 7)",
    results_title_verified: "Final Result (Verified)",
    results_banner_default: "Please go through all 7 steps. The complete analysis and final verdict will be displayed at the end.",
    results_banner_complete: "Verification complete. Claim evaluation finalized and unlocked.",
    w_verdict: "Verdict",
    w_confidence: "Confidence Score",
    w_type: "Claim Type",
    w_reliability: "Overall Reliability",
    w_explanation: "Explanation (Why?)",
    w_sources: "Top Sources",
    w_summary: "Evidence Summary",
    w_insights: "NLP Insights",
    sub_end: "Will be shown at the end",
    sub_verified: "Verified Result",
    no_claim: "No claim entered yet. Type above to start.",
    view_history_title: "Claim Verification History",
    view_history_sub: "A history of verified claims processed by this workspace.",
    th_claim: "Claim Statement",
    th_verdict: "Verdict",
    th_confidence: "Confidence",
    th_category: "Category",
    th_timestamp: "Timestamp",
    th_actions: "Actions",
    btn_reverify: "Re-verify",
    view_how_title: "How it Works",
    view_how_sub: "Understanding the automated 7-step claim verification engine.",
    view_about_title: "About Us",
    view_about_sub: "Fake News Detection & Claim Verification System.",
    about_mission_h3: "Our Mission",
    about_mission_p: "Misinformation weakens democratic institutions and compromises collective action on health, science, and policy. Our mission is to engineer transparent, explainable machine-checking interfaces that cross-reference claims against authoritative sources, providing public confidence audits for information consumed online.",
    about_tech_h3: "Core Technology Stack",
    about_tech_p: "The system leverages semantic similarity indices, named entity tokenizers, custom search API crawlers, and a curated source reputation directory. The interface is optimized to deliver comprehensive explainable evidence rather than arbitrary boolean verdicts.",
    p_obj_h4: "Objectivity",
    p_obj_p: "Decisions are weighted strictly based on evidence citations from authoritative domains, minimizing indexing bias.",
    p_trans_h4: "Transparency",
    p_trans_p: "All source citations, trust metrics, and matching quotes are exposed to the user for direct verification.",
    p_speed_h4: "Speed & Precision",
    p_speed_p: "Multi-threaded NLP pipelines scan, evaluate, and formulate results within seconds of query trigger.",

    // History claims
    claim_h1: "ISRO successfully sent humans to Mars in 2025.",
    claim_h2: "Water boiling point decreases at higher altitudes.",
    claim_h3: "New COVID variant is resistant to all current immunity options.",
    claim_h4: "NASA confirmed discovery of alien cities on Jupiter.",

    // Global tags
    v_true: "TRUE",
    v_false: "FALSE",
    v_misleading: "MISLEADING",
    cat_space: "Space & Tech",
    cat_science: "Science",
    cat_medicine: "Medicine",
    time_today: "Today, 12:15 PM",
    time_yesterday: "Yesterday, 4:30 PM",
    time_aug5: "Aug 5, 2026",
    time_jul28: "Jul 28, 2026",

    // Interactive steps translations
    s2_header: "EXTRACTION PROCESS",
    s2_status_1: "Analyzing structures...",
    s2_status_2: "Parsing sentences...",
    s2_status_3: "Extraction Complete!",
    s3_header: "NLP DIAGNOSTICS",
    s3_stance: "Stance",
    s3_sentiment: "Sentiment",
    s3_lang: "Language",
    s3_complexity: "Complexity",
    s3_entities: "Entities",
    s3_scanning: "Scanning...",
    s3_mapped: "Entities mapped.",
    s4_header: "SIMULATED WEB QUERIES",
    s5_header: "CREDIBILITY RATINGS",
    s5_trust: "Trust",
    s6_header: "FACT ALIGNMENT",
    s6_claim_side: "Statement Claims",
    s6_fact_side: "Evidence Base",
    s6_computing: "Computing comparative matrices...",
    s7_header: "Summary Statement",
    s7_desc: 'Click "Verify & Reveal" below to populate the full diagnostic grid and review sources, reliability star indices, confidence scopes, and detailed explanation text.',

    // Stepper diagnostics values
    v_assertive: "Assertive",
    v_neutral: "Neutral",
    v_english: "English",
    v_moderate: "Moderate",

    // Verdict dynamic objects
    res_mars: {
      verdict: 'FALSE',
      type: 'Space & Tech',
      explanation: 'No human Mars mission has been conducted by ISRO as of 2025. ISRO\'s current human spaceflight program is Gaganyaan, aimed only at Earth orbit.',
      sources: 'isro.gov.in (Official Space Agency), pib.gov.in (Fact Check), space.com',
      summary: 'Official statements confirm ISRO has no manned Mars landing scheduled. Current missions are focused on low Earth orbit and unmanned lunar/solar probes.',
      insights: 'Sentiment: Neutral\nToxicity: 0%\nStance: Assertive\nConfidence: Extremely High'
    },
    res_flat: {
      verdict: 'FALSE',
      type: 'Conspiracy',
      explanation: 'Satellite imaging and physics prove Earth is an oblate spheroid. Flat Earth claims violate fundamental physics laws and astronomical observations.',
      sources: 'nasa.gov (Space Agency), britannica.com (Encyclopedia), physics.org',
      summary: 'All scientific, geodetic, and satellite records confirm Earth is spherical. Claims of a flat disk are debunked by centuries of gravity and physics evidence.',
      insights: 'Sentiment: Subjective\nToxicity: 2%\nStance: Dogmatic\nFactual Match: 0%'
    },
    res_vaccine: {
      verdict: 'FALSE',
      type: 'Medical Misinfo',
      explanation: 'Vaccines contain biological formulas for immunity, not electronics. Ingredients list is publicly reviewed and audited by health regulators.',
      sources: 'who.int (World Health Org), cdc.gov (Disease Control), fda.gov (Drug Administration)',
      summary: 'Rigorous regulatory analyses and audits confirm COVID-19 vaccines contain no microchips or tracking hardware. Claims are biologically and technically impossible.',
      insights: 'Sentiment: Negative\nToxicity: 4%\nStance: Alarmist\nTruthfulness: 0%'
    },
    res_boil: {
      verdict: 'TRUE',
      type: 'General Science',
      explanation: 'This statement is scientifically accurate and corresponds to established facts regarding thermodynamics and physics.',
      sources: 'britannica.com (Encyclopedia), chem.libretexts.org (Chemistry Lib), nature.com (Scientific Journal)',
      summary: 'Evidence perfectly supports this claim under standard environments. The statements are verifiable in classroom settings and peer-reviewed material.',
      insights: 'Sentiment: Objective\nToxicity: 0%\nStance: Informative\nEvidence Score: 95%'
    },
    res_fallback: {
      verdict: 'MISLEADING',
      type: 'General News',
      explanation: 'The statement contains some verifiable elements but is packaged with unverified assumptions or out-of-context details.',
      sources: 'reuters.com (News Bureau), apnews.com (Press Agency), factcheck.org (Auditor)',
      summary: 'Independent news bureaus report mixed evidence regarding this specific combination of facts. Recommend caution before sharing.',
      insights: 'Sentiment: Speculative\nToxicity: 1%\nStance: Suggestive\nVerify Rate: Medium'
    }
  },
  te: {
    logo_title: "నకిలీ వార్తల గుర్తింపు <span>&</span><br>క్లెయిమ్ వెరిఫికేషన్ సిస్టమ్",
    nav_home: "హోమ్",
    nav_history: "చరిత్ర",
    nav_how: "పనితీరు",
    nav_about: "మా గురించి",
    input_title: "1. మీ క్లెయిమ్‌ను నమోదు చేయండి",
    input_sub: "టెక్స్ట్ టైప్ చేయండి లేదా ఇమేజ్ / PDF అప్‌లోడ్ చేయండి",
    tab_text: "టెక్స్ట్",
    tab_image: "ఇమేజ్",
    tab_pdf: "PDF",
    textarea_placeholder: "మీ క్లెయిమ్ ప్రకటనను ఇక్కడ టైప్ చేయండి...",
    upload_title: "లేదా ఫైళ్లను అప్‌లోడ్ చేయండి",
    upload_img: "ఇమేజ్ అప్‌లోడ్",
    upload_pdf: "PDF అప్‌లోడ్",
    upload_sub: "JPG, PNG, PDF సపోర్ట్ చేస్తుంది (గరిష్టంగా 10MB)",
    tips_title: "చిట్కాలు",
    tips_1: "మెరుగైన ఫలితాల కోసం నిర్దిష్ట క్లెయిమ్‌లను నమోదు చేయండి.",
    tips_2: "మా సిస్టమ్ నమ్మదగిన మూలాలను శోధిస్తుంది మరియు వివరణాత్మక తీర్పును ఇస్తుంది.",
    btn_verify: "ధృవీకరణ ప్రారంభించు",
    steps_banner: "మేము మీ క్లెయిమ్‌ను 7 సులువైన దశల్లో ధృవీకరిస్తాము. ఇది ఎలా పనిచేస్తుందో చూడటానికి \"నెక్స్ట్\" క్లిక్ చేయండి.",
    step1_title: "క్లెయిమ్ నమోదు",
    step2_title: "టెక్స్ట్ సంగ్రహణ",
    step3_title: "NLP విశ్లేషణ",
    step4_title: "సాక్ష్యాల శోధన",
    step5_title: "మూలాల ధృవీకరణ",
    step6_title: "పోలిక & మూల్యాంకనం",
    step7_title: "తుది తీర్పు",
    step1_desc: "మీ క్లెయిమ్ విజయవంతంగా అందింది. కొనసాగించడానికి \"నెక్స్ట్\" క్లిక్ చేయండి.",
    step2_desc: "మా సిస్టమ్ ఫైల్‌ను స్కాన్ చేసి, అవసరమైతే OCR ద్వారా టెక్స్ట్‌ను సంగ్రహిస్తుంది.",
    step3_desc: "Natural Language Processing ద్వారా క్లెయిమ్ యొక్క సెంటిమెంట్ మరియు స్టాన్స్ విశ్లేషించబడుతుంది.",
    step4_desc: "మేము వార్తా సైట్‌లు మరియు గ్లోబల్ సాక్ష్యాల డేటాబేస్‌లలో శోధిస్తాము.",
    step5_desc: "లభించిన మూలాల యొక్క విశ్వసనీయత రేటింగ్ లెక్కించబడుతుంది.",
    step6_desc: "నిజానిజాలను అంచనా వేయడానికి క్లెయిమ్‌ను సాక్ష్యాలతో పోల్చి చూస్తాము.",
    step7_desc: "అన్ని రకాల విశ్లేషణలు పూర్తయ్యాయి. తుది నివేదికలు కింద సిద్ధంగా ఉన్నాయి.",
    step_pill: "దశ {step}/7",
    your_claim: "మీ క్లెయిమ్",
    btn_back: "వెనుకకు",
    btn_next: "ముందుకు",
    btn_verify_reveal: "ధృవీకరించి చూపించు",
    results_title: "తుది ఫలితం (దశ 7 తర్వాత అందుబాటులోకి వస్తుంది)",
    results_title_verified: "తుది ఫలితం (ధృవీకరించబడింది)",
    results_banner_default: "దయచేసి 7 దశలను పూర్తి చేయండి. తుది తీర్పు మరియు విశ్లేషణ చివరలో ప్రదర్శించబడతాయి.",
    results_banner_complete: "ధృవీకరణ విజయవంతంగా పూర్తయింది. క్లెయిమ్ నివేదిక అన్‌లాక్ చేయబడింది.",
    w_verdict: "తీర్పు",
    w_confidence: "నమ్మకం శాతం",
    w_type: "క్లెయిమ్ రకం",
    w_reliability: "విశ్వసనీయత",
    w_explanation: "వివరణ (ఎందుకు?)",
    w_sources: "ముఖ్య ఆధారాలు",
    w_summary: "సాక్ష్యాల సారాంశం",
    w_insights: "NLP అంతర్దృష్టులు",
    sub_end: "చివరలో చూపబడుతుంది",
    sub_verified: "ధృవీకరించబడిన ఫలితం",
    no_claim: "ఇంకా ఏ క్లెయిమ్ నమోదు చేయలేదు. ప్రారంభించడానికి పైన టైప్ చేయండి.",
    view_history_title: "క్లెయిమ్ ధృవీకరణ చరిత్ర",
    view_history_sub: "ఈ వర్క్‌స్పేస్‌లో ధృవీకరించబడిన గత క్లెయిమ్‌ల చరిత్ర.",
    th_claim: "క్లెయిమ్ ప్రకటన",
    th_verdict: "తీర్పు",
    th_confidence: "నమ్మకం",
    th_category: "వర్గం",
    th_timestamp: "సమయం",
    th_actions: "చర్యలు",
    btn_reverify: "మళ్లీ ధృవీకరించు",
    view_how_title: "పనితీరు ఎలా ఉంటుంది",
    view_how_sub: "7-దశల ఆటోమేటెడ్ క్లెయిమ్ వెరిఫికేషన్ సిస్టమ్ పనితీరును అర్థం చేసుకోండి.",
    view_about_title: "మా గురించి",
    view_about_sub: "నకిలీ వార్తల గుర్తింపు & క్లెయిమ్ వెరిఫికేషన్ సిస్టమ్.",
    about_mission_h3: "మా లక్ష్యం",
    about_mission_p: "నకిలీ సమాచారం మరియు తప్పుడు ప్రచారాల వల్ల సమాజంలో కలిగే నష్టాలను నివారించడం మా లక్ష్యం. మూలాల నుండి సమాచారాన్ని సేకరించి, అత్యంత పారదర్శకమైన సాక్ష్యాలతో వాస్తవాలను ధృవీకరించే సాంకేతికతను మేము అందిస్తున్నాము.",
    about_tech_h3: "ఉపయోగించిన సాంకేతికత",
    about_tech_p: "ఈ వ్యవస్థ నిజసమయ వెబ్ క్రాలర్లు, సిమాంటిక్ పోలిక సూచికలు మరియు క్యూరేటెడ్ సోర్స్ డేటాబేస్ ద్వారా పనిచేస్తుంది. ఇది కేవలం నిజం/అబద్ధం అని మాత్రమే కాకుండా స్పష్టమైన వివరణాत्मक నివేదికను ఇస్తుంది.",
    p_obj_h4: "నిష్పాక్షికత",
    p_obj_p: "విశ్వసనీయమైన మూలాల ఆధారంగా మాత్రమే వాస్తవాలను నిర్ణయిస్తాము, పక్షపాతాలకు తావులేదు.",
    p_trans_h4: "పారదర్శకత",
    p_trans_p: "వినియోగదారుల నమ్మకం కోసం సాక్ష్యాలు, మూలాలు మరియు వాటి రేటింగ్‌లు అన్నీ స్పష్టంగా చూపిస్తాము.",
    p_speed_h4: "వేగం & ఖచ్చితత్వం",
    p_speed_p: "NLP సాంకేతికత ద్వారా సెకన్లలో సమాచారాన్ని స్కాన్ చేసి ఫలితాలను అందిస్తాము.",

    // History claims
    claim_h1: "ఇస్రో 2025 లో విజయవంతంగా మానవులను అంగారకుడిపైకి పంపింది.",
    claim_h2: "ఎత్తైన ప్రదేశాలలో నీటి మరిగే స్థానం తగ్గుతుంది.",
    claim_h3: "కొత్త కోవిడ్ వేరియంట్ అన్ని ప్రస్తుత రోగనిరోధక శక్తి ఎంపికలకు నిరోధకతను కలిగి ఉంది.",
    claim_h4: "బృహస్పతిపై గ్రహాంతర నగరాల ఆవిష్కరణను నాసా ధృవీకరించింది.",

    // Global tags
    v_true: "నిజం",
    v_false: "అబద్ధం",
    v_misleading: "తప్పుదోవ పట్టించేది",
    cat_space: "అంతరిక్షం & టెక్",
    cat_science: "సైన్స్",
    cat_medicine: "వైద్యం",
    time_today: "ఈరోజు, 12:15 PM",
    time_yesterday: "నిన్న, 4:30 PM",
    time_aug5: "ఆగస్టు 5, 2026",
    time_jul28: "జూలై 28, 2026",

    // Interactive steps translations
    s2_header: "సంగ్రహణ ప్రక్రియ",
    s2_status_1: "నిర్మాణాన్ని విశ్లేషిస్తోంది...",
    s2_status_2: "టెక్స్ట్‌ని సంగ్రహిస్తోంది...",
    s2_status_3: "విజయవంతంగా పూర్తయింది!",
    s3_header: "NLP విశ్లేషణలు",
    s3_stance: "వైఖరి",
    s3_sentiment: "భావోద్వేగం",
    s3_lang: "భాష",
    s3_complexity: "క్లిష్టత",
    s3_entities: "ఎంటిటీలు",
    s3_scanning: "స్కాన్ చేస్తోంది...",
    s3_mapped: "ఎంటిటీలు గుర్తించబడ్డాయి.",
    s4_header: "వెబ్ శోధనలు",
    s5_header: "విశ్వసనీయత రేటింగ్స్",
    s5_trust: "విశ్వసనీయత",
    s6_header: "వాస్తవాల పోలిక ప్యానెల్",
    s6_claim_side: "ప్రకటన క్లెయిమ్‌లు",
    s6_fact_side: "ఆధారాల మూలం",
    s6_computing: "పోలిక నివేదికను లెక్కిస్తోంది...",
    s7_header: "సారాంశ ప్రకటన",
    s7_desc: 'వెరిఫికేషన్ వివరాలు మరియు పూర్తి విశ్లేషణను కింద ఉన్న నివేదికలో అన్‌లాక్ చేయడానికి "ధృవీకరించి చూపించు" బటన్ నొక్కండి.',

    // Stepper diagnostics values
    v_assertive: "రూఢీ అయినది",
    v_neutral: "తటస్థం",
    v_english: "ఇంగ్లీష్",
    v_moderate: "మధ్యస్థం",

    // Verdict objects
    res_mars: {
      verdict: 'అబద్ధం',
      type: 'అంతరిక్షం & టెక్',
      explanation: 'ఇప్పటి వరకు ఇస్రో ద్వారా ఎలాంటి మానవసహిత అంగారక యాత్ర ప్రణాళిక చేయబడలేదు. ఇస్రో ప్రస్తుతం గగన్‌యాన్ అంతరిక్ష యాత్రపై మాత్రమే దృష్టి పెట్టింది.',
      sources: 'isro.gov.in (అధికారిక అంతరిక్ష సంస్థ), pib.gov.in (ఫాక్ట్ చెక్), space.com',
      summary: '2025 లో ఇస్రో అంగారకుడిపైకి మనుషులను పంపడం లేదని అధికారిక వర్గాలు ధృవీకరించాయి. ప్రస్తుతం తక్కువ భూకక్ష్య ప్రయోగాలపై మాత్రమే దృష్టి పెట్టారు.',
      insights: 'సెంటిమెంట్: తటస్థం\nటాక్సిసిటీ: 0%\nస్టాన్స్: రూఢీ అయినది\nనమ్మకం: అత్యధికం'
    },
    res_flat: {
      verdict: 'అబద్ధం',
      type: 'కుట్ర సిద్ధాంతం',
      explanation: 'ఉపగ్రహ చిత్రాలు మరియు భౌతిక శాస్త్ర సూత్రాలు భూమి ఒక గోళాకార రూపం (Oblate Spheroid) అని రుజువు చేస్తున్నాయి. ఫ్లాట్ ఎర్త్ వాదనలు నిరాధారమైనవి.',
      sources: 'nasa.gov (అంతరిక్ష సంస్థ), britannica.com (విజ్ఞాన సర్వస్వం), physics.org',
      summary: 'అన్ని శాస్త్రీయ మరియు ఉపగ్రహ రికార్డులు భూమి గుండ్రంగా ఉందని ధృవీకరించాయి. ఫ్లాట్ ఎర్త్ సిద్ధాంతం పూర్తిగా అబద్ధం అని రుజువైంది.',
      insights: 'సెంటిమెంట్: ఆత్మాశ్రయం\nటాక్సిసిటీ: 2%\nస్టాన్స్: కఠినమైనది\nసత్య శాతం: 0%'
    },
    res_vaccine: {
      verdict: 'అబద్ధం',
      type: 'వైద్య వక్రీకరణ',
      explanation: 'కోవిడ్ వ్యాక్సిన్లలో కేవలం రోగనిరోధక శక్తిని పెంచే జీవ రసాయనాలు మాత్రమే ఉంటాయి, ఎలక్ట్రానిక్ చిప్స్ ఉండవు. వీటి తయారీ ఫార్ములాను ప్రభుత్వాలు ధృవీకరించాయి.',
      sources: 'who.int (ప్రపంచ ఆరోగ్య సంస్థ), cdc.gov (వ్యాధి నియంత్రణ), fda.gov (ఔషధ నియంత్రణ)',
      summary: 'కోవిడ్-19 టీకాలలో ఎలాంటి మైక్రోచిప్స్ లేవని అంతర్జాతీయ ఆరోగ్య సంస్థల పరిశోధనల్లో తేలింది. ఇవి కేవలం అపోహలు మాత్రమే.',
      insights: 'సెంటిమెంట్: ప్రతికూలం\nటాక్సిసిటీ: 4%\nస్టాన్స్: భయాందోళన\nసత్య శాతం: 0%'
    },
    res_boil: {
      verdict: 'నిజం',
      type: 'సాధారణ సైన్స్',
      explanation: 'భౌతిక మరియు ఉష్ణగతిక శాస్త్రాల ప్రకారం సాధారణ వాతావరణ పీడనం వద్ద నీరు 100 డిగ్రీల సెల్సియస్ వద్ద మరుగుతుంది.',
      sources: 'britannica.com (విజ్ఞాన సర్వస్వం), chem.libretexts.org (కెమిస్ట్రీ లైబ్రరీ), nature.com (శాస్త్రీయ జర్నల్)',
      summary: 'ఈ నివేదిక భౌతిక శాస్త్ర ప్రమాణాలకు అనుగుణంగా ఉంది. ప్రయోగశాలల పరిశోధనల్లో ఇది నిరూపితమైన సత్యం.',
      insights: 'సెంటిమెంట్: లక్ష్యాత్మకం\nటాక్సిసిటీ: 0%\nస్టాన్స్: సమాచారపూరితం\nఆధారాల శాతం: 95%'
    },
    res_fallback: {
      verdict: 'తప్పుదోవ పట్టించేది',
      type: 'సాధారణ వార్తలు',
      explanation: 'ఈ ప్రకటనలో కొన్ని నిజాలు ఉన్నప్పటికీ, అవి సందర్భం లేకుండా మరియు తప్పుడు ఊహలతో కూడి ఉన్నాయి.',
      sources: 'reuters.com (వార్తా సంస్థ), apnews.com (ప్రెస్ ఏజెన్సీ), factcheck.org (ఆడిటర్)',
      summary: 'స్వతంత్ర వార్తా ఏజెన్సీల ప్రకారం ఈ వార్తకు మిశ్రమ ఆధారాలు లభించాయి. దీనిని షేర్ చేసేటప్పుడు జాగ్రత్త వహించండి.',
      insights: 'సెంటిమెంట్: ఊహాజనితం\nటాక్సిసిటీ: 1%\nస్టాన్స్: సలహాత్మకం\nధృవీకరణ శాతం: మధ్యస్థం'
    }
  },
  hi: {
    logo_title: "फेक न्यूज़ डिटेक्शन <span>&</span><br>दावा सत्यापन प्रणाली",
    nav_home: "होम",
    nav_history: "इतिहास",
    nav_how: "यह कैसे काम करता है",
    nav_about: "हमारे बारे में",
    input_title: "1. अपना दावा दर्ज करें",
    input_sub: "टेक्स्ट टाइप करें या इमेज / PDF अपलोड करें",
    tab_text: "टेक्स्ट",
    tab_image: "इमेज",
    tab_pdf: "PDF",
    textarea_placeholder: "अपना दावा कथन यहाँ टाइप करें...",
    upload_title: "या फ़ाइलें अपलोड करें",
    upload_img: "इमेज अपलोड करें",
    upload_pdf: "PDF अपलोड करें",
    upload_sub: "JPG, PNG, PDF का समर्थन (अधिकतम 10MB)",
    tips_title: "सुझाव",
    tips_1: "बेहतर परिणामों के लिए विशिष्ट दावे दर्ज करें।",
    tips_2: "हमारी प्रणाली विश्वसनीय स्रोतों की खोज करती है और एक स्पष्टीकरण योग्य निर्णय देती है।",
    btn_verify: "सत्यापन शुरू करें",
    steps_banner: "हम 7 सरल चरणों में आपके दावे को सत्यापित करते हैं। यह कैसे काम करता है देखने के लिए \"नेक्स्ट\" पर क्लिक करें।",
    step1_title: "दावा दर्ज करें",
    step2_title: "टेक्स्ट निकालें",
    step3_title: "NLP विश्लेषण",
    step4_title: "साक्ष्य खोजें",
    step5_title: "स्रोतों का सत्यापन",
    step6_title: "तुलना और मूल्यांकन",
    step7_title: "अंतिम निर्णय",
    step1_desc: "हमें आपका दावा मिल गया है। आगे बढ़ने के लिए \"नेक्स्ट\" पर क्लिक करें।",
    step2_desc: "हमारी प्रणाली फ़ाइल संरचना को स्कैन करती है और आवश्यकतानुसार OCR पाठ निष्कर्षण करती. है।",
    step3_desc: "प्राकृतिक भाषा प्रसंस्करण हमें दावे के रुख और भावनाओं को समझने में मदद करता है।",
    step4_desc: "हम समाचारों, खोज इंजनों और आधिकारिक एजेंसी रिकॉर्ड्स में साक्ष्य खोजते हैं।",
    step5_desc: "हमारे मॉडल स्रोत डोमेन की प्रतिष्ठा और विश्वसनीयता का मूल्यांकन करते हैं।",
    step6_desc: "हम विरोधाभासों की पहचान करने के लिए दावों की तुलना साक्ष्यों से करते हैं।",
    step7_desc: "सभी सत्यापन मॉड्यूल सफल रहे। अंतिम रिपोर्ट प्रदर्शित करने के लिए तैयार है।",
    step_pill: "चरण {step}/7",
    your_claim: "आपका दावा",
    btn_back: "पीछे",
    btn_next: "नेक्स्ट",
    btn_verify_reveal: "सत्यापित करें और दिखाएं",
    results_title: "अंतिम परिणाम (चरण 7 के बाद उपलब्ध होगा)",
    results_title_verified: "अंतिम परिणाम (सत्यापित)",
    results_banner_default: "कृपया सभी 7 चरणों को पूरा करें। अंतिम विश्लेषण और निर्णय अंत में प्रदर्शित किया जाएगा।",
    results_banner_complete: "सत्यापन पूरा हुआ। दावा मूल्यांकन रिपोर्ट अनलॉक कर दी गई है।",
    w_verdict: "निर्णय",
    w_confidence: "आत्मविश्वास स्कोर",
    w_type: "दावा प्रकार",
    w_reliability: "समग्र विश्वसनीयता",
    w_explanation: "स्पष्टीकरण (क्यों?)",
    w_sources: "शीर्ष स्रोत",
    w_summary: "साक्ष्य सारांश",
    w_insights: "NLP अंतर्दृष्टि",
    sub_end: "अंत में दिखाया जाएगा",
    sub_verified: "सत्यापित परिणाम",
    no_claim: "अभी तक कोई दावा दर्ज नहीं किया गया है। शुरू करने के लिए ऊपर टाइप करें।",
    view_history_title: "दावा सत्यापन इतिहास",
    view_history_sub: "इस कार्यक्षेत्र द्वारा संसाधित सत्यापित दावों का इतिहास।",
    th_claim: "दावा कथन",
    th_verdict: "निर्णय",
    th_confidence: "आत्मविश्वास",
    th_category: "श्रेणी",
    th_timestamp: "समय",
    th_actions: "कार्रवाई",
    btn_reverify: "पुनः सत्यापित करें",
    view_how_title: "यह कैसे काम करता है",
    view_how_sub: "स्वचालित 7-चरणीय दावा सत्यापन प्रणाली को समझें।",
    view_about_title: "हमारे बारे में",
    view_about_sub: "फेक न्यूज़ डिटेक्शन और दावा सत्यापन प्रणाली।",
    about_mission_h3: "हमारा उद्देश्य",
    about_mission_p: "गलत सूचना लोकतांत्रिक संस्थाओं को कमजोर करती है। हमारा उद्देश्य पारदर्शी और स्पष्ट सत्यापन उपकरण विकसित करना है जो दावों की तुलना आधिकारिक स्रोतों से करके सार्वजनिक विश्वास का ऑडिट प्रदान करे।",
    about_tech_h3: "कोर टेक्नोलॉजी स्टैक",
    about_tech_p: "यह प्रणाली वास्तविक समय के वेब क्रॉलर, सिमेंटिक समानता सूचकांक और स्रोत प्रतिष्ठा निर्देशिका का उपयोग करती है। यह केवल हां/ना के बजाय एक विस्तृत व्याख्यात्मक रिपोर्ट देती है।",
    p_obj_h4: "निष्पक्षता",
    p_obj_p: "निर्णय पूरी तरह से आधिकारिक स्रोतों के साक्ष्यों पर आधारित होते हैं, जिसमें किसी प्रकार का पूर्वाग्रह नहीं होता।",
    p_trans_h4: "पारदर्शिता",
    p_trans_p: "सभी स्रोत उद्धरण, विश्वसनीयता रेटिंग और मिलान कथन उपयोगकर्ता के सत्यापन के लिए प्रदर्शित किए जाते हैं।",
    p_speed_h4: "गति और सटीकता",
    p_speed_p: "NLP तकनीक के माध्यम से कुछ ही सेकंड में दावों को स्कैन और सत्यापित किया जाता है।",

    // History claims
    claim_h1: "इसरो ने 2025 में सफलतापूर्वक मनुष्यों को मंगल पर भेजा।",
    claim_h2: "अधिक ऊंचाई पर पानी का क्वथनांक कम हो जाता है।",
    claim_h3: "नया कोविड संस्करण सभी मौजूदा प्रतिरक्षा विकल्पों के प्रति प्रतिरोधी है।",
    claim_h4: "नासा ने बृहस्पति पर एलियन शहरों की खोज की पुष्टि की।",

    // Global tags
    v_true: "सत्य",
    v_false: "असत्य",
    v_misleading: "भ्रामक",
    cat_space: "अंतरिक्ष और तकनीक",
    cat_science: "विज्ञान",
    cat_medicine: "चिकित्सा",
    time_today: "आज, 12:15 PM",
    time_yesterday: "कल, 4:30 PM",
    time_aug5: "5 अगस्त, 2026",
    time_jul28: "28 जुलाई, 2026",

    // Interactive steps translations
    s2_header: "निष्कर्षण प्रक्रिया",
    s2_status_1: "संरचना का विश्लेषण...",
    s2_status_2: "वाक्यों का विश्लेषण...",
    s2_status_3: "निष्कर्षण पूरा हुआ!",
    s3_header: "NLP नैदानिकी",
    s3_stance: "पक्ष",
    s3_sentiment: "भावना",
    s3_lang: "भाषा",
    s3_complexity: "जटिलता",
    s3_entities: "संस्थाएं",
    s3_scanning: "स्कैनिंग...",
    s3_mapped: "संस्थाएं मैप की गईं।",
    s4_header: "सिम्युलेटेड वेब क्वेरी",
    s5_header: "विश्वसनीयता रेटिंग",
    s5_trust: "विश्वास",
    s6_header: "तथ्य संरेखण",
    s6_claim_side: "कथन दावे",
    s6_fact_side: "साक्ष्य आधार",
    s6_computing: "तुलनात्मक मैट्रिक्स की गणना...",
    s7_header: "सारांश विवरण",
    s7_desc: 'नीचे दिए गए सत्यापन विवरण और संपूर्ण विश्लेषण को रिपोर्ट में अनलॉक करने के लिए "सत्यापित करें और दिखाएं" बटन दबाएं।',

    // Stepper diagnostics values
    v_assertive: "मुखर",
    v_neutral: "तटस्थ",
    v_english: "अंग्रेज़ी",
    v_moderate: "मध्यम",

    // Verdict objects
    res_mars: {
      verdict: 'असत्य',
      type: 'अंतरिक्ष और तकनीक',
      explanation: 'इसरो द्वारा 2025 तक कोई मानव मंगल मिशन संचालित नहीं किया गया है। इसरो का वर्तमान मानव अंतरिक्ष उड़ान कार्यक्रम गगनयान है, जो केवल पृथ्वी की निचली कक्षा तक सीमित है।',
      sources: 'isro.gov.in (आधिकारिक अंतरिक्ष एजेंसी), pib.gov.in (तथ्य जांच), space.com',
      summary: 'आधिकारिक बयान पुष्टि करते हैं कि इसरो का कोई मानव मंगल मिशन निर्धारित नहीं है। वर्तमान ध्यान गगनयान और चंद्र/सौर रोबोटिक प्रोब पर है।',
      insights: 'भावना: तटस्थ\nविषाक्तता: 0%\nरुख: मुखर\nविश्वास स्तर: अत्यधिक उच्च'
    },
    res_flat: {
      verdict: 'असत्य',
      type: 'साजिश का सिद्धांत',
      explanation: 'सैटेलाइट इमेजरी और भौतिकी साबित करते हैं कि पृथ्वी एक गोलाकार आकृति (Oblate Spheroid) है। फ्लैट अर्थ के दावे भौतिकी के बुनियादी नियमों का उल्लंघन करते हैं।',
      sources: 'nasa.gov (अंतरिक्ष एजेंसी), britannica.com (विश्वकोश), physics.org',
      summary: 'सभी वैज्ञानिक और उपग्रह रिकॉर्ड पुष्टि करते हैं कि पृथ्वी गोल है। सपाट डिस्क होने के दावे सदियों पुराने वैज्ञानिक प्रमाणों द्वारा खारिज किए जा चुके हैं।',
      insights: 'भावना: व्यक्तिपरक\nविषाक्तता: 2%\nरुख: हठधर्मी\nसत्यता दर: 0%'
    },
    res_vaccine: {
      verdict: 'असत्य',
      type: 'चिकित्सीय गलत जानकारी',
      explanation: 'टीकों में केवल रोग प्रतिरोधक क्षमता बढ़ाने वाले जैविक सूत्र होते हैं, कोई ट्रैकिंग हार्डवेयर या चिप नहीं होती। सभी सामग्री स्वास्थ्य नियामकों द्वारा स्वीकृत हैं।',
      sources: 'who.int (विश्व स्वास्थ्य संगठन), cdc.gov (रोग नियंत्रण), fda.gov (औषध प्रशासन)',
      summary: 'नियामक विश्लेषण और वैज्ञानिक रिपोर्ट पुष्टि करते हैं कि कोविड-19 टीकों में कोई माइक्रोचिप नहीं है। ऐसे दावे पूरी तरह काल्पनिक हैं।',
      insights: 'भावना: नकारात्मक\nविषाक्तता: 4%\nरुख: भयभीत करने वाला\nसच्चाई दर: 0%'
    },
    res_boil: {
      verdict: 'सत्य',
      type: 'सामान्य विज्ञान',
      explanation: 'यह कथन वैज्ञानिक रूप से सही है। मानक वायुमंडलीय दबाव पर पानी 100 डिग्री सेल्सियस पर उबलता है।',
      sources: 'britannica.com (विश्वकोश), chem.libretexts.org (रसायन विज्ञान पुस्तकालय), nature.com (वैज्ञानिक पत्रिका)',
      summary: 'साक्ष्य इस दावे का पूरी तरह समर्थन करते हैं। यह कथन प्रयोगशाला और दैनिक जीवन में सत्यापित तथ्य है।',
      insights: 'भावना: निष्पक्ष\nविषाक्तता: 0%\nरुख: सूचनात्मक\nसाक्ष्य स्कोर: 95%'
    },
    res_fallback: {
      verdict: 'भ्रामक',
      type: 'सामान्य समाचार',
      explanation: 'कथन में कुछ तथ्य सही हैं लेकिन उन्हें बिना संदर्भ या काल्पनिक अनुमानों के साथ प्रस्तुत किया गया है।',
      sources: 'reuters.com (समाचार ब्यूरो), apnews.com (प्रेस एजेंसी), factcheck.org (ऑडिटर)',
      summary: 'स्वतंत्र समाचार ब्यूरो इस दावे पर मिश्रित रिपोर्ट देते हैं। इसे साझा करने से पहले सावधानी बरतने की सलाह दी जाती है।',
      insights: 'भावना: सट्टा\nविषाक्तता: 1%\nरुख: विचारोत्तेजक\nसत्यापन दर: मध्यम'
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE MANAGEMENT ---
  const state = {
    activeTab: 'text',
    claimText: '',
    uploadedFile: null,
    currentStep: 1,
    isVerifying: false,
    verdictData: null,
    currentLang: 'en'
  };

  // Helper to translate default claim texts dynamically
  function getLocalizedClaimText(rawText, lang) {
    if (!rawText) return "";
    const cleanRaw = rawText.trim().toLowerCase().replace(/\.$/, '').replace(/\"/g, '');
    const t = translations[lang] || translations.en;
    
    const claimKeys = ['claim_h1', 'claim_h2', 'claim_h3', 'claim_h4'];
    const allLanguages = ['en', 'te', 'hi'];

    for (const key of claimKeys) {
      for (const l of allLanguages) {
        const translatedVal = translations[l][key];
        if (translatedVal && translatedVal.trim().toLowerCase().replace(/\.$/, '').replace(/\"/g, '') === cleanRaw) {
          return t[key] || translations.en[key];
        }
      }
    }

    const placeholderKeys = ['no_claim'];
    for (const key of placeholderKeys) {
      for (const l of allLanguages) {
        const translatedVal = translations[l][key];
        if (translatedVal && translatedVal.trim().toLowerCase().replace(/\.$/, '').replace(/\"/g, '') === cleanRaw) {
          return t[key] || translations.en[key];
        }
      }
    }

    return rawText;
  }

  // --- DOM ELEMENTS ---
  const textarea = document.getElementById('claim-text');
  const charCounter = document.getElementById('char-counter');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const fileInputs = document.querySelectorAll('.file-input');
  const uploadLabels = document.querySelectorAll('.upload-btn-label');
  const startBtn = document.getElementById('start-btn');
  const placeholderEl = document.getElementById('dashboard-placeholder');
  const centerContainer = document.querySelector('.center-container');
  const progressSidebar = document.querySelector('.progress-sidebar-card');
  const resultsCard = document.querySelector('.results-card');
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

  // --- DYNAMIC HISTORY DATABASE ---
  const historyData = [
    {
      id: 'h1',
      verdict: 'FALSE',
      verdictClass: 'tag-false',
      confidence: '98%',
      categoryKey: 'cat_space',
      timestampKey: 'time_today',
      claimTextKey: 'claim_h1',
      rawText: 'ISRO successfully sent humans to Mars in 2025.'
    },
    {
      id: 'h2',
      verdict: 'TRUE',
      verdictClass: 'tag-true',
      confidence: '92%',
      categoryKey: 'cat_science',
      timestampKey: 'time_yesterday',
      claimTextKey: 'claim_h2',
      rawText: 'Water boiling point decreases at higher altitudes.'
    },
    {
      id: 'h3',
      verdict: 'MISLEADING',
      verdictClass: 'tag-misleading',
      confidence: '81%',
      categoryKey: 'cat_medicine',
      timestampKey: 'time_aug5',
      claimTextKey: 'claim_h3',
      rawText: 'New COVID variant is resistant to all current immunity options.'
    },
    {
      id: 'h4',
      verdict: 'FALSE',
      verdictClass: 'tag-false',
      confidence: '99%',
      categoryKey: 'cat_science',
      timestampKey: 'time_jul28',
      claimTextKey: 'claim_h4',
      rawText: 'NASA confirmed discovery of alien cities on Jupiter.'
    }
  ];

  function renderHistoryTable(lang) {
    const t = translations[lang] || translations.en;
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    historyData.forEach(item => {
      const claimText = t[item.claimTextKey] || translations.en[item.claimTextKey];
      const categoryText = t[item.categoryKey] || translations.en[item.categoryKey];
      const timestampText = t[item.timestampKey] || translations.en[item.timestampKey];
      
      let verdictLabel = t.v_false;
      if (item.verdict === 'TRUE') verdictLabel = t.v_true;
      if (item.verdict === 'MISLEADING') verdictLabel = t.v_misleading;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="claim-text-col">${claimText}</span></td>
        <td><span class="verdict-badge-history ${item.verdictClass}">${verdictLabel}</span></td>
        <td>${item.confidence}</td>
        <td>${categoryText}</td>
        <td>${timestampText}</td>
        <td><button class="re-verify-btn" data-claim="${item.rawText}">${t.btn_reverify}</button></td>
      `;
      tbody.appendChild(tr);
    });

    // Rebind click listeners to dynamic buttons
    const newReVerifyBtns = tbody.querySelectorAll('.re-verify-btn');
    newReVerifyBtns.forEach(btn => {
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
  }

  // --- INITIALIZATION ---
  updateCharCounter();
  renderHistoryTable(state.currentLang);

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
      const t = translations[state.currentLang] || translations.en;
      
      // Update UI feedback based on tabs
      if (tabType === 'text') {
        textarea.placeholder = t.textarea_placeholder;
        if (state.claimText.startsWith('Extracted text from')) {
          textarea.value = "";
          state.claimText = "";
          updateCharCounter();
        }
      } else if (tabType === 'image') {
        textarea.placeholder = t.currentLang === 'te' ? "చిత్రం నుండి టెక్స్ట్ సేకరించడానికి కింద బటన్ క్లిక్ చేసి అప్‌లోడ్ చేయండి..." : (t.currentLang === 'hi' ? "इमेज से टेक्स्ट निकालने के लिए नीचे अपलोड करें..." : "Upload an image using the buttons below to extract claim text...");
      } else if (tabType === 'pdf') {
        textarea.placeholder = t.currentLang === 'te' ? "PDF నుండి టెక్స్ట్ సేకరించడానికి కింద బటన్ క్లిక్ చేసి అప్‌లోడ్ చేయండి..." : (t.currentLang === 'hi' ? "PDF से टेक्स्ट निकालने के लिए नीचे अपलोड करें..." : "Upload a PDF using the buttons below to extract claim text...");
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
      alert(state.currentLang === 'te' ? "దయచేసి ఒక క్లెయిమ్ నమోదు చేయండి లేదా ఫైల్ అప్‌లోడ్ చేయండి." : (state.currentLang === 'hi' ? "कृपया पहले दावा दर्ज करें या फ़ाइल अपलोड करें।" : "Please enter a claim statement or upload a file first."));
      return;
    }
    
    state.claimText = claim;
    state.isVerifying = true;
    
    // Generate results data based on text content
    generateVerdictData(claim);

    // Reset results widget states to locked
    resetResultsToLocked();

    // Hide steps container, progress sidebar, and results card
    centerContainer.classList.add('dashboard-hidden-on-load');
    centerContainer.classList.remove('fade-in-revealed');
    progressSidebar.classList.add('dashboard-hidden-on-load');
    progressSidebar.classList.remove('fade-in-revealed');
    resultsCard.classList.add('dashboard-hidden-on-load');
    resultsCard.classList.remove('fade-in-revealed');

    // Show placeholder and inject premium loader markup
    placeholderEl.style.display = 'flex';
    placeholderEl.innerHTML = `
      <div class="premium-loader-card">
        <div class="loader-orbit-wrapper">
          <div class="loader-orbit-ring ring-1"></div>
          <div class="loader-orbit-ring ring-2"></div>
          <svg class="loader-center-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
          </svg>
        </div>
        <div class="loader-info">
          <h3 class="loader-status-title" id="loader-status-text">...</h3>
          <div class="loader-progress-bar-container">
            <div class="loader-progress-bar-fill" id="loader-progress-fill"></div>
          </div>
          <div class="loader-percent" id="loader-percent-text">0%</div>
        </div>
      </div>
    `;

    const statusTitleEl = document.getElementById('loader-status-text');
    const progressBarFillEl = document.getElementById('loader-progress-fill');
    const percentTextEl = document.getElementById('loader-percent-text');

    let currentProgress = 0;
    const totalDuration = 2500; // 2.5 seconds
    const intervalTime = 50; 
    const totalSteps = totalDuration / intervalTime;
    const progressIncrement = 100 / totalSteps;

    // Translation arrays for progress statuses
    const statusPhrases = {
      en: [
        "Analyzing text claim structural patterns...",
        "Searching global fact-checking indices...",
        "Crawling trusted media archives...",
        "Evaluating source credibility weights...",
        "Consolidating final verification reports..."
      ],
      te: [
        "క్లెయిమ్ ప్రకటనను విశ్లేషిస్తోంది...",
        "గ్లోబల్ ఫాక్ట్-చెక్ డేటాబేస్ శోధిస్తోంది...",
        "విశ్వసనీయ మీడియా మూలాలను పరిశీలిస్తోంది...",
        "ఆధారాల విశ్వసనీయతను లెక్కిస్తోంది...",
        "తుది నివేదికను సిద్ధం చేస్తోంది..."
      ],
      hi: [
        "दावे के पैटर्न का विश्लेषण...",
        "वैश्विक तथ्य-जांच डेटाबेस में खोजना...",
        "विश्वसनीय समाचार अभिलेखागार खोजना...",
        "स्रोतों की विश्वसनीयता की जांच...",
        "अंतिम रिपोर्ट तैयार की जा रही है..."
      ]
    };

    const activePhrases = statusPhrases[state.currentLang] || statusPhrases.en;

    const progressInterval = setInterval(() => {
      currentProgress += progressIncrement;
      if (currentProgress > 100) currentProgress = 100;

      // Update progress bar & percentage text
      if (progressBarFillEl) progressBarFillEl.style.width = `${currentProgress}%`;
      if (percentTextEl) percentTextEl.textContent = `${Math.floor(currentProgress)}%`;

      // Update status phrases based on percentage
      if (statusTitleEl) {
        if (currentProgress < 20) {
          statusTitleEl.textContent = activePhrases[0];
        } else if (currentProgress < 45) {
          statusTitleEl.textContent = activePhrases[1];
        } else if (currentProgress < 70) {
          statusTitleEl.textContent = activePhrases[2];
        } else if (currentProgress < 90) {
          statusTitleEl.textContent = activePhrases[3];
        } else {
          statusTitleEl.textContent = activePhrases[4];
        }
      }

      if (currentProgress >= 100) {
        clearInterval(progressInterval);

        // Hide placeholder
        placeholderEl.style.display = 'none';

        // Show steps container, sidebar and results card
        centerContainer.classList.remove('dashboard-hidden-on-load');
        centerContainer.classList.add('fade-in-revealed');
        progressSidebar.classList.remove('dashboard-hidden-on-load');
        progressSidebar.classList.add('fade-in-revealed');
        resultsCard.classList.remove('dashboard-hidden-on-load');
        resultsCard.classList.add('fade-in-revealed');

        // Set step to 1 and render
        goToStep(1);
      }
    }, intervalTime);
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
        verdictKey: 'res_mars',
        confidence: 98,
        reliability: 1
      };
    } 
    // Flat earth match
    else if (cleanText.includes('flat') && cleanText.includes('earth')) {
      state.verdictData = {
        verdictKey: 'res_flat',
        confidence: 99,
        reliability: 1
      };
    }
    // COVID vaccine chips match
    else if ((cleanText.includes('vaccine') || cleanText.includes('covid')) && cleanText.includes('chip')) {
      state.verdictData = {
        verdictKey: 'res_vaccine',
        confidence: 96,
        reliability: 1
      };
    }
    // Scientific facts that are True
    else if (cleanText.includes('boil') || cleanText.includes('water') && cleanText.includes('100') || cleanText.includes('round') && cleanText.includes('earth')) {
      state.verdictData = {
        verdictKey: 'res_boil',
        confidence: 95,
        reliability: 5
      };
    }
    // Default fallback (Misleading / Debatable)
    else {
      state.verdictData = {
        verdictKey: 'res_fallback',
        confidence: 74,
        reliability: 2
      };
    }
  }

  // Set initial verdict data on load
  generateVerdictData(state.claimText);

  // --- RESET RESULTS VIEW ---
  function resetResultsToLocked() {
    const t = translations[state.currentLang] || translations.en;
    resultsBanner.style.backgroundColor = 'var(--warning-light)';
    resultsBanner.style.borderColor = 'var(--warning-border)';
    resultsBanner.style.color = '#b45309';
    resultsBanner.querySelector('span').textContent = t.results_banner_default;
    resultsCardTitle.textContent = t.results_title;

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
      subtext.textContent = t.sub_end;
      
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
    const t = translations[state.currentLang] || translations.en;
    const resData = t[d.verdictKey] || translations.en[d.verdictKey];
    
    // Unlock results card title & banner
    resultsCardTitle.textContent = t.results_title_verified;
    resultsBanner.style.backgroundColor = 'var(--success-light)';
    resultsBanner.style.borderColor = 'var(--success-border)';
    resultsBanner.style.color = 'var(--success)';
    resultsBanner.querySelector('span').textContent = t.results_banner_complete;

    // Populate widgets
    resultWidgets.forEach(widget => {
      widget.classList.remove('locked');
      
      // Remove lock icon
      const lockIcon = widget.querySelector('.widget-lock-icon');
      if (lockIcon) lockIcon.style.display = 'none';

      const subtext = widget.querySelector('.result-widget-subtext');
      subtext.textContent = t.sub_verified;
    });

    // 1. Verdict Widget
    const verdictContent = verdictWidget.querySelector('.result-widget-content');
    verdictContent.innerHTML = `<span class="verdict-text">${resData.verdict}</span>`;
    
    // Dynamic verdict styling class mapping
    verdictWidget.className = 'result-widget verdict-widget';
    if (d.verdictKey === 'res_boil') {
      verdictWidget.classList.add('unlocked-true');
    } else if (d.verdictKey === 'res_fallback') {
      verdictWidget.classList.add('unlocked-misleading');
    } else {
      verdictWidget.classList.add('unlocked-false');
    }

    // 2. Confidence Score Widget
    confidenceText.textContent = `${d.confidence}%`;
    const offset = 125.6 * (1 - d.confidence / 100);
    confidenceCircle.style.strokeDashoffset = offset;

    // 3. Claim Type Widget
    typeText.textContent = resData.type;

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
    explanationText.textContent = resData.explanation;

    // 6. Sources
    sourcesText.textContent = resData.sources;

    // 7. Summary
    summaryText.textContent = resData.summary;

    // 8. Insights
    insightsText.innerHTML = resData.insights.replace(/\n/g, '<br>');

    // Smooth Scroll to Results Section
    document.querySelector('.results-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // --- STEP TRANSITIONS / CONTENT BUILDER ---
  function goToStep(stepNum) {
    state.currentStep = stepNum;
    const t = translations[state.currentLang] || translations.en;
    
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
    stepBadgePill.textContent = t.step_pill.replace('{step}', stepNum);
    
    // Configure buttons
    if (stepNum === 1) {
      prevBtn.style.display = 'none';
      nextBtn.innerHTML = `${t.btn_next} <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>`;
    } else {
      prevBtn.style.display = 'flex';
      prevBtn.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg> ${t.btn_back}`;
      if (stepNum === 7) {
        nextBtn.innerHTML = `${t.btn_verify_reveal} <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`;
      } else {
        nextBtn.innerHTML = `${t.btn_next} <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
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
    const t = translations[state.currentLang] || translations.en;
    const claimTextVal = getLocalizedClaimText(state.claimText || t.no_claim, state.currentLang);
    
    switch (stepNum) {
      case 1:
        return {
          title: t.step1_title,
          summaryText: t.steps_banner,
          desc: t.step1_desc,
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
              <h4>${t.your_claim}</h4>
              <p>${claimTextVal}</p>
            </div>`
        };

      case 2:
        return {
          title: t.step2_title,
          summaryText: t.activeTab === 'text' ? (t.currentLang === 'te' ? 'టెక్స్ట్ ఆకృతి ధృవీకరించబడుతోంది.' : (t.currentLang === 'hi' ? 'पाठ पैटर्न सत्यापित किया जा रहा है।' : 'Validating textual patterns.')) : (t.currentLang === 'te' ? 'ఫైల్ నుండి టెక్స్ట్‌ని OCR సహాయంతో సంగ్రహిస్తోంది.' : (t.currentLang === 'hi' ? 'फ़ाइल से पाठ निकाल रहा है।' : 'Extracting key textual claims and structural statements.')),
          desc: t.step2_desc,
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
              <h4 style="color: var(--success);">${t.s2_header}</h4>
              <div id="ocr-status" style="font-size: 0.85rem; color: #065f46; font-weight: 500; margin-bottom: 6px;">${t.currentLang === 'te' ? 'ప్రక్రియ ప్రారంభమవుతోంది...' : (t.currentLang === 'hi' ? 'निष्कर्षण शुरू हो रहा है...' : 'Initializing extraction...')}</div>
              <div class="ocr-text-preview" id="ocr-preview">Processing...</div>
            </div>`
        };

      case 3:
        return {
          title: t.step3_title,
          summaryText: t.currentLang === 'te' ? 'సిమాంటిక్ వ్యాకరణం మరియు ఎంటిటీలను విశ్లేషిస్తోంది.' : (t.currentLang === 'hi' ? 'सिमेंटिक सिंटैक्स और इकाई मैपिंग का विश्लेषण।' : 'Analyzing semantic syntax, claim stance, and entity mapping.'),
          desc: t.step3_desc,
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
              <h4 style="color: #7c3aed;">${t.s3_header}</h4>
              <div id="nlp-diagnostics" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem; color: #4c1d95;">
                <div>${t.s3_stance}: <span style="font-weight: 700;">${t.v_assertive}</span></div>
                <div>${t.s3_sentiment}: <span style="font-weight: 700;">${t.v_neutral}</span></div>
                <div>${t.s3_lang}: <span style="font-weight: 700;">${t.v_english}</span></div>
                <div>${t.s3_complexity}: <span style="font-weight: 700;">${t.v_moderate}</span></div>
              </div>
              <div style="font-size: 0.75rem; border-top: 1px solid #ddd6fe; padding-top: 6px; margin-top: 6px; color: #6d28d9;">
                ${t.s3_entities}: <span style="font-weight: 600; font-family: monospace;" id="nlp-entities">${t.s3_scanning}</span>
              </div>
            </div>`
        };

      case 4:
        return {
          title: t.step4_title,
          summaryText: t.currentLang === 'te' ? 'వివిధ వెబ్ క్రాలర్లు మరియు రిజిస్ట్రీలలో శోధిస్తోంది.' : (t.currentLang === 'hi' ? 'खोज क्वेरी बनाना और तथ्य-जांच प्रणालियों में खोजना।' : 'Generating query keywords and searching fact-checking APIs.'),
          desc: t.step4_desc,
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
              <h4 style="color: #ea580c;">${t.s4_header}</h4>
              <div class="queries-box" id="queries-container">
                <!-- Loaded via simulation script -->
              </div>
            </div>`
        };

      case 5:
        return {
          title: t.step5_title,
          summaryText: t.currentLang === 'te' ? 'లభించిన ఆధారాల విశ్వసనీయత అంచనా వేస్తోంది.' : (t.currentLang === 'hi' ? 'स्रोतों की विश्वसनीयता और उनके अधिकार भार का मूल्यांकन।' : 'Evaluating credibility and authority weights of sources.'),
          desc: t.step5_desc,
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
              <h4 style="color: #db2777;">${t.s5_header}</h4>
              <div class="sources-list" id="sources-list-container">
                <!-- Sources items updated by simulations -->
              </div>
            </div>`
        };

      case 6:
        return {
          title: t.step6_title,
          summaryText: t.currentLang === 'te' ? 'క్లెయిమ్ మరియు సాక్ష్యాల పోలిక నివేదిక.' : (t.currentLang === 'hi' ? 'तथ्यों के रिकॉर्ड के खिलाफ दावे की जांच।' : 'Checking claims assertions against evidence records.'),
          desc: t.step6_desc,
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
              <h4 style="color: #047857;">${t.s6_header}</h4>
              <div class="comparison-grid" id="comparison-container">
                <!-- Dynamic comparison sides -->
              </div>
            </div>`
        };

      case 7:
        return {
          title: t.step7_title,
          summaryText: t.currentLang === 'te' ? 'ధృవీకరణ విశ్లేషణలు పూర్తయ్యాయి. నివేదికను అన్‌లాక్ చేయండి.' : (t.currentLang === 'hi' ? 'दावे के निष्कर्ष, विश्वसनीयता और व्याख्या मापदंडों का एकत्रीकरण।' : 'Consolidating verdicts, reliability index, and explanation parameters.'),
          desc: t.step7_desc,
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
              <h4 style="color: var(--primary);">${t.s7_header}</h4>
              <p style="font-size: 0.85rem; color: #1e40af; font-weight: 500;">
                ${t.s7_desc}
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
      const t = translations[state.currentLang] || translations.en;
      
      // Step 2 OCR Scanner animation loop simulation
      setTimeout(() => {
        if (statusText) statusText.textContent = t.s2_status_1;
        
        setTimeout(() => {
          if (statusText) statusText.textContent = t.s2_status_2;
          
          setTimeout(() => {
            if (statusText) {
              statusText.textContent = t.s2_status_3;
              statusText.style.color = '#047857';
            }
            if (previewText) {
              const displayVal = getLocalizedClaimText(state.claimText || t.no_claim, state.currentLang);
              previewText.innerHTML = `<span style="color:#047857; font-weight:600;">"${displayVal}"</span>`;
            }
          }, 1200);
        }, 1200);
      }, 600);
    }
    
    else if (stepNum === 3) {
      const entitiesSpan = document.getElementById('nlp-entities');
      const t = translations[state.currentLang] || translations.en;
      setTimeout(() => {
        if (state.claimText.toLowerCase().includes('isro')) {
          entitiesSpan.textContent = "ISRO [ORG], Mars [LOC], 2025 [DATE]";
        } else if (state.claimText.toLowerCase().includes('earth')) {
          entitiesSpan.textContent = "Earth [LOC], Flat [ATTRIB]";
        } else if (state.claimText.toLowerCase().includes('vaccine') || state.claimText.toLowerCase().includes('covid')) {
          entitiesSpan.textContent = "COVID-19 [VIRUS], Vaccines [MED], Microchip [TECH]";
        } else {
          entitiesSpan.textContent = t.s3_mapped;
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
          if (queriesContainer) queriesContainer.appendChild(tag);

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
      const t = translations[state.currentLang] || translations.en;

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

      if (sourcesContainer) sourcesContainer.innerHTML = t.currentLang === 'te' ? 'డేటాబేస్ రేటింగ్‌లను విశ్లేషిస్తోంది...' : (t.currentLang === 'hi' ? 'डेटाबेस रेटिंग का विश्लेषण...' : 'Analyzing database reputability...');
      
      setTimeout(() => {
        if (sourcesContainer) {
          sourcesContainer.innerHTML = '';
          sources.forEach((src, idx) => {
            setTimeout(() => {
              const item = document.createElement('div');
              item.className = 'source-item';
              item.innerHTML = `
                <span class="source-name">${src.name}</span>
                <span class="source-trust ${src.class}">${src.score}% ${t.s5_trust}</span>`;
              sourcesContainer.appendChild(item);
            }, idx * 250);
          });
        }
      }, 500);
    }
    
    else if (stepNum === 6) {
      const comparisonContainer = document.getElementById('comparison-container');
      const cleanText = state.claimText.toLowerCase();
      const t = translations[state.currentLang] || translations.en;
      const resData = t[d.verdictKey] || translations.en[d.verdictKey];
      
      let claimSummary = "";
      let factSummary = "";

      if (cleanText.includes('isro')) {
        claimSummary = t.claim_h1 || "ISRO landed astronauts on Mars in 2025.";
        factSummary = resData.summary;
      } else if (cleanText.includes('earth')) {
        claimSummary = t.currentLang === 'te' ? "భూమి నిశ్చలంగా, సమతలంగా మరియు వృత్తాకారంగా ఉంది." : (t.currentLang === 'hi' ? "पृथ्वी स्थिर, सपाट और गोलाकार है।" : "The Earth is static, flat, and circular.");
        factSummary = resData.summary;
      } else if (cleanText.includes('vaccine')) {
        claimSummary = t.currentLang === 'te' ? "కోవిడ్ వ్యాక్సిన్లలో మైక్రోచిప్స్ ఉన్నాయి." : (t.currentLang === 'hi' ? "कोविड टीकों में माइक्रोचिप हैं।" : "COVID vaccines contain hardware microchips.");
        factSummary = resData.summary;
      } else if (cleanText.includes('boil') || cleanText.includes('water')) {
        claimSummary = t.claim_h2 || "Water boils at 100 degrees Celsius.";
        factSummary = resData.summary;
      } else {
        claimSummary = state.claimText.substring(0, 45) + "...";
        factSummary = resData.summary;
      }

      if (comparisonContainer) comparisonContainer.innerHTML = t.s6_computing;
      
      setTimeout(() => {
        if (comparisonContainer) {
          comparisonContainer.innerHTML = `
            <div class="comparison-box claim-side">
              <h5>${t.s6_claim_side}</h5>
              <p>${claimSummary}</p>
            </div>
            <div class="comparison-box fact-side">
              <h5>${t.s6_fact_side}</h5>
              <p>${factSummary}</p>
            </div>
          `;
        }
      }, 600);
    }
  }

  // --- TRANSLATION TRANSLATOR ENGINE ---
  function applyTranslations(lang) {
    state.currentLang = lang;
    const t = translations[lang] || translations.en;

    // Header
    const logoTitle = document.querySelector('.logo-text h1');
    if (logoTitle) logoTitle.innerHTML = t.logo_title;

    const navHome = document.getElementById('nav-home');
    if (navHome) {
      navHome.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg> ` + t.nav_home;
    }
    const navHistory = document.getElementById('nav-history');
    if (navHistory) {
      navHistory.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg> ` + t.nav_history;
    }
    const navHow = document.getElementById('nav-how');
    if (navHow) {
      navHow.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg> ` + t.nav_how;
    }
    const navAbout = document.getElementById('nav-about');
    if (navAbout) {
      navAbout.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg> ` + t.nav_about;
    }

    // Input Claim Card (Sidebar)
    const inputTitle = document.querySelector('.input-claim-card h2');
    if (inputTitle) inputTitle.textContent = t.input_title;
    const inputSub = document.querySelector('.input-claim-card .sidebar-title-group p');
    if (inputSub) inputSub.textContent = t.input_sub;

    const tabTxt = document.querySelector('.tab-btn[data-tab="text"]');
    if (tabTxt) tabTxt.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg> ` + t.tab_text;
    const tabImg = document.querySelector('.tab-btn[data-tab="image"]');
    if (tabImg) tabImg.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> ` + t.tab_image;
    const tabPdf = document.querySelector('.tab-btn[data-tab="pdf"]');
    if (tabPdf) tabPdf.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> ` + t.tab_pdf;

    if (textarea) {
      textarea.placeholder = t.textarea_placeholder;
      if (textarea.value) {
        const localizedVal = getLocalizedClaimText(textarea.value, lang);
        if (localizedVal !== textarea.value) {
          textarea.value = localizedVal;
          state.claimText = localizedVal;
          updateCharCounter();
        }
      }
    }

    const uploadTitle = document.querySelector('.file-upload-section h3');
    if (uploadTitle) uploadTitle.textContent = t.upload_title;

    const uploadImgLbl = document.querySelector('label[for="image-upload"] span');
    if (uploadImgLbl) uploadImgLbl.textContent = t.upload_img;
    const uploadPdfLbl = document.querySelector('label[for="pdf-upload"] span');
    if (uploadPdfLbl) uploadPdfLbl.textContent = t.upload_pdf;

    const uploadSubtext = document.querySelector('.upload-info-text');
    if (uploadSubtext) uploadSubtext.textContent = t.upload_sub;

    const tipsHeader = document.querySelector('.tips-header');
    if (tipsHeader) tipsHeader.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg> ` + t.tips_title;

    const tipsItems = document.querySelectorAll('.tips-box li');
    if (tipsItems.length >= 2) {
      tipsItems[0].textContent = t.tips_1;
      tipsItems[1].textContent = t.tips_2;
    }

    const verifyBtnText = document.querySelector('.start-btn');
    if (verifyBtnText) {
      verifyBtnText.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg> ` + t.btn_verify;
    }

    // Main Steps bar Labels & Sidebar Checklist (1-7)
    for (let i = 1; i <= 7; i++) {
      const stepNodeLabel = document.querySelector(`.step-node[data-step="${i}"] .step-label`);
      if (stepNodeLabel) stepNodeLabel.textContent = t[`step${i}_title`];
      
      const sidebarItemText = document.querySelector(`.checklist-item[data-sidebar-step="${i}"] .checklist-text`);
      if (sidebarItemText) sidebarItemText.textContent = t[`step${i}_title`];
    }

    // Results panel title & alert banner
    if (resultsCardTitle) {
      resultsCardTitle.textContent = state.isVerifying && state.currentStep === 7 ? t.results_title_verified : t.results_title;
    }

    const resultsBannerText = document.querySelector('#results-banner span');
    if (resultsBannerText) {
      resultsBannerText.textContent = state.isVerifying && state.currentStep === 7 ? t.results_banner_complete : t.results_banner_default;
    }

    // Results widget titles
    const widgetsConfigs = [
      { id: 'widget-verdict', title: t.w_verdict },
      { id: 'widget-confidence', title: t.w_confidence },
      { id: 'widget-type', title: t.w_type },
      { id: 'widget-reliability', title: t.w_reliability },
      { id: 'widget-explanation', title: t.w_explanation },
      { id: 'widget-sources', title: t.w_sources },
      { id: 'widget-summary', title: t.w_summary },
      { id: 'widget-insights', title: t.w_insights }
    ];

    widgetsConfigs.forEach(cfg => {
      const widget = document.getElementById(cfg.id);
      if (widget) {
        const titleEl = widget.querySelector('.result-widget-title');
        if (titleEl) titleEl.textContent = cfg.title;
        
        const subtextEl = widget.querySelector('.result-widget-subtext');
        if (subtextEl) {
          subtextEl.textContent = widget.classList.contains('locked') ? t.sub_end : t.sub_verified;
        }
      }
    });

    // Refresh history logs table in the new language
    renderHistoryTable(lang);

    // Sub-views static contents
    // 1. History view headers
    const historyHeaderH2 = document.querySelector('#history-view .view-header h2');
    if (historyHeaderH2) historyHeaderH2.textContent = t.view_history_title;
    const historyHeaderP = document.querySelector('#history-view .view-header p');
    if (historyHeaderP) historyHeaderP.textContent = t.view_history_sub;

    const historyTableThs = document.querySelectorAll('#history-view th');
    if (historyTableThs.length >= 6) {
      historyTableThs[0].textContent = t.th_claim;
      historyTableThs[1].textContent = t.th_verdict;
      historyTableThs[2].textContent = t.th_confidence;
      historyTableThs[3].textContent = t.th_category;
      historyTableThs[4].textContent = t.th_timestamp;
      historyTableThs[5].textContent = t.th_actions;
    }

    // 2. How it Works
    const howHeaderH2 = document.querySelector('#how-view .view-header h2');
    if (howHeaderH2) howHeaderH2.textContent = t.view_how_title;
    const howHeaderP = document.querySelector('#how-view .view-header p');
    if (howHeaderP) howHeaderP.textContent = t.view_how_sub;

    const howStepCards = document.querySelectorAll('.how-step-card');
    howStepCards.forEach((card, idx) => {
      const stepIdx = idx + 1;
      const h3 = card.querySelector('h3');
      if (h3) h3.textContent = t[`step${stepIdx}_title`];
      const p = card.querySelector('p');
      if (p) p.textContent = t[`step${stepIdx}_desc`];
    });

    // 3. About Us
    const aboutHeaderH2 = document.querySelector('#about-view .view-header h2');
    if (aboutHeaderH2) aboutHeaderH2.textContent = t.view_about_title;
    const aboutHeaderP = document.querySelector('#about-view .view-header p');
    if (aboutHeaderP) aboutHeaderP.textContent = t.view_about_sub;

    const aboutH3s = document.querySelectorAll('.about-main-text h3');
    if (aboutH3s.length >= 2) {
      aboutH3s[0].textContent = t.about_mission_h3;
      aboutH3s[1].textContent = t.about_tech_h3;
    }
    const aboutPs = document.querySelectorAll('.about-main-text p');
    if (aboutPs.length >= 2) {
      aboutPs[0].textContent = t.about_mission_p;
      aboutPs[1].textContent = t.about_tech_p;
    }

    const principleItems = document.querySelectorAll('.principle-item');
    if (principleItems.length >= 3) {
      principleItems[0].querySelector('h4').textContent = t.p_obj_h4;
      principleItems[0].querySelector('p').textContent = t.p_obj_p;
      
      principleItems[1].querySelector('h4').textContent = t.p_trans_h4;
      principleItems[1].querySelector('p').textContent = t.p_trans_p;
      
      principleItems[2].querySelector('h4').textContent = t.p_speed_h4;
      principleItems[2].querySelector('p').textContent = t.p_speed_p;
    }

    // Refresh active results card if unlocked
    const firstWidget = document.getElementById('widget-verdict');
    if (firstWidget && !firstWidget.classList.contains('locked') && state.verdictData) {
      revealFinalVerdict();
    }

    // Refresh active step and navigation buttons in the new language
    goToStep(state.currentStep);
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
        const langCode = opt.getAttribute('data-lang');
        const langName = opt.textContent.split(' ')[0]; // E.g., "English" or "తెలుగు"
        currentLangSpan.textContent = langName;
        
        langOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        
        // Apply translations!
        applyTranslations(langCode);
        
        // Hide dropdown
        langContainer.classList.remove('open');
      });
    });
  }

});
