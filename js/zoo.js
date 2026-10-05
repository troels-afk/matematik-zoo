// Zoo-universet: figurer, dyreunger, områder, niveauer og beskeder.
// Se univers-zoo.md. Historien vises kun MELLEM opgaverne – aldrig mens der regnes.

import { AREAS, FACTS } from './curriculum.js?v=20261005084229';
import * as E from './engine.js?v=20261005084229';
import { today } from './util.js?v=20261005084229';

// Figurernes tegninger: ansigt (talebobler og kort), buste (missionens cirkel) og helfigur (scener).
// Emojien bruges kun som reserve, hvis en tegning mangler.
const art = (id) => ({ img: `img/cast/${id}-face.webp`, bust: `img/cast/${id}-bust.webp`, full: `img/cast/${id}.webp` });

export const CAST = {
  bodil: { name: 'Bodil', role: 'Zoo-direktør', emoji: '👵🏼', img: 'img/cast/bodil-face.webp', bust: 'img/cast/bodil.webp' },
  kaj: { name: 'Kaj', role: 'Papegøje', emoji: '🦜', ...art('kaj') },
  nora: { name: 'Nora', role: 'Dyrepasser-elev', emoji: '👧🏼', ...art('nora') },
  liv: { name: 'Liv', role: 'Laver skilte og kort', emoji: '👧🏻', ...art('liv') },
  yasmin: { name: 'Yasmin', role: 'Dyrlæge-elev', emoji: '👧🏽', ...art('yasmin') },
};

// Missionens scene – ét fælles format for alle 9 områder: områdets tegning (bg), dyret (cub: en unge med
// glad/tænker/jubler – evt. én pr. opgave; full: helfigur) og missionens figur forrest (CAST[who].full).
// Samme scene følger missionen fra start (intro) over træningen (progress) til slutningen (success).
export const SCENES = {
  tal: { bg: 'img/map/01-indgang-flamingosoe.webp', cub: 'flamingounge', alt: 'Indgangen og flamingosøen' },
  gange: { bg: 'img/scene/foderstation.webp', cub: ['girafunge', 'elefantunge', 'girafunge'], full: 'img/scene/giraf.webp', fullFor: 'girafunge', alt: 'Foderstationen' },
  division: { bg: 'img/map/03-abehuset.webp', cub: 'abeunge', alt: 'Abehuset' },
  brok: { bg: 'img/map/04-polaromraade.webp', cub: ['pingvinunge', 'pingvinunge', 'sælunge'], alt: 'Polarområdet med pingviner og sæler' },
  decimal: { bg: 'img/map/05-dyreklinik.webp', cub: 'pindsvineunge', alt: 'Dyreklinikken' },
  geometri: { bg: 'img/map/06-zebra-naesehorn.webp', cub: ['zebraføl', 'næsehornsunge', 'zebraføl'], alt: 'Zebraernes og næsehornenes anlæg' },
  maaling: { bg: 'img/map/07-rovdyrsomraade.webp', cub: ['tigerunge', 'løveunge', 'tigerunge'], alt: 'Rovdyrområdet' },
  data: { bg: 'img/map/08-data-plaza.webp', cub: 'pandaunge', alt: 'Data-pladsen' },
  algebra: { bg: 'img/map/09-skattejagt.webp', cub: 'ræveunge', alt: 'Skattejagten i skoven' },
};

