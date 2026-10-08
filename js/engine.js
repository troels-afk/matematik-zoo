// Læringsmotoren: tilpasset sværhedsgrad, mestring, spaced repetition og sammensætning af sessioner.
//
// Principper (se research.md):
//  - Sværhedsgraden tilpasses, så barnet rammer ca. 80–90 % rigtige.
//  - En færdighed er "sikker", når 8 af de seneste 10 svar på niveau 3 er rigtige.
//  - "Mestret" kræver, at den er sikker på mindst to forskellige dage (spredning).
//  - Næste færdighed i et område låses op, når den forrige er sikker.
//  - Gangetabellen kører Leitner-kasser pr. fakta; nye fakta blandes ind blandt kendte.

import { AREAS, SKILLS, ALL_SKILLS, FACTS, factProblem } from './curriculum.js?v=20261008175700';
import { today, addDays, daysBetween, weekStart, shuffle, parseNum } from './util.js?v=20261008175700';

export const STATUS = { NY: 'ny', OEVER: 'øver', SIKKER: 'sikker', MESTRET: 'mestret' };
const HIST_MAX = 40;
const FACT_INTERVALS = [0, 1, 2, 4, 7, 14]; // dage pr. Leitner-kasse
const SLOW_MS = 8000; // rigtigt men langsomt tabel-svar rykker ikke op
const KNOWN_MS = 4000; // nyt fakta besvaret rigtigt så hurtigt = kendes allerede

export const SESSION_SIZES = {
  kort: { warm: 6, main: 7, review: 3 },
  normal: { warm: 8, main: 10, review: 4 },
};

export function newState(name) {
  return {
    version: 1,
    name,
    created: new Date().toISOString(),
    skills: {},
    facts: {},
    sessions: [],
    records: { sprint: 0 },
    settings: { length: 'normal', sprint: true, sound: true },
    zoo: { name: '', bestGuests: 0 },
    patches: {}, // mærkerne til ranger-skjorten, pr. disciplin (se PATCH nedenfor)
  };
}

// ---------- Færdigheder ----------

export function skillState(state, id) {
  if (!state.skills[id]) state.skills[id] = { level: 1, hist: [], sikkerDays: [], introSeen: false, last: null };
  return state.skills[id];
}

export function skillStatus(state, id) {
  const s = state.skills[id];
  if (!s || s.hist.length === 0) return STATUS.NY;
  if (isSikker(s)) {
    const days = new Set(s.sikkerDays);
    days.add(today());
    return days.size >= 2 ? STATUS.MESTRET : STATUS.SIKKER;
  }
  // tidligere mestret, men seneste svar er gået dårligt → tilbage til øver
  return STATUS.OEVER;
}

// Sikker = mindst 8 af de seneste 10 svar på fuldt niveau er rigtige (~80 % mestring)
function isSikker(s) {
  const top = s.hist.filter((h) => h.l === 3).slice(-10);
  return top.length >= 10 && top.filter((h) => h.c).length >= 8;
}

export function recordSkill(state, id, correct, level, ms) {
  const s = skillState(state, id);
  s.hist.push({ c: correct, l: level, t: Date.now(), ms });
  if (s.hist.length > HIST_MAX) s.hist.splice(0, s.hist.length - HIST_MAX);
  s.last = Date.now();

  // Hurtigspor: de første 5 svar rigtige → spring til niveau 3 (hun kan det måske allerede)
  if (s.hist.length === 5 && s.hist.every((h) => h.c) && s.level < 3) {
    s.level = 3;
    return;
  }
  const recent = s.hist.slice(-3);
  if (correct && recent.length === 3 && recent.every((h) => h.c && h.l === s.level) && s.level < 3) s.level++;
  const last2 = s.hist.slice(-2);
  if (!correct && last2.length === 2 && last2.every((h) => !h.c) && s.level > 1) s.level--;

  if (isSikker(s)) {
    const d = today();
    if (!s.sikkerDays.includes(d)) s.sikkerDays.push(d);
  }
}

export function isUnlocked(state, skillId) {
  if (!SKILLS[skillId]) return true; // Øvebanens egne øvelser er altid åbne
  const area = AREAS.find((a) => a.id === SKILLS[skillId].area);
  const idx = area.skills.findIndex((s) => s.id === skillId);
  if (idx === 0) return true;
  const prev = skillStatus(state, area.skills[idx - 1].id);
  return prev === STATUS.SIKKER || prev === STATUS.MESTRET || skillStatus(state, skillId) !== STATUS.NY;
}

