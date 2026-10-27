// ONEWORK — Service page. Mono tone. The banner's idea is focus: type goes from blurred to sharp (MOTION.md §4).
import { gsap, ScrollTrigger, motion, STATIC, isSmall, root, setupReveals, onLangChange, onMotionChange, fontsReady } from './site.js';
import './service-twin.js';   // the 3D lifecycle sits right after the banner, so its pin is created first

const animated = () => !STATIC && !motion.calm;

/* ---------- Focus title: one span per character ---------- */
// Which characters stay slightly soft at rest, as in the service banner.
const TITLE = {
  en: [['ONEWORK', [4, 6]], ['SERVICE', [1, 4]], ['OFFERINGS', [2, 5, 7]]],
  zh: [['工一科技', [3]], ['服務項目', [2]]],
};
const REST = 3.2;   // px of blur on the soft characters
const lines = document.getElementById('focusLines');
let chars = [];

function buildTitle() {
  const set = root.lang === 'zh-Hant' ? TITLE.zh : TITLE.en;
  lines.replaceChildren();
  chars = [];
  set.forEach(([word, soft]) => {
    const line = document.createElement('span');
    line.className = 'ft-line';
    [...word].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      s.dataset.rest = soft.includes(i) ? REST : 0;
      s.style.setProperty('--b', animated() ? s.dataset.rest : 0);
      line.append(s);
      chars.push(s);
    });
    lines.append(line);
  });
}
buildTitle();
onLangChange(() => {
  buildTitle();
  if (animated()) gsap.from(chars, { '--b': 12, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: { amount: 0.4, from: 'random' } });
});

/* ---------- Banner intro: title readable within 1s ---------- */
const frames = gsap.utils.toArray('.frame');
let introDone = !animated();
function intro() {
  if (!animated()) return;
  const tl = gsap.timeline({ onComplete: () => { introDone = true; } });
  // every character starts out of focus and pulls in; the soft ones stop just short
  tl.fromTo(chars, { '--b': 16, opacity: 0 }, {
    '--b': (i, el) => el.dataset.rest, opacity: 1, duration: 1, ease: 'expo.out',
    stagger: { amount: 0.45, from: 'random' },
  }, 0.1);
  // the frames swing in from depth and land flat, like slabs settling into place
  tl.fromTo(frames, {
    rotationY: (i) => [-70, 60, -50, 65][i], rotationX: 28, z: -700, opacity: 0,
  }, {
    rotationY: 0, rotationX: 0, z: 0, opacity: 1, duration: 1.5, ease: 'expo.out', stagger: 0.08,
  }, 0.15);
  tl.from('.site-header', { opacity: 0, y: -12, duration: 0.8, ease: 'power3.out' }, 0.4);
  tl.from('.svc-mark', { opacity: 0, rotation: -30, scale: 0.85, filter: 'brightness(0) invert(0.95) blur(10px)', duration: 1.2, ease: 'expo.out' }, 0.5);
  tl.from('.svc-wordmark span', { opacity: 0, filter: 'blur(8px)', duration: 0.6, ease: 'power3.out', stagger: 0.04 }, 0.7);
  tl.from('.svc-wordmark', { gap: '0.1em', duration: 0.8, ease: 'expo.out' }, 1.1);
  tl.from('.svc-intro', { opacity: 0, y: 16, duration: 0.8, ease: 'power3.out' }, 0.9);
}

