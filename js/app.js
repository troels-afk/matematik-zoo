// Matematik-Zoo – skærme og interaktion.

import { AREAS, SKILLS, ALL_SKILLS, PRACTICE_SETS, FACTS, factProblem } from './curriculum.js?v=20261004204106';
import * as E from './engine.js?v=20261004204106';
import * as Z from './zoo.js?v=20261004204106';
import { zooGate } from './scene.js?v=20261004204106';
import { zooMap } from './map.js?v=20261004204106';
import { sfx, setSound, confetti, countUp } from './fx.js?v=20261004204106';
import { listProfiles, loadState, saveState, deleteProfile, slug, storageMode, flush } from './store.js?v=20261004204106';
import { esc, fmt, frac, pick, today } from './util.js?v=20261004204106';

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
const say = (who, text) => `
  <div class="say">${avatar(who)}
    <div class="bubble"><span class="who">${Z.CAST[who].name} · ${Z.CAST[who].role}</span><span class="txt">${text}</span></div>
  </div>`;

function baby(key, size = '') {
  const b = Z.BABIES[key];
  const box = E.factBox(S.state, key);
  const due = box >= 0 && S.state.facts[key].due <= today();
  const cls = box < 0 ? 'new' : box >= 5 ? 'gold' : '';
  const title = box < 0 ? 'Ikke født endnu' : `${b.name} (${b.kind}) – ${Z.STAGES[box]}`;
  const art = b.img ? `<img src="${b.img}" alt="" draggable="false">` : `<span>${b.emoji}</span>`;
  return `<span class="baby ${size} ${cls} ${b.img ? 'has-img' : ''}" style="--st:${Math.max(0, box)}" title="${esc(title)}">${art}${due ? '<i class="zz">🍼</i>' : ''}</span>`;
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
// Dyr som tegning (eller emoji, hvis der ikke findes en tegning)
const ani = (list) => list.map((e) => { const src = Z.artFor(e); return src ? `<img class="ani-img" src="${src}" alt="" draggable="false">` : `<span>${e}</span>`; }).join('');

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
      <form id="newform" class="card stack" style="display:none;max-width:480px;margin:0 auto;text-align:left">
        ${say('bodil', 'Hej! Jeg er Bodil, direktør for zoo\'en. Hvad hedder du?')}
        <div><label class="lbl" for="nm">Dit navn</label><input id="nm" class="field" maxlength="24" autocomplete="off" autocapitalize="words"></div>
        <div><label class="lbl" for="zn">Hvad skal din zoo hedde?</label><input id="zn" class="field" maxlength="28" autocomplete="off" autocapitalize="words" placeholder="fx Solsikke Zoo"></div>
        <button class="btn big" type="submit">Åbn porten</button>
      </form>
    </div>`);
  on('.profile-btn[data-id]', 'click', (e) => openProfile(e.currentTarget.dataset.id));
  on('#new', 'click', () => { $('#newform').style.display = 'block'; $('#nm').focus(); });
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
  const someBabies = FACTS.slice(0, 6).map((f, i) => `<span class="baby" style="--st:${i}"><span>${Z.BABIES[f.key].emoji}</span></span>`).join('');
  const pages = [
    {
      art: Z.CAST.bodil.bust ? `<img class="tour-portrait" src="${Z.CAST.bodil.bust}" alt="Bodil">` : '<div class="tour-art">🦒🐘🦁🐧🦓</div>',
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
        <li><span class="n">1</span><div><div class="t">🍼 Morgenrunde i Babyhuset</div><div class="d">Giv ungerne flaske – gangetabellen</div></div></li>
        <li><span class="n">2</span><div><div class="t">🦒 Dagens opgave</div><div class="d">Hjælp Nora, Liv eller Yasmin med en opgave i zoo'en</div></div></li>
        <li><span class="n">3</span><div><div class="t">🧭 Runde i zoo'en</div><div class="d">Et par blandede opgaver fra hele zoo'en</div></div></li>
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
      art: '<div class="tour-art">🦜</div>',
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

function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y0) / 86400000 + 1) / 7);
}

// Dagens opgaver: én figur pr. foreslået område (aldrig den samme figur to gange)
function dailyTasks(st) {
  const sugg = E.suggestAreas(st, 3);
  const used = new Set();
  const doneAreas = new Set(st.sessions.filter((x) => x.date === today() && x.mode !== 'practice').map((x) => x.area));
  return sugg.map((areaId) => {
    let who = Z.ZONES[areaId].who;
    if (who === 'bodil' || used.has(who)) who = ['nora', 'liv', 'yasmin', 'kaj'].find((w) => !used.has(w));
    used.add(who);
    const others = Object.values(Z.CAST).map((c) => c.name).filter((n) => n !== Z.CAST[who].name);
    const titles = Z.ZONES[areaId].tasks.filter((t) => !others.some((n) => t.includes(n)));
    const title = Z.dayPick(titles.length ? titles : Z.ZONES[areaId].tasks, areaId);
    return { area: areaId, who, title, done: doneAreas.has(areaId) };
  });
}

function showHome() {
  closeSheet();
  const st = S.state;
  const zname = Z.zooName(st);
  const levels = levelsOf(st);
  const fs = E.factSummary(st);
  const tasks = dailyTasks(st);
  const doneToday = tasks.some((t) => t.done) || st.sessions.some((x) => x.date === today() && x.mode !== 'practice');
  const introduced = FACTS.filter((f) => E.factBox(st, f.key) >= 0)
    .map((f) => ({ f, due: st.facts[f.key].due <= today() }))
    .sort((a, b) => (b.due - a.due) || E.factBox(st, b.f.key) - E.factBox(st, a.f.key));
  const openTasks = tasks.filter((t) => !t.done);
  if (!openTasks.some((t) => t.area === S.mission)) S.mission = (openTasks[0] || tasks[0]).area;
  const mapData = {
    zooName: zname,
    guests: Z.guestsPerDay(st),
    stars: levels.filter((l) => l >= 3).length,
    week: { n: E.weekSessions(st), goal: E.WEEK_GOAL, label: `Uge ${isoWeek()}` },
    areas: AREAS.map((a, i) => ({ id: a.id, place: a.place, level: levels[i], animals: Z.ZONES[a.id].animals.map((e) => ({ emoji: e, art: Z.artFor(e) })) })),
    tasks: tasks.map((t) => ({ area: t.area, done: t.done, active: !doneToday && t.area === S.mission, who: { ...Z.CAST[t.who], id: t.who } })),
    babies: introduced.map(({ f, due }) => ({ art: Z.BABIES[f.key].img, emoji: Z.BABIES[f.key].emoji, awake: due })),
    due: fs.due,
    bodil: Z.CAST.bodil.bust,
  };
  const open = openTasks;
  const mission = tasks.find((t) => t.area === S.mission);
  const first = mission;
  const todayLog = st.zoo.today?.date === today() ? st.zoo.today : null;

  view(`
    <div class="home-top">
      <span class="me-chip"><span class="avatar">${meAvatar(st.name)}</span>${esc(st.name)}</span>
      <div class="row" style="gap:8px">
        <button class="icon-btn pill" id="oeve" aria-label="Øvebanen">📝 <span>Øvebanen</span></button>
        <button class="icon-btn" id="help" aria-label="Sådan spiller du">?</button>
        <button class="icon-btn" id="snd" aria-label="Lyd til/fra">${st.settings.sound ? '🔊' : '🔇'}</button>
      </div>
    </div>

    ${doneToday ? missionDone(st, todayLog) : missionCard(st, mission, open)}

    <div class="section-title"><h2>Din zoo</h2><span class="muted small">Tryk på et område for at øve noget bestemt</span></div>
    <section class="map-wrap">
      <div class="map-scroll">${zooMap(mapData)}</div>
    </section>
    <div class="footer-links">
      <button class="link" id="switch">Skift profil</button>
      <button class="link" id="about">Om appen</button>
      <button class="link" id="parent">Forælder</button>
    </div>`);

  const svgEl = $('.zoo-map-svg');
  const act = (t) => {
    sfx('tap');
    if (t.dataset.task) {
      // Før træningen: figuren bliver dagens mission øverst. Efter: vis opgaven i et ark.
      if (!doneToday) { S.mission = t.dataset.task; showHome(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else taskSheet(tasks.find((x) => x.area === t.dataset.task));
    }
    else if (t.dataset.area) areaSheet(t.dataset.area);
    else if (t.dataset.baby) babySheet();
    else if (t.dataset.bodil) bodilSheet(levels, first);
  };
  svgEl.addEventListener('click', (e) => { const t = e.target.closest('.m-tap'); if (t) act(t); });
  svgEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const t = e.target.closest('.m-tap'); if (t) { e.preventDefault(); act(t); } } });
  on('#start', 'click', () => { sfx('tap'); runSession(mission.area, mission); });
  on('[data-mission]', 'click', (e) => { sfx('tap'); S.mission = e.currentTarget.dataset.mission; showHome(); });
  on('#again', 'click', () => { sfx('tap'); taskSheet(first); });
  on('#see-baby', 'click', () => { sfx('tap'); babySheet(); });
  on('#oeve', 'click', () => { sfx('tap'); showPracticeHub(); });
  on('#help', 'click', () => showIntroTour());
  on('#about', 'click', () => showAbout());
  on('#snd', 'click', () => {
    st.settings.sound = !st.settings.sound;
    setSound(st.settings.sound);
    save();
    $('#snd').textContent = st.settings.sound ? '🔊' : '🔇';
    sfx('tap');
  });
  on('#switch', 'click', () => { try { localStorage.removeItem('mr_last'); } catch { /* */ } showProfiles(); });
  on('#parent', 'click', parentGate);
}

// Dagens mission: hvem har brug for hjælp, hvad skal der ske, og én knap
function missionCard(st, t, open) {
  const a = areaOf(t.area), z = Z.ZONES[t.area], c = Z.CAST[t.who];
  const cur = E.currentSkill(st, t.area);
  const art = z.animals.map((e) => Z.artFor(e)).find(Boolean);
  const portrait = c.bust || c.img
    ? `<img class="mission-face" src="${c.bust || c.img}" alt="${c.name}">`
    : `<span class="mission-emoji" aria-hidden="true">${c.emoji}</span>`;
  const others = open.filter((x) => x.area !== t.area);
  return `
    <section class="mission card">
      <div class="mission-art">${portrait}${art ? `<img class="mission-animal" src="${art}" alt="">` : ''}</div>
      <div class="mission-body">
        <span class="kicker">Dagens mission</span>
        <h1>${t.title}</h1>
        <p class="mission-need"><b>${c.name}</b> har brug for din hjælp i ${a.icon} <b>${a.place}</b>.</p>
        <ol class="mission-steps">
          <li><span class="n">1</span><span><b>Morgenrunde</b> · giv ungerne i Babyhuset flaske</span></li>
          <li><span class="n">2</span><span><b>${a.place}</b> · ${z.step} <span class="topic">${cur ? SKILLS[cur].name : 'repetition'}</span></span></li>
          <li><span class="n">3</span><span><b>Runde i zoo'en</b> · et par blandede opgaver</span></li>
        </ol>
        <div class="mission-go">
          <button class="btn big" id="start">Start missionen</button>
          <span class="muted small">ca. 15 minutter</span>
        </div>
        ${others.length ? `<div class="mission-others"><span class="muted small">Vil du hellere hjælpe en anden i dag?</span>
          ${others.map((o) => `<button class="chip-btn" data-mission="${o.area}">${avatar(o.who, 'sm')}${Z.CAST[o.who].name} · ${areaOf(o.area).place}</button>`).join('')}</div>` : ''}
      </div>
    </section>`;
}

function missionDone(st, log) {
  const a = log ? areaOf(log.area) : null;
  const wins = log?.wins?.length ? log.wins : [];
  const items = [
    ...(a ? [{ e: a.icon, t: `Du hjalp i ${a.place}` }] : []),
    ...wins.slice(0, 4),
    ...(log?.diff > 0 ? [{ e: '🎟️', t: `+${fmt(log.diff)} gæster om dagen` }] : []),
  ];
  return `
    <section class="mission done card">
      <div class="mission-art"><span class="mission-emoji" aria-hidden="true">🌙</span></div>
      <div class="mission-body">
        <span class="kicker">✓ Dagens mission er klaret</span>
        <h1>Godt arbejde, ${esc(st.name)}!</h1>
        <p class="mission-need">Det skete i zoo'en i dag:</p>
        <ul class="wins">${(items.length ? items : [{ e: '💛', t: 'Dyrene er passet, og zoo\'en sover godt i nat' }]).map((w) => `<li><span class="e">${w.e}</span><span>${w.t}</span></li>`).join('')}</ul>
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
    <div class="sheet-plan"><span>🍼 Morgenrunde</span><span>→</span><span>${a.icon} ${a.place} · ${Z.ZONES[t.area].step}</span><span>→</span><span>🧭 Runde i zoo'en</span></div>
    <div class="row" style="justify-content:flex-end">
      <button class="btn ghost" data-close>Senere</button>
      <button class="btn" id="go-task">Start dagens vagt</button>
    </div>`, (el) => el.querySelector('#go-task').addEventListener('click', () => { closeSheet(); runSession(t.area, t); }));
}

function areaSheet(areaId) {
  const st = S.state, a = areaOf(areaId), z = Z.ZONES[areaId];
  const lv = Z.areaLevel(st, areaId), L = Z.LEVELS[lv];
  const label = { ny: 'Ny', øver: 'Øver', sikker: 'Sikker ⭐', mestret: 'Mestret 🌟' };
  const rows = a.skills.map((sk, i) => {
    const status = E.skillStatus(st, sk.id), unlocked = E.isUnlocked(st, sk.id);
    return `<div class="sheet-skill">
      <div style="min-width:0"><b>${sk.name}</b> <span class="st ${status}">${label[status]}</span><div class="muted small">${sk.desc}</div></div>
      ${unlocked ? `<div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn ghost sm" data-intro="${sk.id}" aria-label="Forklaring">💡</button><button class="btn sm" data-practice="${sk.id}">Øv</button></div>`
        : `<span class="muted small">🔒 efter "${a.skills[i - 1].name}"</span>`}
    </div>`;
  }).join('');
  openSheet(`
    <div class="sheet-head"><span class="sheet-ic">${a.icon}</span><div><h2 style="margin:0">${a.place}</h2><span class="muted">${a.name} · ${L.icon} ${L.name}</span></div>
      <span class="ani" style="margin-left:auto">${lv ? ani(z.animals.slice(0, Math.min(lv, 3))) : ''}</span></div>
    <p class="sheet-next">${lv < 4 ? '🎯' : '🌟'} ${Z.nextStep(st, a)}</p>
    <div class="sheet-skills">${rows}</div>`, (el) => {
    el.querySelectorAll('[data-practice]').forEach((b) => b.addEventListener('click', () => { closeSheet(); startPractice(b.dataset.practice); }));
    el.querySelectorAll('[data-intro]').forEach((b) => b.addEventListener('click', () => { closeSheet(); showIntro(b.dataset.intro, showHome, 'Tilbage'); }));
  });
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
    <div class="sheet-head"><span class="sheet-ic">🍼</span><div><h2 style="margin:0">Babyhuset</h2>
      <span class="muted">${fs.introduced} af ${fs.total} unger født · ${fs.due ? `${fs.due} vil have flaske i dag` : 'alle sover sødt'}</span></div></div>
    <div class="cribs">${cribs}</div>
    <div class="row" style="justify-content:flex-end">
      ${sprintEligible(st) ? '<button class="btn ghost" id="sb-sprint">⚡ Slå din rekord</button>' : ''}
      <button class="btn" id="sb-book">📖 Dyrebogen</button>
    </div>`, (el) => {
    el.querySelector('#sb-book').addEventListener('click', () => { closeSheet(); showBook(); });
    el.querySelector('#sb-sprint')?.addEventListener('click', () => { closeSheet(); startSprint(); });
  });
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

