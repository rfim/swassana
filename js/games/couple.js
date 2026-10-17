// Couple: "Love Sync". Two players each tap their heart on the beat; tapping together earns a sync bonus.
import { drawIcon, rand } from '../mini.js';

const LEAD = 1.1;   // seconds a ring takes to close in
const WINDOW = .3;  // tap window around the beat

export default {
  key: 'couple', title: 'Love Sync', icon: 'lovers', color: '#b5524a', unit: 'poin sync',
  how: 'Main berdua di satu HP. Kamu ketuk hati kiri, pasanganmu ketuk hati kanan, tepat saat lingkaran menutup. Ketuk bersamaan untuk bonus SYNC!',

  setup() {
    this.t = 0; this.beats = []; let at = 1.4, gap = 1.15;
    for (let i = 0; i < 16; i++) { this.beats.push({ at, L: null, R: null, done: false }); at += gap; gap = Math.max(.68, gap - .03); }
    this.pop = { L: 0, R: 0 }; this.syncs = 0; this.combo = 0;
  },

  pointerdown(p, api) {
    const side = p.x < api.w / 2 ? 'L' : 'R';
    this.pop[side] = 1;
    const b = this.beats.find((x) => x[side] === null && Math.abs(this.t - x.at) < WINDOW);
    const hx = side === 'L' ? api.w * .27 : api.w * .73, hy = api.h * .56;
    if (!b) { api.float('Terlalu cepat', hx, hy - 90, '#f3c7c0', 18); return; }
    const err = Math.abs(this.t - b.at);
    b[side] = this.t;
    const pts = err < .07 ? 100 : err < .15 ? 60 : 25;
    api.add(pts);
    api.float(err < .07 ? 'Perfect!' : err < .15 ? 'Bagus' : 'Oke', hx, hy - 90, '#fbf7f2', err < .07 ? 26 : 20);
    api.buzz(err < .07 ? 25 : 12); api.tick(side === 'L' ? 660 : 880);
    const other = side === 'L' ? 'R' : 'L';
    if (b[other] !== null && Math.abs(b.L - b.R) < .12) {
      api.add(60); this.syncs++; this.combo++;
      api.float('SYNC! 💞', api.w / 2, api.h * .3, '#ffd6d0', 34);
      api.burst(api.w / 2, api.h * .38, '#ff9f95', 10, 'hearts');
      api.buzz([20, 40, 20]);
    }
  },

  update(dt, api) {
    this.t += dt;
    this.pop.L = Math.max(0, this.pop.L - dt * 4); this.pop.R = Math.max(0, this.pop.R - dt * 4);
    for (const b of this.beats) {
      if (!b.done && this.t > b.at + WINDOW) {
        b.done = true;
        if (b.L === null || b.R === null) this.combo = 0;
      }
    }
    if (this.t > this.beats[this.beats.length - 1].at + .8) api.end();
  },

  hud() { return `${this.syncs || 0} sync`; },

  draw(g, api) {
    const { w, h } = api;
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#5a2a2a'); bg.addColorStop(1, '#2e1b16');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(251,247,242,.06)'; g.fillRect(w / 2 - 1, 80, 2, h - 120);
    drawIcon(g, 'lovers', w / 2, h * .17, 64, 'rgba(251,247,242,.85)');
    const R = Math.min(w * .17, 90);
    for (const [side, x] of [['L', w * .27], ['R', w * .73]]) {
      const y = h * .56;
      if (this.beats) for (const b of this.beats) {
        const dtb = b.at - this.t;
        if (dtb > LEAD || dtb < -.15 || b[side] !== null) continue;
        const r = R * (1 + Math.max(0, dtb) / LEAD * 1.1);
        g.strokeStyle = `rgba(255,214,208,${1 - Math.max(0, dtb) / LEAD * .7})`; g.lineWidth = 4;
        g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
      }
      g.strokeStyle = 'rgba(255,214,208,.25)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, R, 0, 7); g.stroke();
      const pop = this.pop ? this.pop[side] : 0;
      drawIcon(g, 'hearts', x, y, R * 1.25 * (1 + pop * .25), side === 'L' ? '#ff8f84' : '#ffb3a7');
      g.fillStyle = 'rgba(251,247,242,.7)'; g.font = '600 14px "Instrument Sans", system-ui'; g.textAlign = 'center';
      g.fillText(side === 'L' ? 'KAMU' : 'DIA', x, y + R + 34);
    }
    if (this.combo > 1) {
      g.fillStyle = '#ffd6d0'; g.font = 'italic 400 22px Fraunces, Georgia, serif'; g.textAlign = 'center';
      g.fillText(`${this.combo}× sync beruntun`, w / 2, h * .86);
    }
  },

  result(score) {
    if (score >= 2600) return { title: 'Soulmate Sync', line: 'Kalian sehati sampai detik terakhir. Waktunya sesi couple di Swassana!' };
    if (score >= 1600) return { title: 'Sehati', line: 'Kompak banget! Tinggal latihan satu-dua kali lagi.' };
    return { title: 'Masih Pemanasan', line: 'Belum sinkron? Di studio, fotografer kami yang bantu mengarahkan.' };
  },
};
