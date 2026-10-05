// Pensum for 4. klasse – struktureret efter KonteXt+ 4 / Fælles Mål.
// Hvert område har en stige af færdigheder. Hver færdighed har en intro og en generator gen(level)
// der returnerer en opgave:
//   { prompt, visual?, input: 'number'|'fraction'|'choice'|'qr', answer, choices?, unit?, explain, explainVisual? }
// level: 1 = let, 2 = middel, 3 = fuld 4.-klasse-niveau.

import { ri, pick, chance, shuffle, fmt, fmtDec, fmtKr, frac, box, NAMES, gcd, lcm } from './util.js?v=20261005194735';
import * as V from './visuals.js?v=20261005194735';

const pow10 = (p) => 10 ** p;
const PLACE = ['enernes', 'tiernes', 'hundredernes', 'tusindernes', 'titusindernes'];
const PLACE_N = ['enere', 'tiere', 'hundreder', 'tusinder', 'titusinder'];
const digitsOf = (n) => String(n).split('').reverse().map(Number); // index = position

function randDigits(len) {
  return ri(10 ** (len - 1), 10 ** len - 1);
}

// ---------- Zoo-kontekst: én kort linje over det store regnestykke (ca. halvdelen af gangene) ----------
const big = (expr) => `<span class="big-expr">${expr}</span>`;
const withZoo = (line, expr) => (line ? `${line}${big(expr)}` : big(expr));
const ZOO_P = 0.5;

// a × b – n grupper med "per" i hver (små tal)
const timesLine = (a, b) => {
  const [n, per] = a <= b ? [a, b] : [b, a];
  return pick([
    `Zoo-toget har ${n} vogne med ${per} pladser i hver. Hvor mange pladser er der i alt?`,
    `Giraferne spiser ${per} kg blade om dagen. Hvor meget spiser de på ${n} dage?`,
    `En familiebillet koster ${per} kr. Hvad koster ${n} familiebilletter?`,
    `Zoo'en køber ${n} kasser bananer med ${per} bananer i hver. Hvor mange bananer er det?`,
  ]);
};
// Store tal × et lille tal
const bigTimesLine = (per, n) => pick([
  `Elefanterne spiser ${per} kg hø om ugen. Hvor meget spiser de på ${n} uger?`,
  `Der kommer ${per} gæster til sæl-showet hver dag. Hvor mange kommer der på ${n} dage?`,
  `En palle fiskefoder vejer ${per} kg. Hvad vejer ${n} paller?`,
  `Zoo-butikken sælger ${per} postkort om måneden. Hvor mange sælger den på ${n} måneder?`,
]);
// a : d med små tal
const divLine = (a, d) => pick([
  `${a} bananer skal deles ligeligt mellem ${d} aber. Hvor mange får hver abe?`,
  `${a} fisk skal fordeles i ${d} spande med lige mange i hver. Hvor mange fisk kommer der i hver spand?`,
  `${a} gæster deler sig i ${d} lige store grupper til rundvisning. Hvor mange er der i hver gruppe?`,
  `Kaj har ${a} solsikkekerner, som han gemmer i ${d} lige store bunker. Hvor mange er der i hver bunke?`,
]);
// a : d med store tal
const bigDivLine = (a, d) => pick([
  `Nora vil fordele ${a} gulerødder ligeligt i ${d} skåle. Hvor mange kommer der i hver skål?`,
  `Zoo'en har ${a} kg hø, som skal række i ${d} uger. Hvor mange kg kan der bruges pr. uge?`,
  `${a} skolebørn skal fordeles ligeligt på ${d} rundvisninger. Hvor mange kommer med på hver?`,
]);

// Opdel et tal i positioner, fx 347 -> [300, 40, 7] (nuller springes over)
function splitPlaces(n) {
  return digitsOf(n).map((d, p) => d * pow10(p)).reverse().filter((x) => x > 0);
}

// ---------- A. Tal og talsystem ----------

const positionssystem = {
  id: 'positionssystem',
  name: 'Cifrenes værdi',
  desc: 'Hvad et ciffer er værd, alt efter hvor det står',
  intro: {
    scene: 'indgang',
    text: 'Et ciffer er mere værd, jo længere til venstre det står. I 4.732 er 7-tallet <b>700</b> værd, fordi det står på hundredernes plads.',
    lead: 'Hvert ciffer i et billetnummer står på en plads – og pladsen bestemmer, hvor meget cifferet er værd.',
    cards: [
      { title: 'Pladsen bestemmer værdien', visual: () => V.miniPlace('4732', { hi: 1, value: '= 700' }), rules: ['7 på hundredernes plads = 700'], note: 'I 4.732 står 7-tallet på hundredernes plads, så det er 700 værd.' },
      { title: 'Nul holder pladsen', visual: () => V.miniPlace('4032', { hi: 1, value: '0 hundreder' }), rules: ['4.032 = 4.000 + 30 + 2'], note: 'Der er ingen hundreder – men nullet skal stå der, ellers bliver tallet 432.' },
    ],
    tip: {
      title: 'Sådan skiller du et tal ad',
      rows: [
        ['Som plus', '', '4.732 = 4.000 + 700 + 30 + 2'],
        ['Blandet', '', '3 tiere og 2 tusinder = 2.030'],
      ],
    },
  },
  gen(level) {
    const len = level + 2;
    if (chance(0.6)) {
      let n, p, d;
      do {
        n = randDigits(len);
        p = ri(0, len - 1);
        d = digitsOf(n)[p];
      } while (d === 0 || digitsOf(n).filter((x) => x === d).length > 1);
      return {
        prompt: chance(ZOO_P)
          ? `Billetlugen har solgt <b>${fmt(n)}</b> billetter i år. Hvad er cifferet <b>${d}</b> værd i det tal?`
          : `Hvad er cifferet <b>${d}</b> værd i tallet <b>${fmt(n)}</b>?`,
        input: 'number',
        answer: d * pow10(p),
        explain: `${d}-tallet står på ${PLACE[p]} plads, så det er <b>${fmt(d * pow10(p))}</b> værd.`,
        explainVisual: V.placeValue(n),
      };
    }
    const n = randDigits(len);
    const ds = digitsOf(n);
    let parts = ds.map((d, p) => ({ d, p })).reverse();
    if (level === 3) parts = shuffle(parts);
    const txt = parts.map(({ d, p }) => `${d} ${PLACE_N[p]}`);
    const sentence = txt.slice(0, -1).join(', ') + ' og ' + txt[txt.length - 1];
    return {
      prompt: `Skriv tallet: <b>${sentence}</b>`,
      input: 'number',
      answer: n,
      explain: `Sæt hvert ciffer på sin plads: <b>${fmt(n)}</b>.`,
      explainVisual: V.placeValue(n),
    };
  },
};

const afrunding = {
  id: 'afrunding',
  name: 'Afrunding',
  desc: 'Afrund til nærmeste tier, hundrede og tusind',
  intro: {
    scene: 'indgang',
    text: 'Når vi afrunder, finder vi det runde tal, der ligger <b>tættest på</b>. 47 ligger mellem 40 og 50 – tættest på 50. Ligger tallet præcis midt imellem, runder vi <b>op</b>.',
    lead: 'Bodil skriver gæstetallet på tavlen som et rundt tal: det runde tal, der ligger tættest på.',
    cards: [
      { title: 'Tættest på', visual: () => V.miniLine({ min: 40, max: 50, div: 10, label: (i, v) => (i % 10 === 0 ? String(v) : null), marks: [{ v: 47, text: '47', below: true }], jumps: [{ from: 47, to: 40, text: '7', c: 'v-muted', lift: 26 }, { from: 47, to: 50, text: '3', lift: 26 }] }), rules: ['47 ≈ 50'], note: '47 er kun 3 fra 50, men 7 fra 40. Så runder vi til 50.' },
      { title: 'Præcis midt imellem', visual: () => V.miniLine({ min: 40, max: 50, div: 10, label: (i, v) => (i % 10 === 0 ? String(v) : null), marks: [{ v: 45, text: '45', below: true }], jumps: [{ from: 45, to: 50, text: 'op', lift: 26 }] }), rules: ['45 ≈ 50'], note: 'Ligger tallet præcis i midten, runder vi op.' },
      { title: 'Hundreder og tusinder', visual: () => V.miniLine({ min: 300, max: 400, div: 10, label: (i, v) => (i % 10 === 0 ? String(v) : null), marks: [{ v: 362, text: '362', below: true }], jumps: [{ from: 362, to: 300, text: '62', c: 'v-muted', lift: 26 }, { from: 362, to: 400, text: '38', lift: 26 }] }), rules: ['362 ≈ 400', '1.350 ≈ 1.000'], note: 'Det virker på samme måde med hele hundreder og tusinder.' },
    ],
    tip: {
      title: 'Tommelfingerregel',
      rows: [
        ['Kig på cifret efter', '', 'runder du til tiere, så kig på enerne'],
        ['0, 1, 2, 3, 4', 'ned', '43 ≈ 40'],
        ['5, 6, 7, 8, 9', 'op', '45 ≈ 50 · 47 ≈ 50'],
      ],
    },
  },
  gen(level) {
    const step = [10, 100, 1000][level - 1];
    const ranges = [[11, 999], [101, 9999], [1001, 99999]];
    let n;
    do n = ri(...ranges[level - 1]); while (n % step === 0);
    const lo = Math.floor(n / step) * step, hi = lo + step;
    const ans = Math.round(n / step) * step;
    const word = { 10: 'tier', 100: 'hundrede', 1000: 'tusind' }[step];
    const half = n - lo === step / 2;
    return {
      prompt: chance(0.5)
        ? `Afrund <b>${fmt(n)}</b> til nærmeste hele ${word}.`
        : `I år så <b>${fmt(n)}</b> gæster sæl-showet. Bodil vil have tallet afrundet til nærmeste hele ${word}.`,
      input: 'number',
      answer: ans,
      explain: half
        ? `${fmt(n)} ligger præcis midt mellem ${fmt(lo)} og ${fmt(hi)} – så runder vi op til <b>${fmt(hi)}</b>.`
        : `${fmt(n)} ligger mellem ${fmt(lo)} og ${fmt(hi)}. Det er tættest på <b>${fmt(ans)}</b>.`,
      explainVisual: numberLineRound(n, step),
    };
  },
};

function numberLineRound(n, step) {
  const lo = Math.floor(n / step) * step, hi = lo + step;
  return V.numberLine({
    min: lo, max: hi, div: 10,
    labels: (i, v) => (i === 0 || i === 10 || i === 5 ? fmt(v) : null),
    mark: n, markText: fmt(n),
  });
}

const sammenlign = {
  id: 'sammenlign',
  name: 'Sammenlign tal',
  desc: 'Find det største og mindste tal',
  intro: {
    scene: 'flamingoer',
    text: 'Sammenlign cifrene <b>fra venstre</b>. Først tusinderne, så hundrederne, så tierne … Det første sted, hvor de er forskellige, afgør hvilket tal der er størst. 4.<b>7</b>12 er større end 4.<b>2</b>98.',
    lead: 'Hvilken dag kom der flest gæster? Sammenlign tallene ciffer for ciffer.',
    cards: [
      { title: 'Start fra venstre', visual: () => V.miniCompare(['4712', '4298'], { hi: 1, heads: ['1.000', '100', '10', '1'], sym: '>' }), rules: ['4.712 > 4.298'], note: 'Tusinderne er ens. Ved hundrederne er 7 mere end 2 – så er 4.712 størst.' },
      { title: 'Flest cifre', visual: () => V.miniCompare([' 985', '1012'], { hi: 0, heads: ['1.000', '100', '10', '1'], sym: '<' }), rules: ['985 < 1.012'], note: 'Et tal med tusinder er større end et tal uden – selvom 985 har store cifre.' },
    ],
    tip: {
      title: 'Tegnene',
      rows: [
        ['Større end', '', '7 > 2'],
        ['Mindre end', '', '2 < 7'],
        ['Husk', '', 'den åbne side vender mod det største tal'],
      ],
    },
  },
  gen(level) {
    let nums;
    if (level === 1) {
      nums = new Set();
      while (nums.size < 3) nums.add(randDigits(3));
      nums = [...nums];
    } else if (level === 2) {
      // samme fire cifre i forskellig rækkefølge
      let digits;
      do digits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4); while (digits.filter((d) => d > 0).length < 3);
      const set = new Set();
      let guard = 0;
      while (set.size < 4 && guard++ < 200) {
        const p = shuffle(digits);
        if (p[0] !== 0) set.add(Number(p.join('')));
      }
      nums = [...set];
    } else {
      const prefix = ri(10, 99);
      const set = new Set();
      while (set.size < 4) set.add(prefix * 1000 + ri(0, 999));
      nums = [...set];
    }
    const big = chance(0.5);
    const target = big ? Math.max(...nums) : Math.min(...nums);
    const sorted = [...nums].sort((a, b) => b - a).map(fmt).join(' &gt; ');
    return {
      prompt: `Billetlugen har talt gæster på forskellige dage. Hvilket besøgstal er <b>${big ? 'størst' : 'mindst'}</b>?`,
      input: 'choice',
      choices: shuffle(nums).map(fmt),
      answer: fmt(target),
      explain: `Sammenlign fra venstre. Rækkefølgen er: ${sorted}. Så <b>${fmt(target)}</b> er ${big ? 'størst' : 'mindst'}.`,
    };
  },
};

const plusminus = {
  id: 'plusminus',
  name: 'Plus og minus',
  desc: 'Læg sammen og træk fra med store tal',
  intro: {
    scene: 'indgang',
    text: 'Læg <b>hundreder, tiere og enere</b> sammen hver for sig:<br>347 + 285 = (300+200) + (40+80) + (7+5) = 500 + 120 + 12 = <b>632</b>.<br>Ved minus kan du trække fra i bidder: 632 − 285 = 632 − 200 − 80 − 5 = <b>347</b>.',
    lead: 'Kassen skal gøres op: dagens billetsalg lægges sammen og trækkes fra.',
    cards: [
      { title: 'Plus: hver plads for sig', visual: () => V.miniTable({ heads: ['100', '10', '1'], rows: [['300', '40', '7'], ['200', '80', '5']], sum: ['500', '120', '12'], total: '= 632' }), rules: ['347 + 285 = 632'], note: 'Læg hundreder, tiere og enere sammen hver for sig – og så det hele.' },
      { title: 'Minus: træk fra i bidder', visual: () => V.miniChain(['632', '432', '352', '347'], ['−200', '−80', '−5']), rules: ['632 − 285 = 347'], note: '285 er 200 + 80 + 5. Træk én bid fra ad gangen.' },
    ],
    tip: {
      title: 'Tjek dit svar',
      rows: [['Minus → plus', '', '347 + 285 = 632 ✓']],
    },
  },
  gen(level) {
    const ranges = [[15, 89], [120, 899], [1200, 8999]];
    const [lo, hi] = ranges[level - 1];
    let a = ri(lo, hi), b = ri(lo, hi);
    const add = chance(0.5);
    if (!add && a < b) [a, b] = [b, a];
    if (!add && a === b) a += ri(1, 9);
    const ans = add ? a + b : a - b;
    let explain;
    if (add) {
      const pa = digitsOf(a), pb = digitsOf(b);
      const steps = [];
      for (let p = Math.max(pa.length, pb.length) - 1; p >= 0; p--) {
        const x = (pa[p] || 0) * pow10(p), y = (pb[p] || 0) * pow10(p);
        if (x || y) steps.push({ x, y });
      }
      explain = `Læg hver position sammen: ${steps.map((s) => `${fmt(s.x)}+${fmt(s.y)}`).join(', ')} = ${steps.map((s) => fmt(s.x + s.y)).join(' + ')} = <b>${fmt(ans)}</b>.`;
    } else {
      let cur = a;
      const chain = [fmt(a)];
      for (const part of splitPlaces(b)) { cur -= part; chain.push(`− ${fmt(part)} = ${fmt(cur)}`); }
      explain = `Træk fra i bidder: ${chain.join(' ')}. Svaret er <b>${fmt(ans)}</b>.`;
    }
    let prompt = `<span class="big-expr">${fmt(a)} ${add ? '+' : '−'} ${fmt(b)}</span>`;
    if (chance(ZOO_P)) {
      prompt = add
        ? pick([
          `Om formiddagen kom der ${fmt(a)} gæster i zoo'en, og om eftermiddagen kom der ${fmt(b)}. Hvor mange gæster kom der i alt?`,
          `Zoo'en har ${fmt(a)} kg hø på lageret og får leveret ${fmt(b)} kg mere. Hvor meget hø er der nu?`,
        ])
        : pick([
          `Zoo'en har ${fmt(a)} kg foder på lageret. Dyrene spiser ${fmt(b)} kg. Hvor mange kg er der tilbage?`,
          `Der blev solgt ${fmt(a)} billetter i juli og ${fmt(b)} i juni. Hvor mange flere billetter blev der solgt i juli?`,
        ]);
    }
    return { prompt, input: 'number', answer: ans, explain };
  },
};

