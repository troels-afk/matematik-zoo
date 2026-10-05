// Matematik-Zoo – skærme og interaktion.

import { AREAS, SKILLS, ALL_SKILLS, PRACTICE_SETS, FACTS, factProblem } from './curriculum.js?v=20261005095712';
import * as E from './engine.js?v=20261005095712';
import * as Z from './zoo.js?v=20261005095712';
import { zooGate } from './scene.js?v=20261005095712';
import { zooMap } from './map.js?v=20261005095712';
import { sfx, setSound, confetti, countUp } from './fx.js?v=20261005095712';
import { listProfiles, loadState, saveState, deleteProfile, slug, storageMode, flush } from './store.js?v=20261005095712';
import { esc, fmt, frac, pick, today } from './util.js?v=20261005095712';

const app = document.getElementById('app');
const S = { id: null, state: null, run: null };
let keyHandler = null;
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target instanceof HTMLInputElement) return;
  if (e.key === 'Escape' && !document.querySelector('.modal') && document.getElementById('quit')) {
    document.getElementById('quit').click();
    return;
  }
  keyHandler?.(e);
});

function view(html, onKey = null) {
  app.innerHTML = html;
  keyHandler = onKey;
  window.scrollTo(0, 0);
}
const $ = (sel) => app.querySelector(sel);
const $$ = (sel) => [...app.querySelectorAll(sel)];
const on = (sel, ev, fn) => $$(sel).forEach((el) => el.addEventListener(ev, fn));
const save = (now = false) => saveState(S.id, S.state, { now });
const areaOf = (id) => AREAS.find((a) => a.id === id) || PRACTICE_SETS.find((a) => a.id === id);
const ME = ['🦊', '🐼', '🦒', '🐧', '🦁', '🐨', '🦓', '🐢'];
const meAvatar = (name) => ME[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % ME.length];

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// Egen bekræftelsesdialog – browserens confirm() blokeres i nogle visninger (fx app-panel/fuldskærm)
function ask(text, okText = 'Ja', cancelText = 'Nej') {
  return new Promise((resolve) => {
    const prevKey = keyHandler;
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML = `<div class="card stack center" role="dialog" aria-modal="true">
      <p class="head" style="font-size:1.25rem">${text}</p>
      <div class="row" style="justify-content:center">
        <button class="btn ghost" data-v="0">${cancelText}</button>
        <button class="btn" data-v="1">${okText}</button>
      </div></div>`;
    const done = (v) => { wrap.remove(); keyHandler = prevKey; resolve(v); };
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (b) done(b.dataset.v === '1');
      else if (e.target === wrap) done(false);
    });
    keyHandler = (e) => { if (e.key === 'Escape') done(false); else if (e.key === 'Enter') done(true); };
    document.body.appendChild(wrap);
    wrap.querySelector('[data-v="1"]').focus();
  });
}

function migrate(st) {
  const d = E.newState(st.name);
  for (const k of Object.keys(d)) if (st[k] === undefined) st[k] = d[k];
  st.settings = { ...d.settings, ...st.settings };
  st.records = { ...d.records, ...st.records };
  st.zoo = { ...d.zoo, ...st.zoo };
  setSound(st.settings.sound);
  return st;
}

// ---------- Små byggeklodser ----------

const avatar = (who, size = '') => {
  const c = Z.CAST[who];
  return `<span class="avatar ${size} who-${who} ${c.img ? 'has-img' : ''}" aria-hidden="true">${c.img ? `<img src="${c.img}" alt="" draggable="false">` : c.emoji}</span>`;
};
const say = (who, text, size = '') => `
  <div class="say">${avatar(who, size)}
    <div class="bubble"><span class="who">${Z.CAST[who].name} · ${Z.CAST[who].role}</span><span class="txt">${text}</span></div>
  </div>`;

// Tegnede ikoner i stedet for emoji: de tre missionstrin, Øvebanen, lyd og dagens mission
const UI_ICONS = {
  baby: 'img/ui/babyhuset.webp', area: 'img/ui/zoo-omraade.webp', round: 'img/ui/zoo-runden.webp',
  oeve: 'img/ui/oevebane.webp', lyd: 'img/ui/lyd.webp', opgave: 'img/ui/opgave.webp',
};
const ui = (key) => `<img class="ui-ic" src="${UI_ICONS[key]}" alt="" draggable="false">`;

function baby(key, size = '') {
  const b = Z.BABIES[key];
  const box = E.factBox(S.state, key);
  const due = box >= 0 && S.state.facts[key].due <= today();
  const cls = box < 0 ? 'new' : box >= 5 ? 'gold' : '';
  const title = box < 0 ? 'Ikke født endnu' : `${b.name} (${b.kind}) – ${Z.STAGES[box]}`;
  return `<span class="baby ${size} ${cls} has-img" style="--st:${Math.max(0, box)}" title="${esc(title)}"><img src="${b.img}" alt="" draggable="false">${due ? '<i class="zz">🍼</i>' : ''}</span>`;
}

// Lad en unge reagere: 'happy' (hop + hjerter), 'think' (hovedvip), 'grow' (pop + stjerner)
function babyReact(el, kind) {
  if (!el) return;
  el.classList.remove('idle', 'react-happy', 'react-think', 'react-grow');
  void el.offsetWidth;
  el.classList.add(`react-${kind}`);
  const fx = { happy: ['💛', '💛'], grow: ['✨', '⭐', '✨'], think: [] }[kind];
  fx.forEach((e, i) => {
    const s = document.createElement('i');
    s.className = 'fx';
    s.textContent = e;
    s.style.setProperty('--dx', `${-50 + (i - (fx.length - 1) / 2) * 90}%`);
    s.style.animationDelay = `${i * 0.08}s`;
    el.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  });
  setTimeout(() => { el.classList.remove(`react-${kind}`); el.classList.add('idle'); }, 1000);
}

function weekDots(st) {
  const n = E.weekSessions(st);
  return `<span class="week" title="${n} af ${E.WEEK_GOAL} dage denne uge">${Array.from({ length: E.WEEK_GOAL }, (_, i) => `<i class="d ${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
}

const levelsOf = (st) => AREAS.map((a) => Z.areaLevel(st, a.id));

// ================= Profiler =================

async function showProfiles() {
  let profiles = [];
  try { profiles = await listProfiles(); } catch { /* vis tom liste */ }
  view(`
    <section class="hero">${zooGate('Matematik-Zoo', { animals: ['🦒', '🐘', '🦁', '🐧', '🦓', '🦊'], art: Z.artFor })}</section>
    <div class="welcome center">
      <h1 style="margin-top:26px">Hvem skal passe zoo'en i dag?</h1>
      <div class="profiles">
        ${profiles.map((p) => `<button class="profile-btn" data-id="${esc(p.id)}"><span class="avatar lg">${meAvatar(p.name)}</span>${esc(p.name)}</button>`).join('')}
        <button class="profile-btn" id="new"><span class="avatar lg" style="background:var(--primary-soft)">＋</span>Ny profil</button>
      </div>
      <button class="link small" id="restore" style="margin-top:14px">Gendan fra backup</button>
      <form id="newform" class="card stack" style="display:none;max-width:480px;margin:0 auto;text-align:left">
        ${say('bodil', 'Hej! Jeg er Bodil, direktør for zoo\'en. Hvad hedder du?')}
        <div><label class="lbl" for="nm">Dit navn</label><input id="nm" class="field" maxlength="24" autocomplete="off" autocapitalize="words"></div>
        <div><label class="lbl" for="zn">Hvad skal din zoo hedde?</label><input id="zn" class="field" maxlength="28" autocomplete="off" autocapitalize="words" placeholder="fx Solsikke Zoo"></div>
        <button class="btn big" type="submit">Åbn porten</button>
      </form>
    </div>`);
  on('.profile-btn[data-id]', 'click', (e) => openProfile(e.currentTarget.dataset.id));
  on('#new', 'click', () => { $('#newform').style.display = 'block'; $('#nm').focus(); });
  on('#restore', 'click', pickBackup);
  on('#nm', 'input', () => { $('#zn').placeholder = Z.defaultZooName($('#nm').value); });
  on('#newform', 'submit', async (e) => {
    e.preventDefault();
    const name = $('#nm').value.trim();
    if (!name) return $('#nm').focus();
    let id = slug(name), n = 2;
    while (profiles.find((p) => p.id === id)) id = `${slug(name)}-${n++}`;
    S.id = id;
    S.state = migrate(E.newState(name));
    S.state.zoo.name = $('#zn').value.trim() || Z.defaultZooName(name);
    await save(true);
    rememberProfile(id);
    startScreen();
  });
}

function rememberProfile(id) {
  try { localStorage.setItem('mr_last', id); } catch { /* ignore */ }
}

async function openProfile(id) {
  const st = await loadState(id);
  if (!st) return showProfiles();
  S.id = id;
  S.state = migrate(st);
  rememberProfile(id);
  startScreen();
}

// Første gang: vis introen, ellers direkte til zoo'en
const startScreen = () => (S.state.zoo.introSeen ? showHome() : showIntroTour());

// ================= Om appen: baggrund, pensum og forskning =================