// Den færdighed i området, der skal arbejdes med nu (første ulåste der ikke er sikker)
export function currentSkill(state, areaId) {
  const area = AREAS.find((a) => a.id === areaId);
  for (const s of area.skills) {
    const st = skillStatus(state, s.id);
    if (st === STATUS.NY || st === STATUS.OEVER) return isUnlocked(state, s.id) ? s.id : null;
  }
  return null; // hele området er sikkert
}

export function areaProgress(state, areaId) {
  const area = AREAS.find((a) => a.id === areaId);
  const sts = area.skills.map((s) => skillStatus(state, s.id));
  const done = sts.filter((x) => x === STATUS.SIKKER || x === STATUS.MESTRET).length;
  const mastered = sts.filter((x) => x === STATUS.MESTRET).length;
  const last = Math.max(0, ...area.skills.map((s) => state.skills[s.id]?.last || 0));
  return { total: sts.length, done, mastered, last, complete: done === sts.length };
}

// Forslag til dagens steder: de områder der er længst tid siden, med noget at lære.
// Returnerer op til n område-id'er; det første er anbefalingen.
export function suggestAreas(state, n = 3) {
  const cands = AREAS.map((a) => ({ a, cur: currentSkill(state, a.id), p: areaProgress(state, a.id) }))
    .filter((x) => x.cur);
  cands.sort((x, y) => x.p.last - y.p.last || AREAS.indexOf(x.a) - AREAS.indexOf(y.a));
  const picks = cands.slice(0, n).map((x) => x.a.id);
  if (picks.length < n) {
    // alt er sikkert i nogle områder → tilbyd repetition dér
    const rest = AREAS.filter((a) => !picks.includes(a.id))
      .sort((x, y) => areaProgress(state, x.id).last - areaProgress(state, y.id).last);
    for (const a of rest) { if (picks.length >= n) break; picks.push(a.id); }
  }
  return picks;
}

// ---------- Gangetabellen ----------

export function factBox(state, key) {
  return state.facts[key]?.box ?? -1; // -1 = ikke introduceret (æg der ikke er lagt)
}

export function recordFact(state, key, correct, ms) {
  const d = today();
  let f = state.facts[key];
  const isNew = !f;
  if (!f) f = state.facts[key] = { box: 0, due: d, hist: [] };
  f.hist.push({ c: correct, ms, t: Date.now() });
  if (f.hist.length > 20) f.hist.splice(0, f.hist.length - 20);
  // Hurtigspor: kan hun det allerede (rigtigt og hurtigt første gang), springes de første kasser over
  if (isNew && correct && ms < KNOWN_MS) f.box = 3;
  else if (correct && ms < SLOW_MS) f.box = Math.min(FACT_INTERVALS.length - 1, f.box + 1);
  else if (!correct) f.box = 0;
  f.due = addDays(d, FACT_INTERVALS[f.box] || 1);
  if (!correct) f.due = d;
}

export function factSummary(state) {
  const boxes = FACTS.map((f) => factBox(state, f.key));
  return {
    introduced: boxes.filter((b) => b >= 0).length,
    solid: boxes.filter((b) => b >= 3).length,
    gold: boxes.filter((b) => b >= 5).length,
    total: FACTS.length,
    due: FACTS.filter((f) => state.facts[f.key] && state.facts[f.key].due <= today()).length,
  };
}

function pickFacts(state, n) {
  const d = today();
  const known = FACTS.filter((f) => state.facts[f.key]);
  const due = known.filter((f) => state.facts[f.key].due <= d)
    .sort((a, b) => state.facts[a.key].box - state.facts[b.key].box);
  const fresh = FACTS.filter((f) => !state.facts[f.key]);
  // Nye fakta blandes ind blandt kendte (incremental rehearsal): 3 pr. session,
  // men kun 1 hvis der er mange der skal repeteres.
  const maxNew = Math.min(fresh.length, due.length >= n - 1 ? 1 : 3);
  const out = due.slice(0, n - maxNew);
  out.push(...fresh.slice(0, maxNew));
  if (out.length < n) {
    const extra = known.filter((f) => !out.includes(f))
      .sort((a, b) => state.facts[a.key].box - state.facts[b.key].box || state.facts[a.key].due.localeCompare(state.facts[b.key].due));
    out.push(...extra.slice(0, n - out.length));
  }
  if (out.length < n) out.push(...fresh.filter((f) => !out.includes(f)).slice(0, n - out.length));
  return shuffle(out.slice(0, n));
}

// ---------- Session ----------

