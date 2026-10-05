// SVG-illustrationer. Farver styres af CSS-klasser (v-line, v-fill, v-empty, v-soft, v-text, v-mark),
// så de virker i både lyst og mørkt tema.

const svg = (w, h, body, cls = '') =>
  `<svg class="vis ${cls}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">${body}</svg>`;
const t = (x, y, s, extra = '') =>
  `<text x="${x}" y="${y}" class="v-text" text-anchor="middle" ${extra}>${s}</text>`;

// Prikker i rækker og kolonner (gangestykker som rektangel)
export function dotArray(rows, cols, { highlightRows = 0 } = {}) {
  const gap = Math.min(34, 420 / Math.max(cols, 1), 260 / Math.max(rows, 1));
  const r = gap * 0.32;
  const w = cols * gap + 20, h = rows * gap + 20;
  let b = '';
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      b += `<circle cx="${10 + gap / 2 + j * gap}" cy="${10 + gap / 2 + i * gap}" r="${r}" class="${i < highlightRows ? 'v-mark' : 'v-fill'}"/>`;
  return svg(w, h, b, 'vis-sm');
}

// Arealmodel: (dele) × b, fx 47 × 6 = 40×6 + 7×6
export function areaSplit(parts, b) {
  const total = parts.reduce((s, p) => s + p, 0);
  const W = 520, H = 120, x0 = 30, y0 = 30;
  let x = x0, body = '';
  parts.forEach((p, i) => {
    const w = Math.max(70, (p / total) * W);
    body += `<rect x="${x}" y="${y0}" width="${w}" height="${H}" class="${i % 2 ? 'v-soft' : 'v-empty'} v-line"/>`;
    body += t(x + w / 2, y0 - 8, p);
    body += t(x + w / 2, y0 + H / 2 + 6, `${p}×${b}`);
    body += t(x + w / 2, y0 + H / 2 + 30, `= ${(p * b).toLocaleString('da-DK')}`, 'class="v-text v-strong"');
    x += w;
  });
  body += t(x0 - 14, y0 + H / 2 + 6, b);
  return svg(x + 20, y0 + H + 20, body);
}

// Tallinje. labels(i, value) returnerer tekst eller null for hver streg.
export function numberLine({ min, max, div, labels, mark, markText = '?', minorEvery = 0 }) {
  const W = 620, x0 = 40, x1 = 580, y = 60;
  const X = (v) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  let b = `<line x1="${x0 - 15}" y1="${y}" x2="${x1 + 15}" y2="${y}" class="v-line" stroke-width="3"/>`;
  for (let i = 0; i <= div; i++) {
    const v = min + ((max - min) * i) / div;
    const major = minorEvery ? i % minorEvery === 0 : true;
    const len = major ? 14 : 8;
    b += `<line x1="${X(v)}" y1="${y - len}" x2="${X(v)}" y2="${y + len}" class="v-line" stroke-width="${major ? 3 : 2}"/>`;
    const lab = labels ? labels(i, v) : null;
    if (lab != null) b += t(X(v), y + 40, lab);
  }
  if (mark != null) {
    b += `<circle cx="${X(mark)}" cy="${y}" r="9" class="v-mark"/>`;
    b += `<path d="M${X(mark)} ${y - 18} l-9 -14 h18 z" class="v-mark"/>`;
    b += t(X(mark), y - 38, markText, 'class="v-text v-strong"');
  }
  return svg(W, 110, b);
}

// Brøkstang: n dele, k farvet
export function fractionBar(n, k, { w = 480, h = 56, label = '' } = {}) {
  const x0 = 10, cw = w / n;
  let b = '';
  for (let i = 0; i < n; i++)
    b += `<rect x="${x0 + i * cw}" y="10" width="${cw}" height="${h}" class="${i < k ? 'v-fill' : 'v-empty'} v-line"/>`;
  if (label) b += t(w + 40, 10 + h / 2 + 7, label);
  return svg(w + (label ? 80 : 20), h + 20, b);
}

export function fractionBars(list) {
  // list: [{n, k, label}] – stablet for sammenligning
  const w = 480, h = 48, gap = 16;
  let b = '';
  list.forEach(({ n, k, label }, row) => {
    const y = 10 + row * (h + gap), cw = w / n;
    for (let i = 0; i < n; i++)
      b += `<rect x="${10 + i * cw}" y="${y}" width="${cw}" height="${h}" class="${i < k ? 'v-fill' : 'v-empty'} v-line"/>`;
    if (label) b += `<foreignObject x="${w + 20}" y="${y - 4}" width="70" height="${h + 10}"><div xmlns="http://www.w3.org/1999/xhtml" class="fo-label">${label}</div></foreignObject>`;
  });
  return svg(w + 100, 20 + list.length * (h + gap), b);
}

// Lagkage: n stykker, k farvet
export function fractionCircle(n, k) {
  const cx = 110, cy = 110, r = 95;
  let b = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
    const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
    const large = a1 - a0 > Math.PI ? 1 : 0;
    b += `<path d="M${cx} ${cy} L${p0[0]} ${p0[1]} A${r} ${r} 0 ${large} 1 ${p1[0]} ${p1[1]} Z" class="${i < k ? 'v-fill' : 'v-empty'} v-line"/>`;
  }
  return svg(220, 220, b, 'vis-sm');
}

// Tiendedele: w hele kvadrater + et kvadrat med k af 10 søjler farvet
export function tenBars(k, wholes = 0) {
  const s = 150, gap = 20;
  let b = '';
  const n = wholes + 1;
  for (let q = 0; q < n; q++) {
    const x0 = 10 + q * (s + gap);
    for (let i = 0; i < 10; i++) {
      const filled = q < wholes || i < k;
      b += `<rect x="${x0 + i * (s / 10)}" y="10" width="${s / 10}" height="${s}" class="${filled ? 'v-fill' : 'v-empty'} v-line"/>`;
    }
  }
  return svg(20 + n * s + (n - 1) * gap, s + 20, b, 'vis-sm');
}

// Hundrededele: 10×10, udfyldt søjle for søjle
export function hundredGrid(k) {
  const s = 200, c = s / 10;
  let b = '';
  for (let col = 0; col < 10; col++)
    for (let row = 0; row < 10; row++) {
      const idx = col * 10 + row;
      b += `<rect x="${10 + col * c}" y="${10 + row * c}" width="${c}" height="${c}" class="${idx < k ? 'v-fill' : 'v-empty'} v-line-thin"/>`;
    }
  b += `<rect x="10" y="10" width="${s}" height="${s}" fill="none" class="v-line"/>`;
  return svg(s + 20, s + 20, b, 'vis-sm');
}