// Ekstra zoo-indhold pr. pensumområde (id'erne matcher AREAS i curriculum.js)
// intro[i] og done[i] er starten og slutningen på tasks[i] ({who} = missionens figur)
export const ZONES = {
  tal: {
    animals: ['🦩', '🦢', '🦆'], who: 'liv', blurb: 'Indgangen, billetlugen og flamingosøen', step: 'tæl gæster og billetter',
    tasks: ['Tæl dagens gæster i billetlugen', 'Lav besøgsrapporten til Bodil', 'Der er kø ved billetlugen – hjælp til!'],
    intro: ['Der står gæster i kø ved billetlugen. {who} skal vide, hvor mange der kommer i dag.', "Bodil vil se, hvor mange gæster zoo'en har haft. {who} har brug for hjælp til tallene.", 'Køen ved billetlugen bliver længere og længere. {who} har brug for en hurtig regnehjælper.'],
    done: ['Du hjalp {who} med at tælle dagens gæster.', 'Du hjalp {who} med besøgsrapporten til Bodil.', 'Du fik køen ved billetlugen til at glide.'],
  },
  gange: {
    animals: ['🦒', '🐘', '🦛'], who: 'nora', blurb: 'Her bestilles foder til de store dyr', step: 'regn foderet ud til de store dyr',
    tasks: ['Bestil blade til giraferne', 'Regn ugens foder ud til elefanterne', 'Hjælp Nora med den store foderbestilling'],
    intro: ['Giraferne har spist alle bladene. {who} skal regne ud, hvor mange nye der skal bestilles.', 'Elefanterne spiser enormt meget. {who} skal regne foderet ud til hele ugen.', 'Den store foderbestilling skal sendes i dag, og {who} har mange tal at holde styr på.'],
    done: ['Du hjalp {who} med giraffernes foder.', 'Du hjalp {who} med elefanternes foder til hele ugen.', 'Du hjalp {who} med den store foderbestilling.'],
  },
  division: {
    animals: ['🐒', '🐿️', '🦫'], who: 'kaj', blurb: 'Maden fordeles ligeligt – resten går til Kaj', step: 'fordel maden ligeligt mellem dyrene',
    tasks: ['Fordel bananerne ligeligt mellem aberne', 'Gør madskålene klar til abehuset', 'Del frugten ud – Kaj holder øje med resten'],
    intro: ['Aberne skændes om bananerne. {who} vil have dem delt helt lige.', 'Der skal være lige meget i hver madskål. {who} holder øje fra sin gren.', 'Frugten skal deles ud – og det, der bliver til overs, vil {who} gerne have!'],
    done: ['Du fordelte bananerne ligeligt mellem aberne.', 'Du hjalp {who} med madskålene til abehuset.', 'Du delte frugten ud – og Kaj fik resten.'],
  },
  brok: {
    animals: ['🦭', '🐻‍❄️', '🦦'], who: 'liv', blurb: 'Bassiner, fiskespande og pingvinunger', step: 'del fisk og bassiner i brøkdele',
    tasks: ['Fyld pingvinbassinet op', 'Del fiskespandene mellem pingvinerne', 'Lav en ny madplan til sælerne'],
    intro: ['Pingvinbassinet er halvtomt. {who} skal finde ud af, hvor meget vand der mangler.', 'Fiskene skal deles retfærdigt mellem pingvinerne. {who} har brug for din hjælp.', 'Sælerne skal have en ny madplan, og {who} skal dele fiskene i brøkdele.'],
    done: ['Du hjalp {who} med at fylde pingvinbassinet op.', 'Du delte fiskespandene mellem pingvinerne.', 'Du hjalp {who} med sælernes madplan.'],
  },
  decimal: {
    animals: ['🦔', '🐢', '🦥'], who: 'yasmin', blurb: 'Dyrene vejes, måles og får medicin', step: 'vej og mål dyrene i klinikken',
    tasks: ['Vej den nye surikatunge', 'Tjek om pindsvinet har taget på', 'Hjælp Yasmin med at måle medicin op'],
    intro: ['En ny surikatunge er kommet på klinikken. {who} skal veje den helt præcist.', 'Pindsvinet har været sygt. {who} vil vide, om det har taget på.', 'Medicinen skal måles helt nøjagtigt op. {who} har brug for en sikker hånd.'],
    done: ['Du hjalp {who} med at veje den nye surikatunge.', 'Du hjalp {who} med at tjekke pindsvinets vægt.', 'Du hjalp {who} med at måle medicinen op.'],
  },
  geometri: {
    animals: ['🦓', '🦏', '🐪'], who: 'nora', blurb: 'Hegn, anlæg og nye indhegninger', step: 'mål hegn og anlæg op',
    tasks: ['Byg et nyt hegn til zebraerne', 'Tegn det nye næsehorn-anlæg', 'Mål de nye anlæg op'],
    intro: ['Zebraerne skal have et nyt hegn. {who} skal vide, hvor langt det skal være.', 'Næsehornet skal have mere plads. {who} vil have det nye anlæg tegnet rigtigt.', 'De nye anlæg skal måles op, før dyrene kan flytte ind. {who} har brug for hjælp.'],
    done: ['Du hjalp {who} med zebraernes nye hegn.', 'Du hjalp {who} med at tegne næsehorn-anlægget.', 'Du hjalp {who} med at måle anlæggene op.'],
  },
  maaling: {
    animals: ['🦁', '🐯', '🐆'], who: 'liv', blurb: 'Fodringstider, shows og åbningstider', step: 'hold styr på tider og mål',
    tasks: ['Lav fodringsplanen for rovdyrene', 'Tjek zoo-uret før løvefodringen', 'Hold styr på tiderne til sæl-showet'],
    intro: ['Løverne og tigrene skal fodres til tiden. {who} laver planen og har brug for hjælp.', 'Løverne bliver sure, hvis fodringen kommer for sent. {who} skal holde øje med zoo-uret.', 'Sæl-showet starter snart. {who} skal have styr på alle tiderne.'],
    done: ['Du hjalp {who} med rovdyrenes fodringsplan.', 'Du hjalp {who} med at holde tiden til løvefodringen.', 'Du hjalp {who} med tiderne til sæl-showet.'],
  },
  data: {
    animals: ['🐼', '🐨', '🦘'], who: 'kaj', blurb: 'Hvad synes gæsterne? Tæl, spørg og tegn diagrammer', step: 'tæl og tegn diagrammer over gæsterne',
    tasks: ['Find gæsternes yndlingsdyr', 'Lav et diagram til opslagstavlen', 'Gør gæsteundersøgelsen færdig'],
    intro: ['{who} har spurgt gæsterne om deres yndlingsdyr. Nu skal svarene tælles op.', 'Opslagstavlen mangler et diagram. {who} har tallene, men kan ikke tegne det selv.', 'Gæsteundersøgelsen er næsten færdig. {who} mangler hjælp til de sidste tal.'],
    done: ['Du fandt gæsternes yndlingsdyr.', 'Du hjalp {who} med diagrammet til opslagstavlen.', 'Du hjalp {who} med gæsteundersøgelsen.'],
  },
  algebra: {
    animals: ['🦊', '🦝', '🦉'], who: 'kaj', blurb: 'Pote-spor og kodelåse til gæsternes skattejagt', step: 'knæk koder og følg pote-spor',
    tasks: ['Lav en skattejagt til gæsterne', 'Knæk koden til Kajs skattekiste', "Følg pote-sporet gennem zoo'en"],
    intro: ['{who} vil lave en skattejagt med hemmelige koder til gæsterne.', '{who} har glemt koden til sin egen skattekiste! Kan du knække den?', "Der er pote-spor over hele zoo'en. {who} vil vide, hvor de fører hen."],
    done: ['Du hjalp {who} med skattejagten til gæsterne.', 'Du knækkede koden til Kajs skattekiste.', "Du fulgte pote-sporet hele vejen gennem zoo'en."],
  },
};