// ---------- B. Gange ----------

const gange10 = {
  id: 'gange10',
  name: 'Gange med 10, 100 og runde tal',
  desc: '10 × 34, 30 × 7, 40 × 60',
  intro: {
    scene: 'foderlager',
    text: 'Når man ganger med 10, bliver hvert ciffer <b>10 gange mere værd</b> og rykker én plads til venstre. 3 tiere bliver til 3 hundreder, og 4 enere bliver til 4 tiere. Enernes plads bliver tom, så der skriver vi 0: 34 × 10 = <b>340</b>.<br>30 × 7: 30 er 3 tiere. 3 tiere × 7 = 21 tiere = <b>210</b>.',
    lead: 'Foderet pakkes i kasser med 10 og 100. Når man ganger med 10 eller 100, flytter cifrene plads.',
    cards: [
      { title: '× 10', visual: () => V.miniShift('34', '340'), rules: ['34 × 10 = 340'], note: 'Hvert ciffer rykker én plads til venstre og bliver 10 gange mere værd. Der kommer et 0 på enernes plads.' },
      { title: '× 100', visual: () => V.miniShift('34', '3400'), rules: ['34 × 100 = 3.400'], note: "Med 100 rykker cifrene to pladser – og der kommer to 0'er på." },
      { title: 'Runde tal', rules: ['30 × 7 = 210'], note: '30 er 3 tiere. 3 × 7 = 21 – så 3 tiere × 7 er 21 tiere = 210.' },
    ],
  },
  gen(level) {
    let a, b;
    if (level === 1) { a = ri(2, 99); b = pick([10, 100]); }
    else if (level === 2) { a = ri(2, 9) * 10; b = ri(2, 9); }
    else if (chance(0.5)) { a = ri(2, 9) * 100; b = ri(2, 9); }
    else { a = ri(2, 9) * 10; b = ri(2, 9) * 10; }
    const ans = a * b;
    const strip = (x) => { let z = 0; while (x % 10 === 0) { x /= 10; z++; } return [x, z]; };
    const [sa, za] = strip(a), [sb, zb] = strip(b);
    const zeros = za + zb;
    const UNIT = { 1: 'tiere', 2: 'hundreder', 3: 'tusinder' };
    let explain;
    if (level === 1) {
      explain = `Ganger man med ${b}, bliver hvert ciffer ${b} gange mere værd og rykker ${b === 100 ? 'to pladser' : 'én plads'} til venstre: ${a} × ${b} = <b>${fmt(ans)}</b>.`;
    } else if (za && zb) {
      explain = `Regn ${sa} × ${sb} = ${sa * sb}. ${a} er ${sa} ${UNIT[za]} og ${b} er ${sb} ${UNIT[zb]} – tiere gange tiere giver hundreder: ${sa * sb} ${UNIT[zeros]} = <b>${fmt(ans)}</b>.`;
    } else {
      const [big, s, z, other] = za ? [a, sa, za, b] : [b, sb, zb, a];
      explain = `${big} er ${s} ${UNIT[z]}. ${s} ${UNIT[z]} × ${other} = ${s * other} ${UNIT[z]} = <b>${fmt(ans)}</b>.`;
    }
    if (chance(0.5)) [a, b] = [b, a];
    return { prompt: withZoo(chance(ZOO_P) && timesLine(a, b), `${fmt(a)} × ${fmt(b)}`), input: 'number', answer: ans, explain };
  },
};

const gangeflercifret = {
  id: 'gangeflercifret',
  name: 'Gange med flercifrede tal',
  desc: '47 × 6 ved at dele tallet op',
  intro: {
    scene: 'giraffer',
    text: 'Del det store tal op i tiere og enere, og gang hver del for sig:<br>47 × 6 = 40×6 + 7×6 = 240 + 42 = <b>282</b>.',
    lead: 'Giraferne og elefanterne spiser meget. Store gangestykker bliver lette, når du deler tallet op.',
    cards: [
      { title: 'Del tallet op', visual: () => V.miniSplit([40, 7], 6), rules: ['47 × 6 = 282'], note: 'Gang tierne og enerne hver for sig, og læg dem sammen bagefter.' },
      { title: 'Også med hundreder', visual: () => V.miniSplit([200, 30, 6], 4), rules: ['236 × 4 = 944'], note: 'Hundreder, tiere og enere – hver for sig, og så det hele.' },
    ],
    tip: {
      title: 'Lav et overslag',
      rows: [['Passer det?', '', '47 × 6 er lidt under 50 × 6 = 300']],
    },
  },
  gen(level) {
    let a, b;
    if (level === 1) { a = ri(1, 4) * 10 + ri(1, 3); b = ri(2, 3); }
    else if (level === 2) { a = ri(12, 99); b = ri(3, 9); }
    else { a = ri(102, 999); b = ri(3, 9); }
    const parts = splitPlaces(a);
    const ans = a * b;
    return {
      prompt: withZoo(chance(ZOO_P) && bigTimesLine(a, b), `${a} × ${b}`),
      input: 'number',
      answer: ans,
      explain: `Del ${a} op: ${parts.map((p) => `${p}×${b}`).join(' + ')} = ${parts.map((p) => fmt(p * b)).join(' + ')} = <b>${fmt(ans)}</b>.`,
      explainVisual: V.areaSplit(parts, b),
    };
  },
};

const gangetekst = {
  id: 'gangetekst',
  name: 'Tekstopgaver med gange',
  desc: 'Find gangestykket i historien',
  intro: {
    scene: 'foderlager',
    text: 'Kig efter <b>lige store grupper</b>: "5 poser med 8 i hver" er 5 × 8. Spørg dig selv: hvor mange grupper, og hvor mange i hver?',
    lead: 'Historien gemmer på et gangestykke. Find de lige store grupper.',
    cards: [
      { title: 'Lige store grupper', visual: () => V.miniGroups({ groups: 5, per: 8 }), rules: ['5 poser med 8 i hver = 5 × 8 = 40'], note: 'Der er 5 grupper, og der er 8 i hver gruppe.' },
      { title: 'Gange så mange', visual: () => V.miniGroups({ groups: 3, per: 4, label: '3 × 4 = 12' }), rules: ['3 gange så mange som 4 = 12'], note: 'Giraffen spiser 4 kg. Elefanten spiser 3 gange så meget: 12 kg.' },
    ],
    tip: {
      title: 'Sådan finder du gangestykket',
      rows: [
        ['Kig efter', '', '"i hver", "hver" og "gange så mange"'],
        ['Spørg', '', 'Hvor mange grupper – og hvor mange i hver?'],
      ],
    },
  },
  gen(level) {
    let a, b;
    if (level === 1) { a = ri(2, 10); b = ri(2, 10); }
    else if (level === 2) { a = ri(11, 30); b = ri(3, 9); }
    else { a = ri(12, 99); b = ri(4, 9); }
    if (level === 3 && chance(0.5)) {
      let price, n;
      do { price = ri(12, 95); n = ri(3, 9); } while (price * n >= 500);
      const change = 500 - price * n;
      return {
        prompt: `En familie køber ${n} billetter til zoo'en til ${price} kr. stykket og betaler med en 500-kr.-seddel. Hvor mange penge får de tilbage?`,
        input: 'number', answer: change, unit: 'kr.',
        explain: `Først prisen: ${n} × ${price} = ${price * n} kr. Så pengene tilbage: 500 − ${price * n} = <b>${change} kr.</b>`,
      };
    }
    const stories = [
      [`Hver af de ${b} giraffer spiser ${a} kg blade om dagen. Hvor mange kg blade skal der bestilles?`, 'kg'],
      [`En børnebillet til zoo'en koster ${a} kr. Hvad koster ${b} børnebilletter?`, 'kr.'],
      [`Der er ${b} pingviner, og hver får ${a} fisk. Hvor mange fisk skal der bruges?`, 'fisk'],
      [`Aberne spiser ${a} bananer om dagen. Hvor mange bananer spiser de på ${b} dage?`, 'bananer'],
      [`Ved sæl-showet er der ${b} rækker med ${a} pladser i hver. Hvor mange pladser er der?`, 'pladser'],
    ];
    const [prompt, unit] = pick(stories);
    return {
      prompt, input: 'number', answer: a * b, unit,
      explain: `Det er ${b} grupper med ${a} i hver: ${b} × ${a} = <b>${fmt(a * b)}</b> ${unit}.`,
    };
  },
};

// ---------- C. Division ----------

const divtabel = {
  id: 'divtabel',
  name: 'Division med tabellerne',
  desc: '56 : 7 – gange baglæns',
  intro: {
    pic: 'bananer',
    text: 'Division er gange baglæns. For at regne 24 : 6 spørger du: <b>6 gange hvad giver 24?</b> 6 × 4 = 24, så 24 : 6 = <b>4</b>.',
    lead: 'Bananerne skal deles helt lige mellem aberne. Division er gange baglæns.',
    cards: [
      { title: 'Del lige ud', visual: () => V.miniGroups({ groups: 6, per: 4, label: '24 : 6 = 4' }), rules: ['24 : 6 = 4'], note: '24 bananer til 6 aber: hver abe får 4.' },
      { title: 'Gange baglæns', visual: () => V.miniBack('× 6', ': 6', 24, 4), rules: ['6 × 4 = 24', 'så 24 : 6 = 4'], note: 'Spørg dig selv: 6 gange hvad giver 24?' },
    ],
  },
  gen(level) {
    const d = pick([[2, 5, 10], [3, 4, 2, 5], [6, 7, 8, 9]][level - 1]);
    const q = ri(level === 1 ? 2 : 3, 10), a = d * q;
    return {
      prompt: withZoo(chance(ZOO_P) && divLine(a, d), `${a} : ${d}`),
      input: 'number', answer: q,
      explain: `Tænk: ${d} × ? = ${a}. Da ${d} × ${q} = ${a}, er ${a} : ${d} = <b>${q}</b>.`,
      explainVisual: a <= 60 ? V.groups(a, d) : null,
    };
  },
};

const divrest = {
  id: 'divrest',
  name: 'Division med rest',
  desc: '23 : 4 = 5 rest 3',
  intro: {
    pic: 'fisk',
    text: 'Nogle gange går det ikke op. 23 : 4: Hvor mange hele 4-taller er der i 23? 4 × 5 = 20, og så er der <b>3 tilbage</b>. Svaret er <b>5 rest 3</b>.<br>Resten skal altid være mindre end det, man deler med.',
    lead: 'Nogle gange går delingen ikke op. Det, der bliver til overs, er resten – og den får Kaj!',
    cards: [
      { title: 'Det, der er tilbage', visual: () => V.miniGroups({ groups: 5, per: 4, rest: 3 }), rules: ['23 : 4 = 5 rest 3'], note: "Hvor mange hele 4'ere er der i 23? Der er 5 (det er 20), og 3 er tilbage." },
      { title: 'Hop med 4', visual: () => V.miniLine({ min: 0, max: 24, div: 6, label: (i, v) => (v <= 20 ? String(v) : null), marks: [{ v: 23, text: '23', below: true }], jumps: [0, 4, 8, 12, 16].map((a) => ({ from: a, to: a + 4, text: '', lift: 18 })).concat([{ from: 20, to: 23, text: '3', c: 'v-muted', lift: 16 }]) }), rules: ['5 hop = 20', '23 − 20 = 3'], note: 'Hop 4 ad gangen, så langt du kan. Det, der mangler op til 23, er resten.' },
      { title: 'Resten er altid mindst', rules: ['rest < det, man deler med'], note: 'Deler du med 4, kan resten kun være 0, 1, 2 eller 3. Er der 4 tilbage, kan der laves en gruppe mere.' },
    ],
  },
  gen(level) {
    const [dr, qr] = [[[2, 5], [2, 6]], [[3, 6], [3, 9]], [[6, 9], [4, 10]]][level - 1];
    const d = ri(...dr), q = ri(...qr), r = ri(1, d - 1), a = d * q + r;
    return {
      prompt: withZoo(chance(ZOO_P) && pick([
        `${a} fisk deles ligeligt mellem ${d} pingviner. Hvor mange får hver – og hvor mange er der tilbage til Kaj?`,
        `${a} gulerødder fordeles i ${d} skåle med lige mange i hver. Hvor mange kommer der i hver skål, og hvor mange bliver tilbage?`,
      ]), `${a} : ${d}`),
      input: 'qr', answer: [q, r],
      explain: `${d} × ${q} = ${d * q}. Der er ${a} − ${d * q} = ${r} tilbage. Så ${a} : ${d} = <b>${q} rest ${r}</b>.`,
    };
  },
};

const divflercifret = {
  id: 'divflercifret',
  name: 'Division med store tal',
  desc: '84 : 4, 456 : 3',
  intro: {
    pic: 'vaegt',
    text: 'Del tallet op i bidder, der er lette at dele:<br>72 : 4 → 72 = 40 + 32. 40 : 4 = 10 og 32 : 4 = 8. I alt <b>18</b>.',
    lead: 'Store tal deles lettest i bidder, som er nemme at dele.',
    cards: [
      { title: 'Del i lette bidder', visual: () => V.miniSplitTree(72, [40, 32], 4), rules: ['72 : 4 = 18'], note: '40 : 4 = 10 og 32 : 4 = 8. Tilsammen 18.' },
      { title: 'Store tal', visual: () => V.miniSplitTree(156, [120, 36], 3), rules: ['156 : 3 = 52'], note: '120 : 3 = 40 og 36 : 3 = 12. Tilsammen 52.' },
    ],
    tip: {
      title: 'Tjek dit svar',
      rows: [['Gang tilbage', '', '18 × 4 = 72 ✓']],
    },
  },
  gen(level) {
    let d, q;
    if (level === 1) {
      d = ri(2, 4);
      const t = ri(1, Math.floor(9 / d)), o = ri(1, Math.floor(9 / d));
      q = t * 10 + o;
    } else if (level === 2) {
      d = ri(3, 6); q = ri(11, Math.floor(99 / d));
    } else {
      d = ri(3, 9); q = ri(Math.max(20, Math.ceil(100 / d)), Math.floor(999 / d));
    }
    const a = d * q;
    const big = d * 10 * Math.floor(q / 10), rest = a - big;
    const explain = rest === 0
      ? `${a} : ${d} = <b>${q}</b>, fordi ${d} × ${q} = ${a}.`
      : `Del op: ${a} = ${big} + ${rest}. ${big} : ${d} = ${big / d} og ${rest} : ${d} = ${rest / d}. I alt <b>${q}</b>.`;
    return { prompt: withZoo(chance(ZOO_P) && bigDivLine(a, d), `${a} : ${d}`), input: 'number', answer: q, explain };
  },
};

