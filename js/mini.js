// Tiny 2D game engine shared by the six mini games: loop, input (touch, tilt), particles, HUD, end card.
import { buzz, tick, shareOrDownload, enableMotion } from './fx.js';
import { ICONS } from './icons.js';

const PATHS = {};
for (const k in ICONS) PATHS[k] = new Path2D(ICONS[k]);

export function drawIcon(g, name, x, y, size, color, rot = 0, alpha = 1) {
  g.save();
  g.translate(x, y); g.rotate(rot); g.globalAlpha = alpha;
  const s = size / 512; g.scale(s, s); g.translate(-256, -256);
  g.fillStyle = color; g.fill(PATHS[name]);
  g.restore();
}

export function iconSvg(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => a + Math.random() * (b - a);
const $ = (id) => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function run(game) {
  const canvas = $('game');
  const g = canvas.getContext('2d');
  const api = {
    w: 0, h: 0, g, score: 0, time: 0, elapsed: 0, playing: false,
    tilt: { x: 0, y: 0 }, hasTilt: false, reduce,
    add(n) { this.score = Math.max(0, this.score + n); },
    buzz, tick,
    end: () => finish(),
    burst(x, y, color, n = 10, icon = null) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = rand(80, 260);
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: rand(.5, 1), max: 1, color, icon, size: icon ? rand(14, 24) : rand(3, 6), rot: rand(-3, 3) });
      }
    },
    float(text, x, y, color = '#fbf7f2', size = 22) { texts.push({ text, x, y, color, size, life: 1 }); },
  };
  const parts = [], texts = [];

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    api.w = innerWidth; api.h = innerHeight;
    canvas.width = api.w * dpr; canvas.height = api.h * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    game.resize && game.resize(api);
  }
  addEventListener('resize', resize);
  resize();

  // Input
  const pt = (e) => ({ x: e.clientX, y: e.clientY, id: e.pointerId });
  canvas.addEventListener('pointerdown', (e) => { if (api.playing && game.pointerdown) game.pointerdown(pt(e), api); });
  canvas.addEventListener('pointermove', (e) => { if (api.playing && game.pointermove) game.pointermove(pt(e), api); });
  addEventListener('pointerup', (e) => { if (api.playing && game.pointerup) game.pointerup(pt(e), api); });
  addEventListener('pointercancel', (e) => { if (api.playing && game.pointerup) game.pointerup(pt(e), api); });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return;
    api.hasTilt = true;
    api.tilt.x = clamp(e.gamma / 25, -1, 1);
    api.tilt.y = clamp((e.beta - 40) / 25, -1, 1);
  });

  // Intro screen
  $('introIcon').innerHTML = iconSvg(game.icon);
  $('introTitle').textContent = game.title;
  $('introHow').textContent = game.how;
  document.documentElement.style.setProperty('--game', game.color);
  document.title = game.title + ' | Swassana';
  let best = 0;
  try { best = +localStorage.getItem('best-' + game.key) || 0; } catch (e) {}
  $('introBest').textContent = best ? 'Skor terbaikmu: ' + fmt(best) : '';

  function fmt(n) { return game.fmt ? game.fmt(n) : Math.floor(n).toLocaleString('id-ID'); }

  async function start() {
    enableMotion();
    $('intro').hidden = true; $('end').hidden = true; $('hud').hidden = false;
    api.score = 0; api.elapsed = 0; api.time = game.duration || 0;
    parts.length = 0; texts.length = 0;
    try { await (game.setup && game.setup(api)); } catch (e) {}
    api.playing = true; buzz(15); tick(880);
    last = performance.now();
  }
  $('startBtn').addEventListener('click', start);
  $('againBtn').addEventListener('click', start);

  let result = null;
  function finish() {
    if (!api.playing) return;
    api.playing = false;
    game.teardown && game.teardown(api);
    result = game.result(api.score, api);
    try { if (api.score > best) { best = api.score; localStorage.setItem('best-' + game.key, best); } } catch (e) {}
    $('hud').hidden = true; $('end').hidden = false;
    $('endScore').textContent = fmt(api.score);
    $('endUnit').textContent = game.unit || 'poin';
    $('endTitle').textContent = result.title;
    $('endLine').textContent = result.line;
    $('endBest').textContent = 'Terbaik: ' + fmt(best);
    buzz([30, 60, 30]); tick(1320);
    if (!reduce && window.gsap) {
      gsap.fromTo('#endCard', { y: 60, rotateX: 40, opacity: 0 }, { y: 0, rotateX: 0, opacity: 1, duration: .9, ease: 'expo.out' });
      const o = { v: 0 }; gsap.to(o, { v: api.score, duration: 1.2, ease: 'power2.out', onUpdate: () => { $('endScore').textContent = fmt(o.v); } });
    }
  }

  $('shareBtn').addEventListener('click', async () => {
    const blob = await card(game, api.score, result, fmt);
    const r = await shareOrDownload(blob, `swassana-${game.key}.png`, `Skorku di ${game.title}: ${fmt(api.score)}! Coba kalahkan 😏 @swassanastudio`);
    if (r === 'downloaded') toastMsg('Kartu skor tersimpan.');
  });

  // Loop
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (api.playing) {
      api.elapsed += dt;
      if (game.duration) {
        api.time = Math.max(0, api.time - dt);
        if (api.time <= 0) finish();
      }
      game.update(dt, api);
    }
    game.draw(g, api);
    // particles
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 3;
      if (p.icon) drawIcon(g, p.icon, p.x, p.y, p.size, p.color, p.rot, Math.min(1, p.life * 2));
      else { g.globalAlpha = Math.min(1, p.life * 2); g.fillStyle = p.color; g.beginPath(); g.arc(p.x, p.y, p.size, 0, 7); g.fill(); g.globalAlpha = 1; }
    }
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      t.life -= dt * .9; if (t.life <= 0) { texts.splice(i, 1); continue; }
      t.y -= 50 * dt;
      g.globalAlpha = Math.min(1, t.life * 2); g.fillStyle = t.color; g.textAlign = 'center';
      g.font = `italic 500 ${t.size}px Fraunces, Georgia, serif`;
      g.fillText(t.text, t.x, t.y); g.globalAlpha = 1;
    }
    $('hudScore').textContent = fmt(api.score);
    $('hudTime').textContent = game.duration ? Math.ceil(api.time) + 's' : (game.hud ? game.hud(api) : '');
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function toastMsg(m) {
  const t = $('toast'); t.textContent = m; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// 1080x1920 score card for Stories
async function card(game, score, r, fmt) {
  await Promise.all([document.fonts.load('italic 300 120px Fraunces'), document.fonts.load('500 40px "Instrument Sans"')]).catch(() => {});
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 1080, 1920);
  bg.addColorStop(0, game.color); bg.addColorStop(1, '#2e1b16');
  g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 9; i++) drawIcon(g, game.icon, rand(80, 1000), rand(120, 1800), rand(90, 200), 'rgba(251,247,242,.07)', rand(-.6, .6));
  g.strokeStyle = 'rgba(251,247,242,.45)'; g.lineWidth = 3; g.strokeRect(50, 50, 980, 1820);
  drawIcon(g, game.icon, 540, 420, 220, '#fbf7f2');
  g.fillStyle = '#fbf7f2'; g.textAlign = 'center';
  g.font = '500 34px "Instrument Sans", system-ui'; g.globalAlpha = .8; g.fillText('M I N I   G A M E   S W A S S A N A', 540, 640); g.globalAlpha = 1;
  g.font = 'italic 300 110px Fraunces, Georgia, serif'; g.fillText(game.title, 540, 770);
  g.font = '400 230px Fraunces, Georgia, serif'; g.fillText(fmt(score), 540, 1060);
  g.font = '500 38px "Instrument Sans", system-ui'; g.globalAlpha = .8; g.fillText(game.unit || 'poin', 540, 1120); g.globalAlpha = 1;
  g.font = 'italic 300 76px Fraunces, Georgia, serif'; g.fillText(r.title, 540, 1290);
  g.font = '400 40px "Instrument Sans", system-ui'; g.globalAlpha = .9;
  const words = r.line.split(' '); let line = '', y = 1370;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > 820 && line) { g.fillText(line, 540, y); line = w; y += 56; } else line = t; }
  g.fillText(line, 540, y); g.globalAlpha = 1;
  g.font = 'italic 300 64px Fraunces, Georgia, serif'; g.fillText('Swassana', 540, 1700);
  g.font = '500 30px "Instrument Sans", system-ui'; g.globalAlpha = .8; g.fillText('Kalahkan skorku: rfim.github.io/swassana/main.html', 540, 1770);
  return new Promise((res) => c.toBlob(res, 'image/png'));
}
