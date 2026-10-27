// ONEWORK — Projects page. Mist tone. Banner: the ribbon tower gathers from scattered pieces (MOTION.md §4) while the
// words keep changing type. Hall: projects on a ring of curved screens that turns with scroll.
import * as THREE from 'three';
import { gsap, ScrollTrigger, motion, STATIC, isSmall, root, setupReveals, onLangChange, onMotionChange, fontsReady } from './site.js';

const animated = () => !STATIC && !motion.calm;
const lang = () => (root.lang === 'zh-Hant' ? 'zh' : 'en');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const C = { teal900: 0x47868d, teal700: 0x5b8f96, teal500: 0x759fa4, teal300: 0x8badb1, teal100: 0x9eb9bd, paper: 0xf2f2f2 };

/* ---------- Projects (from onework.io/projects; images to be provided) ---------- */
// To add a real image later: set img to a path such as '../assets/projects/fm.jpg'.
const PROJECTS = [
  { key: 'fm', tone: '#47868D', img: null, platform: 'fm',
    en: { t: '3D Facility Management', c: 'FM · Facility Management', d: 'Building data from SCADA and gateway systems, managed inside one 3D model.' },
    zh: { t: '3D 設施管理', c: 'FM · 設施管理', d: '把 SCADA 與閘道器系統的建築數據，放進同一個 3D 模型管理。' },
    tags: ['SCADA', 'Gateway', 'BIM'] },
  { key: 'gis-city', tone: '#5B8F96', img: null, platform: 'cim',
    en: { t: '3D GIS City Monitoring', c: 'CIM · Smart City', d: '3D BIM, Cesium and IoT combined to monitor sensors across a whole city.' },
    zh: { t: '3D GIS 城市監控', c: 'CIM · 智慧城市', d: '結合 3D BIM、Cesium 與 IoT，監控整座城市的感測器。' },
    tags: ['GIS', 'Cesium', 'IoT'] },
  { key: 'scan', tone: '#759FA4', img: null, platform: 'cim',
    en: { t: 'AI 3D Scanning', c: 'Reality Capture', d: 'Drones and 3D scanners turn real sites into measurable models.' },
    zh: { t: 'AI 3D 掃描', c: '實景擷取', d: '用無人機與 3D 掃描設備，把真實現場變成可量測的模型。' },
    tags: ['Drone', '3D Scan', 'AI'] },
  { key: 'disaster', tone: '#3D3D3D', img: null, platform: 'cim',
    en: { t: 'Post-disaster 3D Reconstruction', c: 'Reality Capture', d: 'AI 3D scanning applied to rebuilding damaged sites as accurate models.' },
    zh: { t: '災後 3D 重建', c: '實景擷取', d: '以 AI 3D 掃描，把受損現場重建成精確模型。' },
    tags: ['Drone', '3D Scan', 'AI'] },
  { key: 'lifecycle', tone: '#5B8F96', img: null, platform: 'airhub',
    en: { t: 'Construction Lifecycle', c: 'Airhub · BIM + PLM', d: 'Airhub SaaS lets every party of a construction project co-work online.' },
    zh: { t: '營建全生命週期', c: 'Airhub · BIM + PLM', d: 'Airhub SaaS 讓營建專案的所有參與者在線上協作。' },
    tags: ['Airhub', 'BIM', 'PLM'] },
  { key: 'terrain', tone: '#47868D', img: null, platform: 'cim',
    en: { t: 'GIS Terrain Analysis', c: 'CIM · Airport', d: 'A GIS web tool for airport terrain analysis and measurement.' },
    zh: { t: 'GIS 地形分析', c: 'CIM · 機場', d: '機場地形分析與量測的 GIS 網頁工具。' },
    tags: ['GIS', 'Terrain', 'Airport'] },
  { key: 'ems', tone: '#759FA4', img: null, platform: 'ems',
    en: { t: 'EMS Energy Management', c: 'EMS · Energy', d: 'Power data from SCADA and smart meters, with AI forecasts and monthly reports.' },
    zh: { t: 'EMS 能源管理', c: 'EMS · 能源', d: '讀取 SCADA 與智慧電表的電力數據，AI 產出用電預測與月報。' },
    tags: ['SCADA', 'Modbus', 'AI'] },
  { key: 'bim-fm', tone: '#3D3D3D', img: null, platform: 'fm',
    en: { t: '3D BIM-enabled FM System', c: 'FM · Facility Management', d: 'Works with common SCADA systems and IoT communication.' },
    zh: { t: '3D BIM 設施管理系統', c: 'FM · 設施管理', d: '串接常見 SCADA 系統與 IoT 通訊。' },
    tags: ['BIM', 'SCADA', 'IoT'] },
  { key: 'ba', tone: '#5B8F96', img: null, platform: 'fm',
    en: { t: '3D Building Automation', c: 'FM · BA + FM', d: 'Federated BIM models made light enough for facility management, linked to SCADA.' },
    zh: { t: '3D 建築自動化', c: 'FM · BA + FM', d: '把整合後的 BIM 模型輕量化給設施管理使用，並串接 SCADA。' },
    tags: ['BIM', 'SCADA', 'PLC'] },
  { key: 'solar', tone: '#47868D', img: null, platform: 'ems',
    en: { t: 'Power Distribution Tool for a Solar Producer', c: 'EMS · Energy', d: 'Project description to be provided.' },
    zh: { t: '太陽能業者配電工具', c: 'EMS · 能源', d: '專案說明待提供。' },
    tags: ['EMS', 'Solar'] },
];
const N = PROJECTS.length;
const pad = (n) => String(n).padStart(2, '0');

