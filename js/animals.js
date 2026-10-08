// Rigtige tal om zoo'ens dyr – typiske voksne dyr i en dansk zoo, afrundet. Opgaverne henter tallene herfra, så de
// passer (ingen løver, der sover 30 timer i døgnet, eller giraffer, der spiser 4 kg blade) og lærer hende lidt om
// dyrene undervejs. pl = flertal (pingviner), en/de = bestemt ental/flertal (pingvinen, pingvinerne). kg = vægt,
// m = højde (giraf, kamel, flamingo, pingvin) eller længde (krokodille), mad = kg foder om dagen,
// soevn = timer søvn i døgnet, aeg = æg pr. kuld. img = ungen fra Babyhuset (img/babies/).
// pingvin = humboldtpingvin, abe = chimpanse, skildpadde = kæmpeskildpadde, sael = spættet sæl.
export const ANIMALS = {
  elefant: { pl: 'elefanter', en: 'elefanten', de: 'elefanterne', img: 'img/babies/elefant-glad.webp', kg: [3000, 5000], mad: [100, 150], madHvad: 'hø og grønt', soevn: [3, 5] },
  giraf: { pl: 'giraffer', en: 'giraffen', de: 'girafferne', img: 'img/babies/giraf-glad.webp', kg: [800, 1200], m: [4.5, 5.5], mad: [25, 35], madHvad: 'blade', soevn: [3, 5] },
  naesehorn: { pl: 'næsehorn', en: 'næsehornet', de: 'næsehornene', img: 'img/babies/naesehorn-glad.webp', kg: [1800, 2300], mad: [40, 60], madHvad: 'græs og hø' },
  flodhest: { pl: 'flodheste', en: 'flodhesten', de: 'flodhestene', img: 'img/babies/flodhest-glad.webp', kg: [1400, 2000], mad: [35, 45], madHvad: 'hø og græs' },
  isbjoern: { pl: 'isbjørne', en: 'isbjørnen', de: 'isbjørnene', img: 'img/babies/isbjoern-glad.webp', kg: [300, 600], mad: [8, 12], madHvad: 'kød og fisk' },
  loeve: { pl: 'løver', en: 'løven', de: 'løverne', img: 'img/babies/loeve.webp', kg: [130, 220], mad: [5, 8], madHvad: 'kød', soevn: [16, 20] },
  tiger: { pl: 'tigre', en: 'tigeren', de: 'tigrene', img: 'img/babies/tiger-glad.webp', kg: [120, 250], mad: [6, 9], madHvad: 'kød', soevn: [15, 18] },
  zebra: { pl: 'zebraer', en: 'zebraen', de: 'zebraerne', img: 'img/babies/zebra-glad.webp', kg: [300, 400], mad: [8, 10], madHvad: 'hø' },
  kamel: { pl: 'kameler', en: 'kamelen', de: 'kamelerne', img: 'img/babies/kamel-glad.webp', kg: [450, 600], m: [1.8, 2.1] },
  gorilla: { pl: 'gorillaer', en: 'gorillaen', de: 'gorillaerne', img: 'img/babies/gorilla-glad.webp', kg: [80, 180], mad: [12, 18], madHvad: 'grønt og frugt', soevn: [11, 13] },
  panda: { pl: 'pandaer', en: 'pandaen', de: 'pandaerne', img: 'img/babies/panda-glad.webp', kg: [80, 120], mad: [12, 30], madHvad: 'bambus', soevn: [10, 14] },
  koala: { pl: 'koalaer', en: 'koalaen', de: 'koalaerne', img: 'img/babies/koala-glad.webp', kg: [6, 12], soevn: [18, 22] },
  kaenguru: { pl: 'kænguruer', en: 'kænguruen', de: 'kænguruerne', img: 'img/babies/kaenguru-glad.webp', kg: [40, 80] },
  krokodille: { pl: 'krokodiller', en: 'krokodillen', de: 'krokodillerne', img: 'img/babies/krokodille-glad.webp', kg: [200, 500], m: [3, 5], aeg: [25, 60] },
  sael: { pl: 'sæler', en: 'sælen', de: 'sælerne', img: 'img/babies/sael-glad.webp', kg: [60, 130], mad: [3, 5], madHvad: 'fisk' },
  pingvin: { pl: 'pingviner', en: 'pingvinen', de: 'pingvinerne', img: 'img/babies/pingvin-glad.webp', kg: [4, 5], m: [0.6, 0.7], aeg: [1, 2] },
  flamingo: { pl: 'flamingoer', en: 'flamingoen', de: 'flamingoerne', img: 'img/babies/flamingo-glad.webp', kg: [2, 4], m: [1.2, 1.4], aeg: [1, 1] },
  svane: { pl: 'svaner', en: 'svanen', de: 'svanerne', img: 'img/babies/svane-glad.webp', kg: [9, 12], aeg: [4, 7] },
  abe: { pl: 'aber', en: 'aben', de: 'aberne', img: 'img/babies/abe-glad.webp', kg: [40, 60] },
  skildpadde: { pl: 'skildpadder', en: 'skildpadden', de: 'skildpadderne', img: 'img/babies/skildpadde-glad.webp', kg: [150, 250] },
};

// Store dyr (over et ton) og små dyr (under 20 kg) – til ton og gram i vægtopgaverne
export const HEAVY = ['elefant', 'naesehorn', 'flodhest', 'giraf'];
export const LIGHT = ['pingvin', 'flamingo', 'koala', 'svane'];

// Navnet med stort begyndelsesbogstav (først i en sætning)
export const cap = (s) => s[0].toUpperCase() + s.slice(1);
