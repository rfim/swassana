// Login gate for the phone/app layout. This is a client-side gate only: on a static site anyone can read
// or bypass this code, so it keeps casual visitors out but protects nothing secret.
// Only a SHA-256 hash of "id:password" is stored here, never the plain credentials.
import { makeLogo } from './logo.js';

const HASH = 'b58f51929f7fe337cebc3a7fc162673d510b757fdfc439d7aed4947f7561fc90';
const KEY = 'sw-auth';
const root = document.documentElement;

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function unlock() {
  try { localStorage.setItem(KEY, HASH); } catch (e) {}
  root.classList.remove('locked');
  document.getElementById('gate')?.remove();
}

function render() {
  const gate = document.createElement('div');
  gate.className = 'gate'; gate.id = 'gate';
  gate.innerHTML = `
    <div class="gate-inner">
      <button class="logo" type="button" aria-label="Swassana"></button>
      <div class="gate-clock" aria-live="off">
        <div class="gpol" id="gpol">
          <div class="gpol-ph" id="clk" role="timer"></div>
          <p class="gpol-cap" id="gateDate"></p>
        </div>
        <div class="gkal" id="gkal" aria-hidden="true"><p id="gkalTxt"></p><small id="gkalDate"></small></div>
      </div>
      <div>
        <h1><span id="gateGreet">Selamat datang</span>,<br><em>senang melihatmu lagi</em></h1>
        <p class="muted">Masuk untuk melanjutkan ke Swassana.</p>
      </div>
      <form id="gateForm" novalidate>
        <label>ID Pengguna
          <input id="gateId" name="id" inputmode="numeric" autocomplete="username" required>
        </label>
        <label>Kata Sandi
          <span class="pw">
            <input id="gatePw" name="pw" type="password" inputmode="numeric" autocomplete="current-password" required>
            <button type="button" id="gateShow" aria-label="Tampilkan kata sandi">Lihat</button>
          </span>
        </label>
        <p class="gate-err" id="gateErr" role="alert"></p>
        <button class="pill pill-solid big-btn" type="submit" id="gateBtn">Masuk</button>
      </form>
    </div>`;
  document.body.appendChild(gate);
  startClock(gate);
  makeLogo(gate.querySelector('.logo'));
  const form = gate.querySelector('#gateForm'), err = gate.querySelector('#gateErr'), btn = gate.querySelector('#gateBtn');
  const pw = gate.querySelector('#gatePw');
  gate.querySelector('#gateShow').addEventListener('click', (e) => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    e.currentTarget.textContent = show ? 'Sembunyikan' : 'Lihat';
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = form.id.value.trim(), p = form.pw.value;
    if (!id || !p) { err.textContent = 'Isi ID pengguna dan kata sandi.'; return; }
    btn.disabled = true; btn.textContent = 'Memeriksa…';
    const ok = (await sha256(`${id}:${p}`)) === HASH;
    if (ok) {
      try { navigator.vibrate && navigator.vibrate(15); } catch (er) {}
      gate.classList.add('gate-out');
      setTimeout(unlock, 350);
    } else {
      err.textContent = 'ID pengguna atau kata sandi salah.';
      btn.disabled = false; btn.textContent = 'Masuk';
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      try { navigator.vibrate && navigator.vibrate([30, 40, 30]); } catch (er) {}
      form.pw.value = ''; form.pw.focus();
    }
  });
}

// Login clock: alternates every 5 minutes between Kalimat (time in words) and Polaroid
// (a fresh print drops in and develops). Tint follows the time of day.
const SAT = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
const words = (n) => n < 12 ? SAT[n] : n < 20 ? `${n === 12 ? 'dua' : SAT[n - 10]} belas` : `${SAT[Math.floor(n / 10)]} puluh${n % 10 ? ' ' + SAT[n % 10] : ''}`;
function startClock(gate) {
  const pol = gate.querySelector('#gpol'), ph = gate.querySelector('#clk'), dateEl = gate.querySelector('#gateDate'), greetEl = gate.querySelector('#gateGreet');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmtDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  const pad = (n) => String(n).padStart(2, '0');
  const restart = (cls) => { pol.classList.remove(cls); void pol.offsetWidth; pol.classList.add(cls); };
  let last = '';
  const tick = () => {
    if (!gate.isConnected) return;
    const now = new Date(), h = now.getHours(), m = now.getMinutes();
    const str = pad(h) + ':' + pad(m);
    if (str !== last) {
      // tint follows the time of day: dawn gold, day sky, late-afternoon peach, night dusk
      const tint = h < 6 || h >= 19 ? ['#6b5a7e', '#3a2a3e'] : h < 10 ? ['#f3d6a1', '#f4b79a'] : h < 15 ? ['#bfd5ef', '#f2b6c3'] : ['#f4b79a', '#e46f6f'];
      pol.style.setProperty('--p1', tint[0]); pol.style.setProperty('--p2', tint[1]);
      ph.textContent = str;
      ph.setAttribute('aria-label', `Pukul ${pad(h)}.${pad(m)}`);
      dateEl.textContent = fmtDate.format(now);
      greetEl.textContent = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
      // Kalimat: the time in Indonesian words, numbers highlighted, words rise in one by one
      const h12 = h % 12 || 12, part = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam';
      const hw = words(h12).split(' '), mw = m ? words(m).split(' ') : [];
      const seq = [['sekarang', 0], ['pukul', 0], ...hw.map((w) => [w, 1]), ...(m ? [['lewat', 0], ...mw.map((w) => [w, 1])] : [['tepat', 0]]), [part, 0]];
      gate.querySelector('#gkalTxt').innerHTML = seq.map(([w, num], n) => `<span class="${num ? 'num' : ''}" style="animation-delay:${n * 70}ms">${w}</span>`).join(' ');
      gate.querySelector('#gkalDate').textContent = dateEl.textContent;
      // Alternate every 5 minutes: Kalimat first, then Polaroid
      const mode = Math.floor((h * 60 + m) / 5) % 2 === 0 ? 'kal' : 'pol';
      const box = gate.querySelector('.gate-clock');
      const switched = box.dataset.mode !== mode;
      box.dataset.mode = mode;
      gate.querySelector('#gkal').setAttribute('aria-hidden', mode !== 'kal');
      pol.setAttribute('aria-hidden', mode !== 'pol');
      if (!reduce) {
        if (mode === 'pol') { if (last) restart('drop'); restart('dev'); }
        else { const t = gate.querySelector('#gkalTxt'); t.classList.remove('rise'); void t.offsetWidth; t.classList.add('rise'); }
      }
      last = str;
    }
    setTimeout(tick, 1000 - now.getMilliseconds());
  };
  tick();
  // a tap on the polaroid "shakes" it, like waving a fresh print
  pol.addEventListener('click', () => { if (!reduce) restart('shake'); try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} });
}

export function logout() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  location.reload();
}

if (root.classList.contains('locked')) render();
document.getElementById('logoutBtn')?.addEventListener('click', logout);
