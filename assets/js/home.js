// ONEWORK home — motion values follow MOTION.md
import * as THREE from 'three';
import { gsap, ScrollTrigger, motion, STATIC, isSmall, setupReveals, onMotionChange, fontsReady } from './site.js';

const C = {
  teal900: 0x47868d, teal700: 0x5b8f96, teal500: 0x759fa4, teal300: 0x8badb1, teal100: 0x9eb9bd,
  mist: '#AFC5C8', white: '#FFFFFF',
};
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const range = (p, a, b) => clamp01((p - a) / (b - a));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);


/* ---------------- Hero pattern (2D, drawn once + slow drifting dashes) ---------------- */
const pattern = document.getElementById('pattern');
const pctx = pattern.getContext('2d');
let tile = null;
let dashes = [];
function seeded(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }
function drawPatternTile() {
  const dpr = Math.min(devicePixelRatio, 2);
  const w = pattern.clientWidth, h = pattern.clientHeight;
  pattern.width = w * dpr; pattern.height = h * dpr;
  tile = document.createElement('canvas');
  tile.width = pattern.width; tile.height = pattern.height;
  const t = tile.getContext('2d');
  t.scale(dpr, dpr);
  t.fillStyle = C.mist; t.fillRect(0, 0, w, h);
  const rnd = seeded(7);
  // low-contrast tones (MOTION.md §5: Home pattern is low contrast)
  const tones = ['rgba(158,185,189,0.32)', 'rgba(139,173,177,0.16)', 'rgba(255,255,255,0.12)', 'rgba(175,197,200,0.9)'];
  const step = Math.max(70, w / 22);
  for (let y = -step; y < h + step; y += step * 0.62) {
    for (let x = -step; x < w + step; x += step * 0.9) {
      const s = step * (0.55 + rnd() * 0.6);
      t.save();
      t.translate(x + rnd() * step * 0.4, y + rnd() * step * 0.3);
      t.rotate(Math.PI / 4 + (rnd() > 0.5 ? 0 : Math.PI / 2));
      t.fillStyle = tones[(rnd() * tones.length) | 0];
      t.beginPath();
      if (rnd() > 0.45) { t.moveTo(0, 0); t.lineTo(s, 0); t.lineTo(0, s); } else { t.rect(0, 0, s * 0.7, s * 0.7); }
      t.fill();
      t.restore();
    }
  }
  dashes = Array.from({ length: Math.round((w * h) / 26000) }, () => ({
    x: rnd() * w, y: rnd() * h, v: 0.08 + rnd() * 0.12,
  }));
}
function drawPattern() {
  if (!tile) return;
  const dpr = pattern.width / pattern.clientWidth;
  pctx.setTransform(1, 0, 0, 1, 0, 0);
  pctx.drawImage(tile, 0, 0);
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  pctx.fillStyle = 'rgba(255,255,255,0.85)';
  const w = pattern.clientWidth, h = pattern.clientHeight;
  for (const d of dashes) {
    if (!motion.calm) { d.x += d.v; d.y -= d.v; if (d.x > w + 10) d.x = -10; if (d.y < -10) d.y = h + 10; }
    pctx.save(); pctx.translate(d.x, d.y); pctx.rotate(-Math.PI / 4); pctx.fillRect(-7, -1.5, 14, 3); pctx.restore();
  }
}

/* ---------------- 3D layer ---------------- */
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75));
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 0, 10);
scene.add(new THREE.HemisphereLight(0xffffff, C.teal900, 1.25));
const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(3, 4, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0xffffff, 0.6); rim.position.set(-4, -2, -3); scene.add(rim);

