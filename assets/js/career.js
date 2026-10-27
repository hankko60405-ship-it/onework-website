// ONEWORK — Career. Forest tone: a slow watercolour wash, nothing hurried (MOTION.md §1, §4).
import { gsap, ScrollTrigger, motion, STATIC, isSmall, setupReveals, onMotionChange, fontsReady } from './site.js';

const animated = () => !STATIC && !motion.calm;
const heroes = gsap.utils.toArray('.cr-hero');

/* ---------- the wash drifts, slowly, like pigment settling in water ---------- */
const drifts = [];
function startDrift() {
  if (!animated() || drifts.length) return;
  heroes.forEach((h) => {
    h.querySelectorAll('.wash i').forEach((b, i) => {
      drifts.push(gsap.to(b, {
        xPercent: i % 2 ? -12 : 10, yPercent: i % 2 ? 8 : -10, scale: 1.12,
        duration: 14 + i * 3, ease: 'sine.inOut', yoyo: true, repeat: -1,
      }));
    });
  });
}
function stopDrift() { drifts.forEach((t) => t.kill()); drifts.length = 0; gsap.set('.wash i', { clearProps: 'transform' }); }
startDrift();
onMotionChange((calm) => (calm ? stopDrift() : startDrift()));

/* ---------- banner intro: the title rises within the first second ---------- */
function intro() {
  if (!animated()) return;
  const h = heroes[0];
  const tl = gsap.timeline();
  tl.from(h.querySelector('.wash'), { opacity: 0, scale: 1.08, duration: 1.6, ease: 'expo.out' }, 0);
  tl.from(h.querySelector('.line-inner'), { yPercent: 105, duration: 0.9, ease: 'expo.out' }, 0.2);
  tl.from('.site-header', { opacity: 0, y: -12, duration: 0.8, ease: 'power3.out' }, 0.4);
  tl.from(h.querySelectorAll('.cr-wordmark span'), { opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04 }, 0.7);
  tl.from(h.querySelector('.cr-wordmark'), { gap: '0.05em', duration: 0.8, ease: 'expo.out' }, 1.1);
  tl.from(h.querySelector('.cr-sub'), { opacity: 0, y: 14, duration: 0.8, ease: 'power3.out' }, 0.9);
  tl.from('.cr-switch', { opacity: 0, y: 20, duration: 0.8, ease: 'expo.out' }, 1.2);
}

/* ---------- scroll ---------- */
if (!STATIC) {
  heroes.forEach((h, k) => {
    // the wash slides slower than the page; the copy lifts away
    gsap.to(h.querySelector('.wash'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(h.querySelector('.cr-hero-copy'), { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true } });
    if (k > 0) {
      // the second banner's title rises as it arrives
      gsap.from(h.querySelector('.line-inner'), { yPercent: 105, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 60%', once: true } });
      gsap.from(h.querySelectorAll('.cr-wordmark span'), { opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04, delay: 0.3, scrollTrigger: { trigger: h, start: 'top 60%', once: true } });
      gsap.from(h.querySelector('.cr-wordmark'), { gap: '0.05em', duration: 0.8, ease: 'expo.out', delay: 0.6, scrollTrigger: { trigger: h, start: 'top 60%', once: true } });
    }
  });

  gsap.utils.toArray('.cr-lead, .cr-block, .cr-cta').forEach((el) => {
    gsap.from(el.children, { opacity: 0, y: 28, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
  });
  gsap.utils.toArray('.places, .chips, .ticks, .perks, .facts').forEach((el) => {
    gsap.from(el.children, { opacity: 0, y: 20, duration: 0.8, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  // application steps: the line draws with scroll and each step lights up as it is reached
  gsap.utils.toArray('.process').forEach((p) => {
    const line = p.querySelector('.process-line i');
    const steps = [...p.querySelectorAll('.ap-step')];
    const axis = isSmall ? 'scaleY' : 'scaleX';
    gsap.set(line, { [axis]: 0 });
    ScrollTrigger.create({
      trigger: p, start: 'top 80%', end: isSmall ? 'bottom 55%' : 'top 35%', scrub: true,
      onUpdate: (s) => {
        gsap.set(line, { [axis]: s.progress });
        steps.forEach((st, i) => st.classList.toggle('is-on', s.progress >= i / (steps.length - 1) - 0.001));
      },
    });
  });
} else {
  document.querySelectorAll('.ap-step').forEach((s) => s.classList.add('is-on'));
}

/* ---------- the path switch follows the page ---------- */
const links = [...document.querySelectorAll('.cr-switch a')];
const intern = document.getElementById('internship');
ScrollTrigger.create({
  trigger: intern, start: 'top 50%',
  onEnter: () => setOn('#internship'), onLeaveBack: () => setOn('#career'),
});
function setOn(hash) { links.forEach((a) => a.classList.toggle('is-on', a.hash === hash)); }
links.forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  const el = document.querySelector(a.hash);
  window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: motion.calm ? 'auto' : 'smooth' });
  history.replaceState(null, '', a.hash);
}));
// arriving from the old internship address (/c/) or a #internship link
if (location.hash === '#internship') requestAnimationFrame(() => window.scrollTo(0, intern.getBoundingClientRect().top + scrollY));

setupReveals();
fontsReady.then(intro);
