// Question bank (FR/AR). Keep it compact & credible.
// Types: mcq (single choice), memory (special handled), attention (special handled)
const QUESTION_BANK = [
  // LOGIC (6)
  { id:"L1", domain:"logic", time:30, type:"mcq",
    q:{fr:"Trouve le nombre manquant : 2, 6, 12, 20, ?", ar:"أكمل العدد الناقص: 2، 6، 12، 20، ؟"},
    sub:{fr:"Indice : on ajoute des nombres impairs successifs.", ar:"تلميح: نضيف أعدادًا فردية متتالية."},
    choices:{fr:["28","30","32","34"], ar:["28","30","32","34"]}, answer:0, difficulty:"easy"
  },
  { id:"L2", domain:"logic", time:35, type:"mcq",
    q:{fr:"Quelle suite est correcte ? 1, 1, 2, 3, 5, ?", ar:"ما العدد التالي؟ 1، 1، 2، 3، 5، ؟"},
    sub:{fr:"(Fibonacci)", ar:"(فيبوناتشي)"},
    choices:{fr:["6","7","8","9"], ar:["6","7","8","9"]}, answer:2, difficulty:"easy"
  },
  { id:"L3", domain:"logic", time:40, type:"mcq",
    q:{fr:"Si A=1, B=2, … alors 'CAB' vaut ?", ar:"إذا كان A=1 وB=2 ... فكم تساوي 'CAB'؟"},
    sub:{fr:"Somme des lettres.", ar:"مجموع قيم الحروف."},
    choices:{fr:["4","5","6","7"], ar:["4","5","6","7"]}, answer:1, difficulty:"easy"
  },
  { id:"L4", domain:"logic", time:45, type:"mcq",
    q:{fr:"Quel nombre ne suit pas la règle ? 3, 5, 9, 17, 33", ar:"أي عدد لا يتبع القاعدة؟ 3، 5، 9، 17، 33"},
    sub:{fr:"Tous suivent la même opération sauf un.", ar:"جميعها تتبع نفس العملية ما عدا واحد."},
    choices:{fr:["3","5","9","33"], ar:["3","5","9","33"]}, answer:3, difficulty:"medium"
  },
  { id:"L5", domain:"logic", time:45, type:"mcq",
    q:{fr:"Un code remplace chaque chiffre par son double. 4→8, 7→14. Alors 9→ ?", ar:"ترميز يضاعف كل رقم: 4→8، 7→14. إذًا 9→ ؟"},
    sub:{fr:"Simple.", ar:"بسيط."},
    choices:{fr:["16","17","18","19"], ar:["16","17","18","19"]}, answer:2, difficulty:"easy"
  },
  { id:"L6", domain:"logic", time:55, type:"mcq",
    q:{fr:"Choisis l’affirmation vraie : si x+3=10 alors x=", ar:"اختر العبارة الصحيحة: إذا كان x+3=10 فإن x="},
    sub:{fr:"Algebra basique.", ar:"جبر بسيط."},
    choices:{fr:["6","7","8","9"], ar:["6","7","8","9"]}, answer:1, difficulty:"easy"
  },

  // SPATIAL (4) — text-based rotations (credible but simple)
  { id:"S1", domain:"spatial", time:45, type:"mcq",
    q:{fr:"Quelle lettre reste la même après rotation de 180° ?", ar:"أي حرف يبقى نفسه بعد تدوير 180°؟"},
    sub:{fr:"Pense aux lettres majuscules.", ar:"فكر في الأحرف الكبيرة."},
    choices:{fr:["N","F","L","P"], ar:["N","F","L","P"]}, answer:0, difficulty:"medium"
  },
  { id:"S2", domain:"spatial", time:45, type:"mcq",
    q:{fr:"Quel objet est symétrique (axe vertical) ?", ar:"أي شكل متناظر حول محور عمودي؟"},
    sub:{fr:"Imagine des formes simples.", ar:"تخيل أشكالًا بسيطة."},
    choices:{fr:["Une flèche →","La lettre A","La lettre F","Le chiffre 2"], ar:["سهم →","الحرف A","الحرف F","الرقم 2"]},
    answer:1, difficulty:"easy"
  },
  { id:"S3", domain:"spatial", time:50, type:"mcq",
    q:{fr:"Dans un cube, combien de faces touchent une face donnée ?", ar:"في المكعب، كم وجهًا يلامس وجهًا واحدًا؟"},
    sub:{fr:"Sans compter le face opposée.", ar:"بدون حساب الوجه المقابل."},
    choices:{fr:["2","3","4","5"], ar:["2","3","4","5"]}, answer:2, difficulty:"easy"
  },
  { id:"S4", domain:"spatial", time:55, type:"mcq",
    q:{fr:"Si tu tournes une feuille d’un quart de tour (90°), le haut devient…", ar:"إذا دورت ورقة 90°، فإن الأعلى يصبح…"},
    sub:{fr:"Rotation vers la droite.", ar:"تدوير نحو اليمين."},
    choices:{fr:["La gauche","La droite","Le bas","Ne change pas"], ar:["اليسار","اليمين","الأسفل","لا يتغير"]},
    answer:1, difficulty:"easy"
  },

  // WORKING MEMORY (special)
  { id:"M1", domain:"memory", time:35, type:"memory", mode:"digits_forward", len:6 },
  { id:"M2", domain:"memory", time:40, type:"memory", mode:"digits_backward", len:5 },
  { id:"M3", domain:"memory", time:40, type:"memory", mode:"symbols", len:6 },
  { id:"M4", domain:"memory", time:45, type:"memory", mode:"digits_forward", len:7 },

  // MATH (8)
  { id:"C1", domain:"math", time:15, type:"mcq",
    q:{fr:"12 × 3 = ?", ar:"12 × 3 = ؟"},
    sub:{fr:"", ar:""},
    choices:{fr:["24","36","32","48"], ar:["24","36","32","48"]}, answer:1, difficulty:"easy"
  },
  { id:"C2", domain:"math", time:15, type:"mcq",
    q:{fr:"45 ÷ 5 = ?", ar:"45 ÷ 5 = ؟"},
    choices:{fr:["7","8","9","10"], ar:["7","8","9","10"]}, answer:2, difficulty:"easy"
  },
  { id:"C3", domain:"math", time:18, type:"mcq",
    q:{fr:"19 + 27 = ?", ar:"19 + 27 = ؟"},
    choices:{fr:["44","45","46","47"], ar:["44","45","46","47"]}, answer:2, difficulty:"easy"
  },
  { id:"C4", domain:"math", time:18, type:"mcq",
    q:{fr:"100 − 37 = ?", ar:"100 − 37 = ؟"},
    choices:{fr:["63","67","73","57"], ar:["63","67","73","57"]}, answer:0, difficulty:"easy"
  },
  { id:"C5", domain:"math", time:20, type:"mcq",
    q:{fr:"8² = ?", ar:"8² = ؟"},
    choices:{fr:["64","56","72","60"], ar:["64","56","72","60"]}, answer:0, difficulty:"easy"
  },
  { id:"C6", domain:"math", time:22, type:"mcq",
    q:{fr:"15% de 200 = ?", ar:"15% من 200 = ؟"},
    choices:{fr:["20","25","30","35"], ar:["20","25","30","35"]}, answer:2, difficulty:"medium"
  },
  { id:"C7", domain:"math", time:22, type:"mcq",
    q:{fr:"(6 + 4) × 2 = ?", ar:"(6 + 4) × 2 = ؟"},
    choices:{fr:["16","18","20","22"], ar:["16","18","20","22"]}, answer:2, difficulty:"easy"
  },
  { id:"C8", domain:"math", time:25, type:"mcq",
    q:{fr:"Si 3x = 21 alors x = ?", ar:"إذا كان 3x = 21 فإن x = ؟"},
    choices:{fr:["5","6","7","8"], ar:["5","6","7","8"]}, answer:2, difficulty:"easy"
  },

  // VERBAL (4) — simple analogies
  { id:"V1", domain:"verbal", time:35, type:"mcq",
    q:{fr:"Chat : félin :: chien : ?", ar:"قط : سنوري :: كلب : ؟"},
    sub:{fr:"Relation de catégorie.", ar:"علاقة فئة."},
    choices:{fr:["Canidé","Oiseau","Poisson","Reptile"], ar:["كلبيّات","طائر","سمك","زواحف"]}, answer:0, difficulty:"easy"
  },
  { id:"V2", domain:"verbal", time:40, type:"mcq",
    q:{fr:"Lumière : voir :: son : ?", ar:"ضوء : رؤية :: صوت : ؟"},
    choices:{fr:["Manger","Entendre","Toucher","Dormir"], ar:["أكل","سماع","لمس","نوم"]}, answer:1, difficulty:"easy"
  },
  { id:"V3", domain:"verbal", time:45, type:"mcq",
    q:{fr:"Opposé de 'rare' ?", ar:"عكس كلمة 'نادر'؟"},
    choices:{fr:["Fréquent","Petit","Lourd","Froid"], ar:["متكرر","صغير","ثقيل","بارد"]}, answer:0, difficulty:"easy"
  },
  { id:"V4", domain:"verbal", time:50, type:"mcq",
    q:{fr:"Choisis l’intrus : pomme, banane, carotte, poire", ar:"اختر المختلف: تفاح، موز، جزر، كمثرى"},
    choices:{fr:["pomme","banane","carotte","poire"], ar:["تفاح","موز","جزر","كمثرى"]}, answer:2, difficulty:"easy"
  },

  // ATTENTION (special continuous 2 min)
  { id:"A1", domain:"attention", time:120, type:"attention", target:"●", distractors:["○","◌","◎"], density:0.55 }
];

// Test blueprint
const TEST_FLOW = [
  { domain:"logic", labelKey:"mod_logic", descKey:"mod_logic", count:6 },
  { domain:"spatial", labelKey:"mod_spatial", descKey:"mod_spatial", count:4 },
  { domain:"memory", labelKey:"mod_memory", descKey:"mod_memory", count:4 },
  { domain:"math", labelKey:"mod_math", descKey:"mod_math", count:8 },
  { domain:"verbal", labelKey:"mod_verbal", descKey:"mod_verbal", count:4 },
  { domain:"attention", labelKey:"mod_attention", descKey:"mod_attention", count:1 }
];
