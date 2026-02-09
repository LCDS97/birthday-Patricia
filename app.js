// =====================
// GLOBAL SAFETY + LOGS
// =====================
window.addEventListener("error", (e) => {
  console.error("[GLOBAL ERROR]", e.message, "at", `${e.filename}:${e.lineno}:${e.colno}`);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("[PROMISE ERROR]", e.reason);
});

console.log("[APP] app.js carregou ✅");

// Helper
const $ = (id) => document.getElementById(id);

// =====================
// ROUTER (3 páginas) + PROGRESSO
// =====================
const ROUTES = { 1: "index.html", 2: "step2.html", 3: "step3.html" };
const STEP = Number(document.body?.dataset?.step || "1");

function getProgress() {
  return {
    step1Done: localStorage.getItem("step1Done") === "1",
    step2Done: localStorage.getItem("step2Done") === "1",
    step3Done: localStorage.getItem("step3Done") === "1",
  };
}

function setDone(n) {
  localStorage.setItem(`step${n}Done`, "1");
  console.log(`[PROGRESS] step${n}Done = 1 ✅`);
}

function goToStep(n) {
  const url = ROUTES[n] || ROUTES[1];
  console.log(`[ROUTER] indo para step ${n} -> ${url}`);
  window.location.href = url;
}

function guard() {
  const p = getProgress();
  console.log("[GUARD] page step =", STEP, "| progress =", p);

  // step1 sempre pode abrir
  if (STEP === 1) return;

  // step2 só se step1Done
  if (STEP === 2 && !p.step1Done) {
    console.warn("[GUARD] step2 bloqueado (step1Done=false) -> voltando step1");
    return goToStep(1);
  }

  // step3 só se step2Done
  if (STEP === 3 && !p.step2Done) {
    console.warn("[GUARD] step3 bloqueado (step2Done=false) -> voltando step2");
    return goToStep(2);
  }
}

guard();

// =====================
// CONFIG (SEU CONTEÚDO)
// =====================
const config = {
  herName: "MEU AMOR",
  photo1: "fotos/Step-Foto1.jpeg",

  // Step2 - blocos do quebra-cabeça
  block1: "./fotos/Step2-Foto1-Bloco1.jpeg",
  block2: "./fotos/Step2-Foto2-Bloco2.jpeg",
  block3: "./fotos/Step2-Foto3-Bloco3.jpeg",

  cap1: "Você é minha paz e minha bagunça boa.<br/>E eu adoro como tudo fica mais leve quando é com você.",

  cap2Lines: [
    "<b>Eu guardo você em detalhes.</b><br/>Nos dias bons, nos dias difíceis, e principalmente nos dias comuns.",
    "<b>Você é minha paz e minha bagunça boa.</b><br/>E eu adoro como tudo fica mais leve quando é com você.",
    "<b>Ela é bravinha, e eu sorrio por isso.</b><br/>Porque é dessa força que vem o cuidado e a vontade de evoluir juntos."
  ],

  letterHTML: `
    <b>Meu amor, feliz aniversário.</b><br/><br/>
    Hoje eu só quero te lembrar do óbvio: você é uma das melhores partes da minha vida.
    Obrigado por existir do seu jeitinho, por me escolher, por me ensinar, por me acalmar e por me fazer querer ser melhor.<br/><br/>
    Eu amo você com calma e com intensidade — e eu quero construir mais e mais momentos com você.<br/><br/>
    <div class="small">PS: eu te amo. Muito.</div>
  `
};

// =====================
// APPLY CONFIG (onde existir)
// =====================
const herNameEl = $("herName");
if (herNameEl) {
  herNameEl.textContent = config.herName;
  console.log("[CONFIG] herName =", config.herName);
}

function safeSetImg(el, url, fallback) {
  if (!el) {
    console.warn("[IMG] safeSetImg: elemento null, ignorando.");
    return;
  }

  const finalUrl = (url && url.trim() && !url.includes("YOUR-PHOTO-LINK")) ? url : fallback;
  el.src = finalUrl;
  console.log("[IMG] set src ->", finalUrl);
}