// Rektangel med sidelængder – evt. med kvadratnet
export function rectShape(w, h, { grid = false, top = null, left = null, unit = 'cm' } = {}) {
  const cell = Math.min(46, 420 / w, 240 / h);
  const x0 = 60, y0 = 40, W = w * cell, H = h * cell;
  let b = `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="v-soft v-line"/>`;
  if (grid) {
    for (let i = 1; i < w; i++) b += `<line x1="${x0 + i * cell}" y1="${y0}" x2="${x0 + i * cell}" y2="${y0 + H}" class="v-line-thin"/>`;
    for (let j = 1; j < h; j++) b += `<line x1="${x0}" y1="${y0 + j * cell}" x2="${x0 + W}" y2="${y0 + j * cell}" class="v-line-thin"/>`;
  }
  const topTxt = top ?? (grid ? null : `${w} ${unit}`);
  const leftTxt = left ?? (grid ? null : `${h} ${unit}`);
  if (topTxt) b += t(x0 + W / 2, y0 - 12, topTxt);
  if (leftTxt) b += t(x0 - 32, y0 + H / 2 + 6, leftTxt);
  return svg(x0 + W + 40, y0 + H + 30, b);
}

// L-figur: W×H hvor et hjørne (cw×ch) øverst til højre er skåret væk
export function lShape(W, H, cw, ch, unit = 'm') {
  const cell = Math.min(44, 400 / W, 260 / H);
  const x0 = 70, y0 = 40;
  const X = (u) => x0 + u * cell, Y = (v) => y0 + v * cell;
  const pts = [[0, 0], [W - cw, 0], [W - cw, ch], [W, ch], [W, H], [0, H]];
  let b = `<polygon points="${pts.map(([u, v]) => `${X(u)},${Y(v)}`).join(' ')}" class="v-soft v-line"/>`;
  b += t((X(0) + X(W - cw)) / 2, Y(0) - 10, `${W - cw} ${unit}`);
  b += t(X(0) - 36, (Y(0) + Y(H)) / 2 + 6, `${H} ${unit}`);
  b += t((X(0) + X(W)) / 2, Y(H) + 28, `${W} ${unit}`);
  b += t(X(W) + 36, (Y(ch) + Y(H)) / 2 + 6, `${H - ch} ${unit}`);
  b += t((X(W - cw) + X(W)) / 2, Y(ch) - 10, `${cw} ${unit}`);
  return svg(X(W) + 80, Y(H) + 45, b);
}

// Analogt ur
export function clock(h, m) {
  const cx = 120, cy = 120, r = 105;
  let b = `<circle cx="${cx}" cy="${cy}" r="${r}" class="v-empty v-line" stroke-width="4"/>`;
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * 2 * Math.PI;
    const big = i % 5 === 0;
    const r0 = big ? r - 14 : r - 7;
    b += `<line x1="${cx + r0 * Math.sin(a)}" y1="${cy - r0 * Math.cos(a)}" x2="${cx + r * Math.sin(a)}" y2="${cy - r * Math.cos(a)}" class="v-line" stroke-width="${big ? 3 : 1}"/>`;
  }
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * 2 * Math.PI;
    b += t(cx + (r - 30) * Math.sin(a), cy - (r - 30) * Math.cos(a) + 7, n);
  }
  const ha = (((h % 12) + m / 60) / 12) * 2 * Math.PI;
  const ma = (m / 60) * 2 * Math.PI;
  b += `<line x1="${cx}" y1="${cy}" x2="${cx + 55 * Math.sin(ha)}" y2="${cy - 55 * Math.cos(ha)}" class="v-hand" stroke-width="8" stroke-linecap="round"/>`;
  b += `<line x1="${cx}" y1="${cy}" x2="${cx + 85 * Math.sin(ma)}" y2="${cy - 85 * Math.cos(ma)}" class="v-hand" stroke-width="4" stroke-linecap="round"/>`;
  b += `<circle cx="${cx}" cy="${cy}" r="6" class="v-mark"/>`;
  return svg(240, 240, b, 'vis-sm');
}

// Søjlediagram
export function barChart(cats, vals, { step = 1, max = null, title = '' } = {}) {
  const top = max ?? Math.ceil(Math.max(...vals) / step) * step;
  const x0 = 60, y0 = 30, H = 220, bw = 64, gap = 26;
  const W = cats.length * (bw + gap) + gap;
  const Y = (v) => y0 + H - (v / top) * H;
  let b = '';
  const labelEvery = top / step > 12 ? 2 : 1;
  for (let v = 0, i = 0; v <= top; v += step, i++) {
    b += `<line x1="${x0}" y1="${Y(v)}" x2="${x0 + W}" y2="${Y(v)}" class="v-line-thin"/>`;
    if (i % labelEvery === 0) b += `<text x="${x0 - 10}" y="${Y(v) + 5}" class="v-text v-small" text-anchor="end">${v}</text>`;
  }
  cats.forEach((c, i) => {
    const x = x0 + gap + i * (bw + gap);
    b += `<rect x="${x}" y="${Y(vals[i])}" width="${bw}" height="${(vals[i] / top) * H}" class="v-fill"/>`;
    b += t(x + bw / 2, y0 + H + 26, c, 'class="v-text v-small"');
  });
  b += `<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + H}" class="v-line" stroke-width="2"/>`;
  if (title) b += t(x0 + W / 2, 18, title, 'class="v-text v-small"');
  return svg(x0 + W + 20, y0 + H + 40, b);
}

// Vinkel med to ben
export function angle(deg, rot = 0) {
  const cx = 150, cy = 150, L = 120;
  const a0 = (rot * Math.PI) / 180, a1 = ((rot + deg) * Math.PI) / 180;
  const p = (a, l) => [cx + l * Math.cos(a), cy - l * Math.sin(a)];
  const [x0, y0] = p(a0, L), [x1, y1] = p(a1, L);
  let b = `<line x1="${cx}" y1="${cy}" x2="${x0}" y2="${y0}" class="v-line" stroke-width="5" stroke-linecap="round"/>`;
  b += `<line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" class="v-line" stroke-width="5" stroke-linecap="round"/>`;
  if (deg === 90) {
    const s = 22;
    const [ax, ay] = p(a0, s), [bx, by] = p(a1, s);
    b += `<path d="M${ax} ${ay} L${ax + (bx - cx)} ${ay + (by - cy)} L${bx} ${by}" class="v-mark-line" fill="none" stroke-width="3"/>`;
  } else {
    const [ax, ay] = p(a0, 36), [bx, by] = p(a1, 36);
    b += `<path d="M${ax} ${ay} A36 36 0 ${deg > 180 ? 1 : 0} 0 ${bx} ${by}" class="v-mark-line" fill="none" stroke-width="3"/>`;
  }
  b += `<circle cx="${cx}" cy="${cy}" r="6" class="v-mark"/>`;
  return svg(300, 300, b, 'vis-sm');
}

