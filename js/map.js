// Zoo-kortet: forsiden som ét tegnet kort. Grundkortet er landskabet, og de 9 områder
// ligger ovenpå som klikbare tegninger. Fremgang vises i selve tegningen:
// dæmpet (under opbygning) → normal (åben) → lys og stjerner (populær, stjerne, guld).
// Kortet tegner kun data; klik håndteres i app.js via .m-tap og data-area/-task/-baby/-bodil.

import { esc } from './util.js?v=20261005095712';

const MW = 1672, MH = 941; // grundkortets størrelse i pixels (img/map/zoo-map-base.webp)
const px = (v, of) => `${((100 * v) / of).toFixed(2)}%`;
const at = ([x, y]) => `left:${px(x, MW)};top:${px(y, MH)}`;

// Område → tegning, midtpunkt (cx, cy) og bredde (w) i grundkortets pixels, tegningens
// bredde/højde (ar), navneskiltets plads (label) og pladsen til missionens figur (who).
// Placeringerne følger grundkortet, hvor hvert område allerede har sin plads.
export const AREA_ART = {
  division: { file: '03-abehuset', cx: 315, cy: 190, w: 350, ar: 1.0626, label: [300, 300], who: [520, 253] },
  brok: { file: '04-polaromraade', cx: 870, cy: 172, w: 360, ar: 1.1111, label: [873, 316], who: [640, 253] },
  maaling: { file: '07-rovdyrsomraade', cx: 1400, cy: 200, w: 360, ar: 1.0428, label: [1505, 338], who: [1150, 150] },
  decimal: { file: '05-dyreklinik', cx: 700, cy: 350, w: 240, ar: 1.2613, label: [705, 430], who: [560, 360] },
  gange: { file: '02-foderlager', cx: 288, cy: 428, w: 340, ar: 1.1155, label: [300, 556], who: [490, 467] },
  geometri: { file: '06-zebra-naesehorn', cx: 1250, cy: 400, w: 360, ar: 1.1382, label: [1262, 542], who: [1120, 455] },
  data: { file: '08-data-plaza', cx: 975, cy: 565, w: 280, ar: 1.2727, label: [1080, 600], who: [790, 560] },
  algebra: { file: '09-skattejagt', cx: 1425, cy: 680, w: 350, ar: 1.0072, label: [1430, 850], who: [1588, 578] },
  tal: { file: '01-indgang-flamingosoe', cx: 330, cy: 700, w: 370, ar: 1.0749, label: [330, 868], who: [548, 598] },
};
const GATE = [830, 688], BABY = [1215, 826], BODIL = [515, 830], INFO = [836, 916];

// Årstid: faldende blade eller sne hen over kortet
function season(d = new Date()) {
  const m = d.getMonth();
  if (m >= 8 && m <= 10) return { name: 'efterår', fall: ['#e8a34a', '#d9773e', '#f2c45a'] };
  if (m === 11 || m <= 1) return { name: 'vinter', fall: ['#ffffff'] };
  if (m <= 4) return { name: 'forår', fall: ['#f9c9d6'] };
  return { name: 'sommer', fall: [] };
}

const SYMBOL = ['🚧', '', '', '⭐', '🌟'];
const sparkles = (n) => Array.from({ length: n }, (_, k) => `<i class="zm-spark s${k + 1}"></i>`).join('');

