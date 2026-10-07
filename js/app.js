// Matematik-Zoo – skærme og interaktion.

import { AREAS, SKILLS, ALL_SKILLS, DISCIPLINES, PRACTICE_GROUPS, FACTS, factProblem } from './curriculum.js?v=20261007191319';
import * as E from './engine.js?v=20261007191319';
import * as Z from './zoo.js?v=20261007191319';
import { zooGate } from './scene.js?v=20261007191319';
import { zooMap } from './map.js?v=20261007191319';
import { sfx, setSound, confetti, countUp } from './fx.js?v=20261007191319';
import { listProfiles, loadState, saveState, deleteProfile, slug, storageMode, flush } from './store.js?v=20261007191319';
import { esc, fmt, frac, pick, today } from './util.js?v=20261007191319';

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

// calm: tegn skærmen igen uden indgangsanimation og uden at rulle til toppen (fx når et mærke flyttes på skjorten)
function view(html, onKey = null, { calm = false } = {}) {
  app.classList.toggle('calm', calm);
  app.innerHTML = html;
  keyHandler = onKey;
  if (!calm) window.scrollTo(0, 0);
}
const $ = (sel) => app.querySelector(sel);
const $$ = (sel) => [...app.querySelectorAll(sel)];
const on = (sel, ev, fn) => $$(sel).forEach((el) => el.addEventListener(ev, fn));
const save = (now = false) => saveState(S.id, S.state, { now });
const areaOf = (id) => AREAS.find((a) => a.id === id) || DISCIPLINES.find((a) => a.id === id);
const ME = ['🦊', '🐼', '🦒', '🐧', '🦁', '🐨', '🦓', '🐢'];
// Profilens dyr (fast pr. navn): den tegnede unge fra Babyhuset
const meAvatar = (name) => {
  const e = ME[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % ME.length], art = Z.artFor(e);
  return art ? `<img src="${art}" alt="" draggable="false">` : e;
};

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
  fest: 'img/ui/fest.webp', stjerne: 'img/ui/stjerne.webp', billet: 'img/ui/billet.webp', gave: 'img/ui/gave.webp', sykurv: 'img/ui/sykurv.webp',
};
const ui = (key) => `<img class="ui-ic" src="${UI_ICONS[key]}" alt="" draggable="false">`;
// Et sted i zoo'en eller en disciplin på Øvebanen som lille tegning ved navnet (Batch 5 og 7) – i stedet for emoji
const placeIc = (a) => {
  const src = Z.PLACE_ART[a.id] || Z.DISC_ART[a.id];
  return src ? `<img class="place-ic" src="${src}" alt="" draggable="false">` : a.icon;
};
const lvIc = (n) => `<img class="lv-ic" src="${Z.LEVELS[n].art}" alt="" draggable="false">`;

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
        ${profiles.map((p) => `<button class="profile-btn" data-id="${esc(p.id)}"><span class="avatar lg has-img">${meAvatar(p.name)}</span>${esc(p.name)}</button>`).join('')}
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

