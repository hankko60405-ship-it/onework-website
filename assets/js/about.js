// ONEWORK — About page. Motion values follow MOTION.md (§4: About lines draw slowly; §6: title readable within 1s).
import { gsap, ScrollTrigger, motion, STATIC, setupReveals, onLangChange, onMotionChange, fontsReady } from './site.js';

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

/* ---------- Banner intro ---------- */
const lines = [...document.querySelectorAll('.net-line')];
lines.forEach((p) => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = animated() ? len : 0; });
const textPaths = document.querySelectorAll('.plane textPath');

function intro() {
  if (!animated()) return;
  const tl = gsap.timeline();
  tl.to(lines, { strokeDashoffset: 0, duration: 1.6, ease: 'power3.out', stagger: 0.15 }, 0);
  tl.from('.orb', { opacity: 0, scale: 0.6, duration: 1.6, ease: 'expo.out', stagger: 0.2 }, 0);
  // the manifesto is the page's main text: it starts at 0.2s so it is readable within 1s
  tl.from('.manifesto .w', { opacity: 0, y: 14, duration: 0.7, ease: 'expo.out', stagger: { amount: 0.6 } }, 0.2);
  tl.from('.about-mark img', { opacity: 0, scale: 0.85, rotation: -30, duration: 1.2, ease: 'expo.out' }, 0.3);
  tl.from('.about-wordmark span', { opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04 }, 0.5);
  tl.from('.about-wordmark', { gap: '0.05em', duration: 0.8, ease: 'expo.out' }, 0.9);
  tl.fromTo('.plane', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'expo.out' }, 0.6);
  tl.fromTo(textPaths, { attr: { startOffset: '45%' }, opacity: 0 }, { attr: { startOffset: '0%' }, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.12 }, 0.9);
  tl.from('.site-header', { opacity: 0, y: -12, duration: 0.8, ease: 'power3.out' }, 0.4);
}

/* Slow breathing light — small and slow, never flashing (MOTION.md §6.1) */
let breathe = null;
function startBreathe() {
  if (!animated() || breathe) return;
  breathe = gsap.to('.orb', { scale: 1.06, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 1.5 });
}
startBreathe();

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
  if (calm) { rx(0); ry(0); breathe?.kill(); breathe = null; gsap.set('.orb', { scale: 1 }); } else startBreathe();
});

/* ---------- Scroll motion ---------- */
const range = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const ease = (t) => 1 - Math.pow(1 - t, 3);
if (!STATIC) {
  gsap.to('.plane', { y: -60, ease: 'none', scrollTrigger: { trigger: '.about-hero', start: 'top top', end: 'bottom top', scrub: true } });

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

fontsReady.then(intro);
ScrollTrigger.sort(); ScrollTrigger.refresh();   // the pin above was created after the triggers below it
// images below the fold load lazily; re-measure the pinned section once each one has its real size
document.querySelectorAll('img[loading="lazy"]').forEach((img) => { if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }); });
