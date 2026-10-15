#!/usr/bin/env python3
"""Tjek, at appen kan opdatere sig selv på enhederne efter et deploy.

Appen opdaterer sig kun, når sw.js ændrer sig. Derfor skal:
  1. VERSION i sw.js være et tidsstempel (ÅÅÅÅMMDDTTMMSS),
  2. alle filer i FILES findes, og deres hash passe til indholdet,
  3. alle appens filer stå i FILES (ellers virker de ikke offline),
  4. VERSION være ændret, når en af appens filer er ændret siden sidste deploy.

Brug: check_sw.py [forrige-commit]   (uden argument springes punkt 4 over)
"""
import hashlib, os, re, subprocess, sys

IGNORE_PREFIX = ('kryds/', '.git', '.github/', 'tools/', 'scripts/')
IGNORE = {'sw.js', 'CNAME', '.gitignore', '.nojekyll'}


def parse(src):
    v = re.search(r"const VERSION = '(\d+)';", src)
    a = src.index('const FILES = {')
    files = dict(re.findall(r'"([^"]+)": "([0-9a-f]+)"', src[a:src.index('};', a)]))
    return (v.group(1) if v else None), files


def main():
    errors = []
    version, files = parse(open('sw.js', encoding='utf-8').read())
    if not version or not re.fullmatch(r'\d{14}', version):
        errors.append(f'VERSION i sw.js er ikke et tidsstempel på 14 cifre: {version!r}')
    for path, h in files.items():
        if not os.path.exists(path):
            errors.append(f'{path} står i FILES, men findes ikke')
        elif hashlib.md5(open(path, 'rb').read()).hexdigest()[:10] != h:
            errors.append(f'{path}: hashen i FILES passer ikke til filen (kør tools/deploy.sh)')
    tracked = subprocess.run(['git', 'ls-files'], capture_output=True, text=True, check=True).stdout.split()
    for f in tracked:
        if f not in files and f not in IGNORE and not f.startswith(IGNORE_PREFIX):
            errors.append(f'{f} mangler i FILES i sw.js (virker ikke offline)')

    before = sys.argv[1] if len(sys.argv) > 1 and set(sys.argv[1]) != {'0'} else None
    if before:
        changed = subprocess.run(['git', 'diff', '--name-only', before, 'HEAD'], capture_output=True, text=True, check=True).stdout.split()
        app_changed = [f for f in changed if f in files]
        try:
            old_src = subprocess.run(['git', 'show', f'{before}:sw.js'], capture_output=True, text=True, check=True).stdout
            old_version = parse(old_src)[0]
        except subprocess.CalledProcessError:
            old_version = None
        if app_changed and old_version == version:
            errors.append('Appens filer er ændret, men VERSION i sw.js er den samme – enhederne opdager ikke ændringen. '
                          f'Ændrede filer: {", ".join(app_changed[:8])}')

    if errors:
        print('Appen vil ikke opdatere sig korrekt:\n- ' + '\n- '.join(errors))
        sys.exit(1)
    print(f'OK: version {version}, {len(files)} filer')


if __name__ == '__main__':
    main()
