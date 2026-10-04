// Zoo-kortet: forsiden som ét tegnet, levende kort (SVG).
// Fremgang vises i verden: byggehegn → dyr flytter ind → gæster → flag → guldskær.
// Bygningerne er tegnet enkelt her; AREA_ART kan pege på genererede tegninger, der så bruges i stedet.

import { esc } from './util.js?v=20261004201654';

export const W = 1200, H = 960;

// Placering af områder, figurer og deres "opgave-plads"
export const POS = {
  tal: { x: 330, y: 765, kind: 'booth', ground: '#cfe9c0', who: [470, 700] },
  gange: { x: 185, y: 600, kind: 'barn', ground: '#e7dcb4', who: [335, 570] },
  division: { x: 190, y: 360, kind: 'kitchen', ground: '#f3dcc6', who: [335, 330] },
  brok: { x: 600, y: 150, kind: 'pool', ground: '#d7eef6', who: [660, 282] },
  decimal: { x: 1015, y: 360, kind: 'clinic', ground: '#f4e6ee', who: [865, 330] },
  geometri: { x: 1015, y: 600, kind: 'paddock', ground: '#c6e6b3', who: [865, 570] },
  maaling: { x: 330, y: 165, kind: 'clock', ground: '#e9e2f6', who: [470, 215] },
  data: { x: 870, y: 165, kind: 'board', ground: '#dbf0ec', who: [735, 215] },
  algebra: { x: 600, y: 450, kind: 'island', ground: '#f1e1b6', who: [800, 450] },
};

// Genererede tegninger af områderne (når de findes): { tal: 'img/areas/billetlugen.webp', ... }
export const AREA_ART = {};

const img = (src, x, y, s, cls = 'bob', d = 0) =>
  `<image href="${src}" x="${x - s / 2}" y="${y - s * 0.85}" width="${s}" height="${s}" class="${cls}" style="animation-delay:${d}s"/>`;
