// Matematik-Zoo som webapp: appens filer gemmes på enheden, så den starter med det samme
// og virker uden internet. VERSION og FILES (sti → indholdshash) skrives af tools/deploy.sh.
const VERSION = '20261005085532';
const FILES = {
"css/style.css": "f853ac6361",
"icon-192.png": "8f205bffb7",
"icon-512.png": "3f4e2cf3bb",
"icon.png": "cd7043bac8",
"icon.svg": "546fb9f723",
"img/babies/abe-glad.webp": "b697d0f3f6",
"img/babies/abe-jubler.webp": "f00d86d6a2",
"img/babies/abe-taenker.webp": "24d46c39c4",
"img/babies/abe.webp": "1d871db2e6",
"img/babies/aelling-glad.webp": "3c2cd12d99",
"img/babies/aelling-jubler.webp": "f3a42d8852",
"img/babies/aelling-taenker.webp": "76a4ffabec",
"img/babies/aelling.webp": "0613b06af5",
"img/babies/baever-glad.webp": "c61eff2ad0",
"img/babies/baever-jubler.webp": "9ce2d21b8d",
"img/babies/baever-taenker.webp": "06c774aa55",
"img/babies/baever.webp": "e7b48ac62e",
"img/babies/bison-glad.webp": "994bf39ed4",
"img/babies/bison-jubler.webp": "023a6c141a",
"img/babies/bison-taenker.webp": "9d54488d7c",
"img/babies/bjoern-glad.webp": "25c1013c84",
"img/babies/bjoern-jubler.webp": "1ef31eb354",
"img/babies/bjoern-taenker.webp": "25b969abf9",
"img/babies/bjoern.webp": "ece829fecc",
"img/babies/delfin-glad.webp": "918940f1c5",
"img/babies/delfin-jubler.webp": "7c44530df5",
"img/babies/delfin-taenker.webp": "6b95ba7ade",
"img/babies/dovendyr-glad.webp": "fd8dce648f",
"img/babies/dovendyr-jubler.webp": "011982fff9",
"img/babies/dovendyr-taenker.webp": "e9333969e2",
"img/babies/dovendyr.webp": "941d66ca24",
"img/babies/egern-glad.webp": "01486669ba",
"img/babies/egern-jubler.webp": "84b0f120a6",
"img/babies/egern-taenker.webp": "6d8cab21e9",
"img/babies/egern.webp": "fdb73d811f",
"img/babies/elefant-glad.webp": "b9458b11a0",
"img/babies/elefant-jubler.webp": "5c0726b044",
"img/babies/elefant-taenker.webp": "97fe8ca874",
"img/babies/elefant.webp": "53bb9da729",
"img/babies/firben-glad.webp": "d989c41c3f",
"img/babies/firben-jubler.webp": "b634c891ca",
"img/babies/firben-taenker.webp": "f900c6a995",
"img/babies/flamingo-glad.webp": "c0cd9154eb",
"img/babies/flamingo-jubler.webp": "8b40aaed5a",
"img/babies/flamingo-taenker.webp": "e7ab70ec2b",
"img/babies/flamingo.webp": "fecd4877a4",
"img/babies/flodhest-glad.webp": "eebff0b38e",
"img/babies/flodhest-jubler.webp": "ffd9a7cb0d",
"img/babies/flodhest-taenker.webp": "26e5c14ff4",
"img/babies/flodhest.webp": "603730f8b5",
"img/babies/foel-glad.webp": "60f9bfa64e",
"img/babies/foel-jubler.webp": "0effb09bea",
"img/babies/foel-taenker.webp": "1ee90fe10c",
"img/babies/foel.webp": "5c3cbed3c4",
"img/babies/froe-glad.webp": "c68b18766c",
"img/babies/froe-jubler.webp": "99a5103738",
"img/babies/froe-taenker.webp": "3564309b97",
"img/babies/froe.webp": "0b38774b7d",
"img/babies/ged-glad.webp": "b1b977d76e",
"img/babies/ged-jubler.webp": "4157716955",
"img/babies/ged-taenker.webp": "ed2066aa7b",
"img/babies/ged.webp": "3afa13210c",
"img/babies/giraf-glad.webp": "083184c8dd",
"img/babies/giraf-jubler.webp": "43e10bef05",
"img/babies/giraf-taenker.webp": "8838fe31a5",
"img/babies/giraf.webp": "1e2cef4ed8",
"img/babies/gorilla-glad.webp": "dddda0cc14",
"img/babies/gorilla-jubler.webp": "7b0a76da64",
"img/babies/gorilla-taenker.webp": "631c4f60f1",
"img/babies/graevling-glad.webp": "1212430efb",
"img/babies/graevling-jubler.webp": "10af01c3d1",
"img/babies/graevling-taenker.webp": "abae6c9d51",
"img/babies/hjort-glad.webp": "b05a19c34a",
"img/babies/hjort-jubler.webp": "eb63b37884",
"img/babies/hjort-taenker.webp": "cd9a046505",
"img/babies/isbjoern-glad.webp": "b127c509ad",
"img/babies/isbjoern-jubler.webp": "359da1c350",
"img/babies/isbjoern-taenker.webp": "7b75065f8e",
"img/babies/isbjoern.webp": "6bfc00d29d",
"img/babies/kaenguru-glad.webp": "1eeeeca5d8",
"img/babies/kaenguru-jubler.webp": "ec9485ec06",
"img/babies/kaenguru-taenker.webp": "5a8b8d0b41",
"img/babies/kaenguru.webp": "9247e6ae31",
"img/babies/kamel-glad.webp": "2b2faf0c4d",
"img/babies/kamel-jubler.webp": "dd13246d01",
"img/babies/kamel-taenker.webp": "f4f04d9183",
"img/babies/kamel.webp": "b451e95ef3",
"img/babies/kanin-glad.webp": "a62732bbf5",
"img/babies/kanin-jubler.webp": "c0fc1dd892",
"img/babies/kanin-taenker.webp": "01c131c9a1",
"img/babies/kanin.webp": "129af6d8ae",
"img/babies/koala-glad.webp": "ad264d70d2",
"img/babies/koala-jubler.webp": "402cb7dcc0",
"img/babies/koala-taenker.webp": "b713e50366",
"img/babies/koala.webp": "fa98f8d4cd",
"img/babies/krokodille-glad.webp": "ab9407b495",
"img/babies/krokodille-jubler.webp": "0128b231f3",
"img/babies/krokodille-taenker.webp": "0cebebf235",
"img/babies/lam-glad.webp": "2a1cdbaa2b",
"img/babies/lam-jubler.webp": "17f91c70ce",
"img/babies/lam-taenker.webp": "b799555885",
"img/babies/lam.webp": "55a2485b15",
"img/babies/lama-glad.webp": "7658608b3d",
"img/babies/lama-jubler.webp": "6fbc002ab2",
"img/babies/lama-taenker.webp": "183d9ed2f5",
"img/babies/lama.webp": "f7acf920bb",
"img/babies/leopard-glad.webp": "a7fbfe9336",
"img/babies/leopard-jubler.webp": "63bbbc9edc",
"img/babies/leopard-taenker.webp": "bd0c1e9d88",
"img/babies/leopard.webp": "8f8b6881ee",
"img/babies/loeve.webp": "0b19461d0e",
"img/babies/naesehorn-glad.webp": "cb7a479669",
"img/babies/naesehorn-jubler.webp": "2d864a1c0e",
"img/babies/naesehorn-taenker.webp": "3658543ecc",
"img/babies/naesehorn.webp": "695447352b",
"img/babies/odder-glad.webp": "6ed0820333",
"img/babies/odder-jubler.webp": "186e4d900e",
"img/babies/odder-taenker.webp": "f26878da25",
"img/babies/odder.webp": "14af4e320b",
"img/babies/orangutang-glad.webp": "6a05d53a1f",
"img/babies/orangutang-jubler.webp": "dd228d029e",
"img/babies/orangutang-taenker.webp": "7e9509f91a",
"img/babies/paafugl-glad.webp": "fca0fc012f",
"img/babies/paafugl-jubler.webp": "d25dab6283",
"img/babies/paafugl-taenker.webp": "961c9f8046",
"img/babies/panda-glad.webp": "e88bbb4948",
"img/babies/panda-jubler.webp": "0095ca76c8",
"img/babies/panda-taenker.webp": "5e0a4aa425",
"img/babies/panda.webp": "8a356b0a5b",
"img/babies/pindsvin-glad.webp": "01dac443ce",
"img/babies/pindsvin-jubler.webp": "391ae585ea",
"img/babies/pindsvin-taenker.webp": "6feca9e843",
"img/babies/pindsvin.webp": "7d07791443",
"img/babies/pingvin-glad.webp": "27345f2adc",
"img/babies/pingvin-jubler.webp": "06a3c6e2e2",
"img/babies/pingvin-taenker.webp": "522dcc3a8c",
"img/babies/pingvin.webp": "afacfd628e",
"img/babies/raev-glad.webp": "b48a33b0fb",
"img/babies/raev-jubler.webp": "395fd272a6",
"img/babies/raev-taenker.webp": "6b157a5ea4",
"img/babies/raev.webp": "42d9b78583",
"img/babies/sael-glad.webp": "8291c3a55b",
"img/babies/sael-jubler.webp": "0482bf0353",
"img/babies/sael-taenker.webp": "96985aa4a9",
"img/babies/sael.webp": "737f51fe3b",
"img/babies/skildpadde-glad.webp": "4a83939d38",
"img/babies/skildpadde-jubler.webp": "74695a3315",
"img/babies/skildpadde-taenker.webp": "8efbaff6f1",
"img/babies/skildpadde.webp": "36728833c7",
"img/babies/svane-glad.webp": "fa811068b9",
"img/babies/svane-jubler.webp": "6bcd7d0778",
"img/babies/svane-taenker.webp": "52699a63dc",
"img/babies/svane.webp": "a401282961",
"img/babies/tiger-glad.webp": "d7ed5e50cc",
"img/babies/tiger-jubler.webp": "098021013f",
"img/babies/tiger-taenker.webp": "bb552deaeb",
"img/babies/tiger.webp": "7209cb5301",
"img/babies/ugle-glad.webp": "43de02fe78",
"img/babies/ugle-jubler.webp": "826166aa7d",
"img/babies/ugle-taenker.webp": "7512d97c30",
"img/babies/ugle.webp": "ffeea8f1e8",
"img/babies/ulv-glad.webp": "0acea458c8",
"img/babies/ulv-jubler.webp": "0e177937fb",
"img/babies/ulv-taenker.webp": "62b899a1c0",
"img/babies/ulv.webp": "19567a2e6f",
"img/babies/vaskebjoern-glad.webp": "86f70a065f",
"img/babies/vaskebjoern-jubler.webp": "5f98bec198",
"img/babies/vaskebjoern-taenker.webp": "946e0e9f4d",
"img/babies/vaskebjoern.webp": "d9274f5cb5",
"img/babies/zebra-glad.webp": "67c849ad7f",
"img/babies/zebra-jubler.webp": "f82bf1e0d0",
"img/babies/zebra-taenker.webp": "2453eba54b",
"img/babies/zebra.webp": "3136dbfb48",
"img/cast/bodil-face.webp": "06ab0a4675",
"img/cast/bodil.webp": "bf1bd1983c",
"img/cast/kaj-bust.webp": "9cf04962ad",
"img/cast/kaj-face.webp": "04990f8737",
"img/cast/kaj.webp": "f8a0c722fa",
"img/cast/liv-bust.webp": "9ffb0053dd",
"img/cast/liv-face.webp": "cb88ad3e0d",
"img/cast/liv.webp": "6de1972c2d",
"img/cast/nora-bust.webp": "81b12d27d6",
"img/cast/nora-face.webp": "8d238191d9",
"img/cast/nora.webp": "ea20ab4097",
"img/cast/yasmin-bust.webp": "de932ddf75",
"img/cast/yasmin-face.webp": "00a589d18d",
"img/cast/yasmin.webp": "38f8e980a2",
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
"img/ui/babyhuset.webp": "3e081d0175",
"img/ui/lyd.webp": "afa35341d6",
"img/ui/oevebane.webp": "426efbed3b",
"img/ui/opgave.webp": "a3fc40a92c",
"img/ui/zoo-omraade.webp": "95cfcabe7c",
"img/ui/zoo-runden.webp": "e717e3975d",
"index.html": "e5b1e30d7b",
"js/app.js": "be683ffb48",
"js/curriculum.js": "940ef5f88e",
"js/engine.js": "129620061d",
"js/fx.js": "d4374ab279",
"js/map.js": "db9c1c1ae5",
"js/scene.js": "b4f9998d1c",
"js/store.js": "e60eddfa18",
"js/util.js": "183e6761c8",
"js/visuals.js": "b5380e4af7",
"js/zoo.js": "6c8cab7d1f",
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
