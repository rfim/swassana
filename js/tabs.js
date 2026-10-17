// App-style navigation for phones and the installed app: a bottom tab bar, one tab visible at a time.
// On the home page tabs switch in place; on other pages the bar links back to the home page tabs.
const ICON = {
  beranda: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  lokasi: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  main: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11.5" r="1"/><circle cx="17.5" cy="13.8" r="1"/>',
  jurnal: '<path d="M2 5.5C4.5 4 8 4 12 6c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5Z"/><path d="M12 6v13.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5h.01"/>',
};
const TABS = [['beranda', 'Beranda'], ['lokasi', 'Lokasi'], ['main', 'Main'], ['jurnal', 'Jurnal'], ['info', 'Info']];
// Which tab an in-page anchor lives in
const ANCHOR_TAB = { top: 'beranda', lokasi: 'beranda', cara: 'info', arah: 'lokasi', main: 'main', ide: 'main', jurnal: 'jurnal', faq: 'info', ig: 'info' };

const home = new URL('../', import.meta.url);
const onHome = !!document.querySelector('[data-tab]');
// Decided by device type, not width: touch devices always get the app layout, mouse devices never do.
const mq = matchMedia('(display-mode: standalone), (hover: none) and (pointer: coarse)');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

const bar = document.createElement('nav');
bar.className = 'tabbar';
bar.setAttribute('aria-label', 'Navigasi aplikasi');
bar.innerHTML = TABS.map(([k, label]) => `
  <a href="${home.href}#t=${k}" data-t="${k}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>
    <span>${label}</span>
  </a>`).join('');
document.body.appendChild(bar);

const page = document.body.dataset.page; // set on sub pages: "jurnal" or "info"
let current = null;
const scrollMemo = {};

function mark(k) {
  bar.querySelectorAll('a').forEach((a) => {
    if (a.dataset.t === k) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

function show(k, { push = true, target = null } = {}) {
  if (!root.classList.contains('app-mode')) return false;
  if (current) scrollMemo[current] = scrollY;
  const changed = k !== current;
  current = k;
  let first = true;
  document.querySelectorAll('[data-tab]').forEach((el) => {
    const on = el.dataset.tab === k;
    el.classList.toggle('tab-on', on);
    el.classList.toggle('tab-first', on && first);
    if (on) first = false;
    if (on && changed && !reduce) { el.classList.remove('tab-anim'); void el.offsetWidth; el.classList.add('tab-anim'); }
  });
  mark(k);
  if (push) history.pushState({ t: k }, '', '#t=' + k);
  const el = target && document.getElementById(target);
  if (el && el.dataset.tab !== k) el.scrollIntoView();
  else if (el && !el.classList.contains('tab-first')) el.scrollIntoView();
  else scrollTo(0, changed ? (scrollMemo[k] || 0) : 0);
  try { navigator.vibrate && navigator.vibrate(5); } catch (e) {}
  return true;
}

function fromHash() {
  const h = location.hash.slice(1);
  if (h.startsWith('t=') && ICON[h.slice(2)]) return { k: h.slice(2) };
  if (ANCHOR_TAB[h]) return { k: ANCHOR_TAB[h], target: h };
  return { k: 'beranda' };
}

function apply() {
  const app = mq.matches;
  root.classList.toggle('app-mode', app);
  if (!onHome) { mark(page); return; }
  if (app) { const { k, target } = fromHash(); current = null; show(k, { push: false, target }); }
  else document.querySelectorAll('[data-tab]').forEach((el) => el.classList.remove('tab-on', 'tab-first', 'tab-anim'));
}

if (onHome) {
  bar.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-t]');
    if (!a || !root.classList.contains('app-mode')) return;
    e.preventDefault();
    if (a.dataset.t === current) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else show(a.dataset.t);
  });
  // In-page links (#arah, #faq, ...) switch to the tab that holds them
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !root.classList.contains('app-mode')) return;
    const id = a.getAttribute('href').slice(1);
    if (!ANCHOR_TAB[id]) return;
    e.preventDefault();
    show(ANCHOR_TAB[id], { target: id });
  });
  addEventListener('popstate', () => { const { k, target } = fromHash(); show(k, { push: false, target }); });
}

mq.addEventListener('change', apply);
apply();
