// Login gate for the phone/app layout. This is a client-side gate only: on a static site anyone can read
// or bypass this code, so it keeps casual visitors out but protects nothing secret.
// Only a SHA-256 hash of "id:password" is stored here, never the plain credentials.
import { makeLogo } from './logo.js';
import { crest } from './crests.js';
import { playOutro } from './intro.js';

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
        <div class="glens" id="glens">
          <div class="glens-dial">${lensSvg()}<span class="glens-time"><b id="clk" role="timer"></b><i id="lensS"></i></span></div>
          <p class="glens-cap" id="gateDate"></p>
        </div>
        <div class="gkal" id="gkal" aria-hidden="true"><p id="gkalTxt"></p><small id="gkalDate"></small></div>
      </div>
      <div class="gate-hello">
        <p class="hello-tag" id="helloTag" aria-hidden="true"></p>
        <h1 class="hello" id="hello" aria-live="polite"><span class="h1l" id="gateGreet">Selamat datang</span><br><em class="h2l" id="helloSub">senang melihatmu lagi</em></h1>
        <p class="muted">Masuk untuk melanjutkan ke Swassana.</p>
      </div>
      <form id="gateForm" novalidate>
        <label>Nomor HP
          <input id="gateId" name="id" type="tel" inputmode="tel" autocomplete="tel" placeholder="08xx xxxx xxxx" required>
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
  // the website's moving game banner, under the logo: each item opens its mini game (no login needed)
  const track = document.querySelector('.marquee .marquee-track');
  if (track) gate.querySelector('.logo').insertAdjacentHTML('afterend', `<nav class="gate-mq" aria-label="Main tanpa masuk"><div class="marquee-track">${track.innerHTML}</div></nav>`);
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
    const id = form.id.value.replace(/[\s-]/g, ''), p = form.pw.value;
    if (!id || !p) { err.textContent = 'Isi nomor HP dan kata sandi.'; return; }
    btn.disabled = true; btn.textContent = 'Memeriksa…';
    const ok = (await sha256(`${id}:${p}`)) === HASH;
    if (ok) {
      try { navigator.vibrate && navigator.vibrate(15); } catch (er) {}
      gate.classList.add('gate-out');
      setTimeout(unlock, 350);
    } else {
      err.textContent = 'Nomor HP atau kata sandi salah.';
      btn.disabled = false; btn.textContent = 'Masuk';
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      try { navigator.vibrate && navigator.vibrate([30, 40, 30]); } catch (er) {}
      form.pw.value = ''; form.pw.focus();
    }
  });
}

