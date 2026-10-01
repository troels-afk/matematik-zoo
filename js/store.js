// Gem fremskridt. Bruger serverens /api (deles mellem iPad og computer),
// og falder tilbage til localStorage hvis appen køres uden server.

const LS_PROFILES = 'mr_profiles';
const lsKey = (id) => `mr_state_${id}`;

let mode = null; // 'api' | 'local'

async function detect() {
  if (mode) return mode;
  try {
    const r = await fetch('api/ping', { cache: 'no-store' });
    mode = r.ok ? 'api' : 'local';
  } catch {
    mode = 'local';
  }
  return mode;
}

function lsGet(k, fallback) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* fx privat vindue */ }
}

export const slug = (name) =>
  name.toLowerCase().normalize('NFKD').replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'barn';

export async function listProfiles() {
  if ((await detect()) === 'api') {
    const r = await fetch('api/profiles', { cache: 'no-store' });
    return r.json();
  }
  return lsGet(LS_PROFILES, []);
}

export async function loadState(id) {
  if ((await detect()) === 'api') {
    const r = await fetch(`api/state/${id}`, { cache: 'no-store' });
    if (r.status === 404) return null;
    return r.json();
  }
  return lsGet(lsKey(id), null);
}

let saveTimer = null, pending = null;

export async function saveState(id, state, { now = false } = {}) {
  pending = { id, state };
  clearTimeout(saveTimer);
  if (now) return flush();
  saveTimer = setTimeout(flush, 600);
}

export async function flush() {
  if (!pending) return;
  const { id, state } = pending;
  pending = null;
  if ((await detect()) === 'api') {
    try {
      await fetch(`api/state/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state),
      });
    } catch {
      lsSet(lsKey(id), state); // offline: gem lokalt så intet går tabt
    }
    return;
  }
  lsSet(lsKey(id), state);
  const profiles = lsGet(LS_PROFILES, []);
  if (!profiles.find((p) => p.id === id)) {
    profiles.push({ id, name: state.name });
    lsSet(LS_PROFILES, profiles);
  }
}

export async function deleteProfile(id) {
  if ((await detect()) === 'api') {
    await fetch(`api/state/${id}`, { method: 'DELETE' });
    return;
  }
  try { localStorage.removeItem(lsKey(id)); } catch { /* ignore */ }
  lsSet(LS_PROFILES, lsGet(LS_PROFILES, []).filter((p) => p.id !== id));
}

export const storageMode = () => mode;

window.addEventListener('pagehide', () => { flush(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
