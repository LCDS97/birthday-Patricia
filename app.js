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
// SFX MANAGER
// =====================
const SFX = (() => {
  const cache = new Map();

  function get(id) {
    if (cache.has(id)) return cache.get(id);
    const el = document.getElementById(id);
    if (el) cache.set(id, el);
    return el;
  }

  async function play(id, { volume = 0.9, restart = true } = {}) {
    const a = get(id);
    if (!a) return;

    try {
      a.volume = volume;
      if (restart) a.currentTime = 0;
      await a.play();
      console.log("[SFX] play", id, "✅");
    } catch (e) {
      // Se travar por política do navegador, só loga.
      console.warn("[SFX] blocked", id, e);
    }
  }

  function stop(id, { reset = true } = {}) {
    const a = get(id);
    if (!a) return;
    try { a.pause(); } catch(e) {}
    if (reset) a.currentTime = 0;
  }

  function stopAll({ reset = true } = {}) {
    cache.forEach((a) => {
      try { a.pause(); } catch(e) {}
      if (reset) a.currentTime = 0;
    });
  }

  // opcional: “armar” sons pra tocar rápido (warm-up)
  function warm(ids = []) {
    ids.forEach((id) => get(id));
  }

  return { play, stop, stopAll, warm };
})();



// =====================
// CONFIG (SEU CONTEÚDO)
// =====================
const config = {
  herName: "MEU AMOR",
  photo1: "fotos/Step1-Foto1.jpeg",

  // Step2 - blocos do quebra-cabeça
  block1: "./fotos/Step2-Foto1-Bloco1.jpeg",
  block2: "./fotos/Step2-Foto2-Bloco2.jpeg",
  block3: "./fotos/Step2-Foto3-Bloco3.jpeg",

  // cap1: "Você é minha paz e minha bagunça boa.<br/>E eu adoro como tudo fica mais leve quando é com você.",

  step1Photos: [
  "./fotos/Step1-Foto1.jpeg",
  "./fotos/Step1-Foto2.jpeg",
  "./fotos/Step1-Foto3.jpeg",
  "./fotos/Step1-Foto4.jpeg",
  "./fotos/Step1-Foto5.jpeg",
  "./fotos/Step1-Foto6.jpeg",
],

cap1Lines: [
  "Sempre que eu olho para você, meu coração lembra que está vivo.",
  "Ele bate mais forte, mas também mais leve, assim como seu sorriso que ilumina até os meus dias mais nublados.",
  "Eu me sinto tão sortudo por ter você ao meu lado, compartilhando risadas, sonhos e até mesmo os momentos silenciosos que dizem tanto sem precisar de palavras."
],

  cap2Lines: [
    "<b>Com você, qualquer lugar vira especial...</b><br/>Seja algo novo ou só um dia comum, eu aproveito sua companhia.",
    "<b>Não importa se é uma aventura que eu nunca vivi...</b><br/>Ou se é só ficar sem fazer nada, com você sempre vale.",
    "<b>Eu amo viver coisas novas com você...</b><br/>E eu também amo viver as mesmas coisas de sempre, porque com você tudo tem um sabor diferente, mais doce, mais leve, mais meu."
  ],

  letterHTML: `
  <b>Meu amor, feliz aniversário.</b><br/><br/>

  Hoje eu só quero te lembrar do óbvio: você é uma das melhores partes da minha vida.<br/>
  Sou uma pessoa muito sortuda por ter você.<br/>
  Alguém que topa dividir sonhos e me faz evoluir todos os dias.<br/><br/>

  Ao seu lado, eu aprendo o que é amar de verdade e valorizar o que importa.<br/>
  Dos nossos passeios de bike até a comida boa depois.<br/>
  De treinar, suar e sofrer juntos.<br/>
  De jogar, rir e competir como crianças.<br/><br/>

  Nos melhores e piores momentos da minha vida, é em você que eu encontro luz.<br/>
  Um conforto surreal, como eu nunca senti antes.<br/><br/>

  Obrigado por existir do seu jeitinho.<br/>
  Por me escolher, por me ensinar, por me acalmar<br/>
  e por me fazer querer ser melhor.<br/><br/>

  Eu amo você com calma e com intensidade.<br/>
  E quero construir cada vez mais momentos ao seu lado.<br/><br/>

  Feliz aniversário, meu amor.<br/>
  Que essa dedicatória não consiga expressar nem metade<br/>
  do amor imenso que eu sinto por você.<br/><br/>

  <div class="small">PS: eu te amo. Muito.</div>
  `
};

