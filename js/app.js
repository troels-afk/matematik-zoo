// Matematik-Zoo – skærme og interaktion.

import { AREAS, SKILLS, FACTS, factProblem } from './curriculum.js';
import * as E from './engine.js';
import * as Z from './zoo.js';
import { zooGate } from './scene.js';
import { sfx, setSound, confetti, countUp } from './fx.js';
import { listProfiles, loadState, saveState, deleteProfile, slug, storageMode, flush } from './store.js';
import { esc, fmt, frac, pick, today } from './util.js';

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
const areaOf = (id) => AREAS.find((a) => a.id === id);
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

const avatar = (who, size = '') => `<span class="avatar ${size} who-${who}" aria-hidden="true">${Z.CAST[who].emoji}</span>`;
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
  return `<span class="baby ${size} ${cls}" style="--st:${Math.max(0, box)}" title="${esc(title)}"><span>${b.emoji}</span>${due ? '<i class="zz">🍼</i>' : ''}</span>`;
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
    <section class="hero">${zooGate('Matematik-Zoo', { animals: ['🦒', '🐘', '🦁', '🐧', '🦓'] })}</section>
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
    showHome();
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
  showHome();
}

// ================= Forsiden: zoo'en =================

function showHome() {
  const st = S.state;
  const zname = Z.zooName(st);
  const levels = levelsOf(st);
  const residents = AREAS.flatMap((a, i) => Z.ZONES[a.id].animals.slice(0, Math.min(levels[i], 2)));
  const peek = residents.length ? residents : ['🦒'];
  const fs = E.factSummary(st);
  const guests = Z.guestsPerDay(st);
  const stars = levels.filter((l) => l >= 3).length;
  const open = levels.filter((l) => l >= 1).length;
  const msg = Z.homeMessage(st);
  const sugg = E.suggestAreas(st, 3);

  const taskCard = (id, i) => {
    const a = areaOf(id), z = Z.ZONES[id], t = Z.taskFor(id), cur = E.currentSkill(st, id);
    return `<button class="task-card ${i === 0 ? 'rec-card' : ''}" data-area="${id}" style="--ac:${a.color}">
      <div class="top"><span class="big">${a.icon}</span><span class="ani">${z.animals.join('')}</span>${i === 0 ? '<span class="rec">Forslag</span>' : ''}</div>
      <div class="body">
        <span class="place">${a.place}</span>
        <span class="title">${t.title}</span>
        <span class="foot">${avatar(t.who, 'sm')}<span class="who"><b>${Z.CAST[t.who].name}</b><br>${cur ? SKILLS[cur].name : 'Repetition'}</span><span class="go" aria-hidden="true">→</span></span>
      </div>
    </button>`;
  };
  const tile = (a, i) => {
    const lv = levels[i], L = Z.LEVELS[lv];
    const sts = a.skills.map((s) => E.skillStatus(st, s.id));
    return `<button class="area l${lv}" data-place="${a.id}" style="--ac:${a.color}">
      <div class="band"><span class="big">${a.icon}</span><span class="ani">${lv ? Z.ZONES[a.id].animals.slice(0, Math.min(lv, 3)).join('') : ''}</span></div>
      <div class="inner">
        <span class="nm">${a.place}</span><span class="sub">${a.name}</span>
        <span class="lvl">${L.icon} ${L.name}</span>
        <div class="pips">${sts.map((x) => `<span class="pip ${x}"></span>`).join('')}</div>
      </div>
    </button>`;
  };
  const introduced = FACTS.filter((f) => E.factBox(st, f.key) >= 0)
    .sort((a, b) => (st.facts[a.key].due <= today() ? 0 : 1) - (st.facts[b.key].due <= today() ? 0 : 1) || E.factBox(st, b.key) - E.factBox(st, a.key));
  const nursery = introduced.length
    ? introduced.slice(0, 12).map((f) => baby(f.key)).join('')
    : `<span class="muted">Babyhuset er tomt endnu. De første unger bliver født i morgenrunden.</span>`;

  view(`
    <section class="hero">
      ${zooGate(zname, { animals: peek, festive: stars === AREAS.length })}
      <div class="hero-bar">
        <span class="me-chip"><span class="avatar">${meAvatar(st.name)}</span>${esc(st.name)}</span>
        <button class="icon-btn" id="snd" aria-label="Lyd til/fra">${st.settings.sound ? '🔊' : '🔇'}</button>
      </div>
    </section>
    <div class="stats">
      <div class="stat"><span class="ic" style="background:var(--sun-soft)">🎟️</span><div><div class="v">${fmt(guests)}</div><div class="l">gæster om dagen</div></div></div>
      <div class="stat"><span class="ic" style="background:var(--lav-soft)">⭐</span><div><div class="v">${stars}/${AREAS.length}</div><div class="l">stjerne-områder</div></div></div>
      <div class="stat"><span class="ic" style="background:var(--coral-soft)">🍼</span><div><div class="v">${fs.introduced}/${fs.total}</div><div class="l">unger i Babyhuset</div></div></div>
      <div class="stat"><span class="ic" style="background:var(--primary-soft)">📅</span><div>${weekDots(st)}<div class="l" style="margin-top:4px">dage denne uge</div></div></div>
    </div>

    <section class="today">${say(msg.who, msg.text)}</section>

    <div class="section-title"><h2>Dagens opgaver</h2><span class="muted small">Vælg én</span></div>
    <div class="tasks">${sugg.map(taskCard).join('')}</div>

    <div class="section-title"><h2>🍼 Babyhuset</h2><button class="link" id="book">Dyrebogen →</button></div>
    <section class="card nursery">
      <div class="babies">${nursery}</div>
      ${sprintEligible(st) ? '<button class="btn ghost" id="sprint">⚡ Slå din rekord</button>' : ''}
    </section>

    <div class="section-title"><h2>Zoo-kortet</h2><span class="muted small">${open} af ${AREAS.length} områder er åbne</span></div>
    <div class="zoo-map">${AREAS.map(tile).join('')}</div>

    <div class="footer-links">
      <button class="link" id="switch">Skift profil</button>
      <button class="link" id="parent">Forælder</button>
    </div>`);

  on('.task-card', 'click', (e) => { sfx('tap'); startSession(e.currentTarget.dataset.area); });
  on('.area', 'click', (e) => { sfx('tap'); showPlace(e.currentTarget.dataset.place); });
  on('#book', 'click', showBook);
  on('#sprint', 'click', startSprint);
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
      <div class="center"><div style="font-size:1.8rem;letter-spacing:2px">${lv ? z.animals.slice(0, Math.min(lv, 3)).join('') : '🚧'}</div><span class="lvl" style="--ac:${a.color}">${L.icon} ${L.name}</span></div>
    </section>
    <div class="stack" style="margin-top:16px">${rows}</div>`, (e) => { if (e.key === 'Escape') showHome(); });
  on('#back', 'click', showHome);
  on('[data-practice]', 'click', (e) => startPractice(e.currentTarget.dataset.practice));
  on('[data-intro]', 'click', (e) => showIntro(e.currentTarget.dataset.intro, () => showPlace(areaId), 'Tilbage'));
}

// ================= Intro til en færdighed =================

function showIntro(skillId, next, btnText = 'Jeg er klar') {
  const s = SKILLS[skillId], a = areaOf(s.area);
  view(`
    <div class="card sheet intro-card stack">
      <div class="kicker">${a.icon} ${a.place} · Nyt emne</div>
      <h1>${s.name}</h1>
      <div class="body">${s.intro.text}</div>
      ${s.intro.visual ? `<div class="visual">${s.intro.visual()}</div>` : ''}
      <div class="center"><button class="btn big" id="go">${btnText}</button></div>
    </div>`, (e) => { if (e.key === 'Enter') go(); });
  const go = () => {
    E.skillState(S.state, skillId).introSeen = true;
    save();
    next();
  };
  on('#go', 'click', go);
}

// ================= Sessioner =================

function snapshot(st) {
  const status = {}, unlocked = {}, boxes = {};
  for (const id of Object.keys(SKILLS)) { status[id] = E.skillStatus(st, id); unlocked[id] = E.isUnlocked(st, id); }
  for (const f of FACTS) boxes[f.key] = E.factBox(st, f.key);
  return { status, unlocked, boxes, levels: levelsOf(st), guests: Z.guestsPerDay(st) };
}

const blockIcon = (b, areaId) => (b.kind === 'warm' ? '🍼' : b.kind === 'review' ? '🧭' : areaOf(areaId).icon);

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
  const s = SKILLS[skillId], a = areaOf(s.area);
  const sess = { area: a.id, main: skillId, blocks: [{ kind: 'practice', title: a.place, sub: s.name, count: 8, skill: skillId }] };
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
    : say(z.who, `${prev?.kind === 'warm' ? 'Ungerne er mætte! ' : ''}Nu skal vi i gang: ${block.sub.toLowerCase()}.`);
  view(`
    <div class="card sheet center stack" style="margin-top:8vh">
      ${prev?.kind === 'warm' ? '<div class="kicker">✓ Opvarmning klaret</div>' : ''}
      <div style="font-size:3.6rem">${blockIcon(block, run.sess.area)}</div>
      <h1>${block.title}</h1>
      <div style="text-align:left">${line}</div>
      <div><button class="btn big" id="go">Videre</button></div>
    </div>`, (e) => { if (e.key === 'Enter') showTask(); });
  on('#go', 'click', showTask);
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
  const pct = Math.round((100 * doneTasks(run)) / totalTasks(run));
  let banner = '';
  if (task.kind === 'warm') {
    const b = Z.BABIES[task.fact];
    banner = `<div class="baby-banner">${baby(task.fact)}
      <div><div class="t">${b.name} vil have flaske</div><div class="s">Opvarmning ${run.ti + 1}/${block.count} · gangetabellen – bagefter går vi til ${areaOf(run.sess.area).place}</div></div></div>`;
  }
  const help = (task.kind === 'main' || task.kind === 'practice') ? `<button class="link small" id="help">💡 Hjælp</button>` : '';

  view(`
    <div class="session-top">
      <button class="icon-btn" id="quit" aria-label="Stop">✕</button>
      <div class="progress"><i style="width:${pct}%"></i></div>
      <span class="block-label">${blockIcon(block, run.sess.area)} ${block.title}</span>
    </div>
    <div class="card">
      ${banner}
      <div class="task ${p.input !== 'choice' ? 'has-input' : ''}">
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
    const s = SKILLS[task.skill];
    $('#helpbox').innerHTML = `<div class="feedback retry" style="margin-top:14px"><div>${s.intro.text}</div>${s.intro.visual ? `<div class="explain-visual">${s.intro.visual()}</div>` : ''}</div>`;
    $('#help').remove();
  });
  mountInput(p, answer);
}

