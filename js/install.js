// Installér som app: find ud af, hvor appen kører, og vis den rigtige vejledning (iPad, Mac eller pc).
// Som app fra hjemmeskærmen/Dock har den sit eget, faste lager – i Safari kan fremskridtet ellers blive slettet
// efter 7 dage uden brug, og i den indbyggede browser i Messenger/Facebook bliver det ofte slet ikke gemt.

const ua = navigator.userAgent;
const isIPadOS = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 0);
const isIOS = isIPadOS || /iPhone|iPod/.test(ua);

export const isInstalled = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;

// 'installed' | 'inapp' | 'ipad' | 'mac' | 'pc' | 'other'
export function platform() {
  if (isInstalled()) return 'installed';
  if (/FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|Line\/|MicroMessenger|Snapchat|LinkedInApp|GSA\//.test(ua)) return 'inapp';
  if (isIOS) return 'ipad'; // Safari og Chrome på iPad/iPhone: Del → Føj til hjemmeskærm
  const chromium = /Chrome\/|Edg\//.test(ua);
  if (/Macintosh/.test(ua) && /Safari\//.test(ua) && !chromium) return 'mac';
  if (chromium) return 'pc'; // Chrome og Edge på Windows, Mac, Chromebook og Android
  return 'other';
}

// Chrome/Edge kan vise deres egen "Installer app?"-boks – den gemmes her, til forælderen trykker på knappen
let deferred = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
window.addEventListener('appinstalled', () => { deferred = null; });
export const canPrompt = () => !!deferred;
export async function promptInstall() {
  if (!deferred) return false;
  deferred.prompt();
  const { outcome } = await deferred.userChoice.catch(() => ({ outcome: 'dismissed' }));
  deferred = null;
  return outcome === 'accepted';
}

const SKIP = 'mz_inst_skip';
export const skipped = () => { try { return !!localStorage.getItem(SKIP); } catch { return false; } };
export const skip = () => { try { localStorage.setItem(SKIP, new Date().toISOString().slice(0, 10)); } catch { /* */ } };

// ---------- Tegningerne: forenklede skærmbilleder, der følger appens farver (også i mørkt tema) ----------
const SHARE = (x, y) => `<g transform="translate(${x} ${y})" class="ig-ic"><rect x="-6" y="-3" width="12" height="13" rx="2.5"/><path d="M0 -9v12M-4 -5l4-4 4 4"/></g>`;
const ring = (x, y, r = 15) => `<circle class="ig-ring" cx="${x}" cy="${y}" r="${r}"/>`;
const tap = (x, y) => `<g class="ig-tap" transform="translate(${x} ${y})"><circle r="7"/></g>`;
const svg = (body, h = 190) => `<svg class="ig" viewBox="0 0 300 ${h}" role="img" aria-hidden="true">${body}</svg>`;

const ART = {
  ipad: [
    svg(`<rect class="ig-dev" x="6" y="6" width="288" height="178" rx="16"/>
      <rect class="ig-bar" x="18" y="18" width="264" height="34" rx="9"/>
      <rect class="ig-addr" x="92" y="25" width="116" height="20" rx="7"/><text class="ig-t" x="150" y="39" text-anchor="middle">matzoo.dk</text>
      <text class="ig-m" x="34" y="40">‹ ›</text>
      ${SHARE(244, 33)}${ring(244, 35)}${tap(252, 44)}
      <rect class="ig-page" x="18" y="60" width="264" height="112" rx="9"/>
      <image href="icon.png" x="126" y="82" width="48" height="48"/><text class="ig-m" x="150" y="150" text-anchor="middle">IJG Mat Zoo</text>`),
    svg(`<rect class="ig-dev" x="6" y="6" width="288" height="178" rx="16"/>
      <rect class="ig-sheet" x="40" y="22" width="220" height="150" rx="12"/>
      <text class="ig-m" x="58" y="50">Kopiér</text><line class="ig-ln" x1="52" y1="62" x2="248" y2="62"/>
      <text class="ig-m" x="58" y="84">Føj til læseliste</text><line class="ig-ln" x1="52" y1="96" x2="248" y2="96"/>
      <rect class="ig-hlrow" x="48" y="102" width="204" height="30" rx="8"/>
      <text class="ig-t ig-b" x="58" y="122">Føj til hjemmeskærm</text>
      <g class="ig-ic" transform="translate(234 117)"><rect x="-7" y="-7" width="14" height="14" rx="3"/><path d="M0 -4v8M-4 0h8"/></g>
      ${tap(222, 124)}
      <text class="ig-m" x="58" y="156">Gem i Filer</text>`),
    svg(`<rect class="ig-dev" x="6" y="6" width="288" height="178" rx="16"/>
      <rect class="ig-home" x="18" y="18" width="264" height="154" rx="10"/>
      ${[0, 1, 2, 3].map((i) => `<rect class="ig-app" x="${44 + i * 60}" y="40" width="36" height="36" rx="9"/>`).join('')}
      ${[0, 1].map((i) => `<rect class="ig-app" x="${44 + i * 60}" y="100" width="36" height="36" rx="9"/>`).join('')}
      <image href="icon.png" x="164" y="100" width="36" height="36"/>${ring(182, 118, 26)}
      <text class="ig-hometxt" x="182" y="152" text-anchor="middle">IJG Mat Zoo</text>`),
  ],
  mac: [
    svg(`<rect class="ig-dev" x="6" y="6" width="288" height="178" rx="10"/>
      <rect class="ig-bar" x="6" y="6" width="288" height="22" rx="10"/>
      <text class="ig-t ig-b" x="30" y="21">Safari</text><text class="ig-t" x="86" y="21">Arkiv</text><text class="ig-m" x="128" y="21">Rediger</text><text class="ig-m" x="180" y="21">Vis</text>
      <rect class="ig-hlpill" x="80" y="9" width="40" height="17" rx="5"/><text class="ig-t ig-on" x="86" y="21">Arkiv</text>
      <rect class="ig-sheet" x="78" y="30" width="160" height="128" rx="8"/>
      <text class="ig-m" x="92" y="52">Nyt vindue</text><text class="ig-m" x="92" y="74">Ny fane</text>
      <text class="ig-m" x="92" y="96">Åbn fil …</text><line class="ig-ln" x1="88" y1="106" x2="228" y2="106"/>
      <rect class="ig-hlrow" x="84" y="112" width="148" height="24" rx="6"/><text class="ig-t ig-b" x="92" y="129">Føj til Dock …</text>
      ${tap(200, 126)}
      <text class="ig-m" x="92" y="150">Luk vindue</text>`),
    svg(`<rect class="ig-dev" x="6" y="6" width="288" height="178" rx="10"/>
      <rect class="ig-sheet" x="60" y="26" width="180" height="96" rx="10"/>
      <image href="icon.png" x="76" y="42" width="40" height="40"/>
      <text class="ig-t ig-b" x="128" y="58">Føj til Dock</text><text class="ig-m" x="128" y="76">IJG Mat Zoo</text>
      <rect class="ig-hlbtn" x="170" y="92" width="58" height="22" rx="6"/><text class="ig-on ig-b" x="199" y="107" text-anchor="middle">Tilføj</text>
      ${tap(226, 113)}
      <rect class="ig-dock" x="62" y="140" width="176" height="36" rx="12"/>
      ${[0, 1, 2].map((i) => `<rect class="ig-app" x="${74 + i * 34}" y="146" width="26" height="26" rx="7"/>`).join('')}
      <image href="icon.png" x="176" y="146" width="26" height="26"/>${ring(189, 159, 18)}`),
  ],
  pc: [
    svg(`<rect class="ig-dev" x="6" y="6" width="288" height="178" rx="10"/>
      <rect class="ig-bar" x="6" y="6" width="288" height="40" rx="10"/>
      <rect class="ig-addr" x="40" y="15" width="226" height="22" rx="11"/><text class="ig-t" x="56" y="30">matzoo.dk</text>
      <g class="ig-ic" transform="translate(250 26)"><rect x="-8" y="-6" width="16" height="11" rx="2"/><path d="M-3 8h6M0 -3v5M-2.5 0l2.5 2.5 2.5-2.5"/></g>
      ${ring(250, 26, 13)}${tap(258, 34)}
      <text class="ig-m" x="18" y="31">⟳</text>
      <rect class="ig-page" x="16" y="54" width="268" height="120" rx="6"/>
      <text class="ig-m" x="150" y="118" text-anchor="middle">Installer-ikonet sidder yderst i adresselinjen</text>`),
    svg(`<rect class="ig-dev" x="6" y="6" width="288" height="178" rx="10"/>
      <rect class="ig-sheet" x="56" y="30" width="188" height="118" rx="10"/>
      <text class="ig-t ig-b" x="72" y="56">Vil du installere appen?</text>
      <image href="icon.png" x="72" y="68" width="30" height="30"/>
      <text class="ig-t" x="112" y="82">IJG Mat Zoo</text><text class="ig-m" x="112" y="96">matzoo.dk</text>
      <rect class="ig-hlbtn" x="120" y="114" width="60" height="24" rx="6"/><text class="ig-on ig-b" x="150" y="130" text-anchor="middle">Installer</text>
      <text class="ig-m" x="214" y="130" text-anchor="middle">Annuller</text>
      ${tap(180, 137)}`),
  ],
};

const STEPS = {
  ipad: ['Tryk på <b>Del</b> (firkanten med pilen) ved adresselinjen. På nyere iPads kan den ligge under <b>···</b>',
    'Rul ned og vælg <b>Føj til hjemmeskærm</b> → <b>Tilføj</b>',
    'Start altid appen fra det nye <b>ikon</b> – ikke fra Safari'],
  mac: ['Vælg <b>Arkiv</b> i menulinjen → <b>Føj til Dock …</b> (kræver macOS Sonoma eller nyere)',
    'Tryk <b>Tilføj</b>. Appen ligger nu i Dock og i Programmer – start den derfra'],
  pc: ['Klik på <b>installer-ikonet</b> yderst i adresselinjen (Chrome og Edge). Ingen ikon? Åbn menuen <b>⋮</b> / <b>···</b> og find <b>Installer</b>',
    'Klik <b>Installer</b>. Appen åbner i sit eget vindue og får et ikon på skrivebordet / i startmenuen'],
};
const LABEL = { ipad: 'iPad / iPhone', mac: 'Mac', pc: 'PC / Chrome' };

// Indholdet til arket. p = den platform, der vises; hasProgress = der er allerede profiler i denne browser
export function guideHTML(p, { hasProgress = false } = {}) {
  const here = platform();
  if (p === 'inapp' || (here === 'inapp' && !p)) {
    return `<div class="ig-wrap"><div class="sheet-head"><span class="sheet-ic">⚠️</span><div><h2 style="margin:0">Åbn appen i Safari</h2>
      <p class="muted" style="margin:0">Du har åbnet IJG Mat Zoo inde i en anden app (fx Messenger eller Facebook). Her bliver fremskridtet ofte ikke gemt.</p></div></div>
      <ol class="ig-steps"><li><span>Tryk på <b>···</b> eller <b>⋮</b> og vælg <b>Åbn i Safari</b> / <b>Åbn i browser</b> – eller kopiér linket herunder og sæt det ind i Safari</span></li></ol>
      <div class="row"><button class="btn" id="ig-copy">Kopiér linket matzoo.dk</button><button class="btn ghost" data-close>Spil her alligevel</button></div></div>`;
  }
  const tabs = ['ipad', 'mac', 'pc'];
  const auto = p === 'pc' && canPrompt();
  return `<div class="ig-wrap">
    <div class="sheet-head"><span class="sheet-ic"><img src="icon.png" alt="" width="40" height="40" style="border-radius:10px"></span><div>
      <h2 style="margin:0">Læg IJG Mat Zoo på hjemmeskærmen</h2>
      <p class="muted" style="margin:0">Så starter den som en rigtig app, virker uden internet – og <b>fremskridtet bliver ikke slettet</b>. Det tager 20 sekunder for en voksen.</p></div></div>
    <div class="seg ig-tabs" role="tablist" aria-label="Vælg enhed">${tabs.map((t) => `<button role="tab" data-ig="${t}" aria-selected="${t === p}" class="${t === p ? 'on' : ''}">${LABEL[t]}${t === here ? ' · denne' : ''}</button>`).join('')}</div>
    ${auto ? `<button class="btn big" id="ig-install">Installer appen nu</button><p class="small muted" style="margin:-6px 0 0">Eller gør det selv sådan her:</p>` : ''}
    <ol class="ig-steps">${STEPS[p].map((s, i) => `<li><div class="ig-art">${ART[p][i] || ART[p][ART[p].length - 1]}</div><span>${s}</span></li>`).join('')}</ol>
    ${hasProgress ? `<p class="ig-note small"><b>Har I allerede spillet her i browseren?</b> Appen på hjemmeskærmen har sit eget lager. Gem først en backup (Forældre → Indstillinger → Gem backup), og indlæs den i appen bagefter.</p>` : ''}
    <div class="row" style="justify-content:space-between"><button class="btn ghost" id="ig-skip">Spil i browseren i stedet</button>${p === here ? '' : '<span class="small muted">Vejledningen til en anden enhed</span>'}</div>
  </div>`;
}