// Pose med farvede kugler
export function bag(balls) {
  const all = [];
  balls.forEach(({ color, n }) => { for (let i = 0; i < n; i++) all.push(color); });
  const cols = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(all.length * 1.6))));
  const rows = Math.max(1, Math.ceil(all.length / cols));
  const d = 40, w = cols * d + 60, h = rows * d + 70;
  let b = `<path d="M20 40 V${h - 30} Q20 ${h - 5} 45 ${h - 5} H${w - 45} Q${w - 20} ${h - 5} ${w - 20} ${h - 30} V40 Z" class="v-empty v-line" stroke-width="3"/>`;
  b += `<path d="M14 40 H${w - 14}" class="v-line" stroke-width="5" stroke-linecap="round"/>`;
  // bland kuglerne deterministisk-ish, så farverne ikke står i blokke
  const mixed = all.map((c, i) => [c, (i * 7919) % 101]).sort((a, b2) => a[1] - b2[1]).map((x) => x[0]);
  mixed.forEach((c, i) => {
    const r = Math.floor(i / cols), col = i % cols;
    b += `<circle cx="${30 + d / 2 + col * d}" cy="${55 + d / 2 + r * d - 8}" r="${d * 0.4}" class="ball-${c} v-line"/>`;
  });
  return svg(w, h, b, 'vis-sm');
}

// Positionstabel
export function placeValue(n) {
  const long = ['enere', 'tiere', 'hundreder', 'tusinder', 'titusinder'];
  const ds = String(n).split('').reverse();
  const cols = ds.length, cw = 96, x0 = 10;
  let b = '';
  for (let i = cols - 1, c = 0; i >= 0; i--, c++) {
    const x = x0 + c * cw;
    b += `<rect x="${x}" y="10" width="${cw}" height="40" class="v-soft v-line"/>`;
    b += t(x + cw / 2, 37, long[i], 'class="v-text v-small"');
    b += `<rect x="${x}" y="50" width="${cw}" height="56" class="v-empty v-line"/>`;
    b += t(x + cw / 2, 90, ds[i], 'class="v-text v-big"');
  }
  return svg(x0 * 2 + cols * cw, 116, b);
}

// Positionstabel for decimaltal: (tiere) enere , tiendedele hundrededele
export function decimalPlaces(whole, t, h = null) {
  const wd = String(whole).split('');
  const heads = [...(wd.length > 1 ? ['tiere'] : []), 'enere', ',', 'tiendedele', ...(h != null ? ['hundrededele'] : [])];
  const digits = [...wd, ',', String(t), ...(h != null ? [String(h)] : [])];
  const cw = (hd) => (hd === ',' ? 36 : 128);
  let x = 10, b = '';
  heads.forEach((hd, i) => {
    const w = cw(hd);
    if (hd !== ',') {
      const dec = i > heads.indexOf(',');
      b += `<rect x="${x}" y="10" width="${w}" height="40" class="${dec ? 'v-soft' : 'v-empty'} v-line"/>`;
      b += t0(x + w / 2, 37, hd);
      b += `<rect x="${x}" y="50" width="${w}" height="60" class="v-empty v-line"/>`;
    }
    b += `<text x="${x + w / 2}" y="${hd === ',' ? 98 : 92}" class="v-text v-big" text-anchor="middle">${digits[i]}</text>`;
    x += w;
  });
  return svg(x + 10, 120, b);
}
const t0 = (x, y, s) => `<text x="${x}" y="${y}" class="v-text v-small" text-anchor="middle">${s}</text>`;


// Prikker fordelt i grupper (division og brøk af antal); de første hl grupper fremhæves
export function groups(total, g, hl = 0) {
  const per = total / g;
  const inner = Math.ceil(Math.sqrt(per));
  const d = 20, pad = 10;
  const bw = inner * d + pad * 2, bh = Math.ceil(per / inner) * d + pad * 2;
  const perRow = Math.max(1, Math.min(g, Math.floor(600 / (bw + 12))));
  const rows = Math.ceil(g / perRow);
  let b = '';
  for (let k = 0; k < g; k++) {
    const gx = 10 + (k % perRow) * (bw + 12), gy = 10 + Math.floor(k / perRow) * (bh + 12);
    b += `<rect x="${gx}" y="${gy}" width="${bw}" height="${bh}" rx="10" class="${k < hl ? 'v-soft' : 'v-empty'} v-line"/>`;
    for (let i = 0; i < per; i++)
      b += `<circle cx="${gx + pad + d / 2 + (i % inner) * d}" cy="${gy + pad + d / 2 + Math.floor(i / inner) * d}" r="7" class="${k < hl ? 'v-mark' : 'v-fill'}"/>`;
  }
  return svg(20 + perRow * (bw + 12), 20 + rows * (bh + 12), b);
}

// ---------- Små tegninger til forklaringskortene ("Se hvordan") ----------
// Lidt mere "ting" end diagrammerne ovenfor (hegn, fodersæk, målekande), men med samme streg og få farver.
const mini = (body, w = 240, h = 132) => svg(w, h, body, 'vis-mini');

// Længde: et hegnsstykke på 1 m med et målebånd fra 0 til 100 cm under
export function lengthUnits() {
  const x0 = 40, x1 = 200;
  let b = `<path d="M${x0 + 4} 22 H${x1 - 4}" class="v-mark-line" stroke-width="2.5"/>
    <path d="M${x0 + 4} 22 l9 -5 v10 z M${x1 - 4} 22 l-9 -5 v10 z" class="v-mark"/>
    ${t((x0 + x1) / 2, 15, '1 m', 'class="v-text v-strong v-small"')}`;
  for (const x of [x0 - 5, x1 - 5]) b += `<rect x="${x}" y="30" width="10" height="56" rx="3" class="v-wood v-line" stroke-width="2"/>`;
  for (const y of [40, 62]) b += `<rect x="${x0 + 5}" y="${y}" width="${x1 - x0 - 10}" height="8" rx="3" class="v-wood v-line" stroke-width="2"/>`;
  b += `<rect x="${x0}" y="92" width="${x1 - x0}" height="18" rx="3" class="v-tape v-line" stroke-width="2"/>`;
  for (let i = 0; i <= 10; i++) {
    const x = x0 + (i * (x1 - x0)) / 10;
    b += `<line x1="${x}" y1="92" x2="${x}" y2="${i % 5 ? 99 : 104}" class="v-line" stroke-width="1.8"/>`;
  }
  b += t(x0, 127, '0', 'class="v-text v-small"') + t(x1, 127, '100 cm', 'class="v-text v-small"');
  return mini(b);
}

// Vægt: en fodersæk på 1 kg på en vægt, der viser 1.000 g
export function weightUnits() {
  const b = `<path d="M84 98 C74 78 76 54 90 44 L102 36 H138 L150 44 C164 54 166 78 156 98 Z" class="v-sack v-line" stroke-width="2.5"/>
    <path d="M102 36 Q120 28 138 36" fill="none" class="v-line" stroke-width="2.5"/>
    <path d="M112 30 l-6 -8 M128 30 l6 -8" class="v-line" stroke-width="2.5" stroke-linecap="round"/>
    ${t(120, 78, '1 kg', 'class="v-text v-strong"')}
    <rect x="58" y="98" width="124" height="9" rx="4" class="v-steel v-line" stroke-width="2"/>
    <rect x="66" y="106" width="108" height="25" rx="6" class="v-steel v-line" stroke-width="2"/>
    <rect x="74" y="110" width="92" height="17" rx="4" class="v-empty"/>
    ${t(120, 124, '1.000 g', 'class="v-text v-strong" style="font-size:17px"')}`;
  return mini(b);
}

