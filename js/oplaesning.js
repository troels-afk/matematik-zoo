// Kajs oplæsning af forklaringerne ("Se hvordan", "Se eksemplet" og 💡 Hjælp) med Microsofts danske stemme Jeppe:
// det, han siger til hvert stykke. Skrevet til øret – "23 delt med 4", "tre fjerdedele", "kvart i to" – ikke som
// skærmens tegn. Nøglen er færdighedens id (tabel2 dækker alle tabellerne); kortene står i samme rækkefølge som i
// curriculum.js med kortets titel som kontrol (legacy-testen tjekker, at de passer).
// Ret en tekst her, og lav lyden igen: node tools/lyd/katalog.mjs && python3 tools/lyd/tts.py app --ryd
export const SAY = {
  // ---------- Tal og titalssystemet ----------
  positionssystem: {
    lead: 'Hvert ciffer i et billetnummer står på en plads. Og pladsen bestemmer, hvor meget cifferet er værd.',
    cards: [
      ['Pladsen bestemmer værdien', 'Se på tallet 4732. Over hvert ciffer står der, hvad pladsen er værd. Cifferet 7 står på hundredernes plads. Derfor er det ikke bare 7 værd, men 7 hundreder. Det er 700.'],
      ['Nul holder pladsen', 'I tallet 4032 er der ingen hundreder. Derfor står der et 0 på hundredernes plads. Tallet er 4000 plus 30 plus 2. Nullet skal stå der, for ellers ville tallet blive til 432.'],
    ],
    tip: 'Du kan skille et tal ad og skrive det som et plusstykke. 4732 er 4000 plus 700 plus 30 plus 2. Står pladserne blandet, som 3 tiere og 2 tusinder, så er det 2000 plus 30, altså 2030.',
  },
  afrunding: {
    lead: 'Bodil skriver gæstetallet på tavlen som et rundt tal. Hun vælger det runde tal, der ligger tættest på.',
    cards: [
      ['Tættest på', 'Se på tallinjen. 47 ligger mellem 40 og 50. Buerne viser, at der er 7 ned til 40, men kun 3 op til 50. Så ligger 47 tættest på 50, og derfor runder vi 47 op til 50.'],
      ['Præcis midt imellem', '45 ligger præcis midt mellem 40 og 50. Der er 5 ned til 40 og 5 op til 50. Når tallet ligger lige i midten, runder vi altid op. Så 45 bliver afrundet til 50.'],
      ['Hundreder og tusinder', 'Det virker på samme måde med hundreder. 362 ligger mellem 300 og 400. Der er 62 ned til 300, men kun 38 op til 400, så 362 bliver til 400. Med tusinder bliver 1350 til 1000, for det ligger tættere på 1000 end på 2000.'],
    ],
    tip: 'Runder du til tiere, så kig på cifferet på enernes plads. Er det 0, 1, 2, 3 eller 4, runder du ned, så 43 bliver til 40. Er det 5, 6, 7, 8 eller 9, runder du op, så 45 og 47 bliver til 50.',
  },
  sammenlign: {
    lead: 'Hvilken dag kom der flest gæster? Sammenlign tallene ciffer for ciffer.',
    cards: [
      ['Start fra venstre', 'Se på de to tal, 4712 og 4298. Start fra venstre. Tusinderne er ens, for begge har 4. Ved hundrederne har det øverste tal 7, og det nederste har 2. 7 er mere end 2, så 4712 er størst.'],
      ['Flest cifre', 'Her skal du sammenligne 985 og 1012. 985 har ingen tusinder, så den plads er tom. Men 1012 har et tusind. Et tal med tusinder er større end et tal uden, selvom 985 har store cifre. Så 985 er mindre end 1012.'],
    ],
    tip: 'Husk tegnene for større end og mindre end. Den åbne side af tegnet vender altid mod det største tal, og spidsen peger mod det mindste. Så 7 er større end 2, og 2 er mindre end 7.',
  },
  // ---------- Plus og minus ----------
  'pm-plus': {
    lead: 'Dagens billetsalg skal lægges sammen. Læg hundreder, tiere og enere sammen hver for sig.',
    cards: [
      ['Plus: hver plads for sig', 'Vi lægger 347 og 285 sammen. Se på tabellen. Hundrederne giver 300 plus 200, og det er 500. Tierne giver 40 plus 80, altså 120, og enerne giver 7 plus 5, altså 12. Til sidst lægger vi det hele sammen, og 500 plus 120 plus 12 er 632.'],
    ],
    tip: 'Tjek dit svar med minus. 632 minus 285 er 347, så det passer.',
  },
  'pm-minus': {
    lead: 'Hvor mange er der tilbage? Træk tallet fra i bidder, først hundreder, så tiere og til sidst enere.',
    cards: [
      ['Minus: træk fra i bidder', 'Vi skal regne 632 minus 285. Del 285 op i 200, 80 og 5, og træk en bid fra ad gangen. 632 minus 200 er 432. 432 minus 80 er 352, og 352 minus 5 er 347.'],
    ],
    tip: 'Tjek dit svar med plus. 347 plus 285 er 632, så det passer.',
  },
  // ---------- Gange ----------
  tabel2: {
    lead: 'Øv en tabel ad gangen. Du kan altid regne dig frem fra et gangestykke, du kender.',
    cards: [
      ['Spring i tabellen', 'Se på springene i 7-tabellen. Hvert spring lægger 7 til, så du kan tælle 7, 14, 21, 28. Det næste spring lander på 28 plus 7, og det er 35. Sådan kan du altid finde det næste tal i tabellen.'],
      ['Fra et tal, du kender', 'Kan du ikke huske 6 gange 7? Så start med et gangestykke, du kender, som 5 gange 7, der er 35. 6 gange 7 er bare en gruppe mere med 7, ligesom på tegningen. Så er 6 gange 7 lig med 35 plus 7, og det er 42.'],
    ],
    tip: 'Du må gerne bytte om, for 3 gange 7 er det samme som 7 gange 3. Ganger du med 10, sætter du bare et 0 på, så 10 gange 7 er 70. Og 5 gange 7 er halvdelen af 70, altså 35.',
  },
  gange10: {
    lead: 'Foderet pakkes i kasser med 10 og 100. Når man ganger med 10 eller 100, flytter cifrene plads.',
    cards: [
      ['× 10', 'Se på tegningen. Vi ganger 34 med 10. Hvert ciffer rykker en plads til venstre og bliver 10 gange mere værd. 3 tiere bliver til 3 hundreder, og 4 enere bliver til 4 tiere. På enernes plads skriver vi et 0, så 34 gange 10 er 340.'],
      ['× 100', 'Når vi ganger med 100, rykker cifrene to pladser til venstre. 3 tiere bliver til 3 tusinder, og 4 enere bliver til 4 hundreder. Så kommer der to nuller bagpå, og 34 gange 100 er 3400.'],
      ['Runde tal', 'Hvad er 30 gange 7? 30 er det samme som 3 tiere. 3 gange 7 er 21, så 3 tiere gange 7 er 21 tiere. Og 21 tiere er 210. Du regner altså 3 gange 7 og sætter et 0 på til sidst.'],
    ],
  },
  gangeflercifret: {
    lead: 'Girafferne og elefanterne spiser meget. Store gangestykker bliver lette, når du deler tallet op.',
    cards: [
      ['Del tallet op', 'Vi skal regne 47 gange 6. Del 47 op i 40 og 7, ligesom på tegningen. 40 gange 6 er 240, og 7 gange 6 er 42. Læg så de to dele sammen. 240 plus 42 er 282.'],
      ['Også med hundreder', 'Det virker også med hundreder. 236 gange 4 deler vi op i 200, 30 og 6. 200 gange 4 er 800, 30 gange 4 er 120, og 6 gange 4 er 24. Til sidst lægger vi det hele sammen. 800 plus 120 plus 24 er 944.'],
    ],
    tip: 'Lav et overslag, så du kan se, om svaret passer. 47 er lidt under 50, og 50 gange 6 er 300. Så svaret skal være lidt under 300, og 282 passer fint.',
  },
  gangetekst: {
    lead: 'Historien gemmer på et gangestykke. Find de lige store grupper.',
    cards: [
      ['Lige store grupper', 'Når der står 5 poser med 8 i hver, er det 5 lige store grupper. Se på tegningen. Der er 5 grupper, og der er 8 prikker i hver gruppe. Så regner du 5 gange 8, og det giver 40.'],
      ['Gange så mange', 'Pingvinen får 4 fisk. Sælen får 3 gange så mange. Det er 3 grupper med 4 i hver, ligesom på tegningen. 3 gange 4 er 12, så sælen får 12 fisk.'],
    ],
    tip: 'Læg mærke til ord som hver, i hver og gange så mange. De fortæller, at der er lige store grupper. Spørg så dig selv, hvor mange grupper der er, og hvor mange der er i hver.',
  },
  // ---------- Regneregler og regnehierarki ----------
  parenteser: {
    steps: [
      'Her er en vigtig regel. Gange og division skal altid regnes før plus og minus, også selvom gangestykket står til sidst.',
      'Se på regnestykket 5 minus 5 gange 1. Gangestykket skal regnes først, så vi sætter en parentes om 5 gange 1.',
      'Regn parentesen først. 5 gange 1 er 5. Så regner vi resten, og 5 minus 5 er 0.',
      'Minustal er tal under nul. Minus 3 ligger 3 skridt til venstre for 0 på tallinjen. Det er ligesom minus 3 grader på et termometer, når det fryser.',
      'Nu skal vi regne minus 3 plus 3 gange 2. Gangestykket kommer først, og 3 gange 2 er 6, så vi får minus 3 plus 6. Start ved minus 3 på tallinjen, gå 6 skridt frem, og så lander du på 3.',
      '6 gange minus 1 betyder minus 1 taget 6 gange, og det giver minus 6. Så bliver 6 gange minus 1 plus 2 gange 2 til minus 6 plus 4. Start ved minus 6, gå 4 skridt frem, og så lander du på minus 2.',
    ],
  },
  // ---------- Division ----------
  divtabel: {
    lead: 'Bananerne skal deles helt lige mellem aberne. Division er gange baglæns.',
    cards: [
      ['Del lige ud', 'Se på tegningen. 24 bananer skal deles lige mellem 6 aber. Hver abe får sin egen gruppe, og der er 4 bananer i hver. 6 grupper med 4 i hver er 24 i alt. Så 24 delt med 6 er 4.'],
      ['Gange baglæns', 'Division er gange baglæns. Spørg dig selv, 6 gange hvad giver 24? Det ved du godt, for 6 gange 4 er 24. Den nederste pil på tegningen går baglæns, så 24 delt med 6 er 4.'],
    ],
  },
  'div-ligeligt': {
    lead: 'Noget skal deles helt lige mellem nogle stykker. Hvor mange får hver?',
    cards: [
      ['Del ligeligt', '15 bananer skal deles ligeligt mellem 3 aber. Se på tegningen. Hver abe får sin egen gruppe, og der kommer 5 bananer i hver. Så 15 delt med 3 er 5, og hver abe får 5 bananer.'],
    ],
    tip: 'Spørger opgaven, hvor mange hver får, så skal du dele ligeligt. Tjek bagefter med gange. 3 gange 5 er 15, så det passer.',
  },
  'div-grupper': {
    lead: 'Der skal være lige mange i hver gruppe. Hvor mange grupper bliver der?',
    cards: [
      ['Del i grupper', '24 børn skal stå i grupper med 4 i hver. Hvor mange grupper bliver der? Se på tegningen. Der er 4 børn i hver gruppe, og det bliver til 6 grupper. 24 delt med 4 er 6, for 4 går 6 gange op i 24.'],
    ],
    tip: 'Spørger opgaven, hvor mange grupper der bliver, så skal du dele i grupper. Tjek bagefter med gange. 6 gange 4 er 24, så det passer.',
  },
  divrest: {
    lead: 'Nogle gange går delingen ikke op. Det, der bliver til overs, hedder resten. Og resten – den får jeg!',
    cards: [
      ['Det, der er tilbage', 'Se på tegningen. Vi deler 23 med 4. Hvor mange hele grupper med 4 kan vi lave? Vi kan lave 5 grupper, og det er 20. Så er der 3 tilbage. 23 delt med 4 giver altså 5, rest 3.'],
      ['Hop med 4', 'Du kan også hoppe på tallinjen. Hop 4 ad gangen: 4, 8, 12, 16, 20. Det er 5 hop. Et hop mere ville lande på 24, og det er for langt. Fra 20 op til 23 mangler der 3. Det er resten.'],
      ['Resten er altid mindst', 'Husk: Resten skal altid være mindre end det tal, du deler med. Deler du med 4, kan resten kun være 0, 1, 2 eller 3. Er der 4 tilbage, kan du lave en gruppe mere.'],
    ],
  },
  divflercifret: {
    lead: 'Store tal deles lettest i bidder, som er nemme at dele.',
    cards: [
      ['Del i lette bidder', 'Vi skal dele 72 med 4. Del først 72 op i 40 og 32, for de er lette at dele med 4. 40 delt med 4 er 10, og 32 delt med 4 er 8. Tilsammen giver det 18, så 72 delt med 4 er 18.'],
      ['Store tal', 'Det virker også med større tal. 156 delt med 3 deler vi op i 120 og 36. 120 delt med 3 er 40, og 36 delt med 3 er 12. 40 plus 12 er 52, så 156 delt med 3 er 52.'],
    ],
    tip: 'Jeg tjekker altid mit svar ved at gange tilbage. 18 gange 4 er 72, så svaret passer.',
  },
  // ---------- Brøker ----------
  brokfigur: {
    lead: 'En brøk fortæller, hvor meget af en helhed vi taler om.',
    cards: [
      ['Tæller og nævner', 'Se på isflagen. Den er delt i 4 lige store dele, og 3 af dem er farvet. Det er tre fjerdedele. Tallet nederst i brøken hedder nævneren, og det viser, hvor mange dele der er i alt. Tallet øverst hedder tælleren, og det viser, hvor mange dele der er farvet.'],
      ['Lige store dele', 'Se på de to stænger. Begge er delt i 4 dele. I den første er delene lige store, så den farvede del er en fjerdedel. I den anden er delene ikke lige store, og så er det ikke fjerdedele. Delene skal altid være lige store.'],
    ],
  },
  brokafantal: {
    lead: 'Hvor mange fisk er tre fjerdedele af spanden? Del først, og gang så.',
    cards: [
      ['Del i grupper', 'Vi skal finde tre fjerdedele af 20 fisk. Nævneren er 4, så del de 20 fisk i 4 lige store grupper med 5 i hver. Tælleren er 3, så tag 3 af grupperne, ligesom de farvede på tegningen. 3 grupper med 5 i hver er 15 fisk.'],
      ['To trin', 'Du kan også regne det i to trin. Først deler du med nævneren, og 20 delt med 4 er 5. Så ganger du med tælleren, og 5 gange 3 er 15. Tre fjerdedele af 20 er altså 15.'],
    ],
  },
  broktallinje: {
    lead: 'Broen fra 0 til 1 er delt i lige store stykker, ligesom en brøk.',
    cards: [
      ['Del broen', 'Se på broen fra 0 til 1. Den er delt i 4 lige store stykker, så hvert stykke er en fjerdedel. Ved stregerne står der en fjerdedel, to fjerdedele og tre fjerdedele. Når du er helt henne ved 1, har du gået alle fire fjerdedele.'],
      ['Tæl stykkerne', 'Start ved 0, og tæl stykkerne med buerne på tegningen. 1, 2, 3. Pingvinen står efter 3 stykker, og hvert stykke er en fjerdedel. Så står den tre fjerdedele ude på broen.'],
    ],
  },
  broksammenlign: {
    lead: 'Hvem fik mest fisk? Sådan sammenligner du to brøker.',
    cards: [
      ['Samme nævner', 'Se på de to stænger. Begge er delt i 5, så stykkerne er lige store. Den øverste har 3 farvede stykker, og den nederste har 2. Så er tre femtedele større end to femtedele.'],
      ['Samme tæller', 'Nu er tælleren den samme, nemlig 1. Den øverste stang er delt i 3, og den nederste er delt i 6. Jo flere stykker fisken deles i, jo mindre bliver hvert stykke. Så er en tredjedel større end en sjettedel.'],
    ],
  },
  ligevaerdig: {
    lead: 'To brøker kan se forskellige ud og alligevel være lige store.',
    cards: [
      ['Samme portion', 'Se på de to stænger. Den øverste er delt i 2, og 1 del er farvet. Det er en halv. Den nederste er delt i 6, og 3 dele er farvet. Det er tre sjettedele. De farvede stykker er lige lange. Så en halv er lige så meget som tre sjettedele.'],
      ['Gang oppe og nede', 'Gang tælleren og nævneren med det samme tal, så får du en brøk, der er lige så stor. På tegningen ganger vi med 3 både oppe og nede. 1 gange 3 er 3, og 2 gange 3 er 6. Så en halv er lig med tre sjettedele. Ganger du med 2 i stedet, får du to fjerdedele.'],
    ],
    tip: 'Det virker også baglæns. Du kan dele tælleren og nævneren med det samme tal. Seks ottendedele er det samme som tre fjerdedele. Der har vi delt begge med 2.',
  },
  // ---------- Decimaltal ----------
  decfigur: {
    lead: 'Medicinen skal måles helt præcist, i tiendedele og hundrededele.',
    cards: [
      ['Tiendedele', 'Se på stangen. En hel er delt i 10 lige store dele, og hver del er en tiendedel. En tiendedel skriver vi som 0,1. Her er 3 af de 10 dele farvet, og det er 0,3.'],
      ['Hundrededele', 'Nu er en hel delt i 100 små felter. Hvert felt er en hundrededel, og det skriver vi som 0,01. Her er 7 felter farvet. Det er 7 hundrededele, og det skrives 0,07.'],
    ],
    tip: 'Den første plads efter kommaet er tiendedele, og den anden plads er hundrededele. 0,3 er 3 tiendedele, og 0,07 er 7 hundrededele. 0,37 er 3 tiendedele og 7 hundrededele.',
  },
  decimaldele: {
    steps: [
      'Et tal med komma har faste pladser. Foran kommaet står de hele, og efter kommaet kommer først tiendedelene og så hundrededelene. I tabellen står der 5 hele, 2 tiendedele og 6 hundrededele.',
      'Seks hundrededele betyder 6 ud af 100. Det skrives 0,06, med 6 på hundrededelenes plads.',
      'To tiendedele betyder 2 ud af 10. Det skrives 0,2, med 2 på tiendedelenes plads.',
      'Nu lægger vi det hele sammen. Seks hundrededele plus 5 plus to tiendedele er det samme som 5 plus 0,2 plus 0,06, og det giver 5,26. Rækkefølgen er ligegyldig, for hvert tal har sin egen plads.',
      'Pas på nullet. 3 plus tre hundrededele har ingen tiendedele, så der skal stå et 0 lige efter kommaet. Tallet er 3,03 og ikke 3,3.',
    ],
  },
  dectallinje: {
    lead: 'Vægten er en tallinje. Mellem to hele tal er der 10 små stykker.',
    cards: [
      ['Mellem 0 og 1', 'Se på tallinjen. Fra 0 til 1 er der 10 små stykker, og hvert stykke er 0,1. Tæl stykkerne fra 0 hen til prikken. Der er 7 stykker, så prikken står på 0,7.'],
      ['Mellem to hele tal', 'Det virker på samme måde mellem 2 og 3. Igen er der 10 små stykker, og hvert stykke er 0,1. Prikken står 4 stykker efter 2. Så er tallet 2 hele og 4 tiendedele, og det skrives 2,4.'],
      ['Zoom ind', 'Nu zoomer vi ind mellem 2,3 og 2,4. Her er der igen 10 små stykker, men nu er hvert stykke kun 0,01. Prikken står 6 stykker efter 2,3. Så står den på 2,36.'],
    ],
  },
  decsammenlign: {
    lead: 'Hvilken unge vejer mest? Pas på, for flere cifre betyder ikke, at tallet er større.',
    cards: [
      ['Flere cifre er ikke større', 'Se på de to stænger. Hver stang er en hel. 0,5 er 5 tiendedele, så den første stang er farvet halvvejs. 0,45 er kun 4 tiendedele og lidt mere. Derfor er 0,5 størst, selvom 0,45 har flere cifre.'],
      ['Gør dem lige lange', 'Sæt et 0 bag på 0,5, så den bliver til 0,50. Det ændrer ikke tallet, men nu har begge tal lige mange cifre efter kommaet. Så kan du sammenligne dem som 50 og 45, og 50 er størst. Derfor er 0,50 større end 0,45.'],
    ],
    tip: 'Kig først på de hele. 2,1 er større end 1,95, fordi 2 hele er mere end en hel. Er de hele ens, så kig på tiendedelene og derefter på hundrededelene.',
  },
  decplusminus: {
    lead: 'Klinikkens tal har komma. Det kan være kilo, liter og kroner.',
    cards: [
      ['Kommaerne under hinanden', 'Stil tallene op, så kommaerne står lige under hinanden. 0,7 er 7 tiendedele, og 0,6 er 6 tiendedele. Tilsammen er det 13 tiendedele. 10 tiendedele er en hel, så 13 tiendedele er 1,3.'],
      ['Med penge', 'Med penge regner du kroner for sig og øre for sig. 12 kroner plus 7 kroner er 19 kroner. 50 øre plus 25 øre er 75 øre. Tilsammen bliver det 19 kroner og 75 øre, og det skrives 19,75.'],
    ],
    tip: 'Minus virker på samme måde. 2,4 er 24 tiendedele, og 0,7 er 7 tiendedele. 24 minus 7 er 17 tiendedele, og det er 1,7.',
  },
  // ---------- Ligninger og balance ----------
  ukendt: {
    lead: 'Koden mangler et tal. Regn baglæns med det modsatte regnestykke.',
    cards: [
      ['Plus og minus', 'Der står, at et ukendt tal plus 7 giver 15. Regn baglæns med det modsatte regnestykke, ligesom den nederste pil på tegningen. Plus bliver til minus, så du regner 15 minus 7. Det giver 8, så det ukendte tal er 8.'],
      ['Gange og division', 'Her står der, at 4 gange et ukendt tal giver 28. Når du regner baglæns, bliver gange til division. 28 delt med 4 er 7. Så det ukendte tal er 7, for 4 gange 7 er 28.'],
    ],
    tip: 'Tjek koden ved at sætte dit tal ind. 8 plus 7 er 15, så koden passer.',
  },
  findx: {
    steps: [
      'x er et tal, vi ikke kender endnu. Vi skal finde det tal, der gør, at begge sider af lighedstegnet er lige store.',
      'Her er et eksempel: 7 gange 8 er lig med x plus x minus 10. Regn først det, du kan. 7 gange 8 er 56.',
      'Nu står der: 56 er lig med x plus x minus 10. Der er trukket 10 fra. Så lægger vi 10 til igen, og så er x plus x lig med 66.',
      'x plus x er det samme som 2 gange x. Så er x lig med 66 delt med 2. Det er 33.',
      'Tjek altid dit svar. 33 plus 33 minus 10 er 56. Begge sider er lige store. Så x er 33.',
    ],
  },
  // ---------- Mønstre ----------
  talfolger: {
    lead: 'Potesporet følger et mønster. Find springet, så kender du det næste tal.',
    cards: [
      ['Find springet', 'Se på tallene 3, 7, 11 og 15. Hvad sker der fra det ene tal til det næste? Fra 3 til 7 lægges der 4 til, og sådan er det hver gang. Så er det næste tal 15 plus 4, og det er 19.'],
      ['Det kan også gå nedad', 'Sporet kan også blive mindre for hvert skridt. Her går det 50, 45, 40 og 35. Der trækkes 5 fra hver gang. Så er det næste tal 35 minus 5, og det er 30.'],
    ],
    tip: 'I nogle talfølger ganger man hver gang. I 2, 4, 8, 16 ganges der med 2, og i 1, 3, 9, 27 ganges der med 3. I andre bliver springet 1 større hver gang, som i 1, 2, 4, 7, 11.',
  },
  // ---------- Linjer og vinkler ----------
  parallelle: {
    steps: [
      'Parallelle linjer er ligesom skinnerne på et togspor. Afstanden mellem dem er den samme hele vejen, og de mødes aldrig.',
      'På ternet papir kan du tælle, hvor meget en linje hælder. Linje a går 2 tern hen og et tern op, og det gør linje b også. De hælder lige meget, så de er parallelle.',
      'Her går linje a 2 tern hen og et tern op, men linje b går 3 tern hen og et tern op. De hælder forskelligt, så de ville mødes, hvis man tegnede dem længere. De er ikke parallelle.',
      'Linjer, der krydser hinanden, er aldrig parallelle. Her går linje a opad og linje b nedad, og de mødes på midten.',
    ],
  },
  vinkelrette: {
    steps: [
      'To linjer står vinkelret på hinanden, når de mødes i en ret vinkel på 90 grader. Det lille firkantede mærke viser, hvor den rette vinkel er.',
      'Er du i tvivl, så tag et stykke papir, og hold hjørnet ind mellem linjerne. Passer hjørnet præcis, står linjerne vinkelret.',
      'Linjerne kan godt være drejet. Linje a går 2 tern hen og et tern op, og linje b går et tern hen og 2 tern ned. Tallene har byttet plads, og op er blevet til ned, så står linjerne vinkelret.',
      'Er vinklen mindre eller større end 90 grader, står linjerne ikke vinkelret. Den stiplede linje viser, hvor en vinkelret linje skulle have gået. Her hælder linje b, så vinklen er for lille.',
    ],
  },
  vinkler: {
    lead: 'Hjørnerne i anlæggene har forskellige vinkler.',
    cards: [
      ['Ret vinkel', 'Se på tegningen. De to streger mødes i en ret vinkel, og det lille firkantede mærke viser det. En ret vinkel er 90 grader. Den ser ud ligesom hjørnet på et stykke papir.'],
      ['Spids og stump', 'Er vinklen mindre end en ret vinkel, hedder den spids. Den er under 90 grader, ligesom den første vinkel på tegningen. Er vinklen større end en ret vinkel, hedder den stump. Den er over 90 grader, ligesom den anden.'],
      ['Lige vinkel', 'Når vinklens to ben danner en helt lige linje, hedder det en lige vinkel. En lige vinkel er 180 grader. Den stiplede streg på tegningen deler den i to rette vinkler, og 90 plus 90 er 180.'],
    ],
  },
  // ---------- Trekanter og firkanter ----------
  'trekant-sider': {
    steps: [
      'En ligesidet trekant har tre lige lange sider. Her er alle tre sider 4 centimeter.',
      'En ligebenet trekant har to lige lange sider, og dem kalder vi benene. Her er de to ben 5 centimeter, og den tredje side er kun 3 centimeter.',
      'Her er siderne 7, 4 og 5 centimeter. Ingen af siderne er lige lange, så trekanten er hverken ligesidet eller ligebenet.',
      'Nogle gange er der små streger på siderne. Sider med lige mange streger er lige lange. Her har to sider en streg hver, så trekanten er ligebenet.',
      'Pas på enhederne. 4 centimeter er det samme som 40 millimeter. Så har en trekant med siderne 4 centimeter, 40 millimeter og 3 centimeter to lige lange sider, og den er ligebenet.',
    ],
  },
  'trekant-vinkler': {
    steps: [
      'En trekant har tre vinkler. Find den største vinkel, for den bestemmer, hvad trekanten hedder. Her er vinklerne 60, 80 og 40 grader, så den største er 80 grader.',
      'Er en af vinklerne ret, altså 90 grader, er trekanten retvinklet. Det lille firkantede mærke viser den rette vinkel.',
      'Er en af vinklerne stump, altså større end 90 grader, er trekanten stumpvinklet. Se den store vinkel med buen på tegningen.',
      'Er alle tre vinkler spidse, altså mindre end 90 grader, er trekanten spidsvinklet. Her har alle tre vinkler en bue, og de er alle mindre end en ret vinkel.',
      'Er du i tvivl, så hold hjørnet af et stykke papir ind i den største vinkel. Den stiplede linje viser en ret vinkel at sammenligne med. Her er vinklen lidt større, så trekanten er stumpvinklet.',
    ],
  },
  firkanter: {
    steps: [
      'Et parallelogram har to par parallelle sider. Siderne over for hinanden er lige lange, og det kan du se på, at de har lige mange streger.',
      'Et rektangel er et parallelogram med fire rette vinkler. Se de små firkantede mærker i alle fire hjørner.',
      'En rombe er et parallelogram med fire lige lange sider. Derfor har alle fire sider en streg hver.',
      'Et kvadrat har både fire rette vinkler og fire lige lange sider. Så er et kvadrat også et rektangel og en rombe. Men kvadrat er det mest præcise navn.',
      'En firkant, der ikke har to par parallelle sider, er ikke et parallelogram. I denne firkant er det kun bunden og toppen, der er parallelle.',
    ],
  },
  // ---------- Koordinatsystemet ----------
  'koord-aflaes': {
    steps: [
      'Kortet over zoo\'en er et koordinatsystem. Den vandrette akse hedder x-aksen, og den lodrette hedder y-aksen. De mødes ved indgangen i punktet 0, 0.',
      'Hvor bor girafferne? Start ved indgangen i 0, 0, og gå hen ad x-aksen, til du er lige under giraffen. Det er 4 hen.',
      'Gå så lige op til giraffen. Det er 2 op, så girafferne bor i 4, 2. Tallet for hen skrives altid først.',
      'Rækkefølgen betyder noget. 4, 2 og 2, 4 er to forskellige steder på kortet. I 2, 4 bor løverne. Husk, først hen og så op.',
    ],
  },
  'koord-find': {
    steps: [
      'Hvem bor i 6, 4? Det første tal fortæller, hvor langt du skal gå hen ad x-aksen. Det er 6 hen.',
      'Det andet tal fortæller, hvor langt du skal gå op. Det er 4 op. Der bor pingvinerne, så pingvinerne bor i 6, 4.',
      'Pas på fælden. Zebraerne bor 4 hen og 6 op, og det er 4, 6. Tallene er byttet om, og så er det et helt andet dyr.',
    ],
  },
  // ---------- Areal og omkreds ----------
  omkreds: {
    lead: 'Hegnet skal hele vejen rundt om anlægget. Den længde kaldes omkredsen.',
    cards: [
      ['Hele vejen rundt', 'Se på rektanglet. Det er 5 centimeter langt og 3 centimeter højt. Omkredsen er hele vejen rundt, så læg alle fire sider sammen. 5 plus 3 plus 5 plus 3 er 16, så omkredsen er 16 centimeter.'],
      ['Find den manglende side', 'Hele vejen rundt er 20 meter, men vi kender kun de to korte sider på 4 meter. Træk dem fra. 20 minus 4 minus 4 er 12. De 12 meter er de to lange sider tilsammen, så del med 2. Hver lang side er 6 meter.'],
    ],
    tip: 'Et rektangel har to lange og to korte sider. Så kan du lægge en lang og en kort side sammen og gange med 2. 5 plus 3 er 8, og 8 gange 2 er 16.',
  },
  areal: {
    lead: 'Hvor stor er indhegningen? Arealet er, hvor mange kvadrater der er plads til.',
    cards: [
      ['Tæl kvadraterne', 'Se på tegningen. Rektanglet er fyldt med små kvadrater. Der er 3 rækker med 5 kvadrater i hver. Så er der 5 gange 3, altså 15 kvadrater. Hvert kvadrat er en kvadratmeter, så arealet er 15 kvadratmeter.'],
      ['Sammensatte figurer', 'Denne figur er ikke et rektangel. Del den i to rektangler ved den stiplede linje. Det øverste har 4 kvadrater, og det nederste har 8. Læg dem sammen, 4 plus 8 er 12, så arealet er 12 kvadratmeter.'],
    ],
    tip: 'Areal måles i kvadrater. En kvadratmeter er et kvadrat, der er en meter på hver side. En kvadratcentimeter er et lille kvadrat, der er en centimeter på hver side.',
  },
  // ---------- Længde, vægt og rumfang ----------
  'enh-laengde': {
    lead: 'Hvor langt, højt eller bredt er noget? Længder måles i kilometer, meter, centimeter og millimeter.',
    cards: [
      ['Længde', 'Se målebåndet på hegnet. En meter er 100 centimeter, en kilometer er 1000 meter, og en centimeter er 10 millimeter. Girafungen er 2 meter høj. 2 gange 100 er 200, så den er 200 centimeter høj.'],
    ],
    tip: 'Fra en stor enhed til en lille ganger du, så 4 meter er 4 gange 100, altså 400 centimeter. Fra en lille enhed til en stor deler du, så 3000 meter er 3000 delt med 1000, altså 3 kilometer. En halv meter er 50 centimeter, og en halv kilometer er 500 meter.',
  },
  'enh-vaegt': {
    lead: 'Hvor tungt er noget? Vægt måles i gram, kilogram og ton. De store dyr vejer flere ton.',
    cards: [
      ['Vægt', 'På billedet bliver foderet vejet på en vægt. Vægt måler vi i kilogram og gram, og et kilogram er 1000 gram. Pingvinungen vejer 3 kilogram. 3 gange 1000 er 3000, så den vejer 3000 gram.'],
      ['Vægttrappen', 'Se på vægttrappen. Øverst står ton, så kilogram, og nederst gram. Går du et trin ned ad trappen, ganger du med 1000. Går du et trin op, deler du med 1000. Elefanten vejer 4 ton, og det er 4000 kilogram.'],
    ],
    tip: 'Fra en stor enhed til en lille ganger du, så 4 kilogram er 4 gange 1000, altså 4000 gram. Fra en lille enhed til en stor deler du, så 3000 gram er 3 kilogram. Et halvt kilogram er 500 gram, og et halvt ton er 500 kilogram. Skal du finde ud af, hvem der vejer mest, så regn først om, så begge vægte står i samme enhed.',
  },
  'enh-rumfang': {
    lead: 'Hvor meget kan der være i noget? Rumfang måles i liter, deciliter og centiliter.',
    cards: [
      ['Rumfang', 'På billedet er der en stor målekande og et lille målebæger. En liter er 10 deciliter, og det er det samme som 100 centiliter. Sælungen drikker 2 liter mælk. 2 gange 10 er 20, så det er 20 deciliter.'],
    ],
    tip: 'Fra en stor enhed til en lille ganger du, så 4 liter er 4 gange 10, altså 40 deciliter. Fra en lille enhed til en stor deler du, så 300 centiliter er 300 delt med 100, altså 3 liter. En halv liter er 5 deciliter, og det er 50 centiliter.',
  },
  // ---------- Tid ----------
  klokken: {
    lead: 'Uret har to visere. Den lille viser timerne, og den store viser minutterne.',
    cards: [
      ['Lille og stor viser', 'Den lille viser er lige kommet forbi 3, så klokken er lidt over tre. Den store viser står på 3. Hvert tal på uret er 5 minutter, og 3 gange 5 er 15. Så er klokken 15 minutter over tre, og det kalder vi kvart over tre.'],
      ['Halv', 'Nu står den store viser på 6. Det er 6 gange 5, altså 30 minutter, og det er en halv time. Den lille viser står midt mellem 3 og 4. Pas på, for vi siger halv fire, fordi der er en halv time, til klokken bliver fire.'],
    ],
    tip: 'Kvart over tre er 15 minutter over tre. Halv fire er 30 minutter over tre. Kvart i fire er 45 minutter over tre, og så mangler der kun et kvarter, før klokken er fire.',
  },
  tidsforskel: {
    lead: 'Hvor lang tid er der til næste fodring? Tæl op i to spring.',
    cards: [
      ['Tæl op til hel time', 'Se på tidslinjen. Vi skal fra klokken tretten femogfyrre, altså kvart i to, til klokken fjorten tyve. Tæl først op til den hele time. Fra kvart i to til klokken to er der 15 minutter, og derfra til 20 minutter over to er der 20 minutter mere. 15 plus 20 er 35, så der går 35 minutter.'],
      ['En time er 60 minutter', 'En time er 60 minutter. En halv time er 30 minutter, og en kvart time er 15 minutter. Varer noget en time og 10 minutter, så læg 60 og 10 sammen. Det giver 70 minutter.'],
    ],
  },
  // ---------- Tabeller og diagrammer ----------
  soejle: {
    lead: 'Gæsterne har stemt på deres yndlingsdyr. Søjlediagrammet viser stemmerne.',
    cards: [
      ['Aflæs søjlen', 'Se på søjlen for koala. Følg toppen af søjlen lige hen til tallene ude til venstre. Tallene går i spring på 2, og toppen står midt mellem 8 og 10. Så har koalaen fået 9 stemmer.'],
      ['Hvad er hver streg værd?', 'Kig altid efter, hvad hver streg er værd. Her går tallene i spring på 5. Søjlen for mandag når op til 15, så der blev solgt 15 is om mandagen. Det er ikke 3, selvom søjlen kun er 3 streger høj.'],
    ],
    tip: 'Spørger opgaven, hvor mange flere, så træk fra. 25 minus 15 er 10. Spørger den, hvor mange i alt, så læg sammen, og 15 plus 25 plus 10 er 50.',
  },
  prisskilt: {
    lead: 'Ved indgangen hænger et prisskilt. Find de priser, du skal bruge, og regn i trin.',
    cards: [
      ['Find prisen', 'Se på prisskiltet. Hver række er en slags billet. Skal du finde prisen for et barn, så find rækken, hvor der står barn, og følg den hen til prisen. En børnebillet koster 125 kroner.'],
      ['Regn i trin', 'Skal 2 voksne og 3 børn i zoo, så regn hver slags billet for sig. 2 voksne koster 2 gange 210, og det er 420 kroner. 3 børn koster 3 gange 125, og det er 375 kroner. Læg dem sammen til sidst. 420 plus 375 er 795 kroner.'],
      ['Hvad er billigst?', 'En familie med 2 voksne og 2 børn kan købe 4 enkeltbilletter. De koster 420 plus 250, altså 670 kroner. En familiebillet koster kun 600 kroner. 670 minus 600 er 70, så de sparer 70 kroner.'],
    ],
    tip: 'Først finder du de priser, du skal bruge. Så regner du hver slags billet for sig. Til sidst lægger du sammen, eller trækker fra, hvis du skal finde forskellen.',
  },
  // ---------- Beskriv data ----------
  'bd-typetal': {
    lead: 'Hvilket svar kom flest gange? Det tal kaldes typetallet.',
    cards: [
      ['Typetal', 'Se på tallene 2, 4, 5, 9 og 9. Typetallet er det tal, der er flest af. 9 står der to gange, og alle de andre tal står der kun en gang. Så er typetallet 9.'],
    ],
  },
  'bd-median': {
    lead: 'Sæt tallene i rækkefølge. Det tal, der står i midten, er medianen.',
    cards: [
      ['Median', 'Først skal tallene stå i rækkefølge fra det mindste til det største. Det gør de her, 2, 4, 5, 9 og 9. Medianen er det tal, der står i midten. Der står 2 tal på hver side af 5, så medianen er 5.'],
    ],
  },
  'bd-variationsbredde': {
    lead: 'Hvor langt er der fra det mindste til det største tal? Det er variationsbredden.',
    cards: [
      ['Variationsbredde', 'Variationsbredden er det største tal minus det mindste tal. I tallene 2, 4, 5, 9 og 9 er det største tal 9, og det mindste er 2. 9 minus 2 er 7, så variationsbredden er 7.'],
    ],
  },
  // ---------- Chance og sandsynlighed ----------
  sandsynlighed: {
    lead: 'Hvor stor er chancen for at spotte pandaen? Chancen kan siges med ord, og den kan skrives som en brøk.',
    cards: [
      ['Chancen i ord', 'Se på linjen. Helt til venstre står umulig, for det sker aldrig. Helt til højre står sikker, for det sker altid. Lige i midten står lige chance. Usandsynlig betyder, at det sker sjældent, og sandsynlig betyder, at det sker tit.'],
      ['Chancen som brøk', 'Se på posen. Der er 4 kugler i alt, og en af dem er rød. Chancen for at trække den røde kugle er derfor 1 ud af 4. Som brøk skriver vi det som en fjerdedel.'],
    ],
    tip: 'Den farve, der er flest af, har størst chance. I posen er der flest blå kugler, så blå har størst chance.',
  },
  // ---------- Kun i zoo'en ----------
  plusminus: {
    lead: 'Kassen skal gøres op. Dagens billetsalg skal lægges sammen og trækkes fra.',
    cards: [
      ['Plus: hver plads for sig', 'Vi lægger 347 og 285 sammen. Se på tabellen. Hundrederne giver 300 plus 200, og det er 500. Tierne giver 40 plus 80, altså 120, og enerne giver 7 plus 5, altså 12. Til sidst lægger vi det hele sammen, og 500 plus 120 plus 12 er 632.'],
      ['Minus: træk fra i bidder', 'Vi skal regne 632 minus 285. Del 285 op i 200, 80 og 5, og træk en bid fra ad gangen. 632 minus 200 er 432. 432 minus 80 er 352, og 352 minus 5 er 347.'],
    ],
    tip: 'Tjek dit svar med plus. 347 plus 285 er 632, så det passer.',
  },
  divtekst: {
    lead: 'Division bruges, når noget skal deles ligeligt, eller når noget skal deles i grupper.',
    cards: [
      ['Del ligeligt', '15 bananer skal deles ligeligt mellem 3 aber. Se på tegningen. Hver abe får sin egen gruppe, og der kommer 5 bananer i hver. Så 15 delt med 3 er 5, og hver abe får 5 bananer.'],
      ['Del i grupper', '24 børn skal stå i grupper med 4 i hver. Hvor mange grupper bliver der? Se på tegningen. Der er 4 børn i hver gruppe, og det bliver til 6 grupper. 24 delt med 4 er 6, for 4 går 6 gange op i 24.'],
      ['Pas på resten', '25 gæster skal med toget, og der er 4 pladser i hver vogn. 25 delt med 4 er 6, rest 1. Denne gang får jeg ikke resten, for den sidste gæst skal også med. Så der skal bruges en vogn mere, altså 7 vogne.'],
    ],
    tip: 'Spørger opgaven, hvor mange hver får, så del ligeligt. Spørger den, hvor mange grupper der bliver, så del i grupper. Skal alle med, skal du bruge en ekstra til resten, men spørger opgaven, hvor mange der er tilbage, er svaret resten.',
  },
  enheder: {
    lead: 'Foderet til rovdyrene skal måles, vejes og hældes op. Til det bruger man tre slags enheder.',
    cards: [
      ['Længde', 'Se målebåndet på hegnet. En meter er 100 centimeter, en kilometer er 1000 meter, og en centimeter er 10 millimeter. Girafungen er 2 meter høj. 2 gange 100 er 200, så den er 200 centimeter høj.'],
      ['Vægt', 'På billedet bliver foderet vejet på en vægt. Vægt måler vi i kilogram og gram, og et kilogram er 1000 gram. Pingvinungen vejer 3 kilogram. 3 gange 1000 er 3000, så den vejer 3000 gram.'],
      ['Rumfang', 'På billedet er der en stor målekande og et lille målebæger. En liter er 10 deciliter, og det er det samme som 100 centiliter. Sælungen drikker 2 liter mælk. 2 gange 10 er 20, så det er 20 deciliter.'],
    ],
    tip: 'Fra en stor enhed til en lille ganger du, så 4 meter er 4 gange 100, altså 400 centimeter. Fra en lille enhed til en stor deler du, så 3000 gram er 3000 delt med 1000, altså 3 kilogram. En halv meter er 50 centimeter, et halvt kilogram er 500 gram, og en halv liter er 5 deciliter.',
  },
  typetal: {
    lead: 'Gæsterne har svaret 2, 4, 5, 9 og 9. Tre ord beskriver sådan en række tal.',
    cards: [
      ['Typetal', 'Se på tallene 2, 4, 5, 9 og 9. Typetallet er det tal, der er flest af. 9 står der to gange, og alle de andre tal står der kun en gang. Så er typetallet 9.'],
      ['Median', 'Først skal tallene stå i rækkefølge fra det mindste til det største. Det gør de her, 2, 4, 5, 9 og 9. Medianen er det tal, der står i midten. Der står 2 tal på hver side af 5, så medianen er 5.'],
      ['Variationsbredde', 'Variationsbredden er det største tal minus det mindste tal. I tallene 2, 4, 5, 9 og 9 er det største tal 9, og det mindste er 2. 9 minus 2 er 7, så variationsbredden er 7.'],
    ],
  },
};

// Sæt teksterne på forklaringerne: intro.sayLead, kortenes say, tip.say og trinenes say. Et kort får kun sin tekst,
// hvis titlen passer – så læser Kaj aldrig et forkert kort op, hvis kortene bliver flyttet rundt
export function attachSay(skills) {
  for (const [id, t] of Object.entries(SAY)) {
    const it = skills[id]?.intro;
    if (!it) continue;
    if (t.lead) it.sayLead = t.lead;
    t.cards?.forEach(([title, say], i) => { const c = it.cards?.[i]; if (c?.title === title) c.say = say; });
    if (t.tip && it.tip) it.tip.say = t.tip;
    t.steps?.forEach((say, i) => { if (it.steps?.[i]) it.steps[i].say = say; });
  }
}