// Den samme opgave (samme tal, samme tegning og samme svar) gives ikke to gange på samme dag til samme profil:
// et lille fingeraftryk af hver opgave gemmes for dagen, og generatoren prøver igen ved et gensyn. Øvelser med
// meget få mulige opgaver kan stadig gentage sig, når de er brugt op. (Babyhusets gangestykker og "Slå din rekord"
// gentager med vilje og går ikke herigennem.)
const TASK_TRIES = 30;
export function taskKey(p) {
  const text = `${p.prompt}|${p.visual || ''}|${JSON.stringify(p.answer)}`;
  let h = 0x811c9dc5; // FNV-1a
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}
export function seenToday(state) {
  const d = today();
  if (state.seenTasks?.date !== d) state.seenTasks = { date: d, keys: [] };
  return state.seenTasks;
}

function makeTask(kind, skillId, state, lvl) {
  const s = ALL_SKILLS[skillId];
  const level = lvl ?? skillState(state, skillId).level;
  const seen = seenToday(state);
  let p, key;
  for (let i = 0; i < TASK_TRIES; i++) {
    p = s.gen(level);
    key = taskKey(p);
    if (!seen.keys.includes(key)) break;
  }
  seen.keys.push(key);
  if (seen.keys.length > 800) seen.keys.splice(0, seen.keys.length - 800);
  return { kind, skill: skillId, level, p };
}

// Dagens træning: opvarmning (tabel) → dagens sted → blandet repetition
export function buildSession(state, areaId) {
  const size = SESSION_SIZES[state.settings.length] || SESSION_SIZES.normal;
  const warm = pickFacts(state, size.warm).map((f) => ({ kind: 'warm', fact: f.key, p: factProblem(f) }));

  const main = currentSkill(state, areaId) || reviewSkillIn(state, areaId);
  const review = pickReviewSkills(state, size.review, main);

  return {
    area: areaId,
    main,
    blocks: [
      { kind: 'warm', title: 'Babyhuset', sub: 'Gangetabellen – ungerne vil have flaske', count: warm.length, tasks: warm },
      { kind: 'main', title: AREAS.find((a) => a.id === areaId).place, sub: SKILLS[main].name, count: size.main, skill: main, area: areaId },
      { kind: 'review', title: 'Zoo-runden', sub: 'Blandede opgaver fra hele zoo\'en', count: review.length, skills: review },
    ],
  };
}

// Når alt i området er sikkert: tag den der er længst siden
function reviewSkillIn(state, areaId) {
  const area = AREAS.find((a) => a.id === areaId);
  return [...area.skills].sort((a, b) => (state.skills[a.id]?.last || 0) - (state.skills[b.id]?.last || 0))[0].id;
}

// Blandet repetition: sikre/mestrede færdigheder længst siden + andre områders aktuelle færdighed
function pickReviewSkills(state, n, exclude) {
  const all = Object.keys(SKILLS).filter((id) => id !== exclude);
  const solid = all.filter((id) => [STATUS.SIKKER, STATUS.MESTRET].includes(skillStatus(state, id)))
    .sort((a, b) => (state.skills[a]?.last || 0) - (state.skills[b]?.last || 0));
  const current = AREAS.map((a) => currentSkill(state, a.id))
    .filter((id) => id && id !== exclude && (state.skills[id]?.hist.length || 0) > 0);
  const picks = [];
  // Skiftevis: gammelt stof og igangværende stof fra andre steder
  while (picks.length < n && (solid.length || current.length)) {
    const src = picks.length % 2 === 0 ? (solid.length ? solid : current) : (current.length ? current : solid);
    const id = src.shift();
    if (!picks.includes(id)) picks.push(id);
  }
  // Helt ny bruger: brug første færdighed fra andre områder, som en smagsprøve
  if (picks.length < n) {
    const firsts = shuffle(AREAS.map((a) => a.skills[0].id).filter((id) => id !== exclude && !picks.includes(id)));
    picks.push(...firsts.slice(0, n - picks.length));
  }
  return picks;
}

// Næste opgave i en blok (generer løbende, så sværhedsgraden kan følge med)
export function nextTask(state, block, index) {
  if (block.kind === 'warm') return block.tasks[index];
  if (block.kind === 'main') {
    // Bliver færdigheden sikker midt i blokken, går vi videre til den næste i området
    const st = skillStatus(state, block.skill);
    const cur = currentSkill(state, block.area);
    if (cur && cur !== block.skill && (st === STATUS.SIKKER || st === STATUS.MESTRET)) {
      block.skill = cur;
      block.sub = SKILLS[cur].name;
    }
    return makeTask('main', block.skill, state);
  }
  if (block.kind === 'practice') return makeTask('practice', block.skill, state);
  if (block.kind === 'mixed') return makeTask('mixed', block.skills[index], state, 3); // altid sværeste niveau
  return makeTask('review', block.skills[index % block.skills.length], state);
}