// Rumfang: en målekande på 1 liter med en streg for hver deciliter
export function volumeUnits() {
  let b = `<path d="M95 32 L144 32 L139 120 Q138 125 133 125 L106 125 Q101 125 100 120 Z" class="v-water"/>
    <path d="M90 16 L150 16 L144 120 Q143 128 135 128 L104 128 Q96 128 95 120 Z" fill="none" class="v-line" stroke-width="2.5"/>
    <path d="M150 34 C172 36 176 66 146 86" fill="none" class="v-line" stroke-width="2.5"/>`;
  for (let i = 1; i <= 10; i++) {
    const y = 125 - i * 9.3, x = 96 + (i * 4.6) / 10;
    b += `<line x1="${x}" y1="${y}" x2="${x + (i % 5 ? 9 : 16)}" y2="${y}" class="v-line" stroke-width="${i % 5 ? 1.6 : 2.2}"/>`;
  }
  b += t(70, 37, '1 l', 'class="v-text v-strong v-small"') + t(70, 83, '5 dl', 'class="v-text v-small"');
  b += `<path d="M80 32 H92 M80 78 H94" class="v-line-thin" stroke-width="1.5"/>`;
  b += t(196, 112, '10 dl', 'class="v-text v-small"') + t(196, 128, '= 1 l', 'class="v-text v-small"');
  return mini(b);
}

