// ONEWORK — About page. Motion values follow MOTION.md (§4: About lines draw slowly; §6: title readable within 1s).
import { gsap, ScrollTrigger, motion, STATIC, setupReveals, onLangChange, onMotionChange, fontsReady } from './site.js?v=20261117';

const animated = () => !STATIC && !motion.calm;

/* ---------- Manifesto: split into words so it can reveal word by word ---------- */
const manifesto = document.getElementById('manifesto');
const segmenter = 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'word' }) : null;
function splitWords() {
  const text = manifesto.textContent;
  const parts = segmenter ? [...segmenter.segment(text)].map((s) => s.segment) : text.split(/(\s+)/);
  manifesto.textContent = '';
  for (const part of parts) {
    if (/^\s+$/.test(part)) { manifesto.append(part); continue; }
    const span = document.createElement('span');
    span.className = 'w';
    span.textContent = part;
    manifesto.append(span);
  }
}
splitWords();
onLangChange(splitWords);

/* ---------- Opening film (user reference video) ----------
   Runs once, about 9 s, fast cuts in black and white:
   ABOUT ONEWORK → a running row of ONEWORK, a black block flips it → ONEWORK shrinks →
   a grid of O N E W O R K letters, then inverted → the grid bends into a 3D wave and the camera flies over it →
   a wall of O's → one O, the camera dives into its stroke → star warp → ONEWORK small → the banner.
   Any scroll, click or key skips to the banner. */
const intro = document.getElementById('intro');
const cvs = document.getElementById('introCanvas');
const ctx = cvs.getContext('2d');
const LETTERS = 'ONEWORK';
const cv = { mode: 'none', dark: false, ox: 0, tilt: 0, amp: 0, phase: 0, fly: 0, warp: 0 };
let W = 0, H = 0, DPR = 1, stars = [];

function sizeCanvas() {
  const r = intro.getBoundingClientRect();
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = r.width; H = r.height;
  cvs.width = W * DPR; cvs.height = H * DPR;
}
function seedStars() {
  stars = Array.from({ length: Math.round(Math.min(900, W * H / 1800)) }, () => ({
    x: (Math.random() * 2 - 1) * 1.2, y: (Math.random() * 2 - 1) * 1.2, z: Math.random() * 0.95 + 0.05, pz: 0,
  }));
  stars.forEach((st) => { st.pz = st.z; });
}