// ---------- Mærker til ranger-skjorten (Øvebanen) ----------
// Hver disciplin giver ét mærke i tre trin, og et mærke kan aldrig tages fra hende igen:
//  1 bronze "Kan det":    alle disciplinens øvelser er sikre ⭐ (mestringslæring)
//  2 sølv "Kan blande":   en blandet runde – 10 opgaver på kryds og tværs, niveau 3, mindst 9 rigtige (blandet træning)
//  3 guld "Husker det":   den blandede runde klaret igen mindst en uge efter sølv (spredt gentagelse)
export const PATCH = { N: 10, PASS: 9, GOLD_DAYS: 7, TIERS: ['', 'bronze', 'silver', 'gold'] };

export const patchOf = (state, discId) => state.patches?.[discId] || null;
const solid = (state, id) => [STATUS.SIKKER, STATUS.MESTRET].includes(skillStatus(state, id));
export const discProgress = (state, disc) => ({ done: disc.skills.filter((sk) => solid(state, sk.id)).length, total: disc.skills.length });

// Bronze kommer af sig selv, når alle øvelserne er sikre – også når de er øvet i zoo'en. Giver de nye mærkers id'er.
export function awardBronze(state, discs) {
  const fresh = [];
  for (const d of discs) {
    if (patchOf(state, d.id) || !d.skills.length || !d.skills.every((sk) => solid(state, sk.id))) continue;
    (state.patches ||= {})[d.id] = { tier: 1, at: [today()], pos: null, seen: false };
    fresh.push(d.id);
  }
  return fresh;
}

// Den blandede runde: åben efter bronze (→ sølv) og igen en uge efter sølv (→ guld). Med guld kan den øves for sjov.
export function mixedState(state, discId) {
  const p = patchOf(state, discId);
  if (!p) return { open: false, next: 1 };
  if (p.tier >= 3) return { open: true, next: null };
  if (p.tier === 1) return { open: true, next: 2 };
  const wait = PATCH.GOLD_DAYS - daysBetween(p.at[1], today());
  return wait > 0 ? { open: false, next: 3, wait } : { open: true, next: 3 };
}

// Efter en blandet runde: rykker mærket et trin op, hvis runden var god nok. Giver det nye trin (eller null).
export function recordMixed(state, discId, correct) {
  const p = patchOf(state, discId), m = mixedState(state, discId);
  if (!p || !m.open || !m.next || correct < PATCH.PASS) return null;
  p.tier = m.next;
  p.at[m.next - 1] = today();
  p.seen = false;
  return p.tier;
}

// 10 opgaver fordelt jævnt på disciplinens øvelser: omgange, hvor hver øvelse er med én gang i tilfældig rækkefølge.
// Starter en omgang med den øvelse, den forrige sluttede med, byttes de to første – så kommer samme øvelse aldrig to gange i træk
export function mixedBlock(disc, n = PATCH.N) {
  const ids = disc.skills.map((sk) => sk.id), pool = [];
  while (pool.length < n) {
    const round = shuffle(ids);
    if (round.length > 1 && round[0] === pool[pool.length - 1]) [round[0], round[1]] = [round[1], round[0]];
    pool.push(...round);
  }
  pool.length = n;
  return { kind: 'mixed', title: disc.name, sub: ids.length > 1 ? 'Blandet runde' : 'Runde på niveau 3', count: n, skills: pool, disc: disc.id };
}

// ---------- Svar ----------

export function checkAnswer(p, given) {
  switch (p.input) {
    case 'number': {
      const v = parseNum(given);
      return Number.isFinite(v) && Math.abs(v - p.answer) < 1e-9;
    }
    case 'fraction': {
      const [n, d] = given.map(parseNum);
      if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) return false;
      return n * p.answer[1] === d * p.answer[0];
    }
    case 'parts': {
      const v = given.map(parseNum);
      return v.length === p.answer.length && v.every((x, i) => Number.isFinite(x) && Math.abs(x - p.answer[i]) < 1e-9);
    }
    case 'qr': {
      const [q, r] = given.map(parseNum);
      return q === p.answer[0] && r === p.answer[1];
    }
    case 'choice':
      return given === p.answer;
  }
  return false;
}

// ---------- Uger og sessioner ----------