/* =====================================================================
   1. Banner words: loop through 10 typefaces, 0.2s each, without a rest
   ===================================================================== */
// f0 is Archivo 900, the chosen still version; f1–f9 only appear during the run (see projects.css)
const FACES = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f0'];
const DEFAULT_FACE = 'f0';
const FACE_STEP = 0.2;   // seconds per typeface
const START = 1.2;       // the title holds still first, so it reads within the first second
const letters = [];
document.querySelectorAll('.pj-word').forEach((w) => {
  const text = w.textContent;
  w.textContent = '';
  w.dataset.f = DEFAULT_FACE;
  [...text].forEach((ch) => {
    const s = document.createElement('span');
    s.className = 'l';
    s.textContent = ch;
    w.append(s);
    letters.push(s);
  });
});
const words = [...document.querySelectorAll('.pj-word')];
const setFace = (f) => words.forEach((w) => { w.dataset.f = f; });

// A small sequencer on the GSAP ticker: one typeface per step, looping without a rest.
// Never more than one change per frame, so a slow frame can delay a face but never skip it.
const seq = { on: false, i: -1, next: 0 };
gsap.ticker.add((time) => {
  if (!seq.on || time < seq.next) return;
  seq.i = (seq.i + 1) % FACES.length;
  setFace(FACES[seq.i]);
  seq.next = time + FACE_STEP;
});
function startCycle() {
  if (seq.on || !animated()) return;
  seq.on = true; seq.i = -1; seq.next = gsap.ticker.time + START;
}
function stopCycle() {
  seq.on = false;
  setFace(DEFAULT_FACE);
}
// pause while the banner is off screen
let heroOn = true;
new IntersectionObserver(([en]) => {
  heroOn = en.isIntersecting;
  if (heroOn && animated()) startCycle(); else if (!heroOn) stopCycle();
}).observe(document.getElementById('pjHero'));

/* =====================================================================
   2. Ribbon tower: the 13 vector ribbons from one work.ai gather from all around into the tower
   ===================================================================== */
const towerEl = document.getElementById('tower');
const ribbons = gsap.utils.toArray('#tower .rb');
gsap.set(towerEl, { transformPerspective: 900 });
gsap.set(ribbons, { transformOrigin: '50% 50%' });
// each ribbon's own direction away from the tower centre, used for the gather-in and the scroll drift
const vb = towerEl.viewBox.baseVal;
const centre = { x: vb.x + vb.width / 2, y: vb.y + vb.height / 2 };
ribbons.forEach((el, i) => {
  const b = el.getBBox();
  const dx = b.x + b.width / 2 - centre.x, dy = b.y + b.height / 2 - centre.y;
  const len = Math.hypot(dx, dy) || 1;
  const spin = (i % 2 ? 1 : -1);
  el._dir = { x: dx / len, y: dy / len, spin };
});

let towerIntro = false;
function towerIn() {
  if (!animated()) return;
  towerIntro = true;
  // ribbons start scattered around the tower, turned and small, then pull together into place
  gsap.timeline({ onComplete: () => { towerIntro = false; } })
    .from(ribbons, {
      x: (i, el) => el._dir.x * gsap.utils.random(110, 190) + gsap.utils.random(-30, 30),
      y: (i, el) => el._dir.y * gsap.utils.random(70, 130) + gsap.utils.random(-40, 40),
      rotation: (i, el) => el._dir.spin * gsap.utils.random(40, 110),
      scale: () => gsap.utils.random(0.4, 0.8),
      opacity: 0,
      duration: 1.3, ease: 'expo.out',
      stagger: { each: 0.06, from: 'random' },
    }, 0.2);
}

