// Zoo-universet: figurer, dyreunger, områder, niveauer og beskeder.
// Se univers-zoo.md. Historien vises kun MELLEM opgaverne – aldrig mens der regnes.

import { AREAS, FACTS } from './curriculum.js?v=20261006220244';
import * as E from './engine.js?v=20261006220244';
import { today } from './util.js?v=20261006220244';

// Figurernes tegninger: ansigt (talebobler og kortet) og helfigur (missionernes scener).
// Bodil har en buste (introen og kortet). Emojien bruges kun som reserve, hvis en tegning mangler.
const art = (id) => ({ img: `img/cast/${id}-face.webp`, full: `img/cast/${id}.webp` });

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
  decimal: { bg: 'img/map/05-dyreklinik.webp', cub: ['dovendyrunge', 'pindsvineunge', 'skildpaddeunge'], alt: 'Dyreklinikken' },
  geometri: { bg: 'img/map/06-zebra-naesehorn.webp', cub: ['zebraføl', 'næsehornsunge', 'zebraføl'], alt: 'Zebraernes og næsehornenes anlæg' },
  maaling: { bg: 'img/map/07-rovdyrsomraade.webp', cub: ['tigerunge', 'løveunge', 'tigerunge'], alt: 'Rovdyrområdet' },
  data: { bg: 'img/map/08-data-plaza.webp', cub: 'pandaunge', alt: 'Data-pladsen' },
  algebra: { bg: 'img/map/09-skattejagt.webp', cub: 'ræveunge', alt: 'Skattejagten i skoven' },
};

// Opgaveskærmenes scene pr. område (Batch 1, img/task/): ét samlet billede af områdets miljø i et bredt bånd
// øverst i opgaven – opgaven står altid under. Billedet fylder altid båndets bredde (det zoomes aldrig længere
// ind) og beskæres kun lodret: y er udsnittet i det normale bånd (3:1), yk i det kompakte (18:5), som bruges,
// når opgaven har sin egen tegning, i brede kolonner (iPad på højkant) og når pladsen ikke rækker. Udsnittene
// skærer ingen ansigter over (hatte, ører og horn må gerne skæres) – tjek med tools/opgavescener/lav.py tjek.
// Skattejagten har intet kompakt udsnit (papegøjen og Liv står for langt fra hinanden) og beholder det normale.
// Liv er med i alle billederne. (Billederne laves af tools/opgavescener/lav.py ud fra billeder-raa/batch1-opgavescener/.)
export const TASK_SCENES = {
  tal: { src: 'img/task/tal.webp', y: '30%', yk: '13%' },           // Liv ved porten og flamingoerne
  gange: { src: 'img/task/gange.webp', y: '18%', yk: '14%' },       // Liv og giraffen ved foderkasserne
  division: { src: 'img/task/division.webp', y: '8%', yk: '11%' },  // aberne med bananer og Liv
  brok: { src: 'img/task/brok.webp', y: '23%', yk: '23%' },         // Liv giver pingvinen en fisk, sælen dukker op
  decimal: { src: 'img/task/decimal.webp', y: '25%', yk: '26%' },   // dovendyret på klinikkens vægt
  geometri: { src: 'img/task/geometri.webp', y: '26%', yk: '39%' }, // zebraen, Liv og næsehornet
  maaling: { src: 'img/task/maaling.webp', y: '28.5%', yk: '35%' }, // Zoo-uret, tigeren, Liv og løven
  data: { src: 'img/task/data.webp', y: '42%', yk: '40%' },         // Liv ved søjlediagrammet og pandaen
  algebra: { src: 'img/task/algebra.webp', y: '7.5%' },             // papegøjen, Liv og aben ved skattekisten
};

