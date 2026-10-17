// Konten Brand: "Fokus!". Tap the shutter at the exact moment the product snaps into focus.
import { drawIcon, rand } from '../mini.js';

const PRODUCTS = ['bag', 'lipstick', 'sunglasses', 'heel', 'coffee', 'medal', 'letter', 'camera'];
const SHOTS = 10;

export default {
  key: 'brand', title: 'Fokus!', icon: 'bag', color: '#7d8f6c', unit: 'poin fokus',
  how: 'Produknya buram lalu tajam, berulang-ulang. Ketuk layar tepat saat produk paling tajam. Sepuluh jepretan, makin lama makin cepat.',

  setup() { this.next(0); this.shots = 0; this.flash = 0; this.sum = 0; },
  next(i) {
    this.prod = PRODUCTS[i % PRODUCTS.length];
    this.phase = rand(0, Math.PI * 2);
    this.speed = 1.1 + i * .16;
    this.drift = { x: rand(-1, 1), y: rand(-1, 1) };
  },
  focus() { return Math.sin(this.phase); }, // 0 = sharp, ±1 = blurry

  pointerdown(p, api) {
    if (this.shots >= SHOTS) return;
    const acc = 1 - Math.abs(this.focus());
    const pts = Math.round(Math.pow(acc, 2) * 100);
    api.add(pts); this.sum += acc; this.shots++; this.flash = 1;
    api.float(acc > .93 ? 'TAJAM! ✨' : acc > .75 ? 'Lumayan' : 'Blur 😵', api.w / 2, api.h * .25, '#fbf7f2', acc > .93 ? 30 : 22);
    api.tick(acc > .93 ? 1320 : 700); api.buzz(acc > .93 ? [20, 30, 20] : 15);
    if (acc > .93) api.burst(api.w / 2, api.h * .48, '#e8f0dd', 14);
    if (this.shots >= SHOTS) setTimeout(() => api.end(), 600); else this.next(this.shots);
  },

  update(dt) {
    this.phase += dt * this.speed * Math.PI;
    this.flash = Math.max(0, this.flash - dt * 3);
  },

  hud() { return `${this.shots || 0}/${SHOTS}`; },

  draw(g, api) {
    const { w, h } = api;
    g.fillStyle = '#e9e4da'; g.fillRect(0, 0, w, h);
    const size = Math.min(w, h) * .32, cx = w / 2, cy = h * .48;
    // viewfinder
    const vf = Math.min(w, h) * .62, x0 = cx - vf / 2, y0 = cy - vf / 2, L = 34;
    g.strokeStyle = '#2e1b16'; g.lineWidth = 3;
    for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x0 + vf, y0, -1, 1], [x0, y0 + vf, 1, -1], [x0 + vf, y0 + vf, -1, -1]]) {
      g.beginPath(); g.moveTo(x, y + dy * L); g.lineTo(x, y); g.lineTo(x + dx * L, y); g.stroke();
    }
    if (!this.prod) { drawIcon(g, 'bag', cx, cy, size, '#4f5d43'); return; }
    const f = Math.abs(this.focus()), t = this.phase;
    const px = cx + Math.sin(t * .37) * this.drift.x * 20, py = cy + Math.cos(t * .29) * this.drift.y * 20;
    // fake blur: stacked offset copies
    const blur = f * 18;
    if (blur > .5) for (let k = 0; k < 8; k++) {
      const a = k / 8 * Math.PI * 2;
      drawIcon(g, this.prod, px + Math.cos(a) * blur, py + Math.sin(a) * blur, size, '#4f5d43', 0, .12);
    }
    drawIcon(g, this.prod, px, py, size, '#4f5d43', 0, 1 - f * .75);
    // focus ring indicator
    const bw = Math.min(w * .7, 320), bx = cx - bw / 2, by = h * .82;
    g.fillStyle = 'rgba(46,27,22,.12)'; g.fillRect(bx, by, bw, 8);
    g.fillStyle = '#7d8f6c'; g.fillRect(cx - bw * .04, by - 4, bw * .08, 16);
    g.fillStyle = '#2e1b16'; g.beginPath(); g.arc(cx + this.focus() * bw / 2, by + 4, 9, 0, 7); g.fill();
    g.fillStyle = 'rgba(46,27,22,.6)'; g.font = '13px "Instrument Sans", system-ui'; g.textAlign = 'center';
    g.fillText('ketuk saat titik di tengah', cx, by + 36);
    if (this.flash > 0) { g.fillStyle = `rgba(255,255,255,${this.flash * .85})`; g.fillRect(0, 0, w, h); }
  },

  result(score) {
    if (score >= 750) return { title: 'Fotografer Katalog', line: 'Fokus setajam ini layak masuk katalog brand. Yuk bikin konten di Casa de Swassana!' };
    if (score >= 450) return { title: 'Content Creator', line: 'Sebagian besar tajam! Sedikit latihan lagi untuk timing sempurna.' };
    return { title: 'Masih Blur', line: 'Biar tim kami yang urus fokusnya. Kamu cukup bawa produknya.' };
  },
};
