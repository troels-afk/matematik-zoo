#!/usr/bin/env python3
"""Lav Jeppes oplæsning af introen "Sådan spiller du" (TOUR_SAY i js/oplaesning.js).

Køres på Mac'en fra repoets rod:

    AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=westeurope python3 scripts/lyd_intro.py

(samme nøgle og region som tools/lyd/tts.py bruger). Scriptet
  1. henter de tekster i TOUR_SAY, der mangler et klip i lyd/manifest.json,
  2. laver dem med da-DK-JeppeNeural i samme format som de andre klip (24 kHz, 48 kbit/s, mono mp3),
  3. skriver dem i lyd/ og lyd/manifest.json,
  4. opdaterer FILES og VERSION i sw.js, så iPad'erne henter dem.
Bagefter: git add lyd sw.js && git commit -m "Introen med Jeppes stemme" && git push

Kører du senere tools/lyd/tts.py med --ryd, så kør dette script igen bagefter, hvis introens klip er forsvundet.
Kun standardbiblioteket bruges – intet skal installeres.
"""
import hashlib, json, os, re, sys, time, urllib.request
from xml.sax.saxutils import escape

VOICE = 'da-DK-JeppeNeural'
FORMAT = 'audio-24khz-48kbitrate-mono-mp3'
KBPS = 48


def tour_texts():
    src = open('js/oplaesning.js', encoding='utf-8').read()
    start = src.index('export const TOUR_SAY = [')
    body = src[start:src.index('];', start)]
    return [json.loads('"' + t + '"') for t in re.findall(r'"((?:[^"\\]|\\.)*)"', body)]


def synth(text, key, region):
    ssml = (f"<speak version='1.0' xml:lang='da-DK'><voice name='{VOICE}'>{escape(text)}</voice></speak>").encode('utf-8')
    req = urllib.request.Request(
        f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1', data=ssml, method='POST',
        headers={'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml',
                 'X-Microsoft-OutputFormat': FORMAT, 'User-Agent': 'matematik-zoo'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def update_sw():
    s = open('sw.js', encoding='utf-8').read()
    a = s.index('const FILES = {')
    b = s.index('};', a)
    files = dict(re.findall(r'"([^"]+)": "([0-9a-f]+)"', s[a:b]))
    for name in sorted(os.listdir('lyd')):
        files[f'lyd/{name}'] = None
    files = {p: hashlib.md5(open(p, 'rb').read()).hexdigest()[:10] for p in sorted(files) if os.path.exists(p)}
    body = 'const FILES = {\n' + ',\n'.join(f'"{p}": "{h}"' for p, h in files.items()) + '\n'
    s = s[:a] + body + s[b:]
    s = re.sub(r"const VERSION = '\d+';", f"const VERSION = '{time.strftime('%Y%m%d%H%M%S')}';", s)
    open('sw.js', 'w', encoding='utf-8').write(s)


def main():
    key = os.environ.get('AZURE_SPEECH_KEY')
    region = os.environ.get('AZURE_SPEECH_REGION', 'westeurope')
    if not os.path.exists('js/oplaesning.js'):
        sys.exit('Kør scriptet fra repoets rod (mappen med index.html).')
    m = json.load(open('lyd/manifest.json', encoding='utf-8'))
    todo = [t for t in tour_texts() if t not in m['clips']]
    if not todo:
        print('Alle introens klip findes allerede.')
        return
    if not key:
        sys.exit('Sæt AZURE_SPEECH_KEY (og evt. AZURE_SPEECH_REGION) – samme nøgle som tools/lyd/tts.py bruger.')
    for t in todo:
        mp3 = synth(t, key, region)
        name = hashlib.sha1(f'{VOICE}|{t}'.encode('utf-8')).hexdigest()[:12] + '.mp3'
        open(f'lyd/{name}', 'wb').write(mp3)
        m['clips'][t] = {'f': name, 'd': round(len(mp3) * 8 / (KBPS * 1000), 2)}
        print(f'✓ {name}  {t[:60]}…')
    json.dump(m, open('lyd/manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    update_sw()
    print(f'\n{len(todo)} klip lavet. Nu: git add lyd sw.js && git commit -m "Introen med Jeppes stemme" && git push')


if __name__ == '__main__':
    main()