function showAbout(back = showHome) {
  const skillCount = AREAS.reduce((n, a) => n + a.skills.length, 0);
  const rows = AREAS.map((a) => `<tr><td>${a.icon} ${a.place}</td><td>${a.name}</td><td>${a.skills.map((sk) => sk.name).join(', ')}</td></tr>`).join('');
  const principle = (icon, title, body, src) => `
    <div class="card principle">
      <div class="pr-ic">${icon}</div>
      <div><h3>${title}</h3><p>${body}</p>${src ? `<p class="src">${src}</p>` : ''}</div>
    </div>`;
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button><span class="muted">Tilbage</span></div>
    <section class="area-hero" style="--ac:var(--c-maal)">
      <span class="big">📚</span>
      <div style="flex:1;min-width:220px"><h1 style="margin:0">Om appen</h1>
        <div class="muted" style="font-weight:700">Hvorfor Matematik-Zoo er bygget, som den er: pensum, forskning og de valg, vi har truffet.</div></div>
    </section>

    <div class="about stack">
      <div class="card">
        <h2>Formålet</h2>
        <p>Appen skal hjælpe en elev i 4. klasse med at komme struktureret igennem <b>hele årets matematikpensum</b> – lidt hver dag, uden pres og uden reklamer. Zoo'en er rammen, der gør det sjovt at komme tilbage, men det er matematikken, der får zoo'en til at vokse.</p>
      </div>

      <div class="card">
        <h2>Pensum</h2>
        <p>Indholdet følger de fire kompetenceområder i Fælles Mål for matematik (tal og algebra, geometri og måling, statistik og sandsynlighed samt matematiske kompetencer) og er struktureret som i lærebogssystemet KonteXt+ 4. Det giver ${skillCount} færdigheder fordelt på ${AREAS.length} områder i zoo'en – plus gangetabellen i Babyhuset.</p>
        <div class="table-wrap"><table><thead><tr><th>Sted i zoo'en</th><th>Emne</th><th>Færdigheder</th></tr></thead><tbody>${rows}
          <tr><td>🍼 Babyhuset</td><td>Gangetabellen</td><td>De 36 gangestykker fra 2 til 9</td></tr></tbody></table></div>
        <p class="small muted">Hver færdighed har tre niveauer. Øvebanen rummer desuden lektiepakker lavet ud fra konkrete lektieark.</p>
      </div>

      <h2 class="section-title" style="margin-bottom:0">Det bygger appen på</h2>
      ${principle('🔁', 'Spredt gentagelse', 'Gangestykker huskes bedre, når man henter dem frem med voksende mellemrum. Hver unge i Babyhuset er et gangestykke i et "Leitner-system": den kommer igen efter 1, 2, 4, 7 og 14 dage, så længe den huskes – og hurtigt igen, hvis den driller.', 'Kilde: forskning i genkaldelse og spaced repetition (fx Rohrer).')}
      ${principle('🔀', 'Blandede opgaver', 'Opgavetyper blandes i stedet for at komme i lange blokke. I et studie med 4.-klasseelever fik de, der øvede blandet, 77 % rigtige dagen efter mod 38 % for dem, der øvede én type ad gangen.', 'Kilde: Taylor & Rohrer (2010).')}
      ${principle('🎯', 'Sværhedsgrad der passer', 'Hver færdighed har tre niveauer. Appen går op efter 3 rigtige i træk og ned efter 2 forkerte, så eleven typisk rammer 80–90 % rigtige. En færdighed er "sikker" ved 8 af 10 rigtige og "mestret", når den sidder på to forskellige dage.', 'Kilde: mestringslæring, Education Endowment Foundation.')}
      ${principle('🧱', 'Fra konkret til abstrakt', 'Nye emner starter med en tegning eller et gennemregnet eksempel trin for trin – tallinjer, brøkstænger, positionstabeller – før der regnes med tal alene.', 'Kilde: konkret–billede–abstrakt (CPA) og EEF\'s vejledning om matematikundervisning.')}
      ${principle('💬', 'Forklaringer i stedet for kryds', 'Ved et forkert svar vises den rigtige løsning med en strategi, fx "7 × 8 = 7 × 7 + 7". Opgaven kommer igen senere. Uddybende feedback virker bedre end bare rigtigt/forkert.', 'Kilde: Shute (2008) om formativ feedback.')}
      ${principle('🦁', 'Matematikken er selve spillet', 'Historien om zoo\'en ligger mellem opgaverne, og regnestykkerne handler om zoo\'ens dyr og gæster. Når matematikken er selve aktiviteten, lærer børn mere og spiller længere, end når den bare er en adgangsbillet til et spil.', 'Kilde: Habgood & Ainsworth (Zombie Division); Walkington (2013) om personlige tekstopgaver.')}
      ${principle('🌱', 'Ingen straf og ingen belønninger udefra', 'Der er ingen liv, point-fradrag, ranglister, butik eller valuta. Belønningen er, at ungerne vokser og zoo\'en bliver større. Ydre belønninger kan svække lysten til at lære, og straf for fejl kan skabe matematikangst.', 'Kilde: Deci, Koestner & Ryan (1999).')}
      ${principle('⏱️', 'Tid uden pres', 'Tidtagning findes kun i den valgfrie "Slå din rekord" – og kun på gangestykker, der allerede sidder. Træningen tager ca. 15 minutter, og målet er 4 dage om ugen.', 'Kilde: What Works Clearinghouse (2021) om flydende regnefærdighed.')}
      ${principle('👨‍👧', 'Forældre som medspillere', 'Forældresiden viser, hvad der driller, og foreslår spørgsmål til en snak i bilen. Ros strategien ("smart at du brugte 7 × 7 først") frem for "du er klog".', 'Kilde: Gunderson m.fl. om ros; Berkowitz m.fl. (2015) om fælles matematik derhjemme.')}

    </div>`, (e) => { if (e.key === 'Escape') back(); });
  on('#back', 'click', back);
}

// ================= Intro: sådan spiller du =================

function showIntroTour(done = showHome) {
  const st = S.state, zname = Z.zooName(st);
  const someBabies = FACTS.slice(0, 6).map((f, i) => {
    const b = Z.BABIES[f.key];
    return `<span class="baby has-img" style="--st:${i}"><img src="${b.img}" alt="" draggable="false"></span>`;
  }).join('');
  const pages = [
    {
      art: `<img class="tour-portrait" src="${Z.CAST.bodil.bust}" alt="Bodil">`,
      title: `Velkommen til ${esc(zname)}!`,
      body: say('bodil', `Zoo'en har været lukket hele vinteren, og jeg har brug for en ny zoo-leder. Det er dig, ${esc(st.name)}!`),
    },
    {
      art: `<div class="tour-icons">${AREAS.map((a) => `<span style="--ac:${a.color}">${a.icon}</span>`).join('')}</div>`,
      title: 'Målet: den store åbningsdag',
      body: say('bodil', `Zoo'en har ${AREAS.length} områder. Hvert område bliver bedre, når du bliver god til noget matematik – så flytter der nye dyr ind og kommer flere gæster. Når alle ${AREAS.length} områder har fået en ⭐, holder vi åbningsfest!`),
    },
    {
      art: `<ol class="plan">
        <li><span class="n">1</span><div><div class="t">Morgenrunde i Babyhuset</div><div class="d">Giv ungerne flaske – gangetabellen</div></div><span class="ico">${ui('baby')}</span></li>
        <li><span class="n">2</span><div><div class="t">Dagens opgave</div><div class="d">Hjælp Nora, Liv, Yasmin eller Kaj med en opgave i zoo'en</div></div><span class="ico">${ui('area')}</span></li>
        <li><span class="n">3</span><div><div class="t">Runde i zoo'en</div><div class="d">Et par blandede opgaver fra hele zoo'en</div></div><span class="ico">${ui('round')}</span></li>
      </ol>`,
      title: 'Sådan går en dag',
      body: say('nora', 'Det tager cirka 15 minutter. Prøv at komme forbi 4 dage om ugen – så vokser zoo\'en hurtigt.'),
    },
    {
      art: `<div class="tour-babies">${someBabies}</div>`,
      title: 'Ungerne i Babyhuset',
      body: say('nora', `Hvert gangestykke er en dyreunge. Når du husker gangestykket – også dagen efter – vokser ungen, til den er voksen. Kan du få alle ${FACTS.length} unger voksne?`),
    },
    {
      art: `<img class="tour-portrait" src="${Z.CAST.kaj.full}" alt="Kaj">`,
      title: 'Bare rolig!',
      body: say('kaj', 'Regner du forkert, sker der ikke noget. Du får en forklaring, og opgaven kommer igen senere. Og går en division ikke op, så er resten MIN!'),
    },
  ];
  let i = 0;
  const finish = () => { st.zoo.introSeen = true; save(); done(); };
  const render = () => {
    const p = pages[i], last = i === pages.length - 1;
    view(`
      <div class="card sheet tour stack">
        <div class="spread"><span class="kicker">Sådan spiller du · ${i + 1}/${pages.length}</span><button class="link small" id="skip">Spring over</button></div>
        <div class="tour-visual">${p.art}</div>
        <h1 class="center">${p.title}</h1>
        ${p.body}
        <div class="tour-dots">${pages.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="row" style="justify-content:center">
          ${i ? '<button class="btn ghost big" id="prev">←</button>' : ''}
          <button class="btn big" id="next">${last ? 'Åbn porten!' : 'Næste'}</button>
        </div>
      </div>`, (e) => {
      if (e.key === 'Enter' || e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft' && i) { i--; render(); }
      else if (e.key === 'Escape') finish();
    });
    on('#next', 'click', next);
    on('#prev', 'click', () => { i--; render(); });
    on('#skip', 'click', finish);
  };
  const next = () => { sfx('tap'); if (i === pages.length - 1) finish(); else { i++; render(); } };
  render();
}

// ================= Forsiden: zoo'en =================

// ---------- Ark nedefra (bruges på zoo-kortet) ----------
let sheetEl = null;
function openSheet(html, bind) {
  if (!sheetEl) {
    sheetEl = document.createElement('div');
    sheetEl.className = 'bsheet';
    sheetEl.setAttribute('role', 'dialog');
    document.body.appendChild(sheetEl);
  }
  sheetEl.innerHTML = `<div class="grab"></div><button class="sheet-x" aria-label="Luk">✕</button>${html}`;
  requestAnimationFrame(() => sheetEl.classList.add('open'));
  sheetEl.querySelector('.sheet-x').addEventListener('click', closeSheet);
  sheetEl.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeSheet));
  bind?.(sheetEl);
  (sheetEl.querySelector('.btn:not(.ghost)') || sheetEl.querySelector('.btn'))?.focus({ preventScroll: true });
}
function closeSheet() { sheetEl?.classList.remove('open'); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheetEl?.classList.contains('open')) closeSheet(); }, true);

// Dagens missioner: { date, area (den seneste), done: [områder klaret i dag], mission, chips }
const todayLog = (st) => (st.zoo.today?.date === today() ? st.zoo.today : null);

function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y0) / 86400000 + 1) / 7);
}

// Dagens opgaver: hvert foreslået område med sin egen faste figur, så historien hænger sammen
function dailyTasks(st) {
  const sugg = E.suggestAreas(st, 3);
  // Kun missioner, der er gjort færdige i dag – et stop midtvejs lader missionen stå åben
  const log = todayLog(st);
  const doneAreas = new Set(log ? log.done || [log.area] : []);
  return sugg.map((areaId) => {
    const z = Z.ZONES[areaId], who = z.who;
    // opgaver, der nævner en anden hjælper ved navn, passer ikke til figuren
    const others = ['nora', 'liv', 'yasmin', 'kaj'].filter((w) => w !== who).map((w) => Z.CAST[w].name);
    const titles = z.tasks.filter((t) => !others.some((n) => t.includes(n)));
    const title = Z.dayPick(titles.length ? titles : z.tasks, areaId);
    return { area: areaId, who, title, done: doneAreas.has(areaId) };
  });
}

function showHome() {
  if (reloadWhenIdle) { location.reload(); return; }
  closeSheet();
  const st = S.state;
  const zname = Z.zooName(st);
  const levels = levelsOf(st);
  const fs = E.factSummary(st);
  const tasks = dailyTasks(st);
  const log = todayLog(st);
  const doneToday = !!log?.mission;
  const openTasks = tasks.filter((t) => !t.done);
  if (!openTasks.some((t) => t.area === S.mission)) S.mission = (openTasks[0] || tasks[0]).area;
  const mapData = {
    zooName: zname,
    guests: Z.guestsPerDay(st),
    stars: levels.filter((l) => l >= 3).length,
    week: { n: E.weekSessions(st), goal: E.WEEK_GOAL, label: `Uge ${isoWeek()}` },
    areas: AREAS.map((a, i) => ({ id: a.id, place: a.place, level: levels[i], levelName: Z.LEVELS[levels[i]].name })),
    tasks: doneToday ? [] : tasks.filter((t) => t.area === S.mission).map((t) => ({ area: t.area, done: false, active: true, who: { ...Z.CAST[t.who], id: t.who } })),
    due: fs.due,
    bodil: Z.CAST.bodil.bust,
  };
  const open = openTasks;
  const mission = tasks.find((t) => t.area === S.mission);
  const first = mission;
  const freshBonus = Z.updateBonus(st);
  if (freshBonus.length) save();

  view(`
    <div class="home-top">
      <button class="me-chip" id="switch" title="Skift profil" aria-label="${esc(st.name)} – skift profil"><span class="avatar">${meAvatar(st.name)}</span><span class="nm">${esc(st.name)}</span><svg class="me-swap" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5h10M9 2l3 3-3 3M14 11H4M7 8l-3 3 3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="row" style="gap:8px">
        <button class="icon-btn pill" id="oeve" aria-label="Øvebanen">${ui('oeve')}<span>Øvebanen</span></button>
        <button class="icon-btn" id="help" title="Sådan spiller du" aria-label="Sådan spiller du">?</button>
        <button class="icon-btn" id="about" title="Om appen" aria-label="Om appen"><svg class="info-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.5" fill="currentColor"/></svg></button>
        <button class="icon-btn" id="parent" title="Forælder" aria-label="Forælder (kræver kode)"><svg class="info-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="15.6" r="1.4" fill="currentColor"/></svg></button>
        <button class="icon-btn snd ${st.settings.sound ? '' : 'off'}" id="snd" aria-label="Lyd" aria-pressed="${st.settings.sound}">${ui('lyd')}</button>
      </div>
    </div>

    ${doneToday ? missionDone(log) : missionCard(st, mission, open)}

    <div class="section-title"><h2>Din zoo</h2><span class="muted small">Tryk på et område for at øve noget bestemt</span></div>
    <section class="map-wrap">
      <div class="map-scroll">${zooMap(mapData)}</div>
    </section>
`);

  const mapEl = $('.zoo-map');
  const act = (t) => {
    sfx('tap');
    if (t.dataset.task) {
      // Før træningen: figuren bliver dagens mission øverst. Efter: vis opgaven i et ark.
      taskSheet(tasks.find((x) => x.area === t.dataset.task));
    }
    else if (t.dataset.area) showPlace(t.dataset.area);
    else if (t.dataset.baby) babySheet();
    else if (t.dataset.bodil) bodilSheet(levels, first);
  };
  mapEl.addEventListener('click', (e) => { const t = e.target.closest('.m-tap'); if (t) act(t); });
  // På smalle skærme kan kortet scrolles sidelæns: start med missionens figur i midten
  const scroller = $('.map-scroll'), who = $('.zm-who');
  if (who && scroller.scrollWidth > scroller.clientWidth) scroller.scrollLeft = who.offsetLeft - scroller.clientWidth / 2;
  on('#start', 'click', () => { sfx('tap'); runSession(mission.area, mission); });
  on('#again', 'click', () => { sfx('tap'); taskSheet(first); });
  on('#see-baby', 'click', () => { sfx('tap'); babySheet(); });
  on('#oeve', 'click', () => { sfx('tap'); showPracticeHub(); });
  on('#help', 'click', () => showIntroTour());
  on('#about', 'click', () => showAbout());
  on('#snd', 'click', () => {
    st.settings.sound = !st.settings.sound;
    setSound(st.settings.sound);
    save();
    $('#snd').classList.toggle('off', !st.settings.sound);
    $('#snd').setAttribute('aria-pressed', st.settings.sound);
    sfx('tap');
  });
  on('#switch', 'click', () => { try { localStorage.removeItem('mr_last'); } catch { /* */ } showProfiles(); });
  on('#parent', 'click', parentGate);
  if (freshBonus.length) setTimeout(() => bonusSheet(freshBonus), 400);
}