/* Words come in with the tower: visible well within 1s (MOTION.md §6.4) */
function heroIn() {
  if (!animated()) { gsap.set(letters, { opacity: 1 }); return; }
  gsap.from(letters, { opacity: 0, yPercent: 40, filter: 'blur(10px)', duration: 0.8, ease: 'expo.out', stagger: { amount: 0.5, from: 'random' }, delay: 0.15 });
  gsap.from('.site-header', { opacity: 0, y: -12, duration: 0.8, ease: 'power3.out', delay: 0.4 });
  towerIn();
}

const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => {
  if (!animated()) return;
  tilt.tx = ((e.clientY / innerHeight) - 0.5) * 0.18;   // ±5°
  tilt.ty = ((e.clientX / innerWidth) - 0.5) * 0.2;
});
const heroScroll = { p: 0 };
if (!STATIC) {
  ScrollTrigger.create({ trigger: '#pjHero', start: 'top top', end: 'bottom top', onUpdate: (s) => { heroScroll.p = s.progress; } });
  gsap.to('.pj-title', { yPercent: -12, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#pjHero', start: '25% top', end: 'bottom top', scrub: true } });
}

/* =====================================================================
   3. The hall: a ring of curved screens
   ===================================================================== */
const hall = document.getElementById('hall');
const hCanvas = document.getElementById('hallGl');
const hRenderer = new THREE.WebGLRenderer({ canvas: hCanvas, antialias: true });
hRenderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75));
hRenderer.setClearColor(C.paper, 1);
const hScene = new THREE.Scene();
const hCam = new THREE.PerspectiveCamera(isSmall ? 84 : 50, 1, 0.1, 60);
hCam.position.set(0, 0.35, 0);
hCam.rotation.order = 'YXZ';
hCam.rotation.x = -0.07;   // look slightly down onto the grid
const R = 6;
const STEP = (Math.PI * 2) / N;
const ARC = STEP * 0.8;
const PW = R * ARC;
const PH = PW * 0.62;
const ring = new THREE.Group();
hScene.add(ring);

// Panel textures: drawn on a 2D canvas so they work before real images exist
const TEX_W = 1280, TEX_H = Math.round(1280 * 0.62);
function wrap(ctx, text, maxW) {
  const words = lang() === 'zh' ? [...text] : text.split(' ');
  const lines = []; let line = '';
  words.forEach((w) => {
    const test = line ? (lang() === 'zh' ? line + w : `${line} ${w}`) : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  });
  lines.push(line);
  return lines;
}
function paintPanel(p, i, ctx, img) {
  const L = p[lang()];
  const dark = p.tone !== '#9EB9BD';
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = p.tone; ctx.fillRect(0, 0, TEX_W, TEX_H);
  if (img) {
    const s = Math.max(TEX_W / img.width, TEX_H / img.height);
    ctx.drawImage(img, (TEX_W - img.width * s) / 2, (TEX_H - img.height * s) / 2, img.width * s, img.height * s);
    const g = ctx.createLinearGradient(0, TEX_H * 0.45, 0, TEX_H);
    g.addColorStop(0, 'rgba(26,26,26,0)'); g.addColorStop(1, 'rgba(26,26,26,0.6)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, TEX_W, TEX_H);
  } else {
    // ribbon motif from the logo, low contrast
    ctx.save();
    ctx.translate(TEX_W * 0.74, TEX_H * 0.46);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(-260, -60, 520, 120);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(-60, -300, 120, 600);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, TEX_W - 72, TEX_H - 72);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '400 22px Jost, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(lang() === 'zh' ? '[ 圖片待提供 ]' : '[ IMAGE TO BE PROVIDED ]', TEX_W - 72, 92);
    ctx.textAlign = 'left';
  }
  ctx.fillStyle = dark ? '#FFFFFF' : '#3D3D3D';
  ctx.font = '500 26px Jost, sans-serif';
  ctx.font = '500 24px Jost, "Noto Sans TC", sans-serif';
  ctx.fillText(L.c.toUpperCase(), 72, TEX_H - 72);
  ctx.font = `900 ${lang() === 'zh' ? 84 : 92}px Archivo, "Noto Sans TC", sans-serif`;
  const lines = wrap(ctx, L.t, TEX_W * 0.72);
  lines.forEach((ln, k) => ctx.fillText(ln, 68, TEX_H - 128 - (lines.length - 1 - k) * 96));
}

