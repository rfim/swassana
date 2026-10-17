// Home for the phone/app layout, following PS5 home-screen rules in Swassana brown:
// category tabs + clock on top, a row of glass tiles (tap to focus, tap again to open),
// a full-width hero whose art, title and button follow the focused tile, and activity cards below.
import { ICONS } from './icons.js';
import { lu } from './lucide.js';
import { logout } from './login.js';

const root = document.getElementById('home');
if (root) {
  const icon = (k) => lu(k);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const best = (k) => +store.get('best-' + k) || 0;
  const fmt = (n) => Math.floor(n).toLocaleString('id-ID');

  const CITY = {
    surabaya: { name: 'Surabaya', studio: 'Swassana Studio', tag: 'Bold, Authentic, & Most-Wanted', img: 'https://swassanastudio.com/uploads/surabaya-20261011113216-b98bfd.jpg', q: 'Swassana Studio Surabaya' },
    malang: { name: 'Malang', studio: 'Casa de Swassana', tag: 'More Spacious, Modern, & KOL/Brand Approved', img: 'https://swassanastudio.com/uploads/malang-20261011094101-3d5251.jpg', q: 'Casa de Swassana Malang' },
  };
  let city = CITY[store.get('sw-city')] ? store.get('sw-city') : 'surabaya';
  const C = () => CITY[city];
  const bookUrl = () => `https://swassanastudio.com/booking/${city}`;
  const dirUrl = () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(C().q)}`;

  // Countdown from the planner (stored by planner.html)
  function plannerEyebrow() {
    try {
      const p = JSON.parse(localStorage.getItem('sw-plan') || '{}');
      if (p.session) {
        const [y, m, d] = p.session.split('-').map(Number), t = new Date(); t.setHours(0, 0, 0, 0);
        const diff = Math.round((new Date(y, m - 1, d) - t) / 864e5);
        if (diff > 0) return `Sesi ${diff} hari lagi`;
        if (diff === 0) return 'Sesi hari ini!';
      }
    } catch (e) {}
    return 'Jadwal · Checklist';
  }
  const GAMES = [
    ['personal', 'Cari Cahaya', 'sun', '#ffc46b', 'Arahkan cahaya ke model dengan memiringkan HP.'],
    ['couple', 'Love Sync', 'heart-handshake', '#ff6f91', 'Main berdua, ketuk hati tepat saat lingkaran menutup.'],
    ['keluarga', 'Semua Lihat Kamera!', 'users-round', '#ff9466', 'Ketuk anggota keluarga yang menoleh sebelum shutter.'],
    ['wisuda', 'Lempar Toga', 'graduation-cap', '#8ec5ff', 'Lempar toga setinggi mungkin, lalu tangkap lagi.'],
    ['brand', 'Flat Lay', 'shopping-bag', '#8fd6a8', 'Susun produk ke bayangannya di meja untuk katalog.'],
    ['kol', 'Viral Hype', 'megaphone', '#ff8a5c', 'Teriak ke mikrofon atau ketuk cepat untuk jadi viral.'],
  ];
  const ARTICLES = [
    ['blog/persiapan-foto-studio.html', 'Checklist persiapan sebelum sesi foto studio', 'Persiapan · 4 menit'],
    ['blog/ide-pose-foto-couple.html', '12 ide pose foto couple yang tidak kaku', 'Inspirasi · 5 menit'],
    ['blog/memilih-warna-outfit.html', 'Cara memilih warna outfit untuk foto studio', 'Styling · 4 menit'],
  ];

  // Tiles per category. photo: true uses the selected studio's photo as hero art.
  const CATS = {
    studio: () => [
      { k: 'planner', icon: 'calendar-check', c: '#ff8a5c', eyebrow: plannerEyebrow(), title: 'Planner sesimu', desc: 'Checklist hari sesi, jadwal persiapan, dan pengingat. Booking tetap lewat tombol di bawah.', btn: 'Buka planner', href: 'planner.html', photo: true },
      { k: 'arah', icon: 'navigation', c: '#ffb347', eyebrow: `Lokasi · ${C().name}`, title: 'Petunjuk arah', desc: `Buka Google Maps langsung ke ${C().studio}.`, btn: 'Buka peta', href: dirUrl(), ext: true, photo: true, city: true },
      { k: 'photobooth', icon: 'camera', c: '#ff6f91', eyebrow: 'Kamera', title: 'Photobooth Swassana', desc: 'Bingkai polaroid, strip, atau Story dengan filter khas Swassana.', btn: 'Buka kamera', href: 'photobooth.html' },
      { k: 'kuis', icon: 'sparkles', c: '#f7c873', eyebrow: 'Kuis · 30 detik', title: 'Kamu tipe sesi apa?', desc: 'Lima pertanyaan singkat untuk menemukan studio yang paling cocok.', btn: 'Mulai kuis', href: 'kuis.html' },
      { k: 'ide', icon: 'lightbulb', c: '#ffd27a', eyebrow: 'Inspirasi', title: 'Ide Pose', desc: 'Acak pose, warna outfit, properti, dan mood untuk sesimu.', btn: 'Acak ide', href: '#ide' },
      { k: 'jurnal', icon: 'book-open', c: '#8ec5ff', eyebrow: 'Jurnal', title: 'Tips sebelum ke studio', desc: 'Persiapan, ide pose, dan cara memilih warna outfit.', btn: 'Baca jurnal', href: '#t=jurnal' },
      { k: 'tim', icon: 'users', c: '#8fd6a8', eyebrow: 'Tentang kami', title: 'Tim Swassana', desc: 'Kenali orang-orang di balik setiap sesi.', btn: 'Lihat tim', href: 'team.html' },
    ],
    main: () => [
      ...GAMES.map(([k, t, i, c, d]) => {
        const b = best(k);
        return { k, icon: i, c, eyebrow: b ? `Terbaik · ${fmt(b)}` : 'Belum dimainkan', title: t, desc: d, btn: b ? 'Main lagi' : 'Main', href: `main.html?g=${k}` };
      }),
      { k: 'semua', icon: 'gamepad-2', c: '#8fd6a8', eyebrow: '6 mini game', title: 'Semua game', desc: 'Satu game untuk tiap jenis sesi, plus kuis dan photobooth.', btn: 'Lihat semua', href: 'main.html' },
    ],
  };

  if (!document.getElementById('sa-glyph')) {
    document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="sa-glyph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf5"/><stop offset=".55" stop-color="#fbe9d8"/><stop offset="1" stop-color="#e9c8aa" stop-opacity=".9"/></linearGradient><linearGradient id="sa-glass" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".98"/><stop offset=".42" stop-color="#fcefe3" stop-opacity=".88"/><stop offset=".46" stop-color="#f1d3b8" stop-opacity=".62"/><stop offset="1" stop-color="#d9a77f" stop-opacity=".55"/></linearGradient></defs></svg>');
  }

  root.innerHTML = `
    <div class="ps-art" aria-hidden="true"><div class="ps-bg" id="psBgA"></div><div class="ps-bg" id="psBgB"></div></div>
    <div class="ps-top">
      <div class="ps-cats" role="tablist" aria-label="Kategori">
        <button type="button" role="tab" data-cat="studio" aria-selected="true">Studio</button>
        <button type="button" role="tab" data-cat="main" aria-selected="false">Main</button>
      </div>
      <div class="ps-tools">
        <button type="button" class="ps-tool" id="psSearchBtn" aria-label="Cari" aria-expanded="false">${icon('search')}</button>
        <button type="button" class="ps-tool ps-out" id="psOut" aria-label="Keluar">${icon('log-out')}<span>Keluar?</span></button>
        <span class="ps-time" id="psTime"></span>
      </div>
    </div>
    <div class="ps-search" id="psSearch" hidden>
      <label class="sa-search">${icon('search')}<input id="saSearch" type="search" placeholder="Cari layanan, game, artikel…" autocomplete="off" enterkeyhint="search"></label>
      <div class="sa-results" id="saResults" hidden></div>
    </div>
    <div class="ps-row" id="psRow" role="listbox" aria-label="Aplikasi"></div>
    <section class="ps-hero" id="psHero" aria-live="polite">
      <p class="ps-eyebrow" id="psEyebrow"></p>
      <h2 class="ps-title" id="psTitle"></h2>
      <p class="ps-desc" id="psDesc"></p>
      <div class="ps-actions">
        <a class="ps-btn" id="psGo"></a>
        <button type="button" class="ps-city" id="psCity" hidden>${icon('map-pin')}<span id="psCityName"></span><b aria-hidden="true">⇄</b></button>
      </div>
    </section>
    <h3 class="ps-h" id="psActH">Aktivitas</h3>
    <div class="ps-acts" id="psActs"></div>`;

  const $ = (id) => root.querySelector('#' + id);

  // Logout: the first tap asks ("Keluar?"), a second tap within 3 s locks the app again
  let askT;
  $('psOut').addEventListener('click', (e) => {
    const b = e.currentTarget;
    if (!b.classList.contains('ask')) {
      b.classList.add('ask'); b.setAttribute('aria-label', 'Ketuk lagi untuk keluar');
      clearTimeout(askT); askT = setTimeout(() => { b.classList.remove('ask'); b.setAttribute('aria-label', 'Keluar'); }, 3000);
      return;
    }
    clearTimeout(askT); b.disabled = true; logout();
  });
  let cat = 'studio', items = CATS.studio(), focus = 0, bgFlip = false;

  // ---------- tiles ----------
  // The focused tile always sits at the far left (sharp); the rest follow in order, softly blurred.
  function renderRow() {
    $('psRow').innerHTML = items.map((it, i) => `
      <button type="button" class="ps-tile" role="option" data-i="${i}" aria-label="${it.title}" style="--c:${it.c}">
        <span class="ps-glass">${icon(it.icon)}</span>
      </button>`).join('');
    arrangeRow(false);
  }
  function arrangeRow(animate = true) {
    const row = $('psRow');
    const tiles = [...row.children];
    const first = new Map(tiles.map((t) => [t, t.getBoundingClientRect().left]));
    const order = items.map((_, n) => (focus + n) % items.length);
    order.forEach((i) => row.appendChild(tiles.find((t) => +t.dataset.i === i)));
    // Position classes: 0 = focused (sharp), 1-2 = blurred neighbours, the rest fade away
    [...row.children].forEach((t, pos) => {
      const on = pos === 0;
      t.classList.toggle('on', on); t.setAttribute('aria-selected', on);
      t.classList.toggle('n1', pos === 1); t.classList.toggle('n2', pos === 2); t.classList.toggle('gone', pos > 2);
      t.tabIndex = pos > 2 ? -1 : 0; t.setAttribute('aria-hidden', pos > 2);
    });
    if (!animate || reduce) return;
    // FLIP: slide each tile from its old spot to its new one
    tiles.forEach((t) => {
      const dx = first.get(t) - t.getBoundingClientRect().left;
      if (!dx) return;
      t.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  }

  // ---------- hero ----------
  function setBg(it) {
    const next = bgFlip ? $('psBgA') : $('psBgB'), prev = bgFlip ? $('psBgB') : $('psBgA');
    bgFlip = !bgFlip;
    next.style.setProperty('--c', it.c);
    next.innerHTML = '<i class="m1"></i><i class="m2"></i><i class="m3"></i>';
    next.classList.remove('show'); void next.offsetWidth; next.classList.add('show');
    prev.classList.remove('show');
  }
  let renderHero = function (animate = true) {
    const it = items[focus];
    $('psEyebrow').textContent = it.eyebrow;
    $('psTitle').textContent = it.title;
    $('psDesc').textContent = it.desc;
    const go = $('psGo');
    go.textContent = it.btn; go.href = it.href;
    if (it.ext) { go.target = '_blank'; go.rel = 'noopener'; } else { go.removeAttribute('target'); go.removeAttribute('rel'); }
    $('psCity').hidden = !it.city;
    $('psCityName').textContent = C().name;
    setBg(it);
    if (animate && !reduce) {
      const h = $('psHero');
      h.classList.remove('swap'); void h.offsetWidth; h.classList.add('swap');
    }
  }
  function setFocus(i, { haptic = true } = {}) {
    i = (i + items.length) % items.length;
    if (i === focus) return;
    focus = i;
    arrangeRow();
    renderHero();
    if (haptic) buzz(6);
  }

  // Swipe the icon row like a scroller; a tap on the empty space to the right moves to the next icon
  let rx = null, ry = null, rowSwiped = false;
  $('psRow').addEventListener('pointerdown', (e) => { rx = e.clientX; ry = e.clientY; rowSwiped = false; });
  $('psRow').addEventListener('pointerup', (e) => {
    if (rx === null) return;
    const dx = e.clientX - rx, dy = e.clientY - ry; rx = null;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) { rowSwiped = true; setFocus(focus + (dx < 0 ? 1 : -1)); }
  });
  $('psRow').addEventListener('click', (e) => {
    if (rowSwiped) { rowSwiped = false; return; }
    const t = e.target.closest('.ps-tile:not(.gone)');
    if (!t) {
      const last = $('psRow').querySelector('.ps-tile.n2') || $('psRow').querySelector('.ps-tile.on');
      if (last && e.clientX > last.getBoundingClientRect().right) setFocus(focus + 1);
      return;
    }
    const i = +t.dataset.i;
    if (i === focus) { $('psGo').click(); return; } // second tap opens, like pressing X on a focused tile
    setFocus(i);
  });

  // Swipe the hero left/right to move focus (d-pad feel)
  let sx = null, sy = null;
  $('psHero').addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
  $('psHero').addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) setFocus(focus + (dx < 0 ? 1 : -1));
  });
  addEventListener('keydown', (e) => {
    if (!root.classList.contains('tab-on') || e.target.closest('input')) return;
    if (e.key === 'ArrowRight') setFocus(focus + 1);
    if (e.key === 'ArrowLeft') setFocus(focus - 1);
  });

  // ---------- categories ----------
  root.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.cat === cat) return;
    cat = b.dataset.cat;
    root.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-selected', x === b));
    items = CATS[cat](); focus = 0;
    renderRow(); renderHero(); renderActs();
    if (!reduce) { const r = $('psRow'); r.classList.remove('swap'); void r.offsetWidth; r.classList.add('swap'); }
    buzz(8);
  }));

  // ---------- city (Booking/Arah) ----------
  function refreshItems() { items = CATS[cat](); renderHero(); renderActs(); }
  $('psCity').addEventListener('click', () => {
    city = city === 'surabaya' ? 'malang' : 'surabaya';
    store.set('sw-city', city);
    dispatchEvent(new CustomEvent('sw-city', { detail: city }));
    refreshItems(); buzz(8);
  });
  addEventListener('sw-city', (e) => { if (CITY[e.detail] && e.detail !== city) { city = e.detail; refreshItems(); } });

  // ---------- activity cards (2 columns, nothing clipped) ----------
  const card = (href, art, title, sub, ext) => `<a class="ps-card" href="${href}" ${ext ? 'target="_blank" rel="noopener"' : ''}><span class="ps-card-art">${art}</span><b>${title}</b><small>${sub}</small></a>`;
  const photoArt = (c) => `<img src="${CITY[c].img}" alt="" loading="lazy" onerror="this.remove()">`;
  const glyphArt = (i, c) => `<span class="ps-card-glyph" style="--c:${c}">${icon(i)}</span>`;
  let renderActs = function () {
    let html;
    if (cat === 'studio') {
      html = Object.keys(CITY).map((k) => card(`https://swassanastudio.com/booking/${k}`, photoArt(k), CITY[k].studio, CITY[k].name)).join('')
        + [['blog/persiapan-foto-studio.html', 'Checklist persiapan', 'Jurnal · 4 menit'], ['blog/ide-pose-foto-couple.html', 'Ide pose couple', 'Jurnal · 5 menit']].map(([h, t, m]) => card(h, glyphArt('book-open', '#8ec5ff'), t, m)).join('');
      $('psActH').textContent = 'Studio & bacaan';
    } else {
      const played = GAMES.filter(([k]) => best(k) > 0).sort((a, b) => best(b[0]) - best(a[0]));
      const list = [...played, ...GAMES.filter(([k]) => !best(k))].slice(0, 2);
      html = list.map(([k, t, i, c]) => card(`main.html?g=${k}`, glyphArt(i, c), t, best(k) ? `Terbaik ${fmt(best(k))}` : 'Belum dimainkan')).join('')
        + card('kuis.html', glyphArt('sparkles', '#f7c873'), 'Tipe sesimu', 'Kuis · 30 detik')
        + card('photobooth.html', glyphArt('camera', '#ff6f91'), 'Photobooth', 'Bingkai & filter khas');
      $('psActH').textContent = played.length ? 'Lanjutkan main' : 'Coba sekarang';
    }
    $('psActs').innerHTML = html;
  }

  // ---------- clock ----------
  const tickTime = () => { const d = new Date(); $('psTime').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  tickTime(); setInterval(tickTime, 15000);

  // ---------- search ----------
  const SEARCH = [
    ...CATS.studio().map((s) => ({ label: s.title, hint: s.eyebrow, icon: s.icon, c: s.c, href: () => CATS.studio().find((x) => x.k === s.k).href, ext: s.ext })),
    ...GAMES.map(([k, t, i, c]) => ({ label: t, hint: 'Mini game', icon: i, c, href: () => `main.html?g=${k}` })),
    ...ARTICLES.map(([h, t]) => ({ label: t, hint: 'Artikel', icon: 'book-open', c: '#8ec5ff', href: () => h })),
    { label: 'Lokasi & peta studio', hint: 'Lokasi', icon: 'map-pin', c: '#ffb347', href: () => '#arah' },
    { label: 'FAQ / Pertanyaan', hint: 'Info', icon: 'info', c: '#ffd27a', href: () => '#faq' },
    { label: 'Cara booking', hint: 'Info', icon: 'calendar-check', c: '#ff8a5c', href: () => '#cara' },
    { label: 'Booking studio', hint: 'Booking', icon: 'calendar-check', c: '#ff8a5c', href: bookUrl, ext: false },
  ];
  const sBtn = $('psSearchBtn'), sBox = $('psSearch'), input = $('saSearch'), results = $('saResults');
  sBtn.addEventListener('click', () => {
    const open = sBox.hidden; sBox.hidden = !open; sBtn.setAttribute('aria-expanded', open);
    if (open) input.focus(); else { input.value = ''; results.hidden = true; }
  });
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.hidden = true; return; }
    const hits = SEARCH.filter((s) => (s.label + ' ' + s.hint).toLowerCase().includes(q)).slice(0, 6);
    results.innerHTML = hits.length
      ? hits.map((s) => `<a href="${s.href()}" ${s.ext ? 'target="_blank" rel="noopener"' : ''}><span class="sa-ic sm" style="--c:${s.c}">${icon(s.icon)}</span><span><b>${s.label}</b><small>${s.hint}</small></span></a>`).join('')
      : `<p class="sa-empty">Tidak ada hasil untuk “${input.value.replace(/[<>&"]/g, '')}”</p>`;
    results.hidden = false;
  });
  results.addEventListener('click', () => { results.hidden = true; input.value = ''; sBox.hidden = true; sBtn.setAttribute('aria-expanded', 'false'); });

  // Fit the home to exactly one screen: progressively drop extras instead of overlapping or clipping
  const FIT = ['fit-1', 'fit-2', 'fit-3'];
  function fit() {
    if (!root.offsetParent) return;
    root.classList.remove(...FIT);
    for (const f of FIT) { if (root.scrollHeight <= root.clientHeight + 1) break; root.classList.add(f); }
  }
  new ResizeObserver(() => requestAnimationFrame(fit)).observe(root);
  const _renderHero = renderHero, _renderActs = renderActs;
  renderHero = (...a) => { _renderHero(...a); requestAnimationFrame(fit); };
  renderActs = (...a) => { _renderActs(...a); requestAnimationFrame(fit); };
  document.fonts && document.fonts.ready.then(fit);

  renderRow(); renderHero(false); renderActs();
  addEventListener('pageshow', () => { if (cat === 'main') { items = CATS.main(); renderHero(false); renderActs(); } });
}