// =====================
// PROGRESS
// =====================
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

// =====================
// STATE (booleans)
// =====================
const state = {
  introOpen: true,
  step: 1,
  inited: { 1: false, 2: false, 3: false },
};

function canGoToStep(n) {
  const p = getProgress();
  if (n === 2 && !p.step1Done) return 1;
  if (n === 3 && !p.step2Done) return 2;
  return n;
}

function setStep(n) {
  const target = canGoToStep(n);
  if (target !== n) console.warn("[GUARD] bloqueado, redirecionando para", target);

  state.step = target;
  render();
}

function showIntro(open) {
  state.introOpen = !!open;
  render();
}

// =====================
// MUSIC
// =====================
async function tryPlayMusic() {
  const music = $("bg-music");
  if (!music) return;
  if (localStorage.getItem("musicPlaying") !== "true") return;

  music.volume = 0.4;
  try {
    await music.play();
    console.log("[MUSIC] tocando ✅");
  } catch (e) {
    console.log("[MUSIC] bloqueado até interação:", e);
  }
}

// =====================
// APPLY CONFIG (sempre que carregar)
// =====================
function safeSetImg(el, url, fallback) {
  if (!el) return;
  const finalUrl = (url && url.trim() && !url.includes("YOUR-PHOTO-LINK")) ? url : fallback;
  el.src = finalUrl;
}

function renderCap2Lines() {
  const el = $("cap2");
  if (!el) return;

  const lines = (config.cap2Lines && config.cap2Lines.length)
    ? config.cap2Lines
    : ["Escreva aqui suas frases 💛"];

  el.innerHTML = lines
    .map((html, i) => `<div class="capLine ${i === 0 ? "active" : ""}">${html}</div>`)
    .join("");
}

function applyConfig() {
  document.querySelectorAll(".herName").forEach((el) => el.textContent = config.herName);

  const photo1El = $("photo1");
  if (photo1El) safeSetImg(photo1El, config.photo1, photo1El.src);

  // const cap1El = $("cap1");
  // if (cap1El) cap1El.innerHTML = config.cap1;

  renderCap1Lines();
  renderCap2Lines();
  console.log("[CONFIG] aplicado ✅");
}

function renderCap1Lines() {
  const el = $("cap1");
  if (!el) return;

  const lines = config.cap1Lines?.length ? config.cap1Lines : [config.cap1 || ""];
  el.innerHTML = lines
    .map((html) => `<div class="capLine">${html}</div>`)
    .join("");
}

renderCap1Lines();


// =====================
// RENDER (mostra/esconde views)
// =====================
function render() {
  const overlay = $("introOverlay");
  const view1 = $("view-step1");
  const view2 = $("view-step2");
  const view3 = $("view-step3");

  if (overlay) overlay.style.display = state.introOpen ? "flex" : "none";
  document.body.classList.toggle("intro-locked", state.introOpen);

  if (view1) view1.classList.toggle("hidden", state.step !== 1);
  if (view2) view2.classList.toggle("hidden", state.step !== 2);
  if (view3) view3.classList.toggle("hidden", state.step !== 3);

  document.body.dataset.step = String(state.step);

  // init do step quando ele aparece
  if (!state.inited[state.step]) {
    if (state.step === 1) initStep1();
    if (state.step === 2) initStep2();
    if (state.step === 3) initStep3();
    state.inited[state.step] = true;
  }

  // Step2: relayout só depois de visível (senão width=0)
  if (state.step === 2 && typeof window.__step2Relayout === "function") {
    requestAnimationFrame(() => requestAnimationFrame(() => window.__step2Relayout()));
  }

  // tenta manter música viva
  tryPlayMusic();
}