/* Logo: the 8 ribbon pieces, taken from the clip paths in 工作區域 3.svg */
function rectPts(x, y, w, h, tx, ty, deg) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => [px * c - py * s + tx, px * s + py * c + ty]);
}
const PIECES = [
  { pts: [[27.43, 19.86], [15.61, 32.28], [22.79, 39.12], [39.96, 21.08], [32.78, 14.24]], color: C.teal500 },
  { pts: rectPts(33.28, 38.81, 24.9, 9.91, -17.5, 46.71, -46.41), color: C.teal900 },
  { pts: rectPts(19.83, 40.39, 9.88, 14.87, -26.94, 32.79, -46.41), color: C.teal300 },
  { pts: [[39.96, 21.08], [50.73, 31.33], [57.56, 24.16], [48.61, 15.64], [46.79, 13.91]], color: C.teal100 },
  { pts: [[15.61, 32.28], [15.98, 46.27], [22.79, 39.12]], color: C.teal300 },
  { pts: [[26.75, 56.52], [40.74, 56.21], [33.56, 49.37]], color: C.teal700 },
  { pts: [[32.78, 14.24], [39.96, 21.08], [46.79, 13.91]], color: C.teal100 },
  { pts: [[50.73, 31.33], [57.91, 38.17], [57.56, 24.16]], color: C.teal500 },
];
const LOGO_C = [36.76, 35.22], LOGO_S = 0.07;
const logo = new THREE.Group();
scene.add(logo);
const pieces = PIECES.map((p, i) => {
  const v = p.pts.map(([x, y]) => new THREE.Vector2((x - LOGO_C[0]) * LOGO_S, -(y - LOGO_C[1]) * LOGO_S));
  const cx = v.reduce((a, b) => a + b.x, 0) / v.length, cy = v.reduce((a, b) => a + b.y, 0) / v.length;
  const shape = new THREE.Shape(v.map((q) => new THREE.Vector2(q.x - cx, q.y - cy)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.012, bevelSegments: 2 });
  geo.translate(0, 0, -0.11 + (i % 2) * 0.03);
  const mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.42, metalness: 0.08, transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(cx, cy, 0);
  mesh.userData.home = new THREE.Vector3(cx, cy, 0);
  const dir = new THREE.Vector3(cx || 0.1, cy || 0.1, 0).normalize();
  mesh.userData.out = new THREE.Vector3(dir.x * 5, dir.y * 4, 2 + (i % 3));
  logo.add(mesh);
  return mesh;
});

/* Building: twisting octagonal floors — the ribbon ring, stacked */
const building = new THREE.Group();
scene.add(building);
const FLOORS = isSmall ? 9 : 12, GAP = 0.34, THICK = 0.09;
const floorMeshes = [], floorY = [];
const pointTargets = [], sensorPos = [];
const edgePositions = [];
function octagon(r, rot = Math.PI / 8) {
  return Array.from({ length: 8 }, (_, k) => new THREE.Vector2(Math.cos(rot + (k * Math.PI) / 4) * r, Math.sin(rot + (k * Math.PI) / 4) * r));
}
const floorMat = new THREE.MeshStandardMaterial({ color: C.teal700, roughness: 0.5, metalness: 0.05, transparent: true, opacity: 0 });
let prevOuter = null;
for (let i = 0; i < FLOORS; i++) {
  const R = 1.25 - i * 0.018, r = R - 0.32, twist = i * 0.07;
  const outer = octagon(R), inner = octagon(r);
  const shape = new THREE.Shape(outer);
  shape.holes.push(new THREE.Path([...inner].reverse()));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: THICK, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  const y = i * GAP - ((FLOORS - 1) * GAP) / 2;
  const mesh = new THREE.Mesh(geo, floorMat.clone());
  mesh.position.y = y; mesh.rotation.y = twist;
  building.add(mesh);
  floorMeshes.push(mesh); floorY.push(y);

  // world-space outline of this floor (outer ring, top + bottom)
  const ring = (h) => outer.map((q) => new THREE.Vector3(q.x, h, -q.y).applyAxisAngle(new THREE.Vector3(0, 1, 0), twist));
  const top = ring(y + THICK), bot = ring(y);
  for (let k = 0; k < 8; k++) {
    const a = top[k], b = top[(k + 1) % 8], c2 = bot[k], d = bot[(k + 1) % 8];
    edgePositions.push(a, b, c2, d, a, c2);
    for (let s = 0; s < 10; s++) {
      const t = s / 10;
      pointTargets.push(a.clone().lerp(b, t), c2.clone().lerp(d, t));
    }
    if (prevOuter) { edgePositions.push(prevOuter[k], bot[k]); for (let s = 1; s < 5; s++) pointTargets.push(prevOuter[k].clone().lerp(bot[k], s / 5)); }
  }
  prevOuter = top;
  if (i % 2 === 0) [1, 4, 6].forEach((k) => sensorPos.push(top[k].clone()));
}

