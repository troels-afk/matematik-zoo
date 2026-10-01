// Små hjælpere: tilfældighed, formatering og datoer.

export const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p) => Math.random() < p;

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a, b) => (a * b) / gcd(a, b);

// Dansk talformat: 12.345 og 2,5
export const fmt = (n) => n.toLocaleString('da-DK', { maximumFractionDigits: 3 });
export const fmtDec = (n, d) =>
  n.toLocaleString('da-DK', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false });
export const fmtKr = (cents) => fmtDec(cents / 100, 2) + ' kr.';

export const frac = (n, d) =>
  `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
export const box = (txt = '?') => `<span class="box">${txt}</span>`;

export const NAMES = ['Alma', 'Noah', 'Ida', 'Karl', 'Freja', 'Oscar', 'Clara', 'Emil', 'Asta', 'Viggo'];

export function today(d = new Date()) {
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return today(new Date(y, m - 1, d + n));
}

export function daysBetween(a, b) {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
}

// Mandag i den uge datoen ligger i
export function weekStart(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = (dt.getDay() + 6) % 7;
  return today(new Date(y, m - 1, d - dow));
}

// Tolk et svar skrevet af barnet: "2,5", "2.5", "1.000" (tusindtalsseparator)
export function parseNum(str) {
  if (str == null) return NaN;
  let s = String(str).trim().replace(/\s/g, '');
  if (s === '' || s === '-' || s === ',') return NaN;
  // "1.000" / "12.500" = tusindtal, når der er præcis 3 cifre efter hvert punktum og intet komma
  if (!s.includes(',') && /^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  s = s.replace(',', '.');
  if (!/^-?\d*\.?\d+$/.test(s) && !/^-?\d+\.?$/.test(s)) return NaN;
  return parseFloat(s);
}

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