// function restartExperience() {
//   // 1) ✅ para timers / handlers do step2 antes de limpar tudo
//   if (window.__step2Cleanup) {
//     try { window.__step2Cleanup(); } catch (e) { console.warn("[RESTART] step2 cleanup falhou", e); }
//   }

//   // 2) ✅ para música
//   const music = document.getElementById("bg-music");
//   if (music) {
//     try { music.pause(); } catch(e) {}
//     music.currentTime = 0;
//   }

//   // 3) ✅ limpa localStorage
//   STORAGE_KEYS.forEach(k => localStorage.removeItem(k));

//   // 4) ✅ reseta state / reinits
//   state.introOpen = true;
//   state.step = 1;
//   state.inited = { 1:false, 2:false, 3:false };

//   render();

//   console.log("[RESTART] experiência reiniciada ✅");
// }

function restartExperience() {
  // 1) cleanup step2 (timers/onclick)
  window.__step2Cleanup?.();
  SFX.stopAll();

  // 2) parar música
  const music = document.getElementById("bg-music");
  if (music) {
    try { music.pause(); } catch(e) {}
    music.currentTime = 0;
  }

  // 3) limpar storage
  STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
  console.log("[RESTART] storage limpo ✅");

  // 4) reload (zera DOM e respeita ordem sempre)
  window.location.reload();
}



// =====================
// BOOT
// =====================

const STORAGE_KEYS = [
  "musicPlaying",
  "step1Done",
  "step2Done",
  "step3Done"
];

// sempre limpar quando abrir o site (modo “sempre novo”)
function resetAllStorage() {
  STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
  console.log("[RESET] localStorage limpo ✅");
}
resetAllStorage();


document.addEventListener("DOMContentLoaded", () => {
  console.log("[APP] DOM pronto ✅");

  applyConfig();

  // Intro handlers
  const overlay = $("introOverlay");
  const startBtn = $("startBtn");
  const noMusicBtn = $("noMusicBtn");

  if (startBtn && noMusicBtn && overlay) {
    startBtn.addEventListener("click", async () => {
      localStorage.setItem("musicPlaying", "true");
      SFX.play("sfx-heart", { volume: 0.9, restart: true });

      await tryPlayMusic();
      showIntro(false);
    });

    noMusicBtn.addEventListener("click", () => {
      localStorage.setItem("musicPlaying", "false");
      SFX.play("sfx-heart", { volume: 0.9, restart: true });

      showIntro(false);
    });
  }

  // start
  state.step = 1;
  state.introOpen = true;
  render();
});

// =====================
// STEP 1 (SEU CÓDIGO)
// =====================

let step1PhotoTimer = null;
let step1PhotoIndex = 0;

function startStep1PhotoSequence() {
  const seq = document.getElementById("step1Seq");
  const cap = document.getElementById("cap1");
  if (!seq || !cap) return;

  const imgs = Array.from(seq.querySelectorAll("img"));
  const lines = Array.from(cap.querySelectorAll(".capLine"));
  if (imgs.length < 2) return;

  const PHOTO_MS = 2500;

  function setActivePhoto(i) {
    imgs.forEach((img, idx) => img.classList.toggle("active", idx === i));
  }

  function revealLine(i) {
    if (!lines[i]) return;
    // ✅ garante que a transição vai disparar mesmo na primeira vez
    requestAnimationFrame(() => lines[i].classList.add("shown"));
  }

  // estado inicial
  lines.forEach(l => l.classList.remove("shown")); // <- importante
  setActivePhoto(0);

  // força reflow antes do fade
  void cap.offsetWidth;

  revealLine(0); // ✅ frase 1 agora faz fade-in também

  if (step1PhotoTimer) clearInterval(step1PhotoTimer);

  step1PhotoTimer = setInterval(() => {
    step1PhotoIndex = (step1PhotoIndex + 1) % imgs.length;
    setActivePhoto(step1PhotoIndex);

    if (step1PhotoIndex === 2) revealLine(1); // foto 3
    if (step1PhotoIndex === 4) revealLine(2); // foto 5
  }, PHOTO_MS);
}



