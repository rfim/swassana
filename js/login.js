// Login gate for the phone/app layout. This is a client-side gate only: on a static site anyone can read
// or bypass this code, so it keeps casual visitors out but protects nothing secret.
// Only a SHA-256 hash of "id:password" is stored here, never the plain credentials.
import { makeLogo } from './logo.js';
import { crest } from './crests.js';

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
        <p class="hello-tag" id="helloTag" aria-hidden="true"></p>
        <h1 class="hello" id="hello" aria-live="polite"><span class="h1l" id="gateGreet">Selamat datang</span><br><em class="h2l" id="helloSub">senang melihatmu lagi</em></h1>
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
  startHello(gate);
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
  const pol = gate.querySelector('#gpol'), ph = gate.querySelector('#clk'), dateEl = gate.querySelector('#gateDate');
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

// Greeting in eleven languages (incl. Javanese, Sundanese, Balinese, Madurese, Japanese), rotating every 7 seconds; time-neutral words.
// Every third turn shows a "kamus" word from one of those languages with its meaning in Indonesian.
const HELLO = [
  { tag: 'Indonesia', lang: 'id', hi: 'Halo', sub: 'senang melihatmu lagi' },
  { tag: 'Jawa', lang: 'jv', hi: 'Sugeng rawuh', sub: 'monggo pinarak' },
  { tag: 'Nederlands', lang: 'nl', hi: 'Hoi', sub: 'fijn je weer te zien' },
  { tag: 'Sunda', lang: 'su', hi: 'Wilujeng sumping', sub: 'kumaha damang?' },
  { tag: 'British', lang: 'en', hi: 'Hello there', sub: 'lovely to see you again' },
  { tag: 'Bali', lang: 'ban', hi: 'Om Swastyastu', sub: 'rahajeng rauh' },
  { tag: 'Deutsch', lang: 'de', hi: 'Hallo', sub: 'schön, dich wiederzusehen' },
  { tag: 'Madura', lang: 'mad', hi: 'Salamet dhâteng', sub: 'ponapa kabhârrâ?' },
  { tag: 'Français', lang: 'fr', hi: 'Salut', sub: 'ravi de te revoir' },
  { tag: 'Svenska', lang: 'sv', hi: 'Hej', sub: 'kul att se dig igen' },
  { tag: '日本語 · Nihongo', lang: 'ja', hi: 'ようこそ', sub: 'また会えてうれしいです' },
];
const KAMUS = [
  ['Indonesia', 'id', 'gemas', 'ingin mencubit sesuatu yang terlalu lucu'],
  ['Indonesia', 'id', 'jayus', 'lelucon yang garing, tapi tetap bikin senyum'],
  ['Indonesia', 'id', 'senja', 'saat langit memerah ketika matahari terbenam'],
  ['Jawa', 'jv', 'guyub', 'rukun dan hangat dalam kebersamaan'],
  ['Jawa', 'jv', 'sumringah', 'wajah berseri karena bahagia'],
  ['Jawa', 'jv', 'tepa selira', 'tenggang rasa; ikut merasakan hati orang lain'],
  ['Sunda', 'su', 'someah', 'ramah dan menyenangkan kepada tamu'],
  ['Sunda', 'su', 'ngabuburit', 'mengisi waktu menunggu berbuka puasa'],
  ['Sunda', 'su', 'silih asih', 'saling mengasihi satu sama lain'],
  ['Bali', 'ban', 'suksma', 'terima kasih'],
  ['Bali', 'ban', 'ngayah', 'bekerja tulus bersama tanpa pamrih'],
  ['Bali', 'ban', 'tri hita karana', 'harmoni dengan Tuhan, sesama, dan alam'],
  ['Madura', 'mad', 'toron', 'pulang ke kampung halaman'],
  ['Madura', 'mad', 'abhântal ombâ', 'berbantal ombak; jiwa pelaut yang tangguh'],
  ['Madura', 'mad', 'bhuppa’ bhâbhu’ ghuru rato', 'hormati ayah, ibu, guru, lalu pemimpin'],
  ['Svenska', 'sv', 'fika', 'rehat ngopi santai, biasanya dengan kue'],
  ['Svenska', 'sv', 'lagom', 'tidak kurang, tidak lebih; pas'],
  ['Svenska', 'sv', 'mångata', 'jalur cahaya bulan yang memantul di air'],
  ['Nederlands', 'nl', 'gezellig', 'suasana hangat, nyaman, dan akrab'],
  ['Nederlands', 'nl', 'uitwaaien', 'berjalan diterpa angin untuk menjernihkan pikiran'],
  ['Nederlands', 'nl', 'kiekje', 'foto jepretan santai yang spontan'],
  ['Deutsch', 'de', 'Gemütlichkeit', 'rasa nyaman, hangat, dan diterima'],
  ['Deutsch', 'de', 'Fernweh', 'rindu pada tempat yang belum pernah didatangi'],
  ['Deutsch', 'de', 'Augenblick', 'sekejap mata; momen singkat yang berharga'],
  ['Français', 'fr', 'joie de vivre', 'kegembiraan menikmati hidup'],
  ['Français', 'fr', 'flâneur', 'orang yang berjalan santai menikmati kota'],
  ['Français', 'fr', 'dépaysement', 'rasa asing yang menyegarkan di tempat baru'],
  ['British', 'en', 'serendipity', 'menemukan hal baik secara kebetulan'],
  ['British', 'en', 'golden hour', 'cahaya hangat saat matahari terbit dan terbenam'],
  ['British', 'en', 'wanderlust', 'keinginan kuat untuk menjelajah dunia'],
  ['日本語 · Nihongo', 'ja', 'komorebi 木漏れ日', 'sinar matahari yang menembus dedaunan'],
  ['日本語 · Nihongo', 'ja', 'ichigo ichie 一期一会', 'tiap pertemuan hanya sekali; hargai momennya'],
  ['日本語 · Nihongo', 'ja', 'wabi-sabi 侘寂', 'indah dalam kesederhanaan dan ketidaksempurnaan'],
];
function startHello(gate) {
  const tagEl = gate.querySelector('#helloTag'), h1 = gate.querySelector('#hello'), l1 = gate.querySelector('#gateGreet'), l2 = gate.querySelector('#helloSub');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let turn = 0, li = 0, lastWord = -1;
  // Title split into words (never broken) made of letters, so letters can animate one by one
  const letters = (text) => text.split(' ').map((w, wi, arr) => {
    const chars = Array.from(w).map((ch) => `<span class="ch">${ch}</span>`).join('');
    return `<span class="wd">${chars}</span>${wi < arr.length - 1 ? ' ' : ''}`;
  }).join('');
  const index = (el) => el.querySelectorAll('.ch').forEach((c, i) => c.style.setProperty('--i', i));
  const next = () => {
    const dict = turn === 0 || turn % 3 === 2;
    let tag, word, sub, lang;
    if (dict) {
      let k;
      if (turn === 0) k = KAMUS.findIndex(([, , w]) => w === 'fika'); // fika always opens the rotation
      else do { k = Math.floor(Math.random() * KAMUS.length); } while (k === lastWord && KAMUS.length > 1);
      lastWord = k;
      [tag, lang, word, sub] = KAMUS[k]; tag = `Kamus · ${tag}`;
    } else {
      const g = HELLO[li % HELLO.length]; li++;
      tag = g.tag; lang = g.lang; word = g.hi + ','; sub = g.sub;
    }
    turn++;
    return { dict, tag, word, sub, lang };
  };
  const paint = ({ dict, tag, word, sub, lang }) => {
    tagEl.innerHTML = `${crest(lang)}<span class="tg">${tag}</span>`;
    l1.innerHTML = letters(word); index(l1);
    l2.textContent = sub;
    h1.lang = lang === 'en' ? 'en-GB' : lang;
    h1.classList.toggle('dict', dict);
  };
  const show = () => {
    if (!gate.isConnected) return;
    const n = next();
    if (reduce || turn === 1) { paint(n); [h1, tagEl].forEach((el) => { el.classList.remove('out'); el.classList.add('in'); }); return; }
    // out: letters lift away one by one, crest turns edge-on; then the new text comes in
    [h1, tagEl].forEach((el) => { el.classList.remove('in'); el.classList.add('out'); });
    const outMs = 260 + Math.min(l1.querySelectorAll('.ch').length, 20) * 12;
    setTimeout(() => {
      paint(n);
      [h1, tagEl].forEach((el) => { el.classList.remove('out'); void el.offsetWidth; el.classList.add('in'); });
    }, outMs);
  };
  show();
  setInterval(show, 7000);
}

export function logout() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  location.reload();
}

if (root.classList.contains('locked')) render();
document.getElementById('logoutBtn')?.addEventListener('click', logout);