// ---------- Minitegninger til forklaringskortene ----------
// Alle er 240 bred med stor skrift, så de kan læses i et lille kort (ca. 220 px) – også på telefon.
const nf = (n) => (typeof n === 'number' ? n.toLocaleString('da-DK') : n);
const tx = (x, y, s, c = 'v-text', a = 'middle', st = '') => `<text x="${x}" y="${y}" class="${c}" text-anchor="${a}"${st ? ` style="${st}"` : ''}>${s}</text>`;
const cell = (x, y, w, h, c = 'v-box', r = 7) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="${c}"/>`;
// Pilespids i (x, y), der peger væk fra (fx, fy)
const head = (x, y, fx, fy, c = 'v-mark') => {
  const dx = x - fx, dy = y - fy, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, bx = x - ux * 10, by = y - uy * 10;
  return `<path d="M${x} ${y} L${(bx - uy * 5.5).toFixed(1)} ${(by + ux * 5.5).toFixed(1)} L${(bx + uy * 5.5).toFixed(1)} ${(by - ux * 5.5).toFixed(1)} Z" class="${c}"/>`;
};
// Bue med pil fra x1 til x2 (over linjen y, eller under med down)
const arc = (x1, x2, y, lift, label, { down = false, c = 'v-mark' } = {}) => {
  const m = (x1 + x2) / 2, cy = down ? y + lift : y - lift;
  return `<path d="M${x1} ${y} Q${m} ${cy} ${x2} ${y}" fill="none" class="${c}-line" stroke-width="2.5"/>${head(x2, y, m, cy, c)}`
    + (label ? tx(m, down ? y + lift / 2 + 20 : y - lift / 2 - 8, label, `v-text v-small ${c === 'v-mark' ? 'v-strong' : c === 'v-muted' ? 'v-muted' : ''}`) : '');
};
// Brøk skrevet lodret (tæller over streg over nævner), centreret om x med stregen i højde y
const fr = (x, y, n, d, size = 20, c = 'v-text') => `${tx(x, y - size * 0.28, n, c, 'middle', `font-size:${size}px`)}`
  + `<line x1="${x - size * 0.62}" y1="${y}" x2="${x + size * 0.62}" y2="${y}" class="v-line" stroke-width="2"/>${tx(x, y + size * 0.98, d, c, 'middle', `font-size:${size}px`)}`;

// Tallinje: label(i, v) giver tekst (eller [tæller, nævner]) under stregerne; marks = prikker; jumps = buer med pil
export function miniLine({ min, max, div, label = () => null, marks = [], jumps = [], h = 100, y = 64 }) {
  const x0 = 24, x1 = 216, X = (v) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  let b = `<line x1="${x0 - 10}" y1="${y}" x2="${x1 + 10}" y2="${y}" class="v-line" stroke-width="2.5"/>`;
  for (let i = 0; i <= div; i++) {
    const v = min + ((max - min) * i) / div, lab = label(i, v), big = lab != null;
    b += `<line x1="${X(v)}" y1="${y - (big ? 8 : 5)}" x2="${X(v)}" y2="${y + (big ? 8 : 5)}" class="v-line" stroke-width="${big ? 2.5 : 1.6}"/>`;
    if (big) b += Array.isArray(lab) ? fr(X(v), y + 26, lab[0], lab[1], 15) : tx(X(v), y + 28, lab, 'v-text v-small');
  }
  for (const j of jumps) b += arc(X(j.from), X(j.to), y - 7, j.lift || 30, j.text, { c: j.c || 'v-mark' });
  for (const m of marks) {
    b += `<circle cx="${X(m.v)}" cy="${y}" r="6.5" class="v-mark"/>`;
    if (m.text) b += Array.isArray(m.text) ? fr(X(m.v), y - 34, m.text[0], m.text[1], 15, 'v-text v-strong')
      : tx(X(m.v), m.below ? y + 28 : y - 16, m.text, 'v-text v-small v-strong');
  }
  return mini(b, 240, h);
}

// Cifrenes pladser (1000, 100, 10, 1) med ét ciffer fremhævet og dets værdi under
export function miniPlace(digits, { hi = -1, value = '' } = {}) {
  const n = digits.length, cw = n > 4 ? 38 : 44, gap = 6, W = n * cw + (n - 1) * gap, x0 = (240 - W) / 2;
  const heads = ['10.000', '1.000', '100', '10', '1'].slice(-n);
  let b = '';
  [...digits].forEach((d, i) => {
    const x = x0 + i * (cw + gap);
    b += tx(x + cw / 2, 17, heads[i], 'v-text v-tiny v-muted') + cell(x, 24, cw, 42, i === hi ? 'v-hi' : 'v-box');
    b += tx(x + cw / 2, 53, d, 'v-text', 'middle', 'font-size:24px');
  });
  if (hi >= 0 && value) b += tx(x0 + hi * (cw + gap) + cw / 2, 94, value, 'v-text v-strong');
  return mini(b, 240, value ? 104 : 74);
}

// To tal under hinanden, ciffer for ciffer – det første sted, de er forskellige, er fremhævet.
// ' ' = tom plads (stiplet), ',' = komma; added = [[række, plads]] for et tilføjet 0
export function miniCompare(rows, { hi = -1, heads = null, sym = '', added = [] } = {}) {
  const chars = rows.map((r) => [...r]), widths = chars[0].map((c) => (c === ',' ? 12 : 36));
  const W = widths.reduce((s, w) => s + w + 4, -4) + (sym ? 34 : 0), x0 = (240 - W) / 2, top = heads ? 24 : 8;
  const xs = []; let x = x0;
  widths.forEach((w) => { xs.push(x); x += w + 4; });
  let b = '';
  if (heads) heads.forEach((h, i) => { if (h) b += tx(xs[i] + widths[i] / 2, 16, h, 'v-text v-tiny v-muted'); });
  chars.forEach((row, r) => {
    const y = top + r * 44;
    row.forEach((c, i) => {
      const w = widths[i];
      if (c === ',') { b += tx(xs[i] + w / 2, y + 30, ',', 'v-text'); return; }
      b += cell(xs[i], y, w, 38, i === hi ? 'v-hi' : c === ' ' ? 'v-box v-dash' : 'v-box');
      if (c !== ' ') b += tx(xs[i] + w / 2, y + 27, c, added.some(([rr, ii]) => rr === r && ii === i) ? 'v-text v-added' : 'v-text');
    });
  });
  if (sym) b += tx(x + 14, top + 52, sym, 'v-text v-strong', 'middle', 'font-size:30px');
  return mini(b, 240, top + 92);
}

// Lille regnetabel: kolonner (fx 100 · 10 · 1), rækker der lægges sammen, sumrække og resultat
export function miniTable({ heads, rows, sum, total = '' }) {
  const cw = 58, x0 = 240 - 16 - heads.length * cw;
  let b = '';
  heads.forEach((h, i) => { b += cell(x0 + i * cw + 3, 22, cw - 6, rows.length * 26 + 44, 'v-col', 8) + tx(x0 + i * cw + cw / 2, 16, h, 'v-text v-tiny v-muted'); });
  rows.forEach((r, k) => {
    const y = 44 + k * 26;
    if (k === rows.length - 1) b += tx(x0 - 14, y, '+', 'v-text');
    r.forEach((v, i) => { b += tx(x0 + i * cw + cw / 2, y, v, 'v-text'); });
  });
  const ly = 44 + (rows.length - 1) * 26 + 10;
  b += `<line x1="${x0 - 24}" y1="${ly}" x2="${x0 + heads.length * cw}" y2="${ly}" class="v-line" stroke-width="2"/>`;
  sum.forEach((v, i) => { b += tx(x0 + i * cw + cw / 2, ly + 24, v, 'v-text v-strong'); });
  if (total) b += tx(120, ly + 54, total, 'v-text v-strong');
  return mini(b, 240, ly + (total ? 62 : 34));
}

// Kæde af tal med pile imellem, fx 632 → 432 → 352 → 347 (−200, −80, −5)
export function miniChain(items, ops, { hi = items.length - 1 } = {}) {
  const ws = items.map((s) => Math.max(40, String(s).length * 12 + 16)), aw = 30;
  const W = ws.reduce((s, w) => s + w, 0) + (items.length - 1) * aw, VW = Math.max(240, W + 12);
  let x = (VW - W) / 2, b = '';
  items.forEach((s, i) => {
    b += cell(x, 42, ws[i], 36, i === hi ? 'v-hi' : 'v-box') + tx(x + ws[i] / 2, 67, s, 'v-text');
    if (i < items.length - 1) {
      const a = x + ws[i] + 3, c = x + ws[i] + aw - 3;
      b += `<line x1="${a}" y1="60" x2="${c - 6}" y2="60" class="v-mark-line" stroke-width="2.5"/>${head(c, 60, a, 60)}`;
      b += tx((a + c) / 2, 30, ops[i], 'v-text v-small v-strong');
    }
    x += ws[i] + aw;
  });
  return mini(b, VW, 92);
}

// Ganges med 10 eller 100: cifrene rykker en eller to pladser til venstre, og der kommer 0 bagpå
export function miniShift(from, to) {
  const n = to.length, k = to.length - from.length, cw = n > 3 ? 34 : 40, gap = 6;
  const W = n * cw + (n - 1) * gap, x0 = (240 - W) / 2 + 16;
  const heads = ['1.000', '100', '10', '1'].slice(-n), X = (i) => x0 + i * (cw + gap);
  let b = tx(26, 82, `× ${10 ** k}`, 'v-text v-small v-strong');
  heads.forEach((h, i) => { b += tx(X(i) + cw / 2, 15, h, 'v-text v-tiny v-muted'); });
  [...from.padStart(n, ' ')].forEach((d, i) => { b += cell(X(i), 22, cw, 34, d === ' ' ? 'v-box v-dash' : 'v-box') + (d === ' ' ? '' : tx(X(i) + cw / 2, 46, d, 'v-text')); });
  [...to].forEach((d, i) => { b += cell(X(i), 92, cw, 34, i >= n - k ? 'v-hi' : 'v-box') + tx(X(i) + cw / 2, 116, d, 'v-text'); });
  [...from].forEach((_, j) => {
    const i1 = n - from.length + j, i2 = i1 - k, xa = X(i1) + cw / 2, xb = X(i2) + cw / 2;
    b += `<line x1="${xa}" y1="59" x2="${xb + (xa - xb) * 0.12}" y2="84" class="v-mark-line" stroke-width="2.2"/>${head(xb, 89, xa, 59)}`;
  });
  return mini(b, 240, 132);
}

// Arealmodel: 47 × 6 = 40 × 6 + 7 × 6
export function miniSplit(parts, m) {
  const total = parts.reduce((s, p) => s + p, 0), W = 186, x0 = 40;
  let ws = parts.map((p) => Math.max(48, (p / total) * W));
  const k = W / ws.reduce((s, w) => s + w, 0); ws = ws.map((w) => w * k);
  let x = x0, b = tx(x0 - 14, 56, m, 'v-text');
  parts.forEach((p, i) => {
    const w = ws[i];
    b += tx(x + w / 2, 16, nf(p), 'v-text v-small');
    b += `<rect x="${x}" y="24" width="${w}" height="50" class="${i % 2 ? 'v-soft' : 'v-empty'} v-line" stroke-width="2"/>`;
    b += tx(x + w / 2, 56, nf(p * m), w < 56 ? 'v-text v-small v-strong' : 'v-text v-strong');
    x += w;
  });
  b += tx(120, 104, `${parts.map((p) => nf(p * m)).join(' + ')} = ${nf(total * m)}`, 'v-text v-small v-strong');
  return mini(b, 240, 114);
}

// Prikker i lige store grupper. hl = fremhævede grupper, rest = prikker til overs,
// filled = hvor mange pladser der er fyldt (resten står tomme, fx sæder i en vogn)
export function miniGroups({ groups, per, hl = 0, rest = 0, filled = null, label = '' }) {
  const cols = per <= 4 ? 2 : per <= 9 ? 3 : 4, rowsIn = Math.ceil(per / cols), d = 13, pad = 6, gap = 6;
  const bw = cols * d + pad * 2, bh = rowsIn * d + pad * 2, restW = rest ? 22 + Math.ceil(rest / 2) * d : 0;
  const fit = Math.max(1, Math.floor((240 - restW + gap) / (bw + gap))), rows = Math.ceil(groups / fit), perRow = Math.ceil(groups / rows);
  const W = perRow * (bw + gap) - gap + restW, x0 = (240 - W) / 2;
  let b = '', count = 0;
  for (let g = 0; g < groups; g++) {
    const gx = x0 + (g % perRow) * (bw + gap), gy = 6 + Math.floor(g / perRow) * (bh + gap);
    b += cell(gx, gy, bw, bh, g < hl ? 'v-hi' : 'v-box', 8);
    for (let i = 0; i < per; i++, count++) {
      const on = filled == null || count < filled;
      b += `<circle cx="${gx + pad + d / 2 + (i % cols) * d}" cy="${gy + pad + d / 2 + Math.floor(i / cols) * d}" r="5" class="${on ? (g < hl ? 'v-mark' : 'v-fill') : 'v-empty v-line'}"${on ? '' : ' stroke-width="1.5"'}/>`;
    }
  }
  if (rest) {
    const rx = x0 + perRow * (bw + gap) + 12;
    for (let i = 0; i < rest; i++) b += `<circle cx="${rx + Math.floor(i / 2) * d}" cy="${6 + pad + d / 2 + (i % 2) * d}" r="5" class="v-mark"/>`;
    b += tx(rx + (Math.ceil(rest / 2) * d) / 2 - 6, 6 + pad + 2 * d + 16, 'rest', 'v-text v-tiny v-strong');
  }
  const H = 6 + rows * (bh + gap) + (label ? 24 : 0);
  if (label) b += tx(120, H - 6, label, 'v-text v-small v-strong');
  return mini(b, 240, H + 2);
}

// Lagkage delt i n lige store dele, k farvet – med brøken og hvad tæller og nævner betyder
export function miniFracPie(n, k) {
  const cx = 62, cy = 66, r = 50;
  let b = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    b += `<path d="M${cx} ${cy} L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 0 1 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} Z" class="${i < k ? 'v-fill' : 'v-empty'} v-line" stroke-width="2"/>`;
  }
  b += fr(146, 66, k, n, 30, 'v-text v-strong');
  b += tx(170, 52, 'farvet', 'v-text v-small v-muted', 'start') + tx(170, 98, 'dele i alt', 'v-text v-small v-muted', 'start');
  return mini(b, 240, 132);
}

// Lige store dele (rigtig brøk) over for ulige store dele
export function miniEqualParts() {
  const bar = (x, cuts, ok) => `<rect x="${x}" y="22" width="96" height="50" rx="4" class="v-empty v-line" stroke-width="2"/>`
    + cuts.map((c) => `<line x1="${x + c}" y1="22" x2="${x + c}" y2="72" class="v-line" stroke-width="2"/>`).join('')
    + `<rect x="${x}" y="22" width="${cuts[0]}" height="50" rx="4" class="${ok ? 'v-fill' : 'v-mark'}" opacity=".85"/>`
    + tx(x + 48, 98, ok ? 'lige store ✓' : 'ikke lige ✗', `v-text v-small ${ok ? 'v-strong' : 'v-added'}`);
  return mini(bar(14, [24, 48, 72], true) + bar(130, [12, 44, 66], false), 240, 108);
}

// Brøkstænger under hinanden, fx 1/3 over for 1/6 (samme helhed)
export function miniFracBars(list) {
  const x0 = 72, W = 150, h = 28;
  let b = '';
  list.forEach((f, r) => {
    const y = 12 + r * 52;
    b += fr(34, y + 12, f.k, f.n, 17);
    for (let i = 0; i < f.n; i++) b += `<rect x="${(x0 + (i * W) / f.n).toFixed(1)}" y="${y}" width="${(W / f.n).toFixed(1)}" height="${h}" class="${i < f.k ? 'v-fill' : 'v-empty'} v-line" stroke-width="2"/>`;
  });
  return mini(b, 240, 12 + list.length * 52 - 10);
}

// Samme brøk på to måder: gang tæller og nævner med det samme tal
export function miniFracScale(n, d, m) {
  let b = fr(62, 66, n, d, 32, 'v-text') + fr(178, 66, n * m, d * m, 32, 'v-text v-strong');
  b += arc(84, 156, 32, 20, `× ${m}`) + arc(84, 156, 104, 20, `× ${m}`, { down: true });
  return mini(b, 240, 142);
}

// 1 hel delt i 10: k tiendedele farvet
export function miniTenths(k) {
  let b = '';
  for (let i = 0; i < 10; i++) b += `<rect x="${30 + i * 18}" y="18" width="18" height="38" class="${i < k ? 'v-fill' : 'v-empty'} v-line" stroke-width="2"/>`;
  b += tx(120, 86, `${k} af 10 = 0,${k}`, 'v-text v-strong');
  return mini(b, 240, 98);
}

// To decimaltal som stænger (hver stang er 1 hel) – fx 0,5 er længere end 0,45
export function miniDecBars(list) {
  const x0 = 72, W = 150;
  let b = '';
  list.forEach(({ v, label }, r) => {
    const y = 14 + r * 46;
    b += tx(x0 - 12, y + 21, label, 'v-text', 'end');
    b += `<rect x="${x0}" y="${y}" width="${W}" height="28" rx="4" class="v-empty v-line" stroke-width="2"/><rect x="${x0}" y="${y}" width="${W * v}" height="28" rx="4" class="${r ? 'v-soft' : 'v-fill'}"/>`;
    for (let i = 1; i < 10; i++) b += `<line x1="${x0 + (i * W) / 10}" y1="${y + 20}" x2="${x0 + (i * W) / 10}" y2="${y + 28}" class="v-line" stroke-width="1.4"/>`;
  });
  return mini(b, 240, 14 + list.length * 46);
}

// Opstilling: tallene under hinanden (kommaerne under hinanden), streg og resultat
export function miniStack(rows, op, result) {
  const all = [...rows, result], n = Math.max(...all.map((s) => s.length)), cw = 17, x1 = 190;
  const X = (len, i) => x1 - (len - i) * cw + cw / 2;
  let b = '';
  const ci = rows[0].indexOf(',');
  if (ci >= 0) b += cell(X(rows[0].length, ci) - 9, 8, 18, rows.length * 28 + 42, 'v-col', 6);
  rows.forEach((s, r) => { [...s].forEach((ch, i) => { b += tx(X(s.length, i), 30 + r * 28, ch, 'v-text'); }); });
  b += tx(x1 - n * cw - 16, 30 + (rows.length - 1) * 28, op, 'v-text');
  const ly = 38 + (rows.length - 1) * 28;
  b += `<line x1="${x1 - n * cw - 26}" y1="${ly}" x2="${x1 + 6}" y2="${ly}" class="v-line" stroke-width="2"/>`;
  [...result].forEach((ch, i) => { b += tx(X(result.length, i), ly + 26, ch, 'v-text v-strong'); });
  return mini(b, 240, ly + 38);
}

// Rektangel med sidelængder. perim = hele vejen rundt (orange), grid = kvadrater indeni
export function miniRect(w, h, { perim = false, grid = false, unit = 'cm', top = null, right = null, inside = '', below = '' } = {}) {
  const s = Math.min(26, 150 / w, 70 / h), W = w * s, H = h * s, x = (240 - W) / 2 - 12, y = 30;
  let b = `<rect x="${x}" y="${y}" width="${W}" height="${H}" class="${grid ? 'v-soft' : 'v-empty'} v-line" stroke-width="2"/>`;
  if (grid) {
    for (let i = 1; i < w; i++) b += `<line x1="${x + i * s}" y1="${y}" x2="${x + i * s}" y2="${y + H}" class="v-line" stroke-width="1.2"/>`;
    for (let j = 1; j < h; j++) b += `<line x1="${x}" y1="${y + j * s}" x2="${x + W}" y2="${y + j * s}" class="v-line" stroke-width="1.2"/>`;
  }
  if (perim) b += `<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="none" class="v-mark-line" stroke-width="5" stroke-linejoin="round"/>`;
  b += tx(x + W / 2, y - 9, top ?? `${w} ${unit}`, 'v-text v-small') + tx(x + W + 8, y + H / 2 + 6, right ?? `${h} ${unit}`, 'v-text v-small', 'start');
  if (inside) b += tx(x + W / 2, y + H / 2 + 7, inside, 'v-text v-strong');
  if (below) b += tx(x + W / 2, y + H + 26, below, 'v-text v-small v-strong');
  return mini(b, 240, y + H + (below ? 36 : 14));
}

// Sammensat figur (L): del den i to rektangler og læg arealerne sammen
export function miniLShape() {
  const s = 22, x = 34, y = 18;
  let b = `<path d="M${x} ${y} H${x + 2 * s} V${y + 2 * s} H${x + 4 * s} V${y + 4 * s} H${x} Z" class="v-soft v-line" stroke-width="2"/>`;
  for (let i = 1; i < 4; i++) b += `<line x1="${x + i * s}" y1="${i < 2 ? y : y + 2 * s}" x2="${x + i * s}" y2="${y + 4 * s}" class="v-line" stroke-width="1.2"/>`;
  for (let j = 1; j < 4; j++) b += `<line x1="${x}" y1="${y + j * s}" x2="${j < 2 ? x + 2 * s : x + 4 * s}" y2="${y + j * s}" class="v-line" stroke-width="1.2"/>`;
  b += `<line x1="${x}" y1="${y + 2 * s}" x2="${x + 2 * s}" y2="${y + 2 * s}" class="v-mark-line" stroke-width="3.5" stroke-dasharray="6 4"/>`;
  b += `<circle cx="${x + s}" cy="${y + s}" r="13" class="v-label"/><circle cx="${x + 2 * s}" cy="${y + 3 * s}" r="13" class="v-label"/>`;
  b += tx(x + s, y + s + 7, '4', 'v-text v-strong') + tx(x + 2 * s, y + 3 * s + 7, '8', 'v-text v-strong');
  b += tx(186, 58, '4 + 8', 'v-text') + tx(186, 86, '= 12 m²', 'v-text v-strong');
  return mini(b, 240, y + 4 * s + 12);
}

// Vinkler side om side, fx [[45, 'spids'], [90, 'ret'], [130, 'stump']]
export function miniAngles(list) {
  const cw = 240 / list.length;
  let b = '';
  list.forEach(([deg, name], i) => {
    const vx = i * cw + cw / 2 - (deg > 90 ? 6 : 20), vy = 78, L = Math.min(54, cw - 18), a = (deg * Math.PI) / 180;
    const ex = vx + L * Math.cos(a), ey = vy - L * Math.sin(a);
    b += deg === 90
      ? `<path d="M${vx + 13} ${vy} V${vy - 13} H${vx}" fill="none" class="v-mark-line" stroke-width="2.5"/>`
      : `<path d="M${vx + 17} ${vy} A17 17 0 0 0 ${(vx + 17 * Math.cos(a)).toFixed(1)} ${(vy - 17 * Math.sin(a)).toFixed(1)}" fill="none" class="v-mark-line" stroke-width="2.5"/>`;
    b += `<path d="M${vx + L} ${vy} L${vx} ${vy} L${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" class="v-line" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    b += tx(i * cw + cw / 2, 106, name, 'v-text v-small');
  });
  return mini(b, 240, 116);
}