function initStep1() {
  const heartField = $("heartField");
  if (!heartField) return;

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

  let step1Done = getProgress().step1Done;

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

  // function completeStep1() {
  //   if (step1Done) return;
  //   step1Done = true;

  //   if (reveal1) reveal1.style.display = "block";
  //   if (b1) b1.innerHTML = "✅ <span class='doneMark'>Aberto</span>";

  //   if (to2) {
  //     to2.classList.remove("locked");
  //     to2.disabled = false;
  //   }

  //   setDone(1);
  //   console.log("[STEP1] concluído ✅");
  // }
  function completeStep1() {
  if (step1Done) return;
  step1Done = true;

  if (reveal1) {
    reveal1.style.display = "block";
    // startStep1PhotoSequence();
    // força reflow pra transição do clip-path pegar sempre
    void reveal1.offsetWidth;

    // abre a máscara
    reveal1.classList.add("revealed");
  }

  // inicia troca das fotos
  startStep1PhotoSequence();

  if (b1) b1.innerHTML = "✅ <span class='doneMark'>Aberto</span>";
  if (to2) { to2.classList.remove("locked"); to2.disabled = false; }

  setDone(1);
}

// let step1PhotoTimer = null;
// let step1PhotoIndex = 0;

// function startStep1PhotoSequence() {
//   const seq = document.getElementById("photo1Seq"); // container das 6 imgs
//   const cap = document.getElementById("cap1");
//   if (!seq || !cap) return;

//   const imgs = Array.from(seq.querySelectorAll("img"));
//   const lines = Array.from(cap.querySelectorAll(".capLine"));

//   if (imgs.length < 2) return;

//   const PHOTO_MS = 2500;

//   function setActivePhoto(i) {
//     imgs.forEach((img, idx) => img.classList.toggle("active", idx === i));
//   }

//   function revealLine(i) {
//     if (lines[i]) lines[i].classList.add("shown");
//   }

//   // estado inicial
//   step1PhotoIndex = 0;
//   setActivePhoto(0);
//   revealLine(0); // frase 1 já fica

//   if (step1PhotoTimer) clearInterval(step1PhotoTimer);

//   step1PhotoTimer = setInterval(() => {
//     step1PhotoIndex = (step1PhotoIndex + 1) % imgs.length;
//     setActivePhoto(step1PhotoIndex);

//     // a cada 2 fotos, revela mais uma frase (2->linha2, 4->linha3)
//     if (step1PhotoIndex === 2) revealLine(1); // foto 3
//     if (step1PhotoIndex === 4) revealLine(2); // foto 5
//   }, PHOTO_MS);
// }


  // se já estava feito, re-hidrata UI
  if (step1Done) {
    if (reveal1) reveal1.style.display = "block";
    if (b1) b1.innerHTML = "✅ <span class='doneMark'>Aberto</span>";
    if (to2) { to2.classList.remove("locked"); to2.disabled = false; }
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
      console.log("[STEP1] ir step2");
      setStep(2);
    });
  }
}

