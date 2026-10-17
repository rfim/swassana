// Login gate for the phone/app layout. This is a client-side gate only: on a static site anyone can read
// or bypass this code, so it keeps casual visitors out but protects nothing secret.
// Only a SHA-256 hash of "id:password" is stored here, never the plain credentials.
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
      <span class="brand">Swassana</span>
      <div>
        <p class="eyebrow">Studio Foto · Surabaya &amp; Malang</p>
        <h1>Selamat datang<br><em>kembali</em></h1>
        <p class="muted">Masuk untuk melanjutkan.</p>
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

export function logout() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  location.reload();
}

if (root.classList.contains('locked')) render();
document.getElementById('logoutBtn')?.addEventListener('click', logout);
