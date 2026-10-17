// Swassana logo: round "S" monogram + spaced wordmark. Tapping it spins the mark and ripples the letters.
export function makeLogo(el) {
  if (!el || el.dataset.logo) return el;
  el.dataset.logo = '1';
  el.classList.add('logo');
  el.innerHTML = '<span class="logo-mark" aria-hidden="true">S</span><span class="logo-word" aria-hidden="true">'
    + [...'SWASSANA'].map((c, i) => `<i style="--i:${i}">${c}</i>`).join('') + '</span>';
  el.addEventListener('click', () => {
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    try { navigator.vibrate && navigator.vibrate(8); } catch (e) {}
  });
  return el;
}
