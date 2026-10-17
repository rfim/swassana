// KOL: "Viral Hype". Shout into the mic (or tap fast) to fill the hype meter; tap trending tags for bonus followers.
import { drawIcon, rand } from '../mini.js';

const TAGS = ['#OOTD', '#Swassana', '#FotoStudio', '#Surabaya', '#Malang', '#GRWM', '#Trending', '#FYP'];

export default {
  key: 'kol', title: 'Viral Hype', icon: 'megaphone', color: '#c06a45', duration: 20, unit: 'followers',
  how: 'Teriak ke HP (izinkan mikrofon) atau ketuk layar secepat mungkin untuk menaikkan hype. Ketuk hashtag yang muncul untuk bonus followers!',
  fmt(n) { n = Math.floor(n); return n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' jt' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.', ',') + ' rb' : String(n); },

  async setup() {
    this.hype = 0; this.tags = []; this.wave = 0; this.mic = null; this.level = 0;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const an = ctx.createAnalyser(); an.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(an);
      this.mic = { stream, ctx, an, buf: new Uint8Array(an.fftSize) };
    } catch (e) { this.mic = null; }
  },
  teardown() {
    if (this.mic) { this.mic.stream.getTracks().forEach((t) => t.stop()); this.mic.ctx.close(); this.mic = null; }
  },

  pointerdown(p, api) {
    for (let i = this.tags.length - 1; i >= 0; i--) {
      const t = this.tags[i];
      if (Math.abs(p.x - t.x) < 70 && Math.abs(p.y - t.y) < 24) {
        this.tags.splice(i, 1);
        const bonus = 2000 + Math.round(this.hype * 8000);
        api.add(bonus); this.hype = Math.min(1, this.hype + .2);
        api.float('+' + this.fmt(bonus), t.x, t.y - 20, '#ffe1b8', 24);
        api.burst(t.x, t.y, '#ffd08a', 12); api.buzz([15, 25, 15]); api.tick(1200);
        return;
      }
    }
    this.hype = Math.min(1, this.hype + .055); api.buzz(6);
  },

  update(dt, api) {
    if (this.mic) {
      const { an, buf } = this.mic; an.getByteTimeDomainData(buf);
      let sum = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
      this.level = Math.sqrt(sum / buf.length);
      if (this.level > .04) this.hype = Math.min(1, this.hype + (this.level - .04) * dt * 9);
    }
    this.hype = Math.max(0, this.hype - dt * .22);
    this.wave += dt * (2 + this.hype * 10);
    api.add(Math.pow(this.hype, 2) * 9000 * dt);
    if (Math.random() < dt * .8 && this.tags.length < 3) {
      this.tags.push({ text: TAGS[Math.floor(rand(0, TAGS.length))], x: rand(80, api.w - 80), y: rand(api.h * .2, api.h * .45), life: 2.6 });
    }
    for (let i = this.tags.length - 1; i >= 0; i--) { this.tags[i].life -= dt; this.tags[i].y -= dt * 12; if (this.tags[i].life <= 0) this.tags.splice(i, 1); }
    if (this.hype > .85 && Math.random() < dt * 6) api.burst(api.w / 2 + 60, api.h * .62, '#ffb36b', 2);
  },

  draw(g, api) {
    const { w, h } = api;
    const hype = this.hype || 0;
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, `rgb(${46 + hype * 120},${27 + hype * 40},${22 + hype * 10})`); bg.addColorStop(1, '#1a110e');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const cx = w / 2 - 30, cy = h * .62, size = Math.min(w, h) * .3 * (1 + hype * .12 + Math.sin((this.wave || 0) * 3) * hype * .04);
    // sound waves
    for (let k = 1; k <= 4; k++) {
      const r = size * .45 + k * 26 + ((this.wave || 0) * 20 % 26);
      g.strokeStyle = `rgba(255,208,138,${Math.max(0, hype - k * .15) * .8})`; g.lineWidth = 4;
      g.beginPath(); g.arc(cx + size * .3, cy, r, -.6, .6); g.stroke();
    }
    drawIcon(g, 'megaphone', cx, cy, size, '#fbf7f2', -.08 + Math.sin((this.wave || 0) * 2) * hype * .06);
    // hype meter
    const bx = 24, by = h * .2, bh = h * .55;
    g.fillStyle = 'rgba(251,247,242,.15)'; g.fillRect(bx, by, 14, bh);
    const mg = g.createLinearGradient(0, by + bh, 0, by); mg.addColorStop(0, '#c06a45'); mg.addColorStop(1, '#ffd08a');
    g.fillStyle = mg; g.fillRect(bx, by + bh * (1 - hype), 14, bh * hype);
    g.fillStyle = 'rgba(251,247,242,.7)'; g.font = '600 11px "Instrument Sans", system-ui'; g.textAlign = 'left';
    g.fillText('HYPE', bx - 4, by - 10);
    for (const t of this.tags || []) {
      g.globalAlpha = Math.min(1, t.life);
      g.fillStyle = 'rgba(251,247,242,.95)'; g.beginPath(); g.roundRect(t.x - 64, t.y - 20, 128, 40, 20); g.fill();
      g.fillStyle = '#c06a45'; g.font = '700 16px "Instrument Sans", system-ui'; g.textAlign = 'center'; g.fillText(t.text, t.x, t.y + 6);
      g.globalAlpha = 1;
    }
    if (api.playing) {
      g.fillStyle = 'rgba(251,247,242,.6)'; g.font = '13px "Instrument Sans", system-ui'; g.textAlign = 'center';
      g.fillText(this.mic ? '🎤 Teriak lebih keras!' : 'Ketuk secepatnya!', w / 2, h - 36);
    }
  },

  result(score) {
    if (score >= 120000) return { title: 'Mega Influencer', line: 'Satu teriakan, ratusan ribu followers. Saatnya konten KOL di Casa de Swassana!' };
    if (score >= 50000) return { title: 'Rising Star', line: 'Algoritma mulai sayang kamu. Konten studio bisa jadi pendorong berikutnya.' };
    return { title: 'Micro Creator', line: 'Semua mulai dari sini. Foto studio yang rapi bikin feed-mu naik kelas.' };
  },
};
