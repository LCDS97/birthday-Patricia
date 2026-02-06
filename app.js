// ======= CUSTOMIZE HERE =======
const config = {
  herName: "MEU AMOR",
  photo1: "https://YOUR-PHOTO-LINK-1",
  photo2: "https://YOUR-PHOTO-LINK-2",
  photo3: "https://YOUR-PHOTO-LINK-3",
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
  if (url && url.startsWith("http")) el.src = url;
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
const board = $("board");
const assembled = $("assembled");
const b2 = $("b2");
const to3 = $("to3");
const pieceEls = [ $("p1"), $("p2"), $("p3") ];

let step2Done = false;

const bgUrl = () => $("photo2").src;

function layoutPieces(){
  const r = board.getBoundingClientRect();
  const starts = [
    { x: 0.06, y: 0.08 },
    { x: 0.56, y: 0.08 },
    { x: 0.32, y: 0.64 }
  ];
  pieceEls.forEach((el,i)=>{
    el.style.left = (starts[i].x * r.width) + "px";
    el.style.top  = (starts[i].y * r.height) + "px";

    el.style.backgroundImage = `url(${bgUrl()})`;
    const bx = (i===0? "0%" : i===1? "55%" : "30%");
    const by = (i===0? "10%" : i===1? "20%" : "70%");
    el.style.backgroundPosition = `${bx} ${by}`;
    el.style.backgroundSize = "250% 250%";
  });
}

window.addEventListener("resize", ()=> { if(!step2Done) layoutPieces(); });
layoutPieces();

function getPoint(ev){
  const t = (ev.touches && ev.touches[0]) ? ev.touches[0] : ev;
  const r = board.getBoundingClientRect();
  return { x: t.clientX - r.left, y: t.clientY - r.top };
}

let drag = null;

function startDrag(el, ev){
  if(step2Done) return;
  const p = getPoint(ev);
  const rect = el.getBoundingClientRect();
  const br = board.getBoundingClientRect();
  drag = {
    el,
    offX: p.x - (rect.left - br.left),
    offY: p.y - (rect.top  - br.top),
  };
  el.style.zIndex = 10;
}

function moveDrag(ev){
  if(!drag || step2Done) return;
  const p = getPoint(ev);
  drag.el.style.left = (p.x - drag.offX) + "px";
  drag.el.style.top  = (p.y - drag.offY) + "px";
}

function endDrag(){
  if(!drag || step2Done) return;
  drag.el.style.zIndex = 1;
  drag = null;
  checkAssembleCluster();
}

function centerOf(el){
  const r = el.getBoundingClientRect();
  const br = board.getBoundingClientRect();
  return { x:(r.left-br.left)+(r.width/2), y:(r.top-br.top)+(r.height/2) };
}

function checkAssembleCluster(){
  // If 3 pieces are close to each other -> success
  const active = pieceEls.filter(el => el.style.display !== "none");
  if(active.length < 3) return;

  const c1 = centerOf(active[0]);
  const c2 = centerOf(active[1]);
  const c3 = centerOf(active[2]);

  const dist = (a,b) => Math.hypot(a.x - b.x, a.y - b.y);
  const d12 = dist(c1,c2);
  const d13 = dist(c1,c3);
  const d23 = dist(c2,c3);
  const maxDist = Math.max(d12,d13,d23);

  // Threshold based on piece size (mobile-friendly)
  const pieceW = active[0].getBoundingClientRect().width;
  const CLUSTER_DIST = pieceW * 0.85; // make it easy like your screenshot

  if(maxDist <= CLUSTER_DIST){
    step2Done = true;
    assembled.style.display = "block";
    pieceEls.forEach(el => el.style.display = "none");
    b2.innerHTML = "✅ <span class='doneMark'>Aberto</span>";
    to3.classList.remove("locked");
    to3.disabled = false;

    $("step3").classList.remove("locked");
    $("step3").setAttribute("aria-disabled","false");
    $("b3").textContent = "🔓 Liberado";
  }
}

// Bind drag events
pieceEls.forEach(el=>{
  el.addEventListener("touchstart", (e)=> startDrag(el,e), {passive:true});
  el.addEventListener("mousedown", (e)=> startDrag(el,e));
});
board.addEventListener("touchmove", (e)=> { moveDrag(e); }, {passive:true});
board.addEventListener("mousemove", (e)=> { moveDrag(e); });
board.addEventListener("touchend", ()=> endDrag(), {passive:true});
board.addEventListener("mouseup", ()=> endDrag());
board.addEventListener("mouseleave", ()=> endDrag());

to3.addEventListener("click", ()=> {
  document.getElementById("step3").scrollIntoView({behavior:"smooth", block:"start"});
});

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