const tree = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="34" rx="30" ry="9" fill="#000" opacity=".08"/><rect x="-5" y="4" width="10" height="30" rx="4" fill="#9a7552"/><circle cx="0" cy="-12" r="28" fill="${c}"/><circle cx="-18" cy="2" r="18" fill="${c}"/><circle cx="18" cy="0" r="20" fill="${c}"/><circle cx="-8" cy="-22" r="10" fill="#fff" opacity=".13"/></g>`;
const person = (x, y, c, d = 0) => `<g class="bob" style="animation-delay:${d}s"><ellipse cx="${x}" cy="${y + 2}" rx="7" ry="2.5" fill="#000" opacity=".12"/><rect x="${x - 6}" y="${y - 16}" width="12" height="16" rx="6" fill="${c}"/><circle cx="${x}" cy="${y - 21}" r="6" fill="#f2c9a5"/></g>`;
const flag = (x, y, c = '#ff8a65') => `<g><rect x="${x}" y="${y - 46}" width="3" height="46" fill="#7a5a3a"/><path d="M${x + 3} ${y - 46} l26 8 l-26 8 z" fill="${c}"/></g>`;
const sign = (x, y, t, w) => `<g><rect x="${x - 2}" y="${y}" width="4" height="16" fill="#8a6640"/><rect x="${x - w / 2}" y="${y - 26}" width="${w}" height="30" rx="8" fill="#f6e3bf" stroke="#c9a46e" stroke-width="2"/><text x="${x}" y="${y - 5}" text-anchor="middle" class="m-sign">${esc(t)}</text></g>`;

// Årstid: farver på træerne og evt. faldende blade/sne
function season(d = new Date()) {
  const m = d.getMonth();
  if (m >= 8 && m <= 10) return { name: 'efterår', trees: ['#e8a34a', '#d9773e', '#6cbf8a', '#9ccf6a'], fall: ['#e8a34a', '#d9773e', '#f2c45a'] };
  if (m === 11 || m <= 1) return { name: 'vinter', trees: ['#6aa88a', '#7fb79a', '#5f9e80'], fall: ['#ffffff'] };
  if (m <= 4) return { name: 'forår', trees: ['#7fcf8f', '#f4b6c8', '#6cbf8a'], fall: ['#f9c9d6'] };
  return { name: 'sommer', trees: ['#5fb884', '#6cbf8a', '#4fae79'], fall: [] };
}

function building(kind, x, y) {
  switch (kind) {
    case 'booth': return `<rect x="${x - 78}" y="${y - 40}" width="60" height="44" rx="6" fill="#fff6e8"/><path d="M${x - 86} ${y - 40} h76 l-8 -18 h-60 z" fill="#ff8a65"/><path d="M${x - 70} ${y - 58} h12 l-2 18 h-12 z M${x - 46} ${y - 58} h12 l2 18 h-12 z" fill="#fff"/><rect x="${x - 66}" y="${y - 30}" width="36" height="16" rx="4" fill="#9fd3ec"/><ellipse cx="${x + 46}" cy="${y + 4}" rx="44" ry="22" fill="#9ad7ef"/>`;
    case 'barn': return `<rect x="${x - 86}" y="${y - 44}" width="72" height="54" rx="4" fill="#d9764f"/><path d="M${x - 94} ${y - 44} l44 -26 l44 26 z" fill="#a85538"/><rect x="${x - 62}" y="${y - 20}" width="24" height="30" fill="#fff3e3"/><path d="M${x - 62} ${y - 20} l24 30 M${x - 38} ${y - 20} l-24 30" stroke="#d9764f" stroke-width="3"/><circle cx="${x + 70}" cy="${y + 6}" r="14" fill="#f2cf73"/><circle cx="${x + 88}" cy="${y - 6}" r="12" fill="#e9c15e"/>`;
    case 'kitchen': return `<rect x="${x - 88}" y="${y - 40}" width="74" height="50" rx="8" fill="#fff4e4"/><path d="M${x - 96} ${y - 40} l45 -24 l45 24 z" fill="#ef7d57"/><rect x="${x - 60}" y="${y - 20}" width="20" height="30" rx="4" fill="#c98a5e"/><text x="${x - 30}" y="${y - 14}" font-size="22">🥕</text>`;
    case 'pool': return `<ellipse cx="${x}" cy="${y + 4}" rx="98" ry="46" fill="#7cc6e6"/><ellipse cx="${x}" cy="${y}" rx="88" ry="38" fill="#a8dcf2"/><ellipse cx="${x - 40}" cy="${y - 4}" rx="22" ry="9" fill="#fff" opacity=".9"/><ellipse cx="${x + 42}" cy="${y + 10}" rx="16" ry="7" fill="#fff" opacity=".9"/>`;
    case 'clinic': return `<rect x="${x - 90}" y="${y - 44}" width="80" height="54" rx="8" fill="#ffffff"/><path d="M${x - 98} ${y - 44} h96 l-10 -16 h-76 z" fill="#8fd3f4"/><rect x="${x - 58}" y="${y - 32}" width="16" height="16" rx="3" fill="#2e9e78"/><rect x="${x - 62}" y="${y - 28}" width="24" height="8" rx="3" fill="#2e9e78"/><rect x="${x - 56}" y="${y - 10}" width="16" height="20" rx="3" fill="#cfe7f2"/>`;
    case 'paddock': return `<path d="M${x - 100} ${y - 52} h200 M${x - 100} ${y - 40} h200" stroke="#c9a46e" stroke-width="4"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${x - 100 + i * 40}" y="${y - 60}" width="6" height="26" rx="2" fill="#a88350"/>`).join('')}<circle cx="${x + 70}" cy="${y + 30}" r="12" fill="#b9b2a4"/><circle cx="${x + 82}" cy="${y + 36}" r="8" fill="#a9a293"/>`;
    case 'clock': return `<rect x="${x - 70}" y="${y - 70}" width="40" height="80" rx="6" fill="#e9dcc4"/><path d="M${x - 76} ${y - 70} l26 -22 l26 22 z" fill="#8b73e0"/><circle cx="${x - 50}" cy="${y - 42}" r="15" fill="#fff" stroke="#6b5ab8" stroke-width="3"/><path d="M${x - 50} ${y - 42} v-9 M${x - 50} ${y - 42} h7" stroke="#1f3346" stroke-width="3" stroke-linecap="round"/>`;
    case 'board': return `<rect x="${x - 92}" y="${y - 52}" width="70" height="50" rx="6" fill="#fff"/><rect x="${x - 82}" y="${y - 22}" width="10" height="14" fill="#22a597"/><rect x="${x - 66}" y="${y - 34}" width="10" height="26" fill="#8fd3f4"/><rect x="${x - 50}" y="${y - 42}" width="10" height="34" fill="#ff8a65"/><rect x="${x - 60}" y="${y - 2}" width="5" height="16" fill="#8a6640"/>`;
    case 'island': return `<ellipse cx="${x}" cy="${y + 8}" rx="74" ry="34" fill="#efd9a0"/><rect x="${x + 22}" y="${y - 44}" width="6" height="46" rx="3" fill="#a07a4a"/><path d="M${x + 25} ${y - 44} q-24 -6 -34 8 q18 -8 34 -4 q-6 -18 14 -22 q-10 12 -10 22 q22 -10 32 6 q-18 -6 -36 -10z" fill="#5fb884"/><text x="${x - 40}" y="${y + 18}" font-size="22" font-weight="900" fill="#c0392b">✕</text>`;
  }
  return '';
}