// Forklaringernes zoo-billeder (Batch 2, img/explain/): det konkrete billede mellem symbolet og reglen,
// fx 1 kg = 1.000 g → fodersække på en vægt. Bruges via `pic` i intro (siden), intro.cards (kortet) og opgaver.
// (Uret havde kun én viser; minutviseren er tegnet ind, så det viser klokken 4 – som rødpandaen peger på.)
export const EXPLAIN_PICS = {
  vaegt: { src: 'img/explain/vaegt.webp', alt: 'To sække foder på en vægt' },
  rumfang: { src: 'img/explain/rumfang.webp', alt: 'En stor målekande og et lille målebæger med vand og en pingvinunge' },
  laengde: { src: 'img/explain/laengde.webp', alt: 'En giraf kigger over et hegn med et målebånd' },
  ur: { src: 'img/explain/ur.webp', alt: 'En rød panda peger på zoo-uret, der viser klokken 4' },
  soejle: { src: 'img/explain/soejle.webp', alt: 'En elefantunge viser et søjlediagram' },
  bananer: { src: 'img/explain/bananer.webp', alt: 'En abeunge ved en kasse fuld af bananer' },
  fisk: { src: 'img/explain/fisk.webp', alt: 'En sælunge ved en spand fisk' },
  kodelaas: { src: 'img/explain/kodelaas.webp', alt: 'En tigerunge ved en kiste med kodelås' },
  klinik: { src: 'img/explain/klinik.webp', alt: 'En skildpadde bliver vejet på dyreklinikken' },
};

// Zoo'ens miljøer (Batch 3, img/zoo/): sekundære billeder til stemning og lokal kontekst – små felter i
// billedernes egne proportioner, aldrig i stedet for opgaver, knapper, tekst eller figurerne. Hentes først,
// når de vises (loading="lazy"); w/h reserverer pladsen, så intet hopper.
export const ENV_PICS = {
  indgang: { src: 'img/zoo/indgang.webp', w: 503, h: 339 },       // Bodil ved porten
  flamingoer: { src: 'img/zoo/flamingoer.webp', w: 507, h: 337 },
  giraffer: { src: 'img/zoo/giraffer.webp', w: 477, h: 328 },
  polar: { src: 'img/zoo/polar.webp', w: 503, h: 324 },
  aber: { src: 'img/zoo/aber.webp', w: 509, h: 318 },
  elefanter: { src: 'img/zoo/elefanter.webp', w: 477, h: 319 },
  klinik: { src: 'img/zoo/klinik.webp', w: 501, h: 314 },         // dyrlægen (som Yasmin) og den røde panda
  foderlager: { src: 'img/zoo/foderlager.webp', w: 507, h: 328 },
  observation: { src: 'img/zoo/observation.webp', w: 477, h: 320 }, // kikkert, kort og noter
};
// Hvert områdes miljø (områdesiden og "Øvelse klaret!") og runden i zoo'en, der skifter fra dag til dag
export const AREA_ENV = {
  tal: 'indgang', gange: 'foderlager', division: 'aber', brok: 'polar', decimal: 'klinik',
  geometri: 'elefanter', maaling: 'giraffer', data: 'observation', algebra: 'observation',
};
export const ROUND_ENV = ['flamingoer', 'elefanter', 'giraffer', 'aber', 'polar', 'indgang'];

// Øvebanen som en sti (Batch 4, img/bg/): én baggrund pr. område + Øvebanens egen øvebane – liggende (l, 3:2) til
// computer og iPad på langs, stående (s, 2:3) til telefon og iPad på højkant. Figurerne står i venstre side
// (øverst i den stående), så sedlen med opgaven kan ligge i den rolige del.
export const PRACTICE_BG = Object.fromEntries(['tal', 'gange', 'division', 'brok', 'decimal', 'geometri', 'maaling', 'data', 'algebra', 'oevebane']
  .map((k) => [k, { l: `img/bg/${k}-l.webp`, s: `img/bg/${k}-s.webp` }]));
// Hvilken scene hver disciplin på Øvebanen står i
export const DISC_BG = {
  'd-tal': 'tal', 'd-plusminus': 'tal', 'd-gange': 'gange', 'd-regneregler': 'oevebane', 'd-division': 'division',
  'd-brok': 'brok', 'd-decimal': 'decimal', 'd-ligninger': 'algebra', 'd-moenstre': 'algebra', 'd-linjer': 'geometri',
  'd-figurer': 'geometri', 'd-koordinater': 'oevebane', 'd-areal': 'geometri', 'd-maal': 'maaling', 'd-tid': 'maaling',
  'd-diagrammer': 'data', 'd-beskriv': 'data', 'd-chance': 'data',
};