// Login clock: alternates every 5 minutes between Kalimat (time in words) and
// Lensa (a lens barrel: the focus ring turns with the seconds, the aperture ring with the minutes).
const SAT = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
const words = (n) => n < 12 ? SAT[n] : n < 20 ? `${n === 12 ? 'dua' : SAT[n - 10]} belas` : `${SAT[Math.floor(n / 10)]} puluh${n % 10 ? ' ' + SAT[n % 10] : ''}`;
const pad = (n) => String(n).padStart(2, '0');
function lensSvg() {
  const ticks = (r, n, len, w, every, lbl) => [...Array(n)].map((_, i) => {
    const a = i / n * Math.PI * 2, big = i % every === 0, l = big ? len : len / 2;
    const x1 = 100 + Math.sin(a) * r, y1 = 100 - Math.cos(a) * r, x2 = 100 + Math.sin(a) * (r - l), y2 = 100 - Math.cos(a) * (r - l);
    const t = big && lbl ? `<text x="${(100 + Math.sin(a) * (r - len - 7)).toFixed(1)}" y="${(100 - Math.cos(a) * (r - len - 7) + 2.4).toFixed(1)}" font-size="6.5" text-anchor="middle" fill="#f6efe8" opacity=".85">${lbl(i)}</text>` : '';
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#f6efe8" stroke-width="${big ? w * 1.6 : w}" opacity="${big ? .9 : .45}"/>${t}`;
  }).join('');
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
    <defs><radialGradient id="glensGlass" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#f4b79a"/><stop offset=".45" stop-color="#b86b4b"/><stop offset="1" stop-color="#2c201b"/></radialGradient></defs>
    <circle cx="100" cy="100" r="98" fill="#2c201b"/>
    <g class="glens-rot" id="lensSec">${ticks(94, 60, 8, .8, 5, (i) => pad(i))}</g>
    <circle cx="100" cy="100" r="66" fill="#3a2a22"/>
    <g class="glens-rot" id="lensMin">${ticks(64, 12, 6, 1.2, 1, (i) => ['1.4', '2', '2.8', '4', '5.6', '8', '11', '16', '22', '16', '8', '2'][i])}</g>
    <circle class="glens-glass" cx="100" cy="100" r="44" fill="url(#glensGlass)"/>
    <ellipse cx="86" cy="80" rx="16" ry="9" fill="#fff" opacity=".18" transform="rotate(-30 86 80)"/>
    <polygon points="100,4 96,12 104,12" fill="#f4b79a"/>
  </svg>`;
}
function startClock(gate) {
  const lens = gate.querySelector('#glens'), ph = gate.querySelector('#clk'), dateEl = gate.querySelector('#gateDate');
  const secRing = gate.querySelector('#lensSec'), minRing = gate.querySelector('#lensMin'), lensS = gate.querySelector('#lensS');
  const box = gate.querySelector('.gate-clock');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmtDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  let last = '', spin = 0, lastSec = -1, prev = [], swapT;
  const kalTxt = gate.querySelector('#gkalTxt');
  const html = (seq, from = 0, to = -1, cls = '') => seq.map(([w, num], n) => {
    const c = [num ? 'num' : '', n >= from && n < to ? cls : ''].join(' ').trim();
    return `<span class="${c}" style="--k:${Math.max(0, n - from)}">${w}</span>`;
  }).join(' ');
  const kalimat = (seq, full) => {
    const old = prev; prev = seq;
    clearTimeout(swapT);
    kalTxt.classList.remove('rise');
    if (full || reduce || !old.length) {
      kalTxt.innerHTML = html(seq);
      if (!reduce) { void kalTxt.offsetWidth; kalTxt.classList.add('rise'); }
      return;
    }
    // common words at the start and the end stay put; only the words between them change
    const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
    let p = 0; while (p < old.length && p < seq.length && same(old[p], seq[p])) p++;
    let q = 0; while (q < old.length - p && q < seq.length - p && same(old[old.length - 1 - q], seq[seq.length - 1 - q])) q++;
    if (p === seq.length && p === old.length) return;
    const spans = kalTxt.querySelectorAll('span');
    for (let i = p; i < old.length - q; i++) { spans[i].style.setProperty('--k', i - p); spans[i].classList.add('leave'); }
    swapT = setTimeout(() => { kalTxt.innerHTML = html(seq, p, seq.length - q, 'enter'); }, old.length - q > p ? 380 : 0);
  };
  const tick = () => {
    if (!gate.isConnected) return;
    const now = new Date(), h = now.getHours(), m = now.getMinutes(), sec = now.getSeconds();
    const str = pad(h) + ':' + pad(m);
    if (str !== last) {
      ph.textContent = str;
      ph.setAttribute('aria-label', `Pukul ${pad(h)}.${pad(m)}`);
      dateEl.textContent = fmtDate.format(now);
      // Kalimat: the time in Indonesian words, numbers highlighted, words rise in one by one
      const h12 = h % 12 || 12, part = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam';
      const hw = words(h12).split(' '), mw = m ? words(m).split(' ') : [];
      const seq = [['sekarang', 0], ['pukul', 0], ...hw.map((w) => [w, 1]), ...(m ? [['lewat', 0], ...mw.map((w) => [w, 1])] : [['tepat', 0]]), [part, 0]];
      gate.querySelector('#gkalDate').textContent = dateEl.textContent;
      // Alternate every 5 minutes: Kalimat first, then Lensa
      const mode = Math.floor((h * 60 + m) / 5) % 2 === 0 ? 'kal' : 'lens';
      const switched = box.dataset.mode !== mode;
      box.dataset.mode = mode;
      gate.querySelector('#gkal').setAttribute('aria-hidden', mode !== 'kal');
      lens.setAttribute('aria-hidden', mode !== 'lens');
      // Kalimat: whole sentence rises in when it appears; after that each minute only the changed words swap
      kalimat(seq, !last || (switched && mode === 'kal'));
      if (!reduce && switched && mode === 'lens') { lens.classList.remove('focus'); void lens.offsetWidth; lens.classList.add('focus'); }
      last = str;
    }
    if (sec !== lastSec) {
      // Lensa: the focus ring clicks one notch per second (always forward, so 59 -> 00 does not spin back),
      // the aperture ring drifts with the minutes
      spin += lastSec < 0 ? sec : (sec - lastSec + 60) % 60;
      secRing.style.transform = `rotate(${-spin * 6}deg)`;
      minRing.style.transform = `rotate(${(m * 60 + sec) * .1}deg)`;
      lensS.textContent = pad(sec);
      lensS.classList.remove('tk'); void lensS.offsetWidth; lensS.classList.add('tk');
      lastSec = sec;
    }
    setTimeout(tick, 1000 - now.getMilliseconds());
  };
  tick();
  // a tap on the lens racks focus: the rings spin a full turn and settle back
  lens.addEventListener('click', () => {
    if (!reduce) { lens.classList.remove('rack'); void lens.offsetWidth; lens.classList.add('rack'); }
    try { navigator.vibrate && navigator.vibrate(10); } catch (e) {}
  });
}

// Greeting in eleven languages (incl. Javanese, Sundanese, Balinese, Madurese, Japanese), rotating every 30 seconds; time-neutral words.
// Every third turn (starting with the second) shows a "kamus" word from one of those languages with its meaning in Indonesian.
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
  let turn = 0, li = Math.floor(Math.random() * HELLO.length), lastWord = -1;
  // Title split into words (never broken) made of letters, so letters can animate one by one
  const letters = (text) => text.split(' ').map((w, wi, arr) => {
    const chars = Array.from(w).map((ch) => `<span class="ch">${ch}</span>`).join('');
    return `<span class="wd">${chars}</span>${wi < arr.length - 1 ? ' ' : ''}`;
  }).join('');
  const index = (el) => el.querySelectorAll('.ch').forEach((c, i) => c.style.setProperty('--i', i));
  const next = () => {
    const dict = turn % 3 === 1; // a random greeting first, then fika, then every third turn
    let tag, word, sub, lang;
    if (dict) {
      let k;
      if (turn === 1) k = KAMUS.findIndex(([, , w]) => w === 'fika'); // fika always follows the first greeting
      else do { k = Math.floor(Math.random() * KAMUS.length); } while (k === lastWord && KAMUS.length > 1);
      lastWord = k;
      [tag, lang, word, sub] = KAMUS[k];
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
  setInterval(show, 30000);
}

export function logout() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  playOutro(() => location.reload());
}

if (root.classList.contains('locked')) render();
document.getElementById('logoutBtn')?.addEventListener('click', logout);