// Områdets niveau – vokser med mestring af pensum
export const LEVELS = [
  { name: 'Under opbygning', icon: '🚧' },
  { name: 'Åben', icon: '🌱' },
  { name: 'Populær', icon: '💚' },
  { name: 'Stjerne-område', icon: '⭐' },
  { name: 'Guld-område', icon: '🌟' },
];

export function areaLevel(state, areaId) {
  const p = E.areaProgress(state, areaId);
  if (p.mastered === p.total) return 4;
  if (p.complete) return 3;
  if (p.done >= Math.ceil(p.total / 2)) return 2;
  if (p.done >= 1) return 1;
  return 0;
}

// De 45 dyreunger i Babyhuset – én pr. tabel-fakta, i samme rækkefølge (let → svær)
const BABY_LIST = [
  ['🐇', 'kaninunge', 'Kalle'], ['🐐', 'kid', 'Gitte'], ['🐑', 'lam', 'Frede'], ['🐴', 'føl', 'Pixie'],
  ['🦆', 'ælling', 'Anton'], ['🐧', 'pingvinunge', 'Pingo'], ['🦭', 'sælunge', 'Sally'], ['🦔', 'pindsvineunge', 'Pip'],
  ['🐿️', 'egernunge', 'Egon'], ['🦦', 'odderunge', 'Otto'], ['🦩', 'flamingounge', 'Flora'], ['🐢', 'skildpaddeunge', 'Skipper'],
  ['🐸', 'haletudse', 'Frida'], ['🦉', 'uglunge', 'Ulla'], ['🦢', 'svaneunge', 'Svea'], ['🦫', 'bæverunge', 'Bjørk'],
  ['🦊', 'ræveunge', 'Rasmus'], ['🦝', 'vaskebjørneunge', 'Vilma'], ['🐨', 'koalaunge', 'Kiki'], ['🦘', 'kængurunge', 'Rosa'],
  ['🦥', 'dovendyrunge', 'Doris'], ['🐒', 'abeunge', 'Albert'], ['🦙', 'lamaunge', 'Lulu'], ['🐪', 'kamelunge', 'Kamma'],
  ['🦓', 'zebraføl', 'Zita'], ['🦒', 'girafunge', 'Gerda'], ['🐘', 'elefantunge', 'Ella'], ['🦛', 'flodhesteunge', 'Hubert'],
  ['🦏', 'næsehornsunge', 'Nuller'], ['🐼', 'pandaunge', 'Ping'], ['🦁', 'løveunge', 'Leo'], ['🐯', 'tigerunge', 'Tigo'],
  ['🐆', 'leopardunge', 'Luna'], ['🐺', 'ulveunge', 'Ulf'], ['🐻', 'bjørneunge', 'Bamse'], ['🐻‍❄️', 'isbjørneunge', 'Isa'],
  ['🦍', 'gorillaunge', 'Gustav'], ['🦧', 'orangutangunge', 'Oda'], ['🦌', 'hjortekalv', 'Hilda'], ['🦬', 'bisonkalv', 'Bruno'],
  ['🐊', 'krokodilleunge', 'Krølle'], ['🦎', 'firbenunge', 'Fie'], ['🐬', 'delfinunge', 'Dina'], ['🦚', 'påfugleunge', 'Pippa'],
  ['🦡', 'grævlingeunge', 'Gry'],
];
// Tegnede billeder (genereret, fritlagt med tools/prep_image.py). Unger uden billede bruger emoji.
const BABY_IMAGES = {
  løveunge: 'img/babies/loeve.webp',
  kaninunge: 'img/babies/kanin.webp',
  kid: 'img/babies/ged.webp',
  lam: 'img/babies/lam.webp',
  føl: 'img/babies/foel.webp',
  ælling: 'img/babies/aelling.webp',
  pingvinunge: 'img/babies/pingvin.webp',
  sælunge: 'img/babies/sael.webp',
  pindsvineunge: 'img/babies/pindsvin.webp',
  egernunge: 'img/babies/egern.webp',
  odderunge: 'img/babies/odder.webp',
  flamingounge: 'img/babies/flamingo.webp',
  skildpaddeunge: 'img/babies/skildpadde.webp',
  haletudse: 'img/babies/froe.webp',
  uglunge: 'img/babies/ugle.webp',
  svaneunge: 'img/babies/svane.webp',
  bæverunge: 'img/babies/baever.webp',
  ræveunge: 'img/babies/raev.webp',
  vaskebjørneunge: 'img/babies/vaskebjoern.webp',
  koalaunge: 'img/babies/koala.webp',
  kængurunge: 'img/babies/kaenguru.webp',
  dovendyrunge: 'img/babies/dovendyr.webp',
  abeunge: 'img/babies/abe.webp',
  lamaunge: 'img/babies/lama.webp',
  kamelunge: 'img/babies/kamel.webp',
  zebraføl: 'img/babies/zebra.webp',
  girafunge: 'img/babies/giraf.webp',
  elefantunge: 'img/babies/elefant.webp',
  flodhesteunge: 'img/babies/flodhest.webp',
  næsehornsunge: 'img/babies/naesehorn.webp',
  pandaunge: 'img/babies/panda.webp',
  tigerunge: 'img/babies/tiger.webp',
  leopardunge: 'img/babies/leopard.webp',
  ulveunge: 'img/babies/ulv.webp',
  bjørneunge: 'img/babies/bjoern.webp',
  isbjørneunge: 'img/babies/isbjoern.webp',
};