// Reglerne samlet ét sted ("? Regler" øverst på forsiden) – med Ellies egen status ved hver regel, så de bliver konkrete
function showRules(back = showHome) {
  const st = S.state, levels = levelsOf(st), fs = E.factSummary(st), size = sessionSize(st);
  const stars = levels.filter((l) => l >= 3).length, open = levels.filter((l) => l >= 1).length, gold = levels.filter((l) => l >= 4).length;
  const ids = Object.keys(SKILLS), sikre = ids.filter((id) => ['sikker', 'mestret'].includes(E.skillStatus(st, id))).length;
  const doneToday = !!todayLog(st)?.mission, week = E.weekSessions(st), bonus = Z.bonusOf(st).length;
  const goalPct = (100 * levels.reduce((n, l) => n + Math.min(l, 3), 0)) / (3 * AREAS.length);
  const rule = (icon, title, body, status = '') => `<section class="card rule">
      <h2><span class="rule-ic" aria-hidden="true">${icon}</span>${title}</h2>
      ${body}
      ${status ? `<div class="rule-status">${status}</div>` : ''}
    </section>`;
  const levelWhy = ['ingen sikre aktiviteter endnu', 'sikker i én aktivitet', 'sikker i halvdelen', 'sikker i dem alle', 'mester i dem alle'];
  view(`
    <button class="back-link" id="back"><span class="icon-btn" aria-hidden="true">←</span>Tilbage til zoo'en</button>
    <div class="rules-head"><h1>Sådan spiller du</h1><p class="muted">Alle reglerne i ${esc(Z.zooName(st))} – kort og præcist.</p></div>
    <div class="rules">
      ${rule(ui('fest'), 'Målet: åbningsfesten', `<p>Zoo'en har været lukket hele vinteren. Når alle ${AREAS.length} områder har fået en stjerne ⭐, holder Bodil åbningsfest.</p>
        <p>Et område får sin stjerne, når du er <b>sikker ⭐</b> i alle områdets aktiviteter.</p>`,
      st.zoo.party ? `<span>🎉 Festen blev holdt ${partyDate(st.zoo.party.date)}.</span><button class="link small" id="rule-party">Se festen igen</button>`
        : Z.partyReady(st) ? `<span>🎉 Alle områder har en stjerne – festen venter!</span><button class="link small" id="rule-party">Gå til festen</button>`
        : `<div class="goal-bar" style="margin:0"><i style="width:${goalPct}%"></i></div><span><b>${stars} af ${AREAS.length}</b> områder har fået en stjerne</span>`)}
      ${rule(ui('opgave'), 'Dagens mission', `<p>Hver dag er der <b>én</b> mission. Den har tre dele:</p>
        <ol><li><b>Babyhuset</b> – giv ${size.warm} unger flaske (gangetabellen)</li>
          <li><b>Et område</b> – ${size.main} opgaver, hvor du hjælper Nora, Liv, Yasmin eller Kaj</li>
          <li><b>Zoo-runden</b> – ${size.review} blandede opgaver fra hele zoo'en</li></ol>
        <p>Når alle tre dele er klaret, er missionen klaret. Det tager cirka ${size.minutes} minutter. Stopper du midtvejs, tæller den ikke som klaret.</p>`,
      doneToday ? '✓ Dagens mission er klaret' : 'Dagens mission venter på forsiden')}
      ${rule(ui('baby'), 'Ungerne i Babyhuset', `<p>Hvert gangestykke er en dyreunge – der er ${FACTS.length}.</p>
        <p>Svarer du <b>rigtigt og hurtigt</b> (under ${E.FLUENT_MS / 1000} sekunder), vokser ungen: ${Z.STAGES.join(' → ')}.</p>
        <p>En unge, der har fået flaske, skal først have igen om nogle dage – jo større den er, jo længere tid går der. Svarer du forkert, starter ungen forfra, men den kommer igen lidt senere.</p>`,
      `${fs.solid} af ${fs.total} unger er store · ${fs.gold} er voksne`)}
      ${rule(ui('stjerne'), 'Stjerner i aktiviteterne', `<p>Hvert område har nogle aktiviteter, fx "${Z.ACTIVITIES.klokken.name}" i Zoo-uret. Hver aktivitet har 3 niveauer:</p>
        <ul><li>3 rigtige i træk → lidt sværere opgaver</li><li>2 forkerte i træk → lidt lettere igen</li></ul>
        <p class="rule-chain"><span class="st ny">Ny</span>→<span class="st øver">I gang</span>→<span class="st sikker">Sikker ⭐</span>→<span class="st mestret">Mester 🌟</span></p>
        <p><b>Sikker ⭐</b>: 8 af dine sidste 10 svar på niveau 3 er rigtige. <b>Mester 🌟</b>: du er sikker på to forskellige dage.</p>`,
      `Du er sikker i ${sikre} af ${ids.length} aktiviteter`)}
      ${rule(ui('area'), 'Områderne vokser', `<p>Jo flere aktiviteter du er sikker i, jo flottere bliver området:</p>
        <ul class="rule-levels">${Z.LEVELS.map((L, i) => `<li><span aria-hidden="true">${lvIc(i)}</span><span><b>${L.name}</b> – ${levelWhy[i]}${i >= 1 && i <= 3 ? ' · et nyt dyr flytter ind' : ''}</span></li>`).join('')}</ul>`,
      `${open} åbne · ${stars} stjerne-områder · ${gold} guld-områder`)}
      ${rule(ui('billet'), 'Gæster', `<p>Gæster pr. dag er zoo'ens point. Tallet vokser, når områderne bliver flottere, og når ungerne i Babyhuset bliver store.</p>`,
      `${fmt(Z.guestsPerDay(st))} gæster om dagen`)}
      ${rule(`<img class="ui-ic face" src="${Z.CAST.kaj.img}" alt="">`, 'Når du svarer forkert', `<p>Det gør ikke noget – sådan lærer man!</p>
        <ul><li>Skriver du et tal, får du et forsøg mere – og du kan trykke på "Vis et hint".</li>
          <li>Vælger du mellem knapper, får du ét forsøg.</li>
          <li>Bagefter viser Kaj, hvordan man regner det, og der kommer en lignende opgave senere.</li>
          <li>Det er dit første svar, der tæller for stjernerne. 💡 Hjælp viser altid, hvordan man gør.</li></ul>`)}
      ${rule(ui('oeve'), 'Når missionen er klaret', `<ul><li><b>Fri træning:</b> tryk på et område på kortet, og øv dér. Den åbner, når dagens mission er klaret.</li>
          <li><b>Øvebanen:</b> altid åben – øv lige det, du vil.</li>
          <li><b>⚡ Slå din rekord:</b> regn så mange gangestykker, du kan, på 60 sekunder. ${st.settings.sprint ? 'Den kommer, når du kender mindst 6 gangestykker.' : 'Den er slået fra lige nu – en voksen kan slå den til.'}</li></ul>`,
      doneToday ? '🔓 Fri træning er åben i dag' : '🔒 Fri træning åbner, når dagens mission er klaret')}
      ${rule(`<img class="ui-ic" src="${Z.SHIRT.f.src}" alt="">`, 'Ranger-skjorten', `<p>Når du er sikker ⭐ i alle øvelser i en disciplin på Øvebanen, får du et mærke til din ranger-skjorte. Du bestemmer selv, hvor det skal sidde – og du kan altid flytte det.</p>
        <ul><li><b>Bronzetråd</b> – du kan det</li><li><b>Sølvtråd</b> – klar en blandet runde: mindst ${E.PATCH.PASS} af ${E.PATCH.N} rigtige</li><li><b>Guldtråd</b> – klar runden igen mindst ${E.PATCH.GOLD_DAYS} dage senere</li></ul>`,
      `${patchList(st).filter((x) => x.p).length} af ${patchList(st).length} mærker`)}
      ${rule(ui('gave'), 'Ugens bonus-unge', `<p>Øver du ${E.WEEK_GOAL} dage i én uge, flytter en bonus-unge ind i Babyhuset. Der er ${Z.BONUS.length} at samle.</p>`,
      `Denne uge: ${Math.min(week, E.WEEK_GOAL)} af ${E.WEEK_GOAL} dage · ${bonus} af ${Z.BONUS.length} samlet`)}
    </div>
    <div class="row rules-go"><button class="btn ghost big" id="tour">Se introen igen</button><button class="btn big" id="home">Tilbage til zoo'en</button></div>
  `, (e) => { if (e.key === 'Escape') back(); });
  on('#back', 'click', back);
  on('#home', 'click', back);
  on('#tour', 'click', () => showIntroTour(() => showRules(back), 'Tilbage til reglerne'));
  on('#rule-party', 'click', () => showParty(() => showRules(back)));
}

function showAbout(back = showHome) {
  const skillCount = AREAS.reduce((n, a) => n + a.skills.length, 0);
  const rows = AREAS.map((a) => `<tr><td>${placeIc(a)} ${a.place}</td><td>${a.name}</td><td>${a.skills.map((sk) => sk.name).join(', ')}</td></tr>`).join('');
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
        <p class="small muted">Hver færdighed har tre niveauer. På Øvebanen kan alt øves frit – delt op i discipliner som i matematikbogen, med flere målrettede øvelser end i zoo'en (fx gangetabellen én tabel ad gangen).</p>
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

function showIntroTour(done = showHome, backLabel = "Tilbage til zoo'en") {
  const st = S.state, firstTime = !st.zoo.introSeen; // åbnes den igen via ?, går sidste knap bare tilbage
  const someBabies = FACTS.slice(0, 6).map((f, i) => {
    const b = Z.BABIES[f.key];
    return `<span class="baby has-img" style="--st:${i}"><img src="${b.img}" alt="" draggable="false"></span>`;
  }).join('');
  const pages = [
    // Første side er en scene som på missionerne og områdesiderne (se renderHero nedenfor)
    { hero: true, title: 'Velkommen til Matematik-Zoo!', text: "Zoo'en har været lukket hele vinteren. Vil du hjælpe Bodil med at åbne den igen?", cta: 'Kom indenfor' },
    {
      art: `<div class="tour-icons">${AREAS.map((a) => `<span style="--ac:${a.color}">${placeIc(a)}</span>`).join('')}</div>`,
      title: 'Målet: den store åbningsdag',
      body: say('bodil', `Zoo'en har ${AREAS.length} områder. Hvert område bliver bedre, når du bliver god til noget matematik – så flytter der nye dyr ind og kommer flere gæster. Når alle ${AREAS.length} områder har fået en ⭐, holder vi åbningsfest!`),
    },
    {
      art: `<ol class="plan">
        <li><span class="n">1</span><div><div class="t">Babyhuset</div><div class="d">Giv ungerne flaske – gangetabellen</div></div><span class="ico">${ui('baby')}</span></li>
        <li><span class="n">2</span><div><div class="t">Dagens opgave</div><div class="d">Hjælp Nora, Liv, Yasmin eller Kaj med en opgave i zoo'en</div></div><span class="ico">${ui('area')}</span></li>
        <li><span class="n">3</span><div><div class="t">Zoo-runden</div><div class="d">Et par blandede opgaver fra hele zoo'en</div></div><span class="ico">${ui('round')}</span></li>
      </ol>`,
      title: 'Sådan går en dag',
      body: say('nora', 'Én mission om dagen – det tager cirka 15 minutter. Bagefter kan du øve frit i områderne på kortet. Prøv at komme forbi 4 dage om ugen – så vokser zoo\'en hurtigt.'),
    },
    {
      art: `<div class="tour-babies">${someBabies}</div>`,
      title: 'Ungerne i Babyhuset',
      body: say('nora', `Hvert gangestykke er en dyreunge. Når du husker gangestykket – også dagen efter – vokser ungen, til den er voksen. Kan du få alle ${FACTS.length} unger voksne?`),
    },
    {
      art: `<img class="tour-portrait" src="${Z.CAST.kaj.full}" alt="Kaj">`,
      title: 'Bare rolig!',
      body: say('kaj', 'Regner du forkert, sker der ikke noget. Du får en forklaring, og opgaven kommer igen senere. Og går en division ikke op, så er resten MIN!')
        + '<p class="small muted center" style="margin:0">Alle reglerne står under <b>? Regler</b> øverst på forsiden.</p>',
    },
  ];
  let i = 0;
  const finish = () => { st.zoo.introSeen = true; save(); done(); };
  // Første gang: "Start min første mission" starter dagens anbefalede mission (samme som forsiden ville vise)
  const startFirstMission = async () => {
    st.zoo.introSeen = true;
    await save(true);
    const m = todaysMission(st);
    runSession(m.area, m);
  };
  const keys = (e) => {
    if (e.key === 'Enter' || e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft' && i) { i--; render(); }
    else if (e.key === 'Escape') finish();
  };
  const dots = () => `<div class="tour-dots">${pages.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>`;
  // Indgangen og flamingosøen som stor scene, Bodil nederst til højre og teksten i en lys boks
  const renderHero = (p) => view(`
      <section class="card tour tour-hero" aria-labelledby="tour-h">
        <div class="th-scene" role="img" aria-label="Indgangen til zoo'en ved flamingosøen, hvor Bodil står">
          <img class="th-bg" src="${Z.SCENES.tal.bg}" alt="" draggable="false">
          <img class="th-bodil" src="${Z.CAST.bodil.bust}" alt="" draggable="false">
        </div>
        <div class="th-top"><span class="kicker">Sådan spiller du · ${i + 1}/${pages.length}</span><button class="link small" id="skip">Spring over</button></div>
        <div class="th-box">
          <h1 id="tour-h">${p.title}</h1>
          <p>${p.text}</p>
          <div class="th-go"><button class="btn big" id="next">${p.cta}</button>${dots()}</div>
        </div>
      </section>`, keys);
  const render = () => {
    const p = pages[i], last = i === pages.length - 1;
    if (p.hero) {
      renderHero(p);
      on('#next', 'click', next);
      on('#skip', 'click', finish);
      return;
    }
    view(`
      <div class="card sheet tour stack">
        <div class="spread"><span class="kicker">Sådan spiller du · ${i + 1}/${pages.length}</span><button class="link small" id="skip">Spring over</button></div>
        <div class="tour-visual">${p.art}</div>
        <h1 class="center">${p.title}</h1>
        ${p.body}
        ${dots()}
        <div class="row" style="justify-content:center">
          ${i ? '<button class="btn ghost big" id="prev">←</button>' : ''}
          <button class="btn big" id="next">${last ? (firstTime ? 'Start min første mission' : backLabel) : 'Næste'}</button>
        </div>
      </div>`, keys);
    on('#next', 'click', next);
    on('#prev', 'click', () => { i--; render(); });
    on('#skip', 'click', finish);
  };
  const next = () => { sfx('tap'); if (i < pages.length - 1) { i++; render(); } else if (firstTime) startFirstMission(); else finish(); };
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
// Fri træning i områderne åbner, når dagens mission er klaret – dag for dag. Kortet, områdesiderne,
// "Se hvordan", Babyhuset og Dyrebogen kan altid ses, og Øvebanen er altid åben (alt frit).
const freePlayOpen = (st) => !!todayLog(st)?.mission;

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

// Dagens mission: den anbefalede opgave blandt dagens forslag (S.mission huskes, så den ikke skifter undervejs)
function todaysMission(st, tasks = dailyTasks(st)) {
  const open = tasks.filter((t) => !t.done);
  if (!open.some((t) => t.area === S.mission)) S.mission = (open[0] || tasks[0]).area;
  return tasks.find((t) => t.area === S.mission);
}

function showHome() {
  if (reloadWhenIdle) { location.reload(); return; }
  closeSheet();
  const st = S.state;
  checkPatches();
  const zname = Z.zooName(st);
  const levels = levelsOf(st);
  const fs = E.factSummary(st);
  const tasks = dailyTasks(st);
  const log = todayLog(st);
  const doneToday = !!log?.mission;
  const mission = todaysMission(st, tasks);
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
  const first = mission;
  const freshBonus = Z.updateBonus(st);
  if (freshBonus.length) save();

  view(`
    <div class="home-top">
      <button class="me-chip" id="switch" title="Skift profil" aria-label="${esc(st.name)} – skift profil"><span class="avatar has-img">${meAvatar(st.name)}</span><span class="nm">${esc(st.name)}</span><svg class="me-swap" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5h10M9 2l3 3-3 3M14 11H4M7 8l-3 3 3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="row" style="gap:8px">
        <button class="icon-btn pill" id="oeve" aria-label="Øvebanen${patchNews(st) ? ' – nyt på din ranger-skjorte' : ''}">${ui('oeve')}<span>Øvebanen</span>${patchNews(st) ? '<i class="pill-dot" aria-hidden="true"></i>' : ''}</button>
        <button class="icon-btn pill" id="help" title="Reglerne – sådan spiller du" aria-label="Regler – sådan spiller du"><b class="q" aria-hidden="true">?</b><span>Regler</span></button>
        <button class="icon-btn" id="about" title="Om appen" aria-label="Om appen"><svg class="info-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.5" fill="currentColor"/></svg></button>
        <button class="icon-btn" id="parent" title="Forælder" aria-label="Forælder (kræver kode)"><svg class="info-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="15.6" r="1.4" fill="currentColor"/></svg></button>
        <button class="icon-btn snd ${st.settings.sound ? '' : 'off'}" id="snd" aria-label="Lyd" aria-pressed="${st.settings.sound}">${ui('lyd')}</button>
      </div>
    </div>

    ${Z.partyDue(st) ? partyCard() : ''}
    ${doneToday ? missionDone(log) : missionCard(st, mission)}

    <div class="section-title"><h2>Din zoo</h2><span class="muted small">${doneToday ? 'Tryk på et område for at øve noget bestemt' : '🔒 Klar dagens mission – så kan du øve frit i områderne'}</span></div>
    <section class="map-wrap${st.zoo.party ? ' festive' : ''}">
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
  // Mus eller tastatur over et område eller dets navneskilt: fremhæv begge, så man kan se, hvad der hører sammen
  const highlight = (e, on) => {
    const t = e.target.closest?.('[data-area]');
    if (!t || e.pointerType === 'touch') return;
    mapEl.querySelectorAll(`[data-area="${t.dataset.area}"]`).forEach((x) => x.classList.toggle('hl', on));
  };
  mapEl.addEventListener('pointerover', (e) => highlight(e, true));
  mapEl.addEventListener('pointerout', (e) => highlight(e, false));
  mapEl.addEventListener('focusin', (e) => highlight(e, true));
  mapEl.addEventListener('focusout', (e) => highlight(e, false));
  // På smalle skærme kan kortet scrolles sidelæns: start med missionens figur i midten
  const scroller = $('.map-scroll'), who = $('.zm-who');
  if (who && scroller.scrollWidth > scroller.clientWidth) scroller.scrollLeft = who.offsetLeft - scroller.clientWidth / 2;
  on('#start', 'click', () => { sfx('tap'); runSession(mission.area, mission); });
  on('#party', 'click', () => { sfx('tap'); showParty(); });
  on('#to-map', 'click', () => { sfx('tap'); $('.map-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  on('#see-baby', 'click', () => { sfx('tap'); babySheet(); });
  on('#oeve', 'click', () => { sfx('tap'); showPracticeHub(); });
  on('#help', 'click', () => showRules());
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
// Dagens mission: antal opgaver i hver af de tre dele (forældrene vælger kort eller normal)
const sessionSize = (st) => ({ ...(E.SESSION_SIZES[st.settings.length] || E.SESSION_SIZES.normal), minutes: st.settings.length === 'kort' ? 10 : 15 });

function missionCard(st, t) {
  const a = areaOf(t.area), z = Z.ZONES[t.area], c = Z.CAST[t.who];
  const cur = E.currentSkill(st, t.area), size = sessionSize(st);
  return `
    <section class="mission card ${hasScene(t) ? 'has-scene' : ''}">
      ${missionScene(t, 'intro')}
      <div class="mission-body">
        <span class="kicker with-ic">${ui('opgave')}Dagens mission · ${a.place}</span>
        <h1>${t.title}</h1>
        <p class="mission-need">${missionIntroHtml(t)}</p>
        <ol class="mission-steps">
          <li><span class="si">${ui('baby')}<i>1</i></span><span><b>Babyhuset</b> · giv ${size.warm} unger flaske <span class="topic">gangetabellen</span></span></li>
          <li><span class="si">${ui('area')}<i>2</i></span><span><b>${a.place}</b> · ${z.step} – ${size.main} opgaver <span class="topic">${cur ? SKILLS[cur].name : 'repetition'}</span></span></li>
          <li><span class="si">${ui('round')}<i>3</i></span><span><b>Zoo-runden</b> · ${size.review} blandede opgaver fra hele zoo'en</span></li>
        </ol>
        <p class="mission-goal">🎯 ${Z.nextGoal(st, a)}</p>
        <div class="mission-go">
          <button class="btn big" id="start">Start missionen</button>
          <span class="muted small">ca. ${size.minutes} minutter · klar alle tre dele</span>
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
        <h1>Dagens mission er klaret!</h1>
        <p class="mission-need">${missionDoneHtml(t)}</p>
        ${chips.length ? `<ul class="payoff-extras">${chips.map((w) => `<li><span class="e">${w.e}</span>${esc(w.t)}</li>`).join('')}</ul>` : ''}
        <p class="free-open">🔓 Fri træning er åben i dag – vælg et område på kortet. En ny mission venter i morgen.</p>
        <div class="mission-go">
          <button class="btn big" id="to-map">Øv frit på kortet</button>
          <button class="link" id="see-baby">Se Babyhuset</button>
        </div>
      </div>
    </section>`;
}

function taskSheet(t) {
  const a = areaOf(t.area), cur = E.currentSkill(S.state, t.area);
  openSheet(`
    ${say(t.who, `<b>${t.title}</b> – kan du hjælpe mig? Vi starter i Babyhuset.`)}
    <div class="sheet-plan"><span>${ui('baby')}Babyhuset</span><span>→</span><span>${ui('area')}${a.place} · ${Z.ZONES[t.area].step}</span><span>→</span><span>${ui('round')}Zoo-runden</span></div>
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
  const st = S.state, msg = Z.homeMessage(st), done = freePlayOpen(st); // én mission om dagen
  const stars = levels.filter((l) => l >= 3).length, gold = levels.filter((l) => l >= 4).length, ready = Z.partyReady(st);
  const goal = st.zoo.party
    ? `<span>🎉 <b>${esc(Z.zooName(st))} er åben!</b> Næste mål: guld-områder – <b>${gold} af ${AREAS.length}</b> er guld.</span>
      <div class="goal-bar"><i style="width:${(100 * gold) / AREAS.length}%"></i></div>`
    : `<span>🎯 <b>${stars} af ${AREAS.length}</b> områder har fået en stjerne. ${ready ? 'Festen venter på dig!' : 'Når alle har, holder vi åbningsfest!'}</span>
      <div class="goal-bar"><i style="width:${(100 * levels.reduce((s, l) => s + Math.min(l, 3), 0)) / (3 * AREAS.length)}%"></i></div>`;
  openSheet(`
    ${say('bodil', msg.who === 'bodil' ? msg.text : `Godt at se dig, ${esc(st.name)}!`)}
    <div class="goal-line">${goal}</div>
    <div class="row" style="justify-content:flex-end">${ready ? `<button class="btn ghost" id="b-party">${st.zoo.party ? 'Se festen igen' : 'Gå til festen 🎉'}</button>` : ''}${done
      ? '<button class="btn" data-close>Tak, Bodil</button>'
      : '<button class="btn ghost" data-close>Tak, Bodil</button><button class="btn" id="b-go">Start dagens vagt</button>'}</div>`,
  (el) => {
    el.querySelector('#b-go')?.addEventListener('click', () => taskSheet(first));
    el.querySelector('#b-party')?.addEventListener('click', () => { closeSheet(); showParty(); });
  });
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
  const path = (lv ? '' : `<li class="now"><span>${lvIc(0)}</span><b>${Z.LEVELS[0].name}</b></li>`)
    + [1, 2, 3, 4].map((n) => `<li class="${n < lv ? 'done' : n === lv ? 'now' : ''}" title="${Z.LEVELS[n].name}"><span>${lvIc(n)}</span>${n === lv ? `<b>${Z.LEVELS[n].name}</b>` : ''}</li>`).join('');
  // Dyrene, der flytter ind ved niveau 1, 2 og 3
  const animals = z.animals.map((e, i) => {
    const b = Z.animalFor(e), open = lv > i;
    return `<li class="${open ? 'open' : i === lv ? 'next' : ''}" title="${open && b ? cap(b.kind) : 'Flytter ind senere'}">
      <span class="pa-img">${b?.img ? `<img src="${b.img}" alt="" draggable="false">` : e}</span><span class="pa-nm">${open && b ? cap(b.kind) : '?'}</span></li>`;
  }).join('');
  const label = { ny: 'Ny', øver: 'I gang', sikker: 'Sikker ⭐', mestret: 'Mester 🌟' };
  const actOf = (sk) => Z.ACTIVITIES[sk.id] || { name: sk.name, desc: sk.desc };
  // Næste opgave for dig: den første åbne aktivitet, der ikke er sikker endnu – eller, når alt er sikkert,
  // den der er længst tid siden (samme valg som dagens træning bruger)
  const recId = E.currentSkill(st, areaId) || [...a.skills].sort((x, y) => (st.skills[x.id]?.last || 0) - (st.skills[y.id]?.last || 0))[0].id;
  const recIdx = a.skills.findIndex((sk) => sk.id === recId), rec = a.skills[recIdx], recStatus = E.skillStatus(st, rec.id);
  const free = freePlayOpen(st);
  const recBlock = `
    <section class="card rec-act ${free ? '' : 'rec-locked'}">
      <div class="rec-body">
        <span class="kicker">Næste opgave for dig · aktivitet ${recIdx + 1} af ${a.skills.length}</span>
        <h2>${actOf(rec).name} <span class="st ${recStatus}">${label[recStatus]}</span></h2>
        <p class="rec-desc">${actOf(rec).desc}</p>
        <span class="act-skill">${rec.name}</span>
        ${free ? '' : '<p class="rec-lock">🔒 Fri træning åbner, når dagens mission er klaret.</p>'}
      </div>
      <div class="rec-env" aria-hidden="true">${envPic(Z.AREA_ENV[areaId])}</div>
      <div class="rec-go">
        ${free ? `<button class="btn big" data-practice="${rec.id}">Øv nu</button>` : '<button class="btn big" id="to-mission">Gå til dagens mission</button>'}
        <button class="link" data-intro="${rec.id}">Se hvordan</button>
      </div>
    </section>`;
  // De andre aktiviteter: åbne kan startes, låste viser kun, hvad der skal til
  const acts = a.skills.map((sk, i) => {
    if (sk.id === recId) return '';
    const status = E.skillStatus(st, sk.id), unlocked = E.isUnlocked(st, sk.id);
    const done = ['sikker', 'mestret'].includes(status), act = actOf(sk);
    if (!unlocked) {
      return `<li class="act locked">
      <span class="act-n" aria-hidden="true">🔒</span>
      <div class="act-body"><span class="act-name">${act.name}</span>
        <span class="act-lock">Bliv sikker ⭐ i "${Z.activityName(a.skills[i - 1])}" først.</span></div>
    </li>`;
    }
    return `<li class="act ${done ? 'done' : 'open'}">
      <span class="act-n" aria-hidden="true">${done ? '✓' : i + 1}</span>
      <div class="act-body">
        <span class="act-name">${act.name} <span class="st ${status}">${label[status]}</span></span>
        <span class="act-desc">${act.desc}</span>
        <span class="act-skill">${sk.name}</span>
      </div>
      <div class="act-go"><button class="link" data-intro="${sk.id}">Se hvordan</button>${free ? `<button class="btn sm" data-practice="${sk.id}">Øv</button>` : ''}</div>
    </li>`;
  }).join('');
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage til kortet">←</button><span class="muted">Zoo-kortet</span></div>
    <section class="mission card place-hero ${hasScene(t) ? 'has-scene' : ''}">
      ${missionScene(t, 'intro', 'hero', { say: lv ? `Velkommen til ${a.place}!` : `Hjælp med at åbne ${a.place}!`, locked: !lv })}
      <div class="mission-body">
        <span class="kicker">Fri træning · ${a.name}</span>
        <h1>${a.place}</h1>
        <p class="mission-need">${story}</p>
        <div class="place-prog">
          <ol class="pp-path" aria-label="Niveau: ${Z.LEVELS[lv].name}">${path}</ol>
          <ol class="pp-animals" aria-label="Dyrene i ${a.place}">${animals}</ol>
          <p class="pp-next">${esc(Z.nextGoal(st, a))}</p>
        </div>
      </div>
    </section>
    ${recBlock}
    ${acts ? `<div class="section-title"><h2>Andre ting du kan hjælpe med</h2><span class="muted small">Den næste aktivitet åbner, når du er sikker ⭐ i den forrige</span></div>
    <ol class="acts">${acts}</ol>` : ''}`, (e) => { if (e.key === 'Escape') showHome(); });
  on('#back', 'click', showHome);
  on('[data-practice]', 'click', (e) => { sfx('tap'); startPractice(e.currentTarget.dataset.practice); });
  on('#to-mission', 'click', () => { sfx('tap'); showHome(); });
  on('[data-intro]', 'click', (e) => showIntro(e.currentTarget.dataset.intro, () => showPlace(areaId), { btn: `Tilbage til ${a.place}`, back: `Tilbage til ${a.place}` }));
}

// ================= Øvebanen: matematikken delt op i discipliner =================

function showPracticeHub() {
  const st = S.state;
  checkPatches();
  const solid = (sk) => ['sikker', 'mestret'].includes(E.skillStatus(st, sk.id));
  const tile = (d) => {
    const done = d.skills.filter(solid).length, n = d.skills.length, pt = E.patchOf(st, d.id);
    return `<button class="disc-tile" data-disc="${d.id}" style="--ac:${d.color}">
      <span class="dt-art" aria-hidden="true"><img src="${Z.DISC_ART[d.id]}" alt="" width="150" height="112" decoding="async"></span>
      ${pt ? `<span class="dt-badge" title="Mærket til din ranger-skjorte"><i class="${TIER[pt.tier].cls}"></i>${TIER[pt.tier].name}</span>` : ''}
      <span class="dt-body"><span class="head dt-nm">${d.name.replace(/(\S{4,})(systemet)/, '$1&shy;$2')}</span>
        <span class="dt-d">${d.chapter ? `Kapitel ${d.chapter} i bogen` : d.desc}</span>
        <span class="disc-prog"><span class="bar-mini" aria-hidden="true"><i style="width:${Math.round((100 * done) / n)}%"></i></span>${done} af ${n} sikre ⭐</span></span>
    </button>`;
  };
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button><span class="muted">Zoo'en</span></div>
    <section class="oeve-hero">
      <div class="oeve-glass"><h1>Øvebanen</h1>
        <p>Øv lige det, du vil – alt er åbent. Matematikken er delt op som i din matematikbog, og hver øvelse starter med et eksempel.</p></div>
    </section>
    ${shirtTeaser(st)}
    ${PRACTICE_GROUPS.map((g) => `
      <div class="section-title"><h2>${g.name}</h2></div>
      <div class="disc-grid">${DISCIPLINES.filter((d) => d.group === g.id && d.skills.length).map(tile).join('')}</div>`).join('')}`,
  (e) => { if (e.key === 'Escape') showHome(); });
  on('#back', 'click', showHome);
  on('.disc-tile', 'click', (e) => { sfx('tap'); showDiscipline(e.currentTarget.dataset.disc); });
  on('#shirt', 'click', () => { sfx('tap'); showShirt(); });
}

// ================= Øvebanen: en disciplin =================

function showDiscipline(discId) {
  const st = S.state, d = DISCIPLINES.find((x) => x.id === discId);
  checkPatches();
  const label = { ny: 'Ny', øver: 'I gang', sikker: 'Sikker ⭐', mestret: 'Mester 🌟' };
  const tables = d.skills.filter((sk) => sk.table);
  let n = 0;
  const row = (sk) => {
    const status = E.skillStatus(st, sk.id), acc = E.skillAccuracy(st, sk.id, 30);
    const zoo = SKILLS[sk.id] && areaOf(SKILLS[sk.id].area)?.place; // samme færdighed (og fremgang) som i zoo'en
    return `<div class="card skill-row" style="--ac:${d.color}">
      <span class="wn big-n">${++n}</span>
      <div style="flex:1;min-width:220px">
        <h3 style="margin:0 0 2px">${sk.name} <span class="st ${status}">${label[status]}</span></h3>
        <span class="muted small">${sk.desc}${zoo ? ` · også i ${zoo}` : ''}${acc ? ` · ${acc.pct} % rigtige` : ''}</span>
      </div>
      <div class="row"><button class="btn ghost" data-intro="${sk.id}">💡 ${sk.intro.steps ? 'Se eksemplet' : 'Se hvordan'}</button><button class="btn" data-practice="${sk.id}">Øv 10 opgaver</button></div>
    </div>`;
  };
  // Gangetabellen: én række med en knap pr. tabel (farvet efter, hvor sikker tabellen sidder)
  const tablesRow = tables.length ? `<div class="card skill-row" style="--ac:${d.color}">
      <span class="wn big-n">${++n}</span>
      <div style="flex:1;min-width:220px">
        <h3 style="margin:0 0 2px">Gangetabellen</h3>
        <span class="muted small">Vælg en tabel, og øv 10 gangestykker</span>
        <div class="tbl-picks">${tables.map((sk) => `<button class="tbl-pick ${E.skillStatus(st, sk.id)}" data-practice="${sk.id}" aria-label="Øv ${sk.name}" title="${sk.name}: ${label[E.skillStatus(st, sk.id)]}">${sk.table}</button>`).join('')}</div>
      </div>
      <div class="row"><button class="btn ghost" data-intro="${tables[0].id}">💡 Se eksemplet</button></div>
    </div>` : '';
  const rows = tablesRow + d.skills.filter((sk) => !sk.table).map(row).join('');
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button><span class="muted">Øvebanen</span></div>
    <section class="area-hero" style="--ac:${d.color}">
      <img class="disc-art" src="${Z.DISC_ART[d.id]}" alt="" width="150" height="112">
      <div style="flex:1;min-width:200px"><h1 style="margin:0">${d.name}</h1>
        <div class="muted" style="font-weight:700">${d.desc}${d.chapter ? ` · kapitel ${d.chapter} i matematikbogen` : ''}</div></div>
    </section>
    ${patchCard(st, d)}
    <div style="margin-top:14px">${say('kaj', 'Kig på eksemplet først, hvis du er i tvivl. Opgaverne bliver sværere, efterhånden som du kan dem 🦜')}</div>
    <div class="stack" style="margin-top:16px">${rows}</div>`, (e) => { if (e.key === 'Escape') showPracticeHub(); });
  on('#back', 'click', showPracticeHub);
  on('#pc-mixed', 'click', () => { sfx('tap'); startMixed(discId); });
  on('#pc-shirt', 'click', () => showShirt(discId));
  on('[data-practice]', 'click', (e) => { sfx('tap'); startPractice(e.currentTarget.dataset.practice, discId); });
  on('[data-intro]', 'click', (e) => showIntro(e.currentTarget.dataset.intro, () => showDiscipline(discId), { btn: `Tilbage til ${d.name}`, back: `Tilbage til ${d.name}` }));
}

// ================= Ranger-skjorten: et mærke for hver disciplin på Øvebanen =================
// Mærket kommer, når alle disciplinens øvelser er sikre ⭐ (E.awardBronze), og får sølv- og guldtråd af de blandede
// runder (E.recordMixed). Det lander i sykurven, og hun trækker det selv derhen på skjorten, hvor det skal sidde – for
// eller bag – og kan altid flytte det igen. pos = { side: 'f' | 'b', x, y (mærkets midte i % af billedet), r (hældning), z }

const TIER = [
  null,
  { cls: 't-bronze', name: 'Bronze', thread: 'Bronzetråd', what: 'Kan det' },
  { cls: 't-silver', name: 'Sølv', thread: 'Sølvtråd', what: 'Kan blande' },
  { cls: 't-gold', name: 'Guld', thread: 'Guldtråd', what: 'Husker det' },
];
const TIER_WHY = [
  '',
  'Alle disciplinens øvelser er sikre ⭐ – så får du mærket.',
  `Klar en blandet runde: ${E.PATCH.N} opgaver fra alle øvelserne på sværeste niveau – mindst ${E.PATCH.PASS} rigtige.`,
  `Klar runden igen mindst ${E.PATCH.GOLD_DAYS} dage efter sølvtråden – så sidder det fast.`,
];
// Korte navne under de små mærker
const PATCH_NAME = {
  'd-tal': 'Titalssystemet', 'd-plusminus': 'Plus og minus', 'd-gange': 'Gange', 'd-regneregler': 'Regneregler',
  'd-division': 'Division', 'd-brok': 'Brøker', 'd-decimal': 'Decimaltal', 'd-ligninger': 'Ligninger', 'd-moenstre': 'Mønstre',
  'd-linjer': 'Linjer og vinkler', 'd-figurer': 'Figurer', 'd-koordinater': 'Koordinater', 'd-areal': 'Areal og omkreds',
  'd-maal': 'Måling', 'd-tid': 'Tid', 'd-diagrammer': 'Diagrammer', 'd-beskriv': 'Beskriv data', 'd-chance': 'Chance',
};
const PATCH_STAR = '<svg class="patch-star" viewBox="-12 -12 24 24" aria-hidden="true"><path d="M0-10l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L0 4.9-5.9 8.2l1.3-6.6L-9.5-3l6.6-.8z"/></svg>';
const SHIRT_PATCH = 15; // et mærke på skjorten er 15 % af skjortens bredde (samme som --s: 15cqw i CSS)
const discById = (id) => DISCIPLINES.find((d) => d.id === id);
const patchName = (d) => PATCH_NAME[d.id] || d.name;
const patchList = (st) => DISCIPLINES.filter((d) => d.skills.length).map((d) => ({ d, p: E.patchOf(st, d.id) }));
const unsewn = (st) => patchList(st).filter((x) => x.p && !x.p.pos);
const patchNews = (st) => patchList(st).filter((x) => x.p && !x.p.seen).length;
const mixedLabel = (d) => (d.skills.length > 1 ? 'Start den blandede runde' : 'Start runden på niveau 3');
const daysTxt = (n) => `${n} ${n === 1 ? 'dag' : 'dage'}`;

// Ét mærke: disciplinens tegning på rund stofbund med en syet kant i bronze-, sølv- eller guldtråd (tier 0 = mangler endnu)
function patchArt(id, tier, { cls = '', attrs = '', style = '' } = {}) {
  return `<span class="patch ${tier ? TIER[tier].cls : 'ghost'} ${cls}" style="--ac:${discById(id).color};${style}" ${attrs}>`
    + `<img src="${Z.DISC_ART[id]}" alt="" draggable="false" decoding="async">${tier === 3 ? PATCH_STAR : ''}</span>`;
}

// Nye mærker deles ud, så snart alle øvelser i en disciplin er sikre – også når de er øvet i zoo'en
function checkPatches() {
  const fresh = E.awardBronze(S.state, DISCIPLINES);
  if (fresh.length) save();
  return fresh;
}

// Skjorten med de mærker, der sidder på den ene side (senest syede øverst). mini = det lille billede på Øvebanen
function shirtStage(st, side, mini = false) {
  const placed = patchList(st).filter((x) => x.p?.pos?.side === side).sort((a, b) => a.p.pos.z - b.p.pos.z);
  return `<div class="shirt-stage${mini ? ' mini' : ''}" data-side="${side}">
      <img class="shirt-img" src="${Z.SHIRT[side].src}" alt="" draggable="false" decoding="async">
      ${placed.map(({ d, p }) => patchArt(d.id, p.tier, {
        cls: `on-shirt${p.seen || mini ? '' : ' fresh'}`,
        style: `left:${p.pos.x}%;top:${p.pos.y}%;--r:${p.pos.r}deg`,
        attrs: mini ? 'aria-hidden="true"' : `data-patch="${d.id}" data-from="shirt" role="button" tabindex="0" aria-label="${esc(d.name)}: træk for at flytte mærket"`,
      })).join('')}
    </div>`;
}

// Det lille kort øverst på Øvebanen: skjorten, hvor mange mærker hun har, og om der venter nye i sykurven
function shirtTeaser(st) {
  const list = patchList(st), have = list.filter((x) => x.p).length, waiting = unsewn(st).length, news = patchNews(st);
  const line = waiting ? `${waiting === 1 ? 'Et nyt mærke venter' : `${waiting} nye mærker venter`} i sykurven`
    : news ? '✨ Et af dine mærker har fået ny tråd' : have ? 'Se, hvilke mærker du mangler' : 'Klar en disciplin, og få dit første mærke';
  return `<button class="card shirt-teaser" id="shirt">
      <span class="st-mini">${shirtStage(st, 'f', true)}</span>
      <span class="st-txt"><b class="head">Min ranger-skjorte</b>
        <span>${have} af ${list.length} mærker</span>
        <span class="${waiting || news ? 'st-new' : ''}">${waiting ? `<img class="place-ic" src="${UI_ICONS.sykurv}" alt="">` : ''}${line}</span>
        <span class="bar-mini" aria-hidden="true"><i style="width:${Math.round((100 * have) / list.length)}%"></i></span></span>
      <span class="st-go" aria-hidden="true">→</span>
    </button>`;
}

// Mærket for disciplinen øverst på dens side: hvor langt hun er, og næste trin (den blandede runde)
function patchCard(st, d) {
  const p = E.patchOf(st, d.id), m = E.mixedState(st, d.id), pr = E.discProgress(st, d);
  let head, txt, btn = '';
  if (!p) {
    head = 'Mærket til din ranger-skjorte';
    txt = `Bliv sikker ⭐ i ${pr.total === 1 ? 'øvelsen' : `alle ${pr.total} øvelser`} – så får du det. Du har ${pr.done} af ${pr.total}.`;
  } else if (m.next === 2) {
    head = `${TIER[1].thread} · ${TIER[1].what}`; txt = `Næste: sølvtråd. ${TIER_WHY[2]}`; btn = mixedLabel(d);
  } else if (m.next === 3 && !m.open) {
    head = `${TIER[2].thread} · ${TIER[2].what}`; txt = `Næste: guldtråd. Runden åbner igen om ${daysTxt(m.wait)} – så kan vi se, om du stadig husker det.`;
  } else if (m.next === 3) {
    head = `${TIER[2].thread} · ${TIER[2].what}`; txt = `Næste: guldtråd. Klar runden igen med mindst ${E.PATCH.PASS} af ${E.PATCH.N} rigtige – så sidder det fast.`; btn = mixedLabel(d);
  } else {
    head = `${TIER[3].thread} · ${TIER[3].what}`; txt = 'Mærket er helt færdigt. Du kan stadig tage runden for sjov.'; btn = 'Tag runden for sjov';
  }
  return `<section class="card patch-card" style="--ac:${d.color}">
      <button class="pc-patch" id="pc-shirt" aria-label="Se din ranger-skjorte">${patchArt(d.id, p?.tier || 0)}</button>
      <div class="pc-txt"><b>${head}</b><span>${txt}</span>${p ? '' : `<span class="bar-mini" aria-hidden="true"><i style="width:${Math.round((100 * pr.done) / pr.total)}%"></i></span>`}</div>
      ${btn ? `<button class="btn" id="pc-mixed">${btn}</button>` : ''}
    </section>`;
}

// Min ranger-skjorte: skjorten (for og bag), sykurven med de mærker, der ikke er syet på endnu, og alle mærkerne –
// også dem, der mangler, med hvor langt hun er. from = disciplinen, hun kom fra (ellers Øvebanen)
function showShirt(from = null, side = 'f', calm = false) {
  const st = S.state;
  checkPatches();
  const list = patchList(st), have = list.filter((x) => x.p), basket = unsewn(st);
  const goBack = () => (from ? showDiscipline(from) : showPracticeHub());
  const count = (s) => have.filter(({ p }) => p.pos?.side === s).length;
  const sample = have[0]?.d.id || 'd-koordinater';
  const hint0 = basket.length ? 'Træk et mærke fra sykurven op på skjorten – eller tryk på mærket og så på skjorten.'
    : have.some(({ p }) => p.pos) ? 'Du kan altid flytte et mærke: træk det et nyt sted hen – eller ned i sykurven.' : '';
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button><span class="muted">${from ? esc(discById(from).name) : 'Øvebanen'}</span></div>
    <div class="shirt-head"><h1>Min ranger-skjorte</h1><span class="shirt-count">${have.length} af ${list.length} mærker</span></div>
    <div class="shirt-layout">
      <section class="shirt-col">
        <div class="seg shirt-sides" role="tablist" aria-label="Skjortens side">${['f', 'b'].map((s) => `<button role="tab" data-side="${s}" aria-selected="${s === side}" class="${s === side ? 'on' : ''}">${Z.SHIRT[s].name}${count(s) ? ` · ${count(s)}` : ''}</button>`).join('')}</div>
        <div class="shirt-card" role="region" aria-label="Din ranger-skjorte, ${Z.SHIRT[side].name.toLowerCase()}">${shirtStage(st, side)}</div>
        <p class="shirt-hint" id="shirt-hint" aria-live="polite">${hint0}</p>
      </section>
      <div class="shirt-aside">
        ${have.length ? '' : say('liv', 'Her er din ranger-skjorte! Når du er sikker ⭐ i alle øvelser i en disciplin på Øvebanen, får du et mærke til den – og du bestemmer selv, hvor det skal sidde.')}
        <section class="card basket" id="basket" aria-label="Sykurven"><h2 class="with-ic">${ui('sykurv')}Sykurven</h2>
          ${basket.length ? `<div class="basket-items">${basket.map(({ d, p }) => `<button class="basket-item" data-patch="${d.id}" data-from="basket" aria-label="${esc(d.name)}: træk mærket op på skjorten">
              ${patchArt(d.id, p.tier)}<span class="bi-nm">${patchName(d)}</span>${p.seen ? '' : '<b class="new-tag">Nyt!</b>'}</button>`).join('')}</div>`
            : `<p class="muted basket-empty">${have.length ? 'Alle dine mærker er syet på 👏' : 'Her lander dit første mærke.'}</p>`}
        </section>
        <section class="card all-patches"><div class="spread"><h2>Alle mærker</h2><span class="muted small">Tryk og se, hvad der mangler</span></div>
          <div class="ap-grid">${list.map(({ d, p }) => {
            const pr = E.discProgress(st, d);
            return `<button class="ap-item" data-info="${d.id}">${patchArt(d.id, p?.tier || 0, { cls: 'sm' })}<span class="ap-nm">${patchName(d)}</span>
              <span class="ap-st ${p ? TIER[p.tier].cls : ''}">${p ? TIER[p.tier].name : `${pr.done} af ${pr.total} ⭐`}</span></button>`;
          }).join('')}</div>
        </section>
        <section class="card tier-card"><h2>Mærket bliver flottere</h2>
          <ul class="tier-list">${[1, 2, 3].map((t) => `<li>${patchArt(sample, t, { cls: 'sm' })}<div><b>${TIER[t].thread} · ${TIER[t].what}</b><span>${TIER_WHY[t]}</span></div></li>`).join('')}</ul>
          <p class="small muted" style="margin:0">Et mærke kan aldrig blive taget fra dig igen.</p>
        </section>
      </div>
    </div>`, (e) => { if (e.key === 'Escape' && !document.querySelector('.patch-ghost')) goBack(); }, { calm });
  on('#back', 'click', goBack);
  on('.shirt-sides [data-side]', 'click', (e) => { sfx('tap'); showShirt(from, e.currentTarget.dataset.side, true); });
  on('.ap-item', 'click', (e) => patchSheet(e.currentTarget.dataset.info));
  bindShirtDrag(side, () => showShirt(from, side, true));
  // En ny tråd på et mærke, der allerede sidder på skjorten, glimter én gang
  const fresh = have.filter(({ p }) => p.pos && !p.seen);
  if (fresh.length) { fresh.forEach(({ p }) => { p.seen = true; }); save(); }
}