const divtekst = {
  id: 'divtekst',
  name: 'Tekstopgaver med division',
  desc: 'Del ligeligt og lav grupper',
  intro: {
    pic: 'bananer',
    text: 'Division bruges når noget skal <b>deles ligeligt</b> eller <b>deles i grupper</b>. Pas på med resten: Skal 25 personer køre i biler med 4 pladser, skal der bruges <b>7</b> biler – ellers er der én, der ikke kommer med!',
    lead: 'Division bruges, når noget skal deles ligeligt – eller deles i grupper.',
    cards: [
      { title: 'Del ligeligt', visual: () => V.miniGroups({ groups: 3, per: 5 }), rules: ['15 : 3 = 5'], note: '15 bananer deles mellem 3 aber: 5 til hver.' },
      { title: 'Del i grupper', visual: () => V.miniGroups({ groups: 6, per: 4 }), rules: ['24 : 4 = 6'], note: '24 børn i grupper med 4 i hver: 6 grupper.' },
      { title: 'Pas på resten', visual: () => V.miniGroups({ groups: 7, per: 4, filled: 25 }), rules: ['25 : 4 = 6 rest 1 → 7 vogne'], note: 'Alle 25 gæster skal med zoo-toget, så der skal bruges 7 vogne.' },
    ],
    tip: {
      title: 'Hvad spørger de om?',
      rows: [
        ['Hvor mange til hver?', '', 'del ligeligt'],
        ['Hvor mange grupper?', '', 'del i grupper'],
        ['Alle skal med', '', 'resten kræver en ekstra'],
        ['Hvor mange tilbage?', '', 'svaret er resten'],
      ],
    },
  },
  gen(level) {
    if (level === 1) {
      const d = ri(2, 6), q = ri(2, 10), a = d * q;
      return {
        prompt: `${a} bananer skal deles ligeligt mellem ${d} aber. Hvor mange bananer får hver abe?`,
        input: 'number', answer: q, unit: 'bananer',
        explain: `${a} : ${d} = <b>${q}</b>, fordi ${d} × ${q} = ${a}.`,
      };
    }
    if (level === 2) {
      const d = ri(3, 9), q = ri(3, 10), a = d * q;
      return {
        prompt: `${a} børn på skoletur i zoo'en skal deles i grupper med ${d} i hver. Hvor mange grupper bliver der?`,
        input: 'number', answer: q, unit: 'grupper',
        explain: `${a} : ${d} = <b>${q}</b> grupper.`,
      };
    }
    const d = ri(3, 8), q = ri(3, 9), r = ri(1, d - 1), a = d * q + r;
    if (chance(0.5)) {
      return {
        prompt: `${a} gæster skal køre med zoo-toget. Hver vogn har plads til ${d}. Hvor mange vogne skal der <b>mindst</b> bruges?`,
        input: 'number', answer: q + 1, unit: 'vogne',
        explain: `${a} : ${d} = ${q} rest ${r}. ${q} vogne er fyldt, men ${r} ${r === 1 ? 'gæst' : 'gæster'} mangler plads – så der skal bruges <b>${q + 1}</b> vogne.`,
      };
    }
    return {
      prompt: `${a} fisk skal fordeles i spande med ${d} i hver. Hvor mange fisk er der tilbage, når alle fyldte spande er klar? (Kaj får resten!)`,
      input: 'number', answer: r, unit: 'fisk',
      explain: `${a} : ${d} = ${q} rest ${r}. Der bliver <b>${r}</b> fisk tilbage – til Kaj.`,
    };
  },
};

// ---------- D. Brøker ----------

const brokfigur = {
  id: 'brokfigur',
  name: 'Brøker i figurer',
  desc: 'Hvor stor en del er farvet?',
  intro: {
    scene: 'polar',
    text: `En brøk fortæller, hvor mange dele ud af en helhed. <b>Nævneren</b> (nederst) er hvor mange lige store dele, helheden er delt i. <b>Tælleren</b> (øverst) er hvor mange dele vi taler om. Her er ${frac(3, 4)} farvet.`,
    lead: 'En brøk fortæller, hvor meget af en helhed vi taler om.',
    cards: [
      { title: 'Tæller og nævner', visual: () => V.miniFracPie(4, 3), rules: [`${frac(3, 4)} = 3 af 4 dele`], note: 'Nævneren (nederst) er hvor mange dele, isflagen er delt i. Tælleren (øverst) er hvor mange der er farvet.' },
      { title: 'Lige store dele', visual: () => V.miniEqualParts(), rules: [`${frac(1, 4)} = 1 af 4 lige store dele`], note: 'Delene skal være lige store – ellers er det ikke fjerdedele.' },
    ],
  },
  gen(level) {
    const n = pick([[2, 3, 4], [5, 6, 8], [6, 8, 10, 12]][level - 1]);
    const k = ri(1, n - 1);
    const vis = level === 3 || chance(0.5) ? V.fractionBar(n, k) : V.fractionCircle(n, k);
    return {
      prompt: 'Hvor stor en del af figuren er farvet? Skriv som brøk.',
      visual: vis, input: 'fraction', answer: [k, n],
      explain: `Figuren er delt i ${n} lige store dele, og ${k} er farvet. Det er <b>${frac(k, n)}</b>.`,
    };
  },
};

const broktallinje = {
  id: 'broktallinje',
  name: 'Brøker på tallinjen',
  desc: 'Find brøken, pilen peger på',
  intro: {
    scene: 'polar',
    text: `Stykket fra 0 til 1 kan deles i lige store dele. Er det delt i 4, er hvert stykke ${frac(1, 4)}. Pilen står på det 3. stykke – altså ${frac(3, 4)}.`,
    lead: 'Broen fra 0 til 1 er delt i lige store stykker – ligesom en brøk.',
    cards: [
      { title: 'Del broen', visual: () => V.miniLine({ min: 0, max: 1, div: 4, label: (i) => (i === 0 ? '0' : i === 4 ? '1' : [i, 4]), h: 114 }), rules: [`hvert stykke er ${frac(1, 4)}`], note: 'Broen er delt i 4 lige store stykker.' },
      { title: 'Tæl stykkerne', visual: () => V.miniLine({ min: 0, max: 1, div: 4, label: (i) => (i === 0 ? '0' : i === 4 ? '1' : null), jumps: [[0, 0.25], [0.25, 0.5], [0.5, 0.75]].map(([a, b], k) => ({ from: a, to: b, text: String(k + 1), lift: 20 })), marks: [{ v: 0.75, text: ['3', '4'] }], h: 100 }), rules: [`3 stykker = ${frac(3, 4)}`], note: `Pingvinen står efter 3 stykker – altså ${frac(3, 4)} ude på broen.` },
    ],
  },
  gen(level) {
    let n, k, units = 1;
    if (level === 1) { n = pick([2, 3, 4]); k = ri(1, n - 1); }
    else if (level === 2) { n = pick([5, 6, 8, 10]); k = ri(1, n - 1); }
    else { units = 2; n = pick([2, 3, 4]); do k = ri(1, 2 * n - 1); while (k === n); }
    return {
      prompt: 'Hvilken brøk peger pilen på?',
      visual: fracLine(n, k, units), input: 'fraction', answer: [k, n],
      explain: `Hver hele er delt i ${n} lige store dele, så hvert stykke er ${frac(1, n)}. Pilen står ${k} stykker fra 0: <b>${frac(k, n)}</b>${k > n ? ' – det er mere end 1 hel' : ''}.`,
    };
  },
};

function fracLine(n, k, units = 1, markText = '?') {
  return V.numberLine({
    min: 0, max: units, div: n * units,
    labels: (i) => (i % n === 0 ? String(i / n) : null),
    mark: k / n, markText,
  });
}

const broksammenlign = {
  id: 'broksammenlign',
  name: 'Sammenlign brøker',
  desc: 'Hvilken brøk er størst?',
  intro: {
    pic: 'fisk',
    text: `<b>Samme nævner:</b> flest dele vinder – ${frac(3, 5)} &gt; ${frac(2, 5)}.<br><b>Samme tæller:</b> jo flere stykker kagen deles i, jo <i>mindre</i> er hvert stykke – ${frac(1, 3)} &gt; ${frac(1, 6)}.`,
    lead: 'Hvem fik mest fisk? Sådan sammenligner du to brøker.',
    cards: [
      { title: 'Samme nævner', visual: () => V.miniFracBars([{ n: 5, k: 3 }, { n: 5, k: 2 }]), rules: [`${frac(3, 5)} > ${frac(2, 5)}`], note: 'Stykkerne er lige store – så vinder den, der har flest stykker.' },
      { title: 'Samme tæller', visual: () => V.miniFracBars([{ n: 3, k: 1 }, { n: 6, k: 1 }]), rules: [`${frac(1, 3)} > ${frac(1, 6)}`], note: 'Jo flere stykker fisken deles i, jo mindre bliver hvert stykke.' },
    ],
  },
  gen(level) {
    let a, b, c, d;
    if (level === 1) {
      b = d = ri(3, 10);
      a = ri(1, b - 1); do c = ri(1, d - 1); while (c === a);
    } else if (level === 2) {
      a = c = ri(1, 3);
      b = ri(a + 1, 10); do d = ri(a + 1, 10); while (d === b);
    } else if (chance(0.35)) {
      b = ri(2, 5); a = ri(1, b - 1); const m = ri(2, 3); c = a * m; d = b * m;
      if (chance(0.5)) [a, b, c, d] = [c, d, a, b];
    } else {
      do { b = ri(2, 8); d = ri(2, 8); a = ri(1, b - 1); c = ri(1, d - 1); }
      while (b === d || a * d === b * c || lcm(b, d) > 24);
    }
    const sign = a * d > c * b ? '>' : a * d < c * b ? '<' : '=';
    let explain;
    if (b === d) explain = `Samme nævner – den med flest dele er størst: ${frac(a, b)} <b>${sign}</b> ${frac(c, d)}.`;
    else if (a === c) explain = `Samme tæller – jo mindre nævner, jo større stykker: ${frac(a, b)} <b>${sign}</b> ${frac(c, d)}.`;
    else {
      const l = lcm(b, d);
      explain = `Gør nævnerne ens: ${frac(a, b)} = ${frac((a * l) / b, l)} og ${frac(c, d)} = ${frac((c * l) / d, l)}. Så ${frac(a, b)} <b>${sign}</b> ${frac(c, d)}.`;
    }
    const bars = V.fractionBars([{ n: b, k: a, label: frac(a, b) }, { n: d, k: c, label: frac(c, d) }]);
    return {
      prompt: `Hvilket tegn skal stå mellem ${frac(a, b)} og ${frac(c, d)}?`,
      visual: level < 3 ? bars : null,
      input: 'choice', choices: ['<', '=', '>'], answer: sign,
      explain, explainVisual: level === 3 ? bars : null,
    };
  },
};

const brokafantal = {
  id: 'brokafantal',
  name: 'Brøkdel af et antal',
  desc: '¾ af 20',
  intro: {
    pic: 'fisk',
    text: `${frac(3, 4)} af 20: Del 20 i <b>4</b> lige store grupper (5 i hver). Tag <b>3</b> af grupperne: 3 × 5 = <b>15</b>.`,
    lead: `Hvor mange fisk er ${frac(3, 4)} af spanden? Del først – og gang så.`,
    cards: [
      { title: 'Del i grupper', visual: () => V.miniGroups({ groups: 4, per: 5, hl: 3 }), rules: [`${frac(3, 4)} af 20 = 15`], note: 'Del de 20 fisk i 4 lige store grupper med 5 i hver. Tag 3 af grupperne.' },
      { title: 'To trin', visual: () => V.miniChain(['20', '5', '15'], [': 4', '× 3']), rules: ['20 : 4 = 5', '5 × 3 = 15'], note: 'Del med nævneren, og gang med tælleren.' },
    ],
  },
  gen(level) {
    let n, k, total;
    if (level === 1) { n = pick([2, 3, 4, 5, 10]); k = 1; total = n * ri(2, 6); }
    else {
      n = pick([3, 4, 5, 6, 8, 10]);
      do k = ri(2, n - 1); while (gcd(k, n) !== 1); // kun uforkortelige brøker, fx ¾ ikke 6/8
      total = n * ri(2, level === 2 ? 6 : 9);
    }
    const g = total / n, ans = k * g;
    const prompt = level === 3
      ? pick([
        `Pingvinerne får ${total} fisk. ${frac(k, n)} af fiskene er sild. Hvor mange sild er der?`,
        `Der er ${total} dyr i børnezoo'en. ${frac(k, n)} af dem er geder. Hvor mange geder er der?`,
      ])
      : `Hvad er ${frac(k, n)} af ${total}?`;
    return {
      prompt, input: 'number', answer: ans,
      explain: `Del ${total} i ${n} lige store grupper: ${total} : ${n} = ${g}.${k > 1 ? ` Tag ${k} grupper: ${k} × ${g} = <b>${ans}</b>.` : ` Svaret er <b>${ans}</b>.`}`,
      explainVisual: total <= 48 ? V.groups(total, n, k) : null,
    };
  },
};

const ligevaerdig = {
  id: 'ligevaerdig',
  name: 'Ligeværdige brøker',
  desc: '½ = ?/6',
  intro: {
    scene: 'polar',
    text: `${frac(1, 2)} og ${frac(3, 6)} er lige store! Gang (eller del) tæller og nævner med <b>det samme tal</b>, så får du en brøk med samme værdi: ${frac(1, 2)} = ${frac('1×3', '2×3')} = ${frac(3, 6)}.`,
    lead: 'To brøker kan se forskellige ud og alligevel være lige store.',
    cards: [
      { title: 'Samme portion', visual: () => V.miniFracBars([{ n: 2, k: 1 }, { n: 6, k: 3 }]), rules: [`${frac(1, 2)} = ${frac(3, 6)}`], note: 'Halvdelen af spanden er det samme som 3 af 6 dele.' },
      { title: 'Gang oppe og nede', visual: () => V.miniFracScale(1, 2, 3), rules: [`${frac(1, 2)} = ${frac(2, 4)} = ${frac(3, 6)}`], note: 'Gang tæller og nævner med det samme tal – så er brøken lige så stor.' },
    ],
    tip: {
      title: 'Det virker også baglæns',
      rows: [['Del', '', `${frac(6, 8)} = ${frac(3, 4)} (del begge med 2)`]],
    },
  },
  gen(level) {
    let a, b, m;
    if (level === 1) { a = 1; b = 2; m = ri(2, 6); }
    else { b = pick([3, 4, 5]); a = ri(1, b - 1); m = ri(2, 5); }
    const A = a * m, B = b * m;
    const bars = V.fractionBars([{ n: b, k: a, label: frac(a, b) }, { n: B, k: A, label: frac(A, B) }]);
    if (level < 3) {
      const askTop = chance(0.6);
      const how = askTop
        ? `Nævneren er ganget med ${m} (${b} × ${m} = ${B}), så tælleren skal også ganges med ${m}: ${a} × ${m} = <b>${A}</b>.`
        : `Tælleren er ganget med ${m} (${a} × ${m} = ${A}), så nævneren skal også ganges med ${m}: ${b} × ${m} = <b>${B}</b>.`;
      return {
        prompt: `Hvilket tal mangler? ${frac(a, b)} = ${askTop ? frac(box(), B) : frac(A, box())}`,
        input: 'number', answer: askTop ? A : B,
        explain: `${how} Altså ${frac(a, b)} = ${frac(A, B)}.`,
        explainVisual: bars,
      };
    }
    const askTop = chance(0.5);
    return {
      prompt: `Forkort brøken. ${frac(A, B)} = ${askTop ? frac(box(), b) : frac(a, box())}`,
      input: 'number', answer: askTop ? a : b,
      explain: `Del tæller og nævner med ${m}: ${A} : ${m} = ${a} og ${B} : ${m} = ${b}. Altså ${frac(A, B)} = ${frac(a, b)}.`,
      explainVisual: bars,
    };
  },
};

