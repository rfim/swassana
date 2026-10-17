// Super-app home (Grab-style) for the phone/app layout: greeting, studio picker, search, service grid,
// banner carousel, studio card, "continue playing" from saved best scores, and articles.
import { ICONS } from './icons.js';

const root = document.getElementById('home');
if (root) {
  const icon = (k) => `<svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="${ICONS[k]}"/></svg>`;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CITY = {
    surabaya: { name: 'Surabaya', studio: 'Swassana Studio', tag: 'Bold, Authentic, & Most-Wanted', img: 'https://swassanastudio.com/uploads/surabaya-20261011113216-b98bfd.jpg', q: 'Swassana Studio Surabaya' },
    malang: { name: 'Malang', studio: 'Casa de Swassana', tag: 'More Spacious, Modern, & KOL/Brand Approved', img: 'https://swassanastudio.com/uploads/malang-20261011094101-3d5251.jpg', q: 'Casa de Swassana Malang' },
  };
  let city = CITY[store.get('sw-city')] ? store.get('sw-city') : 'surabaya';
  const bookUrl = () => `https://swassanastudio.com/booking/${city}`;
  const dirUrl = () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CITY[city].q)}`;

  const SERVICES = [
    { label: 'Booking', icon: 'calendar', color: '#5a3728', href: bookUrl },
    { label: 'Arah', icon: 'pin', color: '#c06a45', href: dirUrl, ext: true },
    { label: 'Photobooth', icon: 'camera', color: '#8a5a42', href: () => 'photobooth.html' },
    { label: 'Kuis', icon: 'medal', color: '#b08a4a', href: () => 'kuis.html' },
    { label: 'Mini Game', icon: 'gamepad', color: '#6f8a5c', href: () => 'main.html' },
    { label: 'Ide Pose', icon: 'bulb', color: '#d0894f', href: () => '#ide' },
    { label: 'Jurnal', icon: 'book', color: '#a3745a', href: () => '#t=jurnal' },
    { label: 'Tim', icon: 'meepleGroup', color: '#6f4531', href: () => 'team.html' },
  ];
  const BANNERS = [
    { title: 'Main berdua?', sub: 'Uji kekompakan di Love Sync', icon: 'lovers', from: '#b5524a', to: '#5a2a2a', href: 'main.html?g=couple' },
    { title: 'Photobooth Swassana', sub: 'Bingkai & filter khas, siap untuk Story', icon: 'camera', from: '#8a5a42', to: '#2e1b16', href: 'photobooth.html' },
    { title: 'Kamu tipe sesi apa?', sub: 'Kuis 30 detik, temukan studiomu', icon: 'medal', from: '#b08a4a', to: '#5a3728', href: 'kuis.html' },
    { title: 'Sebelum ke studio', sub: 'Checklist persiapan sesi foto', icon: 'book', from: '#6f8a5c', to: '#2f3b28', href: 'blog/persiapan-foto-studio.html' },
  ];
  const GAMES = [
    ['personal', 'Cari Cahaya', 'meeple'], ['couple', 'Love Sync', 'lovers'], ['keluarga', 'Semua Lihat Kamera!', 'meepleGroup'],
    ['wisuda', 'Lempar Toga', 'cap'], ['brand', 'Flat Lay', 'bag'], ['kol', 'Viral Hype', 'megaphone'],
  ];
  const ARTICLES = [
    ['blog/persiapan-foto-studio.html', 'Checklist persiapan sebelum sesi foto studio', 'Persiapan · 4 menit'],
    ['blog/ide-pose-foto-couple.html', '12 ide pose foto couple yang tidak kaku', 'Inspirasi · 5 menit'],
    ['blog/memilih-warna-outfit.html', 'Cara memilih warna outfit untuk foto studio', 'Styling · 4 menit'],
  ];
  const SEARCH = [
    ...SERVICES.map((s) => ({ label: s.label, hint: 'Layanan', icon: s.icon, href: s.href, ext: s.ext })),
    ...GAMES.map(([k, t, i]) => ({ label: t, hint: 'Mini game', icon: i, href: () => `main.html?g=${k}` })),
    ...ARTICLES.map(([h, t]) => ({ label: t, hint: 'Artikel', icon: 'book', href: () => h })),
    { label: 'Lokasi & peta studio', hint: 'Lokasi', icon: 'pin', href: () => '#arah' },
    { label: 'FAQ / Pertanyaan', hint: 'Info', icon: 'bulb', href: () => '#faq' },
    { label: 'Cara booking', hint: 'Info', icon: 'calendar', href: () => '#cara' },
  ];

  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';

  root.innerHTML = `
    <div class="sa-top">
      <div class="sa-row">
        <div><p class="sa-greet">${greet} 👋</p><p class="sa-q">Mau foto apa hari ini?</p></div>
        <div class="sa-city">
          <button type="button" id="saCityBtn" aria-haspopup="listbox" aria-expanded="false">${icon('pin')}<span id="saCityName"></span><b aria-hidden="true">▾</b></button>
          <div class="sa-city-menu" id="saCityMenu" role="listbox" hidden>
            ${Object.entries(CITY).map(([k, c]) => `<button type="button" role="option" data-city="${k}">${c.name}<small>${c.studio}</small></button>`).join('')}
          </div>
        </div>
      </div>
      <label class="sa-search">${icon('search')}<input id="saSearch" type="search" placeholder="Cari layanan, game, artikel…" autocomplete="off" enterkeyhint="search"></label>
      <div class="sa-results" id="saResults" hidden></div>
    </div>

    <div class="sa-grid">
      ${SERVICES.map((s, i) => `<a class="sa-svc" data-svc="${i}" ${s.ext ? 'target="_blank" rel="noopener"' : ''}><span class="sa-ic" style="--c:${s.color}">${icon(s.icon)}</span><span>${s.label}</span></a>`).join('')}
    </div>

    <div class="sa-carousel" id="saCar" aria-label="Sorotan">
      ${BANNERS.map((b) => `<a class="sa-banner" href="${b.href}" style="background:linear-gradient(135deg,${b.from},${b.to})"><span><b>${b.title}</b><small>${b.sub}</small><em>Coba sekarang →</em></span>${icon(b.icon)}</a>`).join('')}
    </div>
    <div class="sa-dots" id="saDots">${BANNERS.map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</div>

    <h2 class="sa-h">Studio kamu</h2>
    <div class="sa-studio" id="saStudio"></div>

    <div class="sa-h-row"><h2 class="sa-h">Lanjutkan main</h2><a href="main.html">Semua</a></div>
    <div class="sa-games" id="saGames"></div>

    <div class="sa-h-row"><h2 class="sa-h">Artikel untukmu</h2><a href="#t=jurnal">Semua</a></div>
    <div class="sa-list">
      ${ARTICLES.map(([h, t, m]) => `<a href="${h}"><span class="sa-ic sm" style="--c:#a3745a">${icon('book')}</span><span><b>${t}</b><small>${m}</small></span></a>`).join('')}
    </div>`;

  const $ = (id) => root.querySelector('#' + id);

  function renderCity() {
    const c = CITY[city];
    $('saCityName').textContent = c.name;
    root.querySelectorAll('[data-svc]').forEach((a) => { const s = SERVICES[+a.dataset.svc]; a.href = s.href(); });
    $('saStudio').innerHTML = `
      <div class="sa-studio-img"><img src="${c.img}" alt="${c.studio}" loading="lazy" onerror="this.remove()"></div>
      <div class="sa-studio-body">
        <small>${c.name}</small><b>${c.studio}</b><span>${c.tag}</span>
        <div class="sa-studio-btns"><a class="pill pill-solid" href="${bookUrl()}">Booking</a><a class="pill pill-outline" href="${dirUrl()}" target="_blank" rel="noopener">Arah</a></div>
      </div>`;
  }

  // City picker
  const cityBtn = $('saCityBtn'), cityMenu = $('saCityMenu');
  cityBtn.addEventListener('click', () => { const open = cityMenu.hidden; cityMenu.hidden = !open; cityBtn.setAttribute('aria-expanded', open); });
  cityMenu.addEventListener('click', (e) => {
    const b = e.target.closest('[data-city]'); if (!b) return;
    city = b.dataset.city; store.set('sw-city', city); renderCity();
    dispatchEvent(new CustomEvent('sw-city', { detail: city }));
    cityMenu.hidden = true; cityBtn.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.sa-city')) { cityMenu.hidden = true; cityBtn.setAttribute('aria-expanded', 'false'); } });

  // Search
  const input = $('saSearch'), results = $('saResults');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.hidden = true; return; }
    const hits = SEARCH.filter((s) => (s.label + ' ' + s.hint).toLowerCase().includes(q)).slice(0, 6);
    results.innerHTML = hits.length
      ? hits.map((s) => `<a href="${s.href()}" ${s.ext ? 'target="_blank" rel="noopener"' : ''}><span class="sa-ic sm" style="--c:#8a5a42">${icon(s.icon)}</span><span><b>${s.label}</b><small>${s.hint}</small></span></a>`).join('')
      : `<p class="sa-empty">Tidak ada hasil untuk “${input.value.replace(/[<>&"]/g, '')}”</p>`;
    results.hidden = false;
  });
  results.addEventListener('click', () => { results.hidden = true; input.value = ''; input.blur(); });

  // Carousel dots + gentle auto-advance (paused after the user touches it, off with reduced motion)
  const car = $('saCar'), dots = [...$('saDots').children];
  let idx = 0, userTouched = false;
  car.addEventListener('scroll', () => {
    idx = Math.round(car.scrollLeft / (car.firstElementChild.offsetWidth + 12));
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
  }, { passive: true });
  car.addEventListener('pointerdown', () => { userTouched = true; });
  if (!reduce) setInterval(() => {
    if (userTouched || document.hidden || !root.classList.contains('tab-on')) return;
    idx = (idx + 1) % BANNERS.length;
    car.scrollTo({ left: idx * (car.firstElementChild.offsetWidth + 12), behavior: 'smooth' });
  }, 5000);

  // Continue playing, from best scores saved by the games
  function renderGames() {
    const list = GAMES.map(([k, t, i]) => { let b = 0; try { b = +localStorage.getItem('best-' + k) || 0; } catch (e) {} return { k, t, i, b }; })
      .sort((a, b) => (b.b > 0) - (a.b > 0));
    $('saGames').innerHTML = list.map((g) => `
      <a href="main.html?g=${g.k}" class="sa-game">
        <span class="sa-ic sm" style="--c:${g.b ? '#5a3728' : '#c29a82'}">${icon(g.i)}</span>
        <b>${g.t}</b>
        <small>${g.b ? 'Terbaik: ' + Math.floor(g.b).toLocaleString('id-ID') : 'Belum dimainkan'}</small>
        <em>${g.b ? 'Main lagi' : 'Mainkan'}</em>
      </a>`).join('');
  }

  renderCity();
  renderGames();
  addEventListener('sw-city', (e) => { if (CITY[e.detail] && e.detail !== city) { city = e.detail; renderCity(); } });
  addEventListener('pageshow', renderGames); // refresh scores when returning from a game
}