// ---------- Svar-input ----------

function mountInput(p, onSubmit) {
  const aa = $('#aa');
  if (p.input === 'choice') {
    const sym = p.choices.every((c) => c.length <= 1);
    aa.innerHTML = `<div class="choice-grid">${p.choices.map((c, i) => `<button class="choice ${sym ? 'sym' : ''}" data-i="${i}">${esc(c)}</button>`).join('')}</div>`;
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

  const nSlots = p.input === 'number' ? 1 : 2;
  const vals = Array(nSlots).fill('');
  let active = 0;
  const slot = (i) => `<div class="slot" data-i="${i}"></div>`;
  let inputs;
  if (p.input === 'number') inputs = `${slot(0)}${p.unit ? `<span class="unit">${esc(p.unit)}</span>` : ''}`;
  else if (p.input === 'fraction') inputs = `<div class="frac-input">${slot(0)}<div class="bar"></div>${slot(1)}</div>`;
  else inputs = `${slot(0)}<span class="qr-word">rest</span>${slot(1)}`;
  const third = p.input === 'number' ? '<button class="key fn" data-k=",">,</button>' : `<button class="key fn" data-k="next" aria-label="Skift felt">${p.input === 'fraction' ? '⇅' : '⇄'}</button>`;

  aa.innerHTML = `
    <div class="inputs">${inputs}</div>
    <div class="keypad">
      ${[7, 8, 9, 4, 5, 6, 1, 2, 3].map((d) => `<button class="key" data-k="${d}">${d}</button>`).join('')}
      ${third}<button class="key" data-k="0">0</button><button class="key fn" data-k="back" aria-label="Slet">⌫</button>
    </div>
    <button class="btn big check" id="check">Tjek</button>`;

  const paint = () => {
    $$('.slot').forEach((el) => {
      const i = Number(el.dataset.i);
      el.textContent = vals[i];
      el.classList.toggle('active', i === active);
      el.classList.toggle('empty', vals[i] === '');
    });
    $('#check').disabled = vals.some((v) => v === '');
  };
  const press = (k) => {
    if (S.run?.answered) return;
    if (k === 'back') vals[active] = vals[active].slice(0, -1);
    else if (k === 'next') active = (active + 1) % nSlots;
    else if (k === ',') { if (!vals[active].includes(',')) vals[active] = (vals[active] || '0') + ','; }
    else if (/^\d$/.test(k) && vals[active].length < 9) {
      vals[active] = vals[active] === '0' ? k : vals[active] + k;
    }
    paint();
  };
  const submit = () => {
    if (vals.some((v) => v === '') || S.run?.answered) return;
    onSubmit(nSlots === 1 ? vals[0] : [...vals]);
  };
  on('.key', 'click', (e) => press(e.currentTarget.dataset.k));
  on('.slot', 'click', (e) => { active = Number(e.currentTarget.dataset.i); paint(); });
  on('#check', 'click', submit);
  keyHandler = (e) => {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === ',' || e.key === '.') press(nSlots === 1 ? ',' : 'next');
    else if (e.key === 'Backspace') { e.preventDefault(); press('back'); }
    else if (['Tab', '/', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && nSlots > 1) { e.preventDefault(); press('next'); }
    else if (e.key === 'Enter') { e.preventDefault(); submit(); }
  };
  paint();
}

// ---------- Svar og feedback ----------

const PRAISE = ['Rigtigt!', 'Sådan!', 'Flot regnet!', 'Præcis!', 'Ja, det er rigtigt!', 'Godt tænkt!'];
const KAJ_OOPS = ['Det er sådan, man lærer! 🦜', 'Bare rolig – den kommer igen 🦜', 'Næste gang sidder den! 🦜', 'Selv papegøjer regner forkert nogle gange 🦜'];

function answerText(p) {
  if (p.input === 'fraction') return frac(p.answer[0], p.answer[1]);
  if (p.input === 'qr') return `${p.answer[0]} rest ${p.answer[1]}`;
  if (p.input === 'choice') return esc(p.answer);
  return `${fmt(p.answer)}${p.unit ? ' ' + esc(p.unit) : ''}`;
}

function answer(given, choiceIdx) {
  const run = S.run, block = run.sess.blocks[run.bi], task = run.task, p = task.p;
  run.answered = true;
  const ms = Date.now() - run.shownAt;
  const correct = E.checkAnswer(p, given);
  const st = S.state;
  let again = '', grew = '';

  if (task.kind === 'warm') {
    const before = E.factBox(st, task.fact);
    E.recordFact(st, task.fact, correct, ms);
    const after = E.factBox(st, task.fact);
    const b = Z.BABIES[task.fact];
    if (correct && after > before) grew = after >= 5 ? `${b.name} er nu helt voksen! 🌟` : `${b.name} voksede: ${Z.STAGES[after].toLowerCase()} 🍼`;
    else if (correct) grew = `${b.name} er mæt og glad 🍼`;
    if (!correct && !run.retried.has(task.fact)) {
      run.retried.add(task.fact);
      block.tasks.push({ kind: 'warm', fact: task.fact, p: factProblem(FACTS.find((f) => f.key === task.fact)) });
      block.count = block.tasks.length;
      again = `${b.name} kommer igen om lidt, så du kan prøve igen.`;
    }
  } else {
    E.recordSkill(st, task.skill, correct, task.level, ms);
    if (!correct) again = 'Du får en lignende opgave igen senere.';
  }
  run.results.push({ kind: task.kind, id: task.fact || task.skill, correct });
  save();
  sfx(correct ? (grew && grew.includes('voksede') ? 'grow' : 'correct') : 'wrong');

  if (p.input === 'choice') {
    $$('.choice').forEach((b, i) => {
      if (p.choices[i] === p.answer) b.classList.add('right');
      else if (i === choiceIdx) b.classList.add('wrong');
    });
  }

  const fb = correct
    ? `<div class="feedback good"><div class="fh"><span class="tick">✓</span>${pick(PRAISE)}</div>
        ${task.kind === 'warm' ? `<div style="font-weight:700">${grew}</div>` : `<div class="small">${p.explain}</div>`}</div>`
    : `<div class="feedback retry">
        <div class="fh">Ikke helt – svaret er ${answerText(p)}</div>
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
  save(true);

  const wins = [];
  let bigWin = false;
  AREAS.forEach((a, i) => {
    for (let lv = b.levels[i] + 1; lv <= after.levels[i]; lv++) {
      wins.push({ e: Z.LEVELS[lv].icon, t: LEVEL_WIN[lv](a, Z.ZONES[a.id]) });
      bigWin = true;
    }
  });
  for (const id of Object.keys(SKILLS)) {
    const s = SKILLS[id];
    if (after.status[id] === 'mestret' && b.status[id] !== 'mestret') wins.push({ e: '🌟', t: `Du har mestret ${s.name.toLowerCase()}` });
    else if (after.status[id] === 'sikker' && !['sikker', 'mestret'].includes(b.status[id])) wins.push({ e: '⭐', t: `Du er nu sikker i ${s.name.toLowerCase()}` });
    if (after.unlocked[id] && !b.unlocked[id]) wins.push({ e: '🔓', t: `Nyt i ${areaOf(s.area).place}: ${s.name}` });
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
        <button class="btn big" id="home">Til zoo'en</button>
        ${sprintEligible(st) ? '<button class="btn ghost" id="sprint">⚡ Slå din rekord</button>' : ''}
      </div>
    </div>`, (e) => { if (e.key === 'Enter') showHome(); });
  on('#home', 'click', showHome);
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
  for (let b = 2; b <= 10; b++) heat += `<div class="h">${b}</div>`;
  for (let a = 2; a <= 10; a++) {
    heat += `<div class="h">${a}</div>`;
    for (let b = 2; b <= 10; b++) {
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
      <div><h1 style="margin:0">Forældreoverblik</h1><span class="muted">${esc(st.name)} · ${esc(Z.zooName(st))}</span></div></div>

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

    <div class="section-title"><h2>Seneste 14 dage</h2></div>
    <div class="card table-wrap">
      ${recent.length ? `<table><thead><tr><th>Dato</th><th>Hvad</th><th>Opgaver</th><th>Rigtige</th><th>Tid</th></tr></thead><tbody>
        ${recent.map((s) => `<tr><td>${fmtDate(s.t)}</td><td>${s.mode === 'practice' ? 'Øvede: ' : ''}${areaOf(s.area)?.place || ''}${s.main ? ` · ${SKILLS[s.main]?.name || ''}` : ''}</td>
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
      if (st) { S.id = last; S.state = migrate(st); return showHome(); }
    } catch { /* fald tilbage til profilvalg */ }
  }
  showProfiles();
})();

// Til fejlfinding i konsollen
window.__mo = { S, E, Z, show: { home: showHome, book: showBook, profiles: showProfiles } };