// ---------- E. Decimaltal ----------

const decfigur = {
  id: 'decfigur',
  name: 'Tiendedele og hundrededele',
  desc: 'Decimaltal i figurer',
  intro: {
    pic: 'rumfang',
    text: 'Deler vi 1 hel i 10 dele, er hver del en <b>tiendedel</b> = 0,1. Deler vi i 100 dele, er hver del en <b>hundrededel</b> = 0,01. Her er 3 af 10 farvet: <b>0,3</b>.',
    lead: 'Medicinen skal måles helt præcist – i tiendedele og hundrededele.',
    cards: [
      { title: 'Tiendedele', visual: () => V.miniTenths(3), rules: [`${frac(1, 10)} = 0,1`], note: '1 hel delt i 10 lige store dele: hver del er 0,1.' },
      { title: 'Hundrededele', visual: () => V.hundredGrid(7), rules: [`${frac(1, 100)} = 0,01`], note: 'Delt i 100 dele er hver lille del 0,01. Her er 7 farvet: 0,07.' },
    ],
    tip: {
      title: 'Pladserne efter kommaet',
      rows: [
        ['0,3', '', '3 tiendedele'],
        ['0,07', '', '7 hundrededele'],
        ['0,37', '', '3 tiendedele og 7 hundrededele'],
      ],
    },
  },
  gen(level) {
    if (level === 1) {
      const k = ri(1, 9);
      return {
        prompt: 'Kvadratet er 1 hel. Hvor meget er farvet? Skriv som decimaltal.',
        visual: V.tenBars(k), input: 'number', answer: k / 10,
        explain: `Hver søjle er 0,1. ${k} søjler er <b>${fmtDec(k / 10, 1)}</b>.`,
      };
    }
    if (level === 2) {
      let k; do k = ri(3, 97); while (k % 10 === 0);
      return {
        prompt: 'Kvadratet er 1 hel. Hvor meget er farvet? Skriv som decimaltal.',
        visual: V.hundredGrid(k), input: 'number', answer: k / 100,
        explain: `Hvert lille felt er 0,01. Der er ${Math.floor(k / 10)} hele søjler (${fmtDec(Math.floor(k / 10) / 10, 1)}) og ${k % 10} felter mere – i alt ${k} hundrededele = <b>${fmtDec(k / 100, 2)}</b>.`,
      };
    }
    const w = ri(1, 2), k = ri(1, 9);
    return {
      prompt: 'Hvert kvadrat er 1 hel. Hvor meget er farvet i alt? Skriv som decimaltal.',
      visual: V.tenBars(k, w), input: 'number', answer: w + k / 10,
      explain: `${w} ${w === 1 ? 'helt kvadrat' : 'hele kvadrater'} og ${k} tiendedele: <b>${fmtDec(w + k / 10, 1)}</b>.`,
    };
  },
};

const dectallinje = {
  id: 'dectallinje',
  name: 'Decimaltal på tallinjen',
  desc: 'Find tallet, pilen peger på',
  intro: {
    pic: 'vaegt',
    text: 'Mellem 0 og 1 er der 10 små stykker på 0,1. Pilen står på det 7. stykke: <b>0,7</b>.',
    lead: 'Vægten er en tallinje. Mellem to hele tal er der 10 små stykker.',
    cards: [
      { title: 'Mellem 0 og 1', visual: () => V.miniLine({ min: 0, max: 1, div: 10, label: (i) => (i === 0 ? '0' : i === 10 ? '1' : i === 5 ? '0,5' : null), marks: [{ v: 0.7, text: '0,7' }] }), rules: ['hvert lille stykke = 0,1'], note: 'Pilen står 7 små stykker fra 0: 0,7.' },
      { title: 'Mellem to hele tal', visual: () => V.miniLine({ min: 2, max: 3, div: 10, label: (i) => (i === 0 ? '2' : i === 10 ? '3' : null), marks: [{ v: 2.4, text: '2,4' }] }), rules: ['2,4 = 2 hele og 4 tiendedele'], note: 'Det virker på samme måde mellem 2 og 3.' },
      { title: 'Zoom ind', visual: () => V.miniLine({ min: 2.3, max: 2.4, div: 10, label: (i) => (i === 0 ? '2,3' : i === 10 ? '2,4' : null), marks: [{ v: 2.36, text: '2,36' }] }), rules: ['hvert lille stykke = 0,01'], note: 'Mellem 2,3 og 2,4 er der igen 10 små stykker – nu på 0,01.' },
    ],
  },
  gen(level) {
    if (level === 1) {
      const k = ri(1, 9);
      return {
        prompt: 'Hvilket decimaltal peger pilen på?',
        visual: V.numberLine({ min: 0, max: 1, div: 10, labels: (i) => (i === 0 ? '0' : i === 10 ? '1' : i === 5 ? '0,5' : null), mark: k / 10 }),
        input: 'number', answer: k / 10,
        explain: `Hvert lille stykke er 0,1. Pilen står ${k} stykker fra 0: <b>${fmtDec(k / 10, 1)}</b>.`,
      };
    }
    if (level === 2) {
      let k; do k = ri(1, 29); while (k % 10 === 0);
      return {
        prompt: 'Hvilket decimaltal peger pilen på?',
        visual: V.numberLine({ min: 0, max: 3, div: 30, minorEvery: 10, labels: (i) => (i % 10 === 0 ? String(i / 10) : null), mark: k / 10 }),
        input: 'number', answer: k / 10,
        explain: `Mellem hvert helt tal er der 10 stykker på 0,1. Pilen står ved ${Math.floor(k / 10)} og ${k % 10} tiendedele: <b>${fmtDec(k / 10, 1)}</b>.`,
      };
    }
    const base = ri(10, 49); // i tiendedele, fx 23 = 2,3
    const h = ri(1, 9);
    const lo = base / 10;
    const val = (base * 10 + h) / 100;
    return {
      prompt: 'Hvilket decimaltal peger pilen på?',
      visual: V.numberLine({ min: lo, max: lo + 0.1, div: 10, labels: (i) => (i === 0 ? fmtDec(lo, 1) : i === 10 ? fmtDec(lo + 0.1, 1) : null), mark: val }),
      input: 'number', answer: val,
      explain: `Stykket fra ${fmtDec(lo, 1)} til ${fmtDec(lo + 0.1, 1)} er delt i 10 hundrededele (0,01). Pilen står ${h} stykker efter ${fmtDec(lo, 1)}: <b>${fmtDec(val, 2)}</b>.`,
    };
  },
};

const decsammenlign = {
  id: 'decsammenlign',
  name: 'Sammenlign decimaltal',
  desc: 'Er 0,5 eller 0,45 størst?',
  intro: {
    pic: 'klinik',
    text: 'Pas på: <b>flere cifre betyder ikke større!</b> 0,5 er større end 0,45. Tip: skriv dem med lige mange decimaler – 0,<b>50</b> og 0,<b>45</b> – så kan du sammenligne som hele tal.',
    lead: 'Hvilken unge vejer mest? Pas på – flere cifre betyder ikke større.',
    cards: [
      { title: 'Flere cifre er ikke større', visual: () => V.miniDecBars([{ v: 0.5, label: '0,5' }, { v: 0.45, label: '0,45' }]), rules: ['0,5 > 0,45'], note: '0,5 er 5 tiendedele. 0,45 er kun 4 tiendedele og lidt mere.' },
      { title: 'Gør dem lige lange', visual: () => V.miniCompare(['0,50', '0,45'], { hi: 2, added: [[0, 3]] }), rules: ['0,50 > 0,45'], note: 'Sæt et 0 på, så de har lige mange decimaler. Så kan du sammenligne som 50 og 45.' },
    ],
    tip: {
      title: 'Hele tal først',
      rows: [
        ['Først', '', 'de hele: 2,1 > 1,95, fordi 2 > 1'],
        ['Så', '', 'tiendedelene – og så hundrededelene'],
      ],
    },
  },
  gen(level) {
    const vals = new Set();
    let w = 0;
    if (level === 3) w = ri(1, 9);
    while (vals.size < (level === 1 ? 3 : 4)) {
      let hund;
      if (level === 1) hund = ri(1, 9) * 10;
      else hund = chance(0.5) ? ri(1, 9) * 10 : ri(1, 99);
      vals.add(w * 100 + hund);
    }
    // sørg for mindst ét "fælde"-par på niveau 2-3 (kort decimal > lang decimal)
    const list = [...vals];
    const big = chance(0.5);
    const target = big ? Math.max(...list) : Math.min(...list);
    const show = (h) => fmtDec(h / 100, h % 10 === 0 ? 1 : 2);
    const padded = [...list].sort((a, b) => b - a).map((h) => fmtDec(h / 100, 2)).join(' &gt; ');
    return {
      prompt: `Yasmin har vejet nogle dyreunger (i kg). Hvilken vægt er <b>${big ? 'størst' : 'mindst'}</b>?`,
      input: 'choice', choices: shuffle(list).map(show), answer: show(target),
      explain: `Skriv dem med to decimaler og sammenlign: ${padded}. Så <b>${show(target)}</b> er ${big ? 'størst' : 'mindst'}.`,
    };
  },
};

const decplusminus = {
  id: 'decplusminus',
  name: 'Regn med decimaltal',
  desc: 'Plus og minus – også med penge',
  intro: {
    pic: 'klinik',
    text: 'Stil kommaerne under hinanden, og regn som normalt. 0,7 + 0,6 = 13 tiendedele = <b>1,3</b>.<br>Med penge: 12,50 kr. + 7,25 kr. = 19 kr. + 0,75 kr. = <b>19,75 kr.</b>',
    lead: 'Klinikkens tal har komma: kilo, liter og kroner.',
    cards: [
      { title: 'Kommaerne under hinanden', visual: () => V.miniStack(['0,7', '0,6'], '+', '1,3'), rules: ['0,7 + 0,6 = 1,3'], note: '7 tiendedele og 6 tiendedele er 13 tiendedele – det er 1,3.' },
      { title: 'Med penge', visual: () => V.miniStack(['12,50', '7,25'], '+', '19,75'), rules: ['12,50 kr. + 7,25 kr. = 19,75 kr.'], note: 'Kroner for sig og øre for sig.' },
    ],
    tip: {
      title: 'Minus virker på samme måde',
      rows: [['Minus', '', '2,4 − 0,7 = 1,7 (24 − 7 tiendedele = 17 tiendedele)']],
    },
  },
  gen(level) {
    if (level < 3) {
      // i tiendedele
      let a, b, add = chance(0.6);
      do {
        a = ri(1, 5) * 10 + ri(1, 9);
        b = ri(0, 4) * 10 + ri(1, 9);
        if (level === 1) { a = ri(0, 5) * 10 + ri(1, 5); b = ri(0, 4) * 10 + ri(1, 4); }
      } while (
        (level === 1 && add && (a % 10) + (b % 10) >= 10) ||
        (level === 1 && !add && (a % 10) < (b % 10)) ||
        (level === 2 && add && (a % 10) + (b % 10) < 10) ||
        (level === 2 && !add && (a % 10) >= (b % 10)) ||
        (!add && a <= b)
      );
      const ans = add ? a + b : a - b;
      const d = (x) => fmtDec(x / 10, 1);
      const zl = chance(ZOO_P) && (add
        ? `Pingvinungen vejede ${d(a)} kg og har taget ${d(b)} kg på. Hvad vejer den nu?`
        : `Sælungen skal have ${d(a)} liter mælk i dag. Den har drukket ${d(b)} liter. Hvor meget mangler den?`);
      return {
        prompt: withZoo(zl, `${d(a)} ${add ? '+' : '−'} ${d(b)}`),
        input: 'number', answer: ans / 10, unit: zl ? (add ? 'kg' : 'liter') : undefined,
        explain: `Tænk i tiendedele: ${a} ${add ? '+' : '−'} ${b} = ${ans} tiendedele = <b>${d(ans)}</b>.`,
      };
    }
    const a = ri(20, 180) * 25, b = ri(10, 120) * 25; // øre, i hele 25-øre
    const nm = pick(NAMES);
    if (chance(0.5)) {
      return {
        prompt: `${nm} køber et dyrekort til ${fmtKr(a)} og en is til ${fmtKr(b)} i zoo-kiosken. Hvad koster det i alt?`,
        input: 'number', answer: (a + b) / 100, unit: 'kr.',
        explain: `Læg kroner og øre sammen hver for sig, eller stil kommaerne under hinanden: ${fmtKr(a)} + ${fmtKr(b)} = <b>${fmtKr(a + b)}</b>`,
      };
    }
    const pay = Math.ceil((a + 1) / 10000) * 10000;
    return {
      prompt: `${nm} køber en tøjpanda i zoo-butikken til ${fmtKr(a)} og betaler med ${fmt(pay / 100)} kr. Hvor mange penge får ${nm} tilbage?`,
      input: 'number', answer: (pay - a) / 100, unit: 'kr.',
      explain: `${fmt(pay / 100)} kr. − ${fmtKr(a)} = <b>${fmtKr(pay - a)}</b>. Tip: tæl op fra ${fmtKr(a)} til ${fmt(pay / 100)} kr.`,
    };
  },
};

// ---------- F. Geometri og måling ----------

const omkreds = {
  id: 'omkreds',
  name: 'Omkreds',
  desc: 'Hele vejen rundt om en figur',
  intro: {
    pic: 'laengde',
    text: 'Omkredsen er længden <b>hele vejen rundt</b>. Et rektangel på 5 cm × 3 cm har omkreds 5 + 3 + 5 + 3 = <b>16 cm</b>.',
    lead: 'Hegnet skal hele vejen rundt om anlægget. Den længde kaldes omkredsen.',
    cards: [
      { title: 'Hele vejen rundt', visual: () => V.miniRect(5, 3, { perim: true }), rules: ['5 + 3 + 5 + 3 = 16 cm'], note: 'Læg alle siderne sammen.' },
      { title: 'Find den manglende side', visual: () => V.miniRect(6, 4, { perim: true, unit: 'm', top: '? m', below: 'hele vejen rundt: 20 m' }), rules: ['20 − 4 − 4 = 12', '12 : 2 = 6 m'], note: 'Træk de kendte sider fra, og del resten i to.' },
    ],
    tip: {
      title: 'Smart genvej',
      rows: [['Rektangel', '', '(5 + 3) × 2 = 16 – to lange og to korte sider']],
    },
  },
  gen(level) {
    if (level === 3) {
      const w = ri(3, 12), h = ri(2, 9), P = 2 * (w + h);
      return {
        prompt: `Zebraernes anlæg er et rektangel med <b>${P} m</b> hegn hele vejen rundt. Den ene side er ${w} m. Hvor lang er den anden side?`,
        visual: V.rectShape(w, h, { top: `${w} m`, left: '?' }),
        input: 'number', answer: h, unit: 'm',
        explain: `To sider (én af hver) er halvdelen af omkredsen: ${P} : 2 = ${P / 2} m. Så den anden side er ${P / 2} − ${w} = <b>${h} m</b>.`,
      };
    }
    const unit = 'm';
    const [lo, hi] = level === 1 ? [2, 9] : [5, 25];
    const w = ri(lo, hi), h = chance(0.2) ? w : ri(lo, hi);
    const P = 2 * (w + h);
    return {
      prompt: level === 1
        ? `Kaninernes indhegning er ${w === h ? 'et kvadrat' : 'et rektangel'}. Hvad er omkredsen?`
        : `Hvor mange meter hegn skal der bruges hele vejen rundt om ${pick(['lama', 'kamel', 'zebra'])}-anlægget?`,
      visual: V.rectShape(w, h, { unit }),
      input: 'number', answer: P, unit,
      explain: `Læg alle fire sider sammen: ${w} + ${h} + ${w} + ${h} = <b>${P} ${unit}</b>.`,
    };
  },
};