// Et mærke under "Alle mærker": hvad det kræver, og hvad næste trin er
function patchSheet(id) {
  const st = S.state, d = discById(id), p = E.patchOf(st, id), m = E.mixedState(st, id);
  const left = d.skills.filter((sk) => !['sikker', 'mestret'].includes(E.skillStatus(st, sk.id)));
  const next = !p ? `Bliv sikker ⭐ i ${left.length === 1 ? 'den sidste øvelse' : `de sidste ${left.length} øvelser`}: ${left.slice(0, 4).map((sk) => esc(sk.name)).join(', ')}${left.length > 4 ? ' …' : ''}.`
    : m.next === 2 ? `<b>Næste: sølvtråd.</b> ${TIER_WHY[2]}`
    : m.next === 3 ? `<b>Næste: guldtråd.</b> ${m.open ? 'Runden er åben igen nu.' : `Runden åbner igen om ${daysTxt(m.wait)} – så kan vi se, om du stadig husker det.`}`
    : 'Mærket er helt færdigt – flot!';
  const go = p && m.open && m.next;
  openSheet(`<div class="patch-sheet">
      ${patchArt(id, p?.tier || 0, { cls: 'lg' })}
      <div class="ps-txt"><span class="kicker">${p ? `${TIER[p.tier].thread} · ${TIER[p.tier].what}` : 'Mangler endnu'}</span>
        <h2>${d.name}</h2>
        ${p ? `<p><b>Det kan du:</b> ${esc(d.desc)}</p>` : ''}
        <p>${next}</p>
        <div class="row">${go ? `<button class="btn" id="ps-mixed">${mixedLabel(d)}</button>` : ''}<button class="btn${go ? ' ghost' : ''}" id="ps-disc">Gå til ${esc(d.name)}</button></div>
      </div></div>`, (el) => {
    el.querySelector('#ps-mixed')?.addEventListener('click', () => { closeSheet(); startMixed(id); });
    el.querySelector('#ps-disc').addEventListener('click', () => { closeSheet(); showDiscipline(id); });
  });
}