// Unger med tre udtryk (glad / tænker / jubler). Det glade bruges også som standardbillede.
const BABY_EXPR = {
  kaninunge: 'img/babies/kanin',
  kid: 'img/babies/ged',
  lam: 'img/babies/lam',
  ælling: 'img/babies/aelling',
  føl: 'img/babies/foel',
  pingvinunge: 'img/babies/pingvin',
  pindsvineunge: 'img/babies/pindsvin',
  sælunge: 'img/babies/sael',
  egernunge: 'img/babies/egern',
  flamingounge: 'img/babies/flamingo',
  odderunge: 'img/babies/odder',
  skildpaddeunge: 'img/babies/skildpadde',
  bæverunge: 'img/babies/baever',
  ræveunge: 'img/babies/raev',
  vaskebjørneunge: 'img/babies/vaskebjoern',
  haletudse: 'img/babies/froe',
  uglunge: 'img/babies/ugle',
  svaneunge: 'img/babies/svane',
  kængurunge: 'img/babies/kaenguru',
  koalaunge: 'img/babies/koala',
  dovendyrunge: 'img/babies/dovendyr',
  kamelunge: 'img/babies/kamel',
  lamaunge: 'img/babies/lama',
  abeunge: 'img/babies/abe',
  elefantunge: 'img/babies/elefant',
  girafunge: 'img/babies/giraf',
  zebraføl: 'img/babies/zebra',
  flodhesteunge: 'img/babies/flodhest',
  pandaunge: 'img/babies/panda',
  næsehornsunge: 'img/babies/naesehorn',
  leopardunge: 'img/babies/leopard',
  tigerunge: 'img/babies/tiger',
  ulveunge: 'img/babies/ulv',
  bjørneunge: 'img/babies/bjoern',
  isbjørneunge: 'img/babies/isbjoern',
  bisonkalv: 'img/babies/bison',
  delfinunge: 'img/babies/delfin',
  firbenunge: 'img/babies/firben',
  gorillaunge: 'img/babies/gorilla',
  grævlingeunge: 'img/babies/graevling',
  hjortekalv: 'img/babies/hjort',
  krokodilleunge: 'img/babies/krokodille',
  orangutangunge: 'img/babies/orangutang',
  påfugleunge: 'img/babies/paafugl',
};