const VERT = /* glsl */`
  uniform float uR; uniform float uBend;
  varying vec2 vUv; varying float vEdge;
  void main() {
    vUv = uv;
    vec3 p = position;
    float k = 1.0 + uBend;                       // more speed, more curve
    float a = p.x / uR * k;
    vec3 q = vec3(sin(a) * uR / k, p.y, (1.0 - cos(a)) * uR / k);
    q.y *= 1.0 + uBend * 0.22 * (1.0 - cos(a * 2.0));   // edges stretch a little while it turns
    vEdge = abs(a);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.0);
  }`;
const FRAG = /* glsl */`
  uniform sampler2D map; uniform float uFade; uniform vec3 uPaper;
  varying vec2 vUv; varying float vEdge;
  void main() {
    vec3 c = texture2D(map, vUv).rgb;
    c *= 1.0 - vEdge * 0.35;                     // edges turn away from the light
    gl_FragColor = vec4(mix(uPaper, c, uFade), 1.0);
  }`;

const panels = PROJECTS.map((p, i) => {
  const cv = document.createElement('canvas');
  cv.width = TEX_W; cv.height = TEX_H;
  const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  // ShaderMaterial writes colours as-is, so the canvas stays in sRGB end to end
  tex.anisotropy = 4;
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, uR: { value: R }, uBend: { value: 0 }, uFade: { value: 1 }, uPaper: { value: new THREE.Color(C.paper) } },
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH, isSmall ? 32 : 64, 8), mat);
  const a = i * STEP;
  mesh.position.set(Math.sin(a) * R, 0.55, -Math.cos(a) * R);
  mesh.rotation.y = -a;
  mesh.userData = { i, a, ctx, tex, img: null };
  ring.add(mesh);
  if (p.img) {
    const im = new Image();
    im.onload = () => { mesh.userData.img = im; paintPanel(p, i, ctx, im); tex.needsUpdate = true; };
    im.src = p.img;
  }
  return mesh;
});
function paintAll() {
  panels.forEach((m, i) => { paintPanel(PROJECTS[i], i, m.userData.ctx, m.userData.img); m.userData.tex.needsUpdate = true; });
}

function hallLayout() {
  const w = hCanvas.clientWidth, h = hCanvas.clientHeight;
  hRenderer.setSize(w, h, false);
  hCam.aspect = w / h; hCam.updateProjectionMatrix();
}
hall.style.height = `calc(${(N - 1) * 45}vh + 100vh)`;

/* Scroll turns the ring; the speed of the turn bends the screens */
// the ring loops forever: a slow turn of its own, plus whatever scrolling adds (one full scroll = one full turn)
const turn = { scroll: 0, auto: 0, cur: 0, bend: 0 };
const AUTO_SPEED = STEP / 10;   // about one project every ten seconds
let active = -1;
if (!STATIC) {
  ScrollTrigger.create({
    trigger: hall, start: 'top top', end: 'bottom bottom', pin: '.hall-stage', pinSpacing: false,
    onUpdate: (s) => { turn.scroll = s.progress * N * STEP; },
  });
}