// Step1 photo
const photo1El = $("photo1");
if (photo1El) safeSetImg(photo1El, config.photo1, photo1El.src);

// Step1 caption
const cap1El = $("cap1");
if (cap1El) {
  cap1El.innerHTML = config.cap1;
  console.log("[CONFIG] cap1 aplicado ✅");
}

// Step2 captions (overlay)
function renderCap2Lines() {
  const el = $("cap2");
  if (!el) return;

  const lines = (config.cap2Lines && config.cap2Lines.length)
    ? config.cap2Lines
    : ["Escreva aqui suas frases 💛"];

  el.innerHTML = lines
    .map((html, i) => `<div class="capLine ${i === 0 ? "active" : ""}">${html}</div>`)
    .join("");

  console.log("[CONFIG] cap2Lines renderizado ✅ total =", lines.length);
}
renderCap2Lines();

// Debug dos finais (step3)
function setupFinalPhotosDebug() {
  const wrap = document.getElementById("finalPhotos");
  if (!wrap) return;

  const pics = Array.from(wrap.querySelectorAll(".finalPic"));
  console.log("[FINAL] total finalPic =", pics.length);

  pics.forEach((img, i) => {
    img.addEventListener("load", () => console.log(`[FINAL] foto ${i + 1} carregou ✅`, img.src));
    img.addEventListener("error", () => console.error(`[FINAL] foto ${i + 1} ERRO ❌`, img.src));
  });
}
setupFinalPhotosDebug();

// =====================
// STEP 1
// =====================
(function initStep1() {
  const heartField = $("heartField");
  if (!heartField) {
    console.log("[STEP1] não é esta página, pulando init.");
    return;
  }

  console.log("[STEP1] init ✅");

  const pulse = $("pulse");
  const spark = $("spark");
  const reveal1 = $("reveal1");
  const b1 = $("b1");
  const to2 = $("to2");

  const hotspot = { x: 0.72, y: 0.58 };
  const HOT_RADIUS = 52;

  function getLocalPos(ev) {
    const r = heartField.getBoundingClientRect();
    const t = (ev.touches && ev.touches[0]) ? ev.touches[0] : ev;
    const x = t.clientX - r.left;
    const y = t.clientY - r.top;
    return { x, y, w: r.width, h: r.height };
  }

  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  let step1Done = false;

  function updateHeartResponse(pos) {
    const target = { x: hotspot.x * pos.w, y: hotspot.y * pos.h };
    const d = distance(pos, target);

    if (spark) {
      spark.style.left = pos.x + "px";
      spark.style.top = pos.y + "px";
      spark.style.opacity = 0.9;
      clearTimeout(spark._t);
      spark._t = setTimeout(() => spark.style.opacity = 0, 140);
    }

    if (pulse) {
      pulse.style.left = target.x + "px";
      pulse.style.top = target.y + "px";
      if (d < HOT_RADIUS) pulse.classList.add("on");
      else pulse.classList.remove("on");
    }

    return d;
  }

  function completeStep1() {
    console.log("[STEP1] completeStep1 chamado");

    if (step1Done) {
      console.log("[STEP1] já estava concluído");
      return;
    }

    step1Done = true;

    if (reveal1) reveal1.style.display = "block";
    if (b1) b1.innerHTML = "✅ <span class='doneMark'>Aberto</span>";

    if (to2) {
      to2.classList.remove("locked");
      to2.disabled = false;
    }

    setDone(1);

    console.log("[STEP1] concluído ✅ — botão Continuar liberado");
  }

  // Interações
  heartField.addEventListener("touchmove", (e) => {
    if (step1Done) return;
    updateHeartResponse(getLocalPos(e));
  }, { passive: true });

  heartField.addEventListener("mousemove", (e) => {
    if (step1Done) return;
    updateHeartResponse(getLocalPos(e));
  });

  heartField.addEventListener("touchstart", (e) => {
    if (step1Done) return;
    const d = updateHeartResponse(getLocalPos(e));
    if (d < HOT_RADIUS) completeStep1();
  }, { passive: true });

  heartField.addEventListener("click", (e) => {
    if (step1Done) return;
    const d = updateHeartResponse(getLocalPos(e));
    if (d < HOT_RADIUS) completeStep1();
  });

  if (to2) {
    to2.addEventListener("click", () => {
      console.log("[STEP1] clicar continuar -> ir step2");
      goToStep(2);
    });
  }
})();

