(() => {
  const $ = (sel)=>document.querySelector(sel);
  const screens = {
    home: $("#screenHome"),
    how: $("#screenHow"),
    test: $("#screenTest"),
    results: $("#screenResults"),
  };

  const dom = {
    moduleList: $("#moduleList"),
    year: $("#year"),
    langBtn: $("#langBtn"),
    soundBtn: $("#soundBtn"),
    resetBtn: $("#resetBtn"),
    startBtn: $("#startBtn"),
    howBtn: $("#howBtn"),
    backHomeBtn: $("#backHomeBtn"),
    goStartBtn: $("#goStartBtn"),
    testTitle: $("#testTitle"),
    testDesc: $("#testDesc"),
    timerValue: $("#timerValue"),
    scoreValue: $("#scoreValue"),
    progressBar: $("#progressBar"),
    questionArea: $("#questionArea"),
    skipBtn: $("#skipBtn"),
    nextBtn: $("#nextBtn"),
    hintLine: $("#hintLine"),
    iqEstimate: $("#iqEstimate"),
    iqLabel: $("#iqLabel"),
    domainBars: $("#domainBars"),
    againBtn: $("#againBtn"),
    shareBtn: $("#shareBtn"),
  };

  dom.year.textContent = new Date().getFullYear();

  // Sound (simple beep via WebAudio)
  let soundOn = (localStorage.getItem("sound") ?? "on") === "on";
  function updateSoundBtn(){
    dom.soundBtn.textContent = soundOn ? t("sound_on") : t("sound_off");
  }
  updateSoundBtn();

  function beep(freq=640, ms=70){
    if(!soundOn) return;
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = 0.06;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      setTimeout(()=>{ o.stop(); ctx.close(); }, ms);
    }catch(e){}
  }

  function showScreen(name){
    Object.values(screens).forEach(s=>s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  // Build module list
  function renderModules(){
    dom.moduleList.innerHTML = "";
    TEST_FLOW.forEach((m)=>{
      const li = document.createElement("li");
      const left = document.createElement("div");
      left.innerHTML = `<b>${t(m.labelKey)}</b>`;
      const right = document.createElement("div");
      right.className = "badge";
      right.textContent = `${m.count}`;
      li.append(left,right);
      dom.moduleList.appendChild(li);
    });
  }

  // Language toggle
  dom.langBtn.addEventListener("click", ()=>{
    const current = getLang();
    setLang(current === "fr" ? "ar" : "fr");
    renderModules();
    // Also re-render current question if test screen visible
    if(screens.test.classList.contains("active")){
      renderCurrent();
    }
    if(screens.results.classList.contains("active")){
      renderResults();
    }
    updateSoundBtn();
  });

  dom.soundBtn.addEventListener("click", ()=>{
    soundOn = !soundOn;
    localStorage.setItem("sound", soundOn ? "on" : "off");
    updateSoundBtn();
    beep(760, 60);
  });

  // State
  let state;

  const DEFAULT_STATE = () => ({
    startedAt: Date.now(),
    flowIndex: 0,
    qIndex: 0,
    score: 0,
    // per domain metrics
    domains: {
      logic: {correct:0, total:0, time:0, score:0},
      spatial:{correct:0, total:0, time:0, score:0},
      memory:{correct:0, total:0, time:0, score:0},
      math:  {correct:0, total:0, time:0, score:0},
      verbal:{correct:0, total:0, time:0, score:0},
      attention:{correct:0, total:0, time:0, score:0, clicks:0, falseClicks:0}
    },
    // current
    current: null,
    currentStart: 0,
    selected: null,
    locked: false,
    timer: {remaining:0, handle:null},
    memory: {phase:"", sequence:"", input:""},
    attention: {running:false, hits:0, misses:0, falseHits:0, spawned:0}
  });

  function save(){
    localStorage.setItem("iqmix_state", JSON.stringify(state));
  }
  function load(){
    try{
      const raw = localStorage.getItem("iqmix_state");
      if(!raw) return null;
      return JSON.parse(raw);
    }catch(e){ return null; }
  }
  function clearSaved(){
    localStorage.removeItem("iqmix_state");
  }

  function resetAll(){
    state = DEFAULT_STATE();
    save();
    showScreen("home");
    beep(500, 70);
  }

  dom.resetBtn.addEventListener("click", ()=>{
    clearSaved();
    resetAll();
  });

  // Assemble questions in flow order
  function buildFlowQuestions(){
    const byDomain = {};
    QUESTION_BANK.forEach(q=>{
      (byDomain[q.domain] ||= []).push(q);
    });
    // Keep stable order; could shuffle within domain for variety
    const out = [];
    TEST_FLOW.forEach(step=>{
      const list = (byDomain[step.domain] || []).slice(0, step.count);
      out.push(...list);
    });
    return out;
  }

  const ALL_QUESTIONS = buildFlowQuestions();

  function currentQuestion(){
    return ALL_QUESTIONS[state.qIndex] || null;
  }

  function startTest(){
    state.startedAt = Date.now();
    state.flowIndex = 0;
    state.qIndex = 0;
    state.score = 0;
    state.selected = null;
    state.locked = false;
    state.current = null;
    state.timer.handle && clearInterval(state.timer.handle);
    state.timer.handle = null;
    state.attention = {running:false, hits:0, misses:0, falseHits:0, spawned:0};
    nextQuestion(true);
    showScreen("test");
  }

  dom.startBtn.addEventListener("click", ()=>{ clearSaved(); state = DEFAULT_STATE(); startTest(); });
  dom.goStartBtn.addEventListener("click", ()=>{ clearSaved(); state = DEFAULT_STATE(); startTest(); });
  dom.howBtn.addEventListener("click", ()=>{ showScreen("how"); });
  dom.backHomeBtn.addEventListener("click", ()=>{ showScreen("home"); });

  dom.againBtn.addEventListener("click", ()=>{
    clearSaved();
    state = DEFAULT_STATE();
    startTest();
  });

  dom.shareBtn.addEventListener("click", async ()=>{
    const text = buildShareText();
    try{
      await navigator.clipboard.writeText(text);
      dom.shareBtn.textContent = t("copied");
      setTimeout(()=> dom.shareBtn.textContent = t("copy"), 1200);
    }catch(e){
      // fallback
      prompt("Copier :", text);
    }
  });

  function setTimer(seconds){
    state.timer.remaining = seconds;
    dom.timerValue.textContent = fmtTime(state.timer.remaining);
    if(state.timer.handle) clearInterval(state.timer.handle);
    state.currentStart = Date.now();
    state.timer.handle = setInterval(()=>{
      state.timer.remaining--;
      dom.timerValue.textContent = fmtTime(Math.max(0, state.timer.remaining));
      if(state.timer.remaining <= 0){
        clearInterval(state.timer.handle);
        state.timer.handle = null;
        // auto-evaluate
        if(!state.locked){
          evaluateAndLock(true);
        }
      }
    }, 1000);
  }

  function fmtTime(sec){
    sec = Math.max(0, Math.floor(sec));
    const m = String(Math.floor(sec/60)).padStart(2,"0");
    const s = String(sec%60).padStart(2,"0");
    return `${m}:${s}`;
  }

  function updateProgress(){
    const pct = ((state.qIndex) / ALL_QUESTIONS.length) * 100;
    dom.progressBar.style.width = `${pct}%`;
  }

  function domainLabelKey(domain){
    return ({
      logic:"mod_logic",
      spatial:"mod_spatial",
      memory:"mod_memory",
      math:"mod_math",
      verbal:"mod_verbal",
      attention:"mod_attention"
    })[domain] || domain;
  }

  function domainDesc(domain){
    const lang = getLang();
    const map = {
      fr: {
        logic:"Suites, règles, raisonnement.",
        spatial:"Rotation, symétrie, cube.",
        memory:"Mémoire de travail.",
        math:"Calcul sous pression.",
        verbal:"Analogies simples.",
        attention:"Cible / distracteurs."
      },
      ar: {
        logic:"سلاسل وقواعد واستنتاج.",
        spatial:"تدوير وتناظر ومكعب.",
        memory:"ذاكرة العمل.",
        math:"حساب بسرعة.",
        verbal:"تشبيهات بسيطة.",
        attention:"هدف ومشتتات."
      }
    };
    return (map[lang] && map[lang][domain]) ? map[lang][domain] : "";
  }

  function renderHeader(q){
    dom.testTitle.textContent = `${t(domainLabelKey(q.domain))} — ${state.qIndex+1}/${ALL_QUESTIONS.length}`;
    dom.testDesc.textContent = domainDesc(q.domain);
    dom.scoreValue.textContent = String(state.score);
  }

  function clearQuestionArea(){
    dom.questionArea.innerHTML = "";
    dom.hintLine.textContent = "";
  }

  function renderMCQ(q){
    const lang = getLang();
    const card = document.createElement("div");
    card.className = "qCard";
    const qText = document.createElement("div");
    qText.className = "qText";
    qText.textContent = q.q[lang];
    const sub = document.createElement("div");
    sub.className = "qSub";
    sub.textContent = (q.sub && q.sub[lang]) ? q.sub[lang] : "";
    card.append(qText, sub);

    const choices = document.createElement("div");
    choices.className = "choices";
    q.choices[lang].forEach((c, idx)=>{
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.type = "button";
      btn.textContent = c;
      btn.addEventListener("click", ()=>{
        if(state.locked) return;
        state.selected = idx;
        [...choices.querySelectorAll(".choice")].forEach(b=>b.classList.remove("selected"));
        btn.classList.add("selected");
        beep(520, 50);
      });
      choices.appendChild(btn);
    });

    dom.questionArea.append(card, choices);
  }

  function randDigits(n){
    let s="";
    for(let i=0;i<n;i++) s += String(Math.floor(Math.random()*10));
    return s;
  }

  function randSymbols(n){
    const pool = ["▲","■","◆","●","✦","✸","⬟","⬢","⬣"];
    let out = "";
    for(let i=0;i<n;i++){
      out += pool[Math.floor(Math.random()*pool.length)];
    }
    return out;
  }

  function renderMemory(q){
    const lang = getLang();
    state.memory = {phase:"show", sequence:"", input:""};
    let seq = "";
    if(q.mode === "digits_forward" || q.mode === "digits_backward") seq = randDigits(q.len);
    else seq = randSymbols(q.len);
    state.memory.sequence = seq;

    const card = document.createElement("div");
    card.className = "qCard";
    const title = document.createElement("div");
    title.className = "qText";
    title.textContent = (lang==="fr")
      ? "Mémorise la séquence"
      : "احفظ التسلسل";
    const sub = document.createElement("div");
    sub.className = "qSub";
    sub.textContent = (q.mode==="digits_backward")
      ? (lang==="fr" ? "Tu devras la retaper à l'envers." : "ستعيد كتابته بالعكس.")
      : (lang==="fr" ? "Tu devras la retaper." : "ستعيد كتابته.");
    const big = document.createElement("div");
    big.className = "qText";
    big.style.fontSize = "28px";
    big.style.textAlign = "center";
    big.style.marginTop = "10px";
    big.textContent = seq;

    const info = document.createElement("div");
    info.className = "muted";
    info.style.textAlign = "center";
    info.style.fontSize = "12px";
    info.style.marginTop = "8px";
    info.textContent = (lang==="fr") ? "Regarde 4 secondes…" : "شاهد لمدة 4 ثوانٍ…";

    card.append(title, sub, big, info);
    dom.questionArea.append(card);

    // Hide after 4s, then show input
    setTimeout(()=>{
      if(state.current?.id !== q.id) return;
      state.memory.phase = "input";
      big.textContent = "••••••";
      info.textContent = (lang==="fr") ? "À toi !" : "دورك!";
      renderMemoryInput(q);
      beep(640, 70);
    }, 4000);
  }

  function renderMemoryInput(q){
    const lang = getLang();
    const wrap = document.createElement("div");
    wrap.className = "qCard";
    const label = document.createElement("div");
    label.className = "qSub";
    label.textContent = (lang==="fr")
      ? (q.mode==="digits_backward" ? "Tape la séquence à l'envers" : "Tape la séquence")
      : (q.mode==="digits_backward" ? "اكتب التسلسل بالعكس" : "اكتب التسلسل");

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.autocomplete = "off";
    input.placeholder = (q.mode==="symbols")
      ? (lang==="fr" ? "Recopie les symboles" : "انسخ الرموز")
      : (lang==="fr" ? "Ex: 839104" : "مثال: 839104");
    input.style.width = "100%";
    input.style.padding = "12px 12px";
    input.style.borderRadius = "14px";
    input.style.border = "1px solid rgba(140,170,255,.22)";
    input.style.background = "rgba(10,16,30,.35)";
    input.style.color = "var(--text)";
    input.style.fontWeight = "800";
    input.style.fontSize = "16px";
    input.addEventListener("input", ()=>{ state.memory.input = input.value.trim(); });

    wrap.append(label, input);
    dom.questionArea.append(wrap);
    input.focus();
  }

  function renderAttention(q){
    const lang = getLang();
    state.attention = {running:true, hits:0, misses:0, falseHits:0, spawned:0};
    const card = document.createElement("div");
    card.className = "qCard";

    const title = document.createElement("div");
    title.className = "qText";
    title.textContent = (lang==="fr") ? "Attention (2 min)" : "انتباه (دقيقتان)";

    const sub = document.createElement("div");
    sub.className = "qSub";
    sub.textContent = (lang==="fr")
      ? `Clique uniquement quand tu vois le symbole ${q.target}.`
      : `انقر فقط عندما ترى الرمز ${q.target}.`;

    const stage = document.createElement("div");
    stage.style.marginTop = "12px";
    stage.style.border = "1px solid rgba(140,170,255,.18)";
    stage.style.borderRadius = "18px";
    stage.style.height = "220px";
    stage.style.display = "grid";
    stage.style.placeItems = "center";
    stage.style.fontSize = "64px";
    stage.style.background = "rgba(5,8,18,.35)";
    stage.textContent = "—";

    const stats = document.createElement("div");
    stats.className = "muted";
    stats.style.marginTop = "10px";
    stats.style.display = "flex";
    stats.style.justifyContent = "space-between";
    stats.style.gap = "10px";
    stats.innerHTML = `<span>${lang==="fr" ? "Correct" : "صحيح"}: <b id="attHits">0</b></span>
                       <span>${lang==="fr" ? "Faux" : "خطأ"}: <b id="attFalse">0</b></span>`;

    card.append(title, sub, stage, stats);
    dom.questionArea.append(card);

    const hitsEl = card.querySelector("#attHits");
    const falseEl = card.querySelector("#attFalse");

    let currentSymbol = null;

    stage.addEventListener("click", ()=>{
      if(!state.attention.running || state.locked) return;
      state.domains.attention.clicks += 1;
      if(currentSymbol === q.target){
        state.attention.hits += 1;
        hitsEl.textContent = String(state.attention.hits);
        beep(760, 40);
      }else if(currentSymbol !== null){
        state.attention.falseHits += 1;
        falseEl.textContent = String(state.attention.falseHits);
        beep(260, 60);
      }
    });

    // spawn symbols quickly for 2 minutes
    const start = Date.now();
    const tick = () => {
      if(!state.attention.running || state.current?.id !== q.id) return;
      const elapsed = (Date.now() - start)/1000;
      if(elapsed >= q.time){
        state.attention.running = false;
        // Evaluate now
        evaluateAndLock(true);
        return;
      }
      // choose target with given density
      const isTarget = Math.random() < q.density;
      currentSymbol = isTarget ? q.target : q.distractors[Math.floor(Math.random()*q.distractors.length)];
      stage.textContent = currentSymbol;
      state.attention.spawned += 1;
      setTimeout(tick, 650);
    };
    tick();
  }

  function renderCurrent(){
    const q = state.current;
    if(!q) return;
    clearQuestionArea();
    renderHeader(q);
    updateProgress();

    if(q.type === "mcq") renderMCQ(q);
    else if(q.type === "memory") renderMemory(q);
    else if(q.type === "attention") renderAttention(q);

    // button state
    dom.nextBtn.textContent = t("next");
    dom.skipBtn.disabled = (q.type === "attention"); // attention should run
    dom.nextBtn.disabled = (q.type === "attention"); // auto-finish
  }

  function startQuestion(q, first=false){
    state.current = q;
    state.selected = null;
    state.locked = false;
    setTimer(q.time);
    renderCurrent();
    save();

    if(!first) beep(640, 40);
  }

  function nextQuestion(first=false){
    const q = currentQuestion();
    if(!q){
      finishTest();
      return;
    }
    startQuestion(q, first);
  }

  function evaluateMemory(q){
    const seq = state.memory.sequence;
    let expected = seq;
    if(q.mode === "digits_backward"){
      expected = seq.split("").reverse().join("");
    }
    const got = (state.memory.input || "").trim();
    return got === expected;
  }

  function evaluateAttention(q){
    // Simple scoring: hits good, falseHits bad
    const hits = state.attention.hits;
    const falseHits = state.attention.falseHits;
    // clamp to avoid negative
    const net = Math.max(0, hits - falseHits);
    // mark correct as net above a threshold
    const correct = net >= Math.max(10, Math.floor(state.attention.spawned*0.10));
    return {correct, net, hits, falseHits};
  }

  function scoreFor(q, correct, secondsUsed){
    // Base points by domain and difficulty, plus speed bonus
    const diff = q.difficulty || "easy";
    const baseMap = {easy: 10, medium: 14, hard: 18};
    const domainBoost = (q.domain === "memory" ? 2 : 0) + (q.domain === "attention" ? 6 : 0);
    const base = (baseMap[diff] || 10) + domainBoost;

    if(!correct) return 0;

    const timeAllowed = q.time;
    const remaining = Math.max(0, timeAllowed - secondsUsed);
    const speedRatio = remaining / Math.max(1, timeAllowed);
    const speedBonus = Math.round(base * 0.35 * speedRatio); // up to +35%
    return base + speedBonus;
  }

  function evaluateAndLock(auto=false){
    const q = state.current;
    if(!q) return;
    state.locked = true;

    // stop timer
    if(state.timer.handle){ clearInterval(state.timer.handle); state.timer.handle = null; }

    const secondsUsed = Math.min(q.time, Math.round((Date.now() - state.currentStart)/1000));
    state.domains[q.domain].time += secondsUsed;

    let correct = false;
    let add = 0;

    if(q.type === "mcq"){
      if(state.selected == null){
        dom.hintLine.textContent = t("select_one");
        if(!auto){ state.locked = false; setTimer(Math.max(3, q.time - secondsUsed)); }
        return;
      }
      correct = (state.selected === q.answer);
      add = scoreFor(q, correct, secondsUsed);

      // mark choices
      const choiceButtons = [...dom.questionArea.querySelectorAll(".choice")];
      choiceButtons.forEach((b, idx)=>{
        b.classList.remove("selected");
        if(idx === q.answer) b.classList.add("correct");
        if(state.selected === idx && idx !== q.answer) b.classList.add("wrong");
      });

    } else if(q.type === "memory"){
      correct = evaluateMemory(q);
      add = scoreFor({ ...q, difficulty:"medium" }, correct, secondsUsed);

      const lang = getLang();
      const card = document.createElement("div");
      card.className = "qCard";
      card.innerHTML = `
        <div class="qText">${correct ? "✅" : "❌"} ${lang==="fr" ? "Mémoire" : "ذاكرة"}</div>
        <div class="qSub">${lang==="fr" ? "Séquence:" : "التسلسل:"} <b>${state.memory.sequence}</b></div>
      `;
      dom.questionArea.appendChild(card);

    } else if(q.type === "attention"){
      const res = evaluateAttention(q);
      correct = res.correct;
      add = Math.max(0, Math.round(res.net * 1.2));
      // show recap
      const lang = getLang();
      const card = document.createElement("div");
      card.className = "qCard";
      card.innerHTML = `
        <div class="qText">${lang==="fr" ? "Résumé attention" : "ملخص الانتباه"}</div>
        <div class="qSub">${lang==="fr" ? "Bons clics" : "نقرات صحيحة"}: <b>${res.hits}</b> ·
          ${lang==="fr" ? "Faux clics" : "نقرات خاطئة"}: <b>${res.falseHits}</b> ·
          ${lang==="fr" ? "Score" : "النقاط"}: <b>${add}</b>
        </div>
      `;
      dom.questionArea.appendChild(card);
      state.domains.attention.falseClicks += res.falseHits;
      dom.nextBtn.disabled = false;
      dom.nextBtn.textContent = t("next");
      dom.skipBtn.disabled = true;
    }

    state.domains[q.domain].total += 1;
    if(correct) state.domains[q.domain].correct += 1;
    state.domains[q.domain].score += add;
    state.score += add;
    dom.scoreValue.textContent = String(state.score);

    dom.hintLine.textContent = correct ? "" : "";
    beep(correct ? 820 : 240, 70);

    save();
  }

  dom.nextBtn.addEventListener("click", ()=>{
    if(!state.current) return;
    if(!state.locked){
      evaluateAndLock(false);
      if(!state.locked) return; // if user didn't select
      dom.nextBtn.textContent = t("next");
      return;
    }
    // advance
    state.qIndex += 1;
    if(state.qIndex >= ALL_QUESTIONS.length){
      finishTest();
    }else{
      nextQuestion(false);
    }
  });

  dom.skipBtn.addEventListener("click", ()=>{
    if(!state.current || state.locked) return;
    // count as attempted wrong (no score)
    const q = state.current;
    if(state.timer.handle){ clearInterval(state.timer.handle); state.timer.handle = null; }
    const secondsUsed = Math.min(q.time, Math.round((Date.now() - state.currentStart)/1000));
    state.domains[q.domain].time += secondsUsed;
    state.domains[q.domain].total += 1;
    state.domains[q.domain].score += 0;
    state.qIndex += 1;
    save();
    if(state.qIndex >= ALL_QUESTIONS.length) finishTest();
    else nextQuestion(false);
  });

  function estimateIQ(){
    // Build domain normalized scores (0..100)
    const d = state.domains;
    const domains = ["logic","spatial","memory","math","verbal","attention"];
    const domainPct = {};
    domains.forEach(k=>{
      const total = Math.max(1, d[k].total);
      const acc = d[k].correct / total; // 0..1
      const timePer = d[k].time / total; // seconds
      // speed score: assume ideal time is 60% of allotted on avg
      const ideal = 0.6;
      // approximate: compare used time vs allowed average of that domain
      const allowedAvg = avgAllowed(k);
      const usedRatio = Math.min(1.6, timePer / Math.max(1, allowedAvg));
      const speed = clamp(1.2 - usedRatio, 0, 1); // faster => higher
      const composite = clamp(0.72*acc + 0.28*speed, 0, 1);
      domainPct[k] = Math.round(composite * 100);
    });

    // Weighted overall
    const overall = Math.round(
      0.30*domainPct.logic +
      0.16*domainPct.spatial +
      0.18*domainPct.memory +
      0.14*domainPct.math +
      0.12*domainPct.verbal +
      0.10*domainPct.attention
    );

    // Map 0..100 to IQ estimate centered 100 (indicative)
    // 50 -> 100, slope 0.8 => range roughly 60..140
    const iq = Math.round(100 + (overall - 50) * 0.8);
    return {iq, overall, domainPct};
  }

  function avgAllowed(domain){
    // compute average allowed time for that domain in question bank
    const qs = ALL_QUESTIONS.filter(q=>q.domain===domain);
    if(!qs.length) return 30;
    const sum = qs.reduce((a,q)=>a+(q.time||30),0);
    return sum/qs.length;
  }

  function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

  function iqLabel(iq){
    if(iq < 90) return t("iq_label_low");
    if(iq < 110) return t("iq_label_avg");
    if(iq < 125) return t("iq_label_high");
    return t("iq_label_vhigh");
  }

  function renderResults(){
    const {iq, domainPct} = estimateIQ();
    dom.iqEstimate.textContent = String(iq);
    dom.iqLabel.textContent = iqLabel(iq);

    dom.domainBars.innerHTML = "";
    const order = ["logic","spatial","memory","math","verbal","attention"];
    order.forEach(k=>{
      const row = document.createElement("div");
      row.className = "barRow";
      row.innerHTML = `
        <div class="barTop">
          <div class="barName">${t(domainLabelKey(k))}</div>
          <div class="barVal">${domainPct[k]}%</div>
        </div>
        <div class="barTrack"><div class="barFill" style="width:${domainPct[k]}%"></div></div>
      `;
      dom.domainBars.appendChild(row);
    });
  }

  function buildShareText(){
    const {iq, domainPct} = estimateIQ();
    const lang = getLang();
    if(lang==="fr"){
      return `IQ Mix — résultat indicatif\nIndice estimé: ${iq}\n` +
        `Logique ${domainPct.logic}% | Spatial ${domainPct.spatial}% | Mémoire ${domainPct.memory}% | ` +
        `Calcul ${domainPct.math}% | Verbal ${domainPct.verbal}% | Attention ${domainPct.attention}%`;
    }
    return `IQ Mix — نتيجة تقديرية\nالمؤشر: ${iq}\n` +
      `منطق ${domainPct.logic}% | مكاني ${domainPct.spatial}% | ذاكرة ${domainPct.memory}% | ` +
      `حساب ${domainPct.math}% | لفظي ${domainPct.verbal}% | انتباه ${domainPct.attention}%`;
  }

  function finishTest(){
    if(state.timer.handle){ clearInterval(state.timer.handle); state.timer.handle = null; }
    save();
    renderResults();
    showScreen("results");
    beep(900, 120);
  }

  function boot(){
    applyLang();
    renderModules();

    const saved = load();
    if(saved && saved.qIndex < ALL_QUESTIONS.length){
      state = saved;
      // restore
      showScreen("test");
      // rehydrate current question
      state.current = ALL_QUESTIONS[state.qIndex] || null;
      // start fresh timer for safety
      if(state.current){
        startQuestion(state.current, true);
      }else{
        showScreen("home");
      }
    }else{
      state = DEFAULT_STATE();
      showScreen("home");
      save();
    }
  }

  boot();
})();
