// Læringsmotoren: tilpasset sværhedsgrad, mestring, spaced repetition og sammensætning af sessioner.
//
// Principper (se research.md):
//  - Sværhedsgraden tilpasses, så barnet rammer ca. 80–90 % rigtige.
//  - En færdighed er "sikker", når 8 af de seneste 10 svar på niveau 3 er rigtige.
//  - "Mestret" kræver, at den er sikker på mindst to forskellige dage (spredning).
//  - Næste færdighed i et område låses op, når den forrige er sikker.
//  - Gangetabellen kører Leitner-kasser pr. fakta; nye fakta blandes ind blandt kendte.

import { AREAS, SKILLS, ALL_SKILLS, FACTS, factProblem } from './curriculum.js?v=20261005095712';
import { today, addDays, daysBetween, weekStart, shuffle, parseNum } from './util.js?v=20261005095712';

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

function makeTask(kind, skillId, state) {
  const s = ALL_SKILLS[skillId];
  const level = skillState(state, skillId).level;
  return { kind, skill: skillId, level, p: s.gen(level) };
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
      { kind: 'warm', title: 'Opvarmning i Babyhuset', sub: 'Gangetabellen – ungerne vil have flaske', count: warm.length, tasks: warm },
      { kind: 'main', title: AREAS.find((a) => a.id === areaId).place, sub: SKILLS[main].name, count: size.main, skill: main, area: areaId },
      { kind: 'review', title: "Runde i zoo'en", sub: 'Blandede opgaver fra hele zoo\'en', count: review.length, skills: review },
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
  return makeTask('review', block.skills[index % block.skills.length], state);
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

export function daysSinceLast(state) {
  const last = state.sessions[state.sessions.length - 1];
  return last ? daysBetween(last.date, today()) : null;
}