/* the letter sheet: a flat grid facing the camera that tilts back and ripples into a wave */
function drawSheet() {
  const s = Math.max(64, W / 9);             // cell size
  const cols = 30, rows = 30, D = 900;
  const fg = cv.dark ? '#FFFFFF' : '#000000';
  ctx.fillStyle = fg;
  ctx.font = `400 ${s * 0.62}px Jost, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const cos = Math.cos(cv.tilt), sin = Math.sin(cv.tilt);
  const P = (gx, gy) => {
    const X = gx * s, Y0 = gy * s;
    let Y = Y0 * cos, Z = Y0 * sin + cv.fly;
    Z += cv.amp * Math.sin(X / (W * 0.32) + Y0 / (W * 0.45) + cv.phase) * s;
    const z = D + Z;
    if (z < 60) return null;
    const k = D / z;
    return [W / 2 + X * k, H / 2 + Y * k - cv.tilt * H * 0.35 * k, k];
  };
  const shift = ((cv.ox % s) + s) % s / s;
  const first = Math.floor(cv.ox / s);
  for (let j = -rows / 2; j < rows / 2; j++) {
    for (let i = -cols / 2; i < cols / 2; i++) {
      const gx = i + shift, gy = j + 0.5;
      const p = P(gx, gy), px = P(gx + 1, gy), py = P(gx, gy + 1);
      if (!p || !px || !py) continue;
      if (p[0] < -s * 3 || p[0] > W + s * 3 || p[1] < -s * 3 || p[1] > H + s * 3) continue;
      const ch = LETTERS[(((i - first + j * 3) % 7) + 7) % 7];
      ctx.setTransform(DPR * (px[0] - p[0]) / s, DPR * (px[1] - p[1]) / s, DPR * (py[0] - p[0]) / s, DPR * (py[1] - p[1]) / s, DPR * p[0], DPR * p[1]);
      ctx.fillText(ch, 0, 0);
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function drawOWall() {
  const fs = H * 0.62;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#000000';
  ctx.font = `500 ${fs}px Jost, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const step = fs * 0.78;
  for (let y = -1; y <= 1; y++) for (let x = -3; x <= 3; x++) {
    ctx.fillText('O', W / 2 + x * step + (y % 2 ? step / 2 : 0) + cv.ox, H / 2 + y * fs * 0.8);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function drawStars(dt) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const f = Math.min(W, H) * 0.9;
  for (const st of stars) {
    st.pz = st.z;
    st.z -= cv.warp * dt;
    if (st.z <= 0.02) { st.x = (Math.random() * 2 - 1) * 1.2; st.y = (Math.random() * 2 - 1) * 1.2; st.z = 1; st.pz = 1; continue; }
    const x = W / 2 + (st.x / st.z) * f, y = H / 2 + (st.y / st.z) * f;
    const x0 = W / 2 + (st.x / st.pz) * f, y0 = H / 2 + (st.y / st.pz) * f;
    if (x < -50 || x > W + 50 || y < -50 || y > H + 50) continue;
    const b = Math.min(1, (1 - st.z) * 1.4);
    ctx.strokeStyle = `rgba(255,255,255,${0.25 + b * 0.75})`;
    ctx.lineWidth = 0.6 + (1 - st.z) * 2.2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x + 0.01, y + 0.01); ctx.stroke();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function render(time, dt) {
  if (cv.mode === 'none') return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = cv.dark ? '#000000' : '#FFFFFF';
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  if (cv.mode === 'sheet') drawSheet();
  else if (cv.mode === 'owall') drawOWall();
  else if (cv.mode === 'stars') drawStars(Math.min(dt, 50) / 1000);
}

let film = null;
function finishIntro() {
  intro.classList.add('is-done');
  gsap.ticker.remove(render);
  gsap.set('.site-header', { opacity: 1 });
}
function playIntro() {
  if (!animated()) { finishIntro(); return; }
  sizeCanvas(); seedStars();
  gsap.ticker.add(render);
  const show = (sel, on = true) => gsap.set(sel, { visibility: on ? 'visible' : 'hidden' });
  const mode = (m, dark) => () => { cv.mode = m; cv.dark = dark; show(cvs, m !== 'none'); };
  const track = intro.querySelector('.i-track');
  const block = intro.querySelector('.i-block');
  const words = [...track.children];
  const tl = gsap.timeline({ onComplete: finishIntro });
  film = tl;

  // 0.0  ABOUT ONEWORK, big and black in the centre (readable at once)
  tl.from('.i-title span', { yPercent: 40, opacity: 0, duration: 0.45, ease: 'expo.out', stagger: 0.06 }, 0);
  tl.to('.i-title', { scale: 1.06, duration: 0.8, ease: 'none' }, 0.3);

  // 1.0  cut: a running row of ONEWORK; a black block slams up and flips the middle word
  tl.add(() => { show('.i-title', false); show('.i-row'); }, 1.0);
  tl.fromTo(track, { x: 0 }, { x: () => -words[2].offsetLeft, duration: 1.0, ease: 'power2.in' }, 1.0);
  tl.add(() => {
    const r = words[3].getBoundingClientRect(), o = intro.getBoundingClientRect();
    gsap.set(block, { left: r.left - o.left, top: r.top - o.top - r.height * 0.4, width: r.width, height: r.height * 1.8 });
  }, 1.3);
  tl.fromTo(block, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.22, ease: 'expo.out' }, 1.3);
  tl.to(block, { left: 0, width: () => W, top: () => H * 0.5, height: () => H * 0.5, duration: 0.3, ease: 'expo.inOut' }, 1.62);

  // 2.0  cut: ONEWORK alone, then it snaps down small
  tl.add(() => { show('.i-row', false); show('.i-word'); }, 2.0);
  tl.fromTo('.i-word', { scale: 1.6 }, { scale: 0.45, duration: 0.45, ease: 'expo.out' }, 2.0);

  // 2.5  cut: the letter grid, sliding; 3.0 it inverts to black
  tl.add(() => { show('.i-word', false); Object.assign(cv, { ox: 0, tilt: 0, amp: 0, fly: 0, phase: 0 }); }, 2.5);
  tl.add(mode('sheet', false), 2.5);
  tl.to(cv, { ox: () => -W * 0.5, duration: 1.1, ease: 'none' }, 2.5);
  tl.add(() => { cv.dark = true; gsap.set('.site-header', { opacity: 0 }); }, 3.0);

  // 3.6  the sheet tilts back and ripples into a wave, the camera rushes over it
  tl.to(cv, { tilt: 1.05, duration: 1.6, ease: 'power3.inOut' }, 3.4);
  tl.to(cv, { amp: 1.5, duration: 1.4, ease: 'power2.in' }, 3.6);
  tl.to(cv, { phase: 5, duration: 2.0, ease: 'none' }, 3.6);
  tl.to(cv, { fly: () => -W * 0.9, duration: 1.8, ease: 'power2.in' }, 3.8);

  // 5.6  cut to white: a wall of O's, then one O; the camera dives into its stroke
  tl.add(() => { gsap.set('.site-header', { opacity: 1 }); cv.ox = 0; }, 5.6);
  tl.add(mode('owall', false), 5.6);
  tl.to(cv, { ox: () => -W * 0.08, duration: 0.4, ease: 'none' }, 5.6);
  tl.add(() => { mode('none', false)(); show('.i-o'); }, 6.0);
  tl.fromTo('.i-o', { scale: 0.5 }, { scale: 1, duration: 0.3, ease: 'expo.out' }, 6.0);
  tl.add(() => {
    // aim the zoom at the left side of the O's stroke so the screen fills with black
    const o = intro.querySelector('.i-o');
    gsap.set(o, { transformOrigin: '36% 50%' });
    gsap.set('.site-header', { opacity: 0 });
  }, 6.4);
  tl.to('.i-o', { scale: 60, duration: 0.55, ease: 'expo.in' }, 6.4);
  tl.set(intro, { backgroundColor: '#000000' }, 6.8); // whatever the zoom lands on, the dive ends in black

  // 6.95  star warp in the dark
  tl.add(() => { show('.i-o', false); seedStars(); }, 6.95);
  tl.add(mode('stars', true), 6.95);
  tl.fromTo(cv, { warp: 3.2 }, { warp: 0.15, duration: 1.3, ease: 'power2.out' }, 6.95);

  // 8.25  cut to white: ONEWORK small, then the banner comes up
  tl.add(() => { mode('none', false)(); show('.i-word'); gsap.set('.site-header', { opacity: 1 }); }, 8.25);
  tl.set(intro, { backgroundColor: '#FFFFFF' }, 8.25);
  tl.fromTo('.i-word', { scale: 0.9 }, { scale: 0.3, duration: 0.5, ease: 'expo.out' }, 8.25);
  tl.to(intro, { opacity: 0, duration: 0.45, ease: 'power3.out' }, 8.8);
  heroIntro(tl, 8.8);

  // never make people wait: any scroll, click or key jumps to the banner
  const skip = () => { if (tl.progress() < 1) { tl.progress(1); } };
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) => addEventListener(ev, skip, { once: true, passive: true }));
}
function heroIntro(tl, at) {
  tl.from('.about-mark img', { opacity: 0, scale: 0.85, rotation: -30, duration: 1.0, ease: 'expo.out' }, at);
  tl.from('.manifesto .w', { opacity: 0, y: 8, duration: 0.6, ease: 'expo.out', stagger: { amount: 0.4 } }, at + 0.1);
  tl.from('.about-wordmark span', { opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.04 }, at + 0.2);
  tl.from('.about-wordmark', { gap: '0.05em', duration: 0.8, ease: 'expo.out' }, at + 0.4);
  tl.from('.about-marquee', { opacity: 0, yPercent: 30, duration: 1.0, ease: 'expo.out' }, at + 0.3);
}
addEventListener('resize', () => { if (!intro.classList.contains('is-done')) sizeCanvas(); });
onMotionChange((calm) => { if (calm && film) film.progress(1); });

