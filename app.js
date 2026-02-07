// ======= CUSTOMIZE HERE =======
const config = {
  herName: "MEU AMOR",
  photo1: "./fotos/Step-Foto1.jpeg",
  photo2: "https://YOUR-PHOTO-LINK-2",
  photo3: "https://YOUR-PHOTO-LINK-3",
  // Photos from the step 2 puzzle
  block1: "./fotos/Step2-Foto1-Bloco1.jpeg",
  block2: "./fotos/Step2-Foto2-Bloco2.jpeg",
  block3: "./fotos/Step2-Foto3-Bloco3.jpeg",
  cap1: "Você é minha paz e minha bagunça boa.<br/>E eu adoro como tudo fica mais leve quando é com você.",
  cap2: "Eu guardo você em detalhes.<br/>Nos dias bons, nos dias difíceis, e principalmente nos dias comuns.",
  letterHTML: `
    <b>Meu amor, feliz aniversário.</b><br/><br/>
    Hoje eu só quero te lembrar do óbvio: você é uma das melhores partes da minha vida.
    Obrigado por existir do seu jeitinho, por me escolher, por me ensinar, por me acalmar e por me fazer querer ser melhor.<br/><br/>
    Eu amo você com calma e com intensidade — e eu quero construir mais e mais momentos com você.<br/><br/>
    <span class="chip">🎁 Seu presente: escreva aqui seu plano (ex: “eu vou te buscar às 19:30…”)</span>
    <div class="small">PS: eu te amo. Muito.</div>
  `
};

const $ = (id) => document.getElementById(id);

// Apply config
$("herName").textContent = config.herName;

const safeSetImg = (el, url, fallback) => {
  if (url && url.trim() && !url.includes("YOUR-PHOTO-LINK")) el.src = url;
  else el.src = fallback;
};

safeSetImg($("photo1"), config.photo1, $("photo1").src);
safeSetImg($("photo2"), config.photo2, $("photo2").src);
safeSetImg($("photo3"), config.photo3, $("photo3").src);

$("cap1").innerHTML = config.cap1;
$("cap2").innerHTML = config.cap2;
$("letter").innerHTML = config.letterHTML;

// ================= STEP 1 =================
const heartField = $("heartField");
const pulse = $("pulse");
const spark = $("spark");
const reveal1 = $("reveal1");
const b1 = $("b1");
const to2 = $("to2");

const hotspot = { x: 0.72, y: 0.58 };
const HOT_RADIUS = 52;