const areal = {
  id: 'areal',
  name: 'Areal',
  desc: 'Hvor stor en flade er',
  intro: {
    scene: 'elefanter',
    text: 'Arealet er hvor mange <b>kvadrater</b> der kan være inde i figuren. Et rektangel på 5 × 3 har 3 rækker med 5 kvadrater: 5 × 3 = <b>15 cm²</b>.',
    lead: 'Hvor stor er indhegningen? Arealet er, hvor mange kvadrater der er plads til.',
    cards: [
      { title: 'Tæl kvadraterne', visual: () => V.miniRect(5, 3, { grid: true, unit: 'm' }), rules: ['5 × 3 = 15 m²'], note: '3 rækker med 5 kvadrater i hver.' },
      { title: 'Sammensatte figurer', visual: () => V.miniLShape(), rules: ['4 + 8 = 12 m²'], note: 'Del figuren i to rektangler, find arealet af hver, og læg dem sammen.' },
    ],
    tip: {
      title: 'Enheden',
      rows: [
        ['m²', '', 'kvadratmeter – et kvadrat på 1 m × 1 m'],
        ['cm²', '', 'kvadratcentimeter – et kvadrat på 1 cm × 1 cm'],
      ],
    },
  },
  gen(level) {
    if (level === 1) {
      const w = ri(2, 8), h = ri(2, 6);
      return {
        prompt: 'Hvert lille kvadrat er 1 m². Hvor stort er arealet af marsvinenes indhegning?',
        visual: V.rectShape(w, h, { grid: true }), input: 'number', answer: w * h, unit: 'm²',
        explain: `Der er ${h} rækker med ${w} kvadrater: ${h} × ${w} = <b>${w * h} m²</b>.`,
      };
    }
    if (level === 2) {
      const w = ri(3, 12), h = ri(2, 9);
      return {
        prompt: 'Hvad er arealet af løvernes anlæg?',
        visual: V.rectShape(w, h, { unit: 'm' }), input: 'number', answer: w * h, unit: 'm²',
        explain: `Areal = længde × bredde = ${w} × ${h} = <b>${w * h} m²</b>.`,
      };
    }
    const W = ri(5, 9), H = ri(4, 8), cw = ri(1, W - 2), ch = ri(1, H - 2);
    const A = W * H - cw * ch;
    return {
      prompt: 'Elefanterne får et nyt anlæg med denne form. Hvad er arealet?',
      visual: V.lShape(W, H, cw, ch), input: 'number', answer: A, unit: 'm²',
      explain: `Del figuren i to rektangler: ${W - cw} × ${H} = ${(W - cw) * H} og ${cw} × ${H - ch} = ${cw * (H - ch)}. I alt ${(W - cw) * H} + ${cw * (H - ch)} = <b>${A} m²</b>.`,
    };
  },
};

// Det konkrete zoo-billede og reglen til hver enhed (bruges i hintet og forklaringen efter et forkert svar)
const UNIT_PIC = { m: 'laengde', km: 'laengde', cm: 'laengde', kg: 'vaegt', l: 'rumfang' };
const UNIT_RULE = { m: '1 m = 100 cm', km: '1 km = 1.000 m', cm: '1 cm = 10 mm', kg: '1 kg = 1.000 g', l: '1 l = 10 dl = 100 cl' };

const enheder = {
  id: 'enheder',
  name: 'Måleenheder',
  desc: 'm og cm, kg og g, l og dl',
  intro: {
    text: '<b>1 m = 100 cm</b> · <b>1 km = 1.000 m</b> · <b>1 cm = 10 mm</b><br><b>1 kg = 1.000 g</b><br><b>1 l = 10 dl = 100 cl</b>',
    lead: 'Foderet til rovdyrene skal måles, vejes og hældes op. Til det bruger man tre slags enheder:',
    cards: [
      { title: 'Længde', pic: 'laengde', rules: ['1 m = 100 cm', '1 km = 1.000 m', '1 cm = 10 mm'], note: 'Girafungen er 2 m høj – det er 200 cm.' },
      { title: 'Vægt', pic: 'vaegt', rules: ['1 kg = 1.000 g'], note: 'Pingvinungen vejer 3 kg – det er 3.000 g.' },
      { title: 'Rumfang', pic: 'rumfang', rules: ['1 l = 10 dl = 100 cl'], note: 'Sælungen drikker 2 l mælk – det er 20 dl.' },
    ],
    tip: {
      title: 'Sådan regner du om',
      rows: [
        ['Stor → lille', 'gang', '4 m = 4 × 100 = 400 cm'],
        ['Lille → stor', 'del', '3.000 g = 3.000 : 1.000 = 3 kg'],
        ['En halv', '', '½ m = 50 cm · ½ kg = 500 g · ½ l = 5 dl'],
      ],
    },
  },
  gen(level) {
    const conv = [
      // [fra, til, faktor] – faktor: 1 fra = faktor til
      ['m', 'cm', 100], ['kg', 'g', 1000], ['l', 'dl', 10], ['km', 'm', 1000], ['cm', 'mm', 10], ['l', 'cl', 100],
    ];
    const pool = level === 1 ? conv.slice(0, 3) : conv;
    const [big, small, f] = pick(pool);
    if (level < 3) {
      const n = ri(2, 9);
      const fwdLine = chance(ZOO_P) && {
        m: `Girafungen er ${n} m høj. Hvor mange centimeter er det?`,
        kg: `Pingvinungen vejer ${n} kg. Hvor mange gram er det?`,
        l: `Sælungen drikker ${n} liter mælk om dagen. Hvor mange ${small} er det?`,
        km: `Zoo-toget kører ${n} km rundt om zoo'en. Hvor mange meter er det?`,
        cm: `Haletudsen er ${n} cm lang. Hvor mange millimeter er det?`,
      }[big];
      if (chance(0.5)) {
        return {
          prompt: withZoo(fwdLine, `${n} ${big} = ${box()} ${small}`),
          input: 'number', pic: UNIT_PIC[big], hint: `<b>${UNIT_RULE[big]}</b>`, answer: n * f, unit: small,
          explain: `1 ${big} = ${fmt(f)} ${small}, så ${n} ${big} = ${n} × ${fmt(f)} = <b>${fmt(n * f)} ${small}</b>.`,
        };
      }
      return {
        prompt: withZoo(chance(ZOO_P) && `Yasmin har målt ${fmt(n * f)} ${small} i klinikken. Hvor mange ${big} er det?`, `${fmt(n * f)} ${small} = ${box()} ${big}`),
        input: 'number', pic: UNIT_PIC[big], hint: `<b>${UNIT_RULE[big]}</b>`, answer: n, unit: big,
        explain: `${fmt(f)} ${small} = 1 ${big}, så ${fmt(n * f)} ${small} = ${fmt(n * f)} : ${fmt(f)} = <b>${n} ${big}</b>.`,
      };
    }
    const kind = ri(0, 2);
    if (kind === 0) {
      const n = ri(1, 5), r = ri(1, f - 1);
      return {
        prompt: `<span class="big-expr">${n} ${big} og ${r} ${small} = ${box()} ${small}</span>`,
        input: 'number', pic: UNIT_PIC[big], hint: `<b>${UNIT_RULE[big]}</b>`, answer: n * f + r, unit: small,
        explain: `${n} ${big} = ${fmt(n * f)} ${small}. Læg ${r} til: <b>${fmt(n * f + r)} ${small}</b>.`,
      };
    }
    if (kind === 1) {
      const n = ri(1, 5);
      return {
        prompt: `<span class="big-expr">${n},5 ${big} = ${box()} ${small}</span>`,
        input: 'number', pic: UNIT_PIC[big], hint: `<b>${UNIT_RULE[big]}</b>`, answer: n * f + f / 2, unit: small,
        explain: `${n} ${big} = ${fmt(n * f)} ${small}, og en halv ${big} = ${fmt(f / 2)} ${small}. I alt <b>${fmt(n * f + f / 2)} ${small}</b>.`,
      };
    }
    const n = ri(1, 9);
    return {
      prompt: `<span class="big-expr">${fmt(n * f + f / 2)} ${small} = ${box()} ${big}</span>`,
      input: 'number', pic: UNIT_PIC[big], hint: `<b>${UNIT_RULE[big]}</b>`, answer: n + 0.5, unit: big,
      explain: `${fmt(n * f)} ${small} = ${n} ${big}, og ${fmt(f / 2)} ${small} er en halv ${big}. Altså <b>${fmtDec(n + 0.5, 1)} ${big}</b>.`,
    };
  },
};

const pad2 = (x) => String(x).padStart(2, '0');
function danishTime(h, m) {
  const next = (h % 12) + 1;
  if (m === 0) return `klokken ${h}`;
  if (m === 15) return `kvart over ${h}`;
  if (m === 30) return `halv ${next}`;
  if (m === 45) return `kvart i ${next}`;
  if (m < 30) return `${m} minutter over ${h}`;
  return `${60 - m} minutter i ${next}`;
}

const klokken = {
  id: 'klokken',
  name: 'Klokken',
  desc: 'Aflæs et analogt ur',
  intro: {
    pic: 'ur',
    text: 'Den <b>lille viser</b> viser timerne. Den <b>store viser</b> viser minutterne – hvert tal på uret er 5 minutter. Her er klokken <b>3:15</b> (kvart over 3). Husk: ved "halv 4" er klokken 3:30!',
    lead: 'Zoo-uret har to visere. Den lille viser timerne, den store minutterne.',
    cards: [
      { title: 'Lille og stor viser', visual: () => V.miniClock(3, 15, 'kvart over 3'), rules: ['hvert tal = 5 minutter'], note: 'Den store viser står på 3: 3 × 5 = 15 minutter.' },
      { title: 'Halv', visual: () => V.miniClock(3, 30, 'halv 4'), rules: ['halv 4 = 3:30'], note: 'Pas på: "halv 4" betyder en halv time FØR 4.' },
    ],
    tip: {
      title: 'Kvart og halv',
      rows: [
        ['kvart over 3', '', '3:15'],
        ['halv 4', '', '3:30'],
        ['kvart i 4', '', '3:45'],
      ],
    },
  },
  gen(level) {
    const ms = [[0, 30], [0, 15, 30, 45], [5, 10, 20, 25, 35, 40, 50, 55, 15, 45]][level - 1];
    const h = ri(1, 12), m = pick(ms);
    const show = (hh, mm) => `${hh}:${pad2(mm)}`;
    const correct = show(h, m);
    const opts = new Set([correct]);
    const cand = [
      [m / 5 === 0 ? 12 : m / 5, (h % 12) * 5], // viserne byttet
      [h === 12 ? 1 : h + 1, m], [h === 1 ? 12 : h - 1, m],
      [h, (m + 30) % 60], [h, (m + 15) % 60], [h, (m + 45) % 60],
    ];
    for (const [hh, mm] of shuffle(cand)) {
      if (opts.size >= 4) break;
      if (hh >= 1 && hh <= 12 && Number.isInteger(hh)) opts.add(show(hh, mm));
    }
    return {
      prompt: 'Hvad viser zoo-uret?',
      visual: V.clock(h, m), input: 'choice', choices: shuffle([...opts]), answer: correct,
      explain: `Den lille viser står ved ${h}${m >= 30 ? ` (på vej mod ${(h % 12) + 1})` : ''}, og den store viser viser ${m} minutter. Klokken er <b>${correct}</b> – ${danishTime(h, m)}.`,
    };
  },
};

const tidsforskel = {
  id: 'tidsforskel',
  name: 'Hvor lang tid?',
  desc: 'Tiden mellem to klokkeslæt',
  intro: {
    pic: 'ur',
    text: 'Tæl op til en hel time først. Fra 13:45 til 14:20:<br>13:45 → 14:00 er <b>15 min</b>. 14:00 → 14:20 er <b>20 min</b>. I alt <b>35 minutter</b>.',
    lead: 'Hvor lang tid er der til næste fodring? Tæl op i to spring.',
    cards: [
      { title: 'Tæl op til hel time', visual: () => V.miniTimeline(['13:45', '14:00', '14:20'], [15, 20]), rules: ['15 + 20 = 35 minutter'], note: 'Fra 13:45 til 14:00 er 15 minutter. Så 20 minutter mere.' },
      { title: 'En time er 60 minutter', rules: ['1 time = 60 min', '½ time = 30 min', '¼ time = 15 min'], note: 'Varer noget 1 time og 10 minutter, er det 60 + 10 = 70 minutter.' },
    ],
  },
  gen(level) {
    let h1, m1, h2, m2;
    if (level === 1) {
      h1 = h2 = ri(8, 20); m1 = ri(0, 7) * 5; m2 = ri(m1 / 5 + 2, 11) * 5;
    } else if (level === 2) {
      h1 = ri(8, 20); h2 = h1 + 1; m1 = ri(6, 11) * 5; m2 = ri(1, 8) * 5;
    } else {
      h1 = ri(8, 18); m1 = ri(1, 11) * 5; h2 = h1 + ri(1, 3); m2 = ri(0, 11) * 5;
    }
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    const t1 = `${pad2(h1)}:${pad2(m1)}`, t2 = `${pad2(h2)}:${pad2(m2)}`;
    const ctx = pick([
      `Sæl-showet starter kl. ${t1} og slutter kl. ${t2}.`,
      `Løvefodringen begynder kl. ${t1} og slutter kl. ${t2}.`,
      `Zoo-toget kører fra indgangen kl. ${t1} og er ved elefanterne kl. ${t2}.`,
    ]);
    let explain;
    if (h1 === h2) explain = `Fra ${m1} til ${m2} minutter: ${m2} − ${m1} = <b>${mins} minutter</b>.`;
    else {
      const first = 60 - m1, full = (h2 - h1 - 1) * 60;
      explain = `${t1} → ${pad2(h1 + 1)}:00 er ${first} min.${full ? ` Så ${h2 - h1 - 1} hel${h2 - h1 - 1 > 1 ? 'e' : ''} time${h2 - h1 - 1 > 1 ? 'r' : ''} = ${full} min.` : ''} ${pad2(h2)}:00 → ${t2} er ${m2} min. I alt <b>${mins} minutter</b>.`;
    }
    return { prompt: `${ctx} Hvor mange minutter varer det?`, input: 'number', answer: mins, unit: 'min.', explain };
  },
};

