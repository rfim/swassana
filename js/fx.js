// Shared 3D background (three.js): floating polaroids + bokeh, reacting to pointer, device tilt and game events.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const TONES = [['#c29a82', '#5a3728'], ['#dcc2b0', '#8a5a42'], ['#a3745a', '#2e1b16'], ['#f1e5dc', '#a3745a'], ['#9caf88', '#5a3728']];

function polaroidTexture(i) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 304;
  const g = c.getContext('2d');
  g.fillStyle = '#fbf7f2'; g.fillRect(0, 0, 256, 304);
  const [a, b] = TONES[i % TONES.length];
  g.save();
  g.beginPath(); g.rect(14, 14, 228, 228); g.clip();
  const gr = g.createLinearGradient(0, 0, 256, 256);
  gr.addColorStop(0, a); gr.addColorStop(1, b);
  g.fillStyle = gr; g.fillRect(14, 14, 228, 228);
  // window-light streaks, like the studio photos
  g.globalAlpha = 0.16; g.fillStyle = '#fff';
  for (let k = 0; k < 5; k++) { g.save(); g.translate(10 + k * 52, 0); g.rotate(0.45); g.fillRect(0, -60, 20, 420); g.restore(); }
  g.restore();
  g.fillStyle = '#5a3728'; g.font = 'italic 26px Georgia, serif'; g.textAlign = 'center';
  g.fillText('Swassana', 128, 284);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function createScene(canvas, { cards = 16, particles = 260 } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) {
    canvas.remove();
    return { setColor() {}, burst() {}, tilt: { x: 0, y: 0 } };
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 10;

  const root = new THREE.Group();
  scene.add(root);

  // Polaroids
  const geo = new THREE.PlaneGeometry(1.3, 1.545);
  const items = [];
  for (let i = 0; i < cards; i++) {
    const mat = new THREE.MeshBasicMaterial({ map: polaroidTexture(i), side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
    const m = new THREE.Mesh(geo, mat);
    const home = new THREE.Vector3((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 11, -2 - Math.random() * 8);
    m.position.set(home.x, home.y, -40);
    m.rotation.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.8);
    m.userData = { home, phase: Math.random() * 6.28, spin: new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.15) };
    root.add(m); items.push(m);
  }

  // Bokeh particles
  const pos = new Float32Array(particles * 3);
  for (let i = 0; i < particles; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pmat = new THREE.PointsMaterial({ size: 0.22, map: dotTexture(), transparent: true, opacity: 0.75, depthWrite: false, color: new THREE.Color('#c29a82') });
  const points = new THREE.Points(pgeo, pmat);
  scene.add(points);

  // Input: pointer + device tilt
  const tilt = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { target.x = e.clientX / innerWidth - 0.5; target.y = e.clientY / innerHeight - 0.5; }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    target.x = Math.max(-1, Math.min(1, e.gamma / 35)) * 0.5;
    target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 35)) * 0.5;
  });

  const colorTarget = new THREE.Color('#c29a82');
  let energy = 0;

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < h ? 13 : 10; // pull back on portrait phones
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { clock.getDelta(); loop(); } });

  function loop() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    tilt.x += (target.x - tilt.x) * 0.06;
    tilt.y += (target.y - tilt.y) * 0.06;
    energy *= 0.94;
    const speed = reduce ? 0.15 : 1 + energy * 6;

    root.rotation.y = tilt.x * 0.5;
    root.rotation.x = tilt.y * 0.35;
    points.rotation.y = tilt.x * 0.25 + t * 0.01;
    points.position.y = Math.sin(t * 0.2) * 0.3;

    for (const m of items) {
      const u = m.userData;
      m.position.x += (u.home.x - m.position.x) * 0.04;
      m.position.y += ((u.home.y + Math.sin(t * 0.6 + u.phase) * 0.35) - m.position.y) * 0.04;
      m.position.z += ((u.home.z + energy * 3) - m.position.z) * 0.04;
      m.rotation.x += u.spin.x * dt * speed;
      m.rotation.y += u.spin.y * dt * speed;
      m.rotation.z += u.spin.z * dt * speed;
    }
    pmat.color.lerp(colorTarget, 0.05);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  return {
    tilt,
    setColor(hex) { colorTarget.set(hex); },
    burst(power = 1) {
      energy = Math.min(1.5, energy + power);
      for (const m of items) m.userData.spin.multiplyScalar(-1);
    },
  };
}

// iOS needs a user gesture before motion events fire.
export async function enableMotion() {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      await DeviceOrientationEvent.requestPermission();
    }
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      await DeviceMotionEvent.requestPermission();
    }
  } catch (e) { /* denied or unsupported: pointer still works */ }
}

export function onShake(cb) {
  let last = 0;
  addEventListener('devicemotion', (e) => {
    const a = e.accelerationIncludingGravity || e.acceleration;
    if (!a || a.x == null) return;
    const force = Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z);
    const now = Date.now();
    if (force > 38 && now - last > 1200) { last = now; cb(); }
  });
}

export const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

let audio;
export function shutterSound() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const len = audio.sampleRate * 0.12;
    const buf = audio.createBuffer(1, len, audio.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = audio.createBufferSource(); src.buffer = buf;
    const gain = audio.createGain(); gain.gain.value = 0.5;
    src.connect(gain).connect(audio.destination); src.start();
  } catch (e) {}
}

export function tick(freq = 880) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = freq; g.gain.setValueAtTime(0.15, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.15);
    o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.16);
  } catch (e) {}
}

export async function shareOrDownload(blob, filename, text) {
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Swassana', text }); return 'shared'; } catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
