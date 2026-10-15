/**
 * Matematik-Zoo – anonym optælling af aktive enheder, med en daglig Telegram-besked til Troels.
 *
 * Opsætning (én gang, på script.google.com):
 *  1. Nyt projekt, fx "Matzoo aktive enheder". Erstat Code.gs med hele denne fil og gem.
 *  2. Projektindstillinger (tandhjulet) → Tidszone: (GMT+01:00) Copenhagen.
 *     Samme sted under Scriptegenskaber: tilføj TELEGRAM_TOKEN (botnøglen – den samme som feedback-scriptet bruger)
 *     og TELEGRAM_CHAT_ID (din chat med botten).
 *  3. Vælg funktionen setup i værktøjslinjen og tryk Kør. Godkend adgangen. Den sender en testbesked til Telegram
 *     og planlægger den daglige besked kl. 7.
 *  4. Implementér → Ny implementering → Type: Webapp. Udfør som: Mig. Hvem har adgang: Alle. Implementér.
 *     Kopiér webappens URL (slutter på /exec) – den skal stå i PING_URL i js/app.js.
 *
 * Hvad der gemmes: kun en forkortet hash af enhedens tilfældige nummer pr. dag, i scriptets egenskaber.
 * Ingen navne, intet fremskridt, ingen IP-adresser. Dage ældre end 8 dage slettes hver morgen.
 */
const TZ = 'Europe/Copenhagen';
const KEEP_DAYS = 8;

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d && d.type === 'ping' && typeof d.id === 'string' && d.id.length >= 8 && d.id.length <= 64) record_(d.id);
  } catch (err) { /* ugyldig besked – ignoreres */ }
  return ContentService.createTextOutput('ok');
}

function record_(id) {
  const key = 'akt-' + dayStr_(0);
  const h = hash_(id);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const ids = JSON.parse(props.getProperty(key) || '[]');
    if (ids.indexOf(h) < 0) {
      ids.push(h);
      props.setProperty(key, JSON.stringify(ids)); // ca. 13 tegn pr. enhed – plads til ~600 enheder om dagen
    }
  } finally {
    lock.releaseLock();
  }
}

// Kører hver morgen kl. 7: gårsdagens antal og de sidste 7 dage
function dailyReport() {
  const props = PropertiesService.getScriptProperties();
  const ids = (n) => JSON.parse(props.getProperty('akt-' + dayStr_(n)) || '[]');
  const yesterday = ids(1).length;
  const week = {};
  for (let n = 1; n <= 7; n++) ids(n).forEach((h) => { week[h] = true; });
  sendTelegram_('📊 Matematik-Zoo\nI går (' + dayStr_(1) + '): ' + yesterday + ' aktive ' + (yesterday === 1 ? 'enhed' : 'enheder')
    + '\nSidste 7 dage: ' + Object.keys(week).length);
  const oldest = 'akt-' + dayStr_(KEEP_DAYS);
  Object.keys(props.getProperties()).forEach((k) => { if (k.indexOf('akt-') === 0 && k < oldest) props.deleteProperty(k); });
}

// Kør én gang: planlægger beskeden kl. 7 (fjerner gamle planer) og sender en testbesked
function setup() {
  ScriptApp.getProjectTriggers().forEach((t) => { if (t.getHandlerFunction() === 'dailyReport') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('dailyReport').timeBased().everyDays(1).atHour(7).inTimezone(TZ).create();
  sendTelegram_('✅ Matematik-Zoo: optællingen af aktive enheder er sat op. Du får en besked hver morgen kl. 7.');
}

function sendTelegram_(text) {
  const p = PropertiesService.getScriptProperties();
  const token = p.getProperty('TELEGRAM_TOKEN'), chat = p.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chat) throw new Error('Mangler TELEGRAM_TOKEN eller TELEGRAM_CHAT_ID under Scriptegenskaber');
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post', contentType: 'application/json', payload: JSON.stringify({ chat_id: chat, text: text }),
  });
}

function dayStr_(daysAgo) {
  return Utilities.formatDate(new Date(Date.now() - daysAgo * 86400000), TZ, 'yyyy-MM-dd');
}

function hash_(s) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'matzoo|' + s);
  return Utilities.base64EncodeWebSafe(b).slice(0, 10);
}