const vinkler = {
  id: 'vinkler',
  name: 'Vinkler',
  desc: 'Spids, ret, stump eller lige',
  intro: {
    scene: 'giraffer',
    text: 'En <b>ret</b> vinkel er 90° – som hjørnet på et stykke papir. Er vinklen mindre, er den <b>spids</b>. Er den større, er den <b>stump</b>. En <b>lige</b> vinkel er 180° – en helt lige linje.',
    lead: 'Hjørnerne i anlæggene har forskellige vinkler.',
    cards: [
      { title: 'Ret vinkel', visual: () => V.miniAngles([[90, 'ret · 90°']]), rules: ['90°'], note: 'Som hjørnet på et stykke papir.' },
      { title: 'Spids og stump', visual: () => V.miniAngles([[45, 'spids'], [130, 'stump']]), rules: ['spids: under 90°', 'stump: over 90°'], note: 'Mindre end en ret vinkel er spids. Større er stump.' },
      { title: 'Lige vinkel', visual: () => V.miniStraight(), rules: ['180°'], note: 'En helt lige linje – det er to rette vinkler.' },
    ],
  },
  gen(level) {
    const opts = level === 3 ? ['spids', 'ret', 'stump', 'lige'] : ['spids', 'ret', 'stump'];
    const kind = pick(opts);
    const deg = {
      spids: level === 1 ? ri(25, 50) : ri(55, 80),
      ret: 90,
      stump: level === 1 ? ri(130, 160) : ri(100, 125),
      lige: 180,
    }[kind];
    const rot = level === 1 ? 0 : ri(0, 11) * 30;
    return {
      prompt: 'Hvilken slags vinkel er det?',
      visual: V.angle(deg, rot), input: 'choice', choices: opts, answer: kind,
      explain: {
        spids: 'Vinklen er mindre end en ret vinkel (90°), så den er <b>spids</b>.',
        ret: 'Vinklen er præcis som hjørnet på et papir – 90°. Den er <b>ret</b>.',
        stump: 'Vinklen er større end en ret vinkel (90°), men ikke en lige linje. Den er <b>stump</b>.',
        lige: 'De to ben danner en lige linje – 180°. Det er en <b>lige</b> vinkel.',
      }[kind],
    };
  },
};

// ---------- G. Statistik og sandsynlighed ----------

const THEMES = [
  { title: 'Gæsternes yndlingsdyr', cats: ['Løve', 'Panda', 'Giraf', 'Pingvin', 'Abe'], noun: 'gæster' },
  { title: 'Børnenes yndlingsunge i Babyhuset', cats: ['Føl', 'Lam', 'Ælling', 'Kid', 'Kanin'], noun: 'børn' },
  { title: 'Solgte is i zoo-kiosken', cats: ['Man', 'Tirs', 'Ons', 'Tors', 'Fre'], noun: 'is' },
];

const soejle = {
  id: 'soejle',
  name: 'Søjlediagrammer',
  desc: 'Aflæs og regn med diagrammer',
  intro: {
    pic: 'soejle',
    text: 'Et søjlediagram viser tal som søjler. Aflæs højden på tallene ude til venstre. Kig godt efter, <b>hvor meget hver streg er værd</b> – det er ikke altid 1!',
    lead: 'Gæsterne har stemt på deres yndlingsdyr. Søjlediagrammet viser stemmerne.',
    cards: [
      { title: 'Aflæs søjlen', visual: () => V.miniBars([6, 9, 4], ['Panda', 'Koala', 'Ræv'], { step: 2, hi: 1, max: 10 }), rules: ['Koala: 9 stemmer'], note: 'Følg toppen af søjlen hen til tallene ude til venstre. Den står midt mellem 8 og 10 – altså 9.' },
      { title: 'Hvad er hver streg værd?', visual: () => V.miniBars([15, 25, 10], ['Ma', 'Ti', 'On'], { step: 5, hi: 0 }), rules: ['her: hver streg = 5'], note: 'Tallene går i spring på 5 – så søjlen om mandagen er 15 is, ikke 3.' },
    ],
    tip: {
      title: 'Typiske spørgsmål',
      rows: [
        ['Hvor mange flere?', '', 'træk fra: 25 − 15 = 10'],
        ['Hvor mange i alt?', '', 'læg sammen: 15 + 25 + 10 = 50'],
      ],
    },
  },
  gen(level) {
    const th = pick(THEMES);
    const n = level === 1 ? 4 : 5;
    const cats = th.cats.slice(0, n);
    const step = [1, 2, 5][level - 1];
    const maxV = [10, 20, 50][level - 1];
    let vals;
    do vals = cats.map(() => ri(1, maxV / step) * step); while (new Set(vals).size < n - 1);
    const vis = V.barChart(cats, vals, { step, max: maxV, title: th.title });
    const isWeek = th.noun === 'is';
    const q = isWeek ? (c) => `om ${c.toLowerCase()}dagen` : (c) => `${c.toLowerCase()}`;
    if (level === 1) {
      const i = ri(0, n - 1);
      return {
        prompt: isWeek ? `Hvor mange is blev der solgt ${q(cats[i])}?` : `Hvor mange ${th.noun} valgte ${q(cats[i])}?`,
        visual: vis, input: 'number', answer: vals[i],
        explain: `Søjlen for ${cats[i]} går op til <b>${vals[i]}</b>.`,
      };
    }
    if (level === 2) {
      let i, j;
      do { i = ri(0, n - 1); j = ri(0, n - 1); } while (vals[i] <= vals[j]);
      return {
        prompt: isWeek ? `Hvor mange flere is blev der solgt ${q(cats[i])} end ${q(cats[j])}?` : `Hvor mange flere ${th.noun} valgte ${q(cats[i])} end ${q(cats[j])}?`,
        visual: vis, input: 'number', answer: vals[i] - vals[j],
        explain: `${cats[i]}: ${vals[i]}. ${cats[j]}: ${vals[j]}. Forskellen er ${vals[i]} − ${vals[j]} = <b>${vals[i] - vals[j]}</b>.`,
      };
    }
    const total = vals.reduce((s, v) => s + v, 0);
    return {
      prompt: isWeek ? 'Hvor mange is blev der solgt i alt på de fem dage?' : `Hvor mange ${th.noun} er der i alt?`,
      visual: vis, input: 'number', answer: total,
      explain: `Hver streg er ${step} værd. Læg alle søjler sammen: ${vals.join(' + ')} = <b>${total}</b>.`,
    };
  },
};

const typetal = {
  id: 'typetal',
  name: 'Typetal, variationsbredde og median',
  desc: 'Beskriv en række tal',
  intro: {
    scene: 'observation',
    text: '<b>Typetal:</b> det tal, der er flest af.<br><b>Variationsbredde:</b> største tal − mindste tal.<br><b>Median:</b> sæt tallene i rækkefølge – medianen er det midterste.',
    lead: 'Gæsterne har svaret 2, 4, 5, 9 og 9. Tre ord beskriver sådan en række tal.',
    cards: [
      { title: 'Typetal', visual: () => V.miniTiles([2, 4, 5, 9, 9], { hi: [3, 4] }), rules: ['typetal = 9'], note: 'Det tal, der er flest af.' },
      { title: 'Median', visual: () => V.miniTiles([2, 4, 5, 9, 9], { hi: [2], mid: 'midten' }), rules: ['median = 5'], note: 'Sæt tallene i rækkefølge – medianen er det midterste.' },
      { title: 'Variationsbredde', visual: () => V.miniTiles([2, 4, 5, 9, 9], { hi: [0, 4], span: '9 − 2 = 7' }), rules: ['variationsbredde = 7'], note: 'Største tal minus mindste tal.' },
    ],
  },
  gen(level) {
    const ctx = pick(['Antal fisk hver pingvin spiste', 'Antal bananer hver abe fik', 'Antal timer løverne sov hver dag', 'Antal æg i hver af svanernes reder']);
    if (level === 1) {
      const mode = ri(1, 9);
      const list = [mode, mode, mode];
      const others = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x !== mode)).slice(0, ri(2, 3));
      others.forEach((o) => { list.push(o); if (chance(0.5)) list.push(o); });
      const nums = shuffle(list);
      return {
        prompt: `${ctx}: <b>${nums.join(', ')}</b><br>Hvad er <b>typetallet</b>?`,
        input: 'number', answer: mode,
        explain: `Typetallet er det tal, der optræder flest gange. ${mode} optræder 3 gange: <b>${mode}</b>.`,
      };
    }
    const len = level === 2 ? ri(6, 8) : pick([5, 7, 9]);
    const nums = Array.from({ length: len }, () => ri(1, 20));
    if (level === 2) {
      const mx = Math.max(...nums), mn = Math.min(...nums);
      return {
        prompt: `${ctx}: <b>${nums.join(', ')}</b><br>Hvad er <b>variationsbredden</b>?`,
        input: 'number', answer: mx - mn,
        explain: `Største tal er ${mx}, mindste er ${mn}. Variationsbredden er ${mx} − ${mn} = <b>${mx - mn}</b>.`,
      };
    }
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = sorted[(len - 1) / 2];
    return {
      prompt: `${ctx}: <b>${nums.join(', ')}</b><br>Hvad er <b>medianen</b>?`,
      input: 'number', answer: mid,
      explain: `Sæt i rækkefølge: ${sorted.map((x, i) => (i === (len - 1) / 2 ? `<b><u>${x}</u></b>` : x)).join(', ')}. Det midterste tal er <b>${mid}</b>.`,
    };
  },
};

const COLORS = ['rød', 'blå', 'grøn', 'gul'];
const COLOR_CLS = { 'rød': 'red', 'blå': 'blue', 'grøn': 'green', 'gul': 'yellow' };
const PL = { 'rød': 'røde', 'blå': 'blå', 'grøn': 'grønne', 'gul': 'gule' };

const sandsynlighed = {
  id: 'sandsynlighed',
  name: 'Sandsynlighed',
  desc: 'Hvor stor er chancen?',
  intro: {
    scene: 'observation',
    text: '<b>Umulig</b>: kan ikke ske. <b>Sikker</b>: sker helt sikkert. <b>Lige chance</b>: halvdelen af gangene.<br><b>Sandsynlig</b>: sker oftest. <b>Usandsynlig</b>: sker sjældent.<br>Chancen for rød i en pose med 1 rød og 3 blå er <b>1 ud af 4</b> = ' + frac(1, 4) + '.',
    lead: 'Hvor stor er chancen for at spotte pandaen? Chancen kan siges med ord – og med en brøk.',
    cards: [
      { title: 'Chancen i ord', visual: () => V.miniChance(), rules: ['umulig', 'usandsynlig', 'lige chance', 'sandsynlig', 'sikker'], note: 'Fra noget, der aldrig sker, til noget, der altid sker.' },
      { title: 'Chancen som brøk', visual: () => V.bag([{ color: 'red', n: 1 }, { color: 'blue', n: 3 }]), rules: [`1 ud af 4 = ${frac(1, 4)}`], note: 'Der er 4 kugler i posen, og 1 af dem er rød.' },
    ],
    tip: {
      title: 'Størst chance',
      rows: [['Flest', '', 'den farve, der er flest af, har størst chance']],
    },
  },
  gen(level) {
    const [c1, c2, c3] = shuffle(COLORS);
    if (level === 3) {
      if (chance(0.5)) {
        const counts = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3);
        const cols = [c1, c2, c3];
        const bi = counts.indexOf(Math.max(...counts));
        return {
          prompt: 'Lodtrækning i billetlugen: Du trækker én kugle uden at kigge. Hvilken farve har du <b>størst chance</b> for at trække?',
          visual: V.bag(cols.map((c, i) => ({ color: COLOR_CLS[c], n: counts[i] }))),
          input: 'choice', choices: cols, answer: cols[bi],
          explain: `Der er flest ${PL[cols[bi]]} kugler (${counts[bi]}), så <b>${cols[bi]}</b> har størst chance.`,
        };
      }
      const a = ri(1, 5), b = ri(1, 6);
      return {
        prompt: `Lodtrækning i billetlugen: Du trækker én kugle uden at kigge. Hvad er chancen for at trække en <b>${c1}</b> kugle? Skriv som brøk.`,
        visual: V.bag([{ color: COLOR_CLS[c1], n: a }, { color: COLOR_CLS[c2], n: b }]),
        input: 'fraction', answer: [a, a + b],
        explain: `Der er ${a + b} kugler i alt, og ${a} af dem er ${c1}. Chancen er ${a} ud af ${a + b} = <b>${frac(a, a + b)}</b>.`,
      };
    }
    const opts = level === 1 ? ['umulig', 'lige chance', 'sikker'] : ['umulig', 'usandsynlig', 'lige chance', 'sandsynlig', 'sikker'];
    const kind = pick(opts);
    let a, b; // a = antal af den efterspurgte farve, b = andre
    switch (kind) {
      case 'umulig': a = 0; b = ri(3, 8); break;
      case 'sikker': a = ri(3, 8); b = 0; break;
      case 'lige chance': a = b = ri(2, 5); break;
      case 'usandsynlig': a = ri(1, 2); b = ri(5, 8); break;
      default: a = ri(5, 8); b = ri(1, 2);
    }
    const balls = [];
    if (a) balls.push({ color: COLOR_CLS[c1], n: a });
    if (b) balls.push({ color: COLOR_CLS[c2], n: b });
    const why = {
      umulig: `Der er ingen ${PL[c1]} kugler i posen – det er <b>umuligt</b>.`,
      sikker: `Alle kuglerne er ${PL[c1]} – det er <b>sikkert</b>.`,
      'lige chance': `Der er lige mange af hver farve (${a} og ${b}) – det er <b>lige chance</b>.`,
      usandsynlig: `Kun ${a} ud af ${a + b} kugler er ${PL[c1]} – det er <b>usandsynligt</b>.`,
      sandsynlig: `${a} ud af ${a + b} kugler er ${PL[c1]} – det er <b>sandsynligt</b>.`,
    }[kind];
    return {
      prompt: `Lodtrækning i billetlugen: Du trækker én kugle uden at kigge. Hvor sandsynligt er det, at den er <b>${c1}</b>?`,
      visual: V.bag(balls), input: 'choice', choices: opts, answer: kind, explain: why,
    };
  },
};

// ---------- H. Mønstre og ligninger ----------

const talfolger = {
  id: 'talfolger',
  name: 'Talfølger',
  desc: 'Find mønstret og fortsæt',
  intro: {
    scene: 'aber',
    text: 'Kig på, hvad der sker fra det ene tal til det næste. 3, 7, 11, 15 … Der lægges <b>4</b> til hver gang, så næste tal er <b>19</b>.',
    lead: 'Pote-sporet følger et mønster. Find springet – så kender du næste tal.',
    cards: [
      { title: 'Find springet', visual: () => V.miniSeq([3, 7, 11, 15, '?'], '+4'), rules: ['+4 hver gang → 19'], note: 'Kig på, hvad der sker fra det ene tal til det næste.' },
      { title: 'Det kan også gå nedad', visual: () => V.miniSeq([50, 45, 40, 35, '?'], '−5'), rules: ['−5 hver gang → 30'], note: 'Sporet kan også blive mindre for hvert skridt.' },
    ],
    tip: {
      title: 'Andre mønstre',
      rows: [
        ['× 2 eller × 3', '', '2, 4, 8, 16 … · 1, 3, 9, 27 …'],
        ['Voksende spring', '', '1, 2, 4, 7, 11 … springet bliver 1 større'],
      ],
    },
  },
  gen(level) {
    let seq, rule;
    if (level === 1) {
      const s = ri(1, 20), d = ri(2, 10);
      seq = Array.from({ length: 6 }, (_, i) => s + i * d); rule = `Der lægges ${d} til hver gang`;
    } else if (level === 2) {
      if (chance(0.4)) {
        const s = ri(1, 5);
        seq = Array.from({ length: 6 }, (_, i) => s * 2 ** i); rule = 'Tallet fordobles hver gang (× 2)';
      } else {
        const d = ri(3, 12), s = ri(6 * d, 100);
        seq = Array.from({ length: 6 }, (_, i) => s - i * d); rule = `Der trækkes ${d} fra hver gang`;
      }
    } else if (chance(0.6)) {
      const s = ri(1, 10), d0 = ri(1, 3), inc = ri(1, 2);
      seq = [s];
      for (let i = 0; i < 5; i++) seq.push(seq[i] + d0 + i * inc);
      const diffs = seq.slice(1).map((x, i) => x - seq[i]);
      rule = `Spring: ${diffs.slice(0, 4).map((x) => '+' + x).join(', ')} … springet bliver ${inc} større hver gang`;
    } else {
      const s = ri(1, 3);
      seq = Array.from({ length: 6 }, (_, i) => s * 3 ** i).slice(0, 5); rule = 'Tallet ganges med 3 hver gang';
      seq.push(seq[4] * 3);
    }
    const shown = seq.slice(0, -1), ans = seq[seq.length - 1];
    return {
      prompt: `Følg pote-sporet. Hvad er det næste tal?<br><span class="big-expr">${shown.map(fmt).join(', ')}, ${box()}</span>`,
      input: 'number', answer: ans,
      explain: `${rule}. Næste tal er <b>${fmt(ans)}</b>.`,
    };
  },
};

