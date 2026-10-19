"""Read exact cached Latin WOFF2 metrics. This is not browser visual validation."""
import hashlib
import json
from pathlib import Path
from PIL import ImageFont

directory = Path('docs/execution/evidence/completeness-2026-10-19')
words = ['Engineering', 'Typography', 'Projects', 'Technology', 'Playing', 'Design', 'Jogging', 'g j p q y', 'Industrial Machine Safety System', 'Academic Information Dashboard']
records = []
for file in Path('.next/dev/static/media').glob('*-s.p.*.woff2'):
    font = ImageFont.truetype(str(file), 100)
    family, _ = font.getname()
    if not (family.startswith('Syne') or family.startswith('Manrope')):
        continue
    for weight in [400, 600, 700, 800]:
        face = ImageFont.truetype(str(file), 100)
        axes = face.get_variation_axes()
        values = [weight if b'Weight' in axis['name'] else axis['default'] for axis in axes]
        face.set_variation_by_axes(values)
        ascent, descent = face.getmetrics()
        ink = [{'text': word, 'baselineInkBounds': list(face.getbbox(word, anchor='ls'))} for word in words]
        maximum_bottom = max(item['baselineInkBounds'][3] for item in ink)
        records.append({'family': family, 'weight': weight, 'sizePx': 100, 'file': str(file), 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'ascentPx': ascent, 'descentPx': descent, 'phrases': ink, 'minimumLineBoxRatioForTheseInkBounds': (ascent-descent+2*maximum_bottom)/100})
assert len(records) == 8, 'Both cached Latin font files are required'
result = {'method': 'Pillow FreeType exact cached font metrics at explicit variation weights; read-only font inspection, no screenshot generation.', 'limitation': 'The line-box ratio uses rounded FreeType metrics and centered half-leading. It is a diagnostic estimate, not browser layout or proof that the browser loaded the face. Ancestor clipping, CSS transforms, fallback, hydration and actual pixel crops still need browser verification.', 'records': records}
directory.mkdir(parents=True, exist_ok=True)
(directory/'font-metrics.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
for record in records:
    print(record['family'], record['weight'], 'ascent/descent',record['ascentPx'],record['descentPx'],'sample minimum line ratio',record['minimumLineBoxRatioForTheseInkBounds'])