// Ekstra zoo-indhold pr. pensumområde (id'erne matcher AREAS i curriculum.js)
// intro[i] og done[i] er starten og slutningen på tasks[i] ({who} = missionens figur)
export const ZONES = {
  tal: {
    animals: ['🦩', '🦢', '🦆'], who: 'liv', blurb: 'Indgangen, billetlugen og flamingosøen', step: 'tæl gæster og billetter',
    story: 'Her ved indgangen sælger {who} billetter, tæller gæster og holder øje med flamingosøen. Alle tal skal passe, så Bodil ved, hvordan det går.',
    tasks: ['Tæl dagens gæster i billetlugen', 'Lav besøgsrapporten til Bodil', 'Der er kø ved billetlugen – hjælp til!'],
    intro: ['Der står gæster i kø ved billetlugen – mange vil se flamingoerne. {who} skal vide, hvor mange der kommer i dag.', 'Bodil vil vide, hvor mange gæster der har været ved flamingosøen og resten af zoo\'en. {who} har brug for hjælp til tallene.', 'Alle vil ind og se den nye flamingounge, og køen ved billetlugen bliver længere og længere. {who} har brug for en hurtig regnehjælper.'],
    done: ['Du hjalp {who} med at tælle dagens gæster.', 'Du hjalp {who} med besøgsrapporten til Bodil.', 'Du fik køen ved billetlugen til at glide.'],
  },
  gange: {
    animals: ['🦒', '🐘', '🦛'], who: 'nora', blurb: 'Her bestilles foder til de store dyr', step: 'regn foderet ud til de store dyr',
    story: 'I Foderlageret bestiller {who} foder til de store dyr. Giraferne, elefanterne og flodhestene spiser rigtig meget – og alt skal regnes ud.',
    tasks: ['Bestil blade til giraferne', 'Regn ugens foder ud til elefanterne', 'Hjælp Nora med den store foderbestilling'],
    intro: ['Giraferne har spist alle bladene. {who} skal regne ud, hvor mange nye der skal bestilles.', 'Elefanterne spiser enormt meget. {who} skal regne foderet ud til hele ugen.', 'Giraferne, elefanterne og flodhestene skal alle have foder. Den store bestilling skal sendes i dag, og {who} har mange tal at holde styr på.'],
    done: ['Du hjalp {who} med giraffernes foder.', 'Du hjalp {who} med elefanternes foder til hele ugen.', 'Du hjalp {who} med den store foderbestilling.'],
  },
  division: {
    animals: ['🐒', '🐿️', '🦫'], who: 'kaj', blurb: 'Maden fordeles ligeligt – resten går til Kaj', step: 'fordel maden ligeligt mellem dyrene',
    story: 'I abehuset skal maden deles helt lige, så ingen bliver snydt. Det, der bliver til overs, holder {who} skarpt øje med.',
    tasks: ['Fordel bananerne ligeligt mellem aberne', 'Gør madskålene klar til abehuset', 'Del frugten ud – Kaj holder øje med resten'],
    intro: ['Aberne skændes om bananerne. {who} vil have dem delt helt lige.', 'Der skal være lige meget i hver madskål. {who} holder øje fra sin gren.', 'Frugten skal deles ud til aberne – og det, der bliver til overs, vil {who} gerne have!'],
    done: ['Du fordelte bananerne ligeligt mellem aberne.', 'Du hjalp {who} med madskålene til abehuset.', 'Du delte frugten ud – og Kaj fik resten.'],
  },
  brok: {
    animals: ['🦭', '🐻‍❄️', '🦦'], who: 'liv', blurb: 'Bassiner, fiskespande og pingvinunger', step: 'del fisk og bassiner i brøkdele',
    story: 'Ved polarområdet passer {who} pingvinerne og sælerne. Fisk, isflager og bassiner skal deles i lige store dele.',
    tasks: ['Fyld pingvinbassinet op', 'Del fiskespandene mellem pingvinerne', 'Lav en ny madplan til sælerne'],
    intro: ['Pingvinbassinet er halvtomt. {who} skal finde ud af, hvor meget vand der mangler.', 'Fiskene skal deles retfærdigt mellem pingvinerne. {who} har brug for din hjælp.', 'Sælerne skal have en ny madplan, og {who} skal dele fiskene i brøkdele.'],
    done: ['Du hjalp {who} med at fylde pingvinbassinet op.', 'Du delte fiskespandene mellem pingvinerne.', 'Du hjalp {who} med sælernes madplan.'],
  },
  decimal: {
    animals: ['🦔', '🐢', '🦥'], who: 'yasmin', blurb: 'Dyrene vejes, måles og får medicin', step: 'vej og mål dyrene i klinikken',
    story: 'På dyreklinikken vejer og måler {who} de små dyr. Her tæller hver tiendedel – medicin skal være helt præcis.',
    tasks: ['Vej den nye dovendyrunge', 'Tjek om pindsvinet har taget på', 'Hjælp Yasmin med at måle medicin op'],
    intro: ['En ny dovendyrunge er kommet på klinikken. {who} skal veje den helt præcist.', 'Pindsvinet har været sygt. {who} vil vide, om det har taget på.', 'Skildpaddeungen skal have medicin, og den skal måles helt nøjagtigt op. {who} har brug for en sikker hånd.'],
    done: ['Du hjalp {who} med at veje den nye dovendyrunge.', 'Du hjalp {who} med at tjekke pindsvinets vægt.', 'Du hjalp {who} med at måle medicinen op til skildpaddeungen.'],
  },
  geometri: {
    animals: ['🦓', '🦏', '🐪'], who: 'nora', blurb: 'Hegn, anlæg og nye indhegninger', step: 'mål hegn og anlæg op',
    story: 'På savannen bygger {who} nye hegn og anlæg til zebraerne og næsehornene. Alt skal måles op, før dyrene kan flytte ind.',
    tasks: ['Byg et nyt hegn til zebraerne', 'Tegn det nye næsehorn-anlæg', 'Mål de nye anlæg op'],
    intro: ['Zebraerne skal have et nyt hegn. {who} skal vide, hvor langt det skal være.', 'Næsehornet skal have mere plads. {who} vil have det nye anlæg tegnet rigtigt.', 'Zebraerne og næsehornene får nye anlæg. {who} skal måle dem op, før dyrene kan flytte ind.'],
    done: ['Du hjalp {who} med zebraernes nye hegn.', 'Du hjalp {who} med at tegne næsehorn-anlægget.', 'Du hjalp {who} med at måle anlæggene op.'],
  },
  maaling: {
    animals: ['🦁', '🐯', '🐆'], who: 'liv', blurb: 'Fodringstider, rundvisninger og åbningstider', step: 'hold styr på tider og mål',
    story: 'Ved rovdyrene holder {who} styr på tiden. Løverne og tigrene skal fodres til tiden, og gæsterne vil på rundvisning.',
    tasks: ['Lav fodringsplanen for rovdyrene', 'Tjek zoo-uret før løvefodringen', 'Hold styr på tiderne til rovdyr-rundvisningen'],
    intro: ['Løverne og tigrene skal fodres til tiden. {who} laver planen og har brug for hjælp.', 'Løverne bliver sure, hvis fodringen kommer for sent. {who} skal holde øje med zoo-uret.', 'Gæsterne skal på rundvisning hos løverne og tigrene. {who} skal have styr på alle tiderne.'],
    done: ['Du hjalp {who} med rovdyrenes fodringsplan.', 'Du hjalp {who} med at holde tiden til løvefodringen.', 'Du hjalp {who} med tiderne til rovdyr-rundvisningen.'],
  },
  data: {
    animals: ['🐼', '🐨', '🦘'], who: 'kaj', blurb: 'Hvad synes gæsterne? Tæl, spørg og tegn diagrammer', step: 'tæl og tegn diagrammer over gæsterne',
    story: 'På data-pladsen spørger {who} gæsterne, hvad de synes. Svarene bliver til diagrammer på opslagstavlen.',
    tasks: ['Find gæsternes yndlingsdyr', 'Lav et diagram til opslagstavlen', 'Gør gæsteundersøgelsen færdig'],
    intro: ['{who} har spurgt gæsterne om deres yndlingsdyr. Er det mon pandaen? Nu skal svarene tælles op.', 'Opslagstavlen ved pandaerne mangler et diagram. {who} har tallene, men kan ikke tegne det selv.', 'Gæsteundersøgelsen om pandaerne, koalaerne og kænguruerne er næsten færdig. {who} mangler hjælp til de sidste tal.'],
    done: ['Du fandt gæsternes yndlingsdyr.', 'Du hjalp {who} med diagrammet til opslagstavlen.', 'Du hjalp {who} med gæsteundersøgelsen.'],
  },
  algebra: {
    animals: ['🦊', '🦝', '🦉'], who: 'kaj', blurb: 'Pote-spor og kodelåse til gæsternes skattejagt', step: 'knæk koder og følg pote-spor',
    story: 'Inde i skoven har {who} lavet en skattejagt. Pote-spor og hemmelige koder venter på at blive knækket.',
    tasks: ['Lav en skattejagt til gæsterne', 'Knæk koden til Kajs skattekiste', "Følg pote-sporet gennem zoo'en"],
    intro: ['{who} vil lave en skattejagt med hemmelige koder til gæsterne, og ræveungen har allerede gemt de første spor.', 'Ræveungen har fundet Kajs skattekiste, men {who} har glemt koden! Kan du knække den?', "Der er pote-spor over hele zoo'en – mon det er ræveungens? {who} vil vide, hvor de fører hen."],
    done: ['Du hjalp {who} med skattejagten til gæsterne.', 'Du knækkede koden til Kajs skattekiste.', 'Du fulgte pote-sporet hele vejen – det var ræveungens!'],
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
// Unger, der endnu kun har én tegning (genereret, fritlagt med tools/prep_image.py).
// Når en unge får sine tre udtryk (tools/add_batch.py), flyttes den til BABY_EXPR.
const BABY_IMAGES = {
  løveunge: 'img/babies/loeve.webp',
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

// Områdets matematik præsenteret som aktiviteter i zoo'en (kun navne og tekster – færdigheder,
// progression og låse er de samme). Bruges på områdesiden; færdighedens rigtige navn står ved siden af.
export const ACTIVITIES = {
  positionssystem: { name: 'Læs billetnumrene', desc: 'Hvad er hvert ciffer værd i de lange billetnumre?' },
  afrunding: { name: 'Rund gæstetallet af', desc: 'Bodil vil have tallene rundet af til tavlen ved indgangen.' },
  sammenlign: { name: 'Find den travleste dag', desc: 'Hvilken dag kom der flest gæster – og hvilken færrest?' },
  plusminus: { name: 'Gør kassen op', desc: 'Læg dagens billetsalg sammen, og træk fra.' },
  gange10: { name: 'Pak foderkasserne', desc: 'Kasser med 10 og 100 – hvor meget foder er der i alt?' },
  gangeflercifret: { name: 'Beregn dagens foder', desc: 'Hvor mange kilo skal giraferne og elefanterne have?' },
  gangetekst: { name: 'Fyld giraffernes vogne', desc: 'Find gangestykket i historien om foderet.' },
  divtabel: { name: 'Fordel bananerne', desc: 'Del helt lige mellem aberne – gange baglæns.' },
  divrest: { name: 'Fordel de sidste bidder', desc: 'Del maden ud – resten går til Kaj.' },
  divflercifret: { name: 'Del de store sække', desc: 'Meget foder skal deles i lige store portioner.' },
  divtekst: { name: 'Gør madskålene klar', desc: 'Lav lige store portioner og grupper til abehuset.' },
  brokfigur: { name: 'Tjek isflagerne', desc: 'Hvor stor en del af isflagen er farvet?' },
  broktallinje: { name: 'Find pingvinens plads på broen', desc: 'Hvor langt ude på broen står pingvinen?' },
  broksammenlign: { name: 'Hvem fik mest fisk?', desc: 'Sammenlign pingvinernes portioner.' },
  brokafantal: { name: 'Del fiskespandene', desc: 'Hvor mange fisk er ¾ af spanden?' },
  ligevaerdig: { name: 'Find de lige store portioner', desc: 'Find to måder at skrive den samme portion på.' },
  decfigur: { name: 'Mål medicinen op', desc: 'Tiendedele og hundrededele i målebægeret.' },
  dectallinje: { name: 'Aflæs vægten', desc: 'Hvad viser vægten, når ungen bliver vejet?' },
  decsammenlign: { name: 'Hvem vejer mest?', desc: 'Sammenlign ungernes vægt.' },
  decplusminus: { name: 'Hold styr på klinikkens tal', desc: 'Plus og minus med kilo og kroner.' },
  omkreds: { name: 'Byg hegnet', desc: 'Hvor langt skal hegnet være hele vejen rundt?' },
  areal: { name: 'Giv dyrene plads', desc: 'Hvor stor er den nye indhegning?' },
  vinkler: { name: 'Tjek hjørnerne', desc: 'Er hjørnet spidst, ret eller stumpt?' },
  enheder: { name: 'Gør foderet klar', desc: 'Kilo og gram, meter og centimeter, liter og deciliter.' },
  klokken: { name: 'Læs zoo-uret', desc: 'Hvad er klokken på uret ved løverne?' },
  tidsforskel: { name: 'Planlæg fodringen', desc: 'Hvor lang tid er der til næste fodring?' },
  soejle: { name: 'Se hvilket dyr der vandt', desc: 'Hvilket dyr fik flest stemmer?' },
  typetal: { name: 'Find gæsternes favorit', desc: 'Find det mest almindelige svar og midten.' },
  sandsynlighed: { name: 'Spot pandaen', desc: 'Hvor stor er chancen for at se pandaen?' },
  talfolger: { name: 'Følg pote-sporet', desc: 'Find mønstret i sporene, og fortsæt.' },
  ukendt: { name: 'Knæk kodelåsen', desc: 'Hvilket tal mangler i koden?' },
};
export const activityName = (skill) => ACTIVITIES[skill.id]?.name || skill.name;

// Dyret, der flytter ind, når et område når niveau 1, 2 eller 3: "en girafunge"
export function newcomer(areaId, level) {
  const b = animalFor(ZONES[areaId].animals[level - 1]);
  return b ? withArticle(b.kind) : 'et nyt dyr';
}

// Områdets næste mål i zoo-sprog: hvilket dyr flytter ind ved næste niveau
export function nextGoal(state, area) {
  const p = E.areaProgress(state, area.id), lv = areaLevel(state, area.id);
  const animal = (i) => newcomer(area.id, i + 1);
  const more = (n) => (n === 1 ? '1 aktivitet mere' : `${n} aktiviteter mere`);
  const up = (n) => `${LEVELS[n].icon} ${LEVELS[n].name}`;
  if (lv === 0) {
    const first = area.skills.find((s) => !['sikker', 'mestret'].includes(E.skillStatus(state, s.id))) || area.skills[0];
    return `Bliv sikker ⭐ i "${activityName(first)}" – så åbner ${area.place}, og ${animal(0)} flytter ind.`;
  }
  if (lv === 1) return `Bliv sikker ⭐ i ${more(Math.ceil(p.total / 2) - p.done)} – så stiger ${area.place} til ${up(2)}, og ${animal(1)} flytter ind.`;
  if (lv === 2) return `Bliv sikker ⭐ i ${more(p.total - p.done)} – så stiger ${area.place} til ${up(3)}, og ${animal(2)} flytter ind.`;
  if (lv === 3) return `Bliv sikker i alle aktiviteterne igen på en ny dag – så stiger ${area.place} til ${up(4)}.`;
  return `${area.place} er et guld-område! Øv gerne videre, så det bliver ved med at sidde.`;
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

// Tegningen af et dyr ud fra dets emoji (porten på profilvalget og "Mission klaret!")
export function artFor(emoji) {
  for (const b of Object.values(BABIES)) if (b.emoji === emoji && b.img) return b.img;
  return null;
}