// =====================
// STEP 2 (SEU CÓDIGO com relayout)
// =====================
function initStep2() {
  const board = $("board");
  if (!board) return;

  console.log("[STEP2] init ✅");

  const assembled = $("assembled");
  const b2 = $("b2");
  const to3 = $("to3");
  const pieceEls = [$("p1"), $("p2"), $("p3")].filter(Boolean);

  let step2Done = getProgress().step2Done;

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

  function layoutPieces() {
    const r = board.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) {
      console.log("[STEP2] board sem tamanho (provavelmente hidden). aguardando...");
      return;
    }

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
      el.style.display = step2Done ? "none" : "block";
    });

    if (assembled) assembled.style.display = step2Done ? "block" : "none";

    console.log("[STEP2] layoutPieces ✅", "| done =", step2Done);
  }

  // expõe pro render() chamar quando step2 ficar visível
  window.__step2Relayout = () => { if (!step2Done) layoutPieces(); else layoutPieces(); };

  window.addEventListener("resize", () => { layoutPieces(); });

  // ======= DRAG =======
  let drag = null;

  function startDrag(el, ev) {
    if (step2Done) return;
    const p = getPoint(ev);
    drag = { el, offX: p.x - el.offsetLeft, offY: p.y - el.offsetTop };
    el.style.zIndex = 10;
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

//   function startStep2PhotoSequence() {
//   const seq = $("photo2Seq");
//   const cap = $("cap2");
//   if (!seq) return;

//   const imgs = Array.from(seq.querySelectorAll("img"));
//   const lines = cap ? Array.from(cap.querySelectorAll(".capLine")) : [];

//   if (imgs.length <= 1) return;

//   // ✅ limpa timers antigos (se já existiam)
//   if (photo2Timer) clearInterval(photo2Timer);
//   if (cap2Timer) clearInterval(cap2Timer);
//   photo2Timer = null;
//   cap2Timer = null;

//   function setActivePhoto(i) {
//     imgs.forEach((img, idx) => img.classList.toggle("active", idx === i));
//   }

//   function setActiveCaption(i) {
//     if (!lines.length) return;
//     lines.forEach((ln, idx) => ln.classList.toggle("active", idx === i));
//   }

//   // ✅ reset índices
//   photo2Index = 0;
//   cap2Index = 0;
//   setActivePhoto(photo2Index);
//   setActiveCaption(cap2Index);

//   // ✅ timers
//   photo2Timer = setInterval(() => {
//     photo2Index = (photo2Index + 1) % imgs.length;
//     setActivePhoto(photo2Index);
//   }, 2500);

//   if (lines.length > 1) {
//     cap2Timer = setInterval(() => {
//       cap2Index = (cap2Index + 1) % lines.length;
//       setActiveCaption(cap2Index);
//     }, 6000);
//   }

//   // ✅ não acumular clique
//   seq.onclick = null;
//   seq.onclick = () => {
//     photo2Index = (photo2Index + 1) % imgs.length;
//     setActivePhoto(photo2Index);
//   };

//   // ✅ expõe cleanup pro restart / troca de tela
//   window.__step2Cleanup = () => {
//     if (photo2Timer) clearInterval(photo2Timer);
//     if (cap2Timer) clearInterval(cap2Timer);
//     photo2Timer = null;
//     cap2Timer = null;
//     seq.onclick = null;
//     console.log("[STEP2] cleanup sequence ✅");
//   };
// }
function startStep2PhotoSequence() {
  const seq = $("photo2Seq");
  const cap = $("cap2");
  if (!seq) return;

  const imgs = Array.from(seq.querySelectorAll("img"));
  const lines = cap ? Array.from(cap.querySelectorAll(".capLine")) : [];
  if (imgs.length <= 1) return;

  if (photo2Timer) clearInterval(photo2Timer);

  function setActivePhoto(i) {
    imgs.forEach((img, idx) => img.classList.toggle("active", idx === i));
  }

  function setActiveCaptionByPhotoIndex(photoIndex) {
    if (!lines.length) return;
    const captionIndex = Math.min(lines.length - 1, Math.floor(photoIndex / 2));
    lines.forEach((ln, idx) => ln.classList.toggle("active", idx === captionIndex));
  }

  // ✅ PRIMEIRO FRAME FORÇADO (foto 1 + frase 1)
  photo2Index = 0;
  setActivePhoto(0);
  setActiveCaptionByPhotoIndex(0);

  const PHOTO_MS = 2500;

  photo2Timer = setInterval(() => {
    photo2Index = (photo2Index + 1) % imgs.length;
    setActivePhoto(photo2Index);
    setActiveCaptionByPhotoIndex(photo2Index);
  }, PHOTO_MS);

  // se você NÃO quer clique opcional:
  seq.onclick = null;
}




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

    const touchingPairs = [o01 >= MIN_OVERLAP_RATIO, o02 >= MIN_OVERLAP_RATIO, o12 >= MIN_OVERLAP_RATIO]
      .filter(Boolean).length;

    const clusterOk = maxDist <= CLUSTER_DIST;
    const touchOk = touchingPairs >= REQUIRED_TOUCHING_PAIRS;

    logGroup("🔍 STEP2 check", () => {
      console.log("maxDist:", fmt(maxDist), "clusterDist:", fmt(CLUSTER_DIST), "clusterOk:", clusterOk);
      console.log("overlap:", fmt(o01), fmt(o02), fmt(o12), "touchPairs:", touchingPairs, "touchOk:", touchOk);
    });

    if (clusterOk && touchOk) unlockStep2();
  }