// point cloud
const N = pointTargets.length;
const ptStart = new Float32Array(N * 3), ptNow = new Float32Array(N * 3), ptDelay = new Float32Array(N);
const rndP = seeded(11);
for (let i = 0; i < N; i++) {
  const u = rndP() * Math.PI * 2, v = Math.acos(2 * rndP() - 1), rad = 4 + rndP() * 4;
  ptStart[i * 3] = Math.sin(v) * Math.cos(u) * rad; ptStart[i * 3 + 1] = Math.cos(v) * rad; ptStart[i * 3 + 2] = Math.sin(v) * Math.sin(u) * rad;
  ptDelay[i] = rndP() * 0.35;
}
ptNow.set(ptStart);
const ptGeo = new THREE.BufferGeometry();
ptGeo.setAttribute('position', new THREE.BufferAttribute(ptNow, 3));
function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fill();
  return new THREE.CanvasTexture(c);
}
const dot = dotTexture();
const ptMat = new THREE.PointsMaterial({ color: C.teal900, size: 0.035, map: dot, alphaTest: 0.4, transparent: true, opacity: 0, depthWrite: false });
const cloud = new THREE.Points(ptGeo, ptMat);
building.add(cloud);

// wireframe
const wireGeo = new THREE.BufferGeometry().setFromPoints(edgePositions);
const wireMat = new THREE.LineBasicMaterial({ color: C.teal900, transparent: true, opacity: 0 });
const wire = new THREE.LineSegments(wireGeo, wireMat);
building.add(wire);