function getLocalPos(ev){
  const r = heartField.getBoundingClientRect();
  const t = (ev.touches && ev.touches[0]) ? ev.touches[0] : ev;
  const x = t.clientX - r.left;
  const y = t.clientY - r.top;
  return { x, y, w:r.width, h:r.height };
}
function distance(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

let step1Done = false;

function updateHeartResponse(pos){
  const target = { x: hotspot.x * pos.w, y: hotspot.y * pos.h };
  const d = distance(pos, target);

  spark.style.left = pos.x + "px";
  spark.style.top  = pos.y + "px";
  spark.style.opacity = 0.9;
  clearTimeout(spark._t);
  spark._t = setTimeout(()=> spark.style.opacity = 0, 140);

  pulse.style.left = target.x + "px";
  pulse.style.top  = target.y + "px";

  if (d < HOT_RADIUS) pulse.classList.add("on");
  else pulse.classList.remove("on");

  return d;
}

function completeStep1(){
  if(step1Done) return;
  step1Done = true;

  reveal1.style.display = "block";
  b1.innerHTML = "✅ <span class='doneMark'>Aberto</span>";
  to2.classList.remove("locked");
  to2.disabled = false;

  $("step2").classList.remove("locked");
  $("step2").setAttribute("aria-disabled","false");
  $("b2").textContent = "🔓 Liberado";
}

heartField.addEventListener("touchmove", (e)=> { if(step1Done) return; updateHeartResponse(getLocalPos(e)); }, {passive:true});
heartField.addEventListener("mousemove", (e)=> { if(step1Done) return; updateHeartResponse(getLocalPos(e)); });

heartField.addEventListener("touchstart", (e)=>{
  if(step1Done) return;
  const d = updateHeartResponse(getLocalPos(e));
  if(d < HOT_RADIUS) completeStep1();
}, {passive:true});

heartField.addEventListener("click", (e)=>{
  if(step1Done) return;
  const d = updateHeartResponse(getLocalPos(e));
  if(d < HOT_RADIUS) completeStep1();
});

to2.addEventListener("click", ()=> {
  document.getElementById("step2").scrollIntoView({behavior:"smooth", block:"start"});
});

// ================= STEP 2 (CLUSTER MODE) =================
// ================= STEP 2 (SNAP MODE + DEBUG) =================
// ================= STEP 2 (CLUSTER + REAL CONTACT + DEBUG) =================
const board = $("board");
const assembled = $("assembled");
const b2 = $("b2");
const to3 = $("to3");
const pieceEls = [ $("p1"), $("p2"), $("p3") ];

let step2Done = false;

// ======= SETTINGS =======
const DEBUG_STEP2 = false;

// distância máxima (entre centros) para considerar "juntos"
const CLUSTER_FACTOR = 0.10; // menor = precisa ficar mais colado | 0.55-0.65 bom

// contato real: quanto de overlap (interseção) mínima entre pares
// 0.02 = 2% de área do menor retângulo (bem leve), 0.05 = mais exigente
const MIN_OVERLAP_RATIO = 0.04;

// quantos pares precisam ter contato real
// 2 = suficiente para formar um "cluster" (A encosta B e B encosta C)
// 3 = todos encostam em todos (muito difícil)
const REQUIRED_TOUCHING_PAIRS = 2;

// ======= DEBUG HELPERS =======
function logGroup(title, fn){
  if(!DEBUG_STEP2) return;
  console.groupCollapsed(title);
  try { fn && fn(); } finally { console.groupEnd(); }
}
function fmt(n){ return Number.isFinite(n) ? n.toFixed(1) : String(n); }
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function getPoint(ev){
  const t = (ev.touches && ev.touches[0]) ? ev.touches[0] : ev;
  const r = board.getBoundingClientRect();
  return { x: t.clientX - r.left, y: t.clientY - r.top };
}

function rectInBoard(el){
  const r = el.getBoundingClientRect();
  const br = board.getBoundingClientRect();
  return {
    left: r.left - br.left,
    top:  r.top  - br.top,
    right: (r.left - br.left) + r.width,
    bottom:(r.top  - br.top) + r.height,
    width: r.width,
    height: r.height
  };
}

function centerOf(el){
  const rr = rectInBoard(el);
  return { x: rr.left + rr.width/2, y: rr.top + rr.height/2 };
}

function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

function overlapArea(r1, r2){
  const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
  const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
  return xOverlap * yOverlap;
}

function overlapRatio(r1, r2){
  const area = overlapArea(r1, r2);
  const minArea = Math.min(r1.width*r1.height, r2.width*r2.height);
  if(minArea <= 0) return 0;
  return area / minArea;
}

// ======= OPTIONAL DEBUG: draw cluster circle =======
function ensureDebugOverlay(){
  if(!DEBUG_STEP2) return null;
  let el = document.getElementById("clusterDebug");
  if(el) return el;

  el = document.createElement("div");
  el.id = "clusterDebug";
  el.style.position = "absolute";
  el.style.inset = "0";
  el.style.pointerEvents = "none";
  el.style.zIndex = "2";
  board.appendChild(el);

  const ring = document.createElement("div");
  ring.id = "clusterRing";
  ring.style.position = "absolute";
  ring.style.borderRadius = "999px";
  ring.style.border = "2px dashed rgba(255,255,255,.20)";
  ring.style.boxShadow = "0 0 0 10px rgba(124,247,255,.06)";
  ring.style.display = "none";
  el.appendChild(ring);

  return el;
}

function drawClusterRing(cx, cy, radius){
  if(!DEBUG_STEP2) return;
  ensureDebugOverlay();
  const ring = document.getElementById("clusterRing");
  if(!ring) return;

  ring.style.display = "block";
  ring.style.left = (cx - radius) + "px";
  ring.style.top  = (cy - radius) + "px";
  ring.style.width = (radius*2) + "px";
  ring.style.height = (radius*2) + "px";
}

// ======= INITIAL LAYOUT + IMAGES =======
function layoutPieces(){
  const r = board.getBoundingClientRect();
  const placeImages = [config.block1, config.block2, config.block3];

  // posição inicial (coloca a peça 3 mais pra cima pra aparecer melhor)
  const starts = [
    { x: 0.10, y: 0.12 },
    { x: 0.62, y: 0.12 },
    { x: 0.36, y: 0.46 } // <— sobe a peça 3
  ];

  pieceEls.forEach((el,i)=>{
    el.style.left = (starts[i].x * r.width) + "px";
    el.style.top  = (starts[i].y * r.height) + "px";

    el.style.backgroundImage = `url(${placeImages[i]})`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.style.backgroundRepeat = "no-repeat";

    el.dataset.touched = "false";
    el.classList.remove("touched");
  });

  if(DEBUG_STEP2){
    logGroup("🧩 STEP2 layoutPieces()", () => {
      console.log("board:", fmt(r.width), "x", fmt(r.height));
      console.log("images:", placeImages);
    });
  }
}

window.addEventListener("resize", ()=> { if(!step2Done) layoutPieces(); });
layoutPieces();

// ======= DRAG =======
let drag = null;

function startDrag(el, ev){
  if(step2Done) return;
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

function moveDrag(ev){
  if(!drag || step2Done) return;

  const p = getPoint(ev);
  const br = board.getBoundingClientRect();
  const w = drag.el.getBoundingClientRect().width;
  const h = drag.el.getBoundingClientRect().height;

  const left = clamp(p.x - drag.offX, 0, br.width - w);
  const top  = clamp(p.y - drag.offY, 0, br.height - h);

  drag.el.style.left = left + "px";
  drag.el.style.top  = top + "px";
}

function endDrag(){
  if(!drag || step2Done) return;

  drag.el.style.zIndex = 1;
  drag = null;

  checkClusterAndUnlock();
}

// Bind drag events
pieceEls.forEach(el=>{
  el.addEventListener("touchstart", (e)=> startDrag(el,e), {passive:true});
  el.addEventListener("mousedown", (e)=> startDrag(el,e));
});
board.addEventListener("touchmove", (e)=> moveDrag(e), {passive:true});
board.addEventListener("mousemove", (e)=> moveDrag(e));
board.addEventListener("touchend", ()=> endDrag(), {passive:true});
board.addEventListener("mouseup", ()=> endDrag());
board.addEventListener("mouseleave", ()=> endDrag());

// ======= CLUSTER + CONTACT CHECK =======
function checkClusterAndUnlock(){
  const active = pieceEls.filter(el => el.style.display !== "none");
  if(active.length < 3) return;

  const centers = active.map(centerOf);
  const r0 = rectInBoard(active[0]);
  const pieceW = r0.width;

  const d01 = dist(centers[0], centers[1]);
  const d02 = dist(centers[0], centers[2]);
  const d12 = dist(centers[1], centers[2]);
  const maxDist = Math.max(d01, d02, d12);

  const CLUSTER_DIST = pieceW * CLUSTER_FACTOR;

  // cluster center (debug ring)
  const cx = (centers[0].x + centers[1].x + centers[2].x) / 3;
  const cy = (centers[0].y + centers[1].y + centers[2].y) / 3;
  drawClusterRing(cx, cy, CLUSTER_DIST);

  // contact by overlap
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
    console.log("d01/d02/d12:", fmt(d01), fmt(d02), fmt(d12));
    console.log("maxDist:", fmt(maxDist), "clusterDist:", fmt(CLUSTER_DIST), "clusterOk:", clusterOk);
    console.log("overlap ratios o01/o02/o12:", fmt(o01), fmt(o02), fmt(o12));
    console.log("touchingPairs:", touchingPairs, "required:", REQUIRED_TOUCHING_PAIRS, "touchOk:", touchOk);
  });

  // ✅ only unlock when BOTH are true:
  // - they are close enough as a cluster
  // - there is real contact between at least 2 pairs
  if(clusterOk && touchOk){
    unlockStep2();
  }
}