function unlockStep2() {
  if (step2Done) return;
  step2Done = true;

  pieceEls.forEach(el => el.style.display = "none");

  if (assembled) {
    assembled.style.display = "block";

    // trava fotos + frases
    assembled.classList.add("preReveal");

    // toca sfx
    SFX.play("sfx-unlock", { volume: 0.9, restart: true });

    // flash
    assembled.classList.remove("revealing");
    void assembled.offsetWidth;
    assembled.classList.add("revealing");

    const REVEAL_MS = 650;
    setTimeout(() => {
      // libera fotos + frase (e já seta foto 1 + frase 1 dentro da função)
      assembled.classList.remove("preReveal");
      startStep2PhotoSequence();
    }, REVEAL_MS);
  }

  if (b2) b2.innerHTML = "✅ <span class='doneMark'>Aberto</span>";
  if (to3) { to3.classList.remove("locked"); to3.disabled = false; }

  setDone(2);
}


  // re-hidrata se já estava feito
  if (step2Done) {
    if (assembled) assembled.style.display = "block";
    startStep2PhotoSequence();
    if (b2) b2.innerHTML = "✅ <span class='doneMark'>Aberto</span>";
    if (to3) { to3.classList.remove("locked"); to3.disabled = false; }
    pieceEls.forEach(el => el.style.display = "none");
  }

  if (to3) {
    to3.addEventListener("click", () => {
      console.log("[STEP2] ir step3");
      setStep(3);
    });
  }

  // primeiro layout (pode falhar se view ainda hidden — por isso render chama __step2Relayout)
  layoutPieces();
}

// =====================
// STEP 3 (SEU CÓDIGO)
// =====================
function initStep3() {
  const holdBtn = $("holdBtn");
  if (!holdBtn) return;

  console.log("[STEP3] init ✅");

  const bar = $("bar");
  const holdText = $("holdText");
  const final = $("final");
  const b3 = $("b3");

  const HOLD_MS = 3200;
  let holding = false;
  let t0 = 0;
  let raf = null;
  let step3Done = getProgress().step3Done;

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

function typeHTML(el, html, { speed = 40, pauseDot = 520, pauseComma = 220 } = {}) {
  if (!el || !html) return;

  let i = 0;

  // mantém o cursor dentro do elemento (não usa el.innerHTML = "")
  el.innerHTML = '<span class="cursor" id="cursor">|</span>';

  const getCursor = () => el.querySelector("#cursor");

  function append(chunk) {
    const cursor = getCursor();
    if (cursor) cursor.insertAdjacentHTML("beforebegin", chunk);
    else el.insertAdjacentHTML("beforeend", chunk);
  }

  function step() {
    if (i >= html.length) return;

    // tags HTML
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) return;

      append(html.slice(i, end + 1));  // <-- aqui no lugar de el.innerHTML += ...
      i = end + 1;
      return setTimeout(step, 0);
    }

    const ch = html[i];
    append(ch);                        // <-- aqui no lugar de el.innerHTML += ch
    i++;

    let extra = 0;
    if (ch === "." || ch === "!" || ch === "?") extra = pauseDot;
    else if (ch === "," || ch === ";") extra = pauseComma;

    setTimeout(step, speed + extra);
  }

  step();
}


  let finalPhotoIndex = 0;
  let finalTimer = null;
  const FINAL_INTERVAL = 4500; // 4.5s (ajusta como quiser)


