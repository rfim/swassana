// Personal: "Cari Cahaya". Steer the spotlight onto the wandering model by tilting the phone or dragging.
import { drawIcon, clamp, rand } from '../mini.js';

export default {
  key: 'personal', title: 'Cari Cahaya', icon: 'meeple', color: '#c06a45', duration: 30, unit: 'poin cahaya',
  how: 'Miringkan HP atau geser jari untuk mengarahkan cahaya ke model. Makin lama dia tersinari, makin tinggi skormu.',

  setup(api) {
    this.m = { x: api.w / 2, y: api.h / 2, vx: 80, vy: 50, t: 0 };
    this.spot = { x: api.w / 2, y: api.h * .7 };
    this.drag = null; this.on = false; this.pulse = 0; this.buzzT = 0;
  },
  pointerdown(p) { this.drag = p; },
  pointermove(p) { if (this.drag) this.drag = p; },
  pointerup() { this.drag = null; },

  update(dt, api) {
    const m = this.m;
    m.t += dt;
    const speed = 1 + api.elapsed / 18;
    if (Math.random() < dt * .9) { const a = rand(0, 6.28), v = rand(70, 130); m.vx = Math.cos(a) * v; m.vy = Math.sin(a) * v; }
    m.x += m.vx * dt * speed; m.y += m.vy * dt * speed;
    const pad = 50;
    if (m.x < pad || m.x > api.w - pad) m.vx *= -1;
    if (m.y < pad + 70 || m.y > api.h - pad) m.vy *= -1;
    m.x = clamp(m.x, pad, api.w - pad); m.y = clamp(m.y, pad + 70, api.h - pad);

    let target = null;
    if (this.drag) target = this.drag;
    else if (api.hasTilt) target = { x: api.w / 2 + api.tilt.x * api.w * .55, y: api.h / 2 + api.tilt.y * api.h * .5 };
    if (target) {
      this.spot.x += (target.x - this.spot.x) * Math.min(1, dt * 9);
      this.spot.y += (target.y - this.spot.y) * Math.min(1, dt * 9);
    }
    this.R = Math.min(api.w, api.h) * .17;
    this.on = Math.hypot(m.x - this.spot.x, m.y - this.spot.y) < this.R * .75;
    this.pulse += dt * (this.on ? 8 : 2);
    if (this.on) {
      api.add(dt * 10);
      if (Math.random() < dt * 14) api.burst(m.x + rand(-20, 20), m.y - 20, '#f6c177', 1);
      this.buzzT += dt; if (this.buzzT > .3) { api.buzz(6); this.buzzT = 0; }
    }
  },

  draw(g, api) {
    const { w, h } = api;
    g.fillStyle = '#1f1410'; g.fillRect(0, 0, w, h);
    // window-light streaks on the studio wall
    g.save(); g.globalAlpha = .05; g.fillStyle = '#f6c177';
    for (let k = 0; k < 6; k++) { g.save(); g.translate(k * w / 5, 0); g.rotate(.4); g.fillRect(0, -100, 40, h + 300); g.restore(); }
    g.restore();
    if (!this.m) { drawIcon(g, 'meeple', w / 2, h / 2, 90, '#5a3728'); return; }
    const s = this.spot, R = this.R || 80, m = this.m;
    const gr = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
    gr.addColorStop(0, 'rgba(255,214,150,.6)'); gr.addColorStop(.7, 'rgba(255,190,120,.2)'); gr.addColorStop(1, 'rgba(255,190,120,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(s.x, s.y, R, 0, 7); g.fill();
    if (this.on) {
      g.strokeStyle = 'rgba(246,193,119,.6)'; g.lineWidth = 3;
      g.beginPath(); g.arc(m.x, m.y, 46 + Math.sin(this.pulse) * 6, 0, 7); g.stroke();
    }
    drawIcon(g, 'meeple', m.x, m.y, 72, this.on ? '#f6c177' : '#6f4531', Math.sin(m.t * 6) * .08);
    drawIcon(g, 'sun', s.x, s.y, 26, 'rgba(255,230,190,.8)', this.pulse * .3);
    if (!api.hasTilt && !this.drag && api.elapsed < 3) {
      g.fillStyle = 'rgba(251,247,242,.7)'; g.font = '15px "Instrument Sans", system-ui'; g.textAlign = 'center';
      g.fillText('Geser jari atau miringkan HP', w / 2, h - 40);
    }
  },

  result(score) {
    if (score >= 200) return { title: 'Golden Hour Pro', line: 'Cahaya selalu memihakmu. Kamu siap untuk sesi personal yang dramatis.' };
    if (score >= 120) return { title: 'Lighting Artist', line: 'Tanganmu terampil mengejar cahaya. Sedikit lagi jadi master!' };
    return { title: 'Masih Mencari Cahaya', line: 'Tenang, di studio kami cahayanya sudah diatur. Kamu tinggal bergaya.' };
  },
};
