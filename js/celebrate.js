// Festen: en jubelscene i fuld skærm (ca. 3,5 sek.), når der vindes et mærke eller en stjerne.
// Lag: dæmpet baggrund → drejende lysstråler → præmien falder ned og lander → chokbølge, funkler, konfetti og fanfare
// → figuren hopper ind og jubler → overskrift og taleboble → knappen. Et tryk efter 1 sek. springer frem til slutningen.

import { sfx, confetti } from './fx.js?v=20261025203635';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * @param {object} o
 * @param {string} o.prize   HTML for præmien (mærket eller stedet med stjernen)
 * @param {string} o.kicker  lille linje over titlen, fx "Nyt mærke · Bronze"
 * @param {string} o.title   fx "Gange"
 * @param {string} o.who     figur fra img/cast (liv, kaj, nora, yasmin, bodil)
 * @param {string} o.say     figurens replik
 * @param {string} o.btn     knaptekst
 * @param {'patch'|'star'} o.kind
 * @returns {Promise<void>} når knappen trykkes
 */
export function celebrate({ prize, kicker, title, who = 'bodil', say = '', btn = 'Videre', kind = 'patch' }) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = `fest fest-${kind}${reduced() ? ' calm' : ''}`;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', `${kicker}: ${title}`);
    const sparks = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * 360 + (i % 2 ? 8 : -8), d = 34 + (i % 3) * 10;
      return `<i class="fs-spark" style="--a:${a}deg;--d:${d}vmin;--s:${0.6 + (i % 4) * 0.22};--dl:${(i % 5) * 0.03}s">${i % 3 ? '✦' : '★'}</i>`;
    }).join('');
    el.innerHTML = `
      <div class="fs-bg"></div>
      <div class="fs-rays"></div>
      <div class="fs-stage">
        <div class="fs-glow"></div>
        <div class="fs-wave"></div>
        <div class="fs-sparks">${sparks}</div>
        <div class="fs-prize">${prize}<span class="fs-glint"></span></div>
      </div>
      <div class="fs-who"><img src="img/cast/${who}.webp" alt="" draggable="false"></div>
      <div class="fs-text">
        <span class="fs-kicker">${esc(kicker)}</span>
        <h1 class="fs-title">${esc(title).split(' ').map((w, i) => `<span style="--i:${i}">${w}</span>`).join(' ')}</h1>
        ${say ? `<p class="fs-say">${esc(say)}</p>` : ''}
        <button class="btn big fs-btn">${esc(btn)}</button>
      </div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('go'));

    sfx('fest-drop');
    const timers = [
      setTimeout(() => { // præmien lander
        el.classList.add('hit');
        sfx('fest');
        confetti({ count: 180, duration: 3200, z: 61, y: 0.3 });
        navigator.vibrate?.(30);
      }, 850),
      setTimeout(() => el.classList.add('cheer'), 1150),
      setTimeout(() => el.classList.add('done'), 2900),
    ];
    // Spring frem: et tryk efter det første sekund viser slutningen med det samme
    const t0 = performance.now();
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.fs-btn') || performance.now() - t0 < 1000 || el.classList.contains('done')) return;
      timers.forEach(clearTimeout);
      el.classList.add('hit', 'cheer', 'done', 'skip');
    });
    const close = () => {
      timers.forEach(clearTimeout);
      el.classList.add('out');
      setTimeout(() => el.remove(), 350);
      resolve();
    };
    el.querySelector('.fs-btn').addEventListener('click', close);
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'Enter') close(); });
    setTimeout(() => el.querySelector('.fs-btn').focus({ preventScroll: true }), 2950);
  });
}