// =====================
// STEP 2
// =====================
(function initStep2() {
  const board = $("board");
  if (!board) {
    console.log("[STEP2] não é esta página, pulando init.");
    return;
  }

  console.log("[STEP2] init ✅");

  const assembled = $("assembled");
  const b2 = $("b2");
  const to3 = $("to3");
  const pieceEls = [$("p1"), $("p2"), $("p3")].filter(Boolean);

  let step2Done = false;

  // ======= SETTINGS =======
  const DEBUG_STEP2 = false;
  const CLUSTER_FACTOR = 0.10;
  const MIN_OVERLAP_RATIO = 0.04;
  const REQUIRED_TOUCHING_PAIRS = 2;

  function logGroup(title, fn) {
    if (!DEBUG_STEP2) return;
    console.groupCollapsed(title);
    try { fn && fn(); } finally { console.groupEnd(); }
  }

  function fmt(n) { return Number.isFinite(n) ? n.toFixed(1) : String(n); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function getPoint(ev) {
    const t = (ev.touches && ev.touches[0]) ? ev.touches[0] : ev;
    const r = board.getBoundingClientRect();
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }

  function rectInBoard(el) {
    const r = el.getBoundingClientRect();
    const br = board.getBoundingClientRect();
    return {
      left: r.left - br.left,
      top: r.top - br.top,
      right: (r.left - br.left) + r.width,
      bottom: (r.top - br.top) + r.height,
      width: r.width,
      height: r.height
    };
  }

  function centerOf(el) {
    const rr = rectInBoard(el);
    return { x: rr.left + rr.width / 2, y: rr.top + rr.height / 2 };
  }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function overlapArea(r1, r2) {
    const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
    const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
    return xOverlap * yOverlap;
  }

  function overlapRatio(r1, r2) {
    const area = overlapArea(r1, r2);
    const minArea = Math.min(r1.width * r1.height, r2.width * r2.height);
    if (minArea <= 0) return 0;
    return area / minArea;
  }

  // ======= INITIAL LAYOUT + IMAGES =======
  function layoutPieces() {
    const r = board.getBoundingClientRect();
    const placeImages = [config.block1, config.block2, config.block3];
    const starts = [
      { x: 0.10, y: 0.12 },
      { x: 0.62, y: 0.12 },
      { x: 0.36, y: 0.46 }
    ];

    pieceEls.forEach((el, i) => {
      el.style.left = (starts[i].x * r.width) + "px";
      el.style.top = (starts[i].y * r.height) + "px";

      el.style.backgroundImage = `url(${placeImages[i]})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.backgroundRepeat = "no-repeat";
    });

    console.log("[STEP2] layoutPieces ✅");
  }

  window.addEventListener("resize", () => { if (!step2Done) layoutPieces(); });
  layoutPieces();

  // ======= DRAG =======
  let drag = null;

  function startDrag(el, ev) {
    if (step2Done) return;
    const p = getPoint(ev);

    drag = {
      el,
      offX: p.x - el.offsetLeft,
      offY: p.y - el.offsetTop,
    };

    el.style.zIndex = 10;

    logGroup(`🟦 STEP2 startDrag ${el.id}`, () => {
      console.log("start left/top:", fmt(el.offsetLeft), fmt(el.offsetTop));
    });
  }

  function moveDrag(ev) {
    if (!drag || step2Done) return;

    const p = getPoint(ev);
    const br = board.getBoundingClientRect();
    const w = drag.el.getBoundingClientRect().width;
    const h = drag.el.getBoundingClientRect().height;

    const left = clamp(p.x - drag.offX, 0, br.width - w);
    const top = clamp(p.y - drag.offY, 0, br.height - h);

    drag.el.style.left = left + "px";
    drag.el.style.top = top + "px";
  }

  function endDrag() {
    if (!drag || step2Done) return;
    drag.el.style.zIndex = 1;
    drag = null;
    checkClusterAndUnlock();
  }

  pieceEls.forEach(el => {
    el.addEventListener("touchstart", (e) => startDrag(el, e), { passive: true });
    el.addEventListener("mousedown", (e) => startDrag(el, e));
  });
  board.addEventListener("touchmove", (e) => moveDrag(e), { passive: true });
  board.addEventListener("mousemove", (e) => moveDrag(e));
  board.addEventListener("touchend", () => endDrag(), { passive: true });
  board.addEventListener("mouseup", () => endDrag());
  board.addEventListener("mouseleave", () => endDrag());

  // ======= SEQUÊNCIA DE FOTOS STEP2 =======
  let photo2Timer = null;
  let cap2Timer = null;
  let photo2Index = 0;
  let cap2Index = 0;

  function startStep2PhotoSequence() {
    const seq = document.getElementById("photo2Seq");
    const cap = document.getElementById("cap2");
    if (!seq) return;

    const imgs = Array.from(seq.querySelectorAll("img"));
    const lines = cap ? Array.from(cap.querySelectorAll(".capLine")) : [];

    console.log("[STEP2] startStep2PhotoSequence imgs =", imgs.length, "| lines =", lines.length);

    if (imgs.length <= 1) return;

    if (photo2Timer) clearInterval(photo2Timer);
    if (cap2Timer) clearInterval(cap2Timer);

    function setActivePhoto(i) {
      imgs.forEach((img, idx) => img.classList.toggle("active", idx === i));
    }

    function setActiveCaption(i) {
      if (!lines.length) return;
      lines.forEach((ln, idx) => ln.classList.toggle("active", idx === i));
    }

    photo2Index = 0;
    cap2Index = 0;
    setActivePhoto(photo2Index);
    setActiveCaption(cap2Index);

    photo2Timer = setInterval(() => {
      photo2Index = (photo2Index + 1) % imgs.length;
      setActivePhoto(photo2Index);
    }, 2500);

    if (lines.length > 1) {
      cap2Timer = setInterval(() => {
        cap2Index = (cap2Index + 1) % lines.length;
        setActiveCaption(cap2Index);
      }, 6000);
    }

    seq.onclick = () => {
      photo2Index = (photo2Index + 1) % imgs.length;
      setActivePhoto(photo2Index);
    };
  }

  // ======= CLUSTER + CONTACT CHECK =======
  function checkClusterAndUnlock() {
    const active = pieceEls.filter(el => el.style.display !== "none");
    if (active.length < 3) return;

    const centers = active.map(centerOf);
    const r0 = rectInBoard(active[0]);
    const pieceW = r0.width;

    const d01 = dist(centers[0], centers[1]);
    const d02 = dist(centers[0], centers[2]);
    const d12 = dist(centers[1], centers[2]);
    const maxDist = Math.max(d01, d02, d12);

    const CLUSTER_DIST = pieceW * CLUSTER_FACTOR;

    const rects = active.map(rectInBoard);
    const o01 = overlapRatio(rects[0], rects[1]);
    const o02 = overlapRatio(rects[0], rects[2]);
    const o12 = overlapRatio(rects[1], rects[2]);

    const touchingPairs = [
      o01 >= MIN_OVERLAP_RATIO,
      o02 >= MIN_OVERLAP_RATIO,
      o12 >= MIN_OVERLAP_RATIO
    ].filter(Boolean).length;

    const clusterOk = maxDist <= CLUSTER_DIST;
    const touchOk = touchingPairs >= REQUIRED_TOUCHING_PAIRS;

    logGroup("🔍 STEP2 checkClusterAndUnlock()", () => {
      console.log("maxDist:", fmt(maxDist), "clusterDist:", fmt(CLUSTER_DIST), "clusterOk:", clusterOk);
      console.log("overlap:", fmt(o01), fmt(o02), fmt(o12), "touchingPairs:", touchingPairs, "touchOk:", touchOk);
    });

    if (clusterOk && touchOk) unlockStep2();
  }

  function unlockStep2() {
    console.log("[STEP2] unlockStep2 chamado");

    if (step2Done) return;
    step2Done = true;

    if (assembled) assembled.style.display = "block";
    startStep2PhotoSequence();
    pieceEls.forEach(el => el.style.display = "none");

    if (b2) b2.innerHTML = "✅ <span class='doneMark'>Aberto</span>";

    if (to3) {
      to3.classList.remove("locked");
      to3.disabled = false;
    }

    setDone(2);

    console.log("[STEP2] concluído ✅ — botão Ir pro último liberado");
  }

  if (to3) {
    to3.addEventListener("click", () => {
      console.log("[STEP2] clicar -> ir step3");
      goToStep(3);
    });
  }
})();

// =====================
// STEP 3
// =====================
(function initStep3() {
  const holdBtn = $("holdBtn");
  if (!holdBtn) {
    console.log("[STEP3] não é esta página, pulando init.");
    return;
  }

  console.log("[STEP3] init ✅");

  const bar = $("bar");
  const holdText = $("holdText");
  const final = $("final");
  const b3 = $("b3");

  const HOLD_MS = 3200;
  let holding = false;
  let t0 = 0;
  let raf = null;
  let step3Done = false;

  function tick() {
    if (!holding) return;

    const now = performance.now();
    const p = Math.min(1, (now - t0) / HOLD_MS);

    if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
    if (holdText) holdText.textContent = p < 1 ? "Segura só mais um pouco…" : "Abrindo…";

    if (p >= 1) {
      completeStep3();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function startHold() {
    if (step3Done) return;
    holding = true;
    t0 = performance.now();
    if (bar) bar.style.width = "0%";
    if (holdText) holdText.textContent = "Segura… 💛";
    raf = requestAnimationFrame(tick);
  }

  function cancelHold() {
    if (step3Done) return;
    holding = false;
    if (raf) cancelAnimationFrame(raf);
    if (bar) bar.style.width = "0%";
    if (holdText) holdText.textContent = "Pressione e segure 💛";
  }

  // Typewriter (mantém seus logs)
  function typeHTML(el, html, { speed = 18, pauseDot = 240, pauseComma = 120 } = {}) {
    console.log("[TYPE] start typeHTML");
    console.log("[TYPE] target element:", el);
    console.log("[TYPE] html length:", html?.length);

    if (!el) {
      console.error("[TYPE] ERRO: elemento alvo não existe");
      return;
    }
    if (!html) {
      console.error("[TYPE] ERRO: html vazio ou undefined");
      return;
    }

    let i = 0;
    el.innerHTML = "";

    function step() {
      if (i >= html.length) {
        console.log("[TYPE] typing finished");
        return;
      }

      if (html[i] === "<") {
        const end = html.indexOf(">", i);
        if (end === -1) return;

        el.innerHTML += html.slice(i, end + 1);
        i = end + 1;
        return setTimeout(step, 0);
      }

      const ch = html[i];
      el.innerHTML += ch;
      i++;

      let extra = 0;
      if (ch === "." || ch === "!" || ch === "?") extra = pauseDot;
      else if (ch === "," || ch === ";") extra = pauseComma;

      setTimeout(step, speed + extra);
    }

    step();
  }

  // Fotos finais com clique (com z-index e object-position por data-pos)
  let finalPhotoIndex = 0;

  function startFinalPhotoSequence() {
    console.log("[FINAL] startFinalPhotoSequence() chamado");

    const wrap = document.getElementById("finalPhotos");
    if (!wrap) {
      console.warn("[FINAL] ERRO: #finalPhotos não existe");
      return;
    }

    const pics = Array.from(wrap.querySelectorAll(".finalPic"));
    console.log("[FINAL] fotos encontradas:", pics.length);

    if (pics.length === 0) {
      console.warn("[FINAL] ERRO: nenhuma .finalPic dentro de #finalPhotos");
      return;
    }

    function setActive(i) {
      const safeIndex = ((i % pics.length) + pics.length) % pics.length;
      const activePic = pics[safeIndex];

      const pos = activePic?.dataset?.pos || "center center";
      const anim = activePic?.dataset?.anim || "none";

      pics.forEach((img, idx) => {
        const isActive = idx === safeIndex;
        img.classList.toggle("active", isActive);

        // garante ordem correta
        img.style.zIndex = isActive ? "5" : "1";

        // aplica object-position apenas na ativa
        if (isActive) img.style.objectPosition = pos;
      });

      finalPhotoIndex = safeIndex;
      console.log("[FINAL] active =", safeIndex, "| anim =", anim, "| pos =", pos);
    }

    finalPhotoIndex = 0;
    setActive(finalPhotoIndex);

    // evita acumular handlers
    wrap.onclick = null;

    wrap.onclick = () => {
      const next = (finalPhotoIndex + 1) % pics.length;
      console.log("[FINAL] clique -> next =", next);
      setActive(next);
      if (navigator.vibrate) navigator.vibrate(12);
    };

    console.log("[FINAL] clique configurado ✅");
  }

  function completeStep3() {
    console.log("[STEP3] completeStep3 chamado");

    if (step3Done) {
      console.log("[STEP3] já estava concluído");
      return;
    }

    step3Done = true;
    holding = false;
    if (raf) cancelAnimationFrame(raf);

    if (bar) bar.style.width = "100%";
    if (holdText) holdText.textContent = "Aberto ✅";
    if (b3) b3.innerHTML = "✅ <span class='doneMark'>Aberto</span>";

    if (!final) {
      console.error("[STEP3] ERRO: #final não existe");
      return;
    }

    final.style.display = "block";
    final.classList.add("open");
    console.log("[STEP3] final.classList =", final.className);

    final.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const typed = document.getElementById("letterTyped");
    const giftRow = document.getElementById("giftRow");

    console.log("[STEP3] letterTyped encontrado?", !!typed);
    console.log("[STEP3] config.letterHTML existe?", !!config.letterHTML);
    console.log("[STEP3] giftRow encontrado?", !!giftRow);

    if (!typed) {
      console.error("[STEP3] ERRO: #letterTyped não existe no DOM");
      return;
    }

    typed.innerHTML = "";
    final.classList.remove("doneTyping");

    console.log("[STEP3] iniciando typewriter...");
    typeHTML(typed, config.letterHTML, {
      speed: 18,
      pauseDot: 260,
      pauseComma: 120
    });

    const approxMs = Math.max(1500, config.letterHTML.length * 18);
    const rewardAt = Math.max(350, approxMs - 150);

    console.log("[STEP3] approxMs =", approxMs, "| rewardAt =", rewardAt);

    // momento reward: aparece foto + pop + habilita clique das fotos
    setTimeout(() => {
      final.classList.add("showPhoto");
      console.log("[STEP3] showPhoto aplicado ✅", final.className);

      startFinalPhotoSequence();

      if (giftRow) {
        giftRow.style.display = "block";
        giftRow.classList.remove("pop");
        void giftRow.offsetWidth;
        giftRow.classList.add("pop");
        console.log("[STEP3] giftRow pop ✅");
      }
    }, rewardAt);

    setTimeout(() => {
      final.classList.add("doneTyping");
      console.log("[STEP3] typing finalizado");
    }, approxMs);

    setDone(3);
    console.log("[STEP3] concluído ✅");

    if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 70]);
  }

  // binds hold
  holdBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startHold(); }, { passive: false });
  holdBtn.addEventListener("touchend", () => cancelHold(), { passive: true });
  holdBtn.addEventListener("touchcancel", () => cancelHold(), { passive: true });
  holdBtn.addEventListener("mousedown", () => startHold());
  window.addEventListener("mouseup", () => cancelHold());
})();
