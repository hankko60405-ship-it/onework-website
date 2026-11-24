// ONEWORK — shared behaviour for every page (language, smooth scroll, header, reveals, Tweaks)
// Motion values follow MOTION.md.
const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const root = document.documentElement;
export const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};
export const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isSmall = matchMedia('(max-width: 900px)').matches;
export const motion = { calm: prefersReduced };   // follows the visitor's system setting only
/** Reduced motion: nothing pinned, no intros, everything readable at once (MOTION.md §6.5). */
export const STATIC = prefersReduced;
if (STATIC) root.classList.add('is-static');
root.classList.toggle('is-calm', motion.calm);

/* ---------- Language (EN / 中) ---------- */
const langListeners = [];
export const onLangChange = (fn) => langListeners.push(fn);
function setLang(next) {
  root.lang = next === 'zh' ? 'zh-Hant' : 'en';
  document.querySelectorAll('[data-en]').forEach((el) => {
    const v = el.getAttribute(next === 'zh' ? 'data-zh' : 'data-en');
    if (v !== null) el.textContent = v;
  });
  langListeners.forEach((fn) => fn(next));
  ScrollTrigger.refresh();
}
/* ---------- Important notice: fixed bottom-right, opens on click ---------- */
(() => {
  const box = document.createElement('div');
  box.className = 'notice';
  box.innerHTML = `
    <div class="notice-panel" id="noticePanel" role="dialog" aria-labelledby="noticeTitle" hidden>
      <p class="notice-title" id="noticeTitle" data-en="Important Notice" data-zh="【重要聲明】">Important Notice</p>
      <p data-en="Recently there have been rumours, in the market and online, that the company is raising funds. The company hereby solemnly declares:" data-zh="近日坊間&網路傳聞本公司有進行資金募集之情事，本公司特此嚴正聲明：">Recently there have been rumours, in the market and online, that the company is raising funds. The company hereby solemnly declares:</p>
      <p class="notice-strong" data-en="The company currently has no plans to raise funds." data-zh="本公司目前並無任何募資之計劃。">The company currently has no plans to raise funds.</p>
      <p data-en="Do not trust investment offers from unknown sources, or you may be deceived. This statement is issued to set the record straight." data-zh="切勿輕信不明管道之投資邀約，以免受騙上當。特此聲明，以正視聽。">Do not trust investment offers from unknown sources, or you may be deceived. This statement is issued to set the record straight.</p>
      <p class="notice-sign" data-en="工一科技股份有限公司" data-zh="工一科技股份有限公司 敬啟">工一科技股份有限公司</p>
      <button class="notice-close" type="button" id="noticeClose" data-en="Close" data-zh="關閉">Close</button>
    </div>
    <button class="notice-btn" type="button" id="noticeBtn" aria-expanded="false" aria-controls="noticePanel" data-en="IMPORTANT NOTICE" data-zh="重要聲明">IMPORTANT NOTICE</button>`;
  document.body.append(box);
  const btn = box.querySelector('#noticeBtn'), panel = box.querySelector('#noticePanel');
  const set = (open) => { panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open) panel.querySelector('#noticeClose').focus({ preventScroll: true }); };
  btn.addEventListener('click', () => set(panel.hidden));
  box.querySelector('#noticeClose').addEventListener('click', () => { set(false); btn.focus({ preventScroll: true }); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus({ preventScroll: true }); } });
})();

/* ---------- Intro video popup: opened by any [data-video-open] link (the nav's VIDEO item).
   On the home page (<body data-intro-video="auto">) it also opens once per visit. ---------- */
(() => {
  const SRC = 'https://player.vimeo.com/video/1248571382?autoplay=1&muted=1&autopause=0&dnt=1';
  const dlg = document.createElement('dialog');
  dlg.className = 'intro-video';
  dlg.id = 'introVideo';
  dlg.setAttribute('aria-label', 'ONEWORK video');
  dlg.setAttribute('data-lenis-prevent', '');
  dlg.innerHTML = `
    <div class="intro-video-box">
      <button class="intro-video-close" type="button" id="introVideoClose">
        <span data-en="CLOSE" data-zh="關閉">CLOSE</span> <span aria-hidden="true">✕</span>
      </button>
      <div class="intro-video-frame">
        <iframe id="introVideoFrame" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" title="ONEWORK video"></iframe>
      </div>
    </div>`;
  document.body.append(dlg);
  if (typeof dlg.showModal !== 'function') return;
  const frame = dlg.querySelector('iframe');
  const closeBtn = dlg.querySelector('#introVideoClose');
  let opener = null;

  function open(from) {
    if (dlg.open) return;
    opener = from || null;
    frame.src = SRC;                                   // set on open, cleared on close so playback stops
    root.classList.add('has-intro-video');
    dlg.showModal();
    closeBtn.focus({ preventScroll: true });
  }
  dlg.addEventListener('close', () => {
    frame.removeAttribute('src');
    root.classList.remove('has-intro-video');
    opener?.focus({ preventScroll: true });
  });
  closeBtn.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });   // click on the dark backdrop
  document.querySelectorAll('[data-video-open]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); open(a); }));

  if (document.body.dataset.introVideo === 'auto') {
    const KEY = 'ow-intro-video-seen';
    let seen = false;
    try { seen = !!sessionStorage.getItem(KEY); sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked: show it anyway */ }
    if (!seen) open();
  }
})();