// Lige vinkel: en lige linje er 180° (to rette vinkler)
export function miniStraight() {
  return mini(`<path d="M146 78 A26 26 0 0 0 94 78" fill="none" class="v-mark-line" stroke-width="2.5"/>
    <line x1="120" y1="78" x2="120" y2="52" class="v-line-thin" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="34" y1="78" x2="206" y2="78" class="v-line" stroke-width="3" stroke-linecap="round"/><circle cx="120" cy="78" r="4" class="v-mark"/>
    ${tx(120, 40, '180°', 'v-text v-strong')}${tx(120, 106, '90° + 90°', 'v-text v-small v-muted')}`, 240, 116);
}

// Ur med de fire hovedtal, lille og stor viser – og klokken skrevet ved siden af
export function miniClock(h, m, text = '') {
  const cx = 64, cy = 66, r = 54;
  let b = `<circle cx="${cx}" cy="${cy}" r="${r}" class="v-empty v-line" stroke-width="3"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 2 * Math.PI, x1 = cx + Math.sin(a) * (r - 4), y1 = cy - Math.cos(a) * (r - 4), x2 = cx + Math.sin(a) * (r - (i % 3 ? 9 : 12)), y2 = cy - Math.cos(a) * (r - (i % 3 ? 9 : 12));
    b += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="v-line" stroke-width="${i % 3 ? 1.6 : 2.6}"/>`;
  }
  [[12, 0, -1], [3, 1, 0], [6, 0, 1], [9, -1, 0]].forEach(([n, dx, dy]) => { b += tx(cx + dx * (r - 24), cy + dy * (r - 24) + 6, n, 'v-text v-small'); });
  const ma = (m / 60) * 2 * Math.PI, ha = ((h % 12) / 12 + m / 720) * 2 * Math.PI;
  b += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.sin(ha) * 26).toFixed(1)}" y2="${(cy - Math.cos(ha) * 26).toFixed(1)}" class="v-hand" stroke-width="6" stroke-linecap="round"/>`;
  b += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.sin(ma) * 42).toFixed(1)}" y2="${(cy - Math.cos(ma) * 42).toFixed(1)}" class="v-mark-line" stroke-width="3.5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4.5" class="v-mark"/>`;
  b += tx(182, 64, `${h}:${String(m).padStart(2, '0')}`, 'v-text v-big');
  if (text) b += tx(182, 92, text, 'v-text v-small v-muted');
  return mini(b, 240, 132);
}