// Er punktet (x, y i % af billedet) på stoffet? Skjortens gennemsigtige kant aflæses én gang på et lille lærred pr. side
const shirtMasks = new Map();
function onShirt(img, x, y) {
  if (!(x > 2 && x < 98 && y > 2 && y < 98)) return false;
  if (!img.complete || !img.naturalWidth) return true;
  const key = img.currentSrc || img.src;
  let m = shirtMasks.get(key);
  if (!m) {
    const c = document.createElement('canvas');
    c.width = 100;
    c.height = Math.round((100 * img.naturalHeight) / img.naturalWidth);
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, c.width, c.height);
    try { m = { w: c.width, h: c.height, a: g.getImageData(0, 0, c.width, c.height).data }; } catch { return true; }
    shirtMasks.set(key, m);
  }
  const px = Math.min(m.w - 1, Math.floor((x / 100) * m.w)), py = Math.min(m.h - 1, Math.floor((y / 100) * m.h));
  return m.a[(py * m.w + px) * 4 + 3] > 160;
}

// Træk et mærke fra sykurven op på skjorten – eller rundt på den og ned i kurven igen – med finger eller mus.
// Et tryk uden at trække vælger mærket, og et tryk på skjorten syr det på dér (Enter vælger også)
function bindShirtDrag(side, redraw) {
  const st = S.state, stage = $('.shirt-stage'), img = stage.querySelector('.shirt-img'), basket = $('#basket'), hintEl = $('#shirt-hint');
  const hint0 = hintEl.textContent;
  const hint = (t) => { hintEl.textContent = t; };
  const at = (cx, cy) => { const r = stage.getBoundingClientRect(); return { x: ((cx - r.left) / r.width) * 100, y: ((cy - r.top) / r.height) * 100 }; };
  const inBasket = (cx, cy) => { const r = basket.getBoundingClientRect(); return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom; };
  const place = (id, x, y) => {
    if (!onShirt(img, x, y)) return false;
    const p = E.patchOf(st, id), was = p.pos;
    const clamp = (v, lo, hi) => Math.round(Math.min(hi, Math.max(lo, v)) * 10) / 10;
    p.pos = { side, x: clamp(x, 7, 93), y: clamp(y, 6, 95), r: was?.r ?? Math.round(Math.random() * 24 - 12), z: Date.now() };
    p.seen = true;
    save();
    sfx(was ? 'tap' : 'grow');
    return true;
  };
  const unsew = (id) => { E.patchOf(st, id).pos = null; save(); sfx('tap'); };
  let sel = null, drag = null, ghost = null;
  const select = (id) => {
    sel = sel === id ? null : id;
    $$('[data-patch]').forEach((el) => el.classList.toggle('selected', el.dataset.patch === sel));
    stage.classList.toggle('drop-ready', !!sel);
    hint(!sel ? hint0 : E.patchOf(st, sel).pos ? 'Tryk et nyt sted på skjorten – eller på sykurven for at tage mærket af.' : 'Tryk på skjorten, dér hvor mærket skal sidde.');
  };
  const stop = () => {
    ghost?.remove();
    ghost = null;
    stage.classList.remove('drop-ok');
    if (!sel) stage.classList.remove('drop-ready');
    drag?.el.classList.remove('lifting');
    drag = null;
  };
  for (const el of $$('[data-patch]')) {
    el.addEventListener('pointerdown', (e) => {
      if (e.button > 0 || drag) return;
      drag = { el, id: el.dataset.patch, from: el.dataset.from, x0: e.clientX, y0: e.clientY, moved: false };
      el.setPointerCapture?.(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (drag?.el !== el) return;
      if (!drag.moved) {
        if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
        drag.moved = true;
        const src = el.matches('.patch') ? el : el.querySelector('.patch');
        ghost = src.cloneNode(true);
        ghost.classList.remove('on-shirt', 'fresh', 'selected');
        ghost.classList.add('patch-ghost');
        ['data-patch', 'data-from', 'role', 'tabindex', 'aria-label'].forEach((a) => ghost.removeAttribute(a));
        ghost.style.setProperty('--s', `${(stage.clientWidth * SHIRT_PATCH) / 100}px`);
        document.body.appendChild(ghost);
        el.classList.add('lifting');
        stage.classList.add('drop-ready');
      }
      ghost.style.left = `${e.clientX}px`;
      ghost.style.top = `${e.clientY}px`;
      const { x, y } = at(e.clientX, e.clientY);
      stage.classList.toggle('drop-ok', onShirt(img, x, y));
    });
    el.addEventListener('pointerup', (e) => {
      if (drag?.el !== el) return;
      const d = drag;
      stop();
      if (!d.moved) return select(d.id);
      const { x, y } = at(e.clientX, e.clientY);
      if (place(d.id, x, y)) return redraw();
      if (d.from === 'shirt' && inBasket(e.clientX, e.clientY)) { unsew(d.id); return redraw(); }
      hint(d.from === 'shirt' ? 'Mærket blev siddende. Træk det ned i sykurven, hvis det skal af.' : 'Slip mærket på selve skjorten.');
    });
    el.addEventListener('pointercancel', () => { if (drag?.el === el) stop(); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(el.dataset.patch); } });
  }
  stage.addEventListener('click', (e) => {
    if (!sel || e.target.closest('[data-patch]')) return;
    const { x, y } = at(e.clientX, e.clientY);
    if (place(sel, x, y)) redraw(); else hint('Tryk på selve skjorten.');
  });
  basket.addEventListener('click', (e) => {
    if (!sel || e.target.closest('[data-patch]') || !E.patchOf(st, sel).pos) return;
    unsew(sel);
    redraw();
  });
}

