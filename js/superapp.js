// Home for the phone/app layout, following PS5 home-screen rules in Swassana brown:
// category tabs + clock on top, a row of glass tiles (tap to focus, tap again to open),
// a full-width hero whose art, title and button follow the focused tile, and activity cards below.
import { ICONS } from './icons.js';

const root = document.getElementById('home');
if (root) {
  const icon = (k) => `<svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="${ICONS[k]}"/></svg>`;
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

  const GAMES = [
    ['personal', 'Cari Cahaya', 'meeple', '#c06a45', 'Arahkan cahaya ke model dengan memiringkan HP.'],
    ['couple', 'Love Sync', 'lovers', '#b5524a', 'Main berdua, ketuk hati tepat saat lingkaran menutup.'],
    ['keluarga', 'Semua Lihat Kamera!', 'meepleGroup', '#a3745a', 'Ketuk anggota keluarga yang menoleh sebelum shutter.'],
    ['wisuda', 'Lempar Toga', 'cap', '#8a5a42', 'Lempar toga setinggi mungkin, lalu tangkap lagi.'],
    ['brand', 'Flat Lay', 'bag', '#6f8a5c', 'Susun produk ke bayangannya di meja untuk katalog.'],
    ['kol', 'Viral Hype', 'megaphone', '#c06a45', 'Teriak ke mikrofon atau ketuk cepat untuk jadi viral.'],
  ];
  const ARTICLES = [
    ['blog/persiapan-foto-studio.html', 'Checklist persiapan sebelum sesi foto studio', 'Persiapan · 4 menit'],
    ['blog/ide-pose-foto-couple.html', '12 ide pose foto couple yang tidak kaku', 'Inspirasi · 5 menit'],
    ['blog/memilih-warna-outfit.html', 'Cara memilih warna outfit untuk foto studio', 'Styling · 4 menit'],
  ];

  // Tiles per category. photo: true uses the selected studio's photo as hero art.
  const CATS = {
    studio: () => [
      { k: 'booking', icon: 'calendar', c: '#6f4531', eyebrow: `Studio · ${C().name}`, title: `Booking ${C().studio}`, desc: `${C().tag}. Pilih jadwal yang masih kosong.`, btn: 'Booking sekarang', href: bookUrl(), photo: true, city: true },
      { k: 'arah', icon: 'pin', c: '#c06a45', eyebrow: `Lokasi · ${C().name}`, title: 'Petunjuk arah', desc: `Buka Google Maps langsung ke ${C().studio}.`, btn: 'Buka peta', href: dirUrl(), ext: true, photo: true, city: true },
      { k: 'photobooth', icon: 'camera', c: '#8a5a42', eyebrow: 'Kamera', title: 'Photobooth Swassana', desc: 'Bingkai polaroid, strip, atau Story dengan filter khas Swassana.', btn: 'Buka kamera', href: 'photobooth.html' },
      { k: 'kuis', icon: 'medal', c: '#b08a4a', eyebrow: 'Kuis · 30 detik', title: 'Kamu tipe sesi apa?', desc: 'Lima pertanyaan singkat untuk menemukan studio yang paling cocok.', btn: 'Mulai kuis', href: 'kuis.html' },
      { k: 'ide', icon: 'bulb', c: '#d0894f', eyebrow: 'Inspirasi', title: 'Ide Pose', desc: 'Acak pose, warna outfit, properti, dan mood untuk sesimu.', btn: 'Acak ide', href: '#ide' },
      { k: 'jurnal', icon: 'book', c: '#a3745a', eyebrow: 'Jurnal', title: 'Tips sebelum ke studio', desc: 'Persiapan, ide pose, dan cara memilih warna outfit.', btn: 'Baca jurnal', href: '#t=jurnal' },
      { k: 'tim', icon: 'meepleGroup', c: '#5a3728', eyebrow: 'Tentang kami', title: 'Tim Swassana', desc: 'Kenali orang-orang di balik setiap sesi.', btn: 'Lihat tim', href: 'team.html' },
    ],
    main: () => [
      ...GAMES.map(([k, t, i, c, d]) => {
        const b = best(k);
        return { k, icon: i, c, eyebrow: b ? `Terbaik · ${fmt(b)}` : 'Belum dimainkan', title: t, desc: d, btn: b ? 'Main lagi' : 'Main', href: `main.html?g=${k}` };
      }),
      { k: 'semua', icon: 'gamepad', c: '#6f8a5c', eyebrow: '6 mini game', title: 'Semua game', desc: 'Satu game untuk tiap jenis sesi, plus kuis dan photobooth.', btn: 'Lihat semua', href: 'main.html' },
    ],
  };

  if (!document.getElementById('sa-glyph')) {
    document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="sa-glyph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf5"/><stop offset=".55" stop-color="#fbe9d8"/><stop offset="1" stop-color="#e9c8aa" stop-opacity=".9"/></linearGradient></defs></svg>');
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
        <button type="button" class="ps-city" id="psCity" hidden>${icon('pin')}<span id="psCityName"></span><b aria-hidden="true">⇄</b></button>
      </div>
    </section>
    <h3 class="ps-h" id="psActH">Aktivitas</h3>
    <div class="ps-acts" id="psActs"></div>`;

  const $ = (id) => root.querySelector('#' + id);
  let cat = 'studio', items = CATS.studio(), focus = 0, bgFlip = false;

  // ---------- tiles ----------
  function renderRow() {
    $('psRow').innerHTML = items.map((it, i) => `
      <button type="button" class="ps-tile${i === focus ? ' on' : ''}" role="option" aria-selected="${i === focus}" data-i="${i}" aria-label="${it.title}">
        <span class="sa-ic" style="--c:${it.c}">${icon(it.icon)}</span>
      </button>`).join('');
  }

  // ---------- hero ----------
  function setBg(it) {
    const next = bgFlip ? $('psBgA') : $('psBgB'), prev = bgFlip ? $('psBgB') : $('psBgA');
    bgFlip = !bgFlip;
    next.style.setProperty('--c', it.c);
    next.innerHTML = it.photo ? `<img src="${C().img}" alt="" onerror="this.remove()">` : `<span class="ps-glyph">${icon(it.icon)}</span>`;
    next.classList.remove('show'); void next.offsetWidth; next.classList.add('show');
    prev.classList.remove('show');
  }
  function renderHero(animate = true) {
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
    $('psRow').querySelectorAll('.ps-tile').forEach((t, n) => { t.classList.toggle('on', n === focus); t.setAttribute('aria-selected', n === focus); });
    renderHero();
    if (haptic) buzz(6);
  }

  $('psRow').addEventListener('click', (e) => {
    const t = e.target.closest('.ps-tile'); if (!t) return;
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
  function renderActs() {
    let html;
    if (cat === 'studio') {
      html = Object.keys(CITY).map((k) => card(`https://swassanastudio.com/booking/${k}`, photoArt(k), CITY[k].studio, `${CITY[k].name} · Booking`)).join('')
        + ARTICLES.slice(0, 2).map(([h, t, m]) => card(h, glyphArt('book', '#a3745a'), t, m)).join('');
      $('psActH').textContent = 'Studio & bacaan';
    } else {
      const played = GAMES.filter(([k]) => best(k) > 0).sort((a, b) => best(b[0]) - best(a[0]));
      const list = [...played, ...GAMES.filter(([k]) => !best(k))].slice(0, 2);
      html = list.map(([k, t, i, c]) => card(`main.html?g=${k}`, glyphArt(i, c), t, best(k) ? `Terbaik ${fmt(best(k))}` : 'Belum dimainkan')).join('')
        + card('kuis.html', glyphArt('medal', '#b08a4a'), 'Kamu tipe sesi apa?', 'Kuis · 30 detik')
        + card('photobooth.html', glyphArt('camera', '#8a5a42'), 'Photobooth', 'Bingkai & filter khas');
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
    ...ARTICLES.map(([h, t]) => ({ label: t, hint: 'Artikel', icon: 'book', c: '#a3745a', href: () => h })),
    { label: 'Lokasi & peta studio', hint: 'Lokasi', icon: 'pin', c: '#c06a45', href: () => '#arah' },
    { label: 'FAQ / Pertanyaan', hint: 'Info', icon: 'bulb', c: '#d0894f', href: () => '#faq' },
    { label: 'Cara booking', hint: 'Info', icon: 'calendar', c: '#6f4531', href: () => '#cara' },
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

  renderRow(); renderHero(false); renderActs();
  addEventListener('pageshow', () => { if (cat === 'main') { items = CATS.main(); renderHero(false); renderActs(); } });
}