// ================= MissionScene: én fælles scene for alle 9 missioner =================
// Områdets tegning bagest, dyret i midten og missionens figur forrest. Samme scene følger
// missionen hele vejen: state 'intro' (der søges hjælp), 'progress' (i gang) og 'success' (klaret).
// size: 'hero' (forsiden og slutningen), 'card' (overgangen i træningen), 'thumb' (missionslinjen).
const FACE = { intro: 'happy', progress: 'think', success: 'cheer' };
const hasScene = (t) => !!(Z.SCENES[t.area] && Z.CAST[t.who]?.full);
const PARTY = `<span class="party" aria-hidden="true">${'<i></i>'.repeat(9)}</span>`;

function missionScene(t, state = 'intro', size = 'hero', opts = {}) {
  const sc = Z.sceneFor(t.area, t.title), c = Z.CAST[t.who];
  if (size === 'thumb') {
    return sc ? `<span class="mt-scene" aria-hidden="true"><img class="mts-bg" src="${sc.bg}" alt="" draggable="false"><img class="mts-ani" src="${sc.face[FACE[state]]}" alt="" draggable="false"></span>` : '';
  }
  if (!hasScene(t)) return '';
  const animal = sc.full
    ? `<img class="ms-animal full" src="${sc.full}" alt="" draggable="false">`
    : `<img class="ms-animal cub" src="${sc.face[FACE[state]]}" alt="" draggable="false">`;
  const line = opts.say ?? (size === 'hero' && { intro: 'Vi har brug for din hjælp!', success: 'Tak for hjælpen! 💛' }[state]);
  return `<div class="mission-scene ms-${state} ms-${size} ${opts.locked ? 'ms-locked' : ''}" role="img" aria-label="${esc(sc.alt)}">
      <img class="ms-bg" src="${sc.bg}" alt="" draggable="false">
      ${animal}
      <img class="ms-who" src="${c.full}" alt="" draggable="false">
      ${line ? `<span class="ms-say" aria-hidden="true">${line}</span>` : ''}${state === 'success' ? PARTY : ''}
    </div>`;
}

// "Giraferne har spist alle bladene. <b>Nora</b> skal regne ud …"
function missionIntroHtml(t) {
  const name = Z.CAST[t.who]?.name || '';
  return esc(Z.missionIntroText(t.area, t.title, t.who)).replace(new RegExp(`\\b${name}\\b`), `<b>${name}</b>`);
}

// "Du hjalp <b>Nora</b> med giraffernes foder."
function missionDoneHtml(t) {
  const name = Z.CAST[t.who]?.name || '';
  return esc(Z.missionDoneText(t.area, t.title, t.who)).replace(new RegExp(`\\b${name}\\b`), `<b>${name}</b>`);
}

// Dagens mission: hvem har brug for hjælp, hvad skal der ske, og én knap
function missionCard(st, t, open) {
  const a = areaOf(t.area), z = Z.ZONES[t.area], c = Z.CAST[t.who];
  const cur = E.currentSkill(st, t.area);
  return `
    <section class="mission card ${hasScene(t) ? 'has-scene' : ''}">
      ${missionScene(t, 'intro')}
      <div class="mission-body">
        <span class="kicker with-ic">${ui('opgave')}Dagens mission · ${a.place}</span>
        <h1>${t.title}</h1>
        <p class="mission-need">${missionIntroHtml(t)}</p>
        <ol class="mission-steps">
          <li><span class="si">${ui('baby')}<i>1</i></span><span><b>Morgenrunde</b> · giv ungerne i Babyhuset flaske</span></li>
          <li><span class="si">${ui('area')}<i>2</i></span><span><b>${a.place}</b> · ${z.step} <span class="topic">${cur ? SKILLS[cur].name : 'repetition'}</span></span></li>
          <li><span class="si">${ui('round')}<i>3</i></span><span><b>Runde i zoo'en</b> · et par blandede opgaver</span></li>
        </ol>
        <div class="mission-go">
          <button class="btn big" id="start">Start missionen</button>
          <span class="muted small">ca. 15 minutter</span>
        </div>

      </div>
    </section>`;
}

// Efter dagens mission: samme scene som ved starten, nu i "efter"-tilstand
function missionDone(log) {
  const t = { area: log.area, who: log.mission.who, title: log.mission.title };
  const chips = (log.chips || []).slice(0, 3);
  return `
    <section class="mission card done ${hasScene(t) ? 'has-scene' : ''}">
      ${missionScene(t, 'success')}
      <div class="mission-body">
        <span class="kicker with-ic">${ui('opgave')}${esc(t.title)} <span class="ok">✓</span></span>
        <h1>Mission klaret!</h1>
        <p class="mission-need">${missionDoneHtml(t)}</p>
        ${chips.length ? `<ul class="payoff-extras">${chips.map((w) => `<li><span class="e">${w.e}</span>${esc(w.t)}</li>`).join('')}</ul>` : ''}
        <div class="mission-go">
          <button class="btn ghost" id="again">Tag en vagt mere</button>
          <button class="link" id="see-baby">Se Babyhuset</button>
        </div>
      </div>
    </section>`;
}

function taskSheet(t) {
  const a = areaOf(t.area), cur = E.currentSkill(S.state, t.area);
  openSheet(`
    ${say(t.who, `<b>${t.title}</b> – kan du hjælpe mig? Vi starter med morgenrunden i Babyhuset.`)}
    <div class="sheet-plan"><span>${ui('baby')}Morgenrunde</span><span>→</span><span>${ui('area')}${a.place} · ${Z.ZONES[t.area].step}</span><span>→</span><span>${ui('round')}Runde i zoo'en</span></div>
    <div class="row" style="justify-content:flex-end">
      <button class="btn ghost" data-close>Senere</button>
      <button class="btn" id="go-task">Start dagens vagt</button>
    </div>`, (el) => el.querySelector('#go-task').addEventListener('click', () => { closeSheet(); runSession(t.area, t); }));
}


function babySheet() {
  const st = S.state, fs = E.factSummary(st);
  const list = FACTS.filter((f) => E.factBox(st, f.key) >= 0)
    .map((f) => ({ f, due: st.facts[f.key].due <= today() }))
    .sort((a, b) => (b.due - a.due) || E.factBox(st, b.f.key) - E.factBox(st, a.f.key));
  const cribs = list.length
    ? list.slice(0, 15).map(({ f, due }) => `<div class="crib ${due ? '' : 'sleep'}">${baby(f.key)}<span>${Z.BABIES[f.key].name}${due ? ' 🍼' : ' 💤'}</span></div>`).join('')
    : '<p class="muted">Babyhuset er tomt endnu. De første unger bliver født i morgenrunden.</p>';
  openSheet(`
    <div class="sheet-head"><span class="sheet-ic art">${ui('baby')}</span><div><h2 style="margin:0">Babyhuset</h2>
      <span class="muted">${fs.introduced} af ${fs.total} unger født · ${fs.due ? `${fs.due} vil have flaske i dag` : 'alle sover sødt'}</span></div></div>
    <div class="cribs">${cribs}</div>
    ${bonusBlock(st)}
    <div class="row" style="justify-content:flex-end">
      ${sprintEligible(st) ? '<button class="btn ghost" id="sb-sprint">⚡ Slå din rekord</button>' : ''}
      <button class="btn" id="sb-book">📖 Dyrebogen</button>
    </div>`, (el) => {
    el.querySelector('#sb-book').addEventListener('click', () => { closeSheet(); showBook(); });
    el.querySelector('#sb-sprint')?.addEventListener('click', () => { closeSheet(); startSprint(); });
  });
}

// Bonus-unger: én pr. hel uge med WEEK_GOAL øvedage (vises i Babyhuset-arket)
function bonusBlock(st) {
  const got = Z.bonusOf(st), n = E.weekSessions(st);
  return `<div class="bonus-sec">
      <div class="spread"><b>Bonus-unger</b><span class="muted small">${got.length} af ${Z.BONUS.length}</span></div>
      ${got.length ? `<div class="cribs">${got.map((x) => `<div class="crib"><span class="baby has-img idle"><img src="${x.img}" alt="" draggable="false"></span><span>${x.name}</span></div>`).join('')}</div>` : ''}
      <p class="small muted" style="margin:0">${got.length < Z.BONUS.length
        ? `En ny bonus-unge flytter ind, hver gang du øver ${E.WEEK_GOAL} dage i samme uge. Denne uge: ${Math.min(n, E.WEEK_GOAL)} af ${E.WEEK_GOAL}.`
        : 'Alle bonus-unger er flyttet ind. Flot!'}</p>
    </div>`;
}

// Når der er kommet bonus-unger, siden appen sidst var åben (fx uger fra før de fandtes)
function bonusSheet(fresh) {
  openSheet(`
    <div class="sheet-head"><span class="sheet-ic art">${ui('baby')}</span><div><h2 style="margin:0">${fresh.length === 1 ? 'En ny bonus-unge!' : `${fresh.length} nye bonus-unger!`}</h2>
      <span class="muted">For hver uge, hvor du øver ${E.WEEK_GOAL} dage, flytter en ny unge ind i Babyhuset.</span></div></div>
    <div class="cribs">${fresh.map((x) => `<div class="crib"><span class="baby lg has-img react-grow"><img src="${x.cheer || x.img}" alt="" draggable="false"></span><span>${x.name}<br><span class="muted">${x.kind}</span></span></div>`).join('')}</div>
    <div class="row" style="justify-content:flex-end"><button class="btn" data-close>Velkommen!</button></div>`);
  sfx('level');
}

function bodilSheet(levels, first) {
  const st = S.state, msg = Z.homeMessage(st);
  const stars = levels.filter((l) => l >= 3).length;
  openSheet(`
    ${say('bodil', msg.who === 'bodil' ? msg.text : `Godt at se dig, ${esc(st.name)}!`)}
    <div class="goal-line"><span>🎯 <b>${stars} af ${AREAS.length}</b> områder har fået en stjerne. Når alle har, holder vi åbningsfest!</span>
      <div class="goal-bar"><i style="width:${(100 * levels.reduce((s, l) => s + Math.min(l, 3), 0)) / (3 * AREAS.length)}%"></i></div></div>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Tak, Bodil</button><button class="btn" id="b-go">Start dagens vagt</button></div>`,
  (el) => el.querySelector('#b-go').addEventListener('click', () => taskSheet(first)));
}

function sprintEligible(st) {
  return st.settings.sprint && FACTS.filter((f) => E.factBox(st, f.key) >= 2).length >= 6;
}

// ================= Et område: "nu er jeg inde i dette zoo-område" =================
// Samme scene som missionerne, en kort fortælling, områdets fremgang (niveau, dyr og næste mål)
// og matematikken som aktiviteter i zoo'en. Færdigheder, progression og låse er de samme som før.