/* Logo mark follows the pointer, max 6° */
const mark = document.querySelector('.about-mark img');
const rx = gsap.quickTo(mark, 'rotationX', { duration: 0.8, ease: 'power3.out' });
const ry = gsap.quickTo(mark, 'rotationY', { duration: 0.8, ease: 'power3.out' });
addEventListener('pointermove', (e) => {
  if (!animated()) return;
  rx(((e.clientY / innerHeight) - 0.5) * -12);
  ry(((e.clientX / innerWidth) - 0.5) * 12);
});
onMotionChange((calm) => {
  if (calm) { rx(0); ry(0); }
});

/* ---------- Scroll motion ---------- */
const range = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const ease = (t) => 1 - Math.pow(1 - t, 3);
if (!STATIC) {

  // Founder: the name rises out of its mask, the photo opens like a shutter
  const fo = { trigger: '.founder', start: 'top 72%', once: true };
  gsap.from('#founderName span', { yPercent: 105, duration: 1.1, ease: 'expo.out', scrollTrigger: fo });
  gsap.from('.founder .role, .founder .cred, .founder .bio', { opacity: 0, y: 20, duration: 1, ease: 'expo.out', stagger: 0.1, delay: 0.2, scrollTrigger: fo });
  gsap.fromTo('.portrait', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.3, ease: 'expo.out', delay: 0.15, scrollTrigger: fo });
  gsap.from('.portrait img', { scale: 1.15, duration: 1.8, ease: 'expo.out', scrollTrigger: fo });

  // Our Team: the spaced title opens like the wordmark; each department's drawing draws itself
  gsap.from('.spaced-title', { letterSpacing: '0.1em', opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.team', start: 'top 75%', once: true } });
  gsap.utils.toArray('.dept').forEach((d, i) => {
    const st = { trigger: d, start: 'top 82%', once: true };
    gsap.fromTo(d.querySelector('.dept-art'), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.out', delay: i * 0.1, scrollTrigger: st });
    d.querySelectorAll('.dg path').forEach((path) => {
      const len = path.getTotalLength();
      gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: 'power3.out', delay: 0.4 + i * 0.1, scrollTrigger: st });
    });
    gsap.from(d.querySelectorAll('.dg circle'), { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'expo.out', stagger: 0.08, delay: 1 + i * 0.1, scrollTrigger: st });
    gsap.from(d.querySelectorAll('.dept-name .line-inner'), { yPercent: 105, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.2 + i * 0.1, scrollTrigger: st });
    gsap.from(d.querySelectorAll('.dept-tag, .dept-core, .dept-list li'), { opacity: 0, y: 14, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.4 + i * 0.1, scrollTrigger: st });
  });
  // a light lift on hover, the lines brighten
  gsap.utils.toArray('.dept').forEach((d) => {
    const art = d.querySelector('.dept-art');
    d.addEventListener('pointerenter', () => animated() && gsap.to(art, { y: -6, duration: 0.6, ease: 'expo.out' }));
    d.addEventListener('pointerleave', () => gsap.to(art, { y: 0, duration: 0.6, ease: 'expo.out' }));
  });

  // How We Work Together: title lines rise
  gsap.from('.work-title .line-inner', { yPercent: 105, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.work', start: 'top 70%', once: true } });
  gsap.from('.work-kicker, .work-desc', { opacity: 0, y: 16, duration: 1, ease: 'expo.out', stagger: 0.15, delay: 0.3, scrollTrigger: { trigger: '.work', start: 'top 70%', once: true } });

  // Story and office
  gsap.from('.story-year', { opacity: 0, y: 40, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.story', start: 'top 75%', once: true } });
  gsap.to('.office-hero img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.office-hero', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.office-title, .office-desc', { opacity: 0, y: 20, duration: 1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.office-copy', start: 'top 80%', once: true } });
  gsap.utils.toArray('.office-grid li').forEach((li, i) => {
    gsap.fromTo(li, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'expo.out', delay: i * 0.12, scrollTrigger: { trigger: '.office-grid', start: 'top 85%', once: true } });
  });
}
setupReveals();

/* ---------- Three departments → three perspectives → one project → ONEWORK ----------
   While the section is held: the dots appear, each department's four dots join into its own shape,
   all three gather round one centre, then every dot moves onto a corner of the logo mark, the outline
   is drawn, and the logo itself comes up. The 12 dots are exactly the logo's 12 corners:
   8 around the outer octagon and 4 around the diagonal slot. */
const svgNS = 'http://www.w3.org/2000/svg';
const dotEls = [...document.querySelectorAll('#workDots .wd')];
const hub = document.querySelector('#workDots .wd-hub');
const logoImg = document.querySelector('#workDots .wd-logo');
const links = document.getElementById('workLinks');
const outlineG = document.getElementById('workOutline');
const HUB = { x: 622, y: 175 };
const LOGO_C = [36.76, 35.22], LOGO_S = 3.2;           // logo units (onework-mark.svg) → section units
const toSvg = ([x, y]) => ({ x: HUB.x + (x - LOGO_C[0]) * LOGO_S, y: HUB.y + (y - LOGO_C[1]) * LOGO_S });
const OUTER = [[32.78, 14.24], [46.79, 13.91], [57.56, 24.16], [57.91, 38.17], [40.74, 56.21], [26.75, 56.52], [15.98, 46.27], [15.61, 32.28]].map(toSvg);
const INNER = [[39.96, 21.08], [50.73, 31.33], [33.56, 49.37], [22.79, 39.12]].map(toSvg);
const CORNERS = [...OUTER, ...INNER];
const dots = dotEls.map((el, i) => {
  const g = +el.dataset.g;
  const k = dotEls.filter((d) => +d.dataset.g === g).indexOf(el);
  // gathered place: a ring around the hub, each department holding one third of it
  const a = (-Math.PI / 2) + (g * 2 * Math.PI) / 3 + (k - 1.5) * 0.36;
  return { el, i, g, x0: +el.getAttribute('cx'), y0: +el.getAttribute('cy'), x1: HUB.x + Math.cos(a) * 92, y1: HUB.y + Math.sin(a) * 68 };
});
// each dot takes the nearest free logo corner (shortest pairs first), so nobody crosses the whole mark
{
  const pairs = [];
  dots.forEach((d) => CORNERS.forEach((c, ci) => pairs.push([Math.hypot(d.x1 - c.x, d.y1 - c.y), d, ci])));
  pairs.sort((a, b) => a[0] - b[0]);
  const taken = new Set();
  pairs.forEach(([, d, ci]) => { if (d.c === undefined && !taken.has(ci)) { d.c = ci; taken.add(ci); } });
  dots.forEach((d) => { d.x2 = CORNERS[d.c].x; d.y2 = CORNERS[d.c].y; });
}
const mkLine = (parent) => { const l = document.createElementNS(svgNS, 'line'); parent.append(l); return l; };
const groupLines = [0, 1, 2].flatMap((g) => {
  const ds = dots.filter((d) => d.g === g);
  return ds.map((d, k) => ({ a: d, b: ds[(k + 1) % ds.length], el: mkLine(links) }));
});
const hubLines = dots.map((d) => ({ a: d, el: mkLine(links) }));
// the logo outline, drawn corner to corner through whichever dot holds each corner
const byCorner = (ci) => dots.find((d) => d.c === ci);
const outlineEdges = [
  ...OUTER.map((_, i) => [i, (i + 1) % OUTER.length]),
  ...INNER.map((_, i) => [OUTER.length + i, OUTER.length + ((i + 1) % INNER.length)]),
].map(([a, b]) => ({ a: byCorner(a), b: byCorner(b), el: mkLine(outlineG) }));

const work = { p: STATIC ? 1 : 0, s: STATIC ? 1 : 0 };
// the section holds still while the dots play out, then the page moves on
if (!STATIC) ScrollTrigger.create({ trigger: '.work', start: 'top top', end: '+=200%', pin: true, refreshPriority: 1, onUpdate: (st) => { work.p = st.progress; } });
let workOn = false;
new IntersectionObserver(([en]) => { workOn = en.isIntersecting; }).observe(document.querySelector('.work'));
const set = (el, a) => { for (const k in a) el.setAttribute(k, typeof a[k] === 'number' ? a[k].toFixed(1) : a[k]); };
function drawWork(t) {
  work.s += (work.p - work.s) * (animated() ? 0.1 : 1);
  const p = work.s;
  const appear = range(p, 0, 0.2), join = range(p, 0.18, 0.36), gather = ease(range(p, 0.36, 0.56));
  const toLogo = ease(range(p, 0.58, 0.78)), outline = ease(range(p, 0.7, 0.86)), reveal = ease(range(p, 0.84, 0.98));
  const float = animated() ? 1 - toLogo : 0;
  dots.forEach((d) => {
    const show = ease(range(appear, d.i / 16, d.i / 16 + 0.4));
    const gx = d.x0 + (d.x1 - d.x0) * gather, gy = d.y0 + (d.y1 - d.y0) * gather;
    d.x = gx + (d.x2 - gx) * toLogo;
    d.y = gy + (d.y2 - gy) * toLogo + Math.sin(t * 0.8 + d.i) * 3 * float * (1 - gather * 0.6);
    set(d.el, { cx: d.x, cy: d.y, r: 5 * show * (1 - reveal * 0.6) });
    d.el.style.opacity = 1 - reveal * 0.7;
  });
  groupLines.forEach(({ a, b, el }) => {
    const f = ease(join);
    set(el, { x1: a.x, y1: a.y, x2: a.x + (b.x - a.x) * f, y2: a.y + (b.y - a.y) * f });
    el.style.opacity = join > 0 ? 1 - toLogo : 0;
  });
  const reach = gather * (1 - toLogo);                    // lines to the centre retract as the logo forms
  hubLines.forEach(({ a, el }) => {
    set(el, { x1: a.x, y1: a.y, x2: a.x + (HUB.x - a.x) * reach, y2: a.y + (HUB.y - a.y) * reach });
    el.style.opacity = reach > 0.01 ? 0.7 : 0;
  });
  outlineEdges.forEach(({ a, b, el }) => {
    set(el, { x1: a.x, y1: a.y, x2: a.x + (b.x - a.x) * outline, y2: a.y + (b.y - a.y) * outline });
    el.style.opacity = outline > 0.01 ? 1 - reveal * 0.75 : 0;
  });
  hub.setAttribute('r', (10 * gather * (1 - toLogo)).toFixed(2));
  logoImg.setAttribute('opacity', reveal.toFixed(3));
  logoImg.style.transform = `scale(${0.94 + 0.06 * reveal})`;
}
drawWork(0);
gsap.ticker.add((time) => { if (workOn) drawWork(time); });


/* ---------- Our story: the year counts from 2016 to 2025 as you read down ---------- */
{
  const yearEl = document.querySelector('.story-year .count');
  const FROM = 2016, TO = 2025;
  if (yearEl && !STATIC) {
    let shown = FROM;
    ScrollTrigger.create({
      trigger: '.story', start: 'top 35%', end: 'bottom 65%',
      onUpdate: (st) => {
        const y = Math.round(FROM + (TO - FROM) * st.progress);
        if (y === shown) return;
        shown = y;
        yearEl.textContent = y;
        // each new year lifts in softly, never a flicker (MOTION.md §6.1)
        if (animated()) gsap.fromTo(yearEl, { yPercent: 18, opacity: 0.4 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out', overwrite: true });
      },
    });
  }
}


/* ---------- Team photos: a photo in assets/about/team/ replaces its line drawing ---------- */
document.querySelectorAll('.dept-art[data-src]').forEach((box) => {
  const img = new Image();
  img.onload = () => {
    img.alt = box.dataset.alt || '';
    box.append(img);
    if (animated()) gsap.fromTo(img, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out' });
    gsap.to(box.querySelector('svg'), { opacity: 0, duration: 0.6, delay: 0.3 });
  };
  img.src = box.dataset.src;   // no file yet: the error is silent and the drawing stays
});

fontsReady.then(playIntro);
ScrollTrigger.sort(); ScrollTrigger.refresh();   // the pin above was created after the triggers below it
// images below the fold load lazily; re-measure the pinned section once each one has its real size
document.querySelectorAll('img[loading="lazy"]').forEach((img) => { if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }); });
