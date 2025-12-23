// Simple i18n (FR/AR) with RTL handling
const I18N = {
  fr: {
    app_title: "IQ Mix",
    app_subtitle: "Test complet (indicatif)",
    reset: "Réinitialiser",
    home_h1: "Test de QI complet — adultes",
    home_p: "6 épreuves (logique, spatial, mémoire, calcul, verbal, attention). Durée 12–15 min.",
    home_kpi1: "épreuves",
    home_kpi2: "minutes",
    home_kpi3: "bilingue",
    home_notice_title: "Important",
    home_notice_text: "Indicateur ludique, pas un test médical. Résultats = estimation.",
    start: "Commencer",
    how: "Comment ça marche",
    how_h2: "Comment ça marche",
    how_s1: "Chaque épreuve est chronométrée.",
    how_s2: "Tu réponds, on calcule score + précision + vitesse.",
    how_s3: "À la fin : scores par domaine et indice global (estimé).",
    back: "Retour",
    time: "Temps",
    score: "Score",
    skip: "Passer",
    next: "Suivant",
    results_h2: "Résultats",
    copy: "Copier",
    again: "Rejouer",
    estimated_index: "Indice estimé",
    results_disclaimer: "Indice indicatif. Pour un test officiel, consulte un professionnel qualifié.",
    footer: "Test IQ Mix (FR/AR) · offline · sans tracking",
    modules_title: "Modules",
    mod_logic: "Logique",
    mod_spatial: "Spatial",
    mod_memory: "Mémoire",
    mod_math: "Calcul",
    mod_verbal: "Verbal",
    mod_attention: "Attention",
    difficulty: "Difficulté",
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",
    accuracy: "Précision",
    speed: "Vitesse",
    done: "Terminé",
    select_one: "Choisis une réponse.",
    copied: "Copié ✅",
    sound_on: "🔊",
    sound_off: "🔈",
    iq_label_low: "À renforcer (indicatif)",
    iq_label_avg: "Dans la moyenne (indicatif)",
    iq_label_high: "Au-dessus de la moyenne (indicatif)",
    iq_label_vhigh: "Très élevé (indicatif)"
  },
  ar: {
    app_title: "IQ Mix",
    app_subtitle: "اختبار كامل (تقديري)",
    reset: "إعادة ضبط",
    home_h1: "اختبار ذكاء كامل — للبالغين",
    home_p: "6 اختبارات (منطق، مكاني، ذاكرة، حساب، لفظي، انتباه). المدة 12–15 دقيقة.",
    home_kpi1: "اختبارات",
    home_kpi2: "دقائق",
    home_kpi3: "ثنائي اللغة",
    home_notice_title: "مهم",
    home_notice_text: "مؤشر ترفيهي وليس اختبارًا طبيًا. النتائج تقديرية.",
    start: "ابدأ",
    how: "كيف يعمل",
    how_h2: "كيف يعمل",
    how_s1: "كل اختبار له وقت محدد.",
    how_s2: "تجيب، ونحسب النقاط + الدقة + السرعة.",
    how_s3: "في النهاية: نقاط لكل مجال ومؤشر عام (تقديري).",
    back: "رجوع",
    time: "الوقت",
    score: "النقاط",
    skip: "تخطي",
    next: "التالي",
    results_h2: "النتائج",
    copy: "نسخ",
    again: "أعد اللعب",
    estimated_index: "المؤشر التقديري",
    results_disclaimer: "النتيجة تقديرية. لاختبار رسمي، استشر مختصًا.",
    footer: "IQ Mix (FR/AR) · يعمل دون إنترنت · بدون تتبع",
    modules_title: "الوحدات",
    mod_logic: "منطق",
    mod_spatial: "مكاني",
    mod_memory: "ذاكرة",
    mod_math: "حساب",
    mod_verbal: "لفظي",
    mod_attention: "انتباه",
    difficulty: "الصعوبة",
    easy: "سهل",
    medium: "متوسط",
    hard: "صعب",
    accuracy: "الدقة",
    speed: "السرعة",
    done: "انتهى",
    select_one: "اختر إجابة.",
    copied: "تم النسخ ✅",
    sound_on: "🔊",
    sound_off: "🔈",
    iq_label_low: "يحتاج تحسينًا (تقديري)",
    iq_label_avg: "ضمن المتوسط (تقديري)",
    iq_label_high: "أعلى من المتوسط (تقديري)",
    iq_label_vhigh: "مرتفع جدًا (تقديري)"
  }
};

function getLang(){
  const saved = localStorage.getItem("lang");
  return (saved === "ar" || saved === "fr") ? saved : "fr";
}

function setLang(lang){
  localStorage.setItem("lang", lang);
  applyLang();
}

function t(key){
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) ? I18N[lang][key] : (I18N.fr[key] || key);
}

function applyLang(){
  const lang = getLang();
  const rtl = (lang === "ar");
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");

  // Update text nodes
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    el.textContent = t(k);
  });

  // Update language button label
  const langBtn = document.getElementById("langBtn");
  if(langBtn) langBtn.textContent = (lang === "fr") ? "FR" : "AR";
}
