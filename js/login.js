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
        <div class="clk" id="clk" role="timer"></div>
        <p class="gate-date" id="gateDate"></p>
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

// Lock-screen style clock: each digit rolls to its new value; colon blinks softly.
function startClock(gate) {
  const clk = gate.querySelector('#clk'), dateEl = gate.querySelector('#gateDate'), greetEl = gate.querySelector('#gateGreet');
  const digit = () => `<span class="dg"><span class="dg-track">${[...Array(10).keys()].map((n) => `<b>${n}</b>`).join('')}</span></span>`;
  clk.innerHTML = digit() + digit() + '<span class="colon">:</span>' + digit() + digit();
  const tracks = [...clk.querySelectorAll('.dg-track')];
  const fmtDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  let last = '';
  const tick = () => {
    if (!gate.isConnected) return;
    const now = new Date(), h = now.getHours(), m = now.getMinutes();
    const str = String(h).padStart(2, '0') + String(m).padStart(2, '0');
    if (str !== last) {
      [...str].forEach((d, i) => { tracks[i].style.transform = `translateY(${-d * 10}%)`; });
      clk.setAttribute('aria-label', `Pukul ${str.slice(0, 2)}.${str.slice(2)}`);
      dateEl.textContent = fmtDate.format(now);
      greetEl.textContent = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
      last = str;
    }
    setTimeout(tick, 1000 - now.getMilliseconds());
  };
  tick();
}

export function logout() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  location.reload();
}

if (root.classList.contains('locked')) render();
document.getElementById('logoutBtn')?.addEventListener('click', logout);