function unlockStep2(){
  if(step2Done) return;

  step2Done = true;
  assembled.style.display = "block";
  pieceEls.forEach(el => el.style.display = "none");

  b2.innerHTML = "✅ <span class='doneMark'>Aberto</span>";
  to3.classList.remove("locked");
  to3.disabled = false;

  $("step3").classList.remove("locked");
  $("step3").setAttribute("aria-disabled","false");
  $("b3").textContent = "🔓 Liberado";

  if(DEBUG_STEP2){
    console.log("✅ STEP2 UNLOCKED (clusterOk + touchOk)");
  }
}

// ================= STEP 3 =================
const holdBtn = $("holdBtn");
const bar = $("bar");
const holdText = $("holdText");
const final = $("final");
const b3 = $("b3");

const HOLD_MS = 3200;
let holding = false;
let t0 = 0;
let raf = null;
let step3Done = false;

function tick(){
  if(!holding) return;
  const now = performance.now();
  const p = Math.min(1, (now - t0) / HOLD_MS);
  bar.style.width = (p*100).toFixed(1) + "%";
  holdText.textContent = p < 1 ? "Segura só mais um pouco…" : "Abrindo…";
  if(p >= 1){
    completeStep3();
    return;
  }
  raf = requestAnimationFrame(tick);
}

function startHold(){
  if(step3Done) return;
  holding = true;
  t0 = performance.now();
  bar.style.width = "0%";
  holdText.textContent = "Segura… 💛";
  raf = requestAnimationFrame(tick);
}

function cancelHold(){
  if(step3Done) return;
  holding = false;
  cancelAnimationFrame(raf);
  bar.style.width = "0%";
  holdText.textContent = "Pressione e segure 💛";
}

function completeStep3(){
  if(step3Done) return;
  step3Done = true;
  holding = false;
  cancelAnimationFrame(raf);
  bar.style.width = "100%";
  holdText.textContent = "Aberto ✅";
  b3.innerHTML = "✅ <span class='doneMark'>Aberto</span>";
  final.style.display = "block";
  final.scrollIntoView({behavior:"smooth", block:"nearest"});
  if(navigator.vibrate) navigator.vibrate([40,30,40,30,70]);
}

holdBtn.addEventListener("touchstart", (e)=> { e.preventDefault(); startHold(); }, {passive:false});
holdBtn.addEventListener("touchend", ()=> cancelHold(), {passive:true});
holdBtn.addEventListener("touchcancel", ()=> cancelHold(), {passive:true});
holdBtn.addEventListener("mousedown", ()=> startHold());
window.addEventListener("mouseup", ()=> cancelHold());
