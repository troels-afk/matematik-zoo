// Lyd (Web Audio – ingen lydfiler) og konfetti (canvas). Begge er diskrete og kan slås fra.

let ctx = null;
let soundOn = true;

export function setSound(on) { soundOn = on; }

// iPad Safari: lyd skal låses op i et bruger-tryk
export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* ingen lyd */ }
}
['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, unlockAudio, { passive: true }));

function tone(t0, freq, start, dur, { type = 'sine', gain = 0.08 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0 + start);
  g.gain.setValueAtTime(0.0001, t0 + start);
  g.gain.exponentialRampToValueAtTime(gain, t0 + start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0 + start);
  o.stop(t0 + start + dur + 0.05);
}

const N = { C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66, E6: 1318.5, G4: 392, F4: 349.23, E4: 329.63 };

export function sfx(name) {
  if (!soundOn || !ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  switch (name) {
    case 'tap': tone(t, 880, 0, 0.05, { gain: 0.025 }); break;
    case 'correct': tone(t, N.G5, 0, 0.12, { type: 'triangle', gain: 0.09 }); tone(t, N.C6, 0.09, 0.22, { type: 'triangle', gain: 0.09 }); break;
    case 'wrong': tone(t, N.G4, 0, 0.16, { gain: 0.05 }); tone(t, N.E4, 0.13, 0.24, { gain: 0.045 }); break;
    case 'grow': [N.C6, N.E6].forEach((f, i) => tone(t, f, i * 0.06, 0.18, { type: 'triangle', gain: 0.05 })); break;
    case 'level': [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => tone(t, f, i * 0.08, 0.35, { type: 'triangle', gain: 0.07 })); break;
    case 'finish':
      [N.C5, N.E5, N.G5].forEach((f) => tone(t, f, 0, 0.7, { gain: 0.045 }));
      tone(t, N.C6, 0.18, 0.8, { type: 'triangle', gain: 0.06 });
      break;
  }
}

// ---------- Konfetti ----------

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#2e9e78', '#ffc94d', '#ff8a65', '#8fd3f4', '#b7a6e8', '#7dd6b0'];

export function confetti({ count = 140, duration = 2600 } = {}) {
  if (reducedMotion()) return;
  const c = document.createElement('canvas');
  c.className = 'confetti';
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  const parts = Array.from({ length: count }, () => ({
    x: innerWidth * (0.2 + Math.random() * 0.6), y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 9, vy: -6 - Math.random() * 9,
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, col: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
  const t0 = performance.now();
  (function frame(now) {
    const k = (now - t0) / duration;
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r);
      g.globalAlpha = Math.max(0, 1 - k * k);
      g.fillStyle = p.col; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      g.restore();
    }
    if (k < 1) requestAnimationFrame(frame); else c.remove();
  })(t0);
}

// Tæl et tal op i et element (fx gæster pr. dag)
export function countUp(el, from, to, ms = 900) {
  if (!el) return;
  const fmt = (n) => Math.round(n).toLocaleString('da-DK');
  if (reducedMotion() || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  (function frame(now) {
    const k = Math.min(1, (now - t0) / ms);
    const e = 1 - (1 - k) ** 3;
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(frame);
  })(t0);
}