function showPlace(areaId) {
  const st = S.state, a = areaOf(areaId), z = Z.ZONES[areaId];
  const lv = Z.areaLevel(st, areaId);
  const t = { area: areaId, who: z.who, title: '' };
  const story = esc(z.story || z.blurb).replace('{who}', `<b>${Z.CAST[z.who].name}</b>`);
  const cap = (x) => x[0].toUpperCase() + x.slice(1);
  // Niveauvejen: Åben → Populær → Stjerne → Guld (under opbygning står først, indtil området åbner)
  const path = (lv ? '' : `<li class="now"><span>${Z.LEVELS[0].icon}</span><b>${Z.LEVELS[0].name}</b></li>`)
    + [1, 2, 3, 4].map((n) => `<li class="${n < lv ? 'done' : n === lv ? 'now' : ''}" title="${Z.LEVELS[n].name}"><span>${Z.LEVELS[n].icon}</span>${n === lv ? `<b>${Z.LEVELS[n].name}</b>` : ''}</li>`).join('');
  // Dyrene, der flytter ind ved niveau 1, 2 og 3
  const animals = z.animals.map((e, i) => {
    const b = Z.animalFor(e), open = lv > i;
    return `<li class="${open ? 'open' : i === lv ? 'next' : ''}" title="${open && b ? cap(b.kind) : 'Flytter ind senere'}">
      <span class="pa-img">${b?.img ? `<img src="${b.img}" alt="" draggable="false">` : e}</span><span class="pa-nm">${open && b ? cap(b.kind) : '?'}</span></li>`;
  }).join('');
  const label = { ny: 'Ny', øver: 'I gang', sikker: 'Klaret ⭐', mestret: 'Mester 🌟' };
  const acts = a.skills.map((sk, i) => {
    const status = E.skillStatus(st, sk.id), unlocked = E.isUnlocked(st, sk.id);
    const done = ['sikker', 'mestret'].includes(status);
    const act = Z.ACTIVITIES[sk.id] || { name: sk.name, desc: sk.desc };
    return `<li class="act ${done ? 'done' : unlocked ? 'open' : 'locked'}">
      <span class="act-n" aria-hidden="true">${done ? '✓' : unlocked ? i + 1 : '🔒'}</span>
      <div class="act-body">
        <span class="act-name">${act.name}${unlocked ? ` <span class="st ${status}">${label[status]}</span>` : ''}</span>
        <span class="act-desc">${act.desc}</span>
        <span class="act-skill">${sk.name}</span>
      </div>
      ${unlocked
        ? `<div class="act-go"><button class="btn ghost sm" data-intro="${sk.id}">Se hvordan</button><button class="btn sm" data-practice="${sk.id}">Start</button></div>`
        : `<span class="act-lock">Åbner, når "${Z.activityName(a.skills[i - 1])}" er klaret</span>`}
    </li>`;
  }).join('');
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage til kortet">←</button><span class="muted">Zoo-kortet</span></div>
    <section class="mission card place-hero ${hasScene(t) ? 'has-scene' : ''}">
      ${missionScene(t, 'intro', 'hero', { say: lv ? `Velkommen til ${a.place}!` : `Hjælp med at åbne ${a.place}!`, locked: !lv })}
      <div class="mission-body">
        <span class="kicker">${a.name}</span>
        <h1>${a.place}</h1>
        <p class="mission-need">${story}</p>
        <div class="place-prog">
          <ol class="pp-path" aria-label="Niveau: ${Z.LEVELS[lv].name}">${path}</ol>
          <ol class="pp-animals" aria-label="Dyrene i ${a.place}">${animals}</ol>
          <p class="pp-next">${esc(Z.nextGoal(st, a))}</p>
        </div>
      </div>
    </section>
    <div class="section-title"><h2>Det kan du hjælpe med</h2><span class="muted small">Den næste aktivitet åbner, når den forrige er klaret</span></div>
    <ol class="acts">${acts}</ol>`, (e) => { if (e.key === 'Escape') showHome(); });
  on('#back', 'click', showHome);
  on('[data-practice]', 'click', (e) => { sfx('tap'); startPractice(e.currentTarget.dataset.practice); });
  on('[data-intro]', 'click', (e) => showIntro(e.currentTarget.dataset.intro, () => showPlace(areaId), 'Tilbage'));
}

// ================= Øvebanen: oversigt over lektiepakker =================

function showPracticeHub() {
  const st = S.state;
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button><span class="muted">Zoo'en</span></div>
    <section class="area-hero" style="--ac:var(--c-tal)">
      <span class="big">${ui('oeve')}</span>
      <div style="flex:1;min-width:200px"><h1 style="margin:0">Øvebanen</h1>
        <div class="muted" style="font-weight:700">Øv et bestemt emne – fx ugens lektier. Hvert emne starter med et eksempel, der viser trin for trin, hvordan man gør.</div></div>
    </section>
    <div class="practice-sets" style="margin-top:16px">${PRACTICE_SETS.map((set) => `
      <button class="practice-set" data-set="${set.id}" style="--ac:${set.color}">
        <span class="ps-ic">${set.icon}</span>
        <span class="ps-body"><span class="head ps-nm">${set.name}</span><span class="ps-d">${set.desc}</span>
          <span class="ps-chips">${set.skills.map((sk) => `<span class="st ${E.skillStatus(st, sk.id)}">${sk.name}</span>`).join('')}</span></span>
        <span class="go" aria-hidden="true">→</span>
      </button>`).join('')}</div>`, (e) => { if (e.key === 'Escape') showHome(); });
  on('#back', 'click', showHome);
  on('.practice-set', 'click', (e) => { sfx('tap'); showPracticeSet(e.currentTarget.dataset.set); });
}

// ================= Øvebanen: en lektiepakke =================