export const BABIES = {};
FACTS.forEach((f, i) => {
  const [emoji, kind, name] = BABY_LIST[i];
  const ex = BABY_EXPR[kind];
  BABIES[f.key] = {
    emoji, kind, name, fact: f,
    img: ex ? `${ex}-glad.webp` : BABY_IMAGES[kind] || null,
    expr: ex ? { happy: `${ex}-glad.webp`, think: `${ex}-taenker.webp`, cheer: `${ex}-jubler.webp` } : null,
  };
});

// Bonus-unger: de sidste dyr i listen (efter de 36 gangestykker). Én flytter ind i Babyhuset
// for hver hel uge med mindst 4 øvedage. Belønner vanen – ændrer ikke gangestykkerne eller progressionen.
export const BONUS = BABY_LIST.slice(FACTS.length).map(([emoji, kind, name]) => {
  const ex = BABY_EXPR[kind];
  return { emoji, kind, name, img: ex ? `${ex}-glad.webp` : null, cheer: ex ? `${ex}-jubler.webp` : null };
});

// Giv bonus-unger for hele uger, der ikke er belønnet endnu (også uger fra før bonus-ungerne fandtes)
export function updateBonus(state) {
  const got = (state.zoo.bonus ||= []);
  const fresh = [];
  for (const w of E.fullWeeks(state)) {
    if (got.length >= BONUS.length) break;
    if (got.some((b) => b.week === w)) continue;
    got.push({ kind: BONUS[got.length].kind, week: w });
    fresh.push(BONUS[got.length - 1]);
  }
  return fresh;
}
export const bonusOf = (state) => (state.zoo.bonus || []).map((b) => ({ ...BONUS.find((x) => x.kind === b.kind), week: b.week }));