export const WEEK_GOAL = 4;

export function weekSessions(state) {
  const ws = weekStart(today());
  const days = new Set(state.sessions.filter((s) => s.date >= ws).map((s) => s.date));
  return days.size;
}

export function logSession(state, entry) {
  state.sessions.push({ ...entry, date: today(), t: Date.now() });
  if (state.sessions.length > 400) state.sessions.splice(0, state.sessions.length - 400);
}

// Fulde uger i træk (≥ WEEK_GOAL dage) – indbyggede fridage, så en sygedag ikke ødelægger noget
// Hele uger (mandag–søndag) med mindst WEEK_GOAL øvedage – mandagens dato, ældste først
export function fullWeeks(state) {
  const byWeek = {};
  for (const s of state.sessions) (byWeek[weekStart(s.date)] ||= new Set()).add(s.date);
  return Object.keys(byWeek).filter((w) => byWeek[w].size >= WEEK_GOAL).sort();
}
export function fullWeeksStreak(state) {
  const byWeek = {};
  for (const s of state.sessions) {
    const w = weekStart(s.date);
    (byWeek[w] ||= new Set()).add(s.date);
  }
  let streak = 0;
  let w = weekStart(today());
  if (!(byWeek[w]?.size >= WEEK_GOAL)) w = addDays(w, -7); // indeværende uge er ikke slut endnu
  while (byWeek[w]?.size >= WEEK_GOAL) { streak++; w = addDays(w, -7); }
  return streak;
}

// ---------- Til forældresiden ----------

export function skillAccuracy(state, id, days = 14) {
  const s = state.skills[id];
  if (!s) return null;
  const since = Date.now() - days * 86400000;
  const h = s.hist.filter((x) => x.t >= since);
  if (!h.length) return null;
  return { n: h.length, pct: Math.round((100 * h.filter((x) => x.c).length) / h.length) };
}

export function troubleSpots(state) {
  const skills = Object.keys(SKILLS)
    .map((id) => ({ id, acc: skillAccuracy(state, id) }))
    .filter((x) => x.acc && x.acc.n >= 5 && x.acc.pct < 70)
    .sort((a, b) => a.acc.pct - b.acc.pct);
  const facts = FACTS.filter((f) => {
    const st = state.facts[f.key];
    if (!st) return false;
    const recent = st.hist.slice(-5);
    return st.box <= 1 && recent.filter((h) => !h.c).length >= 2;
  });
  return { skills, facts };
}

// ---------- Øvebanen i tal (forældredelen) ----------
// Alle tal bygger på første forsøg (det, motoren gemmer i hist): rigtige og tiden fra opgaven blev vist, til hun svarede.

const IDLE_MS = 5 * 60000; // svar efter mere end 5 min tæller ikke med i tiden – så har hun holdt pause
export const REPORT_MIN = 5; // så mange svar skal der til, før en øvelse får en vurdering
export const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
// Svar fra en eller flere historikker siden tidspunktet since: antal, rigtige, typisk tid (median), de seneste 10 svar
export function answerStats(hists, since = 0) {
  const h = hists.flat().filter((x) => x && x.t >= since).sort((a, b) => a.t - b.t);
  const times = h.map((x) => x.ms).filter((ms) => Number.isFinite(ms) && ms > 0 && ms <= IDLE_MS);
  const correct = h.filter((x) => x.c).length;
  return {
    n: h.length, correct, pct: h.length ? Math.round((100 * correct) / h.length) : null,
    med: median(times), times, last: h.slice(-10).map((x) => !!x.c), at: h.length ? h[h.length - 1].t : null,
  };
}
export const skillStats = (state, id, since = 0) => answerStats([state.skills[id]?.hist || []], since);

// Vurdering: rigtige først (under 70 % = øv mere, som "Driller lige nu"; under 85 % = næsten), dernæst tiden.
// slowMs = grænsen for "tager lang tid" for netop den øvelse (null = ingen tidsvurdering)
export function practiceVerdict(stats, slowMs = null) {
  if (!stats || stats.n < REPORT_MIN) return 'faa';
  if (stats.pct < 70) return 'oev';
  if (stats.pct < 85) return 'naesten';
  if (slowMs != null && stats.med != null && stats.med > slowMs) return 'langsom';
  return 'godt';
}
export const FLUENT_MS = SLOW_MS; // gangestykker: over 8 sek. = hun tæller sig frem (samme grænse som Babyhuset)

export function daysSinceLast(state) {
  const last = state.sessions[state.sessions.length - 1];
  return last ? daysBetween(last.date, today()) : null;
}