function showPracticeSet(setId) {
  const st = S.state, set = PRACTICE_SETS.find((x) => x.id === setId);
  const label = { ny: 'Ny', øver: 'Øver', sikker: 'Sikker ⭐', mestret: 'Mestret 🌟' };
  const rows = set.skills.map((sk, i) => {
    const status = E.skillStatus(st, sk.id);
    const acc = E.skillAccuracy(st, sk.id, 30);
    return `<div class="card skill-row" style="--ac:${set.color}">
      <span class="wn big-n">${i + 1}</span>
      <div style="flex:1;min-width:220px">
        <h3 style="margin:0 0 2px">${sk.name} <span class="st ${status}">${label[status]}</span></h3>
        <span class="muted small">${sk.desc}${acc ? ` · ${acc.pct} % rigtige` : ''}</span>
      </div>
      <div class="row"><button class="btn ghost" data-intro="${sk.id}">💡 Se eksemplet</button><button class="btn" data-practice="${sk.id}">Øv 10 opgaver</button></div>
    </div>`;
  }).join('');
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button><span class="muted">Øvebanen</span></div>
    <section class="area-hero" style="--ac:${set.color}">
      <span class="big">${set.icon}</span>
      <div style="flex:1;min-width:200px"><h1 style="margin:0">${set.name}</h1><div class="muted" style="font-weight:700">${set.desc}</div></div>
    </section>
    <div style="margin-top:14px">${say('kaj', 'Start med eksemplet – det viser trin for trin, hvordan man gør. Opgaverne bliver sværere, efterhånden som du kan dem 🦜')}</div>
    <div class="stack" style="margin-top:16px">${rows}</div>`, (e) => { if (e.key === 'Escape') showPracticeHub(); });
  on('#back', 'click', showPracticeHub);
  on('[data-practice]', 'click', (e) => startPractice(e.currentTarget.dataset.practice));
  on('[data-intro]', 'click', (e) => showIntro(e.currentTarget.dataset.intro, () => showPracticeSet(setId), 'Tilbage'));
}

// ================= Intro til en færdighed =================

function showIntro(skillId, next, btnText = 'Jeg er klar') {
  const s = ALL_SKILLS[skillId], a = areaOf(s.area);
  const steps = s.intro.steps;
  let shown = 1;
  const go = () => {
    E.skillState(S.state, skillId).introSeen = true;
    save();
    next();
  };
  const render = () => {
    const more = steps && shown < steps.length;
    view(`
      <div class="card sheet intro-card stack">
        <div class="kicker">${a.icon} ${a.place} · ${steps ? 'Sådan gør du' : 'Nyt emne'}</div>
        <h1>${Z.ACTIVITIES[skillId]?.name || s.name}</h1>${Z.ACTIVITIES[skillId] ? `<div class="muted" style="font-weight:700;margin-top:-8px">${s.name}</div>` : ''}
        ${steps ? stepsBlock(steps, shown) : `<div class="body">${s.intro.text}</div>${s.intro.visual ? `<div class="visual">${s.intro.visual()}</div>` : ''}`}
        <div class="center">${more
          ? `<button class="btn big" id="more">Næste trin (${shown}/${steps.length})</button>`
          : `<button class="btn big" id="go">${btnText}</button>`}</div>
      </div>`, (e) => { if (e.key === 'Enter') (more ? step() : go()); });
    on('#go', 'click', go);
    on('#more', 'click', step);
    if (shown > 1) $$('.walk li').pop()?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const step = () => { sfx('tap'); shown++; render(); };
  render();
}

// Gennemregnet eksempel: trin vises ét ad gangen
const stepsBlock = (steps, shown = steps.length) => `<ol class="walk">${steps.slice(0, shown).map((st, i) => `
  <li class="${i === shown - 1 ? 'new' : ''}"><span class="wn">${i + 1}</span><div><div class="body">${st.text}</div>${st.visual ? `<div class="visual">${st.visual()}</div>` : ''}</div></li>`).join('')}</ol>`;

// ================= Sessioner =================

function snapshot(st) {
  const status = {}, unlocked = {}, boxes = {};
  for (const id of Object.keys(ALL_SKILLS)) status[id] = E.skillStatus(st, id);
  for (const id of Object.keys(SKILLS)) unlocked[id] = E.isUnlocked(st, id);
  for (const f of FACTS) boxes[f.key] = E.factBox(st, f.key);
  return { status, unlocked, boxes, levels: levelsOf(st), guests: Z.guestsPerDay(st) };
}

const blockIcon = (b) => ui(b.kind === 'warm' ? 'baby' : b.kind === 'review' ? 'round' : 'area');

function runSession(areaId, mission = null) {
  const sess = E.buildSession(S.state, areaId);
  const m = mission ? { who: mission.who, title: mission.title } : null;
  S.run = { mode: 'daily', sess, mission: m, bi: 0, ti: 0, results: [], before: snapshot(S.state), t0: Date.now(), retried: new Set() };
  goBlock();
}

// Missionslinjen øverst i træningen: missionen + de 3 trin med fremdrift
function missionTrack(run, block) {
  if (run.mode !== 'daily') {
    const a = areaOf(run.sess.area);
    return `<div class="mission-track">
      <div class="mt-title">${a.icon} <b>${a.place}</b> · ${esc(block.sub)}</div>
      <ol class="mt-steps"><li class="current"><span class="mt-lbl">Øvelse</span> <span class="mt-count">${run.ti + 1}/${block.count}</span></li></ol></div>`;
  }
  const name = run.mission ? Z.CAST[run.mission.who].name : null;
  const title = run.mission ? `Hjælp ${name}: ${run.mission.title}` : `${areaOf(run.sess.area).place}`;
  const label = (b) => (b.kind === 'warm' ? 'Babyhuset' : b.kind === 'review' ? 'Zoo-runden' : areaOf(run.sess.area).place);
  const steps = run.sess.blocks.filter((b) => b.count).map((b) => {
    const idx = run.sess.blocks.indexOf(b);
    const state = idx < run.bi ? 'done' : idx === run.bi ? 'current' : 'todo';
    const tail = state === 'done' ? '<span class="mt-check">✓</span>' : state === 'current' ? `<span class="mt-count">${Math.min(run.ti + 1, b.count)}/${b.count}</span>` : '';
    return `<li class="${state}"><span class="mt-ic">${blockIcon(b)}</span><span class="mt-lbl">${label(b)}</span>${tail}</li>`;
  }).join('<li class="mt-arrow" aria-hidden="true">→</li>');
  // Kompakt udgave af missionens scene: samme sted og dyr – nu tænkende, mens der regnes
  const t = { area: run.sess.area, who: run.mission?.who || Z.ZONES[run.sess.area].who, title: run.mission?.title || '' };
  return `<div class="mission-track has-scene">${missionScene(t, 'progress', 'thumb')}
    <div class="mt-main"><div class="mt-title">${ui('opgave')}Mission: <b>${esc(title)}</b></div><ol class="mt-steps">${steps}</ol></div></div>`;
}

function startPractice(skillId) {
  const s = ALL_SKILLS[skillId], a = areaOf(s.area);
  const sess = { area: a.id, main: skillId, blocks: [{ kind: 'practice', title: a.place, sub: Z.ACTIVITIES[skillId]?.name || s.name, count: s.practice ? 10 : 8, skill: skillId }] };
  S.run = { mode: 'practice', sess, bi: 0, ti: 0, results: [], before: snapshot(S.state), t0: Date.now(), retried: new Set() };
  goBlock();
}

function goBlock() {
  const run = S.run, block = run.sess.blocks[run.bi];
  if (!block) return finish();
  if (!block.count) { run.bi++; return goBlock(); }
  if (run.bi === 0) return showTask();
  const prev = run.sess.blocks[run.bi - 1];
  const z = Z.ZONES[run.sess.area];
  const who = run.mission?.who || z.who;
  const line = block.kind === 'review'
    ? say('kaj', "Sidste runde! Lad os tjekke resten af zoo'en 🦜", 'lg')
    : say(who, `${prev?.kind === 'warm' ? 'Ungerne er mætte! ' : ''}Nu skal vi i gang i ${areaOf(run.sess.area).place}: ${z.step}.`, 'lg');
  // Områdets del af missionen: samme scene som på forsiden, nu i gang
  const art = run.mode === 'daily' && block.kind === 'main' && hasScene({ area: run.sess.area, who })
    ? missionScene({ area: run.sess.area, who, title: run.mission?.title || '' }, 'progress', 'card')
    : `<div class="block-art">${blockIcon(block)}</div>`;
  view(`
    ${run.mode === 'daily' ? `<div class="session-top"><button class="icon-btn" id="quit" aria-label="Stop">✕</button>${missionTrack(run, block)}</div>` : ''}
    <div class="card sheet center stack" style="margin-top:4vh">
      ${prev?.kind === 'warm' ? '<div class="kicker">✓ Opvarmning klaret</div>' : ''}
      ${art}
      <h1>${block.title}</h1>
      <div style="text-align:left">${line}</div>
      <div><button class="btn big" id="go">Videre</button></div>
    </div>`, (e) => { if (e.key === 'Enter') showTask(); });
  on('#go', 'click', showTask);
  on('#quit', 'click', quitSession);
}

function showTask() {
  const run = S.run, block = run.sess.blocks[run.bi];
  const task = E.nextTask(S.state, block, run.ti);
  // Første gang en færdighed dukker op i dagens emne: vis introen først
  if ((task.kind === 'main' || task.kind === 'practice') && !E.skillState(S.state, task.skill).introSeen) {
    return showIntro(task.skill, () => renderTask(block, task));
  }
  renderTask(block, task);
}

function renderTask(block, task) {
  const run = S.run;
  run.task = task;
  run.shownAt = Date.now();
  const p = task.p;
  let banner = '';
  if (task.kind === 'warm') {
    const b = Z.BABIES[task.fact];
    if (b.expr) [b.expr.think, b.expr.cheer].forEach((src) => { new Image().src = src; }); // forhåndsindlæs udtryk
    banner = `<div class="baby-banner">${baby(task.fact).replace('class="baby ', 'class="baby idle ').replace(' new ', ' ')}
      <div><div class="t">${b.name} vil have flaske</div><div class="s">Opvarmning med gangetabellen</div></div></div>`;
  }
  const help = (task.kind === 'main' || task.kind === 'practice') ? `<button class="link small" id="help">💡 Hjælp</button>` : '';

  view(`
    <div class="session-top">
      <button class="icon-btn" id="quit" aria-label="Stop">✕</button>
      ${missionTrack(run, block)}
    </div>
    <div class="card">
      ${banner}
      <div class="task ${p.input !== 'choice' && p.input !== 'parts' ? 'has-input' : ''}">
        <div>
          <div class="prompt">${p.prompt}</div>
          ${p.visual ? `<div class="visual">${p.visual}</div>` : ''}
          <div id="helpbox"></div>
          ${help}
        </div>
        <div class="answer-area" id="aa"></div>
      </div>
    </div>`);

  on('#quit', 'click', quitSession);
  on('#help', 'click', () => {
    const s = ALL_SKILLS[task.skill];
    $('#helpbox').innerHTML = s.intro.steps
      ? `<div class="feedback retry" style="margin-top:14px">${stepsBlock(s.intro.steps)}</div>`
      : `<div class="feedback retry" style="margin-top:14px"><div>${s.intro.text}</div>${s.intro.visual ? `<div class="explain-visual">${s.intro.visual()}</div>` : ''}</div>`;
    $('#help').remove();
  });
  mountInput(p, answer);
}

// ---------- Svar-input ----------

function mountInput(p, onSubmit) {
  const aa = $('#aa');
  if (p.input === 'choice') {
    const sym = p.choices.every((c) => c.length <= 1);
    aa.innerHTML = `<div class="choice-grid ${p.wide ? 'wide' : ''}">${p.choices.map((c, i) => `<button class="choice ${sym ? 'sym' : ''}" data-i="${i}">${esc(c)}</button>`).join('')}</div>`;
    const pickIdx = (i) => {
      if (S.run?.answered) return;
      $$('.choice').forEach((b) => (b.disabled = true));
      onSubmit(p.choices[i], i);
    };
    on('.choice', 'click', (e) => pickIdx(Number(e.currentTarget.dataset.i)));
    keyHandler = (e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= p.choices.length) pickIdx(n - 1);
      else if (p.choices.includes(e.key)) pickIdx(p.choices.indexOf(e.key));
    };
    return;
  }

  const slot = (i, extra = '') => `<div class="slot ${extra}" data-i="${i}"></div>`;
  let inputs, nSlots;
  if (p.input === 'parts') {
    nSlots = p.layout.filter((x) => typeof x === 'object').length;
    inputs = `<div class="parts">${p.layout.map((x) => {
      if (typeof x === 'string') return `<span class="pt">${x}</span>`;
      if (x.den) return `<div class="frac-input mini">${slot(x.slot, 'sm')}<div class="bar"></div><span class="den">${x.den}</span></div>`;
      return `<div class="lab-slot">${slot(x.slot, 'sm')}${x.label ? `<span class="lab">${x.label}</span>` : ''}</div>`;
    }).join('')}</div>`;
  } else {
    nSlots = p.input === 'number' ? 1 : 2;
    if (p.input === 'number') inputs = `${slot(0)}${p.unit ? `<span class="unit">${esc(p.unit)}</span>` : ''}`;
    else if (p.input === 'fraction') inputs = `<div class="frac-input">${slot(0)}<div class="bar"></div>${slot(1)}</div>`;
    else inputs = `${slot(0)}<span class="qr-word">rest</span>${slot(1)}`;
  }
  const vals = Array(nSlots).fill('');
  let active = 0;
  const multi = nSlots > 1;
  let third;
  if (p.signed) third = '<button class="key fn" data-k="neg" aria-label="Minus">±</button>';
  else if (p.input === 'number' || p.input === 'parts') third = '<button class="key fn" data-k=",">,</button>';
  else third = `<button class="key fn" data-k="next" aria-label="Skift felt">${p.input === 'fraction' ? '⇅' : '⇄'}</button>`;

  aa.innerHTML = `
    <div class="inputs">${inputs}</div>
    <div class="keypad">
      ${[7, 8, 9, 4, 5, 6, 1, 2, 3].map((d) => `<button class="key" data-k="${d}">${d}</button>`).join('')}
      ${third}<button class="key" data-k="0">0</button><button class="key fn" data-k="back" aria-label="Slet">⌫</button>
    </div>
    ${p.input === 'parts' ? '<button class="btn ghost check" data-k="next" id="nextslot">Næste felt →</button>' : ''}
    <button class="btn big check" id="check">Tjek</button>`;

  const show = (v) => v.replace('-', '−');
  const paint = () => {
    $$('.slot').forEach((el) => {
      const i = Number(el.dataset.i);
      el.textContent = show(vals[i]);
      el.classList.toggle('active', i === active);
      el.classList.toggle('empty', vals[i] === '' || vals[i] === '-');
    });
    $('#check').disabled = vals.some((v) => v === '' || v === '-');
  };
  const press = (k) => {
    if (S.run?.answered) return;
    const v = vals[active];
    if (k === 'back') vals[active] = v.slice(0, -1);
    else if (k === 'next') active = (active + 1) % nSlots;
    else if (k === 'neg') vals[active] = v.startsWith('-') ? v.slice(1) : '-' + v;
    else if (k === ',') { if (!v.includes(',')) vals[active] = (v.replace('-', '') ? v : v + '0') + ','; }
    else if (/^\d$/.test(k) && v.length < 9) vals[active] = v === '0' ? k : v === '-0' ? '-' + k : v + k;
    paint();
  };
  const submit = () => {
    if (vals.some((v) => v === '' || v === '-') || S.run?.answered) return;
    onSubmit(nSlots === 1 ? vals[0] : [...vals]);
  };
  on('.key', 'click', (e) => press(e.currentTarget.dataset.k));
  on('#nextslot', 'click', () => press('next'));
  on('.slot', 'click', (e) => { active = Number(e.currentTarget.dataset.i); paint(); });
  on('#check', 'click', submit);
  keyHandler = (e) => {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === '-' && p.signed) press('neg');
    else if (e.key === ',' || e.key === '.') press(p.input === 'number' || p.input === 'parts' ? ',' : 'next');
    else if (e.key === 'Backspace') { e.preventDefault(); press('back'); }
    else if (['Tab', '/', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', '+'].includes(e.key) && multi) { e.preventDefault(); press('next'); }
    else if (e.key === 'Enter') { e.preventDefault(); submit(); }
  };
  paint();
}

// ---------- Svar og feedback ----------

const PRAISE = ['Rigtigt!', 'Sådan!', 'Flot regnet!', 'Præcis!', 'Ja, det er rigtigt!', 'Godt tænkt!'];
const KAJ_OOPS = ['Det er sådan, man lærer! 🦜', 'Bare rolig – den kommer igen 🦜', 'Næste gang sidder den! 🦜', 'Selv papegøjer regner forkert nogle gange 🦜'];

function answerText(p) {
  if (p.answerText) return p.answerText;
  if (p.input === 'number' && p.answer < 0) return `−${fmt(-p.answer)}${p.unit ? ' ' + esc(p.unit) : ''}`;
  if (p.input === 'fraction') return frac(p.answer[0], p.answer[1]);
  if (p.input === 'qr') return `${p.answer[0]} rest ${p.answer[1]}`;
  if (p.input === 'choice') return esc(p.answer);
  return `${fmt(p.answer)}${p.unit ? ' ' + esc(p.unit) : ''}`;
}

// Et lille hint til andet forsøg – uden at give svaret væk
function factHint(key) {
  const f = FACTS.find((x) => x.key === key);
  const [x, y] = [Math.min(f.a, f.b), Math.max(f.a, f.b)];
  if (x === 2) return `×2 er det dobbelte: ${y} + ${y}.`;
  if (x === 5 || y === 5) return `×5 er halvdelen af ×10. Hvad er ${x === 5 ? y : x} × 10?`;
  if (x === 9 || y === 9) { const o = x === 9 ? y : x; return `×9: regn ${o} × 10 og træk én ${o}'er fra.`; }
  if (x === 4 || y === 4) { const o = x === 4 ? y : x; return `×4 er dobbelt af dobbelt: ${o} → ${o * 2} → ?`; }
  if (x === y) return `${x} × ${x}: tænk på ${x} × ${x - 1} = ${x * (x - 1)} og læg én ${x}'er til.`;
  return `Tænk på ${x} × ${y - 1} = ${x * (y - 1)}. Hvad bliver det med én ${x}'er mere?`;
}
const NUDGE = ['Næsten – prøv igen!', 'Ikke helt – prøv en gang til!', 'Tæt på – giv den et forsøg mere!'];