const ukendt = {
  id: 'ukendt',
  name: 'Find det ukendte tal',
  desc: 'Små ligninger: ? + 7 = 15',
  intro: {
    pic: 'kodelaas',
    text: `Regn <b>baglæns</b> med det modsatte regnestykke.<br>${box()} + 7 = 15 → 15 − 7 = <b>8</b>.<br>4 × ${box()} = 28 → 28 : 4 = <b>7</b>.`,
    lead: 'Koden mangler et tal. Regn baglæns med det modsatte regnestykke.',
    cards: [
      { title: 'Plus og minus', visual: () => V.miniBack('+ 7', '− 7', 15, 8), rules: [`${box()} + 7 = 15`, '15 − 7 = 8'], note: 'Plus bliver til minus, når du regner baglæns.' },
      { title: 'Gange og division', visual: () => V.miniBack('× 4', ': 4', 28, 7), rules: [`4 × ${box()} = 28`, '28 : 4 = 7'], note: 'Gange bliver til division.' },
    ],
    tip: {
      title: 'Tjek koden',
      rows: [['Sæt ind', '', '8 + 7 = 15 ✓']],
    },
  },
  gen(level) {
    const B = box();
    if (level === 1) {
      const x = ri(3, 60), b = ri(2, 40), kind = ri(0, 2);
      if (kind === 0) return { prompt: `<span class="big-expr">${B} + ${b} = ${x + b}</span>`, input: 'number', answer: x, explain: `Regn baglæns: ${x + b} − ${b} = <b>${x}</b>.` };
      if (kind === 1) return { prompt: `<span class="big-expr">${b} + ${B} = ${x + b}</span>`, input: 'number', answer: x, explain: `Regn baglæns: ${x + b} − ${b} = <b>${x}</b>.` };
      return { prompt: `<span class="big-expr">${B} − ${b} = ${x}</span>`, input: 'number', answer: x + b, explain: `Regn baglæns: ${x} + ${b} = <b>${x + b}</b>.` };
    }
    if (level === 2) {
      const a = ri(2, 10), x = ri(2, 10), kind = ri(0, 2);
      if (kind === 0) return { prompt: `<span class="big-expr">${a} × ${B} = ${a * x}</span>`, input: 'number', answer: x, explain: `Regn baglæns: ${a * x} : ${a} = <b>${x}</b>.` };
      if (kind === 1) return { prompt: `<span class="big-expr">${B} : ${a} = ${x}</span>`, input: 'number', answer: a * x, explain: `Regn baglæns: ${x} × ${a} = <b>${a * x}</b>.` };
      return { prompt: `<span class="big-expr">${a * x} : ${B} = ${a}</span>`, input: 'number', answer: x, explain: `Hvad skal ${a * x} deles med for at give ${a}? ${a} × ${x} = ${a * x}, så svaret er <b>${x}</b>.` };
    }
    const a = ri(2, 9), x = ri(2, 10), b = ri(1, 20), c = a * x + b;
    if (chance(0.5)) {
      return { prompt: `<span class="big-expr">${a} × ${B} + ${b} = ${c}</span>`, input: 'number', answer: x, explain: `Baglæns: først − ${b}: ${c} − ${b} = ${a * x}. Så : ${a}: ${a * x} : ${a} = <b>${x}</b>.` };
    }
    const c2 = a * x - Math.min(b, a * x - 1), b2 = a * x - c2;
    return { prompt: `<span class="big-expr">${a} × ${B} − ${b2} = ${c2}</span>`, input: 'number', answer: x, explain: `Baglæns: først + ${b2}: ${c2} + ${b2} = ${a * x}. Så : ${a}: ${a * x} : ${a} = <b>${x}</b>.` };
  },
};

// ---------- Områder ----------

// Kodelåse i skattejagten: samme regnestykke, men med en lille historie
const ukendtCore = ukendt.gen;
ukendt.gen = (level) => {
  const p = ukendtCore(level);
  if (chance(ZOO_P)) {
    p.prompt = pick([
      'Kodelåsen på Kajs skattekiste: hvilket tal mangler?',
      'Skattejagtens næste post er låst. Find tallet, der åbner låsen:',
      'Liv har tegnet en gåde på skattekortet. Hvilket tal skal stå i feltet?',
    ]) + p.prompt;
  }
  return p;
};

// Hvert område er et sted i zoo'en (se univers-zoo.md).
export const AREAS = [
  {
    id: 'tal', name: 'Tal og talsystem', place: 'Billetlugen', icon: '🎟️', color: 'var(--c-tal)',
    skills: [positionssystem, afrunding, sammenlign, plusminus],
    snak: ['Hvad er 7-tallet værd i husnummeret / postnummeret?', 'Rund prisen på indkøbskurven af til nærmeste hundrede.'],
  },
  {
    id: 'gange', name: 'Gange', place: 'Foderlageret', icon: '📦', color: 'var(--c-gange)',
    skills: [gange10, gangeflercifret, gangetekst],
    snak: ['Hvor mange hjul har 7 biler?', 'Hvad koster 6 is til 15 kr.?'],
  },
  {
    id: 'division', name: 'Division', place: 'Foderkøkkenet', icon: '🥕', color: 'var(--c-div)',
    skills: [divtabel, divrest, divflercifret, divtekst],
    snak: ['Vi er 4 og har 30 kr. – hvor meget får hver, og hvad bliver tilbage?', 'Hvor mange hold á 5 kan vi lave af 23 børn?'],
  },
  {
    id: 'brok', name: 'Brøker', place: 'Pingvinbassinet', icon: '🐧', color: 'var(--c-brok)',
    skills: [brokfigur, broktallinje, broksammenlign, brokafantal, ligevaerdig],
    snak: ['Vil du hellere have ⅓ eller ¼ af pizzaen? Hvorfor?', 'Hvad er ¾ af en time i minutter?'],
  },
  {
    id: 'decimal', name: 'Decimaltal', place: 'Dyrlægeklinikken', icon: '🩺', color: 'var(--c-dec)',
    skills: [decfigur, dectallinje, decsammenlign, decplusminus],
    snak: ['Hvad er billigst: 12,5 kr. eller 12,45 kr.?', 'Hvor meget skal vi have tilbage fra 50 kr., hvis det koster 37,50?'],
  },
  {
    id: 'geometri', name: 'Geometri', place: 'Anlæggene', icon: '🌿', color: 'var(--c-geo)',
    skills: [omkreds, areal, vinkler],
    snak: ['Hvor mange meter er der hele vejen rundt om haven?', 'Find en ret, en spids og en stump vinkel her i bilen.'],
  },
  {
    id: 'maaling', name: 'Tid og måling', place: 'Zoo-uret', icon: '🕐', color: 'var(--c-maal)',
    skills: [enheder, klokken, tidsforskel],
    snak: ['Hvor mange minutter er der, til vi er fremme?', 'Hvor mange deciliter er der i en liter mælk?'],
  },
  {
    id: 'data', name: 'Statistik og sandsynlighed', place: 'Gæsteundersøgelsen', icon: '📊', color: 'var(--c-data)',
    skills: [soejle, typetal, sandsynlighed],
    snak: ['Tæl farverne på de næste 20 biler – hvilken farve er typetallet?', 'Er det sandsynligt eller usandsynligt, at det regner i morgen?'],
  },
  {
    id: 'algebra', name: 'Mønstre og ligninger', place: 'Skattejagten', icon: '🗺️', color: 'var(--c-alg)',
    skills: [talfolger, ukendt],
    snak: ['Jeg tænker på et tal. Ganger jeg det med 3 og lægger 2 til, får jeg 20. Hvilket tal?', 'Hvad kommer efter 1, 2, 4, 8, 16 …?'],
  },
];


export const SKILLS = {};
for (const area of AREAS) for (const s of area.skills) SKILLS[s.id] = { ...s, area: area.id };

// ---------- Øvebanen: lektiepakker uden for zoo-forløbet ----------
// Hver færdighed har intro.steps: et gennemregnet eksempel, der vises ét trin ad gangen.

const sn = (n) => (n < 0 ? `−${fmt(-n)}` : fmt(n)); // rigtigt minustegn
const X = '<i class="xvar">x</i>';
const stepsHTML = (arr) => `<ol class="steps">${arr.map((s) => `<li>${s}</li>`).join('')}</ol>`;

// VII) Omskriv tal: tiendedele og hundrededele
const decimalDele = {
  id: 'decimaldele',
  name: 'Tiendedele og hundrededele',
  desc: 'Fx 6/100 + 5 + 2/10 = 5,26',
  intro: {
    text: 'Et decimaltal er bygget af hele, tiendedele og hundrededele.',
    steps: [
      { text: 'Et tal med komma har faste pladser: <b>hele</b> foran kommaet, så <b>tiendedele</b> og <b>hundrededele</b> efter kommaet.', visual: () => V.decimalPlaces(5, 2, 6) },
      { text: `${frac(6, 100)} betyder 6 ud af 100 – altså <b>6 hundrededele</b>. Det skrives <b>0,06</b>.` },
      { text: `${frac(2, 10)} betyder 2 ud af 10 – altså <b>2 tiendedele</b>. Det skrives <b>0,2</b>.` },
      { text: `Læg det hele sammen: ${frac(6, 100)} + 5 + ${frac(2, 10)} = 5 + 0,2 + 0,06 = <b>5,26</b>. Rækkefølgen er ligegyldig – hvert tal har sin egen plads.` },
      { text: `Pas på nullet! 3 + ${frac(3, 100)} har <b>0 tiendedele</b>, så der skal stå et 0 lige efter kommaet: <b>3,03</b> (ikke 3,3).`, visual: () => V.decimalPlaces(3, 0, 3) },
    ],
  },
  gen(level) {
    const w = level === 1 ? ri(1, 9) : ri(1, 25);
    let t = ri(1, 9), h = level === 1 ? 0 : ri(1, 9);
    if (level === 3) { if (chance(0.5)) t = 0; else if (chance(0.35)) h = 0; }
    const val = w * 100 + t * 10 + h; // i hundrededele
    const dec = fmtDec(val / 100, h ? 2 : 1);
    const how = [];
    if (t) how.push(`${frac(t, 10)} er ${t} tiendedel${t > 1 ? 'e' : ''} = ${fmtDec(t / 10, 1)}`);
    else how.push('Der er <b>0 tiendedele</b> – så der skal stå 0 lige efter kommaet');
    if (h) how.push(`${frac(h, 100)} er ${h} hundrededel${h > 1 ? 'e' : ''} = ${fmtDec(h / 100, 2)}`);
    const parts = [String(w), t ? fmtDec(t / 10, 1) : null, h ? fmtDec(h / 100, 2) : null].filter(Boolean);
    how.push(`Læg sammen: ${parts.join(' + ')} = <b>${dec}</b>`);

    if (chance(0.5)) {
      // Saml til et decimaltal (som opgave a på arket)
      let terms = [String(w), t ? frac(t, 10) : null, h ? frac(h, 100) : null];
      if (level === 3 && (!t || !h)) terms = terms.map((x) => x ?? '0');
      terms = terms.filter(Boolean);
      if (level > 1) terms = shuffle(terms);
      return {
        prompt: `Skriv som ét decimaltal:<span class="big-expr">${terms.join(' + ')} = ${box()}</span>`,
        input: 'number', answer: val / 100,
        explain: stepsHTML(how), explainVisual: V.decimalPlaces(w, t, h),
      };
    }
    // Del et decimaltal op (som opgave b på arket)
    const useFrac = level === 1 || chance(0.5);
    const layout = useFrac
      ? [`${dec} =`, { slot: 0, label: 'hele' }, '+', { slot: 1, den: 10 }, ...(level > 1 ? ['+', { slot: 2, den: 100 }] : [])]
      : [`${dec} =`, { slot: 0, label: 'hele' }, '+', { slot: 1, label: 'tiendedele' }, ...(level > 1 ? ['+', { slot: 2, label: 'hundrededele' }] : [])];
    const answer = useFrac ? [w, t, ...(level > 1 ? [h] : [])] : [w, t / 10, ...(level > 1 ? [h / 100] : [])];
    const shown = useFrac
      ? `${w} + ${frac(t, 10)}${level > 1 ? ` + ${frac(h, 100)}` : ''}`
      : `${w} + ${fmtDec(t / 10, 1)}${level > 1 ? ` + ${fmtDec(h / 100, 2)}` : ''}`;
    return {
      prompt: useFrac ? 'Del tallet op i hele, tiendedele og hundrededele:' : 'Del tallet op. Skriv tiendedele og hundrededele som decimaltal (fx 0,7 og 0,03):',
      input: 'parts', layout, answer, answerText: `${dec} = ${shown}`,
      explain: stepsHTML([
        `${dec} har <b>${w}</b> hele, <b>${t}</b> tiendedel${t === 1 ? '' : 'e'}${level > 1 ? ` og <b>${h}</b> hundrededel${h === 1 ? '' : 'e'}` : ''}.`,
        `Altså: ${dec} = ${shown}`,
      ]),
      explainVisual: V.decimalPlaces(w, t, level > 1 ? h : null),
    };
  },
};

