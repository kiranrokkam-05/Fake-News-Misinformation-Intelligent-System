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
    p_speed_p: "Multi-threaded NLP pipelines scan, evaluate, and formulate results within seconds of query trigger."
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
    tips_2: "మా సిస్టమ్ నమ్మదగిన మూలాలను శోధిస్తుంది మరియు వివరణాत्मक తీర్పును ఇస్తుంది.",
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
    w_sources: "టాప్ ఆధారాలు",
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
    about_tech_p: "ఈ వ్యవస్థ నిజసమయ వెబ్ క్రాలర్లు, సిమాంటిక్ పోలిక సూచికలు మరియు క్యూరేటెడ్ సోర్స్ డేటాబేస్ ద్వారా పనిచేస్తుంది. ఇది కేవలం నిజం/అబద్ధం అని మాత్రమే కాకుండా స్పష్టమైన వివరణాత్మక నివేదికను ఇస్తుంది.",
    p_obj_h4: "నిష్పాక్షికత",
    p_obj_p: "విశ్వసనీయమైన మూలాల ఆధారంగా మాత్రమే వాస్తవాలను నిర్ణయిస్తాము, పక్షపాతాలకు తావులేదు.",
    p_trans_h4: "పారదర్శకత",
    p_trans_p: "వినియోగదారుల నమ్మకం కోసం సాక్ష్యాలు, మూలాలు మరియు వాటి రేటింగ్‌లు అన్నీ స్పష్టంగా చూపిస్తాము.",
    p_speed_h4: "వేగం & ఖచ్చితత్వం",
    p_speed_p: "NLP సాంకేతికత ద్వారా సెకన్లలో సమాచారాన్ని స్కాన్ చేసి ఫలితాలను అందిస్తాము."
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
    step2_desc: "हमारी प्रणाली फ़ाइल संरचना को स्कैन करती है और आवश्यकतानुसार OCR पाठ निष्कर्षण करती है।",
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
    results_banner_default: "कृपया सभी 7 चरणों को पूरा करें। अंतिम विश्लेषण और निर्णय अंत मेंं प्रदर्शित किया जाएगा।",
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
    p_speed_p: "NLP तकनीक के माध्यम से कुछ ही सेकंड में दावों को स्कैन और सत्यापित किया जाता है।"
  },
  kn: {
    logo_title: "ನಕಲಿ ಸುದ್ದಿ ಪತ್ತೆ <span>&</span><br>ಹಕ್ಕು ಪರಿಶೀಲನಾ ವ್ಯವಸ್ಥೆ",
    nav_home: "ಹೋಮ್",
    nav_history: "ಇತಿಹಾಸ",
    nav_how: "ಕೆಲಸದ ವಿಧಾನ",
    nav_about: "ನಮ್ಮ ಬಗ್ಗೆ",
    input_title: "1. ನಿಮ್ಮ ಹಕ್ಕನ್ನು ನಮೂದಿಸಿ",
    input_sub: "ಪಠ್ಯವನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಚಿತ್ರ / PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    tab_text: "ಪಠ್ಯ",
    tab_image: "ಚಿತ್ರ",
    tab_pdf: "PDF",
    textarea_placeholder: "ನಿಮ್ಮ ಹಕ್ಕನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
    upload_title: "ಅಥವಾ ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    upload_img: "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    upload_pdf: "PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    upload_sub: "JPG, PNG, PDF ಬೆಂಬಲಿಸುತ್ತದೆ (ಗರಿಷ್ಠ 10MB)",
    tips_title: "ಸಲಹೆಗಳು",
    tips_1: "ಉತ್ತಮ ಫಲಿತಾಂಶಗಳಿಗಾಗಿ ನಿರ್ದಿಷ್ಟ ಹಕ್ಕುಗಳನ್ನು ನಮೂದಿಸಿ.",
    tips_2: "ನಮ್ಮ ವ್ಯವಸ್ಥೆಯು ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳನ್ನು ಹುಡುಕುತ್ತದೆ ಮತ್ತು ವಿವರಣಾತ್ಮಕ ತೀರ್ಪು ನೀಡುತ್ತದೆ.",
    btn_verify: "ಪರಿಶೀಲನೆ ಪ್ರಾರಂಭಿಸಿ",
    steps_banner: 'ನಾವು ನಿಮ್ಮ ಹಕ್ಕನ್ನು 7 ಸರಳ ಹಂತಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸುತ್ತೇವೆ. ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂದು ನೋಡಲು "ನೆಕ್ಸ್ಟ್" ಕ್ಲಿಕ್ ಮಾಡಿ.',
    step1_title: "ಹಕ್ಕು ನಮೂದಿಸಿ",
    step2_title: "ಪಠ್ಯ ಹೊರತೆಗೆಯುವಿಕೆ",
    step3_title: "NLP ವಿಶ್ಲೇಷಣೆ",
    step4_title: "ಸಾಕ್ಷ್ಯ ಹುಡುಕಾಟ",
    step5_title: "ಮೂಲಗಳ ಪರಿಶೀಲನೆ",
    step6_title: "ಹೋಲಿಕೆ ಮತ್ತು ಮೌಲ್ಯಮಾಪನ",
    step7_title: "ಅಂತಿಮ ತೀರ್ಪು",
    step1_desc: "ನಿಮ್ಮ ಹಕ್ಕನ್ನು ನಾವು ಸ್ವೀಕರಿಸಿದ್ದೇವೆ. ಮುಂದುವರೆಯಲು \"ನೆಕ್ಸ್ಟ್\" ಕ್ಲಿಕ್ ಮಾಡಿ.",
    step2_desc: "ನಮ್ಮ ವ್ಯವಸ್ಥೆಯು ಫೈಲ್ ಸ್ಕ್ಯಾನ್ ಮಾಡುತ್ತದೆ ಮತ್ತು ಅಗತ್ಯವಿದ್ದರೆ OCR ಮೂಲಕ ಪಠ್ಯವನ್ನು ಹೊರತೆಗೆಯುತ್ತದೆ.",
    step3_desc: "Natural Language Processing ಮೂಲಕ ಹಕ್ಕಿನ ಸರಿ ತಪ್ಪು ಮತ್ತು ಭಾವನೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ.",
    step4_desc: "ನಾವು ಜಾಗತಿಕ ಸುದ್ದಿ ದತ್ತಸಂಚಯಗಳು ಮತ್ತು ಪರಿಶೀಲನಾ ರಿಜಿಸ್ಟ್ರಿಗಳಲ್ಲಿ ಸಾಕ್ಷ್ಯಗಳನ್ನು ಹುಡುಕುತ್ತೇವೆ.",
    step5_desc: "ಲಭ್ಯವಿರುವ ಮೂಲಗಳ ವಿಶ್ವಾಸಾರ್ಹತೆಯ ತೂಕವನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.",
    step6_desc: "ಸತ್ಯಾಸತ್ಯತೆಯನ್ನು ತಿಳಿಯಲು ಹಕ್ಕನ್ನು ಸಾಕ್ಷ್ಯಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ ನೋಡಲಾಗುತ್ತದೆ.",
    step7_desc: "ಎಲ್ಲಾ ವಿಶ್ಲೇಷಣೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ. ಅಂತಿಮ ವರದಿಗಳು ಕೆಳಗೆ ಸಿದ್ಧವಾಗಿವೆ.",
    step_pill: "ಹಂತ {step}/7",
    your_claim: "ನಿಮ್ಮ ಹಕ್ಕು",
    btn_back: "ಹಿಂದಕ್ಕೆ",
    btn_next: "ನೆಕ್ಸ್ಟ್",
    btn_verify_reveal: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ತೋರಿಸಿ",
    results_title: "ಅಂತಿಮ ಫಲಿತಾಂಶ (ಹಂತ 7 ರ ನಂತರ ಲಭ್ಯವಿರುತ್ತದೆ)",
    results_title_verified: "ಅಂತಿಮ ಫಲಿತಾಂಶ (ಪರಿಶೀಲಿಸಲಾಗಿದೆ)",
    results_banner_default: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ 7 ಹಂತಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ. ಅಂತಿಮ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ತೀರ್ಪು ಕೊನೆಯಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತದೆ.",
    results_banner_complete: "ಪರಿಶೀಲನೆ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ಹಕ್ಕು ಮೌಲ್ಯಮಾಪನ ವರದಿ ಅನ್‌ಲಾಕ್ ಆಗಿದೆ.",
    w_verdict: "ತೀರ್ಪು",
    w_confidence: "ನಂಬಿಕೆ ಶೇಕಡಾ",
    w_type: "ಹಕ್ಕಿನ ಪ್ರಕಾರ",
    w_reliability: "ಒಟ್ಟಾರೆ ವಿಶ್ವಾಸಾರ್ಹತೆ",
    w_explanation: "ವಿವರಣೆ (ಯಾಕೆ?)",
    w_sources: "ಉನ್ನತ ಮೂಲಗಳು",
    w_summary: "ಸಾಕ್ಷ್ಯ ಸಾರಾಂಶ",
    w_insights: "NLP ಒಳನೋಟಗಳು",
    sub_end: "ಕೊನೆಯಲ್ಲಿ ತೋರಿಸಲಾಗುತ್ತದೆ",
    sub_verified: "ಪರಿಶೀಲಿಸಿದ ಫಲಿತಾಂಶ",
    no_claim: "ಯಾವುದೇ ಹಕ್ಕನ್ನು ಇನ್ನೂ ನಮೂದಿಸಿಲ್ಲ. ಪ್ರಾರಂಭಿಸಲು ಮೇಲೆ ಟೈಪ್ ಮಾಡಿ.",
    view_history_title: "ಹಕ್ಕು ಪರಿಶೀಲನಾ ಇತಿಹಾಸ",
    view_history_sub: "ಈ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾದ ಹಿಂದಿನ ಹಕ್ಕುಗಳ ಇತಿಹಾಸ.",
    th_claim: "ಹಕ್ಕಿನ ಹೇಳಿಕೆ",
    th_verdict: "ತೀರ್ಪು",
    th_confidence: "ನಂಬಿಕೆ",
    th_category: "ವರ್ಗ",
    th_timestamp: "ಸಮಯ",
    th_actions: "ಕ್ರಮಗಳು",
    btn_reverify: "ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ",
    view_how_title: "ಕೆಲಸ ಮಾಡುವ ವಿಧಾನ",
    view_how_sub: "ಸ್ವಯಂಚಾಲಿತ 7-ಹಂತದ ಹಕ್ಕು ಪರಿಶೀಲನಾ ವ್ಯವಸ್ಥೆಯ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",
    view_about_title: "ನಮ್ಮ ಬಗ್ಗೆ",
    view_about_sub: "ನಕಲಿ ಸುದ್ದಿ ಪತ್ತೆ ಮತ್ತು ಹಕ್ಕು ಪರಿಶೀಲನಾ ವ್ಯವಸ್ಥೆ.",
    about_mission_h3: "ನಮ್ಮ ಉದ್ದೇಶ",
    about_mission_p: "ತಪ್ಪು ಮಾಹಿತಿ ಸಮಾಜವನ್ನು ದಾರಿ ತಪ್ಪಿಸುತ್ತದೆ. ಅಧಿಕೃತ ಮೂಲಗಳ ಮೂಲಕ ಹಕ್ಕುಗಳನ್ನು ಹೋಲಿಸಿ ಪರಿಶೀಲಿಸುವ ಮತ್ತು ಪಾರ್ದರ್ಶಕ ಫಲಿತಾಂಶ ನೀಡುವ ವ್ಯವಸ್ಥೆಯನ್ನು ಅಭಿವೃದ್ಧಿಪಡಿಸುವುದು ನಮ್ಮ ಉದ್ದೇಶ.",
    about_tech_h3: "ಬಳಸಲಾದ ತಂತ್ರಜ್ಞಾನ",
    about_tech_p: "ಈ ವ್ಯವಸ್ಥೆಯು ನೈಜ ಸಮಯದ ವೆಬ್ ಕ್ರಾಲರ್‌ಗಳು, ಸಿಮ್ಯಾಂಟಿಕ್ ಹೋಲಿಕೆ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳ ಡೇಟಾಬೇಸ್ ಮೂಲಕ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ಇದು ಕೇವಲ ಸರಿ/ತಪ್ಪು ಎನ್ನುವುದಕ್ಕಿಂತ ವಿವರವಾದ ವರದಿ ನೀಡುತ್ತದೆ.",
    p_obj_h4: "ನಿಷ್ಪಕ್ಷಪಾತ",
    p_obj_p: "ಅಧಿಕೃತ ಮೂಲಗಳ ಸಾಕ್ಷ್ಯಗಳ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ಸತ್ಯಾಸತ್ಯತೆಯನ್ನು ನಿರ್ಧರಿಸಲಾಗುತ್ತದೆ.",
    p_trans_h4: "ಪಾರದರ್ಶಕತೆ",
    p_trans_p: "ಬಳಕೆದಾರರ ನಂಬಿಕೆಗಾಗಿ ಎಲ್ಲಾ ಸಾಕ್ಷ್ಯಗಳು, ಮೂಲಗಳು ಮತ್ತು ಅವುಗಳ ವಿಶ್ವಾಸಾರ್ಹತೆಯ ರೇಟಿಂಗ್‌ಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತದೆ.",
    p_speed_h4: "ವೇಗ ಮತ್ತು ನಿಖರತೆ",
    p_speed_p: "NLP ತಂತ್ರಜ್ಞಾನದ ಸಹಾಯದಿಂದ ಕೆಲವೇ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಮಾಹಿತಿಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಫಲಿತಾಂಶ ನೀಡಲಾಗುತ್ತದೆ."
  },
  ml: {
    logo_title: "വ്യാജ വാർത്ത കണ്ടെത്തൽ <span>&</span><br>അവകാശ പരിശോധന സംവിധാനം",
    nav_home: "ഹോം",
    nav_history: "ചരിത്രം",
    nav_how: "പ്രവർത്തനം",
    nav_about: "ഞങ്ങളെക്കുറിച്ച്",
    input_title: "1. നിങ്ങളുടെ അവകാശവാദം നൽകുക",
    input_sub: "ടെക്സ്റ്റ് ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ ഇമേജ് / PDF അപ്‌ലോഡ് ചെയ്യുക",
    tab_text: "ടെക്സ്റ്റ്",
    tab_image: "ഇമേജ്",
    tab_pdf: "PDF",
    textarea_placeholder: "നിങ്ങളുടെ അവകാശവാദം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    upload_title: "അല്ലെങ്കിൽ ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുക",
    upload_img: "ഇമേജ് അപ്‌ലോഡ് ചെയ്യുക",
    upload_pdf: "PDF അപ്‌ലോഡ് ചെയ്യുക",
    upload_sub: "JPG, PNG, PDF പിന്തുണയ്ക്കുന്നു (പരമാവധി 10MB)",
    tips_title: "നുറുങ്ങുകൾ",
    tips_1: "മികച്ച ഫലങ്ങൾക്കായി കൃത്യമായ അവകാശവാദങ്ങൾ നൽകുക.",
    tips_2: "ഞങ്ങളുടെ സിസ്റ്റം വിശ്വസനീയമായ ഉറവിടങ്ങൾ തിരയുകയും വിശദമായ വിധി നൽകുകയും ചെയ്യുന്നു.",
    btn_verify: "പരിശോധന ആരംഭിക്കുക",
    steps_banner: 'ഞങ്ങൾ 7 ലളിതമായ ഘട്ടങ്ങളിലൂടെ നിങ്ങളുടെ അവകാശവാദം പരിശോധിക്കുന്നു. ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നുവെന്ന് കാണാൻ "നെക്സ്റ്റ്" ക്ലിക്ക് ചെയ്യുക.',
    step1_title: "അവകാശവാദം നൽകുക",
    step2_title: "ടെക്സ്റ്റ് എക്സ്ട്രാക്ഷൻ",
    step3_title: "NLP വിശകലനം",
    step4_title: "തെളിവ് തിരച്ചിൽ",
    step5_title: "ഉറവിടങ്ങളുടെ പരിശോധന",
    step6_title: "താരതമ്യവും വിലയിരുത്തലും",
    step7_title: "അന്തിമ വിധി",
    step1_desc: "നിങ്ങളുടെ അവകാശവാദം ഞങ്ങൾക്ക് ലഭിച്ചു. തുടരുന്നതിന് \"നെക്സ്റ്റ്\" ക്ലിക്ക് ചെയ്യുക.",
    step2_desc: "ഞങ്ങളുടെ സിസ്റ്റം ഫയൽ ഘടന സ്കാൻ ചെയ്യുകയും ആവശ്യമെങ്കിൽ OCR വഴി ടെക്സ്റ്റ് വേർതിരിക്കുകയും ചെയ്യുന്നു.",
    step3_desc: "Natural Language Processing വഴി അവകാശവാദത്തിന്റെ ശൈലിയും വികാരവും വിലയിരുത്തപ്പെടുന്നു.",
    step4_desc: "ഞങ്ങൾ ആഗോള വാർത്താ സൂചികകളിലും ഔദ്യോഗിക റെക്കോർഡുകളിലും തെളിവുകൾ തിരയുന്നു.",
    step5_desc: "ലഭ്യമായ ഉറവിടങ്ങളുടെ വിശ്വാസ്യതയും യോഗ്യതയും സിസ്റ്റം വിലയിరుത്തുന്നു.",
    step6_desc: "സത്യാവസ്ഥ പരിശോധിക്കാൻ അവകാശവാദങ്ങളെ തെളിവുകളുമായി താരതമ്യം ചെയ്യുന്നു.",
    step7_desc: "എല്ലാ പരിശോധനകളും വിജയകരമായി പൂർത്തിയായി. അന്തിമ റിപ്പോർട്ടുകൾ താഴെ ലഭ്യമാണ്.",
    step_pill: "ഘട്ടം {step}/7",
    your_claim: "നിങ്ങളുടെ അവകാശവാദം",
    btn_back: "പുറകോട്ട്",
    btn_next: "നെക്സ്റ്റ്",
    btn_verify_reveal: "പരിശോധിച്ച് വെളിപ്പെടുത്തുക",
    results_title: "അന്തിമ ഫലം (ഘട്ടം 7-ന് ശേഷം ലഭ്യമാകും)",
    results_title_verified: "അന്തിമ ഫലം (പരിശോധിക്കപ്പെട്ടു)",
    results_banner_default: "ദയവായി 7 ഘട്ടങ്ങളും പൂർത്തിയാക്കുക. അന്തിമ വിശകലനവും വിധിയും അവസാനം കാണിക്കും.",
    results_banner_complete: "പരിശോധന പൂർത്തിയായി. അവകാശ പരിശോധനാ റിപ്പോർട്ട് അൺലോക്ക് ചെയ്യപ്പെട്ടു.",
    w_verdict: "വിധി",
    w_confidence: "ആത്മവിശ്വാസ സ്കോർ",
    w_type: "അവകാശവാദ തരം",
    w_reliability: "മൊത്തത്തിലുള്ള വിശ്വാസ്യത",
    w_explanation: "വിശദീകരണം (എന്തുകൊണ്ട്?)",
    w_sources: "പ്രധാന ഉറവിടങ്ങൾ",
    w_summary: "തെളിവ് സംഗ്രഹം",
    w_insights: "NLP സ്ഥിതിവിവരക്കണക്കുകൾ",
    sub_end: "അവസാനം കാണിക്കും",
    sub_verified: "സ്ഥിരീകരിച്ച ഫലം",
    no_claim: "അവകാശവാദങ്ങളൊന്നും ഇതുവരെ നൽകിയിട്ടില്ല. ആരംഭിക്കാൻ മുകളിൽ ടൈപ്പ് ചെയ്യുക.",
    view_history_title: "അവകാശ പരിശോധന ചരിത്രം",
    view_history_sub: "ഈ വർക്ക്സ്പേസ് വഴി പരിശോധിച്ച കഴിഞ്ഞകാല അവകാശവാദങ്ങളുടെ ചരിത്രം.",
    th_claim: "അവകാശവാദ പ്രസ്താവന",
    th_verdict: "വിധി",
    th_confidence: "വിശ്വാസ്യത",
    th_category: "വിഭാഗം",
    th_timestamp: "സമയം",
    th_actions: "നടപടികൾ",
    btn_reverify: "വീണ്ടും പരിശോധിക്കുക",
    view_how_title: "പ്രവർത്തന രീതി",
    view_how_sub: "സ്വയമേവയുള്ള 7-ഘട്ട അവകാശ പരിശോധന പ്രക്രിയ മനസ്സിലാക്കുക.",
    view_about_title: "ഞങ്ങളെക്കുറിച്ച്",
    view_about_sub: "വ്യാജ വാർത്ത കണ്ടെത്തലും അവകാശ പരിശോധന സംവിധാനവും.",
    about_mission_h3: "ഞങ്ങളുടെ ദൗത്യം",
    about_mission_p: "തെറ്റായ വിവരങ്ങൾ സമൂഹത്തെ ദോഷകരമായി ബാധിക്കുന്നു. ഔദ്യോഗിക ഉറവിടങ്ങളുമായി വിവരങ്ങൾ താരതമ്യം ചെയ്ത് സുതാര്യമായ പരിശോധനാ ഫലം നൽകുകയാണ് ഞങ്ങളുടെ ലക്ഷ്യം.",
    about_tech_h3: "ഉപയോഗിച്ച സാങ്കേതികവിദ്യ",
    about_tech_p: "ഈ സംവിധാനം തത്സമയ വെബ് ക്രാളറുകൾ, സെമാന്റിക് താരതമ്യങ്ങൾ, വിശ്വസനീയമായ ഉറവിടങ്ങളുടെ ഡാറ്റാബേസ് എന്നിവ വഴി പ്രവർത്തിക്കുന്നു. ഇത് വിശദമായ വിശകലന റിപ്പോർട്ട് നൽകുന്നു.",
    p_obj_h4: "നിഷ്പക്ഷത",
    p_obj_p: "തീരുമാനങ്ങൾ പൂർണ്ണമായും ഔദ്യോഗിക ഉറവിടങ്ങളിലെ തെളിവുകളുടെ അടിസ്ഥാനത്തിൽ മാത്രമാണ് എടുക്കുന്നത്.",
    p_trans_h4: "സുതാര്യത",
    p_trans_p: "ഉപയോക്താക്കളുടെ വിശ്വാസ്യതയ്ക്കായി എല്ലാ തെളിവുകളും ഉറവിടങ്ങളും അവയുടെ റേറ്റിംഗും പ്രദർശിപ്പിക്കുന്നു.",
    p_speed_h4: "വേഗതയും കൃത്യതയും",
    p_speed_p: "NLP സാങ്കേതികവിദ്യയുടെ സഹായത്തോടെ സെക്കൻഡുകൾക്കുള്ളിൽ വിവരങ്ങൾ സ്കാൻ ചെയ്ത് ഫലം നൽകുന്നു."
  },
  es: {
    logo_title: "Detección de Noticias Falsas <span>&</span><br>Sistema de Verificación",
    nav_home: "Inicio",
    nav_history: "Historial",
    nav_how: "Cómo Funciona",
    nav_about: "Nosotros",
    input_title: "1. Ingrese su Reclamación",
    input_sub: "Escriba texto o suba imagen / PDF",
    tab_text: "Texto",
    tab_image: "Imagen",
    tab_pdf: "PDF",
    textarea_placeholder: "Escriba su declaración de reclamación aquí...",
    upload_title: "O subir archivos",
    upload_img: "Subir Imagen",
    upload_pdf: "Subir PDF",
    upload_sub: "Soporta JPG, PNG, PDF (Máx 10MB)",
    tips_title: "Consejos",
    tips_1: "Ingrese reclamaciones específicas para mejores resultados.",
    tips_2: "Nuestro sistema busca fuentes confiables y proporciona un veredicto explicable.",
    btn_verify: "Iniciar Verificación",
    steps_banner: 'Verificamos su reclamación en 7 sencillos pasos. Haga clic en "Siguiente" para ver cómo funciona.',
    step1_title: "Ingresar Reclamación",
    step2_title: "Extraer Texto",
    step3_title: "Análisis PNL",
    step4_title: "Buscar Evidencia",
    step5_title: "Verificar Fuentes",
    step6_title: "Comparar y Evaluar",
    step7_title: "Veredicto Final",
    step1_desc: "Hemos recibido su reclamación. Haga clic en \"Siguiente\" para continuar.",
    step2_desc: "Nuestro sistema analiza la estructura y realiza la extracción de texto OCR si es necesario.",
    step3_desc: "El procesamiento del lenguaje natural nos ayuda a comprender la postura y el sentimiento del texto.",
    step4_desc: "Buscamos evidencia en índices de noticias global, motores de búsqueda y registros oficiales.",
    step5_desc: "Nuestros modelos evalúan la reputación y confianza del dominio de origen.",
    step6_desc: "Comparamos las reclamaciones con la evidencia para identificar contradicciones.",
    step7_desc: "Todos los módulos de verificación han finalizado con éxito. Reportes listos para mostrar.",
    step_pill: "Paso {step} de 7",
    your_claim: "Su Reclamación",
    btn_back: "Atrás",
    btn_next: "Siguiente",
    btn_verify_reveal: "Verificar y Revelar",
    results_title: "Resultado Final (Disponible tras Paso 7)",
    results_title_verified: "Resultado Final (Verificado)",
    results_banner_default: "Por favor complete los 7 pasos. El análisis completo y el veredicto se mostrarán al final.",
    results_banner_complete: "Verificación completada. Reporte de evaluación de reclamación desbloqueado.",
    w_verdict: "Veredicto",
    w_confidence: "Puntaje de Confianza",
    w_type: "Tipo de Reclamación",
    w_reliability: "Fiabilidad General",
    w_explanation: "Explicación (¿Por qué?)",
    w_sources: "Fuentes Principales",
    w_summary: "Resumen de Evidencia",
    w_insights: "Perspectivas PNL",
    sub_end: "Se mostrará al final",
    sub_verified: "Resultado Verificado",
    no_claim: "Aún no se ha ingresado ninguna reclamación. Escriba arriba para comenzar.",
    view_history_title: "Historial de Verificaciones",
    view_history_sub: "Historial de reclamaciones verificadas procesadas en este espacio de trabajo.",
    th_claim: "Declaración de Reclamación",
    th_verdict: "Veredicto",
    th_confidence: "Confianza",
    th_category: "Categoría",
    th_timestamp: "Fecha y Hora",
    th_actions: "Acciones",
    btn_reverify: "Re-verificar",
    view_how_title: "Cómo Funciona",
    view_how_sub: "Entendiendo el motor de verificación automatizado en 7 pasos.",
    view_about_title: "Nosotros",
    view_about_sub: "Sistema de Detección de Noticias Falsas y Verificación.",
    about_mission_h3: "Nuestra Misión",
    about_mission_p: "La desinformación debilita las instituciones democráticas. Nuestra misión es diseñar interfaces de verificación transparentes que contrasten las reclamaciones con fuentes oficiales, ofreciendo auditorías de confianza pública sobre la información.",
    about_tech_h3: "Tecnología Principal",
    about_tech_p: "El sistema utiliza rastreadores web en tiempo real, índices de similitud semántica y un directorio reputacional de fuentes. Está optimizado para dar reportes explicativos completos en lugar de simples veredictos booleanos.",
    p_obj_h4: "Objetividad",
    p_obj_p: "Las decisiones se ponderan estrictamente en base a citas de evidencia de dominios autorizados.",
    p_trans_h4: "Transparencia",
    p_trans_p: "Todas las citas de origen, métricas de confianza y frases coincidentes se exponen al usuario.",
    p_speed_h4: "Velocidad y Precisión",
    p_speed_p: "Los flujos de PNL escanean, evalúan y formulan resultados en cuestión de segundos."
  },
  fr: {
    logo_title: "Détection de Fausses Nouvelles <span>&</span><br>Système de Vérification",
    nav_home: "Accueil",
    nav_history: "Historique",
    nav_how: "Fonctionnement",
    nav_about: "À Propos",
    input_title: "1. Saisissez votre Déclaration",
    input_sub: "Entrez du texte ou téléchargez une image / PDF",
    tab_text: "Texte",
    tab_image: "Image",
    tab_pdf: "PDF",
    textarea_placeholder: "Saisissez votre déclaration de réclamation ici...",
    upload_title: "Ou téléchargez des fichiers",
    upload_img: "Télécharger Image",
    upload_pdf: "Télécharger PDF",
    upload_sub: "Prend en charge JPG, PNG, PDF (Max 10 Mo)",
    tips_title: "Conseils",
    tips_1: "Saisissez des réclamations spécifiques pour de meilleurs résultats.",
    tips_2: "Notre système recherche des sources fiables et fournit un verdict explicable.",
    btn_verify: "Démarrer la Vérification",
    steps_banner: 'Nous vérifions votre réclamation en 7 étapes simples. Cliquez sur "Suivant" pour voir comment cela fonctionne.',
    step1_title: "Saisir Réclamation",
    step2_title: "Extraire Texte",
    step3_title: "Analyse NLP",
    step4_title: "Rechercher des Preuves",
    step5_title: "Vérifier les Sources",
    step6_title: "Comparer et Évaluer",
    step7_title: "Verdict Final",
    step1_desc: "Nous avons reçu votre réclamation. Cliquez sur \"Suivant\" pour continuer.",
    step2_desc: "Notre système analyse la structure et effectue une extraction de texte OCR si nécessaire.",
    step3_desc: "Le traitement du langage naturel nous aide à comprendre la position et le sentiment du texte.",
    step4_desc: "Nous recherchons des preuves dans les index d'actualités mondiaux, les moteurs de recherche et les registres officiels.",
    step5_desc: "Nos modèles évaluent la réputation du domaine d'origine et le poids de confiance.",
    step6_desc: "Nous comparons les réclamations aux preuves factuelles pour identifier les contradictions.",
    step7_desc: "Tous les modules de vérification ont réussi. Les rapports finaux sont prêts à être révélés.",
    step_pill: "Étape {step} sur 7",
    your_claim: "Votre Réclamation",
    btn_back: "Retour",
    btn_next: "Suivant",
    btn_verify_reveal: "Vérifier & Révéler",
    results_title: "Résultat Final (Disponible après l'Étape 7)",
    results_title_verified: "Résultat Final (Vérifié)",
    results_banner_default: "Veuillez suivre les 7 étapes. L'analyse complète et le verdict final seront affichés à la fin.",
    results_banner_complete: "Vérification terminée. Le rapport d'évaluation de la réclamation est déverrouillé.",
    w_verdict: "Verdict",
    w_confidence: "Score de Confiance",
    w_type: "Type de Réclamation",
    w_reliability: "Fiabilité Globale",
    w_explanation: "Explication (Pourquoi ?)",
    w_sources: "Sources Principales",
    w_summary: "Résumé des Preuves",
    w_insights: "Perspectives NLP",
    sub_end: "Sera affiché à la fin",
    sub_verified: "Résultat Vérifié",
    no_claim: "Aucune réclamation saisie pour le moment. Écrivez ci-dessus pour commencer.",
    view_history_title: "Historique des Vérifications",
    view_history_sub: "Historique des réclamations vérifiées traitées dans cet espace de travail.",
    th_claim: "Déclaration de Réclamation",
    th_verdict: "Verdict",
    th_confidence: "Confiance",
    th_category: "Catégorie",
    th_timestamp: "Horodatage",
    th_actions: "Actions",
    btn_reverify: "Re-vérifier",
    view_how_title: "Fonctionnement",
    view_how_sub: "Comprendre le moteur de vérification automatisé en 7 étapes.",
    view_about_title: "À Propos",
    view_about_sub: "Système de détection des fausses nouvelles et de vérification des réclamations.",
    about_mission_h3: "Notre Mission",
    about_mission_p: "La désinformation affaiblit les institutions démocratiques. Notre mission est de concevoir des interfaces de vérification transparentes qui croisent les réclamations avec des sources faisant autorité, fournissant des audits de confiance publique.",
    about_tech_h3: "Technologies Utilisées",
    about_tech_p: "Le système exploite des robots d'indexation en temps réel, des indices de similarité sémantique et un répertoire réputationnel des sources. Il est optimisiert pour fournir des preuves explicatives complètes.",
    p_obj_h4: "Objectivité",
    p_obj_p: "Les décisions sont pondérées strictement sur la base de citations de preuves provenant de domaines faisant autorité.",
    p_trans_h4: "Transparence",
    p_trans_p: "Toutes les citations de sources, les mesures de confiance et les correspondances textuelles sont exposées.",
    p_speed_h4: "Rapidité & Précision",
    p_speed_p: "Les flux NLP analysent, évaluent et formulent les résultats en quelques secondes."
  },
  de: {
    logo_title: "Falschnachrichtenerkennung <span>&</span><br>Faktenprüfungssystem",
    nav_home: "Startseite",
    nav_history: "Verlauf",
    nav_how: "Funktionsweise",
    nav_about: "Über Uns",
    input_title: "1. Geben Sie Ihre Behauptung ein",
    input_sub: "Geben Sie Text ein oder laden Sie ein Bild / eine PDF-Datei hoch",
    tab_text: "Text",
    tab_image: "Bild",
    tab_pdf: "PDF",
    textarea_placeholder: "Geben Sie Ihre Behauptung hier ein...",
    upload_title: "Oder Dateien hochladen",
    upload_img: "Bild hochladen",
    upload_pdf: "PDF hochladen",
    upload_sub: "Unterstützt JPG, PNG, PDF (Max. 10 MB)",
    tips_title: "Tipps",
    tips_1: "Geben Sie spezifische Behauptungen ein, um bessere Ergebnisse zu erzielen.",
    tips_2: "Unser System sucht in zuverlässigen Quellen und liefert ein nachvollziehbares Urteil.",
    btn_verify: "Überprüfung starten",
    steps_banner: 'Wir überprüfen Ihre Behauptung in 7 einfachen Schritten. Klicken Sie auf "Weiter", um zu sehen, wie es funktioniert.',
    step1_title: "Behauptung eingeben",
    step2_title: "Text extrahieren",
    step3_title: "NLP-Analyse",
    step4_title: "Beweise suchen",
    step5_title: "Quellen überprüfen",
    step6_title: "Vergleichen & Auswerten",
    step7_title: "Endgültiges Urteil",
    step1_desc: "Wir haben Ihre Behauptung erhalten. Klicken Sie auf \"Weiter\", um fortzufahren.",
    step2_desc: "Unser System analysiert die Dateistruktur und führt bei Bedarf eine OCR-Textextraktion durch.",
    step3_desc: "Die Verarbeitung natürlicher Sprache hilft uns, die Haltung und Stimmung des Textes zu verstehen.",
    step4_desc: "Wir suchen in globalen Nachrichtenindizes, Suchmaschinen und offiziellen Behördenregistern nach Beweisen.",
    step5_desc: "Unsere Modelle bewerten den Ruf und das Vertrauensgewicht der Quelldomäne.",
    step6_desc: "Wir vergleichen Behauptungen direkt mit Beweisen, um Widersprüche zu identifizieren.",
    step7_desc: "Alle Überprüfungsmodule waren erfolgreich. Die Abschlussberichte können angezeigt werden.",
    step_pill: "Schritt {step} von 7",
    your_claim: "Ihre Behauptung",
    btn_back: "Zurück",
    btn_next: "Weiter",
    btn_verify_reveal: "Verifizieren & Anzeigen",
    results_title: "Endergebnis (Verfügbar nach Schritt 7)",
    results_title_verified: "Endergebnis (Verifiziert)",
    results_banner_default: "Bitte durchlaufen Sie alle 7 Schritte. Die vollständige Analyse und das endgültige Urteil werden am Ende angezeigt.",
    results_banner_complete: "Überprüfung abgeschlossen. Der Bewertungsbericht der Behauptung wurde freigeschaltet.",
    w_verdict: "Urteil",
    w_confidence: "Vertrauenswert",
    w_type: "Art der Behauptung",
    w_reliability: "Gesamtzuverlässigkeit",
    w_explanation: "Erklärung (Warum?)",
    w_sources: "Hauptquellen",
    w_summary: "Zusammenfassung der Beweise",
    w_insights: "NLP-Erkenntnisse",
    sub_end: "Wird am Ende angezeigt",
    sub_verified: "Verifiziertes Ergebnis",
    no_claim: "Bisher wurde keine Behauptung eingegeben. Schreiben Sie oben, um zu beginnen.",
    view_history_title: "Überprüfungsverlauf",
    view_history_sub: "Verlauf der in diesem Arbeitsbereich verarbeiteten und verifizierten Behauptungen.",
    th_claim: "Behauptungsaussage",
    th_verdict: "Urteil",
    th_confidence: "Vertrauen",
    th_category: "Kategorie",
    th_timestamp: "Zeitstempel",
    th_actions: "Aktionen",
    btn_reverify: "Erneut überprüfen",
    view_how_title: "Funktionsweise",
    view_how_sub: "Verstehen des automatisierten 7-stufigen Überprüfungsprozesses.",
    view_about_title: "Über Uns",
    view_about_sub: "Falschnachrichtenerkennungs- und Faktenprüfungssystem.",
    about_mission_h3: "Unsere Mission",
    about_mission_p: "Desinformation schwächt demokratische Institutionen. Unsere Mission ist es, transparente Verifizierungsprüfungen zu entwickeln, die Behauptungen mit offiziellen Quellen abgleichen und die Vertrauenswürdigkeit von Informationen bewerten.",
    about_tech_h3: "Kerntechnologie-Stack",
    about_tech_p: "Das System verwendet Echtzeit-Webcrawler, semantische Ähnlichkeitsanalysen und ein Reputationsverzeichnis für Quellen. Es liefert detaillierte Erklärungen statt einfacher Ja/Nein-Urteile.",
    p_obj_h4: "Objektivität",
    p_obj_p: "Entscheidungen werden streng auf der Grundlage von Beweisen aus autorisierten Quellen getroffen.",
    p_trans_h4: "Transparenz",
    p_trans_p: "Alle Quellennachweise, Vertrauenswerte und Texttreffer werden dem Nutzer offengelegt.",
    p_speed_h4: "Schnelligkeit & Präzision",
    p_speed_p: "NLP-Pipelines scannen, bewerten und formulieren Ergebnisse innerhalb weniger Sekunden."
  },
  ta: {
    logo_title: "போலி செய்தி கண்டறிதல் <span>&</span><br>கூற்று சரிபார்ப்பு அமைப்பு",
    nav_home: "முகப்பு",
    nav_history: "வரலாறு",
    nav_how: "செயல்முறை",
    nav_about: "எங்களைப் பற்றி",
    input_title: "1. உங்கள் கூற்றை உள்ளிடவும்",
    input_sub: "உரையை தட்டச்சு செய்யவும் அல்லது படம் / PDF பதிவேற்றவும்",
    tab_text: "உரை",
    tab_image: "படம்",
    tab_pdf: "PDF",
    textarea_placeholder: "உங்கள் கூற்று அறிக்கையை இங்கே தட்டச்சு செய்யவும்...",
    upload_title: "அல்லது கோப்புகளை பதிவேற்றவும்",
    upload_img: "படம் பதிவேற்று",
    upload_pdf: "PDF பதிவேற்று",
    upload_sub: "JPG, PNG, PDF ஆதரிக்கிறது (அதிகபட்சம் 10MB)",
    tips_title: "குறிப்புகள்",
    tips_1: "சிறந்த முடிவுகளுக்கு குறிப்பிட்ட கூற்றுகளை உள்ளிடவும்.",
    tips_2: "எங்கள் அமைப்பு நம்பகமான ஆதாரங்களைத் தேடி, விளக்கமளிக்கக்கூடிய தீர்ப்பை வழங்குகிறது.",
    btn_verify: "சரிபார்ப்பைத் தொடங்கு",
    steps_banner: 'நாங்கள் உங்கள் கூற்றை 7 எளிய படிகளில் சரிபார்க்கிறோம். அது எவ்வாறு செயல்படுகிறது என்பதைப் பார்க்க "அடுத்து" என்பதைக் கிளிக் செய்யவும்.',
    step1_title: "கூற்று உள்ளீடு",
    step2_title: "உரை பிரித்தெடுத்தல்",
    step3_title: "NLP பகுப்பாய்வு",
    step4_title: "சான்றுகளை தேடுதல்",
    step5_title: "ஆதாரங்களை சரிபார்த்தல்",
    step6_title: "ஒப்பிடுதல் & மதிப்பீடு",
    step7_title: "இறுதி தீர்ப்பு",
    step1_desc: "உங்கள் கூற்று பெறப்பட்டது. தொடர \"அடுத்து\" என்பதைக் கிளிக் செய்யவும்.",
    step2_desc: "எங்கள் அமைப்பு கோப்பு கட்டமைப்பை ஸ்கேன் செய்து தேவைப்பட்டால் OCR உரை பிரித்தெடுத்தலை செய்கிறது.",
    step3_desc: "NLP பகுப்பாய்வு கூற்றின் உணர்வையும் போக்கையும் புரிந்து கொள்ள உதவுகிறது.",
    step4_desc: "நாங்கள் உலகளாவிய செய்தி குறியீடுகள் மற்றும் அதிகாரப்பூர்வ பதிவுகளில் சான்றுகளை தேடுகிறோம்.",
    step5_desc: "ஆதார களங்களின் நம்பகத்தன்மை எடையை எங்கள் மாதிரிகள் மதிப்பிடுகின்றன.",
    step6_desc: "முரண்பாடுகளைக் கண்டறிய கூற்றுகளை சான்றுகளுடன் ஒப்பிடுகிறோம்.",
    step7_desc: "அனைத்து சரிபார்ப்புகளும் வெற்றிகரமாக முடிந்தன. இறுதி அறிக்கை தயாராக உள்ளது.",
    step_pill: "படி {step}/7",
    your_claim: "உங்கள் கூற்று",
    btn_back: "பின்னால்",
    btn_next: "அடுத்து",
    btn_verify_reveal: "சரிபார்த்து வெளிப்படுத்து",
    results_title: "இறுதி முடிவு (படி 7 க்குப் பிறகு கிடைக்கும்)",
    results_title_verified: "இறுதி முடிவு (சரிபார்க்கப்பட்டது)",
    results_banner_default: "தயவுசெய்து அனைத்து 7 படிகளையும் முடிக்கவும். இறுதி பகுப்பாய்வு மற்றும் தீர்ப்பு முடிவில் காட்டப்படும்.",
    results_banner_complete: "சரிபார்ப்பு முடிந்தது. கூற்று மதிப்பீட்டு அறிக்கை திறக்கப்பட்டது.",
    w_verdict: "தீர்ப்பு",
    w_confidence: "நம்பிக்கை மதிப்பெண்",
    w_type: "கூற்று வகை",
    w_reliability: "ஒட்டுமொத்த நம்பகத்தன்மை",
    w_explanation: "விளக்கம் (ஏன்?)",
    w_sources: "முக்கிய ஆதாரங்கள்",
    w_summary: "சான்றுகளின் சுருக்கம்",
    w_insights: "NLP நுண்ணறிவு",
    sub_end: "முடிவில் காட்டப்படும்",
    sub_verified: "சரிபார்க்கப்பட்ட முடிவு",
    no_claim: "எந்தக் கூற்றும் இன்னும் உள்ளிடப்படவில்லை. தொடங்க மேலே தட்டச்சு செய்யவும்.",
    view_history_title: "கூற்று சரிபார்ப்பு வரலாறு",
    view_history_sub: "இந்த பணியிடத்தில் சரிபார்க்கப்பட்ட கடந்தகால கூற்றுகளின் வரலாறு.",
    th_claim: "கூற்று அறிக்கை",
    th_verdict: "தீர்ப்பு",
    th_confidence: "நம்பிக்கை",
    th_category: "வகை",
    th_timestamp: "நேரம்",
    th_actions: "நடவடிக்கைகள்",
    btn_reverify: "மீண்டும் சரிபார்",
    view_how_title: "செயல்படும் விதம்",
    view_how_sub: "தானியங்கி 7-படி கூற்று சரிபார்ப்பு அமைப்பின் செயல்முறையைப் புரிந்து கொள்ளுங்கள்.",
    view_about_title: "எங்களைப் பற்றி",
    view_about_sub: "போலி செய்தி கண்டறிதல் மற்றும் கூற்று சரிபார்ப்பு அமைப்பு.",
    about_mission_h3: "எங்கள் நோக்கம்",
    about_mission_p: "தவறான தகவல்கள் சமூகத்தை சீர்குலைக்கின்றன. அதிகாரப்பூர்வ ஆதாரங்களுடன் தகவல்களை ஒப்பிட்டு சரிபார்த்து பப்ளிக் தணிக்கை வழங்குவதே எங்கள் நோக்கம்.",
    about_tech_h3: "முக்கிய தொழில்நுட்பங்கள்",
    about_tech_p: "இந்த அமைப்பு நிகழ்நேர வலை கிராலர்கள், சொற்பொருள் ஒப்பீடுகள் மற்றும் நம்பகமான ஆதாரங்களின் தரவுத்தளத்தை அடிப்படையாகக் கொண்டு செயல்படுகிறது.",
    p_obj_h4: "நடுநிலைமை",
    p_obj_p: "முடிவுகள் அதிகாரப்பூர்வ ஆதாரங்களின் சான்றுகளின் அடிப்படையில் மட்டுமே எடுக்கப்படுகின்றன.",
    p_trans_h4: "வெளிப்படைத்தன்மை",
    p_trans_p: "பயனர்களின் நம்பிக்கைக்காக அனைத்து சான்றுகளும் ஆதாரங்களும் அவற்றின் மதிப்பீடுகளும் காட்டப்படுகின்றன.",
    p_speed_h4: "வேகம் & துல்லியம்",
    p_speed_p: "NLP தொழில்நுட்பம் மூலம் சில நொடிகளில் தகவல்கள் ஸ்கேன் செய்யப்பட்டு முடிவுகள் வழங்கப்படுகின்றன."
  },
  ja: {
    logo_title: "フェイクニュース検出 <span>&</span><br>事実検証システム",
    nav_home: "ホーム",
    nav_history: "履歴",
    nav_how: "仕組み",
    nav_about: "私たちについて",
    input_title: "1. 主張を入力してください",
    input_sub: "テキストを入力するか、画像 / PDFをアップロードしてください",
    tab_text: "テキスト",
    tab_image: "画像",
    tab_pdf: "PDF",
    textarea_placeholder: "ここに主張を入力してください...",
    upload_title: "またはファイルをアップロード",
    upload_img: "画像をアップロード",
    upload_pdf: "PDFをアップロード",
    upload_sub: "JPG, PNG, PDFに対応 (最大10MB)",
    tips_title: "ヒント",
    tips_1: "より良い結果を得るために、具体的な主張を入力してください。",
    tips_2: "当システムは信頼できる情報源を検索し、説明可能な判定を提供します。",
    btn_verify: "検証を開始する",
    steps_banner: '7つの簡単なステップで主張を検証します。「次へ」をクリックして仕組みを確認してください。',
    step1_title: "主張の入力",
    step2_title: "テキスト抽出",
    step3_title: "NLP分析",
    step4_title: "証拠検索",
    step5_title: "情報源検証",
    step6_title: "比較・評価",
    step7_title: "最終判定",
    step1_desc: "主張を受領しました。「次へ」をクリックして続行してください。",
    step2_desc: "システムはファイル構造をスキャンし、必要に応じてOCRテキスト抽出を行います。",
    step3_desc: "自然言語処理により、主張のスタンスと感情分析を理解します。",
    step4_desc: "グローバルニュースインデックス、検索エンジン、公式機関の記録から証拠を検索します。",
    step5_desc: "当社のモデルは、元ドメインの評判と信頼性の重みを評価します。",
    step6_desc: "矛盾を特定するために、主張と証拠を直接比較します。",
    step7_desc: "すべての検証モジュールが成功しました。最終レポートを表示する準備ができました。",
    step_pill: "ステップ {step} / 7",
    your_claim: "あなたの主張",
    btn_back: "戻る",
    btn_next: "次へ",
    btn_verify_reveal: "検証して表示する",
    results_title: "最終結果 (ステップ7の後に表示されます)",
    results_title_verified: "最終結果 (検証済み)",
    results_banner_default: "7つのステップをすべて完了してください。詳細な分析と最終判定は最後に表示されます。",
    results_banner_complete: "検証が完了しました。主張評価レポートがロック解除されました。",
    w_verdict: "判定",
    w_confidence: "信頼度スコア",
    w_type: "主張タイプ",
    w_reliability: "総合信頼性",
    w_explanation: "説明 (理由)",
    w_sources: "主な情報源",
    w_summary: "証拠の要約",
    w_insights: "NLPインサイト",
    sub_end: "最後に表示されます",
    sub_verified: "検証済み結果",
    no_claim: "主張はまだ入力されていません。上で入力して開始してください。",
    view_history_title: "検証履歴",
    view_history_sub: "このワークスペースで処理および検証された主張の履歴。",
    th_claim: "主張内容",
    th_verdict: "判定",
    th_confidence: "信頼度",
    th_category: "カテゴリ",
    th_timestamp: "タイムスタンプ",
    th_actions: "アクション",
    btn_reverify: "再検証する",
    view_how_title: "仕組み",
    view_how_sub: "自動化された7ステップの検証プロセスの詳細。",
    view_about_title: "私たちについて",
    view_about_sub: "フェイクニュース検出および事実検証システム。",
    about_mission_h3: "私たちの使命",
    about_mission_p: "誤情報は民主的な制度を弱体化させます。私たちの使命は、主張と公式のソースを対比し、情報の信頼性を公的に監査する、透明で説明可能な検証システムを開発することです。",
    about_tech_h3: "主要技術スタック",
    about_tech_p: "システムはリアルタイムのウェブクローラー、意味的類似性分析、ソースの評判ディレクトリを活用しています。単なる「はい/いいえ」ではなく、詳細な説明付きのレポートを提供します。",
    p_obj_h4: "客観性",
    p_obj_p: "判定は偏見を排除し、公式ソースからの証拠に基づいて厳格に行われます。",
    p_trans_h4: "透明性",
    p_trans_p: "ユーザーの検証のために、すべての証拠の引用、信頼性スコア、テキストの一致度が公開されます。",
    p_speed_h4: "迅速性と精度",
    p_speed_p: "NLPパイプラインは情報をスキャンし、数秒以内に検証結果を作成します。"
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
        textarea.placeholder = t.tab_image === "Image" ? "Upload an image using the buttons below to extract claim text..." : "చిత్రం నుండి టెక్స్ట్ సేకరించడానికి కింద బటన్ క్లిక్ చేసి అప్‌లోడ్ చేయండి...";
      } else if (tabType === 'pdf') {
        textarea.placeholder = t.tab_pdf === "PDF" ? "Upload a PDF using the buttons below to extract claim text..." : "PDF నుండి టెక్స్ట్ సేకరించడానికి కింద బటన్ క్లిక్ చేసి అప్‌లోడ్ చేయండి...";
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
      alert(state.currentLang === 'te' ? "దయచేసి ఒక క్లెయిమ్ నమోదు చేయండి లేదా ఫైల్ అప్‌లోడ్ చేయండి." : "Please enter a claim statement or upload a file first.");
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
    const t = translations[state.currentLang] || translations.en;
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
    const claimTextVal = state.claimText || t.no_claim;
    
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
          summaryText: t.activeTab === 'text' ? (t.currentLang === 'te' ? 'టెక్స్ట్ ఆకృతి ధృవీకరించబడుతోంది.' : 'Validating textual patterns.') : (t.currentLang === 'te' ? 'ఫైల్ నుండి టెక్స్ట్‌ని OCR సహాయంతో సంగ్రహిస్తోంది.' : 'Extracting key textual claims and structural statements.'),
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
              <h4 style="color: var(--success);">${t.currentLang === 'te' ? 'సంగ్రహణ ప్రక్రియ' : 'Extraction Process'}</h4>
              <div id="ocr-status" style="font-size: 0.85rem; color: #065f46; font-weight: 500; margin-bottom: 6px;">${t.currentLang === 'te' ? 'ప్రక్రియ ప్రారంభమవుతోంది...' : 'Initializing extraction...'}</div>
              <div class="ocr-text-preview" id="ocr-preview">Processing...</div>
            </div>`
        };

      case 3:
        return {
          title: t.step3_title,
          summaryText: t.currentLang === 'te' ? 'సిమాంటిక్ వ్యాకరణం మరియు ఎంటిటీలను విశ్లేషిస్తోంది.' : 'Analyzing semantic syntax, claim stance, and entity mapping.',
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
          title: t.step4_title,
          summaryText: t.currentLang === 'te' ? 'వివిధ వెబ్ క్రాలర్లు మరియు రిజిస్ట్రీలలో శోధిస్తోంది.' : 'Generating query keywords and searching fact-checking APIs.',
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
              <h4 style="color: #ea580c;">${t.currentLang === 'te' ? 'వెబ్ క్వెరీ శోధనలు' : 'Simulated Web Queries'}</h4>
              <div class="queries-box" id="queries-container">
                <!-- Loaded via simulation script -->
              </div>
            </div>`
        };

      case 5:
        return {
          title: t.step5_title,
          summaryText: t.currentLang === 'te' ? 'లభించిన ఆధారాల విశ్వసనీయత అంచనా వేస్తోంది.' : 'Evaluating credibility and authority weights of sources.',
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
              <h4 style="color: #db2777;">${t.currentLang === 'te' ? 'విశ్వసనీయత రేటింగ్స్' : 'Credibility Ratings'}</h4>
              <div class="sources-list" id="sources-list-container">
                <!-- Sources items updated by simulations -->
              </div>
            </div>`
        };

      case 6:
        return {
          title: 'Compare & Evaluate',
          summaryText: t.currentLang === 'te' ? 'క్లెయిమ్ మరియు సాక్ష్యాల పోలిక నివేదిక.' : 'Checking claims assertions against evidence records.',
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
              <h4 style="color: #047857;">${t.currentLang === 'te' ? 'వాస్తవాల పోలిక ప్యానెల్' : 'Fact Alignment'}</h4>
              <div class="comparison-grid" id="comparison-container">
                <!-- Dynamic comparison sides -->
              </div>
            </div>`
        };

      case 7:
        return {
          title: t.step7_title,
          summaryText: t.currentLang === 'te' ? 'ధృవీకరణ విశ్లేషణలు పూర్తయ్యాయి. నివేదికను అన్‌లాక్ చేయండి.' : 'Consolidating verdicts, reliability index, and explanation parameters.',
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
              <h4 style="color: var(--primary);">${t.currentLang === 'te' ? 'సారాంశ ప్రకటన' : 'Summary Statement'}</h4>
              <p style="font-size: 0.85rem; color: #1e40af; font-weight: 500;">
                ${t.currentLang === 'te' ? 'వెరిఫికేషన్ వివరాలు మరియు పూర్తి విశ్లేషణను కింద ఉన్న నివేదికలో అన్‌లాక్ చేయడానికి "ధృవీకరించి చూపించు" బటన్ నొక్కండి.' : 'Click "Verify & Reveal" below to populate the full diagnostic grid and review sources, reliability star indices, confidence scopes, and detailed explanation text.'}
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
        if (statusText) statusText.textContent = t.currentLang === 'te' ? 'నిర్మాణాన్ని విశ్లేషిస్తోంది...' : 'Analyzing structures...';
        
        setTimeout(() => {
          if (statusText) statusText.textContent = t.currentLang === 'te' ? 'టెక్స్ట్‌ని సంగ్రహిస్తోంది...' : 'Parsing sentences...';
          
          setTimeout(() => {
            if (statusText) {
              statusText.textContent = t.currentLang === 'te' ? 'విజయవంతంగా పూర్తయింది!' : 'Extraction Complete!';
              statusText.style.color = '#047857';
            }
            if (previewText) {
              const displayVal = state.claimText || t.no_claim;
              previewText.innerHTML = `<span style="color:#047857; font-weight:600;">"${displayVal}"</span>`;
            }
          }, 1200);
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

      if (sourcesContainer) sourcesContainer.innerHTML = 'Analyzing database reputability...';
      
      setTimeout(() => {
        if (sourcesContainer) {
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
        }
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

      if (comparisonContainer) comparisonContainer.innerHTML = 'Computing comparative matrices...';
      
      setTimeout(() => {
        if (comparisonContainer) {
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

    if (textarea) textarea.placeholder = t.textarea_placeholder;

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

    // Sub-views static contents
    // 1. History
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

    const reVerifyButtons = document.querySelectorAll('.re-verify-btn');
    reVerifyButtons.forEach(btn => {
      btn.textContent = t.btn_reverify;
    });

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

    // Refresh active step render
    renderStepBody(state.currentStep);
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
