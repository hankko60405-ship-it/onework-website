// ONEWORK — Awards as a holographic die. Each face carries one award; the die rolls to the next one.
// Nine awards, six faces: a face is repainted while it is turned away, so the die can roll forever.
// Mist tone (MOTION.md §1): Logo teal for the glow, no neon. Slow scan lines, never flashing (§6).
import * as THREE from 'three';
import { gsap, motion, isSmall, onLangChange } from './site.js';

export function initCube() {
  const canvas = document.getElementById('cubeGl');
  const awardsEl = document.getElementById('awards');
  const yearEl = document.getElementById('cubeYear');
  const textEl = document.getElementById('cubeText');
  const items = [...document.querySelectorAll('#awGrid .aw')].map((li) => {
    const art = li.querySelector('.aw-art');
    return {
      li,
      tone: [...art.classList].find((c) => c.startsWith('tone-')),
      year: art.querySelector('.aw-year').textContent,
      word: art.querySelector('.aw-word').textContent,
    };
  });
  const N = items.length;
  const animated = () => !motion.calm;
  const TONES = {
    'tone-a': ['#5B8F96', '#47868D', '#FFFFFF'],
    'tone-b': ['#3D3D3D', '#1A1A1A', '#FFFFFF'],
    'tone-c': ['#9EB9BD', '#759FA4', '#FFFFFF'],
    'tone-d': ['#AFC5C8', '#8BADB1', '#3D3D3D'],
  };

  /* ---------- renderer ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 1.1, 8.2);
  camera.lookAt(0, 0.35, 0);

  /* ---------- face textures (painted on a 2D canvas) ---------- */
  const T = 768;
  const lang = () => (document.documentElement.lang === 'zh-Hant' ? 'zh' : 'en');
  function wrap(ctx, text, maxW) {
    const parts = lang() === 'zh' ? [...text] : text.split(' ');
    const lines = []; let line = '';
    parts.forEach((p) => {
      const test = line ? (lang() === 'zh' ? line + p : `${line} ${p}`) : p;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = p; } else line = test;
    });
    lines.push(line);
    return lines;
  }
  // each face's texture axes (BoxGeometry uv): u to the right, v up, in the die's own space
  const FACE_UV = [
    [[0, 0, -1], [0, 1, 0]], [[0, 0, 1], [0, 1, 0]], [[1, 0, 0], [0, 0, -1]],
    [[1, 0, 0], [0, 0, 1]], [[1, 0, 0], [0, 1, 0]], [[-1, 0, 0], [0, 1, 0]],
  ].map(([u, v]) => [new THREE.Vector3(...u), new THREE.Vector3(...v)]);
  // turn the artwork in 90° steps so its text stands upright for the viewer, whatever way the die landed
  function uprightAngle(face, q) {
    const U = FACE_UV[face][0].clone().applyQuaternion(q), V = FACE_UV[face][1].clone().applyQuaternion(q);
    const up = new THREE.Vector3(0, 1, 0);
    const cands = [[0, V], [Math.PI / 2, U], [Math.PI, V.clone().negate()], [-Math.PI / 2, U.clone().negate()]];
    return cands.reduce((b, c) => (c[1].dot(up) > b[1].dot(up) ? c : b))[0];
  }
  function paint(face, item, q = die.quaternion) {
    const { ctx, tex } = faces[face];
    const [c0, c1, ink] = TONES[item.tone];
    ctx.save();
    ctx.translate(T / 2, T / 2); ctx.rotate(uprightAngle(face, q)); ctx.translate(-T / 2, -T / 2);
    const g = ctx.createLinearGradient(0, 0, T, T);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, T, T);
    // a logo ribbon crossing the face
    ctx.save(); ctx.translate(T / 2, T / 2); ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(-T * 0.8, -T * 0.11, T * 1.6, T * 0.22);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(28, 28, T - 56, T - 56);
    ctx.fillStyle = ink;
    ctx.font = '500 30px Jost, sans-serif';
    ctx.fillText(item.year.split('').join(' '), 64, 104);
    // the big word, sized to fit the face
    let size = 150;
    ctx.font = `900 ${size}px Archivo, sans-serif`;
    while (ctx.measureText(item.word).width > T - 128 && size > 60) { size -= 6; ctx.font = `900 ${size}px Archivo, sans-serif`; }
    ctx.fillText(item.word, 60, T - 200);
    // the award name, small
    ctx.font = `600 34px Archivo, "Noto Sans TC", sans-serif`;
    const title = item.li.querySelector('.aw-title').textContent;
    wrap(ctx, title, T - 128).slice(0, 2).forEach((ln, k) => ctx.fillText(ln, 64, T - 128 + k * 44));
    ctx.restore();
    tex.needsUpdate = true;
    faceItem[face] = item;
  }

  /* ---------- the die ---------- */
  const SIZE = 2.3;
  const VERT = /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const FRAG = /* glsl */`
    uniform sampler2D map; uniform float uTime; uniform float uOpacity; uniform vec3 uGlow;
    varying vec2 vUv;
    void main() {
      vec3 c = texture2D(map, vUv).rgb;
      float scan = 0.94 + 0.06 * sin(vUv.y * 260.0 - uTime * 1.6);           // fine scan lines drifting slowly
      float band = smoothstep(0.0, 0.06, 0.06 - abs(fract(vUv.y - uTime * 0.08) - 0.5) + 0.0);  // one soft light band passing
      vec2 e = abs(vUv - 0.5) * 2.0;
      float edge = smoothstep(0.82, 1.0, max(e.x, e.y));                     // glow along the face edges
      c = c * scan + uGlow * (edge * 0.35 + band * 0.18);
      gl_FragColor = vec4(c, uOpacity);
    }`;
  const faces = [];
  const faceItem = [];
  const mats = Array.from({ length: 6 }, () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = T;
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 4;
    faces.push({ ctx: cv.getContext('2d'), tex });
    return new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, uTime: { value: 0 }, uOpacity: { value: 0.9 }, uGlow: { value: new THREE.Color(0xd8ecee) } },
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
    });
  });
  const pivot = new THREE.Group();          // hops and tilts
  const die = new THREE.Mesh(new THREE.BoxGeometry(SIZE, SIZE, SIZE), mats);
  die.renderOrder = 2;
  pivot.add(die);
  // hologram edges: the outline, plus a smaller inner frame that turns the other way
  const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE * 1.002, SIZE * 1.002, SIZE * 1.002));
  const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: 0x47868d, transparent: true, opacity: 0.9 }));
  die.add(edges);
  const inner = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE * 0.55, SIZE * 0.55, SIZE * 0.55)),
    new THREE.LineBasicMaterial({ color: 0x5b8f96, transparent: true, opacity: 0.55, depthWrite: false }));
  pivot.add(inner);
  pivot.position.y = 0.55;
  scene.add(pivot);

  /* ---------- projector base: rings, a light cone, rising motes ---------- */
  const base = new THREE.Group();
  base.position.y = -1.25;
  scene.add(base);
  const ringMat = (op) => new THREE.MeshBasicMaterial({ color: 0x47868d, transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false });
  const rings = [[1.2, 1.24, 0.6], [1.55, 1.57, 0.35], [1.95, 1.96, 0.22]].map(([r0, r1, op], i) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 96, 1, 0, Math.PI * (i === 1 ? 1.6 : 2)), ringMat(op));
    m.rotation.x = -Math.PI / 2;
    base.add(m);
    return m;
  });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.2, 64), ringMat(0.08));
  disc.rotation.x = -Math.PI / 2; base.add(disc);
  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.15, 3.4, 64, 1, true),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uColor: { value: new THREE.Color(0x759fa4) } },
      vertexShader: 'varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 uColor; varying float vY; void main(){ gl_FragColor = vec4(uColor, (1.0 - vY) * 0.16); }',
    }),
  );
  cone.position.y = 1.7; base.add(cone);
  const MOTES = isSmall ? 40 : 80;
  const mp = new Float32Array(MOTES * 3), mv = new Float32Array(MOTES);
  for (let i = 0; i < MOTES; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 1.3;
    mp.set([Math.cos(a) * r, Math.random() * 3.4, Math.sin(a) * r], i * 3); mv[i] = 0.15 + Math.random() * 0.25;
  }
  const moteGeo = new THREE.BufferGeometry(); moteGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  base.add(new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0x47868d, size: 0.04, transparent: true, opacity: 0.7, depthWrite: false })));

  /* ---------- which face looks at the camera ---------- */
  const NORMALS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((n) => new THREE.Vector3(...n));
  const toCam = new THREE.Vector3();
  function frontFace(q) {
    toCam.copy(camera.position).sub(new THREE.Vector3(0, pivot.position.y, 0)).normalize();
    let best = 0, bd = -2;
    NORMALS.forEach((n, i) => { const d = n.clone().applyQuaternion(q).dot(toCam); if (d > bd) { bd = d; best = i; } });
    return best;
  }
  // a fixed three-quarter view so three faces show, like a die on a table
  const VIEW = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.24, 0.52, 0));

  /* ---------- caption ---------- */
  let active = 0;
  function writeCap(item, instant) {
    const apply = () => {
      yearEl.textContent = item.year;
      textEl.innerHTML = item.li.querySelector('.aw-text').innerHTML;
    };
    if (instant || !animated()) { apply(); return; }
    gsap.timeline()
      .to([yearEl, textEl], { opacity: 0, y: -10, filter: 'blur(6px)', duration: 0.25, ease: 'power3.in', overwrite: true })
      .call(apply)
      .fromTo([yearEl, textEl], { y: 12, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'expo.out', stagger: 0.06 });
  }

  /* ---------- rolling ---------- */
  const qBase = new THREE.Quaternion();     // the die's own orientation, always face-aligned between rolls
  let rolling = false;
  function apply(q) { die.quaternion.copy(VIEW).multiply(q); }
  const ROLLS = [[new THREE.Vector3(0, 1, 0), -1], [new THREE.Vector3(1, 0, 0), 1], [new THREE.Vector3(0, 1, 0), 1], [new THREE.Vector3(1, 0, 0), -1]];
  let rollIdx = 0;
  function roll(dir = 1) {
    if (rolling) return;
    rolling = true;
    active = (active + dir + N) % N;
    const [axis, sign] = ROLLS[(rollIdx = (rollIdx + (dir > 0 ? 1 : 3)) % ROLLS.length)];
    // rotate about the die's view axes: turn, in view space, then bring it back
    const step = new THREE.Quaternion().setFromAxisAngle(axis, (Math.PI / 2) * sign * dir);
    const viewInv = VIEW.clone().invert();
    const target = viewInv.clone().multiply(step).multiply(VIEW).multiply(qBase);
    // paint the face that will land in front, while it is still turned away
    const landed = VIEW.clone().multiply(target);
    const face = frontFace(landed);
    paint(face, items[active], landed);
    writeCap(items[active]);
    const from = qBase.clone();
    const tmp = new THREE.Quaternion();
    const t = { p: 0 };
    gsap.to(t, {
      p: 1, duration: animated() ? 1.05 : 0, ease: 'power3.inOut',
      onUpdate: () => {
        tmp.slerpQuaternions(from, target, t.p); apply(tmp);
        pivot.position.y = 0.55 + Math.sin(t.p * Math.PI) * 0.55;          // the die hops as it turns
      },
      onComplete: () => { qBase.copy(target); apply(qBase); pivot.position.y = 0.55; rolling = false; dressSides(); },
    });
  }

  // after landing: the two other visible faces preview the next awards, upright
  function dressSides() {
    const front = frontFace(die.quaternion);
    const ranked = NORMALS.map((n, i) => [i, n.clone().applyQuaternion(die.quaternion).dot(toCam)])
      .filter(([i]) => i !== front).sort((a, b) => b[1] - a[1]);
    ranked.slice(0, 2).forEach(([f], k) => paint(f, items[(active + 1 + k) % N]));
    paint(front, items[active]);   // re-square the front too
  }

  /* ---------- dragging, then snapping to the nearest face ---------- */
  let drag = null;
  const tmpQ = new THREE.Quaternion();
  canvas.addEventListener('pointerdown', (e) => {
    if (rolling) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    canvas.classList.add('is-dragging');
    hold();
  });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx) * 1.5) { drag = null; canvas.classList.remove('is-dragging'); return; }
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;   // a few pixels of jitter is still a click
    drag.moved = true;
    const viewInv = VIEW.clone().invert();
    tmpQ.setFromEuler(new THREE.Euler(dy * 0.008, dx * 0.008, 0));
    qBase.copy(viewInv.clone().multiply(tmpQ).multiply(VIEW).multiply(qBase));
    apply(qBase);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  function snap() {
    // round each local axis to the nearest world axis: the closest of the 24 die orientations
    const m = new THREE.Matrix4().makeRotationFromQuaternion(qBase);
    const ax = new THREE.Vector3(), ay = new THREE.Vector3(), az = new THREE.Vector3();
    m.extractBasis(ax, ay, az);
    const round = (v, not) => {
      const opts = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].flatMap((a) => [new THREE.Vector3(...a), new THREE.Vector3(...a).negate()])
        .filter((o) => !not || Math.abs(o.dot(not)) < 0.5);
      return opts.reduce((b, o) => (o.dot(v) > b.dot(v) ? o : b));
    };
    const sx = round(ax), sy = round(ay, sx), sz = sx.clone().cross(sy);
    const target = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(sx, sy, sz));
    const from = qBase.clone(); const t = { p: 0 }; const tmp = new THREE.Quaternion();
    rolling = true;
    gsap.to(t, {
      p: 1, duration: animated() ? 0.6 : 0, ease: 'expo.out',
      onUpdate: () => { tmp.slerpQuaternions(from, target, t.p); apply(tmp); },
      onComplete: () => {
        qBase.copy(target); apply(qBase); rolling = false;
        // whatever face now looks at the camera is the award in focus
        const f = frontFace(die.quaternion);
        if (faceItem[f] && faceItem[f] !== items[active]) { active = items.indexOf(faceItem[f]); writeCap(items[active]); }
        dressSides();
      },
    });
  }
  function endDrag() {
    if (!drag) return;
    const moved = drag.moved;
    drag = null; canvas.classList.remove('is-dragging');
    if (moved) snap(); else { roll(1); hold(); }   // a click, not a drag: roll to the next award
  }
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  /* ---------- auto roll every few seconds while on screen ---------- */
  let timer = null, paused = false, onScreen = false;
  const AUTO = 4;
  function schedule() { timer?.kill(); timer = gsap.delayedCall(AUTO, () => { if (!paused && onScreen && animated() && !drag) roll(1); schedule(); }); }
  function hold() { schedule(); }                     // any interaction restarts the wait
  canvas.addEventListener('pointerenter', () => { paused = true; });
  canvas.addEventListener('pointerleave', () => { paused = false; hold(); });
  // keyboard: Enter or Space rolls, like a click
  canvas.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); roll(1); hold(); } });
  new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; }).observe(canvas);

  /* ---------- layout and render ---------- */
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.9 ? 10 : 8.2;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', layout);
  const clock = new THREE.Clock();
  let running = true;
  gsap.ticker.add(() => {
    if (!running || !onScreen) return;
    if (!canvas.clientWidth) return;
    if (canvas.width !== Math.round(canvas.clientWidth * renderer.getPixelRatio())) layout();
    const t = clock.getElapsedTime();
    const calm = !animated();
    mats.forEach((m) => { m.uniforms.uTime.value = calm ? 0 : t; });
    if (!calm) {
      inner.rotation.y = -t * 0.35; inner.rotation.x = t * 0.2;
      rings[0].rotation.z = t * 0.15; rings[1].rotation.z = -t * 0.25; rings[2].rotation.z = t * 0.08;
      const p = moteGeo.attributes.position;
      for (let i = 0; i < MOTES; i++) { let y = p.getY(i) + mv[i] * 0.01; if (y > 3.4) y = 0; p.setY(i, y); }
      p.needsUpdate = true;
      if (!rolling && !drag) pivot.rotation.z = Math.sin(t * 0.8) * 0.02;   // a breath of float
    }
    renderer.render(scene, camera);
  });

  /* ---------- start: paint the three visible faces ---------- */
  function paintStart() {
    apply(qBase);
    const order = [frontFace(die.quaternion)];
    // the other two visible faces get the next awards, the hidden ones the rest
    const toCamDots = NORMALS.map((n, i) => [i, n.clone().applyQuaternion(die.quaternion).dot(toCam)]).sort((a, b) => b[1] - a[1]);
    toCamDots.forEach(([i]) => { if (!order.includes(i)) order.push(i); });
    order.forEach((f, k) => paint(f, items[(active + k) % N]));
    writeCap(items[active], true);
  }
  Promise.all(['900 40px Archivo', '500 30px Jost', '600 34px Archivo', '600 34px "Noto Sans TC"'].map((f) => document.fonts.load(f).catch(() => null)))
    .then(() => { layout(); paintStart(); schedule(); });
  onLangChange(() => requestAnimationFrame(() => {
    faceItem.forEach((it, f) => it && paint(f, it));
    writeCap(items[active], true);
  }));

  return {
    pause() { running = false; timer?.kill(); },
    resume() { running = true; layout(); schedule(); },
  };
}