// VIII) Find x
const findX = {
  id: 'findx',
  name: 'Find x',
  desc: 'Fx 7 · 8 = x + x − 10',
  intro: {
    pic: 'kodelaas',
    text: `${X} er et tal, vi ikke kender endnu.`,
    steps: [
      { text: `${X} er et tal, vi ikke kender endnu. Vi skal finde det tal, der gør, at <b>begge sider af = er lige store</b>.` },
      { text: `Eksempel: <b>7 · 8 = ${X} + ${X} − 10</b>. Regn først det, du kan: 7 · 8 = <b>56</b>.` },
      { text: `Nu står der 56 = ${X} + ${X} − 10. Der er trukket 10 fra – så læg 10 til igen: ${X} + ${X} = <b>66</b>.` },
      { text: `To ${X}'er er 66. Så er ét ${X}: 66 : 2 = <b>33</b>.` },
      { text: `Tjek altid dit svar: 33 + 33 − 10 = 56 ✓. Begge sider er lige store!` },
    ],
  },
  gen(level) {
    const check = (s) => `<span class="check-line">Tjek: ${s} ✓</span>`;
    if (level === 1) {
      const x = ri(3, 40), b = ri(2, 25);
      if (chance(0.5)) {
        const left = chance(0.5);
        return {
          prompt: `Find ${X}:<span class="big-expr">${left ? `${X} + ${b} = ${x + b}` : `${x + b} = ${b} + ${X}`}</span>`,
          input: 'number', answer: x,
          explain: stepsHTML([`Hvad skal lægges til ${b} for at få ${x + b}?`, `Regn baglæns: ${x + b} − ${b} = <b>${x}</b>`, check(`${x} + ${b} = ${x + b}`)]),
        };
      }
      return {
        prompt: `Find ${X}:<span class="big-expr">${X} − ${b} = ${x}</span>`,
        input: 'number', answer: x + b,
        explain: stepsHTML([`Der er trukket ${b} fra ${X}, og så er der ${x} tilbage.`, `Regn baglæns: ${x} + ${b} = <b>${x + b}</b>`, check(`${x + b} − ${b} = ${x}`)]),
      };
    }
    if (level === 2) {
      const kind = ri(0, 2);
      if (kind === 0) {
        const x = ri(3, 30);
        return {
          prompt: `Find ${X}:<span class="big-expr">${X} + ${X} = ${2 * x}</span>`,
          input: 'number', answer: x,
          explain: stepsHTML([`To ${X}'er er ${2 * x}.`, `Ét ${X} er halvdelen: ${2 * x} : 2 = <b>${x}</b>`, check(`${x} + ${x} = ${2 * x}`)]),
        };
      }
      if (kind === 1) {
        const x = ri(3, 25), b = ri(2, 15), c = 2 * x + b;
        return {
          prompt: `Find ${X}:<span class="big-expr">${X} + ${X} + ${b} = ${c}</span>`,
          input: 'number', answer: x,
          explain: stepsHTML([`Træk ${b} fra på begge sider: ${X} + ${X} = ${c} − ${b} = ${c - b}`, `Ét ${X} er ${c - b} : 2 = <b>${x}</b>`, check(`${x} + ${x} + ${b} = ${c}`)]),
        };
      }
      const a = ri(3, 9), b = ri(3, 9), c = ri(2, a * b - 2), x = a * b - c;
      return {
        prompt: `Find ${X}:<span class="big-expr">${a} · ${b} = ${X} + ${c}</span>`,
        input: 'number', answer: x,
        explain: stepsHTML([`Regn først det, du kan: ${a} · ${b} = ${a * b}`, `Nu står der ${a * b} = ${X} + ${c}`, `${X} = ${a * b} − ${c} = <b>${x}</b>`, check(`${x} + ${c} = ${a * b}`)]),
      };
    }
    if (chance(0.5)) {
      // Som opgave a på arket: 7 · 8 = x + x − 10
      let a, b, c;
      do { a = ri(3, 9); b = ri(3, 9); c = pick([2, 4, 6, 8, 10, 12, 14, 20]); } while ((a * b + c) % 2);
      const x = (a * b + c) / 2;
      return {
        prompt: `Find ${X}:<span class="big-expr">${a} · ${b} = ${X} + ${X} − ${c}</span>`,
        input: 'number', answer: x,
        explain: stepsHTML([
          `Regn først det, du kan: ${a} · ${b} = ${a * b}`,
          `Nu står der ${a * b} = ${X} + ${X} − ${c}. Læg ${c} til: ${X} + ${X} = ${a * b + c}`,
          `Ét ${X} er ${a * b + c} : 2 = <b>${x}</b>`,
          check(`${x} + ${x} − ${c} = ${a * b}`),
        ]),
      };
    }
    // Som opgave b på arket: 2,1 + 2,01 + 2,10 = 4 + x
    const a = ri(1, 3), d1 = ri(1, 9);
    const forms = shuffle([[`${a},${d1}`, a * 100 + d1 * 10], [`${a},0${d1}`, a * 100 + d1], [`${a},${d1}0`, a * 100 + d1 * 10]]);
    const S = forms.reduce((s, f) => s + f[1], 0);
    const d = Math.floor(S / 100) - ri(1, 2);
    const xv = S - d * 100;
    const show = (v) => fmtDec(v / 100, 2);
    return {
      prompt: `Find ${X}:<span class="big-expr">${forms.map((f) => f[0]).join(' + ')} = ${d} + ${X}</span>`,
      input: 'number', answer: xv / 100,
      explain: stepsHTML([
        `Skriv tallene med lige mange decimaler: ${forms.map((f) => show(f[1])).join(' + ')}`,
        `Læg dem sammen: ${show(S)}`,
        `Nu står der ${show(S)} = ${d} + ${X}. ${X} = ${show(S)} − ${d} = <b>${fmtDec(xv / 100, 2)}</b>`,
        check(`${d} + ${fmtDec(xv / 100, 2)} = ${show(S)}`),
      ]),
    };
  },
};

// IX) Regnehierarki – sæt parenteser (også med minus-tal)
function hierarchyExpr(level) {
  const pickT = level === 1 ? ri(0, 1) : level === 2 ? ri(2, 4) : ri(5, 7);
  let a, b, c, d;
  switch (pickT) {
    case 0: // a − b · c (positivt resultat)
      do { a = ri(4, 30); b = ri(1, 6); c = ri(1, 6); } while (b * c > a);
      return { show: `${a} − ${b} · ${c}`, paren: `${a} − (${b} · ${c})`, wrong: `(${a} − ${b}) · ${c}`, prods: [`${b} · ${c} = ${b * c}`], rest: `${a} − ${b * c}`, val: a - b * c };
    case 1: // a + b · c
      a = ri(2, 20); b = ri(2, 6); c = ri(2, 6);
      return { show: `${a} + ${b} · ${c}`, paren: `${a} + (${b} · ${c})`, wrong: `(${a} + ${b}) · ${c}`, prods: [`${b} · ${c} = ${b * c}`], rest: `${a} + ${b * c}`, val: a + b * c };
    case 2: // a · b + c · d
      a = ri(2, 7); b = ri(2, 7); c = ri(2, 7); d = ri(2, 7);
      return { show: `${a} · ${b} + ${c} · ${d}`, paren: `(${a} · ${b}) + (${c} · ${d})`, wrong: `${a} · (${b} + ${c}) · ${d}`, prods: [`${a} · ${b} = ${a * b}`, `${c} · ${d} = ${c * d}`], rest: `${a * b} + ${c * d}`, val: a * b + c * d };
    case 3: // a · b − c · d (positivt)
      do { a = ri(3, 9); b = ri(3, 9); c = ri(2, 6); d = ri(2, 6); } while (c * d >= a * b);
      return { show: `${a} · ${b} − ${c} · ${d}`, paren: `(${a} · ${b}) − (${c} · ${d})`, wrong: `${a} · (${b} − ${c}) · ${d}`, prods: [`${a} · ${b} = ${a * b}`, `${c} · ${d} = ${c * d}`], rest: `${a * b} − ${c * d}`, val: a * b - c * d };
    case 4: // a + b · c − d
      do { a = ri(2, 20); b = ri(2, 6); c = ri(2, 6); d = ri(1, 15); } while (a + b * c - d < 0);
      return { show: `${a} + ${b} · ${c} − ${d}`, paren: `${a} + (${b} · ${c}) − ${d}`, wrong: `(${a} + ${b}) · (${c} − ${d})`, prods: [`${b} · ${c} = ${b * c}`], rest: `${a} + ${b * c} − ${d}`, val: a + b * c - d };
    case 5: // −a + b · c (som −3 + 3 · 2)
      a = ri(1, 9); b = ri(1, 5); c = ri(1, 5);
      return { show: `−${a} + ${b} · ${c}`, paren: `−${a} + (${b} · ${c})`, wrong: `(−${a} + ${b}) · ${c}`, prods: [`${b} · ${c} = ${b * c}`], rest: `−${a} + ${b * c}`, val: -a + b * c, neg: true };
    case 6: // a · −b + c · d (som 6 · −1 + 2 · 2)
      a = ri(2, 6); b = ri(1, 3); c = ri(1, 4); d = ri(1, 4);
      return { show: `${a} · −${b} + ${c} · ${d}`, paren: `(${a} · −${b}) + (${c} · ${d})`, wrong: `${a} · (−${b} + ${c}) · ${d}`, prods: [`${a} · −${b} = −${a * b} <span class="muted">(${a} gange "minus ${b}")</span>`, `${c} · ${d} = ${c * d}`], rest: `−${a * b} + ${c * d}`, val: -a * b + c * d, neg: true };
    default: // a − b · c med negativt resultat (som 5 − 5 · 2)
      do { a = ri(1, 9); b = ri(2, 5); c = ri(2, 5); } while (b * c <= a);
      return { show: `${a} − ${b} · ${c}`, paren: `${a} − (${b} · ${c})`, wrong: `(${a} − ${b}) · ${c}`, prods: [`${b} · ${c} = ${b * c}`], rest: `${a} − ${b * c}`, val: a - b * c, neg: true };
  }
}

const negLine = (from, to) => {
  const lo = Math.min(-10, Math.floor(Math.min(from, to) / 5) * 5), hi = Math.max(10, Math.ceil(Math.max(from, to) / 5) * 5);
  return V.numberLine({ min: lo, max: hi, div: hi - lo, minorEvery: 5, labels: (i, v) => (v % 5 === 0 ? sn(v) : null), mark: to, markText: sn(to) });
};

const parenteser = {
  id: 'parenteser',
  name: 'Regnehierarki og parenteser',
  desc: 'Gange før plus og minus – også med minus-tal',
  intro: {
    text: 'Gange og division regnes FØR plus og minus.',
    steps: [
      { text: 'Regneregel: <b>gange og division regnes FØR plus og minus</b> – også selvom gangestykket står til sidst.' },
      { text: 'Sæt parentes om det, der skal regnes først: <b>5 − 5 · 1</b> → <b>5 − (5 · 1)</b>' },
      { text: 'Regn parentesen først: 5 · 1 = 5. Så resten: 5 − 5 = <b>0</b>.' },
      { text: 'Minus-tal er tal <b>under nul</b>. −3 ligger 3 skridt til venstre for 0 på tallinjen – ligesom −3 grader på et termometer.', visual: () => negLine(0, -3) },
      { text: '−3 + (3 · 2) = −3 + 6. Start ved −3 og gå 6 skridt frem: <b>3</b>.', visual: () => negLine(-3, 3) },
      { text: '6 · −1 betyder 6 gange "minus én" = <b>−6</b>. Så (6 · −1) + (2 · 2) = −6 + 4 = <b>−2</b>.', visual: () => negLine(-6, -2) },
    ],
  },
  gen(level) {
    const e = hierarchyExpr(level);
    const how = stepsHTML([
      `Gange før plus og minus – sæt parentes: <b>${e.paren}</b>`,
      `Regn parentesen${e.prods.length > 1 ? 'erne' : ''}: ${e.prods.join(' og ')}`,
      `Regn resten: ${e.rest} = <b>${sn(e.val)}</b>`,
    ]);
    const vis = e.neg || e.val < 0 ? negLine(0, e.val) : null;
    if (chance(0.4)) {
      return {
        prompt: `Hvor skal parentesen stå?<span class="big-expr">${e.show}</span>`,
        input: 'choice', choices: shuffle([e.paren, e.wrong]), answer: e.paren, wide: true,
        explain: how,
      };
    }
    return {
      prompt: `Regn – husk gange før plus og minus:<span class="big-expr">${e.show} = ${box()}</span>`,
      input: 'number', answer: e.val, signed: level === 3,
      explain: how, explainVisual: vis,
    };
  },
};

export const PRACTICE_SETS = [
  {
    id: 'uge40', name: 'Lektier uge 40', place: 'Lektier uge 40', icon: '📝', color: 'var(--c-tal)',
    desc: 'Decimaltal, find x og parenteser – som på lektiearket',
    skills: [decimalDele, findX, parenteser],
  },
];

// Alle færdigheder (zoo + øvebane) – til opslag ved øvning
export const ALL_SKILLS = { ...SKILLS };
for (const set of PRACTICE_SETS) for (const s of set.skills) ALL_SKILLS[s.id] = { ...s, area: set.id, practice: true };

// ---------- Gangetabellen (spaced repetition pr. fakta) ----------

// Alle par 2–10 (7×8 og 8×7 er samme fakta), sorteret fra let til svær
// Tabellerne 2–9 (7×8 og 8×7 er samme fakta) – 36 i alt.
// Nye fakta introduceres i en blanding af mellem, lette og svære, så opvarmningen ikke bliver for let.
export const FACTS = (() => {
  const ease = { 2: 0, 5: 1, 3: 2, 4: 2, 9: 3, 6: 4, 7: 5, 8: 5 };
  const list = [];
  for (let a = 2; a <= 9; a++)
    for (let b = a; b <= 9; b++) list.push({ key: `${a}x${b}`, a, b, d: Math.min(ease[a], ease[b]) * 10 + ease[a] + ease[b] + (a === b ? -1 : 0) });
  list.sort((x, y) => x.d - y.d);
  const n = Math.ceil(list.length / 3);
  const easy = list.slice(0, n), mid = list.slice(n, 2 * n), hard = list.slice(2 * n);
  const mixed = [];
  for (let i = 0; i < n; i++) for (const tier of [mid, easy, hard]) if (tier[i]) mixed.push(tier[i]);
  return mixed.map(({ key, a, b }) => ({ key, a, b }));
})();

export function factStrategy(a, b) {
  const [x, y] = a <= b ? [a, b] : [b, a];
  const p = a * b;
  if (x === 2) return `×2 er det dobbelte: ${y} + ${y} = ${p}.`;
  if (y === 10) return `×10: hvert ciffer bliver 10 gange mere værd og rykker én plads til venstre: ${x} enere bliver til ${x} tiere = ${p}.`;
  if (x === 5 || y === 5) { const o = x === 5 ? y : x; return `×5 er halvdelen af ×10: ${o} × 10 = ${o * 10}, halvdelen er ${p}.`; }
  if (x === 9 || y === 9) { const o = x === 9 ? y : x; return `×9: gang med 10 og træk én gang fra: ${o * 10} − ${o} = ${p}.`; }
  if (x === 4 || y === 4) { const o = x === 4 ? y : x; return `×4 er dobbelt af dobbelt: ${o} → ${o * 2} → ${p}.`; }
  if (x === y) return `${x} × ${x} = ${p} – kvadrattal er gode at kunne udenad.`;
  if (y - x === 1) return `Brug kvadrattallet: ${x} × ${x} = ${x * x}, plus én ${x}'er mere: ${x * x} + ${x} = ${p}.`;
  if (x === 3 || y === 3) { const o = x === 3 ? y : x; return `×3 er dobbelt plus én: ${o * 2} + ${o} = ${p}.`; }
  if (x === 6 || y === 6) { const o = x === 6 ? y : x; return `×6 er ×5 plus én: ${o * 5} + ${o} = ${p}.`; }
  if (y === 8) return `×8 er dobbelt af ×4: ${x} × 4 = ${x * 4}, dobbelt er ${p}.`;
  return `${x} × ${y - 1} = ${x * (y - 1)}, plus ${x} = ${p}.`;
}

export function factProblem(f) {
  const [a, b] = chance(0.5) ? [f.a, f.b] : [f.b, f.a];
  return {
    fact: f.key,
    prompt: `<span class="big-expr">${a} × ${b}</span>`,
    input: 'number', answer: a * b,
    explain: factStrategy(a, b),
    explainVisual: V.dotArray(Math.min(a, b), Math.max(a, b)),
  };
}
