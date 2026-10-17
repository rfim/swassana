// Wisuda: "Lempar Toga". Tap to toss the cap high, then tilt or drag to catch it.
import { drawIcon, clamp, rand } from '../mini.js';

export default {
  key: 'wisuda', title: 'Lempar Toga', icon: 'cap', color: '#5a3728', duration: 45, unit: 'poin',
  how: 'Ketuk layar untuk melempar toga setinggi mungkin, lalu tangkap lagi dengan menggeser jari atau memiringkan HP. Tiga kali jatuh, selesai.',

  setup(api) {
    this.p = { x: api.w / 2 };
    this.cap = { held: true, x: 0, y: 0, vx: 0, vy: 0, rot: 0, top: 0 };
    this.lives = 3; this.tosses = 0; this.drag = null; this.wind = 0; this.best = 0;
  },
  head(api) { return { x: this.p.x, y: api.h - 150 }; },

  pointerdown(p, api) {
    this.drag = p;
    const c = this.cap;
    if (!c.held) return;
    const hd = this.head(api);
    c.held = false; c.x = hd.x; c.y = hd.y - 40; c.top = c.y;
    c.vy = -Math.sqrt(2 * api.h * 1.6 * api.h * rand(.55, .8));
    this.tosses++;
    c.vx = rand(-1, 1) * (40 + this.tosses * 14);
    this.wind = rand(-1, 1) * Math.min(120, this.tosses * 10);
    api.buzz(15); api.tick(520);
  },
  pointermove(p) { if (this.drag) this.drag = p; },
  pointerup() { this.drag = null; },

  update(dt, api) {
    const target = this.drag ? this.drag.x : api.hasTilt ? api.w / 2 + api.tilt.x * api.w * .6 : null;
    if (target !== null) this.p.x += (target - this.p.x) * Math.min(1, dt * 10);
    this.p.x = clamp(this.p.x, 40, api.w - 40);
    const c = this.cap;
    if (c.held) return;
    c.vy += api.h * 1.6 * dt;
    c.vx += this.wind * dt;
    c.x += c.vx * dt; c.y += c.vy * dt; c.rot += dt * 7;
    if (c.x < 30 || c.x > api.w - 30) { c.vx *= -.8; c.x = clamp(c.x, 30, api.w - 30); }
    c.top = Math.min(c.top, c.y);
    const hd = this.head(api);
    if (c.vy > 0 && c.y >= hd.y - 40 && c.y <= hd.y + 10 && Math.abs(c.x - hd.x) < 52) {
      const height = Math.max(0, (hd.y - c.top) / api.h);
      const pts = Math.round(height * 120);
      api.add(pts); this.best = Math.max(this.best, pts);
      c.held = true;
      api.float(`+${pts}`, hd.x, hd.y - 90, '#f6c177', 26);
      api.burst(hd.x, hd.y - 60, '#f6c177', 14);
      api.buzz([20, 30, 20]); api.tick(1100);
    } else if (c.y > api.h + 40) {
      this.lives--; c.held = true;
      api.float('Jatuh!', api.w / 2, api.h * .4, '#ffb3a7', 28); api.buzz(80);
      if (this.lives <= 0) api.end();
    }
  },

  hud() { return '🎓'.repeat(Math.max(0, this.lives ?? 3)); },

  draw(g, api) {
    const { w, h } = api;
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#f6d7b0'); bg.addColorStop(1, '#fbf7f2');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(90,55,40,.07)';
    for (let k = 1; k < 5; k++) { g.fillRect(0, h * k / 5, w, 1); }
    g.fillStyle = 'rgba(90,55,40,.4)'; g.font = '12px "Instrument Sans", system-ui'; g.textAlign = 'left';
    for (let k = 1; k < 5; k++) g.fillText(`${(5 - k) * 20}`, 8, h * k / 5 - 4);
    if (!this.cap) { drawIcon(g, 'cap', w / 2, h / 2, 120, '#5a3728'); return; }
    const hd = this.head(api), c = this.cap;
    drawIcon(g, 'meeple', hd.x, hd.y + 30, 100, '#6f4531');
    if (c.held) drawIcon(g, 'cap', hd.x, hd.y - 26, 70, '#2e1b16', -.1);
    else {
      g.strokeStyle = 'rgba(90,55,40,.2)'; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(c.x, c.y); g.lineTo(c.x, h); g.stroke(); g.setLineDash([]);
      drawIcon(g, 'cap', c.x, c.y, 70, '#2e1b16', c.rot);
    }
    if (c.held && this.tosses === 0) {
      g.fillStyle = '#5a3728'; g.font = 'italic 400 22px Fraunces, Georgia, serif'; g.textAlign = 'center';
      g.fillText('Ketuk untuk melempar!', w / 2, h * .35);
    }
  },

  result(score) {
    if (score >= 600) return { title: 'Cum Laude Lempar Toga', line: 'Lemparan tinggi, tangkapan sempurna. Abadikan momen wisudamu di Swassana!' };
    if (score >= 300) return { title: 'Sarjana Lempar', line: 'Lumayan tinggi! Sesi wisuda sungguhan pasti lebih seru.' };
    return { title: 'Toganya Kabur', line: 'Tenang, di studio togamu aman. Fokus saja ke senyum terbaikmu.' };
  },
};
