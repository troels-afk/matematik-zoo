// Oplæsning: Kaj forklarer med Microsofts danske stemme Jeppe (Azure, da-DK-JeppeNeural). Klippene er lavet på forhånd
// af tools/lyd/tts.py og ligger i lyd/ – appen kalder aldrig Azure. lyd/manifest.json: say-tekst → { f: fil, d: sek. }.
// Klippene spilles i samme AudioContext som lydeffekterne (fx.js), så iPad'en også tillader dem langt fra et tryk.
import { audioCtx } from './fx.js?v=20261009090132';

let clips = null, loading = null;
const buffers = new Map(); // fil → Promise<AudioBuffer>
let current = null; // den oplæsning, der kører nu
// Testkroge: e2e spiller klippene hurtigere (rate) og lader Kaj vente på ▶ (auto), undtagen i sit eget trin
export const speech = { rate: 1, auto: (() => { try { return localStorage.getItem('mz_tale') !== 'nej'; } catch { return true; } })() };

export function loadSpeech() {
  loading ??= fetch('lyd/manifest.json')
    .then((r) => (r.ok ? r.json() : null)).catch(() => null)
    .then((m) => (clips = m?.clips || {}));
  return loading;
}
export const hasClip = (text) => !!(text && clips?.[text]);

function decode(file) {
  if (!buffers.has(file)) {
    const p = fetch(`lyd/${file}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); })
      .then((ab) => new Promise((ok, bad) => audioCtx().decodeAudioData(ab, ok, bad))); // Safari: callback-formen
    p.catch(() => buffers.delete(file)); // prøv igen næste gang (fx offline)
    buffers.set(file, p);
  }
  return buffers.get(file);
}
// Hent og afkod klippene i forvejen, så der ikke er en pause mellem kortene
export const preload = (texts) => texts.forEach((t) => hasClip(t) && decode(clips[t].f).catch(() => {}));

// Nyt skærmbillede eller appen gemt væk: Kaj tier
export function stopSpeech() { current?.stop(); }
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.hidden) current?.pause(); });

// Læser teksterne op én ad gangen med en lille pause imellem. onItem(i), når et stykke begynder;
// onState(state): 'playing' | 'paused' | 'ended' | 'stopped'. Tekster uden klip springes over.
export function narrate(texts, { onItem = () => {}, onState = () => {}, gap = 0.6 } = {}) {
  current?.stop();
  let gen = 0, src = null, startedAt = 0, offset = 0, timer = null, after = null;
  const n = { state: 'idle', index: 0, started: false };
  const set = (s) => { n.state = s; onState(s); };
  const halt = () => {
    gen++;
    clearTimeout(timer);
    if (src) { src.onended = null; try { src.stop(); } catch { /* allerede slut */ } src = null; }
  };
  async function play(i, at = 0) {
    halt();
    const my = gen;
    after = null;
    if (i >= texts.length) { n.index = texts.length; set('ended'); return; }
    n.index = i;
    const clip = clips?.[texts[i]];
    if (!clip) { play(i + 1); return; }
    n.started = true;
    onItem(i);
    set('playing');
    let buf;
    try { buf = await decode(clip.f); } catch { if (my === gen) play(i + 1); return; }
    if (my !== gen) return;
    const ctx = audioCtx();
    if (ctx?.state !== 'running') { try { await ctx?.resume(); } catch { /* låst */ } }
    if (my !== gen) return;
    if (ctx?.state !== 'running') { offset = at; set('paused'); return; } // lyden er ikke låst op endnu: ▶ starter den
    src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = speech.rate;
    src.connect(ctx.destination);
    src.onended = () => {
      if (my !== gen) return;
      src = null;
      after = i + 1;
      timer = setTimeout(() => { if (my === gen) play(i + 1); }, (gap * 1000) / speech.rate);
    };
    startedAt = ctx.currentTime - at / speech.rate;
    src.start(0, at);
  }
  n.play = (i = 0) => play(i);
  n.pause = () => {
    if (n.state !== 'playing') return;
    if (after !== null) { n.index = after; offset = 0; } // i pausen mellem to stykker: fortsæt med det næste
    else offset = src ? Math.max(0, (audioCtx().currentTime - startedAt) * speech.rate) : offset;
    halt();
    set('paused');
  };
  n.resume = () => { if (n.state === 'paused') play(n.index, offset); };
  n.stop = () => { if (n.state === 'stopped') return; halt(); if (current === n) current = null; set('stopped'); };
  current = n;
  return n;
}
