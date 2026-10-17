// Konten Brand: "Flat Lay". Drag products from the tray onto their outlines on the table to finish each layout.
// Deliberately calm: no blur, no flashing, nothing moves unless the player moves it.
import { drawIcon, rand } from '../mini.js';

const PRODUCTS = ['bag', 'lipstick', 'sunglasses', 'heel', 'coffee', 'medal', 'letter', 'camera'];
const COLORS = { bag: '#7d8f6c', lipstick: '#b5524a', sunglasses: '#2e1b16', heel: '#c06a45', coffee: '#8a5a42', medal: '#c29a5a', letter: '#a3745a', camera: '#5a3728' };

export default {
  key: 'brand', title: 'Flat Lay', icon: 'bag', color: '#7d8f6c', duration: 45, unit: 'poin',
  how: 'Susun produk untuk foto katalog. Seret setiap produk dari nampan ke garis bayangannya di meja. Selesaikan sebanyak mungkin layout dalam 45 detik.',

  resize(api) { if (this.items) this.layout(api, false); },

  setup(api) { this.round = 0; this.done = 0; this.drag = null; this.newRound(api); },

  newRound(api) {
    const n = Math.min(3 + this.round, 7);
    const cells = [...Array(9).keys()].sort(() => Math.random() - .5).slice(0, n);
    const prods = [...PRODUCTS].sort(() => Math.random() - .5).slice(0, n);
    this.items = prods.map((p, i) => ({ p, cell: cells[i], placed: false, x: 0, y: 0, hx: 0, hy: 0 }));
    this.trayOrder = [...this.items].sort(() => Math.random() - .5);
    this.layout(api, true);
    this.roundStart = api.elapsed;
  },

  layout(api, reset) {
    const { w, h } = api, top = 96, n = this.trayOrder.length;
    this.land = w > h * 1.2;
    let side;
    if (this.land) {
      // table on the left, tray as a column on the right
      side = Math.min(h - top - 24, w * .55);
      this.table = { x: w / 2 - side - 16, y: top + (h - top - 24 - side) / 2, s: side };
    } else {
      side = Math.min(w - 40, h * .5, 460);
      this.table = { x: (w - side) / 2, y: top + 8, s: side };
    }
    this.cell = side / 3;
    this.size = this.cell * .62;
    if (this.land) {
      const cols = 2, rows = Math.ceil(n / cols), tw = Math.min(w / 2 - 40, 260);
      this.tray = { x: w / 2 + 16, y: this.table.y, w: tw, h: side };
      const cw = tw / cols, ch = side / Math.max(rows, 3);
      this.traySize = Math.min(this.size, cw * .7, ch * .75);
      this.trayOrder.forEach((it, i) => { it.hx = this.tray.x + (i % cols + .5) * cw; it.hy = this.tray.y + (Math.floor(i / cols) + .5) * ch; });
    } else {
      const ty = this.table.y + side + 34, th = Math.min(this.size * 1.4, h - ty - 16);
      this.tray = { x: 16, y: ty, w: w - 32, h: th };
      const gap = Math.min((w - 48) / n, this.size * 1.25);
      this.traySize = Math.min(this.size, gap * .8, th * .8);
      this.trayOrder.forEach((it, i) => { it.hx = w / 2 + (i - (n - 1) / 2) * gap; it.hy = ty + th / 2; });
    }
    for (const it of this.trayOrder) {
      if (it.placed) { const c = this.cellCenter(it.cell); it.x = c.x; it.y = c.y; }
      else if (reset || !this.drag || this.drag.it !== it) { it.x = it.hx; it.y = it.hy; }
    }
  },

  cellCenter(i) {
    const t = this.table, c = this.cell;
    return { x: t.x + (i % 3 + .5) * c, y: t.y + (Math.floor(i / 3) + .5) * c };
  },

  pointerdown(p) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (it.placed) continue;
      if (Math.hypot(p.x - it.x, p.y - it.y) < this.size * .6) {
        this.drag = { it, dx: it.x - p.x, dy: it.y - p.y };
        this.items.splice(i, 1); this.items.push(it); // draw on top
        return;
      }
    }
  },
  pointermove(p) {
    if (!this.drag) return;
    this.drag.it.x = p.x + this.drag.dx; this.drag.it.y = p.y + this.drag.dy;
  },
  pointerup(p, api) {
    if (!this.drag) return;
    const it = this.drag.it; this.drag = null;
    const c = this.cellCenter(it.cell);
    if (Math.hypot(it.x - c.x, it.y - c.y) < this.cell * .5) {
      it.placed = true; it.x = c.x; it.y = c.y;
      api.add(20); api.tick(880); api.buzz(12);
      api.float('+20', c.x, c.y - this.size * .6, '#fbf7f2', 20);
      if (this.items.every((x) => x.placed)) {
        const secs = api.elapsed - this.roundStart;
        const bonus = 50 + Math.max(0, Math.round((12 - secs) * 10));
        api.add(bonus); this.done++; this.round++;
        api.float(`Siap posting! +${bonus}`, api.w / 2, this.table.y + this.table.s / 2, '#fbf7f2', 28);
        api.burst(api.w / 2, this.table.y + this.table.s / 2, '#e8f0dd', 16);
        api.tick(1320); api.buzz([20, 40, 20]);
        setTimeout(() => { if (api.playing) this.newRound(api); }, 700);
      }
    } else {
      it.back = true;
      api.buzz(30);
    }
  },

  update(dt) {
    for (const it of this.items) {
      if (it.back) {
        it.x += (it.hx - it.x) * Math.min(1, dt * 12); it.y += (it.hy - it.y) * Math.min(1, dt * 12);
        if (Math.hypot(it.x - it.hx, it.y - it.hy) < 1) { it.back = false; it.x = it.hx; it.y = it.hy; }
      }
    }
  },

  hud() { return `🗂 ${this.done || 0}`; },

  draw(g, api) {
    const { w, h } = api;
    g.fillStyle = '#efe9df'; g.fillRect(0, 0, w, h);
    if (!this.items) { drawIcon(g, 'bag', w / 2, h / 2, 120, '#7d8f6c'); return; }
    // wooden table
    const t = this.table;
    g.fillStyle = '#d9bf9f'; g.beginPath(); g.roundRect(t.x, t.y, t.s, t.s, 18); g.fill();
    g.strokeStyle = 'rgba(111,69,49,.12)'; g.lineWidth = 2;
    for (let k = 1; k < 9; k++) { const y = t.y + t.s * k / 9; g.beginPath(); g.moveTo(t.x + 10, y); g.bezierCurveTo(t.x + t.s * .3, y - 4, t.x + t.s * .7, y + 4, t.x + t.s - 10, y); g.stroke(); }
    // outlines (ghosts)
    for (const it of this.items) {
      if (it.placed) continue;
      const c = this.cellCenter(it.cell);
      g.strokeStyle = 'rgba(46,27,22,.25)'; g.setLineDash([6, 6]); g.lineWidth = 2;
      g.beginPath(); g.roundRect(c.x - this.cell * .42, c.y - this.cell * .42, this.cell * .84, this.cell * .84, 14); g.stroke(); g.setLineDash([]);
      drawIcon(g, it.p, c.x, c.y, this.size, 'rgba(46,27,22,.16)');
    }
    // tray
    const tr = this.tray;
    g.fillStyle = '#e2d6c6'; g.beginPath(); g.roundRect(tr.x, tr.y, tr.w, tr.h, 22); g.fill();
    g.fillStyle = 'rgba(46,27,22,.45)'; g.font = '600 11px "Instrument Sans", system-ui'; g.textAlign = 'left';
    g.fillText(api.playing && this.round === 0 && api.elapsed < 6 ? 'SERET KE BAYANGANNYA DI MEJA ↑' : 'NAMPAN', tr.x + 12, tr.y - 8);
    for (const it of this.items) {
      const dragging = this.drag && this.drag.it === it;
      const s = it.placed ? this.size : dragging ? this.size * 1.08 : it.back ? this.traySize : (Math.abs(it.x - it.hx) < 1 && Math.abs(it.y - it.hy) < 1 ? this.traySize : this.size);
      if (dragging) { g.fillStyle = 'rgba(46,27,22,.15)'; g.beginPath(); g.ellipse(it.x + 6, it.y + s * .45, s * .4, s * .12, 0, 0, 7); g.fill(); }
      drawIcon(g, it.p, it.x, it.y, s, COLORS[it.p]);
    }
  },

  result() {
    const d = this.done || 0;
    if (d >= 5) return { title: 'Art Director', line: `${d} layout siap posting! Bawa brand-mu ke Casa de Swassana untuk sesi katalog.` };
    if (d >= 3) return { title: 'Content Creator', line: `${d} layout rapi. Feed brand-mu makin konsisten.` };
    return { title: 'Stylist Pemula', line: 'Menyusun flat lay itu seni. Di studio, tim kami siap membantu.' };
  },
};