/* Caption: the project in front, swapped with a blur-focus change */
const capTitle = document.getElementById('capTitle');
const capCat = document.getElementById('capCat');
function writeCap(i) {
  const L = PROJECTS[i][lang()];
  capTitle.textContent = L.t; capCat.textContent = L.c;
}
function setActive(i) {
  if (i === active) return;
  const first = active < 0;
  active = i;
  if (first || !animated()) { writeCap(i); return; }
  gsap.timeline()
    .to([capTitle, capCat], { opacity: 0, filter: 'blur(6px)', y: -8, duration: 0.25, ease: 'power3.in', overwrite: true })
    .call(() => writeCap(i))
    .fromTo([capTitle, capCat], { y: 10, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out', stagger: 0.05 });
}
setActive(0);

function goTo(i) {
  // snap the turn to project i (i may run past either end; the ring simply keeps going round)
  turn.auto += i * STEP - (turn.scroll + turn.auto);
}

document.getElementById('hallPrev').addEventListener('click', () => goTo(Math.round((turn.scroll + turn.auto) / STEP) - 1));
document.getElementById('hallNext').addEventListener('click', () => goTo(Math.round((turn.scroll + turn.auto) / STEP) + 1));
document.getElementById('capOpen').addEventListener('click', () => openProject(active));

/* Hover and click on the screens */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let hoverI = -1;
function pick(e) {
  const r = hCanvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, hCam);
  const hit = ray.intersectObjects(panels)[0];
  return hit ? hit.object.userData.i : -1;
}
// Resting the mouse on a screen opens that project. Guards: a short dwell (a pass-over does nothing),
// never while the ring is turning, and after closing, the pointer must leave that screen before it can open again.
const DWELL = 450;
let dwell = null;
let blocked = -1;
let turnSpeed = 0;
function setHover(i, mouse) {
  if (i !== blocked) blocked = -1;
  if (i === hoverI) return;
  hoverI = i;
  hCanvas.classList.toggle('is-hover', i >= 0);
  clearTimeout(dwell);
  if (!mouse || i < 0) return;
  dwell = setTimeout(function tryOpen() {
    if (hoverI !== i || i === blocked || modal.open) return;
    if (turnSpeed > 0.002) { dwell = setTimeout(tryOpen, 150); return; }   // wait for the ring to settle
    blocked = i;
    openProject(i);
  }, DWELL);
}
hCanvas.addEventListener('pointermove', (e) => setHover(pick(e), e.pointerType === 'mouse'));
hCanvas.addEventListener('pointerleave', () => setHover(-1, false));
hCanvas.addEventListener('click', (e) => { const i = pick(e); if (i >= 0 && !modal.open) { clearTimeout(dwell); blocked = i; openProject(i); } });

/* =====================================================================
   4. Index list and project detail
   ===================================================================== */
const list = document.getElementById('indexList');
function buildIndex() {
  list.replaceChildren(...PROJECTS.map((p, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="ix-title"></span><span class="ix-cat"></span>`;
    b.querySelector('.ix-title').textContent = p[lang()].t;
    b.querySelector('.ix-cat').textContent = p[lang()].c;
    b.addEventListener('click', () => openProject(i));
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') showPeek(i); });
    b.addEventListener('pointerleave', hidePeek);
    li.append(b);
    return li;
  }));
}
// list preview: the project's screen, small, following the pointer (same artwork as the ring, so real images show here too)
const peek = document.createElement('div');
peek.className = 'pj-peek';
peek.setAttribute('aria-hidden', 'true');
const peekCv = document.createElement('canvas');
peekCv.width = 520; peekCv.height = Math.round(520 * TEX_H / TEX_W);
peek.append(peekCv);
document.body.append(peek);
const peekX = gsap.quickTo(peek, 'x', { duration: 0.5, ease: 'power3.out' });
const peekY = gsap.quickTo(peek, 'y', { duration: 0.5, ease: 'power3.out' });
function showPeek(i) {
  const pctx = peekCv.getContext('2d');
  pctx.clearRect(0, 0, peekCv.width, peekCv.height);
  pctx.drawImage(panels[i].userData.ctx.canvas, 0, 0, peekCv.width, peekCv.height);
  gsap.to(peek, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: 'expo.out', overwrite: 'auto' });
}
function hidePeek() { gsap.to(peek, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power3.out', overwrite: 'auto' }); }
gsap.set(peek, { xPercent: -50, yPercent: -50, scale: 0.9, opacity: 0 });
addEventListener('pointermove', (e) => { peekX(e.clientX + (innerWidth - e.clientX > 340 ? 190 : -190)); peekY(e.clientY); });

buildIndex();

const modal = document.getElementById('pjModal');
const PLATFORM_NAME = { fm: 'FM', cim: 'CIM', airhub: 'Airhub', ems: 'EMS' };
function openProject(i) {
  const p = PROJECTS[i]; const L = p[lang()];
  document.getElementById('mCat').textContent = L.c;
  document.getElementById('mTitle').textContent = L.t;
  document.getElementById('mDesc').textContent = L.d;
  const tags = document.getElementById('mTags');
  tags.replaceChildren(...p.tags.map((t) => { const s = document.createElement('span'); s.textContent = t; return s; }));
  const link = document.getElementById('mLink');
  link.href = `../product/#${p.platform}`;
  link.textContent = lang() === 'zh' ? `看 ${PLATFORM_NAME[p.platform]} 平台 →` : `See the ${PLATFORM_NAME[p.platform]} platform →`;
  if (modal.open) modal.close();   // reopen as a true modal, never as an inline block
  modal.showModal();
  modal.scrollTop = 0;
  if (animated()) gsap.fromTo(modal, { y: 40, opacity: 0, clipPath: 'inset(8% 0 0 0)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'expo.out' });
}
document.getElementById('mClose').addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

onLangChange(() => { paintAll(); writeCap(Math.max(active, 0)); buildIndex(); });

/* =====================================================================
   5. Render loop (only what is on screen)
   ===================================================================== */
const seen = { hero: true, hall: false };
const io = new IntersectionObserver((es) => es.forEach((en) => { seen[en.target === hall ? 'hall' : 'hero'] = en.isIntersecting; }));
io.observe(document.getElementById('pjHero'));
io.observe(hall);

const clock = new THREE.Clock();
gsap.ticker.add(() => {
  const t = clock.getElapsedTime();
  const calm = !animated();
  if (seen.hero) {
    const k = calm ? 1 : 0.08;
    tilt.x += ((calm ? 0 : tilt.tx) - tilt.x) * k; tilt.y += ((calm ? 0 : tilt.ty) - tilt.y) * k;
    // pointer tilt (max 6°) plus a slow sway
    gsap.set(towerEl, { rotationX: tilt.x * -33, rotationY: tilt.y * 30 + (calm ? 0 : Math.sin(t * 0.35) * 4) });
    // leaving the banner: the ribbons drift apart again, each along its own direction
    const sp = heroScroll.p;
    if (!towerIntro) ribbons.forEach((el) => {
      gsap.set(el, { x: el._dir.x * sp * 120, y: el._dir.y * sp * 90, rotation: el._dir.spin * sp * 50 });
    });
  }
  if (seen.hall && !STATIC) {
    const prev = turn.cur;
    const nowT = performance.now(); const dt = Math.min(0.05, (nowT - (turn.last || nowT)) / 1000); turn.last = nowT;
    if (!calm && hoverI < 0 && !modal.open) turn.auto += AUTO_SPEED * dt;   // pauses under the mouse and while a project is open
    const target = turn.scroll + turn.auto;
    turn.cur += (target - turn.cur) * (calm ? 1 : 0.08);
    const speed = Math.abs(turn.cur - prev);
    turnSpeed = speed;
    turn.bend += ((calm ? 0 : clamp(speed * 9, 0, 0.55)) - turn.bend) * 0.12;
    ring.rotation.y = turn.cur;
    panels.forEach((m) => {
      let d = m.userData.a - turn.cur;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      m.material.uniforms.uBend.value = turn.bend;
      m.material.uniforms.uFade.value = 1 - clamp((Math.abs(d) - 0.7) / 1.4, 0, 1) * 0.85;
      // the screen under the pointer leans out a little
      const lift = m.userData.i === hoverI && !calm ? 0.25 : 0;
      m.userData.lift = (m.userData.lift || 0) + (lift - (m.userData.lift || 0)) * 0.12;
      const rr = R - m.userData.lift;
      m.position.x = Math.sin(m.userData.a) * rr; m.position.z = -Math.cos(m.userData.a) * rr;
    });
    hCam.rotation.y = -tilt.y * 0.3;   // the room answers the pointer, gently
    setActive(((Math.round(turn.cur / STEP) % N) + N) % N);
    hRenderer.render(hScene, hCam);
  }
});

function layoutAll() { hallLayout(); }
addEventListener('resize', () => { layoutAll(); ScrollTrigger.refresh(); });
layoutAll();

onMotionChange((calm) => { if (calm) stopCycle(); else startCycle(); });

/* Index reveal */
if (!STATIC) {
  gsap.from('.index-list li', { opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.index-list', start: 'top 80%', once: true } });
}
setupReveals();

// load all three banner faces up front so the first change never shows a fallback font
Promise.all(['900 40px Archivo', '500 40px "Bodoni Moda"', '400 40px "Ms Madi"', '700 40px "Space Mono"', '800 40px Unbounded',
  'italic 400 40px "Instrument Serif"', '800 40px Syne', '400 40px "Major Mono Display"', '400 40px "Bebas Neue"', '400 40px "Rubik Mono One"', '900 40px "Noto Sans TC"']
  .map((f) => document.fonts.load(f).catch(() => null))).then(() => fontsReady).then(() => {
  paintAll();
  heroIn();
  startCycle();
});