// ================= Et område =================

function showPlace(areaId) {
  const st = S.state, a = areaOf(areaId), z = Z.ZONES[areaId];
  const lv = Z.areaLevel(st, areaId), L = Z.LEVELS[lv];
  const rows = a.skills.map((s, i) => {
    const status = E.skillStatus(st, s.id);
    const unlocked = E.isUnlocked(st, s.id);
    const label = { ny: 'Ny', øver: 'Øver', sikker: 'Sikker ⭐', mestret: 'Mestret 🌟' }[status];
    return `<div class="card skill-row" style="--ac:${a.color}">
      <div style="flex:1;min-width:220px">
        <h3 style="margin:0 0 2px">${s.name} <span class="st ${status}">${label}</span></h3>
        <span class="muted small">${s.desc}</span>
      </div>
      ${unlocked
        ? `<div class="row"><button class="btn ghost" data-intro="${s.id}">💡 Forklaring</button><button class="btn" data-practice="${s.id}">Øv</button></div>`
        : `<span class="muted small">🔒 Åbner, når du er sikker i "${a.skills[i - 1].name}"</span>`}
    </div>`;
  }).join('');
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button><span class="muted">Zoo-kortet</span></div>
    <section class="area-hero" style="--ac:${a.color}">
      <span class="big">${a.icon}</span>
      <div style="flex:1;min-width:200px">
        <h1 style="margin:0">${a.place}</h1>
        <div class="muted" style="font-weight:700">${a.name} · ${z.blurb}</div>
      </div>
      <div class="center"><div class="ani hero-ani">${lv ? ani(z.animals.slice(0, Math.min(lv, 3))) : '🚧'}</div><span class="lvl" style="--ac:${a.color}">${L.icon} ${L.name}</span></div>
    </section>
    <div class="stack" style="margin-top:16px">${rows}</div>`, (e) => { if (e.key === 'Escape') showHome(); });
  on('#back', 'click', showHome);
  on('[data-practice]', 'click', (e) => startPractice(e.currentTarget.dataset.practice));
  on('[data-intro]', 'click', (e) => showIntro(e.currentTarget.dataset.intro, () => showPlace(areaId), 'Tilbage'));
}

// ================= Øvebanen: oversigt over lektiepakker =================

function showPracticeHub() {
  const st = S.state;
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button><span class="muted">Zoo'en</span></div>
    <section class="area-hero" style="--ac:var(--c-tal)">
      <span class="big">📝</span>
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
        <h1>${s.name}</h1>
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

const blockIcon = (b, areaId) => (b.kind === 'warm' ? '🍼' : b.kind === 'review' ? '🧭' : areaOf(areaId).icon);

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
    return `<li class="${state}"><span class="mt-ic">${blockIcon(b, run.sess.area)}</span><span class="mt-lbl">${label(b)}</span>${tail}</li>`;
  }).join('<li class="mt-arrow" aria-hidden="true">→</li>');
  return `<div class="mission-track"><div class="mt-title">Mission: <b>${esc(title)}</b></div><ol class="mt-steps">${steps}</ol></div>`;
}

// Startskærm: dagens plan, så man kan fortryde før regnestykkerne begynder
function startSession(areaId) {
  const a = areaOf(areaId), t = Z.taskFor(areaId);
  const sess = E.buildSession(S.state, areaId);
  const steps = sess.blocks.filter((b) => b.count).map((b, i) => `
    <li><span class="n">${i + 1}</span>
      <div><div class="t">${b.title}</div><div class="d">${b.sub} · ${b.count} opgaver</div></div>
      <span class="ico">${blockIcon(b, areaId)}</span></li>`).join('');
  view(`
    <div class="card sheet stack">
      <div class="kicker">${a.icon} ${a.place}</div>
      <h1>${t.title}</h1>
      ${say(t.who, pick(['Kan du hjælpe mig?', 'Godt du kom! Vi starter i Babyhuset og går så i gang.', 'Klar? Ungerne skal have flaske først.']))}
      <ol class="plan">${steps}</ol>
      <div class="row" style="justify-content:center">
        <button class="btn ghost big" id="back">← Tilbage</button>
        <button class="btn big" id="go">Start</button>
      </div>
    </div>`, (e) => { if (e.key === 'Enter') begin(); else if (e.key === 'Escape') showHome(); });
  const begin = () => {
    S.run = { mode: 'daily', sess, bi: 0, ti: 0, results: [], before: snapshot(S.state), t0: Date.now(), retried: new Set() };
    goBlock();
  };
  on('#go', 'click', begin);
  on('#back', 'click', showHome);
}

function startPractice(skillId) {
  const s = ALL_SKILLS[skillId], a = areaOf(s.area);
  const sess = { area: a.id, main: skillId, blocks: [{ kind: 'practice', title: a.place, sub: s.name, count: s.practice ? 10 : 8, skill: skillId }] };
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
  const line = block.kind === 'review'
    ? say('kaj', "Sidste runde! Lad os tjekke resten af zoo'en 🦜")
    : say(run.mission?.who || (z.who === 'bodil' ? 'nora' : z.who), `${prev?.kind === 'warm' ? 'Ungerne er mætte! ' : ''}Nu skal vi i gang i ${areaOf(run.sess.area).place}: ${z.step}.`);
  view(`
    ${run.mode === 'daily' ? `<div class="session-top"><button class="icon-btn" id="quit" aria-label="Stop">✕</button>${missionTrack(run, block)}</div>` : ''}
    <div class="card sheet center stack" style="margin-top:4vh">
      ${prev?.kind === 'warm' ? '<div class="kicker">✓ Opvarmning klaret</div>' : ''}
      <div style="font-size:3.6rem">${blockIcon(block, run.sess.area)}</div>
      <h1>${block.title}</h1>
      <div style="text-align:left">${line}</div>
      <div><button class="btn big" id="go">Videre</button></div>
    </div>`, (e) => { if (e.key === 'Enter') showTask(); });
  on('#go', 'click', showTask);
  on('#quit', 'click', quitSession);
}

function totalTasks(run) { return run.sess.blocks.reduce((n, b) => n + (b.count || 0), 0); }
function doneTasks(run) { return run.sess.blocks.slice(0, run.bi).reduce((n, b) => n + (b.count || 0), 0) + run.ti; }

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
  (a, z) => `${a.place} har åbnet! ${z.animals[0]} er flyttet ind`,
  (a, z) => `${a.place} er blevet populær – ${z.animals[1]} er flyttet ind`,
  (a, z) => `${a.place} har fået en stjerne! ${z.animals[2]} er flyttet ind`,
  (a) => `${a.place} er blevet et guld-område!`,
];

function finish() {
  const run = S.run, st = S.state;
  logRun(run);
  const after = snapshot(st), b = run.before;
  st.zoo.bestGuests = Math.max(st.zoo.bestGuests || 0, after.guests);

  const wins = [];
  let bigWin = false;
  AREAS.forEach((a, i) => {
    for (let lv = b.levels[i] + 1; lv <= after.levels[i]; lv++) {
      wins.push({ e: Z.LEVELS[lv].icon, t: LEVEL_WIN[lv](a, Z.ZONES[a.id]) });
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
  const n = run.results.length;
  const backSet = PRACTICE_SETS.find((x) => x.id === run.sess.area);
  if (run.mode === 'daily') {
    // Til forsidens "Dagens mission er klaret" (lægges oven i tidligere vagter i dag)
    const prev = st.zoo.today?.date === today() ? st.zoo.today : null;
    st.zoo.today = {
      date: today(), area: run.sess.area,
      wins: [...wins, ...(prev?.wins || [])].slice(0, 6),
      diff: (prev?.diff || 0) + (after.guests - b.guests),
    };
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
          : `<button class="btn big" id="home">Til zoo'en</button>${sprintEligible(st) ? '<button class="btn ghost" id="sprint">⚡ Slå din rekord</button>' : ''}`}
      </div>
    </div>`, (e) => { if (e.key === 'Enter') (backSet ? showPracticeSet(backSet.id) : showHome()); });
  on('#home', 'click', showHome);
  on('#backset', 'click', () => showPracticeSet(backSet.id));
  on('#sprint', 'click', startSprint);
  setTimeout(() => countUp($('#gc'), b.guests, after.guests, 1100), 350);
  if (bigWin) { sfx('level'); setTimeout(() => confetti(), 250); } else sfx('finish');
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
    <div class="legend">${Z.STAGES.map((s, i) => `<span>${'●'.repeat(i + 1)} ${s}</span>`).join('')}<span>🍼 = vil have flaske</span></div>`,
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
      <div class="spread"><span class="muted small">Data gemmes ${storageMode() === 'api' ? 'på serveren (deles mellem enheder)' : 'kun i denne browser'}.</span>
        <button class="btn ghost" id="del">Slet profil</button></div>
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
window.__mo = { S, E, Z, babyReact, show: { home: showHome, book: showBook, profiles: showProfiles, tour: showIntroTour, about: showAbout, set: showPracticeSet, practice: startPractice } };
