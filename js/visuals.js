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

// Positionstabel før og efter ×10/×100: cifrene rykker til venstre
export function placeShift(n, factor) {
  const heads = ['tusinder', 'hundreder', 'tiere', 'enere'];
  const cw = 110, x0 = 20, rowH = 56, y1 = 60, y2 = y1 + rowH + 50;
  const digitsAt = (v) => String(v).padStart(4, ' ').split('');
  const before = digitsAt(n), after = digitsAt(n * factor);
  let b = '';
  heads.forEach((h, i) => {
    b += `<rect x="${x0 + i * cw}" y="10" width="${cw}" height="40" class="v-soft v-line"/>`;
    b += t(x0 + i * cw + cw / 2, 37, h, 'class="v-text v-small"');
  });
  [[before, y1, `${n}`], [after, y2, `${n} × ${factor}`]].forEach(([ds, y, label]) => {
    ds.forEach((d, i) => {
      b += `<rect x="${x0 + i * cw}" y="${y}" width="${cw}" height="${rowH}" class="v-empty v-line"/>`;
      if (d.trim()) b += t(x0 + i * cw + cw / 2, y + 40, d, `class="v-text v-big${label.includes('×') && i === 3 ? ' v-strong' : ''}"`);
    });
    b += `<text x="${x0 + 4 * cw + 14}" y="${y + 36}" class="v-text">${label}</text>`;
  });
  // pile fra hvert ciffer til dets nye plads
  const shift = Math.log10(factor);
  before.forEach((d, i) => {
    if (!d.trim()) return;
    const xa = x0 + i * cw + cw / 2, xb = x0 + (i - shift) * cw + cw / 2;
    b += `<path d="M${xa} ${y1 + rowH + 4} Q${(xa + xb) / 2} ${y1 + rowH + 30} ${xb + 8} ${y2 - 8}" class="v-mark-line" fill="none" stroke-width="3"/>`;
    b += `<path d="M${xb + 8} ${y2 - 4} l-9 -8 l11 -3 z" class="v-mark"/>`;
  });
  return svg(x0 + 4 * cw + 150, y2 + rowH + 12, b);
}

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