/*
 data = {
   zooName, guests, stars, week: { n, goal, label },
   areas: [{ id, place, level, levelName }],
   tasks: [{ area, who: { id, name, img, emoji } }],
   due, bodil: imgSrc,
 }
*/
export function zooMap(d) {
  const S = season();
  let h = '<img class="zm-base" src="img/map/zoo-map-base.webp" alt="" draggable="false" decoding="async">';

  // Områderne – bagerst (øverst på kortet) først, så de nederste ligger forrest
  const areas = d.areas.filter((a) => AREA_ART[a.id]).sort((a, b) => AREA_ART[a.id].cy - AREA_ART[b.id].cy);
  for (const a of areas) {
    const p = AREA_ART[a.id], hh = p.w / p.ar, lv = a.level;
    h += `<button class="m-tap zm-area lv-${lv}" data-area="${a.id}" aria-label="${esc(a.place)}: ${esc(a.levelName)}"
      style="left:${px(p.cx - p.w / 2, MW)};top:${px(p.cy - hh / 2, MH)};width:${px(p.w, MW)};aspect-ratio:${p.ar}">
      ${lv >= 2 ? '<span class="zm-glow"></span>' : ''}<img class="zm-ov" src="img/map/${p.file}.webp" alt="" draggable="false" decoding="async">${lv >= 3 ? sparkles(lv === 4 ? 5 : 3) : ''}
    </button>`;
  }
  // Navneskilte ligger over alle områder, så de altid kan ses (samme klik som området)
  for (const a of areas) {
    h += `<button class="m-tap zm-label lv-${a.level}" data-area="${a.id}" tabindex="-1" aria-hidden="true" style="${at(AREA_ART[a.id].label)}">${esc(a.place)}${SYMBOL[a.level] ? ` <span class="sym">${SYMBOL[a.level]}</span>` : ''}</button>`;
  }

  // Porten: zoo'ens navn og et flag for hvert område med en stjerne
  const flags = Array.from({ length: d.stars }, (_, k) => `<i class="${k % 2 ? 'b' : ''}"></i>`).join('');
  h += `<div class="zm-gate" style="${at(GATE)}">${flags ? `<span class="zm-flags">${flags}</span>` : ''}<span class="zm-zooname">${esc(d.zooName)}</span></div>`;

  // Babyhuset (gangetabellen) og Bodil ved indgangen
  h += `<button class="m-tap zm-baby" data-baby="1" aria-label="Babyhuset${d.due ? `: ${d.due} unger vil have flaske` : ''}" style="${at(BABY)}">
      <img src="img/ui/babyhuset.webp" alt="" draggable="false"><span class="zm-badge ${d.due ? 'due' : ''}">${d.due ? `🍼 ${d.due}` : '💤'}</span><span class="zm-name">Babyhuset</span></button>`;
  if (d.bodil) h += `<button class="m-tap zm-bodil" data-bodil="1" aria-label="Bodil" style="${at(BODIL)}"><img src="${d.bodil}" alt="" draggable="false"></button>`;

  // Gæster og ugens dage
  const dots = Array.from({ length: d.week.goal }, (_, k) => `<i class="${k < d.week.n ? 'on' : ''}"></i>`).join('');
  h += `<div class="zm-info" style="${at(INFO)}">🎟️ ${d.guests.toLocaleString('da-DK')} gæster om dagen <span class="zm-sep"></span>${esc(d.week.label)} <span class="zm-dots">${dots}</span></div>`;

  // Missionens figur med et "!" ved sit område
  d.tasks.forEach((t) => {
    const p = AREA_ART[t.area];
    if (!p) return;
    const face = t.who.img ? `<img src="${t.who.img}" alt="" draggable="false">` : `<span class="emo">${t.who.emoji}</span>`;
    h += `<button class="m-tap zm-who" data-task="${t.area}" aria-label="${esc(t.who.name)} har en opgave" style="${at(p.who)}">${face}<i class="zm-bang">!</i></button>`;
  });

  // Blade eller sne efter årstiden
  if (S.fall.length) {
    h += `<span class="zm-fall" aria-hidden="true">${Array.from({ length: 9 }, (_, k) => `<i class="${S.name === 'vinter' ? 'snow' : ''}" style="left:${6 + k * 11}%;animation-delay:${-k * 1.4}s;background:${S.fall[k % S.fall.length]}"></i>`).join('')}</span>`;
  }
  return `<div class="zoo-map" role="group" aria-label="Kort over ${esc(d.zooName)}">${h}</div>`;
}
