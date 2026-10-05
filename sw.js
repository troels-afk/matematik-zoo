// Matematik-Zoo som webapp: appens filer gemmes på enheden, så den starter med det samme
// og virker uden internet. VERSION og FILES (sti → indholdshash) skrives af tools/deploy.sh.
const VERSION = '20261005213456';
const FILES = {
"css/style.css": "582c199a2c",
"icon-192.png": "8f205bffb7",
"icon-512.png": "3f4e2cf3bb",
"icon.png": "cd7043bac8",
"icon.svg": "546fb9f723",
"img/babies/abe-glad.webp": "b697d0f3f6",
"img/babies/abe-jubler.webp": "f00d86d6a2",
"img/babies/abe-taenker.webp": "24d46c39c4",
"img/babies/aelling-glad.webp": "3c2cd12d99",
"img/babies/aelling-jubler.webp": "f3a42d8852",
"img/babies/aelling-taenker.webp": "76a4ffabec",
"img/babies/baever-glad.webp": "c61eff2ad0",
"img/babies/baever-jubler.webp": "9ce2d21b8d",
"img/babies/baever-taenker.webp": "06c774aa55",
"img/babies/bison-glad.webp": "994bf39ed4",
"img/babies/bison-jubler.webp": "023a6c141a",
"img/babies/bjoern-glad.webp": "25c1013c84",
"img/babies/bjoern-jubler.webp": "1ef31eb354",
"img/babies/bjoern-taenker.webp": "25b969abf9",
"img/babies/delfin-glad.webp": "918940f1c5",
"img/babies/delfin-jubler.webp": "7c44530df5",
"img/babies/dovendyr-glad.webp": "fd8dce648f",
"img/babies/dovendyr-jubler.webp": "011982fff9",
"img/babies/dovendyr-taenker.webp": "e9333969e2",
"img/babies/egern-glad.webp": "01486669ba",
"img/babies/egern-jubler.webp": "84b0f120a6",
"img/babies/egern-taenker.webp": "6d8cab21e9",
"img/babies/elefant-glad.webp": "b9458b11a0",
"img/babies/elefant-jubler.webp": "5c0726b044",
"img/babies/elefant-taenker.webp": "97fe8ca874",
"img/babies/firben-glad.webp": "d989c41c3f",
"img/babies/firben-jubler.webp": "b634c891ca",
"img/babies/flamingo-glad.webp": "c0cd9154eb",
"img/babies/flamingo-jubler.webp": "8b40aaed5a",
"img/babies/flamingo-taenker.webp": "e7ab70ec2b",
"img/babies/flodhest-glad.webp": "eebff0b38e",
"img/babies/flodhest-jubler.webp": "ffd9a7cb0d",
"img/babies/flodhest-taenker.webp": "26e5c14ff4",
"img/babies/foel-glad.webp": "60f9bfa64e",
"img/babies/foel-jubler.webp": "0effb09bea",
"img/babies/foel-taenker.webp": "1ee90fe10c",
"img/babies/froe-glad.webp": "c68b18766c",
"img/babies/froe-jubler.webp": "99a5103738",
"img/babies/froe-taenker.webp": "3564309b97",
"img/babies/ged-glad.webp": "b1b977d76e",
"img/babies/ged-jubler.webp": "4157716955",
"img/babies/ged-taenker.webp": "ed2066aa7b",
"img/babies/giraf-glad.webp": "083184c8dd",
"img/babies/giraf-jubler.webp": "43e10bef05",
"img/babies/giraf-taenker.webp": "8838fe31a5",
"img/babies/gorilla-glad.webp": "dddda0cc14",
"img/babies/gorilla-jubler.webp": "7b0a76da64",
"img/babies/graevling-glad.webp": "1212430efb",
"img/babies/graevling-jubler.webp": "10af01c3d1",
"img/babies/hjort-glad.webp": "b05a19c34a",
"img/babies/hjort-jubler.webp": "eb63b37884",
"img/babies/isbjoern-glad.webp": "b127c509ad",
"img/babies/isbjoern-jubler.webp": "359da1c350",
"img/babies/isbjoern-taenker.webp": "7b75065f8e",
"img/babies/kaenguru-glad.webp": "1eeeeca5d8",
"img/babies/kaenguru-jubler.webp": "ec9485ec06",
"img/babies/kaenguru-taenker.webp": "5a8b8d0b41",
"img/babies/kamel-glad.webp": "2b2faf0c4d",
"img/babies/kamel-jubler.webp": "dd13246d01",
"img/babies/kamel-taenker.webp": "f4f04d9183",
"img/babies/kanin-glad.webp": "a62732bbf5",
"img/babies/kanin-jubler.webp": "c0fc1dd892",
"img/babies/kanin-taenker.webp": "01c131c9a1",
"img/babies/koala-glad.webp": "ad264d70d2",
"img/babies/koala-jubler.webp": "402cb7dcc0",
"img/babies/koala-taenker.webp": "b713e50366",
"img/babies/krokodille-glad.webp": "ab9407b495",
"img/babies/krokodille-jubler.webp": "0128b231f3",
"img/babies/lam-glad.webp": "2a1cdbaa2b",
"img/babies/lam-jubler.webp": "17f91c70ce",
"img/babies/lam-taenker.webp": "b799555885",
"img/babies/lama-glad.webp": "7658608b3d",
"img/babies/lama-jubler.webp": "6fbc002ab2",
"img/babies/lama-taenker.webp": "183d9ed2f5",
"img/babies/leopard-glad.webp": "a7fbfe9336",
"img/babies/leopard-jubler.webp": "63bbbc9edc",
"img/babies/leopard-taenker.webp": "bd0c1e9d88",
"img/babies/loeve.webp": "0b19461d0e",
"img/babies/naesehorn-glad.webp": "cb7a479669",
"img/babies/naesehorn-jubler.webp": "2d864a1c0e",
"img/babies/naesehorn-taenker.webp": "3658543ecc",
"img/babies/odder-glad.webp": "6ed0820333",
"img/babies/odder-jubler.webp": "186e4d900e",
"img/babies/odder-taenker.webp": "f26878da25",
"img/babies/orangutang-glad.webp": "6a05d53a1f",
"img/babies/orangutang-jubler.webp": "dd228d029e",
"img/babies/paafugl-glad.webp": "fca0fc012f",
"img/babies/paafugl-jubler.webp": "d25dab6283",
"img/babies/panda-glad.webp": "e88bbb4948",
"img/babies/panda-jubler.webp": "0095ca76c8",
"img/babies/panda-taenker.webp": "5e0a4aa425",
"img/babies/pindsvin-glad.webp": "01dac443ce",
"img/babies/pindsvin-jubler.webp": "391ae585ea",
"img/babies/pindsvin-taenker.webp": "6feca9e843",
"img/babies/pingvin-glad.webp": "27345f2adc",
"img/babies/pingvin-jubler.webp": "06a3c6e2e2",
"img/babies/pingvin-taenker.webp": "522dcc3a8c",
"img/babies/raev-glad.webp": "b48a33b0fb",
"img/babies/raev-jubler.webp": "395fd272a6",
"img/babies/raev-taenker.webp": "6b157a5ea4",
"img/babies/sael-glad.webp": "8291c3a55b",
"img/babies/sael-jubler.webp": "0482bf0353",
"img/babies/sael-taenker.webp": "96985aa4a9",
"img/babies/skildpadde-glad.webp": "4a83939d38",
"img/babies/skildpadde-jubler.webp": "74695a3315",
"img/babies/skildpadde-taenker.webp": "8efbaff6f1",
"img/babies/svane-glad.webp": "fa811068b9",
"img/babies/svane-jubler.webp": "6bcd7d0778",
"img/babies/svane-taenker.webp": "52699a63dc",
"img/babies/tiger-glad.webp": "d7ed5e50cc",
"img/babies/tiger-jubler.webp": "098021013f",
"img/babies/tiger-taenker.webp": "bb552deaeb",
"img/babies/ugle-glad.webp": "43de02fe78",
"img/babies/ugle-jubler.webp": "826166aa7d",
"img/babies/ugle-taenker.webp": "7512d97c30",
"img/babies/ulv-glad.webp": "0acea458c8",
"img/babies/ulv-jubler.webp": "0e177937fb",
"img/babies/ulv-taenker.webp": "62b899a1c0",
"img/babies/vaskebjoern-glad.webp": "86f70a065f",
"img/babies/vaskebjoern-jubler.webp": "5f98bec198",
"img/babies/vaskebjoern-taenker.webp": "946e0e9f4d",
"img/babies/zebra-glad.webp": "67c849ad7f",
"img/babies/zebra-jubler.webp": "f82bf1e0d0",
"img/babies/zebra-taenker.webp": "2453eba54b",
"img/cast/bodil-face.webp": "06ab0a4675",
"img/cast/bodil.webp": "bf1bd1983c",
"img/cast/kaj-face.webp": "04990f8737",
"img/cast/kaj.webp": "f8a0c722fa",
"img/cast/liv-face.webp": "cb88ad3e0d",
"img/cast/liv.webp": "6de1972c2d",
"img/cast/nora-face.webp": "8d238191d9",
"img/cast/nora.webp": "ea20ab4097",
"img/cast/yasmin-face.webp": "00a589d18d",
"img/cast/yasmin.webp": "38f8e980a2",
"img/explain/bananer.webp": "29c48c608b",
"img/explain/fisk.webp": "5c22f8e480",
"img/explain/klinik.webp": "d86936f588",
"img/explain/kodelaas.webp": "fc83adcc9a",
"img/explain/laengde.webp": "dd4e9999b0",
"img/explain/rumfang.webp": "ddfd72a79f",
"img/explain/soejle.webp": "1b6fe43745",
"img/explain/ur.webp": "0ee135d5a3",
"img/explain/vaegt.webp": "fd28bbff64",
"img/map/01-indgang-flamingosoe.webp": "3e5c02f861",
"img/map/02-foderlager.webp": "c1bbc58efe",
"img/map/03-abehuset.webp": "4e286d666c",
"img/map/04-polaromraade.webp": "2dab841991",
"img/map/05-dyreklinik.webp": "12a1835a74",
"img/map/06-zebra-naesehorn.webp": "4a20d40f0b",
"img/map/07-rovdyrsomraade.webp": "a5e0c51026",
"img/map/08-data-plaza.webp": "dd35738cc8",
"img/map/09-skattejagt.webp": "e40bb0c4d5",
"img/map/zoo-map-base.webp": "842d62fad5",
"img/scene/foderstation.webp": "4aa67e7341",
"img/scene/giraf.webp": "db753d6fa4",
"img/task/algebra-1l.webp": "34e12bfeb5",
"img/task/algebra-1r.webp": "d8592f8779",
"img/task/algebra-2l.webp": "7cd623451b",
"img/task/algebra-2r.webp": "25cc06e4e6",
"img/task/brok-1l.webp": "0578604174",
"img/task/brok-1r.webp": "1cf65e9400",
"img/task/brok-2l.webp": "22253f8a8b",
"img/task/brok-2r.webp": "a29766c361",
"img/task/data-1l.webp": "9eac5c8738",
"img/task/data-1r.webp": "0406f75bed",
"img/task/data-2l.webp": "d536496cae",
"img/task/data-2r.webp": "90e54ea0df",
"img/task/decimal-1l.webp": "9cd87e5909",
"img/task/decimal-1r.webp": "53f9ad166b",
"img/task/decimal-2l.webp": "68fa53d151",
"img/task/decimal-2r.webp": "f4034ecc80",
"img/task/division-1l.webp": "d7636f260c",
"img/task/division-1r.webp": "289301fb8a",
"img/task/division-2l.webp": "0a2df34b39",
"img/task/division-2r.webp": "0927ba43ec",
"img/task/gange-1l.webp": "7a48b09ff1",
"img/task/gange-1r.webp": "9014d1efea",
"img/task/gange-2l.webp": "cef0e0987e",
"img/task/gange-2r.webp": "cead13534d",
"img/task/geometri-1l.webp": "73c4ecf49a",
"img/task/geometri-1r.webp": "59d4a51ec5",
"img/task/geometri-2l.webp": "139d6dd0dd",
"img/task/geometri-2r.webp": "38779047b4",
"img/task/maaling-1r.webp": "9a4428a0e7",
"img/task/maaling-2l.webp": "1ae2518263",
"img/task/maaling-2r.webp": "c4f699fd2f",
"img/task/tal-1r.webp": "aed20958b0",
"img/task/tal-2l.webp": "039deb28d1",
"img/task/tal-2r.webp": "335c399fe8",
"img/ui/babyhuset.webp": "3e081d0175",
"img/ui/lyd.webp": "afa35341d6",
"img/ui/oevebane.webp": "426efbed3b",
"img/ui/opgave.webp": "a3fc40a92c",
"img/ui/zoo-omraade.webp": "95cfcabe7c",
"img/ui/zoo-runden.webp": "e717e3975d",
"img/zoo/aber.webp": "396a761b2d",
"img/zoo/elefanter.webp": "5eaefac6ec",
"img/zoo/flamingoer.webp": "7db0a57b03",
"img/zoo/foderlager.webp": "a0162c8ea8",
"img/zoo/giraffer.webp": "af220230c3",
"img/zoo/indgang.webp": "260ad0ea09",
"img/zoo/klinik.webp": "ee5453bdea",
"img/zoo/observation.webp": "a5af1f5f9a",
"img/zoo/polar.webp": "ced82aaafb",
"index.html": "96b775d886",
"js/app.js": "a811467707",
"js/curriculum.js": "b8b2164078",
"js/engine.js": "b78cb3cc1b",
"js/fx.js": "d4374ab279",
"js/map.js": "1e96f42d70",
"js/scene.js": "85a896fe50",
"js/store.js": "e60eddfa18",
"js/util.js": "183e6761c8",
"js/visuals.js": "d5edf51d28",
"js/zoo.js": "633cc51b36",
"manifest.webmanifest": "58cc6e90f1"
};