function startFinalPhotoSequence() {
  console.log("[FINAL] autoplay start");

  const wrap = document.getElementById("finalPhotos");
  if (!wrap) return;

  const pics = Array.from(wrap.querySelectorAll(".finalPic"));
  if (!pics.length) return;

  function setActive(i) {
    const safe = ((i % pics.length) + pics.length) % pics.length;
    const activePic = pics[safe];

    const pos = activePic?.dataset?.pos || "center center";

    pics.forEach((img, idx) => {
      const isActive = idx === safe;
      img.classList.toggle("active", isActive);
      img.style.zIndex = isActive ? "5" : "1";
      if (isActive) img.style.objectPosition = pos;
    });

    finalPhotoIndex = safe;
  }

  // começa na primeira
  finalPhotoIndex = 0;
  setActive(finalPhotoIndex);

  // limpa timer anterior (segurança)
  if (finalTimer) clearInterval(finalTimer);

  // autoplay
  finalTimer = setInterval(() => {
    setActive(finalPhotoIndex + 1);
  }, FINAL_INTERVAL);

  // garante que não tem clique
  wrap.onclick = null;
}

  function completeStep3() {
    if (step3Done) return;

    step3Done = true;
    holding = false;
    if (raf) cancelAnimationFrame(raf);

    if (bar) bar.style.width = "100%";
    if (holdText) holdText.textContent = "Aberto ✅";
    if (b3) b3.innerHTML = "✅ <span class='doneMark'>Aberto</span>";

    if (!final) return;

    final.style.display = "block";
    final.classList.add("open");

    SFX.play("sfx-completed", { volume: 0.95, restart: true });
    
    const typed = $("letterTyped");
    const giftRow = $("giftRow");

    const mission = document.getElementById("missionOverlay");
    if (mission) mission.classList.add("show");


    if (typed) {
      typed.innerHTML = '<span class="cursor" id="cursor">|</span>';
      final.classList.remove("doneTyping");
      typeHTML(typed, config.letterHTML, { speed: 26, pauseDot: 420, pauseComma: 180 });

      const TEXT_SPEED = 26; // mantém igual ao speed do typeHTML

      // const approxMs = Math.max(1500, config.letterHTML.length * 18);
      // const rewardAt = Math.max(350, approxMs - 150);
      const approxMs = Math.max(2000, config.letterHTML.length * TEXT_SPEED);

      // quando mostrar a foto: 1.2s depois de começar o texto
      const rewardAt = 2000;

      setTimeout(() => {
        final.classList.add("showPhoto");
        startFinalPhotoSequence();
        if (giftRow) {
          giftRow.style.display = "block";
          giftRow.classList.remove("pop");
          void giftRow.offsetWidth;
          giftRow.classList.add("pop");
        }
      }, rewardAt);

      setTimeout(() => {
        final.classList.add("doneTyping");
      }, approxMs);
    }

    setDone(3);
    console.log("[STEP3] concluído ✅");
    if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 70]);
  }

  // re-hidrata se já estava feito
  if (step3Done) {
    if (final) {
      final.style.display = "block";
      final.classList.add("open", "showPhoto", "doneTyping");
    }
    if (b3) b3.innerHTML = "✅ <span class='doneMark'>Aberto</span>";
    if (holdText) holdText.textContent = "Aberto ✅";
  }

  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) restartBtn.addEventListener("click", restartExperience);


  

  // binds hold
  holdBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startHold(); }, { passive: false });
  holdBtn.addEventListener("touchend", () => cancelHold(), { passive: true });
  holdBtn.addEventListener("touchcancel", () => cancelHold(), { passive: true });
  holdBtn.addEventListener("mousedown", () => startHold());
  window.addEventListener("mouseup", () => cancelHold());
}