/* ---------- Focus lens: characters near the pointer come into focus ---------- */
const hero = document.querySelector('.svc-hero');
const LENS = 180;
let lensFrame = 0;
hero.addEventListener('pointermove', (e) => {
  if (!animated() || isSmall || lensFrame) return;
  lensFrame = requestAnimationFrame(() => {
    lensFrame = 0;
    chars.forEach((s) => {
      if (+s.dataset.rest === 0) return;
      const r = s.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      gsap.to(s, { '--b': d < LENS ? 0 : s.dataset.rest, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    });
  });
});
hero.addEventListener('pointerleave', () => {
  if (!animated()) return;
  gsap.to(chars, { '--b': (i, el) => el.dataset.rest, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
});

/* ---------- Pointer depth: logo tilts, frames turn and shift by their depth (max 8°) ---------- */
const mark = document.querySelector('.svc-mark');
const rx = gsap.quickTo(mark, 'rotationX', { duration: 0.8, ease: 'power3.out' });
const ry = gsap.quickTo(mark, 'rotationY', { duration: 0.8, ease: 'power3.out' });
gsap.set(mark, { transformPerspective: 600 });
const frameMoves = frames.map((f) => ({
  d: +f.dataset.depth,
  x: gsap.quickTo(f, 'x', { duration: 1.2, ease: 'power3.out' }),
  rx: gsap.quickTo(f, 'rotationX', { duration: 1.2, ease: 'power3.out' }),
  ry: gsap.quickTo(f, 'rotationY', { duration: 1.2, ease: 'power3.out' }),
}));
addEventListener('pointermove', (e) => {
  if (!animated()) return;
  const nx = (e.clientX / innerWidth) - 0.5, ny = (e.clientY / innerHeight) - 0.5;
  rx(ny * -12); ry(nx * 12);
  if (!introDone || isSmall) return;
  frameMoves.forEach((m) => { m.x(nx * -40 * m.d); m.rx(ny * 16 * m.d); m.ry(nx * -16 * m.d); });
});

onMotionChange((calm) => {
  if (calm) {
    rx(0); ry(0);
    frameMoves.forEach((m) => { m.x(0); m.rx(0); m.ry(0); });
    gsap.set(chars, { '--b': 0 });
  } else gsap.set(chars, { '--b': (i, el) => el.dataset.rest });
});

/* ---------- Scroll motion ---------- */
if (!STATIC) {
  // leaving the banner: frames fly past the camera at their own depth, the title falls out of focus
  frames.forEach((f, i) => {
    const d = +f.dataset.depth;
    gsap.fromTo(f, { y: 0, z: 0, rotationZ: 0 }, {
      y: -220 * d, z: 420 * d, rotationZ: i % 2 ? 8 : -8, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  });
  gsap.to('.focus-title', { '--out': 12, yPercent: -30, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.svc-sign', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: '20% top', end: 'bottom top', scrub: true } });
  gsap.to('.svc-intro', { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: '30% top', end: '80% top', scrub: true } });

  // Platforms: screenshots tilt up out of the floor as they arrive
  gsap.utils.toArray('.shot').forEach((s) => {
    gsap.fromTo(s, { rotationX: 24, y: 90, scale: 0.9, opacity: 0.15, transformPerspective: 1200, transformOrigin: '50% 100%' }, {
      rotationX: 0, y: 0, scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: s, start: 'top 98%', end: 'top 45%', scrub: true },
    });
    gsap.fromTo(s.querySelector('span'), { filter: 'blur(10px)' }, { filter: 'blur(0px)', ease: 'none', scrollTrigger: { trigger: s, start: 'top 80%', end: 'top 45%', scrub: true } });
  });
  gsap.utils.toArray('.plat').forEach((p) => {
    gsap.from(p.querySelectorAll('.plat-lede, .caps li, .chips'), { opacity: 0, y: 20, filter: 'blur(6px)', duration: 0.9, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: p.querySelector('.plat-lede'), start: 'top 85%', once: true } });
  });
}

/* Platforms index: the platform in view is the one in focus */
const links = [...document.querySelectorAll('.rack-index a')];
const setOn = (i) => links.forEach((a, j) => a.classList.toggle('is-on', i === j));
setOn(0);
document.querySelectorAll('.plat').forEach((p, i) => {
  ScrollTrigger.create({ trigger: p, start: 'top 55%', end: 'bottom 55%', onToggle: (self) => { if (self.isActive) setOn(i); } });
});

/* ---------- Works with: two slow tickers; scrolling speeds them up, then they settle ---------- */
const tickers = gsap.utils.toArray('.ticker').map((t) => {
  const row = t.querySelector('.ticker-row');
  row.append(...[...row.children].map((n) => n.cloneNode(true)));   // two copies loop seamlessly
  return { row, dir: +t.dataset.dir, x: 0 };
});
let boost = 0;
let worksOn = false;
new IntersectionObserver(([en]) => { worksOn = en.isIntersecting; }).observe(document.querySelector('.works'));
if (!STATIC) {
  ScrollTrigger.create({ trigger: '.works', start: 'top bottom', end: 'bottom top', onUpdate: (self) => { boost = Math.min(Math.abs(self.getVelocity()) / 120, 10); } });
  gsap.ticker.add(() => {
    if (!worksOn || !animated()) return;
    boost *= 0.94;
    tickers.forEach((t) => {
      const half = t.row.scrollWidth / 2;
      t.x += t.dir * (0.45 + boost);
      if (t.x <= -half) t.x += half;
      if (t.x > 0) t.x -= half;
      t.row.style.transform = `translate3d(${t.x}px,0,0)`;
    });
  });
  // start the second row offset so the two rows never line up
  tickers[1] && (tickers[1].x = -tickers[1].row.scrollWidth / 4);
}

/* ---------- Core technology: GIS + BIM 3D + IoT + AI come into focus, then converge into the twin ---------- */
const termEls = gsap.utils.toArray('.sum .term:not(.result)');
const opEls = gsap.utils.toArray('.sum .op');
const resultEl = document.querySelector('.sum .result');
const mm = gsap.matchMedia();
if (!STATIC) {
  mm.add('(min-width: 901px)', () => {
    const toResult = (i, el) => resultEl.getBoundingClientRect().left - el.getBoundingClientRect().left;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '#stack', start: 'top top', end: '+=160%', pin: '.stack-stage', scrub: 0.6, invalidateOnRefresh: true },
    });
    tl.set(termEls.map((t) => t.querySelector('b')), { '--b': 14, opacity: 0, y: 50 })
      .set(termEls.map((t) => t.querySelector('span')), { opacity: 0 })
      .set(opEls, { opacity: 0, scale: 0.4 })
      .set(resultEl.querySelector('b'), { '--b': 18, opacity: 0 })
      .set(resultEl.querySelector('span'), { opacity: 0 });
    termEls.forEach((t, i) => {
      tl.to(t.querySelector('b'), { '--b': 0, opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, i * 0.7);
      tl.to(t.querySelector('span'), { opacity: 1, duration: 0.6 }, i * 0.7 + 0.3);
      tl.to(opEls[i], { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' }, i * 0.7 + 0.45);
    });
    tl.to(resultEl.querySelector('b'), { '--b': 0, opacity: 1, duration: 1, ease: 'expo.out' }, 3.1);
    // everything slides into the twin and dissolves; the twin grows
    tl.to([...termEls, ...opEls.slice(0, -1)], { x: toResult, opacity: 0, filter: 'blur(10px)', duration: 1.4, ease: 'power3.inOut', stagger: 0.04 }, 4.2);
    tl.to(opEls[opEls.length - 1], { opacity: 0, duration: 0.6 }, 4.4);
    tl.to(resultEl, { x: () => -resultEl.getBoundingClientRect().left + termEls[0].getBoundingClientRect().left, borderLeftColor: 'rgba(255,255,255,0)', duration: 1.4, ease: 'power3.inOut' }, 4.6);
    tl.to(resultEl.querySelector('b'), { scale: 2.2, duration: 1.4, ease: 'power3.inOut' }, 4.6);
    tl.to(resultEl.querySelector('span'), { opacity: 1, y: 60, duration: 0.8 }, 5.4);
    tl.to({}, { duration: 0.6 });   // hold the final frame
  });
  mm.add('(max-width: 900px)', () => {
    gsap.from('.sum .term b', { '--b': 12, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.18, scrollTrigger: { trigger: '#sum', start: 'top 75%', once: true } });
    gsap.from('.sum .op', { opacity: 0, duration: 0.6, stagger: 0.18, delay: 0.1, scrollTrigger: { trigger: '#sum', start: 'top 75%', once: true } });
  });
}

/* ---------- Lifecycle: the line fills with scroll; each stage comes into focus as it is reached ---------- */
const stages = [...document.querySelectorAll('.life-stages li')];
const fill = document.getElementById('lifeFill');
if (STATIC) {
  stages.forEach((s) => s.classList.add('is-on'));
} else {
  const axis = isSmall ? 'scaleY' : 'scaleX';
  gsap.set(fill, { [axis]: 0 });
  ScrollTrigger.create({
    trigger: '#lifeTrack', start: 'top 80%', end: isSmall ? 'bottom 60%' : 'top 30%', scrub: true,
    onUpdate: (self) => {
      gsap.set(fill, { [axis]: self.progress });
      stages.forEach((s, i) => s.classList.toggle('is-on', self.progress >= i / (stages.length - 1) - 0.001));
    },
  });
  gsap.from('.life-stages li', { y: 40, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '#lifeTrack', start: 'top 85%', once: true } });

  // CTA: the closing line pulls together and into focus as it scrolls in
  gsap.fromTo('.cta-title', { '--b': 14, opacity: 0.3, letterSpacing: '0.12em' }, {
    '--b': 0, opacity: 1, letterSpacing: root.lang === 'zh-Hant' ? '0.02em' : '-0.02em', ease: 'none',
    scrollTrigger: { trigger: '.svc-cta', start: 'top 85%', end: 'top 35%', scrub: true },
  });
}

setupReveals();
fontsReady.then(intro);