function answer(given, choiceIdx) {
  const run = S.run, block = run.sess.blocks[run.bi], task = run.task, p = task.p;
  run.answered = true;
  const ms = Date.now() - run.shownAt;
  const correct = E.checkAnswer(p, given);
  const second = !!task.second; // andet forsøg efter en fejl
  const st = S.state;
  let again = '', grew = '';
  const b = task.kind === 'warm' ? Z.BABIES[task.fact] : null;

  // Kun første forsøg tæller i den adaptive motor
  if (!second) {
    if (task.kind === 'warm') {
      const before = E.factBox(st, task.fact);
      E.recordFact(st, task.fact, correct, ms);
      const after = E.factBox(st, task.fact);
      if (correct && after > before) grew = after >= 5 ? `${b.name} er nu helt voksen! 🌟` : `${b.name} voksede: ${Z.STAGES[after].toLowerCase()} 🍼`;
      else if (correct) grew = `${b.name} er mæt og glad 🍼`;
      if (!correct && !run.retried.has(task.fact)) {
        run.retried.add(task.fact);
        block.tasks.push({ kind: 'warm', fact: task.fact, p: factProblem(FACTS.find((f) => f.key === task.fact)) });
        block.count = block.tasks.length;
      }
    } else {
      E.recordSkill(st, task.skill, correct, task.level, ms);
    }
    run.results.push({ kind: task.kind, id: task.fact || task.skill, correct });
    save();
  }
  if (!correct) again = task.kind === 'warm' ? `${b.name} kommer igen om lidt, så du kan prøve igen.` : 'Du får en lignende opgave igen senere.';

  // Ungen reagerer
  const react = (kind, src) => {
    const el = $('.baby-banner .baby');
    if (!el) return;
    el.outerHTML = baby(task.fact);
    const nb = $('.baby-banner .baby');
    if (b.expr && src) nb.querySelector('img').src = src;
    babyReact(nb, kind);
  };

  // Første fejl (ikke ved valgmuligheder): kort, venlig besked og ét forsøg til
  if (!correct && !second && p.input !== 'choice') {
    task.second = true;
    sfx('wrong');
    if (b) react('think', b.expr?.think);
    const hint = task.kind === 'warm' ? factHint(task.fact) : ALL_SKILLS[task.skill]?.intro?.text || '';
    mountInput(p, answer);
    run.answered = false;
    run.shownAt = Date.now();
    const aa = $('#aa');
    aa.insertAdjacentHTML('afterbegin', `<div class="feedback nudge"><div class="fh">${pick(NUDGE)}</div>
      ${hint ? `<button class="link small" id="hint">💡 Vis et hint</button><div id="hinttext" hidden></div>` : ''}</div>`);
    on('#hint', 'click', () => { const h = $('#hinttext'); h.innerHTML = hint; h.hidden = false; $('#hint').remove(); });
    return;
  }

  sfx(correct ? (grew && grew.includes('voksede') ? 'grow' : 'correct') : 'wrong');
  if (b) {
    const kind = !correct ? 'think' : grew && grew.includes('voksede') ? 'grow' : 'happy';
    react(kind, correct ? b.expr?.cheer : b.expr?.think);
  }

  if (p.input === 'choice') {
    $$('.choice').forEach((bt, i) => {
      if (p.choices[i] === p.answer) bt.classList.add('right');
      else if (i === choiceIdx) bt.classList.add('wrong');
    });
  }

  const praise = second ? 'Sådan – andet forsøg!' : pick(PRAISE);
  const goodBody = task.kind === 'warm'
    ? `<div style="font-weight:700">${grew || `${b.name} er mæt og glad 🍼`}</div>`
    : `<div class="small">${p.explain}</div>`;
  const fb = correct
    ? `<div class="feedback good"><div class="fh"><span class="tick">✓</span>${praise}</div>${goodBody}</div>`
    : `<div class="feedback retry">
        <div class="fh">Svaret er ${answerText(p)}</div>
        <div>${p.explain}</div>
        ${p.explainVisual ? `<div class="explain-visual">${p.explainVisual}</div>` : ''}
        ${again ? `<div class="small muted" style="margin-top:8px">${again}</div>` : ''}
        <div class="kaj">${avatar('kaj', 'sm')} ${pick(KAJ_OOPS)}</div>
      </div>`;
  const aa = $('#aa');
  const keep = p.input === 'choice' ? aa.querySelector('.choice-grid').outerHTML : '';
  aa.innerHTML = `${keep}${fb}<button class="btn big check" id="next">Næste →</button>`;
  const next = () => {
    run.answered = false;
    run.ti++;
    if (run.ti >= block.count) { run.bi++; run.ti = 0; goBlock(); } else showTask();
  };
  on('#next', 'click', next);
  keyHandler = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } };
  $('#next').focus({ preventScroll: true });
  if (!correct) aa.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function quitSession() {
  const run = S.run;
  if (run.results.length && !(await ask('Vil du stoppe nu? Det, du har lavet, er gemt.', 'Stop', 'Fortsæt'))) return;
  if (run.results.length >= 5) logRun(run);
  save(true);
  S.run = null;
  showHome();
}

function logRun(run) {
  E.logSession(S.state, {
    mode: run.mode, area: run.sess.area, main: run.sess.main,
    n: run.results.length, correct: run.results.filter((r) => r.correct).length,
    ms: Date.now() - run.t0,
  });
}

// ================= Slut på dagen =================

const LEVEL_WIN = [
  null,
  (a) => `${a.place} har åbnet – ${Z.newcomer(a.id, 1)} er flyttet ind`,
  (a) => `${a.place} er blevet populær – ${Z.newcomer(a.id, 2)} er flyttet ind`,
  (a) => `${a.place} har fået en stjerne – ${Z.newcomer(a.id, 3)} er flyttet ind`,
  (a) => `${a.place} er blevet et guld-område!`,
];

function finish() {
  const run = S.run, st = S.state;
  logRun(run);
  const bonus = Z.updateBonus(st); // en hel uge med 4 øvedage giver en bonus-unge
  const after = snapshot(st), b = run.before;
  st.zoo.bestGuests = Math.max(st.zoo.bestGuests || 0, after.guests);

  const wins = [];
  let bigWin = false;
  AREAS.forEach((a, i) => {
    for (let lv = b.levels[i] + 1; lv <= after.levels[i]; lv++) {
      wins.push({ e: Z.LEVELS[lv].icon, t: LEVEL_WIN[lv](a) });
      bigWin = true;
    }
  });
  for (const id of Object.keys(ALL_SKILLS)) {
    const s = ALL_SKILLS[id];
    if (after.status[id] === 'mestret' && b.status[id] !== 'mestret') wins.push({ e: '🌟', t: `Du har mestret ${s.name.toLowerCase()}` });
    else if (after.status[id] === 'sikker' && !['sikker', 'mestret'].includes(b.status[id])) wins.push({ e: '⭐', t: `Du er nu sikker i ${s.name.toLowerCase()}` });
    if (!s.practice && after.unlocked[id] && !b.unlocked[id]) wins.push({ e: '🔓', t: `Nyt i ${areaOf(s.area).place}: ${s.name}` });
  }
  const born = FACTS.filter((f) => b.boxes[f.key] < 0 && after.boxes[f.key] >= 0);
  const grew = FACTS.filter((f) => b.boxes[f.key] >= 0 && after.boxes[f.key] > b.boxes[f.key]);
  const names = (list) => {
    const n = list.map((f) => Z.BABIES[f.key].name);
    if (n.length === 1) return n[0];
    if (n.length <= 3) return `${n.slice(0, -1).join(', ')} og ${n[n.length - 1]}`;
    return `${n[0]}, ${n[1]} og ${n.length - 2} andre`;
  };
  if (born.length) wins.push({ e: born.slice(0, 3).map((f) => Z.BABIES[f.key].emoji).join(''), t: `${born.length === 1 ? 'En ny unge er født' : `${born.length} nye unger er født`}: ${names(born)}` });
  if (grew.length) wins.push({ e: '🍼', t: `${names(grew)} voksede` });
  bonus.forEach((x) => wins.unshift({ e: '🍼', t: `Ugens unge: ${x.name} (${x.kind}) er flyttet ind i Babyhuset` }));
  const n = run.results.length;
  const backSet = PRACTICE_SETS.find((x) => x.id === run.sess.area);
  const backArea = !backSet && run.mode === 'practice' ? AREAS.find((x) => x.id === run.sess.area) : null;
  if (run.mode === 'daily') {
    const res = missionResults(st, run, b, after, born, grew, bonus);
    // Til forsidens "Mission klaret" (lægges oven i tidligere vagter i dag)
    const prev = todayLog(st);
    st.zoo.today = {
      date: today(), area: run.sess.area, done: [...new Set([...(prev ? prev.done || [prev.area] : []), run.sess.area])],
      mission: { who: res.t.who, title: res.t.title }, chips: [res.mainChip, ...res.extras].slice(0, 3),
    };
    save(true);
    S.run = null;
    return showPayoff(st, res, b, after, bigWin);
  }
  save(true);
  S.run = null;
  const night = Z.goodnight(st);
  const diff = after.guests - b.guests;

  view(`
    <div class="card sheet center stack" style="margin-top:4vh">
      <div class="kicker">Dagen i ${esc(Z.zooName(st))} er slut</div>
      <h1>Godt arbejde, ${esc(st.name)}!</h1>
      <div>
        <div class="guest-count" id="gc">${fmt(b.guests)}</div>
        <div class="muted" style="font-weight:700">gæster om dagen${diff > 0 ? ` <span style="color:var(--primary-ink)">(+${fmt(diff)})</span>` : ''}</div>
      </div>
      <p class="muted">Du regnede ${n} opgaver.</p>
      ${wins.length ? `<ul class="wins">${wins.map((w) => `<li><span class="e">${w.e}</span><span>${w.t}</span></li>`).join('')}</ul>` : ''}
      <div style="text-align:left">${say(night.who, night.text)}</div>
      <div class="row" style="justify-content:center">${weekDots(st)}<span class="small muted">dage denne uge</span></div>
      <div class="row" style="justify-content:center">
        ${backSet ? `<button class="btn big" id="backset">← ${backSet.name}</button><button class="btn ghost" id="home">Til zoo'en</button>`
          : backArea ? `<button class="btn big" id="backarea">← Tilbage til ${backArea.place}</button><button class="btn ghost" id="home">Til zoo'en</button>`
          : `<button class="btn big" id="home">Til zoo'en</button>${sprintEligible(st) ? '<button class="btn ghost" id="sprint">⚡ Slå din rekord</button>' : ''}`}
      </div>
    </div>`, (e) => { if (e.key === 'Enter') (backSet ? showPracticeSet(backSet.id) : backArea ? showPlace(backArea.id) : showHome()); });
  on('#home', 'click', showHome);
  on('#backset', 'click', () => showPracticeSet(backSet.id));
  on('#backarea', 'click', () => showPlace(backArea.id));
  on('#sprint', 'click', startSprint);
  setTimeout(() => countUp($('#gc'), b.guests, after.guests, 1100), 350);
  if (bigWin) { sfx('level'); setTimeout(() => confetti(), 250); } else sfx('finish');
}

// Hvad kom der ud af missionen? Det vigtigste først: nyt dyr > guld-område > flere gæster >
// fremgang i området. Derefter højst 3 små ekstra resultater.
function missionResults(st, run, b, after, born, grew, bonus = []) {
  const area = run.sess.area;
  const m = run.mission || Z.taskFor(area);
  const t = { area, who: m.who, title: m.title };
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const moved = (a, lv) => `${cap(Z.newcomer(a.id, lv))} er flyttet ind`;
  const ups = [];
  AREAS.forEach((a, i) => { for (let lv = b.levels[i] + 1; lv <= after.levels[i]; lv++) ups.push({ a, lv }); });
  ups.sort((x, y) => (y.a.id === area) - (x.a.id === area));
  const upChip = ({ a, lv }) => (lv === 4
    ? { e: '🌟', t: `${a.place} er blevet et guld-område` }
    : { e: Z.LEVELS[lv].icon, t: `${moved(a, lv)} i ${a.place}` });
  const diff = after.guests - b.guests;
  const up = ups.find((u) => u.lv <= 3) || ups[0];

  let main, mainChip;
  if (up && up.lv <= 3) {
    const L = Z.LEVELS[up.lv], emoji = Z.ZONES[up.a.id].animals[up.lv - 1];
    main = { kind: 'animal', art: Z.artFor(emoji), emoji, kicker: `Ny beboer i ${up.a.place}!`, title: moved(up.a, up.lv), sub: `${L.icon} Nyt niveau: ${L.name}` };
    mainChip = upChip(up);
  } else if (bonus.length) {
    const nb = bonus[0];
    main = { kind: 'animal', art: nb.cheer || nb.img, emoji: nb.emoji, kicker: 'Ugens unge!', title: `${nb.name} er flyttet ind i Babyhuset`,
      sub: `${cap(Z.withArticle(nb.kind))} – fordi du har øvet ${E.WEEK_GOAL} dage i denne uge` };
    mainChip = { e: '🍼', t: `${nb.name} er flyttet ind i Babyhuset` };
  } else if (up) {
    main = { kind: 'level', emoji: '🌟', kicker: 'Nyt niveau!', title: `${up.a.place} er blevet et guld-område`, sub: 'Alt sidder – også dagen efter.' };
    mainChip = upChip(up);
  } else if (diff > 0) {
    main = { kind: 'guests', emoji: '🎟️', kicker: 'Flere gæster', title: `<span id="gc">${fmt(b.guests)}</span> gæster om dagen`, sub: `+${fmt(diff)} efter dagens vagt` };
    mainChip = { e: '🎟️', t: `+${fmt(diff)} gæster om dagen` };
  } else {
    const a = areaOf(area), p = E.areaProgress(st, area), L = Z.LEVELS[Z.areaLevel(st, area)];
    main = { kind: 'progress', icon: 'area', kicker: `${a.place} · ${L.icon} ${L.name}`, title: `${p.done} af ${p.total} aktiviteter er klaret`, sub: Z.nextGoal(st, a), pct: Math.round((100 * p.done) / p.total) };
    mainChip = { e: L.icon, t: `${p.done} af ${p.total} aktiviteter klaret i ${a.place}` };
  }

  const extras = ups.filter((u) => u !== up).map(upChip);
  bonus.filter((x) => main.title !== `${x.name} er flyttet ind i Babyhuset`).forEach((x) => extras.unshift({ e: '🍼', t: `Ugens unge: ${x.name} er flyttet ind` }));
  const ids = Object.keys(ALL_SKILLS);
  const mastered = ids.filter((id) => after.status[id] === 'mestret' && b.status[id] !== 'mestret');
  const secure = ids.filter((id) => after.status[id] === 'sikker' && !['sikker', 'mestret'].includes(b.status[id]));
  if (mastered.length) extras.push({ e: '🌟', t: mastered.length === 1 ? `Mestret: ${ALL_SKILLS[mastered[0]].name.toLowerCase()}` : `${mastered.length} færdigheder er mestret` });
  if (secure.length) extras.push({ e: '⭐', t: secure.length === 1 ? `Sikker i ${ALL_SKILLS[secure[0]].name.toLowerCase()}` : `Sikker i ${secure.length} færdigheder` });
  if (main.kind !== 'guests' && diff > 0) extras.push({ e: '🎟️', t: `+${fmt(diff)} gæster om dagen` });
  if (born.length) extras.push({ e: '🍼', t: born.length === 1 ? `Ny unge i Babyhuset: ${Z.BABIES[born[0].key].name}` : `${born.length} nye unger i Babyhuset` });
  if (grew.length) extras.push({ e: '✨', t: grew.length === 1 ? `${Z.BABIES[grew[0].key].name} voksede` : `${grew.length} unger voksede` });
  const unl = ids.find((id) => !ALL_SKILLS[id].practice && after.unlocked[id] && !b.unlocked[id]);
  if (unl) extras.push({ e: '🔓', t: `Nyt emne: ${ALL_SKILLS[unl].name}` });
  const wk = E.weekSessions(st);
  extras.push({ e: '📅', t: wk >= E.WEEK_GOAL ? `Ugens mål er nået: ${wk} dage` : `${wk} af ${E.WEEK_GOAL} dage denne uge` });
  return { t, main, mainChip, extras: extras.slice(0, 3) };
}

// Missionens slutning: samme scene som ved starten, nu i "efter"-tilstand
function showPayoff(st, res, b, after, bigWin) {
  const { t, main } = res;
  const art = main.art ? `<img src="${main.art}" alt="">` : main.icon ? ui(main.icon) : `<span aria-hidden="true">${main.emoji}</span>`;
  view(`
    <section class="mission card payoff ${hasScene(t) ? 'has-scene' : ''}">
      ${missionScene(t, 'success')}
      <div class="mission-body">
        <span class="kicker with-ic">${ui('opgave')}${esc(t.title)} <span class="ok">✓</span></span>
        <h1>Mission klaret!</h1>
        <p class="mission-need">${missionDoneHtml(t)}</p>
        <div class="payoff-main pm-${main.kind}">
          <span class="pm-art">${art}</span>
          <div class="pm-txt"><span class="pm-kicker">${esc(main.kicker)}</span><b class="pm-title">${main.title}</b>
            ${main.sub ? `<span class="pm-sub">${esc(main.sub)}</span>` : ''}${main.pct != null ? `<span class="pm-bar"><i style="width:${main.pct}%"></i></span>` : ''}</div>
        </div>
        ${res.extras.length ? `<ul class="payoff-extras">${res.extras.map((w) => `<li><span class="e">${w.e}</span>${esc(w.t)}</li>`).join('')}</ul>` : ''}
        <div class="mission-go">
          <button class="btn big" id="home">Se din zoo</button>
          ${sprintEligible(st) ? '<button class="btn ghost" id="sprint">⚡ Slå din rekord</button>' : ''}
        </div>
      </div>
    </section>`, (e) => { if (e.key === 'Enter') showHome(); });
  on('#home', 'click', showHome);
  on('#sprint', 'click', startSprint);
  if (main.kind === 'guests') setTimeout(() => countUp($('#gc'), b.guests, after.guests, 1100), 500);
  if (bigWin) { sfx('level'); setTimeout(() => confetti(), 300); } else sfx('finish');
}

// ================= Dyrebogen =================

function showBook() {
  const st = S.state;
  const fs = E.factSummary(st);
  const items = FACTS.map((f) => {
    const b = Z.BABIES[f.key], box = E.factBox(st, f.key);
    if (box < 0) {
      return `<div class="book-item locked">${baby(f.key, 'lg')}<span class="nm faint">???</span><span class="fact">${f.a} × ${f.b}</span></div>`;
    }
    return `<div class="book-item">${baby(f.key, 'lg')}
      <span class="nm">${b.name}</span><span class="kind">${b.kind}</span>
      <span class="st ${box >= 5 ? 'mestret' : box >= 3 ? 'sikker' : 'øver'}">${Z.STAGES[box]}</span>
      <span class="fact">${f.a} × ${f.b} = ${f.a * f.b}</span></div>`;
  }).join('');
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button>
      <div><h1 style="margin:0">📖 Dyrebogen</h1><span class="muted">Hver unge er et gangestykke. De vokser, når du husker dem – også dagen efter.</span></div></div>
    <div class="card" style="margin-bottom:16px">${say('nora', `${fs.introduced} af ${fs.total} unger er født. ${fs.due ? `${fs.due} vil have flaske i dag 🍼` : 'Alle er mætte lige nu.'} ${st.records.sprint ? `Din rekord: ${st.records.sprint} ⚡` : ''}`)}</div>
    <div class="book">${items}</div>
    <div class="legend">${Z.STAGES.map((s, i) => `<span>${'●'.repeat(i + 1)} ${s}</span>`).join('')}<span>🍼 = vil have flaske</span></div>
    <div class="section-title"><h2>Bonus-unger</h2><span class="muted small">Én flytter ind for hver uge med ${E.WEEK_GOAL} øvedage</span></div>
    <div class="book">${Z.BONUS.map((x) => {
      const g = Z.bonusOf(st).find((b) => b.kind === x.kind);
      return g
        ? `<div class="book-item"><span class="baby lg has-img"><img src="${x.img}" alt="" draggable="false"></span><span class="nm">${x.name}</span><span class="kind">${x.kind}</span><span class="fact">Uge ${isoWeek(new Date(g.week))}</span></div>`
        : `<div class="book-item locked"><span class="baby lg new has-img"><img src="${x.img}" alt="" draggable="false"></span><span class="nm faint">???</span><span class="fact">Øv ${E.WEEK_GOAL} dage i en uge</span></div>`;
    }).join('')}</div>
    `,
  (e) => { if (e.key === 'Escape') showHome(); });
  on('#back', 'click', showHome);
}