// Den blandede runde (sølv- og guldtråd): 10 opgaver på kryds og tværs af disciplinen på sværeste niveau – på stien
function startMixed(discId) {
  const d = discById(discId), block = E.mixedBlock(d);
  S.run = { mode: 'practice', mixed: discId, sess: { area: d.id, main: d.skills[0].id, blocks: [block] }, bi: 0, ti: 0, results: [], before: snapshot(S.state), t0: Date.now(), retried: new Set() };
  goBlock();
}

// Slutningen på en blandet runde: et nyt trin på mærket fejres; ellers hvor mange der manglede – og at hun må prøve igen
function showMixedDone(run, wins) {
  const st = S.state, d = discById(run.mixed), n = run.results.length, ok = run.results.filter((r) => r.correct).length;
  const tier = E.recordMixed(st, d.id, ok);
  save(true);
  const p = E.patchOf(st, d.id), m = E.mixedState(st, d.id);
  const can = tier === 2 ? `At blande opgaverne i ${d.name.toLowerCase()} og selv finde ud af, hvordan hver enkelt skal regnes.` : `At huske ${d.name.toLowerCase()} – også efter en uge.`;
  const msg = tier ? `<div class="md-can"><b>Det kan du nu</b>${can}</div>`
    : m.next ? `<p>Du skal have mindst ${E.PATCH.PASS} rigtige for ${TIER[m.next].thread.toLowerCase()}. Prøv igen, når du har lyst – hver runde gør det lettere at huske.</p>`
    : '<p>Mærket er allerede i guldtråd – flot, at du holder det ved lige!</p>';
  view(`
    <div class="card sheet center stack practice-done mixed-done" style="margin-top:4vh">
      ${patchArt(d.id, p.tier, { cls: `xl${tier ? ' fresh' : ''}` })}
      <div class="kicker">${esc(d.name)} · ${esc(run.sess.blocks[0].sub)}</div>
      <h1>${tier ? `${TIER[tier].thread} på dit mærke!` : 'Runden er slut'}</h1>
      <p class="pd-count">${ok} af ${n} rigtige</p>
      ${msg}
      ${wins.length ? `<ul class="wins">${wins.map((w) => `<li><span class="e">${w.e}</span><span>${w.t}</span></li>`).join('')}</ul>` : ''}
      <div class="row" style="justify-content:center">
        ${tier ? '<button class="btn big" id="md-shirt">Se din skjorte</button>' : m.open && m.next ? '<button class="btn big" id="md-again">Prøv runden igen</button>' : ''}
        <button class="btn ${tier || (m.open && m.next) ? 'ghost' : 'big'}" id="md-back">← Tilbage til ${esc(d.name)}</button>
      </div>
    </div>`, (e) => { if (e.key === 'Enter') (tier ? showShirt(d.id) : showDiscipline(d.id)); });
  on('#md-shirt', 'click', () => showShirt(d.id));
  on('#md-again', 'click', () => startMixed(d.id));
  on('#md-back', 'click', () => showDiscipline(d.id));
  if (tier) { sfx('level'); setTimeout(() => confetti(), 250); } else sfx('finish');
}

// Til forældredelen: skjorten og hvor mange mærker der er i hvilken tråd
function shirtParent(st) {
  const list = patchList(st), have = list.filter((x) => x.p), n = (t) => have.filter(({ p }) => p.tier === t).length;
  return `<div class="card shirt-parent"><span class="st-mini">${shirtStage(st, 'f', true)}</span>
      <div><h3 style="margin:0 0 4px">Ranger-skjorten · ${have.length} af ${list.length} mærker</h3>
        <p class="muted small" style="margin:0">${have.length ? `${n(1)} i bronze, ${n(2)} i sølv og ${n(3)} i guld. ` : ''}Et mærke kommer, når alle øvelser i en disciplin er sikre ⭐. Sølvtråd: en blandet runde med mindst ${E.PATCH.PASS} af ${E.PATCH.N} rigtige på sværeste niveau. Guldtråd: den samme runde igen mindst ${E.PATCH.GOLD_DAYS} dage senere.</p></div>
    </div>`;
}

// ================= Intro til en færdighed =================