/*
 data = {
   zooName, guests, stars, week: { n, goal, label },
   areas: [{ id, place, level, animals: [{ art, emoji }] }],
   tasks: [{ area, who: { id, img, emoji } }],
   babies: [{ art, emoji, awake }], due,
   bodil: imgSrc,
 }
*/
export function zooMap(d) {
  const S = season();
  let s = `<defs><radialGradient id="m-grass" cx=".5" cy=".55" r=".75"><stop offset="0" stop-color="#bfe6ae"/><stop offset="1" stop-color="#9fd18f"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#m-grass)"/>`;
  for (let i = 0; i < 26; i++) s += `<ellipse cx="${(i * 197) % W}" cy="${(i * 131) % H}" rx="${40 + (i % 5) * 12}" ry="${16 + (i % 4) * 5}" fill="#8fc77f" opacity=".25"/>`;
  const paths = `M600 960 L600 580 M600 580 C 760 580 840 520 840 450 C 840 360 740 310 600 310 C 460 310 360 360 360 450 C 360 520 440 580 600 580
    M372 490 L250 600 M368 410 L240 360 M500 320 L380 220 M600 310 L600 240 M700 320 L820 220 M832 410 L960 360 M828 490 L950 600 M470 560 L360 700 M730 560 L840 700`;
  s += `<path d="${paths}" fill="none" stroke="#e3cc9d" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/><path d="${paths}" fill="none" stroke="#f3e2bd" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<ellipse cx="600" cy="450" rx="175" ry="92" fill="#8fd0ea"/><ellipse cx="600" cy="444" rx="162" ry="82" fill="#a9ddf2"/><path d="M470 460 q14 -6 28 0 M690 490 q14 -6 28 0 M660 415 q12 -5 24 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`;
  [[60, 120, 1.1], [120, 240, .9], [50, 480, 1], [60, 870, 1.1], [1140, 130, 1.1], [1080, 240, .85], [1150, 480, 1], [1140, 870, 1.1], [470, 60, .8], [740, 60, .85], [470, 250, .7], [740, 255, .7], [140, 760, .8], [1060, 760, .8]]
    .forEach(([x, y, k], i) => { s += tree(x, y, k, S.trees[i % S.trees.length]); });

  // Områder
  d.areas.forEach((a, i) => {
    const p = POS[a.id];
    const { x, y } = p, w = 230, h = 156, lv = a.level;
    let g = `<g class="m-tap" tabindex="0" role="button" aria-label="${esc(a.place)}" data-area="${a.id}">`;
    if (p.kind !== 'island') g += `<rect class="m-ground" x="${x - w / 2}" y="${y - h / 2 - 10}" width="${w}" height="${h}" rx="34" fill="${p.ground}" stroke="#ffffff" stroke-opacity=".7" stroke-width="3"/>`;
    else g += `<rect class="m-ground" x="${x - 80}" y="${y - 48}" width="160" height="96" rx="40" fill="transparent"/>`;
    if (lv === 4) g += `<rect x="${x - w / 2 - 6}" y="${y - h / 2 - 16}" width="${w + 12}" height="${h + 12}" rx="38" fill="none" stroke="#ffd25e" stroke-width="7" class="m-glow"/>`;
    g += AREA_ART[a.id] ? `<image href="${AREA_ART[a.id]}" x="${x - 110}" y="${y - h / 2 - 6}" width="220" height="${h - 8}" preserveAspectRatio="xMidYMid meet"/>` : building(p.kind, x, y);
    const n = lv === 0 ? 0 : Math.min(lv, 3);
    const spots = p.kind === 'island' ? [[x - 20, y + 16], [x + 50, y + 24], [x - 50, y + 22]] : [[x + 30, y + 36], [x + 80, y + 46], [x - 20, y + 52]];
    for (let k = 0; k < n && k < a.animals.length; k++) {
      const an = a.animals[k], [ax, ay] = spots[k];
      g += an.art ? img(an.art, ax, ay, p.kind === 'island' ? 58 : 66, 'bob', k * 0.5 + i * 0.2)
        : `<text x="${ax}" y="${ay}" font-size="40" text-anchor="middle" class="bob">${an.emoji}</text>`;
    }
    if (lv >= 2 && p.kind !== 'island') g += person(x - 96, y + 58, '#8fd3f4', i * .3) + person(x - 78, y + 62, '#ff8a65', i * .3 + .4) + (lv >= 3 ? person(x + 104, y + 60, '#b7a6e8', .2) : '');
    if (lv >= 3) g += flag(x + w / 2 - 22, y - h / 2 + 6, lv === 4 ? '#ffc94d' : '#ff8a65');
    if (lv === 0) {
      if (p.kind !== 'island') g += `<rect x="${x - w / 2}" y="${y - h / 2 - 10}" width="${w}" height="${h}" rx="34" fill="#f6f3ec" opacity=".55"/>`;
      g += `<path d="M${x - 92} ${y + 46} h184" stroke="#e6a23c" stroke-width="10"/><path d="M${x - 92} ${y + 46} h184" stroke="#1f3346" stroke-width="10" stroke-dasharray="14 14"/>`;
      g += `<text x="${x}" y="${y + 8}" text-anchor="middle" class="m-sign" style="fill:#5a6b7b">🚧 Kommer snart</text>`;
    }
    g += sign(x, y + h / 2 + 8, a.place, Math.max(120, a.place.length * 10.5));
    s += g + '</g>';
  });

  // Babyhuset
  const due = d.due;
  const bb = d.babies.slice(0, 3);
  s += `<g class="m-tap" tabindex="0" role="button" aria-label="Babyhuset" data-baby="1">
    <rect class="m-ground" x="830" y="760" width="230" height="150" rx="34" fill="#fde3e6" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>
    <rect x="856" y="792" width="120" height="78" rx="10" fill="#fff8ef"/><path d="M846 792 l70 -40 l70 40 z" fill="#f59fb0"/>
    <circle cx="916" cy="774" r="9" fill="#fff"/><path d="M916 780 l-6 -6 a4 4 0 0 1 6 -5 a4 4 0 0 1 6 5 z" fill="#f2748f"/>
    ${[884, 918, 952].map((x, k) => {
      const b = bb[k];
      let w = `<rect x="${x - 15}" y="812" width="30" height="34" rx="8" fill="#ffe9c4"/>`;
      if (b) w += b.art ? img(b.art, x, 848, 40, 'bob', k * .4) : `<text x="${x}" y="842" font-size="22" text-anchor="middle">${b.emoji}</text>`;
      return w;
    }).join('')}
    <g class="m-bang"><rect x="992" y="788" width="58" height="30" rx="15" fill="${due ? '#ff8a65' : '#8fa3b5'}" stroke="#fff" stroke-width="3"/><text x="1021" y="809" text-anchor="middle" class="m-badge">${due ? `🍼 ${due}` : '💤'}</text></g>
    ${sign(945, 918, 'Babyhuset', 120)}
  </g>`;

  // Port, flag for stjerneområder, gæsteskilt, Bodil og ugetavle
  s += `<rect x="470" y="880" width="260" height="80" fill="#f3e2bd"/>`;
  s += `<path d="M512 960 V876 Q600 818 688 876 V960" fill="none" stroke="#2c7f64" stroke-width="16" stroke-linecap="round"/>`;
  s += `<rect x="500" y="876" width="26" height="84" rx="8" fill="#efe0c4"/><rect x="674" y="876" width="26" height="84" rx="8" fill="#efe0c4"/>`;
  const nameLen = [...d.zooName].length;
  const fs = Math.max(20, Math.min(34, 230 / (0.55 * nameLen)));
  s += `<rect x="470" y="800" width="260" height="56" rx="16" fill="#fffaf0" stroke="#2c7f64" stroke-width="5"/><text x="600" y="${828 + fs * 0.36}" text-anchor="middle" class="m-gate" font-size="${fs}">${esc(d.zooName)}</text>`;
  for (let k = 0; k < d.stars; k++) s += flag(482 + k * 28, 802, k % 2 ? '#ff8a65' : '#ffc94d');
  s += `<g><rect x="790" y="930" width="5" height="30" fill="#8a6640"/><rect x="736" y="890" width="136" height="44" rx="10" fill="#f6e3bf" stroke="#c9a46e" stroke-width="2"/><text x="804" y="910" text-anchor="middle" class="m-sign">🎟️ ${d.guests.toLocaleString('da-DK')}</text><text x="804" y="926" text-anchor="middle" class="m-small">gæster om dagen</text></g>`;
  if (d.bodil) s += `<g class="m-tap" tabindex="0" role="button" aria-label="Bodil" data-bodil="1"><ellipse cx="430" cy="950" rx="30" ry="7" fill="#000" opacity=".12"/>${img(d.bodil, 430, 952, 100, 'bob', .3)}</g>`;
  s += `<g><rect x="280" y="895" width="96" height="56" rx="8" fill="#a07a4a"/><rect x="286" y="901" width="84" height="44" rx="5" fill="#2f4a3e"/><text x="328" y="917" text-anchor="middle" class="m-board">${esc(d.week.label)}</text>
    ${Array.from({ length: d.week.goal }, (_, k) => `<circle cx="${302 + k * 18}" cy="933" r="6" fill="${k < d.week.n ? '#ffc94d' : 'none'}" stroke="#ffc94d" stroke-width="2"/>`).join('')}</g>`;

  // Gæster på stierne – flere jo flere gæster
  const crowd = [[600, 640, '#8fd3f4'], [612, 652, '#ff8a65'], [380, 450, '#b7a6e8'], [820, 430, '#ffc94d'], [560, 320, '#7dd6b0'], [575, 316, '#ff8a65'], [880, 560, '#8fd3f4'], [600, 760, '#b7a6e8'], [330, 520, '#7dd6b0'], [870, 300, '#ff8a65'], [640, 700, '#ffc94d']];
  const nPeople = Math.min(crowd.length, 2 + Math.floor(d.guests / 600));
  crowd.slice(0, nPeople).forEach(([x, y, c], k) => { s += person(x, y, c, k * .35); });

  // Figurer med dagens opgaver
  d.tasks.forEach((t, k) => {
    const [x, y] = POS[t.area].who;
    const face = t.who.img
      ? `<clipPath id="m-cl-${k}"><circle cx="${x}" cy="${y}" r="22"/></clipPath><image href="${t.who.img}" x="${x - 22}" y="${y - 22}" width="44" height="44" clip-path="url(#m-cl-${k})"/>`
      : `<text x="${x}" y="${y + 10}" text-anchor="middle" font-size="28">${t.who.emoji}</text>`;
    s += `<g class="m-tap" tabindex="0" role="button" aria-label="${esc(t.who.name)} har en opgave" data-task="${t.area}">
      <ellipse cx="${x}" cy="${y + 26}" rx="20" ry="6" fill="#000" opacity=".12"/>
      <circle cx="${x}" cy="${y}" r="27" fill="#fff"/><circle cx="${x}" cy="${y}" r="22" fill="#ffede6"/>${face}
      ${t.done ? '' : `<g class="m-bang" style="animation-delay:${k * .5}s"><circle cx="${x + 20}" cy="${y - 30}" r="13" fill="#ff8a65" stroke="#fff" stroke-width="3"/><text x="${x + 20}" y="${y - 24}" text-anchor="middle" class="m-badge">!</text></g>`}
    </g>`;
  });

  // Liv: sommerfugle, skyer og blade/sne efter årstiden
  s += `<g class="m-fly"><path d="M150 720 q-10 -12 -2 -16 q6 2 2 16 q8 -14 14 -10 q2 8 -14 10z" fill="#b7a6e8"/></g><g class="m-fly" style="animation-delay:-3s"><path d="M1060 440 q-10 -12 -2 -16 q6 2 2 16 q8 -14 14 -10 q2 8 -14 10z" fill="#ffc94d"/></g>`;
  s += `<g opacity=".5" pointer-events="none"><g class="m-cloud"><ellipse cx="0" cy="110" rx="90" ry="34" fill="#fff"/><ellipse cx="60" cy="96" rx="60" ry="30" fill="#fff"/></g>
    <g class="m-cloud c2"><ellipse cx="0" cy="560" rx="110" ry="38" fill="#fff"/><ellipse cx="-60" cy="546" rx="60" ry="28" fill="#fff"/></g>
    <g class="m-cloud c3"><ellipse cx="0" cy="300" rx="80" ry="28" fill="#fff"/></g></g>`;
  if (S.fall.length) for (let k = 0; k < 9; k++) {
    const c = S.fall[k % S.fall.length];
    s += S.name === 'vinter'
      ? `<circle class="m-leaf" style="animation-delay:${-k * 1.4}s" cx="${80 + k * 130}" cy="0" r="4" fill="${c}" pointer-events="none"/>`
      : `<path class="m-leaf" style="animation-delay:${-k * 1.4}s" d="M${80 + k * 130} 0 q8 -10 16 0 q-8 10 -16 0z" fill="${c}" pointer-events="none"/>`;
  }
  return `<svg class="zoo-map-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kort over ${esc(d.zooName)}">${s}</svg>`;
}