// ================= Slå din rekord (valgfri, kun kendte fakta) =================

function startSprint() {
  const st = S.state;
  const pool = FACTS.filter((f) => E.factBox(st, f.key) >= 2);
  const DURATION = 60;
  let score = 0, left = DURATION, cur = null, timer = null, val = '';
  const nextQ = () => {
    const f = pick(pool);
    cur = Math.random() < 0.5 ? [f.a, f.b] : [f.b, f.a];
    val = '';
    render();
  };
  const render = () => {
    $('#q').textContent = `${cur[0]} × ${cur[1]}`;
    $('#slot').textContent = val;
    $('#slot').classList.toggle('empty', val === '');
    $('#score').textContent = score;
  };
  view(`
    <div class="session-top"><button class="icon-btn" id="quit" aria-label="Stop">✕</button>
      <div class="progress"><i id="tbar" style="width:100%"></i></div><span class="timer" id="t">${DURATION}</span></div>
    <div class="card"><div class="task has-input">
      <div class="center"><p class="muted">Rigtige: <b id="score">0</b> · Din rekord: <b>${st.records.sprint}</b></p>
        <div class="prompt"><span class="big-expr" id="q"></span></div></div>
      <div class="answer-area">
        <div class="inputs"><div class="slot active empty" id="slot"></div></div>
        <div class="keypad">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map((d) => `<button class="key" data-k="${d}">${d}</button>`).join('')}
          <span></span><button class="key" data-k="0">0</button><button class="key fn" data-k="back">⌫</button></div>
        <button class="btn big check" id="ok">OK</button>
      </div></div></div>`);
  const submit = () => {
    if (!val || left <= 0) return;
    if (Number(val) === cur[0] * cur[1]) { score++; sfx('tap'); nextQ(); }
    else { $('#slot').classList.remove('shake'); void $('#slot').offsetWidth; $('#slot').classList.add('shake'); val = ''; render(); }
  };
  const press = (k) => {
    if (left <= 0) return;
    if (k === 'back') val = val.slice(0, -1);
    else if (val.length < 3) val += k;
    render();
    if (val.length === String(cur[0] * cur[1]).length) setTimeout(submit, 120);
  };
  on('.key', 'click', (e) => press(e.currentTarget.dataset.k));
  on('#ok', 'click', submit);
  on('#quit', 'click', () => { clearInterval(timer); showHome(); });
  keyHandler = (e) => {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('back');
    else if (e.key === 'Enter') submit();
  };
  nextQ();
  timer = setInterval(() => {
    if (!document.body.contains($('#t'))) return clearInterval(timer);
    left--;
    $('#t').textContent = left;
    $('#tbar').style.width = `${(100 * left) / DURATION}%`;
    if (left <= 0) {
      clearInterval(timer);
      const rec = score > st.records.sprint;
      if (rec) st.records.sprint = score;
      save(true);
      if (rec) { sfx('level'); confetti({ count: 90 }); } else sfx('finish');
      view(`<div class="card sheet center stack" style="margin-top:8vh">
        <div style="font-size:4rem">${rec ? '🏆' : '⚡'}</div>
        <h1>${score} rigtige</h1>
        <p class="muted" style="font-size:1.15rem">${rec ? 'Ny rekord! Du slog dig selv.' : `Din rekord er ${st.records.sprint}. Du kan prøve igen en anden dag.`}</p>
        <div class="row" style="justify-content:center"><button class="btn big" id="home">Til zoo'en</button><button class="btn ghost" id="again">Prøv igen</button></div>
      </div>`, (e) => { if (e.key === 'Enter') showHome(); });
      on('#home', 'click', showHome);
      on('#again', 'click', startSprint);
    }
  }, 1000);
}

// ================= Forælder =================

// Simpel børnesikring – ikke rigtig sikkerhed (koden kan ses i kildekoden)
const PARENT_PASSWORD = 'Forældre';

function parentGate() {
  view(`
    <div class="card sheet stack" style="max-width:480px;margin-top:8vh">
      <h2>Forældre-adgang</h2>
      <form id="f" class="stack">
        <div><label class="lbl" for="g">Adgangskode</label>
        <input id="g" class="field" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></div>
        <div class="row"><button class="btn" type="submit">Åbn</button><button class="btn ghost" type="button" id="back">Tilbage</button></div>
      </form>
    </div>`, (e) => { if (e.key === 'Escape') showHome(); });
  $('#g').focus();
  on('#back', 'click', showHome);
  on('#f', 'submit', (e) => {
    e.preventDefault();
    if ($('#g').value.trim() === PARENT_PASSWORD) showParent();
    else { toast('Forkert adgangskode'); $('#g').value = ''; $('#g').focus(); }
  });
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}