const CORE = `mz-core-${VERSION}`; // html, css og js – udskiftes helt ved hver ny version
const MEDIA = 'mz-media'; // billeder og skrifttyper – genbruges og hentes kun igen, hvis de er ændret
const INDEX = 'mz-media-index'; // hvilken udgave (hash) af hvert billede der ligger i MEDIA
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@500;700;800;900&display=swap';
const isMedia = (p) => /\.(webp|png|jpe?g|gif|svg|woff2?)$/i.test(p);
const abs = (p) => new URL(p, self.registration.scope).href;

async function readIndex(media) {
  try { return (await (await media.match(INDEX))?.json()) || {}; } catch { return {}; }
}

// Skrifttyperne fra Google: gem stylesheet og fontfiler (kun latin og latin-ext, som dækker æ, ø og å)
async function cacheFonts(media) {
  if (await media.match(FONT_CSS)) return;
  const css = await (await fetch(FONT_CSS)).text();
  const urls = new Set(css.split('/* ').filter((b) => /^latin(-ext)? \*\//.test(b))
    .flatMap((b) => [...b.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1])));
  await Promise.all([...urls].map(async (u) => { const r = await fetch(u); if (r.ok) await media.put(u, r); }));
  await media.put(FONT_CSS, new Response(css, { headers: { 'Content-Type': 'text/css; charset=utf-8' } }));
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const paths = Object.keys(FILES);
    const core = await caches.open(CORE);
    await core.addAll(['./', ...paths.filter((p) => !isMedia(p))].map((p) => new Request(p, { cache: 'reload' })));
    // Billeder: kun nye eller ændrede hentes (6 ad gangen)
    const media = await caches.open(MEDIA);
    const idx = await readIndex(media);
    const todo = paths.filter((p) => isMedia(p) && idx[p] !== FILES[p]);
    for (let i = 0; i < todo.length; i += 6) {
      await Promise.all(todo.slice(i, i + 6).map(async (p) => {
        try {
          const r = await fetch(p, { cache: 'reload' });
          if (r.ok) { await media.put(p, r); idx[p] = FILES[p]; }
        } catch { /* prøves igen ved næste opdatering */ }
      }));
    }
    await media.put(INDEX, new Response(JSON.stringify(idx)));
    try { await cacheFonts(media); } catch { /* skrifttyperne hentes så fra nettet */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('mz-core-') && k !== CORE) await caches.delete(k);
    // Ryd billeder, som appen ikke bruger længere
    if (Object.keys(FILES).length) {
      const media = await caches.open(MEDIA);
      const idx = await readIndex(media);
      const keep = new Set(Object.keys(FILES).filter(isMedia).map(abs));
      for (const req of await media.keys()) {
        const u = new URL(req.url);
        if (u.origin !== location.origin || u.href === abs(INDEX) || keep.has(u.href)) continue;
        await media.delete(req);
        delete idx[u.href.slice(abs('').length)];
      }
      await media.put(INDEX, new Response(JSON.stringify(idx)));
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.includes('/api/')) return; // den lokale server: altid netværket
    if (req.mode === 'navigate') {
      e.respondWith((async () => (await caches.match('./')) || (await caches.match('index.html')) || fetch(req))());
      return;
    }
    // ?v=… ignoreres: hele CORE skiftes ved ny version, så den gemte fil er altid den rigtige
    e.respondWith((async () => (await caches.match(req, { ignoreSearch: true })) || fetch(req))());
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith((async () => (await caches.match(req)) || fetch(req))());
  }
});