export const STAGES = ['Nyfødt', 'Lille', 'Ung', 'Stor', 'Næsten voksen', 'Voksen'];

// Gæster pr. dag – zoo'ens "score", som kun vokser med mestring
const LEVEL_GUESTS = [0, 250, 600, 1200, 2000];
export function guestsPerDay(state) {
  let g = 50;
  for (const a of AREAS) g += LEVEL_GUESTS[areaLevel(state, a.id)];
  for (const f of FACTS) {
    const b = E.factBox(state, f.key);
    if (b >= 3) g += 30;
    if (b >= 5) g += 60;
  }
  return g;
}

export function zooName(state) {
  return state.zoo?.name || defaultZooName(state.name);
}
export function defaultZooName(name) {
  const n = (name || '').trim();
  if (!n) return "Zoo'en";
  return /[sxz]$/i.test(n) ? `${n}' Zoo` : `${n}s Zoo`;
}

// Stabilt "dagens" valg, så teksten ikke skifter hver gang skærmen tegnes
function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
export const dayPick = (arr, salt = '') => arr[hash(today() + salt) % arr.length];

export function taskFor(areaId) {
  const z = ZONES[areaId];
  return { title: dayPick(z.tasks, areaId), who: z.who };
}

export function homeMessage(state) {
  const zoo = zooName(state);
  if (!state.sessions.length) {
    return { who: 'bodil', text: `Velkommen til ${zoo}! Zoo'en har været lukket hele vinteren. Hjælp os med at gøre den klar – så kan vi holde den store åbningsdag.` };
  }
  const levels = AREAS.map((a) => areaLevel(state, a.id));
  if (levels.every((l) => l >= 3)) {
    return { who: 'bodil', text: `Alle områder har fået en stjerne. ${zoo} er byens bedste zoo – tak for din hjælp! 🎉` };
  }
  const due = E.factSummary(state).due;
  const pool = [
    { who: 'nora', text: due ? `Godmorgen! ${due} ${due === 1 ? 'unge' : 'unger'} i Babyhuset vil have flaske i dag 🍼` : 'Godmorgen! Ungerne i Babyhuset sover sødt i dag 🍼' },
    { who: 'kaj', text: 'Husk nu: går det ikke op, så er resten MIN! 🦜' },
    { who: 'liv', text: `Jeg er ved at male nye skilte. ${AREAS.filter((a, i) => levels[i] >= 1).length} områder er allerede åbne!` },
    { who: 'yasmin', text: 'Alle dyrene i klinikken har det godt. Jeg øver mig i at veje helt præcist – med decimaler!' },
    { who: 'bodil', text: `Stjerne-områder: ${levels.filter((l) => l >= 3).length} af ${AREAS.length}. Vi nærmer os åbningsdagen!` },
  ];
  return dayPick(pool, 'home');
}