// back = teksten på tilbage-knappen øverst (fx "Tilbage til Foderlageret"); den, Escape og knappen nederst
// fører alle til next. Åbnes forklaringen af sig selv midt i en opgave, er det "Tilbage til opgaven".
function showIntro(skillId, next, { btn = 'Jeg er klar', back = 'Tilbage til opgaven' } = {}) {
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
      <button class="back-link" id="back"><span class="icon-btn" aria-hidden="true">←</span>${back}</button>
      <div class="card sheet intro-card stack">
        <div class="kicker with-ic">${placeIc(a)} ${a.place} · ${steps ? 'Sådan gør du' : 'Nyt emne'}</div>
        <h1>${Z.ACTIVITIES[skillId]?.name || s.name}</h1>${Z.ACTIVITIES[skillId] ? `<div class="muted" style="font-weight:700;margin-top:-8px">${s.name}</div>` : ''}
        ${steps ? `${explainTop(s.intro, false)}${stepsBlock(steps, shown)}` : s.intro.cards ? explainCards(s.intro) : `<div class="body">${s.intro.text}</div>${s.intro.visual ? `<div class="visual">${s.intro.visual()}</div>` : ''}`}
        <div class="center">${more
          ? `<button class="btn big" id="more">Næste trin (${shown}/${steps.length})</button>`
          : `<button class="btn big" id="go">${btn}</button>`}</div>
      </div>`, (e) => { if (e.key === 'Enter') (more ? step() : go()); else if (e.key === 'Escape') go(); });
    on('#go', 'click', go);
    on('#back', 'click', go);
    on('#more', 'click', step);
    if (shown > 1) $$('.walk li').pop()?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const step = () => { sfx('tap'); shown++; render(); };
  render();
}

// Forklaringernes zoo-billede (Z.EXPLAIN_PICS): det konkrete billede mellem symbolet og reglen
const explainPic = (key, cls) => {
  const pic = key && Z.EXPLAIN_PICS[key];
  return pic ? `<img class="${cls}" src="${pic.src}" alt="${pic.alt}" draggable="false">` : '';
};
// Zoo'ens miljø (Z.ENV_PICS, Batch 3): sekundært og dekorativt – hentes først, når det vises
const envPic = (key, cls = 'env-pic') => {
  const pic = key && Z.ENV_PICS[key];
  return pic ? `<img class="${cls}" src="${pic.src}" width="${pic.w}" height="${pic.h}" alt="" loading="lazy" decoding="async" draggable="false">` : '';
};

// Indledningen med sidens zoo-billede ved siden af: det konkrete billede (intro.pic) eller – kun på selve
// "Se hvordan"-siden – områdets miljø (intro.scene). Under Hjælp kun det konkrete billede.
const explainTop = (intro, lead) => {
  const pic = explainPic(intro.pic, 'ex-lead-pic') || (lead && intro.lead ? envPic(intro.scene, 'ex-lead-pic env') : '');
  const text = lead && intro.lead ? `<p class="ex-lead">${intro.lead}</p>` : '';
  return pic ? `<div class="ex-lead-row${text ? '' : ' solo'}">${text}${pic}</div>` : text;
};

// Forklaring som små kort (intro.cards): tegning eller zoo-billede (pic), overskrift, reglerne og et konkret
// zoo-eksempel. intro.tip er et lille "Sådan gør du"-kort nederst. Bruges på "Se hvordan" og under Hjælp.
const explainCards = (intro, { lead = true } = {}) => `
  ${explainTop(intro, lead)}
  <div class="ex-cards">${intro.cards.map((c) => `
    <section class="ex-card">
      ${c.pic ? `<div class="ex-pic">${explainPic(c.pic, 'ex-pic-img')}</div>` : c.visual ? `<div class="ex-vis">${c.visual()}</div>` : ''}
      <h3>${c.title}</h3>
      ${c.rules?.length ? `<ul class="ex-rules">${c.rules.map((r) => `<li>${r}</li>`).join('')}</ul>` : ''}
      ${c.note ? `<p class="ex-note">${c.note}</p>` : ''}
    </section>`).join('')}</div>
  ${intro.tip ? `<div class="ex-tip"><h3>${intro.tip.title}</h3><ul>${intro.tip.rows.map(([k, op, ex]) => `
    <li><span class="k">${k}</span>${op ? `<span class="op">${op}</span>` : ''}<span>${ex}</span></li>`).join('')}</ul></div>` : ''}`;

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
  if (freePlayOpen(S.state)) return showHome(); // én mission om dagen – derefter fri træning
  const sess = E.buildSession(S.state, areaId);
  const m = mission ? { who: mission.who, title: mission.title } : null;
  S.run = { mode: 'daily', sess, mission: m, bi: 0, ti: 0, results: [], before: snapshot(S.state), t0: Date.now(), retried: new Set() };
  preloadScene(areaId);
  goBlock();
}

// Missionslinjen øverst i træningen: missionen + de 3 trin med fremdrift
function missionTrack(run, block) {
  if (run.mode !== 'daily') {
    const a = areaOf(run.sess.area);
    return `<div class="mission-track">
      <div class="mt-title">${placeIc(a)} <b>${a.place}</b> · ${esc(block.sub)}</div>
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

// discId: startet fra en disciplin på Øvebanen – så er det 10 opgaver, og "Øvelse klaret!" fører tilbage dertil
function startPractice(skillId, discId) {
  const s = ALL_SKILLS[skillId], a = areaOf(discId || s.area);
  const sub = discId ? s.name : Z.ACTIVITIES[skillId]?.name || s.name;
  const sess = { area: a.id, main: skillId, blocks: [{ kind: 'practice', title: a.place, sub, count: discId || s.practice ? 10 : 8, skill: skillId }] };
  S.run = { mode: 'practice', sess, bi: 0, ti: 0, results: [], before: snapshot(S.state), t0: Date.now(), retried: new Set() };
  preloadScene(s.area);
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
    ? say('kaj', `Sidste del: Zoo-runden! ${block.count} blandede opgaver fra hele zoo'en – så er dagens mission klaret 🦜`, 'lg')
    : say(who, `${prev?.kind === 'warm' ? 'Ungerne er mætte! ' : ''}Nu skal vi i gang i ${areaOf(run.sess.area).place}: ${z.step}.`, 'lg');
  const rule = block.kind === 'main' ? starRule(block.skill) : '';
  // Områdets del af missionen: samme scene som på forsiden, nu i gang. Runden i zoo'en: et glimt af et
  // andet sted i zoo'en (skifter fra dag til dag)
  const art = run.mode === 'daily' && block.kind === 'main' && hasScene({ area: run.sess.area, who })
    ? missionScene({ area: run.sess.area, who, title: run.mission?.title || '' }, 'progress', 'card')
    : block.kind === 'review'
      ? `<div class="block-env" aria-hidden="true">${envPic(Z.ROUND_ENV[new Date().getDate() % Z.ROUND_ENV.length])}</div>`
      : `<div class="block-art">${blockIcon(block)}</div>`;
  view(`
    ${run.mode === 'daily' ? `<div class="session-top"><button class="icon-btn" id="quit" aria-label="Stop">✕</button>${missionTrack(run, block)}</div>` : ''}
    <div class="card sheet center stack" style="margin-top:4vh">
      ${prev?.kind === 'warm' ? '<div class="kicker">✓ Babyhuset klaret</div>' : ''}
      ${art}
      <h1>${block.title}</h1>
      <div style="text-align:left">${line}</div>
      ${rule}
      <div><button class="btn big" id="go">Videre</button></div>
    </div>`, (e) => { if (e.key === 'Enter') showTask(); });
  on('#go', 'click', showTask);
  on('#quit', 'click', quitSession);
}

// Reglen for stjernen i den aktivitet, man skal i gang med (vises mellem missionens dele)
function starRule(skillId) {
  const s = ALL_SKILLS[skillId], lv = E.skillState(S.state, skillId).level, status = E.skillStatus(S.state, skillId);
  const dots = [1, 2, 3].map((n) => `<i class="${n <= lv ? 'on' : ''}"></i>`).join('');
  if (status === 'sikker' || status === 'mestret') {
    return `<p class="block-rule"><span class="lv-dots" aria-hidden="true">${dots}</span><span>Du er ${status === 'mestret' ? 'mester 🌟' : 'sikker ⭐'} i <b>${s.name}</b>. ${status === 'mestret' ? 'Øv videre, så den bliver ved med at sidde.' : 'Bliv sikker igen på en anden dag – så bliver du mester 🌟.'}</span></p>`;
  }
  return `<p class="block-rule"><span class="lv-dots" aria-hidden="true">${dots}</span><span><b>${s.name}</b> · niveau ${lv} af 3. ${lv < 3
    ? 'Får du 3 rigtige i træk, kommer du et niveau op. På niveau 3 skal 8 af 10 være rigtige – så er du sikker ⭐.'
    : 'Får du 8 af 10 rigtige her, er du sikker ⭐.'}</span></p>`;
}

// Fremgang i aktiviteten efter et første svar: niveau op/ned, sikker eller mester – vises med det samme
function progressNote(skillId, was) {
  const s = ALL_SKILLS[skillId], lv = E.skillState(S.state, skillId).level, status = E.skillStatus(S.state, skillId);
  if (status === 'mestret' && was.status !== 'mestret') return `🌟 Nu er du <b>mester</b> i ${s.name}!`;
  if (status === 'sikker' && was.status !== 'sikker' && was.status !== 'mestret') return `⭐ Nu er du <b>sikker</b> i ${s.name}!`;
  if (lv > was.lv) return lv - was.lv > 1 ? '⬆️ Du kan det allerede – nu springer vi til niveau 3!' : `⬆️ 3 rigtige i træk – nu bliver opgaverne lidt sværere (niveau ${lv} af 3).`;
  if (lv < was.lv) return `Vi tager lidt lettere opgaver et øjeblik (niveau ${lv} af 3).`;
  return '';
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

// Opgavens scene: miljøet fra det område, opgaven hører til, som ét bredt bånd over opgaven (zoo-runden
// skifter område for hver opgave). Områdets udsnit (--y normalt, --yk kompakt) sættes på båndet; uden et
// kompakt udsnit beholder båndet altid sin normale form (.fixed)
function taskScene(task) {
  const sc = task.kind !== 'warm' && Z.TASK_SCENES[ALL_SKILLS[task.skill]?.area];
  if (!sc) return '';
  const img = `<img src="${sc.src}" alt="" draggable="false" decoding="async">`;
  return `<div class="task-scene${sc.yk ? '' : ' fixed'}" style="--y:${sc.y};--yk:${sc.yk || sc.y}" aria-hidden="true">${img}</div>`;
}
// Hent kun det aktuelle områdes scene på forhånd
const preloadScene = (areaId) => { if (Z.TASK_SCENES[areaId]) new Image().src = Z.TASK_SCENES[areaId].src; };

// Øvebanen som en sti: en øvelse fra en disciplin på Øvebanen står på en seddel over disciplinens scene, og de
// 10 opgaver er trædesten (grøn = rigtigt i første forsøg, orange = ikke, gul = den, hun er ved)
function trailOf(run) {
  if (run.mode !== 'practice') return null;
  const d = DISCIPLINES.find((x) => x.id === run.sess.area);
  return d ? { d, bg: Z.PRACTICE_BG[Z.DISC_BG[d.id] || 'oevebane'] } : null;
}
const trailStones = (run, block) => `<ol class="trail-stones" aria-label="Opgave ${Math.min(run.ti + 1, block.count)} af ${block.count}">${Array.from({ length: block.count }, (_, i) =>
  `<li class="${i < run.ti ? (run.results[i]?.correct ? 'ok' : 'miss') : i === run.ti ? 'now' : ''}"><span>${i + 1}</span></li>`).join('')}</ol>`;

function renderTask(block, task) {
  const run = S.run;
  run.task = task;
  run.shownAt = Date.now();
  const p = task.p;
  const trail = trailOf(run);
  let banner = '';
  if (task.kind === 'warm') {
    const b = Z.BABIES[task.fact];
    if (b.expr) [b.expr.think, b.expr.cheer].forEach((src) => { new Image().src = src; }); // forhåndsindlæs udtryk
    banner = `<div class="baby-banner">${baby(task.fact).replace('class="baby ', 'class="baby idle ').replace(' new ', ' ')}
      <div><div class="t">${b.name} vil have flaske</div><div class="s">Svar rigtigt og hurtigt – så vokser ${b.name}</div></div></div>`;
  }
  const help = (task.kind === 'main' || task.kind === 'practice') ? `<button class="link small" id="help">💡 Hjælp</button>` : '';

  view(`
    ${trail ? `<div class="trail-bg" aria-hidden="true"><picture><source media="(orientation: portrait)" srcset="${trail.bg.s}"><img src="${trail.bg.l}" alt="" decoding="async"></picture></div>
    <div class="trail-top">
      <div class="trail-sign"><button class="icon-btn" id="quit" aria-label="Stop">✕</button><span>${placeIc(trail.d)} <b>${trail.d.name}</b> · ${esc(block.sub)}</span></div>
    </div>
    ${trailStones(run, block)}` : `<div class="session-top">
      <button class="icon-btn" id="quit" aria-label="Stop">✕</button>
      ${missionTrack(run, block)}
    </div>`}
    <div class="card${trail ? ' trail-note' : ''}">
      ${banner}
      <div class="task ${p.input !== 'choice' && p.input !== 'parts' ? 'has-input' : ''} ${p.visual ? 'has-visual' : ''}">
        <div>
          ${trail ? '' : taskScene(task)}
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
      ? `<div class="feedback retry" style="margin-top:14px">${explainTop(s.intro, false)}${stepsBlock(s.intro.steps)}</div>`
      : s.intro.cards
        ? `<div class="ex-help">${explainCards(s.intro, { lead: false })}</div>`
        : `<div class="feedback retry" style="margin-top:14px"><div>${s.intro.text}</div>${s.intro.visual ? `<div class="explain-visual">${s.intro.visual()}</div>` : ''}</div>`;
    $('#help').remove();
  });
  mountInput(p, answer);
  // Opgaven er vigtigere end scenen: kan kortet med opgaven (tekst, tegning, tastatur og "Tjek") ikke ses helt
  // uden at scrolle (fx en lang tekstopgave på telefon), bliver scenen først kompakt og forsvinder så – før
  // skærmen tegnes. Kortet glider ind nedefra (de 10 px trækkes fra)
  const scene = $('.task-scene'), card = scene?.closest('.card');
  if (scene) {
    const lift = new DOMMatrixReadOnly(getComputedStyle(card).transform).m42;
    const over = () => card.getBoundingClientRect().bottom - lift > innerHeight;
    if (over() && !scene.classList.contains('fixed')) scene.classList.add('compact');
    if (over()) scene.remove();
  }
}

// ---------- Svar-input ----------

function mountInput(p, onSubmit) {
  const aa = $('#aa');
  if (p.input === 'choice') {
    const sym = p.choices.every((c) => c.length <= 1);
    // Lange svar (fx "Parallelogram") får lidt mindre skrift, så de kan være i knappen – også på telefon
    aa.innerHTML = `<div class="choice-grid ${p.wide ? 'wide' : ''} ${p.cols === 2 ? 'cols-2' : ''}">${p.choices.map((c, i) => `<button class="choice ${sym ? 'sym' : ''} ${c.length > 11 ? 'long xlong' : c.length > 9 ? 'long' : ''}" data-i="${i}">${esc(c)}</button>`).join('')}</div>`;
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
  let again = '', grew = '', note = '';
  const b = task.kind === 'warm' ? Z.BABIES[task.fact] : null;
  const was = task.kind === 'warm' ? null : { lv: E.skillState(st, task.skill).level, status: E.skillStatus(st, task.skill) };

  // Kun første forsøg tæller i den adaptive motor
  if (!second) {
    if (task.kind === 'warm') {
      const before = E.factBox(st, task.fact);
      E.recordFact(st, task.fact, correct, ms);
      const after = E.factBox(st, task.fact);
      if (correct && after > before) grew = after >= 5 ? `${b.name} er nu helt voksen! 🌟` : `${b.name} voksede: ${Z.STAGES[after].toLowerCase()} 🍼`;
      else if (correct) grew = before < 5 && ms >= E.FLUENT_MS ? `${b.name} er mæt og glad 🍼 – svar lidt hurtigere (under ${E.FLUENT_MS / 1000} sek.), så vokser den` : `${b.name} er mæt og glad 🍼`;
      if (!correct && !run.retried.has(task.fact)) {
        run.retried.add(task.fact);
        block.tasks.push({ kind: 'warm', fact: task.fact, p: factProblem(FACTS.find((f) => f.key === task.fact)) });
        block.count = block.tasks.length;
      }
    } else {
      E.recordSkill(st, task.skill, correct, task.level, ms);
      note = progressNote(task.skill, was);
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
    const hint = task.kind === 'warm' ? factHint(task.fact) : p.hint || ALL_SKILLS[task.skill]?.intro?.text || '';
    // Hintet: opgavens egen regel og zoo-billede, hvis den har dem (fx måleenhederne), ellers emnets
    const hintPic = task.kind === 'warm' ? '' : explainPic(p.pic || ALL_SKILLS[task.skill]?.intro?.pic, 'hint-pic');
    mountInput(p, answer);
    run.answered = false;
    run.shownAt = Date.now();
    const aa = $('#aa');
    aa.insertAdjacentHTML('afterbegin', `<div class="feedback nudge"><div class="fh">${pick(NUDGE)}</div>
      ${hint ? `<button class="link small" id="hint">💡 Vis et hint</button><div id="hinttext" hidden></div>` : ''}${note ? `<div class="lvl-note">${note}</div>` : ''}</div>`);
    on('#hint', 'click', () => {
      const h = $('#hinttext');
      h.innerHTML = hintPic ? `<div class="hint-row">${hintPic}<div>${hint}</div></div>` : hint;
      h.hidden = false;
      $('#hint').remove();
    });
    return;
  }

  sfx(correct ? (/[⭐🌟]/u.test(note) ? 'level' : grew && grew.includes('voksede') ? 'grow' : 'correct') : 'wrong');
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
    ? `<div class="feedback good"><div class="fh"><span class="tick">✓</span>${praise}</div>${goodBody}${note ? `<div class="lvl-note">${note}</div>` : ''}</div>`
    : `<div class="feedback retry">
        <div class="fh">Svaret er ${answerText(p)}</div>
        <div>${p.explain}</div>
        ${p.explainVisual ? `<div class="explain-visual">${p.explainVisual}</div>` : p.pic ? `<div class="explain-visual">${explainPic(p.pic, 'explain-pic')}</div>` : ''}
        ${again ? `<div class="small muted" style="margin-top:8px">${again}</div>` : ''}
        ${note ? `<div class="lvl-note">${note}</div>` : ''}
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
  // En øvelse fra Øvebanen stopper på Øvebanens oversigt, alt andet i zoo'en
  if (DISCIPLINES.some((d) => d.id === run.sess.area)) showPracticeHub(); else showHome();
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
  const fresh = checkPatches(); // alle øvelser i en disciplin blev sikre → et nyt mærke til ranger-skjorten
  const party = Z.partyDue(st); // alle områder har fået en stjerne, og festen er ikke holdt endnu
  const partyWin = { e: '🎉', t: `Alle ${AREAS.length} områder har fået en stjerne – nu holder Bodil åbningsfest!` };
  const patchWin = (id) => ({ e: '🎽', t: `Nyt mærke til din ranger-skjorte: ${discById(id).name}` });

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
    if (!s.practice && id !== run.sess.main && after.unlocked[id] && !b.unlocked[id]) wins.push({ e: '🔓', t: `Nyt i ${areaOf(s.area).place}: ${s.name}` });
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
  const backDisc = DISCIPLINES.find((x) => x.id === run.sess.area);
  const backArea = !backDisc && run.mode === 'practice' ? AREAS.find((x) => x.id === run.sess.area) : null;
  if (run.mode === 'daily') {
    const res = missionResults(st, run, b, after, born, grew, bonus);
    res.extras = [...(party ? [partyWin] : []), ...fresh.map(patchWin), ...res.extras].slice(0, 3);
    res.patches = fresh.length;
    res.party = party;
    // Til forsidens "Mission klaret" (lægges oven i tidligere vagter i dag)
    const prev = todayLog(st);
    st.zoo.today = {
      date: today(), area: run.sess.area, done: [...new Set([...(prev ? prev.done || [prev.area] : []), run.sess.area])],
      mission: { who: res.t.who, title: res.t.title }, chips: [res.mainChip, ...res.extras].slice(0, 3),
    };
    save(true);
    S.run = null;
    return showPayoff(st, res, b, after, bigWin, !prev?.mission);
  }
  save(true);
  S.run = null;
  // Øvelse fra et område eller Øvebanen: en kort afslutning og tilbage, hvor hun kom fra (dagens mission har sin egen)
  const diff = after.guests - b.guests;
  if (diff > 0) wins.push({ e: '🎟️', t: `+${fmt(diff)} gæster om dagen` });
  wins.unshift(...(party ? [partyWin] : []), ...fresh.map(patchWin));
  if (run.mixed) return showMixedDone(run, wins);
  const where = areaOf(run.sess.area)?.place || '', act = run.sess.blocks[0]?.sub || ALL_SKILLS[run.sess.main]?.name || '';
  const back = backDisc ? { id: 'backdisc', text: `← Tilbage til ${backDisc.name}`, go: () => showDiscipline(backDisc.id) }
    : backArea ? { id: 'backarea', text: `← Tilbage til ${backArea.place}`, go: () => showPlace(backArea.id) } : null;
  // Et kort glimt af stedet, man har øvet i (aktivitetens eget miljø, ellers områdets)
  const env = envPic(ALL_SKILLS[run.sess.main]?.intro?.scene || Z.AREA_ENV[run.sess.area]);
  view(`
    <div class="card sheet center stack practice-done" style="margin-top:4vh">
      ${env ? `<div class="pd-env" aria-hidden="true">${env}</div>` : ''}
      <div class="kicker">${esc(where)}${act ? ` · ${esc(act)}` : ''}</div>
      <h1>Øvelse klaret!</h1>
      <p class="pd-count">Du øvede ${n} opgaver.</p>
      ${wins.length ? `<ul class="wins">${wins.map((w) => `<li><span class="e">${w.e}</span><span>${w.t}</span></li>`).join('')}</ul>` : ''}
      <div class="row" style="justify-content:center">
        ${party ? '<button class="btn big" id="party">Til åbningsfesten 🎉</button>' : ''}
        ${fresh.length ? `<button class="btn ${party ? 'ghost' : 'big'}" id="sew">🧵 Sy mærket på din skjorte</button>` : ''}
        ${back ? `<button class="btn ${party || fresh.length ? 'ghost' : 'big'}" id="${back.id}">${back.text}</button>` : ''}
        <button class="btn ${back || fresh.length || party ? 'ghost' : 'big'}" id="home">Til zoo'en</button>
      </div>
    </div>`, (e) => { if (e.key === 'Enter') (party ? showParty() : fresh.length ? showShirt(backDisc?.id) : back ? back.go() : showHome()); });
  on('#home', 'click', showHome);
  on('#party', 'click', () => showParty());
  on('#sew', 'click', () => showShirt(backDisc?.id));
  if (back) on(`#${back.id}`, 'click', back.go);
  if (bigWin || fresh.length || party) { sfx('level'); setTimeout(() => confetti(), 250); } else sfx('finish');
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
    main = { kind: 'level', emoji: '🌟', art: Z.LEVELS[4].art, kicker: 'Nyt niveau!', title: `${up.a.place} er blevet et guld-område`, sub: 'Alt sidder – også dagen efter.' };
    mainChip = upChip(up);
  } else if (diff > 0) {
    main = { kind: 'guests', emoji: '🎟️', art: UI_ICONS.billet, kicker: 'Flere gæster', title: `<span id="gc">${fmt(b.guests)}</span> gæster om dagen`, sub: `+${fmt(diff)} efter dagens vagt` };
    mainChip = { e: '🎟️', t: `+${fmt(diff)} gæster om dagen` };
  } else {
    const a = areaOf(area), p = E.areaProgress(st, area), L = Z.LEVELS[Z.areaLevel(st, area)];
    main = { kind: 'progress', icon: 'area', kicker: `${a.place} · ${L.icon} ${L.name}`, title: `Sikker ⭐ i ${p.done} af ${p.total} aktiviteter`, sub: Z.nextGoal(st, a), pct: Math.round((100 * p.done) / p.total) };
    mainChip = { e: L.icon, t: `Sikker i ${p.done} af ${p.total} aktiviteter i ${a.place}` };
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
function showPayoff(st, res, b, after, bigWin, freeNew = false) {
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
          ${res.party ? '<button class="btn big" id="party">Til åbningsfesten 🎉</button>' : ''}
          <button class="btn ${res.party ? 'ghost' : 'big'}" id="home">Se din zoo</button>
          ${res.patches ? '<button class="btn ghost" id="sew">🧵 Sy mærket på din skjorte</button>' : ''}
          ${sprintEligible(st) ? '<button class="btn ghost" id="sprint">⚡ Slå din rekord</button>' : ''}
        </div>
        ${freeNew ? '<p class="free-open">🔓 Nu er fri træning åben på kortet resten af dagen.</p>' : ''}
      </div>
    </section>`, (e) => { if (e.key === 'Enter') (res.party ? showParty() : showHome()); });
  on('#home', 'click', showHome);
  on('#party', 'click', () => showParty());
  on('#sprint', 'click', startSprint);
  on('#sew', 'click', () => showShirt());
  if (main.kind === 'guests') setTimeout(() => countUp($('#gc'), b.guests, after.guests, 1100), 500);
  if (bigWin) { sfx('level'); setTimeout(() => confetti(), 300); } else sfx('finish');
}

// ================= Åbningsfesten =================
// Målet i reglerne: når alle områder har fået en stjerne, holder Bodil fest ved porten, og hun klipper snoren over.
// Første gang gemmes festen (state.zoo.party); bagefter kan den ses igen – så er snoren klippet. back = hvor ← fører hen

const partyDate = (d) => { const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }); };
// Sløjfen midt på snoren
const RIBBON_BOW = `<svg class="rb-bow" viewBox="-50 -40 100 84" aria-hidden="true">
    <path d="M-4 4 L-16 40 L-8 35 L-1 42 Z M4 4 L16 40 L8 35 L1 42 Z" fill="#c62f2f"/>
    <path d="M-6 0 C-30 -34 -48 -18 -40 0 C-48 18 -30 34 -6 0Z" fill="#d83a3a" stroke="#9e2020" stroke-width="2"/>
    <path d="M6 0 C30 -34 48 -18 40 0 C48 18 30 34 6 0Z" fill="#d83a3a" stroke="#9e2020" stroke-width="2"/>
    <rect x="-9" y="-9" width="18" height="18" rx="5" fill="#e04848" stroke="#9e2020" stroke-width="2"/>
    <path d="M-24 -14 C-32 -15 -36 -7 -32 -1" fill="none" stroke="#ff9d9d" stroke-width="3" stroke-linecap="round"/>
  </svg>`;

// Kortet øverst på forsiden, mens festen venter
const partyCard = () => `<section class="card party-card">
    <img class="pty-art" src="${UI_ICONS.fest}" alt="">
    <div class="pty-body"><span class="kicker">Alle ${AREAS.length} områder har fået en stjerne ⭐</span>
      <h2>Åbningsfesten venter på dig!</h2>
      <p>Bodil har pyntet porten. Du skal klippe snoren over, så zoo'en kan åbne for gæsterne.</p></div>
    <button class="btn big" id="party">Gå til festen 🎉</button>
  </section>`;

function showParty(back = showHome) {
  const st = S.state, first = !st.zoo.party, zname = esc(Z.zooName(st)), name = esc(st.name), art = Z.PARTY_ART, rb = art.ribbon;
  const levels = levelsOf(st), gold = levels.filter((l) => l >= 4).length, fs = E.factSummary(st), patches = patchList(st);
  const tasks = st.sessions.reduce((n, x) => n + (x.n || 0), 0), days = new Set(st.sessions.map((x) => x.date)).size;
  const before = `Kære ${name}! Hele vinteren har du hjulpet os, og nu har alle ${AREAS.length} områder fået deres stjerne. Klip snoren over – så åbner vi ${zname} for gæsterne!`;
  const after = `${zname} er åben! 🎉 Tusind tak, ${name} – uden dig var vi aldrig blevet klar.`;
  const when = (p) => `Åbningsfesten · ${partyDate(p.date)}`;
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage">←</button><span class="muted">${back === showHome ? "Zoo'en" : 'Tilbage'}</span></div>
    <section class="party-stage${first ? '' : ' cut'}">
      <div class="party-scene" style="aspect-ratio:${art.w} / ${art.h}">
        <img src="${art.src}" alt="Åbningsfest ved zoo'ens port: Bodil med en stor saks, Kaj, Nora, Liv, Yasmin og dyreungerne" draggable="false">
        ${first ? `<button class="ribbon" id="ribbon" style="left:${rb.x1}%;width:${rb.x2 - rb.x1}%;top:${rb.y}%" aria-label="Klip snoren over">
          <span class="rb-half rb-l"></span><span class="rb-half rb-r"></span>${RIBBON_BOW}<span class="rb-snip" aria-hidden="true">✂️</span></button>` : ''}
      </div>
    </section>
    <div class="party-text">
      <span class="kicker">${first ? 'Den store åbningsdag' : when(st.zoo.party)}</span>
      <h1>Åbningsfest i ${zname}!</h1>
      <div class="party-say">${say('bodil', first ? before : after, 'lg')}</div>
      ${first ? '<div><button class="btn big" id="cut">✂️ Klip snoren</button></div>' : ''}
    </div>
    <div class="party-after"${first ? ' hidden' : ''}>
      <section class="card party-sum"><h2>Det har du klaret</h2>
        <ul class="party-places">${AREAS.map((a) => `<li><span class="pp-art">${placeIc(a)}<b aria-hidden="true">⭐</b></span><span class="pp-nm">${a.place.replace(/(\S{4,})(undersøgelsen|klinikken)/, '$1&shy;$2')}</span></li>`).join('')}</ul>
        <div class="party-stats">
          <div><b>${fmt(Z.guestsPerDay(st))}</b><span>gæster om dagen</span></div>
          <div><b>${fs.gold} af ${fs.total}</b><span>voksne unger i Babyhuset</span></div>
          <div><b>${patches.filter((x) => x.p).length} af ${patches.length}</b><span>mærker på din ranger-skjorte</span></div>
          <div><b>${fmt(tasks)}</b><span>opgaver på ${days} ${days === 1 ? 'dag' : 'dage'}</span></div>
        </div>
      </section>
      <section class="card party-next">${say('kaj', `Næste mål: guld-områder! Bliv mester 🌟 i alle aktiviteterne i et område – så bliver det guld. ${gold} af ${AREAS.length} er guld nu. Og hvem har gemt kagen? 🦜`)}</section>
      <div class="row party-go"><button class="btn big" id="home">Se din zoo</button></div>
    </div>`, (e) => {
    if (e.key === 'Escape') back();
    else if (e.key === 'Enter' && !st.zoo.party) cut();
  });
  function cut() {
    if (st.zoo.party) return;
    st.zoo.party = { date: today(), guests: Z.guestsPerDay(st) };
    save(true);
    $('.party-stage').classList.add('cut');
    $('#cut')?.remove();
    sfx('party');
    confetti({ count: 220, duration: 3400 });
    setTimeout(() => {
      $('.party-say').innerHTML = say('bodil', after, 'lg');
      $('.party-text .kicker').textContent = when(st.zoo.party);
      const more = $('.party-after');
      more.hidden = false;
      more.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 900);
  }
  on('#back', 'click', back);
  on('#home', 'click', showHome);
  on('#ribbon', 'click', cut);
  on('#cut', 'click', cut);
  if (!first) setTimeout(() => confetti({ count: 120 }), 300);
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
    <div class="card book-top" style="margin-bottom:16px">${say('nora', `${fs.introduced} af ${fs.total} unger er født. ${fs.due ? `${fs.due} vil have flaske i dag 🍼` : 'Alle er mætte lige nu.'} ${st.records.sprint ? `Din rekord: ${st.records.sprint} ⚡` : ''}`)}
      <div class="book-env" aria-hidden="true">${envPic('elefanter')}</div></div>
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
      <div class="spread"><h3 style="margin:0">${placeIc(a)} ${a.name} <span class="muted small">· ${a.place}</span></h3><span class="muted small">${p.done}/${p.total} sikre</span></div>
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
      <button class="btn ghost" id="about-p" aria-label="Om appen">📚<span class="about-lbl"> Om appen</span></button></div>

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
    ${reportTeaser(st)}
    ${shirtParent(st)}

    <div class="section-title"><h2>Seneste 14 dage</h2></div>
    <div class="card table-wrap">
      ${recent.length ? `<table><thead><tr><th>Dato</th><th>Hvad</th><th>Opgaver</th><th>Rigtige</th><th>Tid</th></tr></thead><tbody>
        ${recent.map((s) => `<tr><td>${fmtDate(s.t)}</td><td>${s.mode === 'practice' ? 'Øvede: ' : ''}${areaOf(s.area)?.place || (s.mode === 'practice' ? 'Øvebanen' : '')}${s.main ? ` · ${ALL_SKILLS[s.main]?.name || ''}` : ''}</td>
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
      <p class="small muted" style="margin:0">Som app: på iPad Safari → Del → "Føj til hjemmeskærm", på Mac Safari → Arkiv → "Føj til Dock". Appen har sit eget lager, så gem en backup i browseren først og indlæs den i appen bagefter. Appen opdaterer sig selv, når den åbnes.</p>
      <div class="spread"><span class="small muted" id="app-version">Version fra ${appVersion()}</span><button class="btn ghost" id="check-update">Søg efter opdatering</button></div>
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
  on('#rp-open', 'click', () => showPracticeReport());
  on('#bk-save', 'click', exportBackup);
  on('#bk-load', 'click', pickBackup);
  on('#check-update', 'click', async () => {
    reloadNow = true; // her har hun selv bedt om det
    const reg = await checkForUpdate(true);
    if (reg?.installing || reg?.waiting) toast('Henter den nye version – appen genstarter om lidt');
    else { reloadNow = false; toast('Du har den nyeste version'); }
  });
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

// ================= Forældredelen: Øvebanen i tal =================
// Hvor godt det går i hver disciplin og øvelse: rigtige i første forsøg og typisk tid pr. opgave (median). Tæller alle
// svar – fra både Øvebanen og zoo'ens missioner – og peger på det, der skal øves mere (E.practiceVerdict).

const REPORT_PERIODS = [['14', '14 dage'], ['30', '30 dage'], ['alt', 'Alt']];
let reportPeriod = '30';
const fluent = (id) => !!ALL_SKILLS[id]?.table || id === 'divtabel'; // gangestykker: tiden siger, om de sidder
const fmtSec = (ms) => (ms == null ? '–' : ms < 59500 ? `${Math.max(1, Math.round(ms / 1000))} sek.` : `${Math.floor(ms / 60000)} min ${Math.round((ms % 60000) / 1000)} sek.`);
const VERDICTS = {
  oev: { icon: '!', label: 'Øv mere' },
  naesten: { icon: '≈', label: 'Næsten' },
  langsom: { icon: '⏱', label: 'Tager lang tid' },
  godt: { icon: '✓', label: 'Sidder godt' },
  faa: { icon: '·', label: 'For få svar' },
};
const verdictChip = (v) => `<span class="rp-v ${v}"><b aria-hidden="true">${VERDICTS[v].icon}</b>${VERDICTS[v].label}</span>`;
// De seneste svar som prikker (fyldt = rigtigt, ring = forkert), ældste først
const answerDots = (last) => (last.length ? `<span class="rp-dots" role="img" aria-label="De seneste ${last.length} svar: ${last.filter(Boolean).length} rigtige">${last.map((c) => `<i class="${c ? 'ok' : 'no'}"></i>`).join('')}</span>` : '');

// Tallene for perioden: hver disciplin med dens øvelser (og zoo-aktiviteten bag de udskilte øvelser, fx "Plus og
// minus" fra zoo'en bag "Plus" og "Minus"), samlet for disciplinen og for det hele
function practiceReport(st, period) {
  const since = period === 'alt' ? 0 : Date.now() - Number(period) * 86400000;
  const discs = DISCIPLINES.map((d) => {
    const ids = [...d.skills.map((sk) => sk.id), ...new Set(d.skills.map((sk) => sk.base).filter(Boolean))];
    const rows = ids.map((id) => ({ id, s: ALL_SKILLS[id], base: !d.skills.some((sk) => sk.id === id), stats: E.skillStats(st, id, since) }));
    return { d, rows, stats: E.answerStats(ids.map((id) => st.skills[id]?.hist || []), since) };
  });
  // Hendes typiske tid pr. opgave (uden gangestykkerne, som går hurtigt) – det, en langsom øvelse måles op imod
  const seen = new Set(), pool = [];
  for (const { rows } of discs) for (const r of rows) if (!seen.has(r.id) && !fluent(r.id)) { seen.add(r.id); pool.push(...r.stats.times); }
  const typical = E.median(pool);
  for (const x of discs) {
    for (const r of x.rows) {
      r.slow = fluent(r.id) ? E.FLUENT_MS : typical != null ? Math.max(30000, 2 * typical) : null;
      r.verdict = E.practiceVerdict(r.stats, r.slow);
    }
    x.verdict = E.practiceVerdict(x.stats);
  }
  const all = [...new Map(discs.flatMap((x) => x.rows).map((r) => [r.id, r])).values()];
  const total = E.answerStats(all.map((r) => st.skills[r.id]?.hist || []), since);
  const rank = { oev: 0, naesten: 1, langsom: 2 };
  const flagged = all.filter((r) => r.verdict in rank)
    .sort((a, b) => rank[a.verdict] - rank[b.verdict] || (a.verdict === 'langsom' ? b.stats.med - a.stats.med : a.stats.pct - b.stats.pct));
  const strong = all.filter((r) => r.verdict === 'godt').sort((a, b) => b.stats.n - a.stats.n);
  return { discs, total, typical, flagged, strong, discOf: (id) => discs.find((x) => x.rows.some((r) => r.id === id && !r.base))?.d || discs.find((x) => x.rows.some((r) => r.id === id))?.d };
}

// Ejefald: "Ellies", men "Lars'"
const genitive = (name) => (/[sxz]$/i.test(name) ? `${name}'` : `${name}s`);
const rowName = (r) => (r.base ? `${r.s.name} <span class="muted small">· blandet, fra zoo'en</span>` : r.s.name);
function flagText(r, rep, name) {
  const { pct, correct, n, med } = r.stats;
  if (r.verdict === 'oev') return `${pct} % rigtige i første forsøg (${correct} af ${n}). Øv den, og kig på eksemplet sammen.`;
  if (r.verdict === 'naesten') return `${pct} % rigtige (${correct} af ${n}). Lidt mere øvelse, så sidder den.`;
  return fluent(r.id)
    ? `Rigtigt, men ${fmtSec(med)} pr. gangestykke – ${esc(name)} tæller sig frem. Øv tabellen, så den sidder.`
    : `Rigtigt, men ${fmtSec(med)} pr. opgave – ${esc(genitive(name))} typiske opgave tager ${fmtSec(rep.typical)}`;
}

// Resuméet på forældresiden
function reportTeaser(st) {
  const rep = practiceReport(st, '30');
  return `<div class="card stack rp-teaser">
    ${rep.total.n ? `<div>📊 Seneste 30 dage: <b>${rep.total.n}</b> opgaver · <b>${rep.total.pct} %</b> rigtige i første forsøg · typisk <b>${fmtSec(rep.total.med)}</b> pr. opgave</div>
      <div>${rep.flagged.length ? `🎯 Kan øves mere: ${rep.flagged.slice(0, 3).map((r) => r.s.name).join(', ')}` : '👍 Intet skal øves ekstra lige nu'}</div>`
      : '<div class="muted">Ingen svar de seneste 30 dage.</div>'}
    <div><button class="btn" id="rp-open">Se Øvebanen i tal →</button></div>
  </div>`;
}

function showPracticeReport(period = reportPeriod) {
  reportPeriod = period;
  const st = S.state, rep = practiceReport(st, period), name = st.name;
  const acc = rep.flagged.filter((r) => r.verdict !== 'langsom'), slow = rep.flagged.filter((r) => r.verdict === 'langsom');
  const tile = (label, value, note = '') => `<div class="rp-tile"><span class="rp-tl">${label}</span><span class="rp-tv">${value}</span>${note ? `<span class="rp-tn">${note}</span>` : ''}</div>`;
  const flagItem = (r) => {
    const d = rep.discOf(r.id);
    return `<li class="rp-flag"><span class="rp-ic" aria-hidden="true">${placeIc(d)}</span><div><div class="rp-fname">${r.s.name} <span class="muted small">· ${d.name}</span></div>
      <div class="small">${flagText(r, rep, name)}</div></div>${verdictChip(r.verdict)}</li>`;
  };
  const row = (r) => `<div class="rp-row">
      <div class="rp-r1"><span class="rp-name">${rowName(r)}</span>${verdictChip(r.verdict)}</div>
      <div class="rp-r2">${answerDots(r.stats.last)}<span><b>${r.stats.pct} %</b> rigtige <span class="muted">(${r.stats.correct} af ${r.stats.n})</span></span><span><b>${fmtSec(r.stats.med)}</b> pr. opgave</span></div>
    </div>`;
  const card = ({ d, rows, stats, verdict }) => {
    const done = rows.filter((r) => r.stats.n), idle = rows.filter((r) => !r.stats.n && !r.base);
    const open = verdict === 'oev' || verdict === 'naesten' || done.some((r) => r.verdict in { oev: 1, naesten: 1, langsom: 1 });
    return `<section class="card rp-disc${stats.n ? '' : ' idle'}" style="--ac:${d.color}">
      <div class="rp-head"><span class="rp-ic" aria-hidden="true">${placeIc(d)}</span>
        <div class="rp-title"><h3>${d.name}</h3><span class="muted small">${d.chapter ? `Kapitel ${d.chapter} i matematikbogen` : 'Fælles Mål'}${stats.n ? ` · ${stats.n} svar` : ''}</span></div>
        ${stats.n ? verdictChip(verdict) : ''}</div>
      ${stats.n ? `<div class="rp-sum"><span class="rp-meter ${verdict}" aria-hidden="true"><i style="width:${stats.pct}%"></i></span>
        <span><b>${stats.pct} %</b> rigtige</span><span><b>${fmtSec(stats.med)}</b> pr. opgave</span></div>` : '<p class="muted small rp-none">Ikke øvet i perioden.</p>'}
      ${done.length ? `<details${open ? ' open' : ''}><summary>${done.length === 1 ? '1 øvelse' : `${done.length} øvelser`}</summary>
        <div class="rp-rows">${done.map(row).join('')}</div></details>` : ''}
      ${idle.length && stats.n ? `<p class="muted small rp-none">Ikke øvet i perioden: ${idle.map((r) => r.s.name).join(', ')}</p>` : ''}
    </section>`;
  };
  view(`
    <div class="topbar"><button class="icon-btn" id="back" aria-label="Tilbage til forældreoverblikket">←</button>
      <div style="flex:1"><h1 style="margin:0">Øvebanen i tal</h1><span class="muted">${esc(name)} · rigtige og tid pr. opgave</span></div></div>
    <div class="rp-filter"><span class="muted small">Periode</span>
      <div class="seg" id="rp-period">${REPORT_PERIODS.map(([v, l]) => `<button data-v="${v}" class="${v === period ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    ${rep.total.n ? `
    <div class="rp-tiles">
      ${tile('Opgaver', rep.total.n, period === 'alt' ? 'alle gemte svar' : `de seneste ${period} dage`)}
      ${tile('Rigtige i første forsøg', `${rep.total.pct} %`, `${rep.total.correct} af ${rep.total.n}`)}
      ${tile('Typisk tid pr. opgave', fmtSec(rep.total.med), 'median – pauser over 5 min tæller ikke')}
    </div>
    <div class="grid2">
      <div class="card stack"><h3>Det kan der øves mere i</h3>
        ${acc.length ? `<ul class="rp-flags">${acc.slice(0, 5).map(flagItem).join('')}</ul>${acc.length > 5 ? `<p class="small muted" style="margin:0">+ ${acc.length - 5} til – se disciplinerne nedenfor.</p>` : ''}`
          : '<p class="muted" style="margin:0">Ingen øvelser under 85 % rigtige 👍</p>'}
        ${slow.length ? `<h4 class="rp-sub">Rigtigt – men tager lang tid</h4><ul class="rp-flags">${slow.slice(0, 4).map(flagItem).join('')}</ul>` : ''}</div>
      <div class="card stack"><h3>Det går godt med</h3>
        ${rep.strong.length ? `<ul class="rp-flags">${rep.strong.slice(0, 4).map((r) => `<li class="rp-flag"><span class="rp-ic" aria-hidden="true">${placeIc(rep.discOf(r.id))}</span><div><div class="rp-fname">${r.s.name}</div>
          <div class="small">${r.stats.pct} % rigtige · ${fmtSec(r.stats.med)} pr. opgave</div></div>${verdictChip('godt')}</li>`).join('')}</ul>
          <p class="small muted" style="margin:0">Ros måden, ${esc(name)} regner på – ikke at ${esc(name)} er klog.</p>` : `<p class="muted" style="margin:0">Når en øvelse har mindst ${E.REPORT_MIN} svar og mindst 85 % rigtige, står den her.</p>`}</div>
    </div>
    ${PRACTICE_GROUPS.map((g) => `<div class="section-title"><h2>${g.name}</h2></div>
      <div class="rp-discs">${rep.discs.filter((x) => x.d.group === g.id).sort((a, b) => (b.stats.n > 0) - (a.stats.n > 0)).map(card).join('')}</div>`).join('')}`
    : `<div class="card"><p class="muted" style="margin:0">Ingen svar i perioden endnu. Tallene kommer, når ${esc(name)} har øvet.</p></div>`}
    <div class="card small muted rp-how">
      <b>Sådan måles det.</b> <b>Rigtige</b> = rigtige svar i første forsøg. <b>Tid</b> = typisk tid pr. opgave (medianen), fra opgaven vises, til ${esc(name)} svarer; pauser over 5 min tæller ikke med.
      Alle svar tæller – både fra Øvebanen og fra zoo'ens missioner (appen gemmer de seneste 40 svar pr. øvelse).
      Vurderingen kræver mindst ${E.REPORT_MIN} svar: under 70 % rigtige = <b>øv mere</b>, under 85 % = <b>næsten</b>.
      <b>Tager lang tid</b>: et gangestykke tager over ${fmtSec(E.FLUENT_MS)}, eller en anden øvelse tager over dobbelt så lang tid som ${esc(genitive(name))} typiske opgave (og over et halvt minut).
    </div>`, (e) => { if (e.key === 'Escape') showParent(); });
  on('#back', 'click', showParent);
  on('#rp-period button', 'click', (e) => showPracticeReport(e.currentTarget.dataset.v));
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

let reloadWhenIdle = false, reloadNow = false;
const swOptIn = (() => { try { return localStorage.getItem('mz_sw') === '1'; } catch { return false; } })();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || swOptIn)) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(() => { /* appen virker også uden */ });
  // En ny version er hentet: tag den i brug med det samme, hvis forsiden vises (der går intet tabt) –
  // ellers først når hun selv går tilbage til forsiden. Så bliver hun aldrig kastet ud af et område,
  // en forklaring eller en træning, fordi en opdatering blev færdig (showHome genindlæser).
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    const onHome = !S.run && document.querySelector('.home-top') && !document.querySelector('.bsheet.open, .modal');
    if (reloadNow || onHome) location.reload();
    else reloadWhenIdle = true;
  });
  navigator.storage?.persist?.().catch(() => { /* ikke understøttet */ });
}

// Søg efter en ny version, når appen kommer frem igen – fx Mac-appen i Dock'en, der kan stå åben i dagevis
// (ellers tjekker browseren kun, når siden åbnes). Højst hver halve time; force = knappen i forældredelen.
let lastUpdateCheck = Date.now();
async function checkForUpdate(force = false) {
  if (!force && Date.now() - lastUpdateCheck < 30 * 60 * 1000) return null;
  lastUpdateCheck = Date.now();
  const reg = await navigator.serviceWorker?.getRegistration?.().catch(() => null);
  if (!reg) return null;
  await reg.update().catch(() => { /* offline: prøv igen senere */ });
  return reg;
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForUpdate(); });
setInterval(() => { if (document.visibilityState === 'visible') checkForUpdate(); }, 60 * 60 * 1000);

// Versionen er tidsstemplet af tools/deploy.sh (?v=ÅÅÅÅMMDDTTMMSS på app.js)
function appVersion() {
  const v = new URL(import.meta.url).searchParams.get('v') || '';
  if (!/^\d{14}$/.test(v)) return 'udviklingsudgave';
  const d = new Date(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), +v.slice(8, 10), +v.slice(10, 12));
  return d.toLocaleString('da-DK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
window.__mo = { S, E, Z, ALL_SKILLS, babyReact, scene: missionScene, backup: { exportBackup, importBackup }, show: { home: showHome, parent: showParent, report: showPracticeReport, rules: showRules, shirt: showShirt, mixed: startMixed, party: showParty, book: showBook, profiles: showProfiles, tour: showIntroTour, about: showAbout, oeve: showPracticeHub, disc: showDiscipline, practice: startPractice, intro: (id) => showIntro(id, showHome, { btn: "Til zoo'en", back: "Tilbage til zoo'en" }) } };