/* Each page exists twice: English at /about/, Chinese at /zh/about/ (zh/ is generated by tools/build_zh.py).
   The page's language comes from its address; EN / 中 moves to the other address and remembers the choice. */
const SITE_ROOT = new URL('../../', import.meta.url).pathname;           // works at a web root or in a subfolder
const relPath = location.pathname.startsWith(SITE_ROOT) ? location.pathname.slice(SITE_ROOT.length) : '';
const isZhPage = relPath === 'zh' || relPath.startsWith('zh/');
const lang = isZhPage ? 'zh' : 'en';
const otherLangUrl = () => SITE_ROOT + (isZhPage ? relPath.replace(/^zh\/?/, '') : 'zh/' + relPath) + location.search + location.hash;
const browserZh = (navigator.language || '').toLowerCase().startsWith('zh');
const wanted = store.get('ow-lang') || (browserZh ? 'zh' : 'en');
// An English page opened by someone who reads Chinese (or chose 中 before): go to its Chinese twin.
// Only from a served page, not file://; crawlers browse in English, so they always get the page they asked for.
if (!isZhPage && wanted === 'zh' && location.protocol.startsWith('http') && relPath !== 'c/' && !relPath.startsWith('c/')) location.replace(otherLangUrl());
setLang(lang);
document.getElementById('langToggle')?.addEventListener('click', () => {
  store.set('ow-lang', isZhPage ? 'en' : 'zh');
  location.href = otherLangUrl();
});

/* ---------- Smooth scroll ---------- */
let lenis = null;
export function startLenis() {
  if (lenis || motion.calm || !Lenis) return;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
}
export function stopLenis() { if (lenis) { lenis.destroy(); lenis = null; } }
gsap.ticker.add((t) => { if (lenis) lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
startLenis();

/* ---------- Header ---------- */
const header = document.querySelector('.site-header');
const onScrollHeader = () => header?.classList.toggle('is-scrolled', scrollY > 40);
addEventListener('scroll', onScrollHeader, { passive: true });
onScrollHeader();

/* ---------- Phone menu: under 900px the nav hides; this button opens it full screen ---------- */
(() => {
  const nav = header?.querySelector('.main-nav');
  if (!header || !nav) return;
  nav.id = nav.id || 'mainNav';
  const L = lang === 'zh' ? { open: '開啟選單', close: '關閉選單' } : { open: 'Open menu', close: 'Close menu' };
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'menu-btn';
  btn.setAttribute('aria-controls', nav.id);
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', L.open);
  btn.innerHTML = '<span></span><span></span>';
  header.append(btn);
  const set = (open) => {
    root.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? L.close : L.open);
    if (open) { lenis?.stop(); nav.querySelector('a')?.focus({ preventScroll: true }); } else lenis?.start();
  };
  btn.addEventListener('click', () => set(!root.classList.contains('menu-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { set(false); btn.focus({ preventScroll: true }); } });
  matchMedia('(min-width: 901px)').addEventListener('change', (m) => { if (m.matches) set(false); });
})();

/* ---------- Scroll reveals: section heads + anything marked [data-reveal] ---------- */
export function setupReveals() {
  if (STATIC) return;
  gsap.utils.toArray('.section-head').forEach((el) => {
    gsap.from(el.children, {
      opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 32, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

/* ---------- Motion setting ---------- */
const motionListeners = [];
export const onMotionChange = (fn) => motionListeners.push(fn);
// The Tweaks panel is gone: headlines are always Archivo, and motion follows prefers-reduced-motion.

export const fontsReady = document.fonts.ready.then(() => ScrollTrigger.refresh());