// Tidslinje: fra et klokkeslæt til et andet, i to spring (fx op til hel time og videre)
export function miniTimeline(times, minutes) {
  const total = minutes.reduce((s, x) => s + x, 0), x0 = 30, W = 180;
  const xs = [x0]; minutes.forEach((mn) => xs.push(xs[xs.length - 1] + (mn / total) * W));
  let b = `<line x1="${x0 - 10}" y1="74" x2="${x0 + W + 10}" y2="74" class="v-line" stroke-width="2.5"/>`;
  xs.forEach((x, i) => { b += `<circle cx="${x}" cy="74" r="5" class="${i === 0 || i === xs.length - 1 ? 'v-mark' : 'v-fill'}"/>` + tx(x, 102, times[i], 'v-text v-small'); });
  minutes.forEach((mn, i) => { b += arc(xs[i] + 3, xs[i + 1] - 3, 66, 26, `${mn} min`); });
  return mini(b, 240, 112);
}

// Lille søjlediagram med akse; hi = fremhævet søjle (aflæses ved den stiplede linje)
export function miniBars(values, names, { step = 1, hi = -1, max = null } = {}) {
  const top = max ?? Math.ceil(Math.max(...values) / step) * step, x0 = 46, y0 = 104, H = 86, bw = 30, gap = (190 - values.length * bw) / (values.length + 1);
  const Y = (v) => y0 - (v / top) * H;
  let b = '';
  for (let v = 0; v <= top; v += step) b += `<line x1="${x0}" y1="${Y(v)}" x2="${x0 + 186}" y2="${Y(v)}" class="v-line-thin"/>` + tx(x0 - 8, Y(v) + 5, v, 'v-text v-tiny', 'end');
  values.forEach((v, i) => {
    const x = x0 + gap + i * (bw + gap);
    b += `<rect x="${x}" y="${Y(v)}" width="${bw}" height="${y0 - Y(v)}" rx="3" class="${i === hi ? 'v-mark' : 'v-fill'}"/>` + tx(x + bw / 2, y0 + 18, names[i], 'v-text v-tiny');
    if (i === hi) b += `<line x1="${x0}" y1="${Y(v)}" x2="${x}" y2="${Y(v)}" class="v-mark-line" stroke-width="2" stroke-dasharray="4 3"/>`;
  });
  b += `<line x1="${x0}" y1="${y0 - H - 4}" x2="${x0}" y2="${y0}" class="v-line" stroke-width="2"/><line x1="${x0}" y1="${y0}" x2="${x0 + 186}" y2="${y0}" class="v-line" stroke-width="2"/>`;
  return mini(b, 240, 128);
}

