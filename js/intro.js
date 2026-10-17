// Opening splash for the phone/app layout, once per browser session: the sbctv. badge pops in,
// the wordmark rises letter by letter, a shutter flash fires, then the screen opens like a lens iris.
// playOutro() runs the same iris in reverse when the user logs out.
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SEEN = 'sw-intro';

function splash(mode) {
  const el = document.createElement('div');
  el.className = `intro intro-${mode}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="intro-glow"></div>
    <div class="intro-mid">
      <span class="intro-ring"></span><span class="intro-ring r2"></span>
      <span class="intro-badge"></span>
      <span class="intro-word">${[...'SWASSANA'].map((c, i) => `<i style="--i:${i}">${c}</i>`).join('')}</span>
      <span class="intro-tag">${mode === 'out' ? 'Sampai jumpa lagi' : 'Bold, Authentic, &amp; Most-Wanted'}</span>
    </div>
    <span class="intro-flash"></span>`;
  document.body.appendChild(el);
  return el;
}

export function playIntro() {
  const pending = root.classList.contains('intro-pending');
  root.classList.remove('intro-pending');
  if (!pending || reduce || !root.classList.contains('app-mode')) return;
  try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}
  const el = splash('in');
  root.classList.add('intro-on');
  let done = false;
  const open = () => {
    if (done) return; done = true;
    el.classList.add('open');
    root.classList.remove('intro-on'); root.classList.add('intro-reveal');
    setTimeout(() => { el.remove(); root.classList.remove('intro-reveal'); }, 900);
  };
  const t = setTimeout(open, 1900);
  el.addEventListener('pointerdown', () => { clearTimeout(t); open(); }, { once: true });
}

export function playOutro(then) {
  if (reduce || !root.classList.contains('app-mode')) { then(); return; }
  root.classList.add('intro-bye');
  const el = splash('out');
  requestAnimationFrame(() => el.classList.add('close'));
  setTimeout(then, 1500);
}

playIntro();