export function goodnight(state) {
  return dayPick([
    { who: 'bodil', text: "Godt arbejde i dag. Jeg låser porten – zoo'en sover nu 🌙" },
    { who: 'kaj', text: 'Farvel, farvel! Jeg passer på resterne i nat 🦜' },
    { who: 'nora', text: 'Ungerne er puttet. Tak for hjælpen i dag! 💛' },
  ], 'night' + state.sessions.length);
}

// Tegning til et dyr ud fra dets emoji (bruges på kort, kortet over zoo'en og porten)
// Scenen for en bestemt opgave: dyret følger opgaven (fx elefantungen ved elefanternes foder),
// med tre udtryk: happy (start), think (i gang) og cheer (klaret). full = helfigur, hvis den passer.
export function sceneFor(areaId, title) {
  const s = SCENES[areaId];
  if (!s) return null;
  const i = Math.max(0, ZONES[areaId].tasks.indexOf(title));
  const kind = Array.isArray(s.cub) ? s.cub[i] || s.cub[0] : s.cub;
  const b = Object.values(BABIES).find((x) => x.kind === kind);
  return { ...s, full: s.full && kind === s.fullFor ? s.full : null, face: b?.expr || { happy: b?.img, think: b?.img, cheer: b?.img } };
}

// Starten på en mission: "Giraferne har spist alle bladene. Nora skal regne ud …"
export function missionIntroText(areaId, title, who) {
  const z = ZONES[areaId], i = z.tasks.indexOf(title);
  const t = z.intro?.[i] || `{who} har brug for din hjælp i ${AREAS.find((a) => a.id === areaId).place}.`;
  return t.replace('{who}', CAST[who]?.name || CAST[z.who].name);
}

// Slutningen på en mission: "Du hjalp Nora med giraffernes foder."
export function missionDoneText(areaId, title, who) {
  const z = ZONES[areaId], i = z.tasks.indexOf(title);
  const t = z.done[i] || `Du hjalp {who} i ${AREAS.find((a) => a.id === areaId).place}.`;
  return t.replace('{who}', CAST[who]?.name || CAST[z.who].name);
}

// Dyret bag en emoji (navn og tegning) – fx til "En girafunge er flyttet ind"
export function animalFor(emoji) {
  return Object.values(BABIES).find((b) => b.emoji === emoji) || null;
}
export const withArticle = (kind) => `${/(føl|lam|kid)$/.test(kind) ? 'et' : 'en'} ${kind}`;

export function artFor(emoji) {
  for (const b of Object.values(BABIES)) if (b.emoji === emoji && b.img) return b.img;
  return null;
}

// Hvad skal der til for områdets næste niveau? (vises i arket på kortet)
export function nextStep(state, area) {
  const p = E.areaProgress(state, area.id);
  const lv = areaLevel(state, area.id);
  const firstOpen = area.skills.find((s) => !['sikker', 'mestret'].includes(E.skillStatus(state, s.id)));
  const more = (n) => (n === 1 ? '1 færdighed mere' : `${n} færdigheder mere`);
  if (lv === 0) return `Bliv sikker i "${firstOpen.name}" for at åbne ${area.place}.`;
  if (lv === 1) return `Bliv sikker i ${more(Math.ceil(p.total / 2) - p.done)} for at gøre ${area.place} populær.`;
  if (lv === 2) return `Bliv sikker i ${more(p.total - p.done)} for at give ${area.place} en stjerne.`;
  if (lv === 3) return `Mestr alle færdigheder (sikker på to forskellige dage) for at gøre ${area.place} til et guld-område.`;
  return `${area.place} er et guld-område – flot! Øv gerne videre, så det bliver ved med at sidde.`;
}
