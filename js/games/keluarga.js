// Keluarga: "Semua Lihat Kamera!". Tap family members who look away before each shutter.
import { drawIcon, rand } from '../mini.js';

const SHOT_EVERY = 5;

export default {
  key: 'keluarga', title: 'Semua Lihat Kamera!', icon: 'meepleGroup', color: '#a3745a', duration: 30, unit: 'poin',
  how: 'Ada saja yang menoleh ke mana-mana! Ketuk anggota keluarga yang tidak melihat kamera sebelum shutter berbunyi.',

  resize(api) { if (this.fam) this.layout(api); },
  layout(api) {
    const n = this.fam.length, cols = api.w < 520 ? 3 : 5, rows = Math.ceil(n / cols);
    const size = Math.min(api.w / (cols + 1), 110);
    this.fam.forEach((f, i) => {
      const r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols);
      f.x = api.w / 2 + (c - (inRow - 1) / 2) * size * 1.15;
      f.y = api.h * .5 + (r - (rows - 1) / 2) * size * 1.35;
      f.size = size * f.scale;
    });
  },

  setup(api) {
    const colors = ['#6f4531', '#a3745a', '#c06a45', '#8a5a42', '#c29a82', '#5a3728'];
    this.fam = colors.map((c, i) => ({ color: c, scale: [1, .95, .7, .85, .6, 1.05][i], away: false, t: rand(0, 6), dir: 1 }));
    this.layout(api);
    this.nextShot = SHOT_EVERY; this.perfect = 0; this.shots = 0; this.flash = 0; this.msg = '';
  },

  pointerdown(p, api) {
    for (const f of this.fam) {
      if (Math.hypot(p.x - f.x, p.y - f.y) < f.size * .6) {
        if (f.away) { f.away = false; api.add(10); api.buzz(12); api.tick(990); api.float('+10', f.x, f.y - f.size * .6); }
        return;
      }
    }
  },

  update(dt, api) {
    const rate = .35 + api.elapsed / 30 * .9;
    for (const f of this.fam) {
      f.t += dt;
      if (!f.away && Math.random() < dt * rate) { f.away = true; f.dir = Math.random() < .5 ? -1 : 1; }
    }
    this.flash = Math.max(0, this.flash - dt * 2.5);
    this.nextShot -= dt;
    if (this.nextShot <= 0) {
      this.nextShot = SHOT_EVERY; this.shots++; this.flash = 1;
      api.tick(1320); api.buzz([20, 30, 20]);
      const missing = this.fam.filter((f) => f.away).length;
      if (missing === 0) {
        this.perfect++; api.add(100);
        this.msg = 'FOTO SEMPURNA! 📸';
        api.burst(api.w / 2, api.h * .3, '#f6c177', 18);
      } else this.msg = missing === 1 ? 'Satu orang menoleh 😅' : `${missing} orang menoleh 😅`;
    }
  },

  hud() { return `📸 ${this.perfect || 0}`; },

  draw(g, api) {
    const { w, h } = api;
    g.fillStyle = '#f1e5dc'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e4d3c4'; g.fillRect(0, h * .72, w, h * .28);
    if (!this.fam) { drawIcon(g, 'meepleGroup', w / 2, h / 2, 140, '#a3745a'); return; }
    // shutter countdown
    const cx = w / 2, cy = 120, r = 30, frac = this.nextShot / SHOT_EVERY;
    g.strokeStyle = 'rgba(90,55,40,.15)'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
    g.strokeStyle = frac < .3 ? '#c0392b' : '#5a3728'; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); g.stroke();
    drawIcon(g, 'camera', cx, cy, 30, '#5a3728');
    for (const f of this.fam) {
      const wob = f.away ? Math.sin(f.t * 10) * .25 * f.dir : Math.sin(f.t * 2) * .03;
      drawIcon(g, 'meeple', f.x, f.y, f.size, f.away ? '#bfb0a5' : f.color, wob);
      if (f.away) {
        g.fillStyle = '#c0392b'; g.font = '700 22px "Instrument Sans", system-ui'; g.textAlign = 'center';
        g.fillText('?', f.x + f.size * .35 * f.dir, f.y - f.size * .45);
      }
    }
    if (this.msg && this.flash > 0) {
      g.fillStyle = `rgba(255,255,255,${this.flash * .8})`; g.fillRect(0, 0, w, h);
    }
    if (this.msg) {
      g.fillStyle = '#5a3728'; g.font = 'italic 400 24px Fraunces, Georgia, serif'; g.textAlign = 'center';
      g.fillText(this.msg, w / 2, h * .86);
    }
  },

  result(score) {
    const p = this.perfect;
    if (p >= 5) return { title: 'Sutradara Keluarga', line: `${p} foto sempurna! Semua patuh padamu. Ruang lega Casa de Swassana menunggu.` };
    if (p >= 3) return { title: 'Koordinator Andal', line: `${p} foto sempurna. Keluarga besar pun bisa kamu atur.` };
    return { title: 'Keluarga Heboh', line: 'Susah ya bikin semua lihat kamera? Tenang, fotografer kami ahlinya.' };
  },
};