function showParent() {
  const st = S.state;
  const fs = E.factSummary(st);
  const trouble = E.troubleSpots(st);
  const since14 = Date.now() - 14 * 86400000;
  const recent = st.sessions.filter((s) => s.t >= since14).slice().reverse();
  const totalSkills = Object.keys(SKILLS).length;
  const sikre = Object.keys(SKILLS).filter((id) => ['sikker', 'mestret'].includes(E.skillStatus(st, id))).length;

  const areaBlocks = AREAS.map((a) => {
    const p = E.areaProgress(st, a.id);
    const rows = a.skills.map((s) => {
      const status = E.skillStatus(st, s.id);
      const ss = st.skills[s.id];
      const acc = E.skillAccuracy(st, s.id);
      return `<tr><td>${s.name}</td><td><span class="st ${status}">${status}</span></td>
        <td>${ss && ss.hist.length ? ss.level : '–'}</td>
        <td>${acc ? `${acc.pct} % <span class="muted">(${acc.n})</span>` : '–'}</td>
        <td>${ss?.last ? fmtDate(ss.last) : '–'}</td></tr>`;
    }).join('');
    return `<div class="card" style="--ac:${a.color}">
      <div class="spread"><h3 style="margin:0">${a.icon} ${a.name} <span class="muted small">· ${a.place}</span></h3><span class="muted small">${p.done}/${p.total} sikre</span></div>
      <div class="bar-mini" style="margin:8px 0 10px"><i style="width:${(100 * p.done) / p.total}%"></i></div>
      <div class="table-wrap"><table><thead><tr><th>Færdighed</th><th>Status</th><th>Niv.</th><th>Rigtige 14 d.</th><th>Sidst</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
  }).join('');

  let heat = '<div></div>';
  for (let b = 2; b <= 9; b++) heat += `<div class="h">${b}</div>`;
  for (let a = 2; a <= 9; a++) {
    heat += `<div class="h">${a}</div>`;
    for (let b = 2; b <= 9; b++) {
      const key = a <= b ? `${a}x${b}` : `${b}x${a}`;
      const box = E.factBox(st, key);
      heat += `<div class="c b${box}" title="${a}×${b}: kasse ${box < 0 ? '–' : box}">${a * b}</div>`;
    }
  }

  const troubleAreas = [...new Set(trouble.skills.map((t) => SKILLS[t.id].area))];
  const talkAreas = (troubleAreas.length ? troubleAreas : E.suggestAreas(st, 2)).slice(0, 2);
  const talk = talkAreas.flatMap((id) => areaOf(id).snak);
  if (trouble.facts.length) talk.unshift(`Spørg løbende: ${trouble.facts.slice(0, 3).map((f) => `${f.a}×${f.b}`).join(', ')} – og spørg, hvordan det blev regnet ud.`);

  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button>
      <div style="flex:1"><h1 style="margin:0">Forældreoverblik</h1><span class="muted">${esc(st.name)} · ${esc(Z.zooName(st))}</span></div>
      <button class="btn ghost" id="about-p">📚 Om appen</button></div>

    <div class="grid2">
      <div class="card stack">
        <h3>Status</h3>
        <div>📅 ${E.weekSessions(st)} af ${E.WEEK_GOAL} dage denne uge · ${E.fullWeeksStreak(st)} fulde uger i træk</div>
        <div>🧭 ${sikre} af ${totalSkills} færdigheder er sikre</div>
        <div>🍼 Gangetabel: ${fs.solid} af ${fs.total} sidder godt (${fs.introduced} introduceret, ${fs.gold} voksne)</div>
        <div>🎁 Bonus-unger: ${Z.bonusOf(st).length} af ${Z.BONUS.length} (én pr. uge med ${E.WEEK_GOAL} øvedage)</div>
        <div>📚 ${st.sessions.length} sessioner i alt${E.daysSinceLast(st) != null ? ` · sidst for ${E.daysSinceLast(st)} dag(e) siden` : ''}</div>
      </div>
      <div class="card stack">
        <h3>Driller lige nu</h3>
        ${trouble.skills.length || trouble.facts.length ? `
          ${trouble.skills.map((t) => `<div>🟠 ${SKILLS[t.id].name} <span class="muted small">(${t.acc.pct} % rigtige, ${t.acc.n} svar)</span></div>`).join('')}
          ${trouble.facts.length ? `<div>🟠 Tabeller: ${trouble.facts.map((f) => `${f.a}×${f.b}`).join(', ')}</div>` : ''}`
          : '<div class="muted">Intet driller lige nu 👍 (vises når noget har under 70 % rigtige over mindst 5 svar)</div>'}
      </div>
      <div class="card stack">
        <h3>Snak om det i bilen</h3>
        ${talk.map((t) => `<div>💬 ${t}</div>`).join('')}
        <div class="small muted">Ros strategien ("smart at du brugte 7×7 først") frem for "du er klog".</div>
      </div>
      <div class="card">
        <h3>Gangetabel</h3>
        <div class="heat">${heat}</div>
        <div class="small muted" style="margin-top:8px">Rød = drillede sidst · grøn = sidder fast · grå = ikke introduceret endnu</div>
      </div>
    </div>

    <div class="section-title"><h2>Pensum</h2></div>
    <div class="stack">${areaBlocks}</div>

    <div class="section-title"><h2>Øvebanen</h2></div>
    <div class="stack">${PRACTICE_SETS.map((set) => `<div class="card">
      <h3 style="margin:0 0 8px">${set.icon} ${set.name}</h3>
      <div class="table-wrap"><table><thead><tr><th>Emne</th><th>Status</th><th>Niv.</th><th>Rigtige 14 d.</th><th>Sidst</th></tr></thead><tbody>
      ${set.skills.map((sk) => { const ss = st.skills[sk.id], acc = E.skillAccuracy(st, sk.id), status = E.skillStatus(st, sk.id);
        return `<tr><td>${sk.name}</td><td><span class="st ${status}">${status}</span></td><td>${ss && ss.hist.length ? ss.level : '–'}</td>
        <td>${acc ? `${acc.pct} % <span class="muted">(${acc.n})</span>` : '–'}</td><td>${ss?.last ? fmtDate(ss.last) : '–'}</td></tr>`; }).join('')}
      </tbody></table></div></div>`).join('')}</div>

    <div class="section-title"><h2>Seneste 14 dage</h2></div>
    <div class="card table-wrap">
      ${recent.length ? `<table><thead><tr><th>Dato</th><th>Hvad</th><th>Opgaver</th><th>Rigtige</th><th>Tid</th></tr></thead><tbody>
        ${recent.map((s) => `<tr><td>${fmtDate(s.t)}</td><td>${s.mode === 'practice' ? 'Øvede: ' : ''}${areaOf(s.area)?.place || ''}${s.main ? ` · ${ALL_SKILLS[s.main]?.name || ''}` : ''}</td>
          <td>${s.n}</td><td>${s.correct}</td><td>${Math.round(s.ms / 60000)} min</td></tr>`).join('')}
      </tbody></table>` : '<p class="muted">Ingen sessioner endnu.</p>'}
    </div>

    <div class="section-title"><h2>Indstillinger</h2></div>
    <div class="card stack">
      <div class="spread"><label class="lbl" for="zname" style="margin:0">Zoo'ens navn</label>
        <div class="row"><input id="zname" class="field" style="max-width:280px;min-height:48px" maxlength="28" value="${esc(Z.zooName(st))}"><button class="btn ghost" id="zsave">Gem</button></div></div>
      <div class="spread"><span>Længde på dagens træning</span>
        <div class="seg" id="len"><button data-v="kort">Kort (~10 min)</button><button data-v="normal">Normal (~15 min)</button></div></div>
      <div class="spread"><span>"Slå din rekord" (tidtagning, kun kendte tabeller)</span>
        <div class="seg" id="spr"><button data-v="1">Til</button><button data-v="0">Fra</button></div></div>
      <div class="spread"><span>Lyd</span>
        <div class="seg" id="snd"><button data-v="1">Til</button><button data-v="0">Fra</button></div></div>
      <div class="spread"><span class="muted small">Data gemmes ${storageMode() === 'api' ? 'på serveren (deles mellem enheder)' : 'på denne enhed – tag en backup en gang imellem'}.</span>
        <button class="btn ghost" id="del">Slet profil</button></div>
    </div>

    <div class="section-title"><h2>Backup og app</h2></div>
    <div class="card stack">
      <p style="margin:0">Gem en kopi af ${esc(st.name)}s fremskridt som en fil. Den kan gendanne fremskridtet eller flytte det til en anden enhed.</p>
      <div class="row"><button class="btn" id="bk-save">Gem backup</button><button class="btn ghost" id="bk-load">Indlæs backup</button></div>
      <p class="small muted" style="margin:0">Som app på iPad: åbn siden i Safari → Del → "Føj til hjemmeskærm". Appen på hjemmeskærmen har sit eget lager, så gem en backup i Safari først og indlæs den i appen bagefter.</p>
    </div>`, (e) => { if (e.key === 'Escape') showHome(); });

  const paintSeg = () => {
    $$('#len button').forEach((b) => b.classList.toggle('on', b.dataset.v === st.settings.length));
    $$('#spr button').forEach((b) => b.classList.toggle('on', (b.dataset.v === '1') === st.settings.sprint));
    $$('#snd button').forEach((b) => b.classList.toggle('on', (b.dataset.v === '1') === st.settings.sound));
  };
  on('#len button', 'click', (e) => { st.settings.length = e.currentTarget.dataset.v; save(); paintSeg(); });
  on('#spr button', 'click', (e) => { st.settings.sprint = e.currentTarget.dataset.v === '1'; save(); paintSeg(); });
  on('#snd button', 'click', (e) => { st.settings.sound = e.currentTarget.dataset.v === '1'; setSound(st.settings.sound); save(); paintSeg(); });
  on('#zsave', 'click', () => {
    const v = $('#zname').value.trim();
    st.zoo.name = v || Z.defaultZooName(st.name);
    save();
    toast('Navnet er gemt');
  });
  on('#back', 'click', showHome);
  on('#about-p', 'click', () => showAbout(showParent));
  on('#bk-save', 'click', exportBackup);
  on('#bk-load', 'click', pickBackup);
  on('#del', 'click', async () => {
    if (!(await ask(`Slet ${esc(st.name)}s profil og alt fremskridt?`, 'Slet', 'Annullér'))) return;
    if (!(await ask('Er du helt sikker?', 'Ja, slet', 'Annullér'))) return;
    await flush();
    await deleteProfile(S.id);
    try { localStorage.removeItem('mr_last'); } catch { /* */ }
    S.id = null; S.state = null;
    showProfiles();
  });
  paintSeg();
}

// ================= Backup: gem og indlæs fremskridt som fil =================

async function exportBackup() {
  await flush();
  const data = { app: 'matematik-zoo', format: 1, saved: new Date().toISOString(), id: S.id, state: S.state };
  const name = `matematik-zoo-${S.id}-${today()}.json`;
  const file = new File([JSON.stringify(data)], name, { type: 'application/json' });
  // På iPad: del-arket (Gem i Filer, AirDrop, mail). På computer: almindelig download.
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Matematik-Zoo backup' }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  toast('Backup gemt');
}

function pickBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', () => { if (input.files[0]) importBackup(input.files[0]); });
  input.click();
}

async function importBackup(file) {
  let data = null;
  try { data = JSON.parse(await file.text()); } catch { /* håndteres nedenfor */ }
  const st = data?.app === 'matematik-zoo' ? data.state : null;
  if (!st || typeof st.name !== 'string' || !st.facts || !st.skills || !Array.isArray(st.sessions)) {
    toast('Filen er ikke en backup fra Matematik-Zoo');
    return;
  }
  const id = data.id || slug(st.name);
  let existing = null;
  try { existing = await loadState(id); } catch { /* ny profil */ }
  const when = new Date(data.saved).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });
  const q = existing
    ? `Erstat ${esc(existing.name)}s fremskridt her med backuppen fra ${when}?`
    : `Indlæs ${esc(st.name)}s fremskridt fra ${when}?`;
  if (!(await ask(q, existing ? 'Erstat' : 'Indlæs', 'Annullér'))) return;
  S.id = id;
  S.state = migrate(st);
  await save(true);
  rememberProfile(id);
  toast('Fremskridtet er indlæst');
  startScreen();
}

// ================= Webapp: offline og hurtig start =================

let reloadWhenIdle = false;
const swOptIn = (() => { try { return localStorage.getItem('mz_sw') === '1'; } catch { return false; } })();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || swOptIn)) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(() => { /* appen virker også uden */ });
  // En ny version er hentet: genindlæs, når hun ikke er midt i en træning
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    if (S.run) reloadWhenIdle = true;
    else location.reload();
  });
  navigator.storage?.persist?.().catch(() => { /* ikke understøttet */ });
}

// ================= Start =================

(async function boot() {
  let last = null;
  try { last = localStorage.getItem('mr_last'); } catch { /* */ }
  if (last) {
    try {
      const st = await loadState(last);
      if (st) { S.id = last; S.state = migrate(st); return startScreen(); }
    } catch { /* fald tilbage til profilvalg */ }
  }
  showProfiles();
})();

// Til fejlfinding i konsollen
window.__mo = { S, E, Z, babyReact, scene: missionScene, backup: { exportBackup, importBackup }, show: { home: showHome, parent: showParent, book: showBook, profiles: showProfiles, tour: showIntroTour, about: showAbout, set: showPracticeSet, practice: startPractice } };