// sensors + data lines to a hub under the building
const hub = new THREE.Vector3(0, floorY[0] - 0.9, 0);
const sGeo = new THREE.BufferGeometry().setFromPoints(sensorPos);
// sensors read as data markers: drawn on top of the floors
const sMat = new THREE.PointsMaterial({ color: C.teal300, size: 0.34, map: dot, alphaTest: 0.3, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
const sensors = new THREE.Points(sGeo, sMat);
building.add(sensors);
const pulseMat = sMat.clone(); pulseMat.size = 0.7; pulseMat.alphaTest = 0.05;
const pulse = new THREE.Points(sGeo, pulseMat);
building.add(pulse);
const lineGeo = new THREE.BufferGeometry().setFromPoints(sensorPos.flatMap((p) => [p, hub]));
const lineMat = new THREE.LineBasicMaterial({ color: C.teal900, transparent: true, opacity: 0.45 });
const dataLines = new THREE.LineSegments(lineGeo, lineMat);
lineGeo.setDrawRange(0, 0);
building.add(dataLines);

/* Layout per breakpoint */
function layout() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const small = w < 900;
  // world units visible at z = 0
  const viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  const viewW = viewH * camera.aspect;
  const LOGO_W = 2.96; // raw logo width in world units
  const logoPx = small ? Math.min(w * 0.34, 180) : Math.max(120, w * 0.075);
  logo.scale.setScalar((logoPx / w) * viewW / LOGO_W);
  logo.position.set(0, small ? viewH * 0.12 : 0, 0);
  // whole tower + hub inside ~70% of the viewport height
  const towerH = FLOORS * GAP + 1.2;
  // small screens: tower sits in the top ~40%, above the copy panel
  building.position.set(small ? 0 : viewW * 0.2, small ? viewH * 0.24 : 0.15, 0);
  building.scale.setScalar(((small ? 0.34 : 0.62) * viewH) / towerH);
  drawPatternTile(); drawPattern();
}
addEventListener('resize', () => { layout(); ScrollTrigger.refresh(); });
layout();

/* Pointer tilt: max 6° (MOTION.md §4) */
const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
const MAX_TILT = (6 * Math.PI) / 180;
addEventListener('pointermove', (e) => {
  if (motion.calm) return;
  tilt.tx = ((e.clientY / innerHeight) - 0.5) * 2 * MAX_TILT;
  tilt.ty = ((e.clientX / innerWidth) - 0.5) * 2 * MAX_TILT;
});

/* Twin progress (scroll-driven) */
const twin = { p: STATIC ? 1 : 0, s: STATIC ? 1 : 0 };
const steps = [...document.querySelectorAll('.step')];
const bar = document.getElementById('twinProgress');
function setStep(p) {
  const idx = p < 0.36 ? 0 : p < 0.68 ? 1 : 2;
  steps.forEach((el, i) => el.classList.toggle('is-active', i === idx));
  bar.style.transform = `scaleX(${p})`;
}
if (!STATIC) {
  ScrollTrigger.create({
    trigger: '#twin',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.twin-stage',
    pinSpacing: false,
    onUpdate: (self) => { twin.p = self.progress; setStep(self.progress); },
  });
}

function applyTwin(p, time) {
  // logo hands over to the building
  const out = range(p, 0.02, 0.16);
  pieces.forEach((m, i) => {
    const t = easeOut(clamp01(out * 1.3 - i * 0.03));
    if (!introRunning) m.position.lerpVectors(m.userData.home, m.userData.out, t);
    m.material.opacity = 1 - t;
    m.visible = t < 0.999;
  });
  // 01 MODEL: points converge, then the wireframe draws
  ptMat.opacity = range(p, 0.04, 0.12) * (1 - range(p, 0.6, 0.72));
  for (let i = 0; i < N; i++) {
    const t = easeOut(clamp01((range(p, 0.06, 0.34) - ptDelay[i]) / (1 - 0.35)));
    const tg = pointTargets[i];
    ptNow[i * 3] = ptStart[i * 3] + (tg.x - ptStart[i * 3]) * t;
    ptNow[i * 3 + 1] = ptStart[i * 3 + 1] + (tg.y - ptStart[i * 3 + 1]) * t;
    ptNow[i * 3 + 2] = ptStart[i * 3 + 2] + (tg.z - ptStart[i * 3 + 2]) * t;
  }
  ptGeo.attributes.position.needsUpdate = true;
  wireMat.opacity = range(p, 0.28, 0.4) * (1 - 0.6 * range(p, 0.5, 0.66));
  // 02 INTEGRATE: floors become solid, bottom to top
  floorMeshes.forEach((m, i) => {
    const t = easeOut(range(p, 0.42 + i * 0.014, 0.52 + i * 0.014));
    m.material.opacity = t * 0.95;
    m.material.depthWrite = t > 0.9; // fading floors must not hide what is behind them
    m.visible = t > 0.005;
    m.position.y = floorY[i] + (1 - t) * 0.6;
  });
  cloud.visible = ptMat.opacity > 0.005;
  wire.visible = wireMat.opacity > 0.005;
  // 03 TWIN: sensors light up one by one, data flows to the hub
  const sOn = range(p, 0.7, 0.8);
  sMat.opacity = sOn;
  pulseMat.opacity = sOn * (0.25 + 0.2 * Math.sin(time * 2.2));
  sensors.visible = pulse.visible = sOn > 0.005;
  lineGeo.setDrawRange(0, Math.floor(sensorPos.length * 2 * range(p, 0.76, 0.92)) & ~1);
  building.rotation.y = -0.5 + p * 1.1 + tilt.y;
  building.rotation.x = 0.18 + tilt.x * 0.6;
}

/* Hero intro (MOTION.md §7; headline readable within 1s per §6.4) */
let introRunning = false;
const wordLetters = document.querySelectorAll('.wordmark span');
const lines = document.querySelectorAll('.hero-title .line-inner');
function intro() {
  if (STATIC || motion.calm) return;
  introRunning = true;
  const tl = gsap.timeline({ onComplete: () => { introRunning = false; } });
  tl.from(pattern, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0);
  pieces.forEach((m, i) => {
    const from = new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, 4 + Math.random() * 4);
    m.position.copy(from);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    tl.to(m.position, { x: m.userData.home.x, y: m.userData.home.y, z: 0, duration: 1.2, ease: 'expo.out' }, 0.3 + i * 0.04);
    tl.to(m.rotation, { x: 0, y: 0, z: 0, duration: 1.2, ease: 'expo.out' }, 0.3 + i * 0.04);
  });
  tl.from(lines, { yPercent: 105, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, 0.2);
  tl.from('.hero-tagline', { opacity: 0, y: 12, duration: 0.8, ease: 'power3.out' }, 0.6);
  tl.from(wordLetters, { opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04 }, 0.8);
  tl.from('.wordmark', { gap: '0.05em', duration: 0.8, ease: 'expo.out' }, 1.2);
  tl.from('.site-header', { opacity: 0, y: -12, duration: 0.8, ease: 'power3.out' }, 0.4);
}

/* Render only while the hero or the twin section is on screen */
const visible = { hero: true, twin: false };
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { visible[en.target.id] = en.isIntersecting; });
  canvas.style.visibility = visible.hero || visible.twin ? 'visible' : 'hidden';
}, { rootMargin: '10% 0px' });
io.observe(document.getElementById('hero'));
io.observe(document.getElementById('twin'));