// Tal på små brikker i rækkefølge; hi = fremhævede brikker, span = klamme fra mindste til største
export function miniTiles(nums, { hi = [], mid = '', span = '' } = {}) {
  const w = 34, gap = 8, W = nums.length * w + (nums.length - 1) * gap, x0 = (240 - W) / 2, y = mid ? 34 : 14;
  let b = '';
  nums.forEach((n, i) => { b += cell(x0 + i * (w + gap), y, w, 38, hi.includes(i) ? 'v-hi' : 'v-box') + tx(x0 + i * (w + gap) + w / 2, y + 27, n, 'v-text'); });
  if (mid) { const mx = x0 + Math.floor(nums.length / 2) * (w + gap) + w / 2; b += tx(mx, 16, mid, 'v-text v-small v-strong') + head(mx, y - 3, mx, y - 14); }
  if (span) {
    const a = x0 + w / 2, c = x0 + W - w / 2, ly = y + 52;
    b += `<path d="M${a} ${ly - 6} V${ly} H${c} V${ly - 6}" fill="none" class="v-mark-line" stroke-width="2.5"/>` + tx(120, ly + 24, span, 'v-text v-small v-strong');
  }
  return mini(b, 240, y + 38 + (span ? 64 : 12));
}

// Chancen på en skala fra umulig til sikker
export function miniChance() {
  const x0 = 26, W = 188, y = 62;
  let b = `<line x1="${x0}" y1="${y}" x2="${x0 + W}" y2="${y}" class="v-line" stroke-width="3" stroke-linecap="round"/>`;
  [[0, 'umulig'], [0.5, 'lige chance'], [1, 'sikker']].forEach(([p, s]) => { b += `<circle cx="${x0 + p * W}" cy="${y}" r="6" class="v-mark"/>` + tx(x0 + p * W, y + 26, s, 'v-text v-tiny', p === 0 ? 'start' : p === 1 ? 'end' : 'middle'); });
  [[0.25, 'usandsynlig'], [0.75, 'sandsynlig']].forEach(([p, s]) => { b += `<circle cx="${x0 + p * W}" cy="${y}" r="4.5" class="v-fill"/><line x1="${x0 + p * W}" y1="${y + 8}" x2="${x0 + p * W}" y2="${y + 32}" class="v-line-thin"/>` + tx(x0 + p * W, y + 48, s, 'v-text v-tiny v-muted'); });
  b += tx(x0, y - 14, 'aldrig', 'v-text v-tiny v-muted', 'start') + tx(x0 + W, y - 14, 'altid', 'v-text v-tiny v-muted', 'end');
  return mini(b, 240, 118);
}

// Talfølge: brikker med spring imellem, fx 3, 7, 11, 15, ? (+4 hver gang)
export function miniSeq(items, op) {
  const n = items.length, gap = (240 - 40) / (n - 1), y = 70;
  let b = '';
  items.forEach((s, i) => {
    const x = 20 + i * gap;
    b += `<circle cx="${x}" cy="${y}" r="19" class="${s === '?' ? 'v-box v-dash' : i === n - 2 ? 'v-hi' : 'v-box'}"/>` + tx(x, y + 7, s, 'v-text');
    if (i < n - 1) b += arc(x + 10, x + gap - 10, y - 20, 22, op);
  });
  return mini(b, 240, 100);
}

// Regn baglæns: ? → (+7) → 15, og tilbage med det modsatte regnestykke (−7)
export function miniBack(fwd, back, result, answer) {
  let b = cell(26, 46, 56, 40, 'v-box v-dash') + tx(54, 74, '?', 'v-text v-big') + cell(158, 46, 56, 40, 'v-box') + tx(186, 74, result, 'v-text');
  b += arc(86, 154, 50, 28, fwd, { c: 'v-fill' }) + arc(154, 86, 84, 28, back, { down: true });
  b += tx(120, 136, `${result} ${back} = ${answer}`, 'v-text v-small v-strong');
  return mini(b, 240, 146);
}

// Del et tal i bidder, der er lette at dele: 72 → 40 + 32 → 10 + 8 = 18
export function miniSplitTree(n, parts, d) {
  const xs = [64, 176], q = parts.map((p) => p / d);
  let b = cell(92, 4, 56, 32, 'v-box') + tx(120, 27, n, 'v-text');
  parts.forEach((p, i) => {
    b += `<line x1="${120 + (i ? 14 : -14)}" y1="37" x2="${xs[i]}" y2="50" class="v-line" stroke-width="2"/>`;
    b += cell(xs[i] - 28, 50, 56, 32, 'v-box') + tx(xs[i], 73, p, 'v-text');
    b += `<line x1="${xs[i]}" y1="84" x2="${xs[i]}" y2="96" class="v-mark-line" stroke-width="2.5"/>${head(xs[i], 102, xs[i], 86)}` + tx(xs[i] + 12, 97, `: ${d}`, 'v-text v-small v-strong', 'start');
    b += cell(xs[i] - 28, 104, 56, 32, 'v-hi') + tx(xs[i], 127, q[i], 'v-text');
  });
  b += tx(120, 126, '+', 'v-text');
  return mini(b, 240, 142);
}
