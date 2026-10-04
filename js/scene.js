// Illustreret zoo-port til forsiden (ren SVG, skalerer til alle skærme).

import { esc } from './util.js';

export function zooGate(name, { animals = [], festive = false, art = null } = {}) {
  const len = [...name].length;
  const fs = Math.max(20, Math.min(40, 360 / (0.56 * len)));
  const tree = (x, y, s = 1, c = '#5fb884') => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-6" y="-10" width="12" height="46" rx="4" fill="#9a7552"/>
      <circle cx="0" cy="-34" r="34" fill="${c}"/>
      <circle cx="-22" cy="-16" r="22" fill="${c}"/>
      <circle cx="22" cy="-18" r="24" fill="${c}"/>
      <circle cx="-8" cy="-44" r="14" fill="#ffffff" opacity=".12"/>
    </g>`;
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".92">
      <ellipse cx="0" cy="0" rx="46" ry="20"/><ellipse cx="30" cy="-12" rx="30" ry="22"/><ellipse cx="-30" cy="-6" rx="26" ry="18"/></g>`;
  const fence = (x0, x1) => {
    let s = `<rect x="${x0}" y="222" width="${x1 - x0}" height="7" rx="3" fill="#d8b98a"/><rect x="${x0}" y="242" width="${x1 - x0}" height="7" rx="3" fill="#d8b98a"/>`;
    for (let x = x0 + 6; x < x1; x += 34) s += `<rect x="${x}" y="210" width="10" height="52" rx="4" fill="#e6c999"/>`;
    return s;
  };
  // Dyr der kigger frem over hegnet (vises efterhånden som områderne åbner)
  const spots = [[120, 222, 58], [262, 230, 46], [735, 226, 50], [868, 214, 64], [805, 236, 40], [190, 240, 38]];
  const peek = animals.slice(0, spots.length).map((e, i) => {
    const [x, y, s] = spots[i];
    const src = art && art(e);
    if (src) {
      const w = s * 1.45; // tegningerne er lidt luftigere end emoji
      return `<image href="${src}" x="${x - w / 2}" y="${y - w * 0.82}" width="${w}" height="${w}" class="peek" style="animation-delay:${i * 0.4}s"/>`;
    }
    return `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" class="peek" style="animation-delay:${i * 0.4}s">${e}</text>`;
  }).join('');
  const bunting = festive
    ? Array.from({ length: 11 }, (_, i) => {
      const x = 404 + i * 18, y = 152 + Math.sin((i / 10) * Math.PI) * 14;
      const cols = ['#ff8a65', '#ffc94d', '#2e9e78', '#8fd3f4', '#b7a6e8'];
      return `<path d="M${x - 6} ${y} l12 0 l-6 16 z" fill="${cols[i % cols.length]}"/>`;
    }).join('')
    : '';

  return `<svg class="scene" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe7f6"/><stop offset="1" stop-color="#eef9fb"/></linearGradient>
      <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#ffd66b"/><stop offset="1" stop-color="#ffd66b" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1000" height="300" fill="url(#sky)"/>
    <circle cx="880" cy="70" r="70" fill="url(#sun)"/>
    <circle cx="880" cy="70" r="34" fill="#ffd25e"/>
    ${cloud(170, 70, 1)}${cloud(610, 48, 0.8)}${cloud(980, 130, 0.7)}
    <path d="M0 190 Q150 120 320 170 T650 160 T1000 150 V300 H0 Z" fill="#cdebd3"/>
    <path d="M0 215 Q200 170 420 205 T820 195 T1000 200 V300 H0 Z" fill="#a9dcb6"/>
    ${tree(60, 200, 1.05)}${tree(300, 205, 0.8, '#6cc392')}${tree(700, 200, 0.85, '#6cc392')}${tree(955, 205, 1.1)}
    ${peek}
    ${fence(0, 372)}${fence(628, 1000)}
    <path d="M0 262 H1000 V300 H0 Z" fill="#8fd0a0"/>
    <path d="M445 300 L470 250 H530 L555 300 Z" fill="#f3e2c2"/>
    <!-- porten -->
    <path d="M384 250 V110 Q500 20 616 110 V250" fill="none" stroke="#2c7f64" stroke-width="16" stroke-linecap="round"/>
    <rect x="354" y="118" width="46" height="138" rx="10" fill="#efe0c4"/><rect x="348" y="108" width="58" height="18" rx="7" fill="#2c7f64"/>
    <rect x="600" y="118" width="46" height="138" rx="10" fill="#efe0c4"/><rect x="594" y="108" width="58" height="18" rx="7" fill="#2c7f64"/>
    ${bunting}
    <rect x="${500 - 190}" y="${70}" width="380" height="64" rx="18" fill="#fffaf0" stroke="#2c7f64" stroke-width="5"/>
    <text x="500" y="${102 + fs * 0.34}" text-anchor="middle" class="scene-title" font-size="${fs}">${esc(name)}</text>
  </svg>`;
}