const clock = new THREE.Clock();
function frame() {
  const time = clock.getElapsedTime();
  if (visible.hero && !motion.calm) drawPattern();
  if (visible.hero || visible.twin) {
    const k = motion.calm ? 1 : 0.08;
    tilt.x += (tilt.tx - tilt.x) * k; tilt.y += (tilt.ty - tilt.y) * k;
    if (STATIC) twin.s = visible.hero ? 0 : 1; // static: logo in hero, finished twin below
    else twin.s += (twin.p - twin.s) * (motion.calm ? 1 : 0.12);
    logo.rotation.x = tilt.x; logo.rotation.y = tilt.y + (motion.calm ? 0 : Math.sin(time * 0.4) * 0.03);
    applyTwin(twin.s, time);
    renderer.render(scene, camera);
  }
}
gsap.ticker.add(frame);
setStep(twin.p);
/* Partner wall: duplicate the row once so the marquee loops seamlessly */
const track = document.getElementById('partnerTrack');
if (track) {
  [...track.children].forEach((li) => {
    const copy = li.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelector('img').alt = '';
    track.appendChild(copy);
  });
}

/* Metrics: count up once, compression bar shrinks 100% → 5% */
document.querySelectorAll('.count').forEach((el) => {
  const target = +el.dataset.target;
  if (STATIC) { el.textContent = target; return; }
  const o = { v: 0 };
  el.textContent = '0';
  gsap.to(o, {
    v: target, duration: 1.6, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    onUpdate: () => { el.textContent = Math.round(o.v); },
  });
});
if (!STATIC) {
  gsap.fromTo('.bar-fill.engine', { scaleX: 1 }, {
    scaleX: 0.05, duration: 1.8, ease: 'expo.out', delay: 0.3,
    scrollTrigger: { trigger: '.compress', start: 'top 75%', once: true },
  });
  gsap.from('.svc', { opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.svc-list', start: 'top 80%', once: true } });
}
setupReveals();
onMotionChange((calm) => { if (calm) tilt.tx = tilt.ty = 0; });

fontsReady.then(intro);
