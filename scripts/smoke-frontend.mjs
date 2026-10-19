import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.env.MHDRHN_QA_ORIGIN || 'http://127.0.0.1:3000';
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname), 'Smoke checks only run against a local server.');
const checks = [
  ['/', 200, 'Muhammad'], ['/about', 200, 'kemungkinan'], ['/projects', 200, 'Selected'],
  ['/experience', 200, 'bertumbuh'], ['/lab', 200, 'layak dicoba'], ['/achievements', 200, 'Hasil bersama'],
  ['/contact', 200, 'collaborate'], ['/projects/vircuit', 200, 'Vircuit'], ['/projects/aura-pod', 200, 'AURA POD'],
  ['/projects/website-pvte-himpteka', 200, 'PVTE'], ['/projects/iot-egg-incubator-research', 200, 'MQTT'],
  ['/projects/iot-egg-incubator-blynk', 200, 'Blynk'], ['/projects/website-lazismu-kuansing', 200, 'LAZISMU'],
  ['/projects/private-unpublished-project', 404, 'tidak'], ['/route-does-not-exist', 404, 'tidak'],
  ['/projects?category=Research', 200, 'MQTT'], ['/projects?q=not-an-existing-project', 200, 'Belum ada yang cocok'],
];
(async () => {
  const results = [];
  for (const [path, expected, text] of checks) {
    const response = await fetch(base + path);
    const html = await response.text();
    assert.equal(response.status, expected, path);
    assert.ok(html.includes(text), `${path}: missing visible content`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path}: H1 count`);
    assert.doesNotMatch(html, /Cum Laude|Pranala Institute|ASUS ROG UI|Xiaomi HyperOS/);
    assert.match(html, /noindex/);
    results.push({ path, status: response.status, h1: 1, publicSubset: true });
  }
  fs.writeFileSync('docs/execution/evidence/frontend-redesign/http-smoke.json', JSON.stringify(results, null, 2));
  console.log(`${results.length} HTTP/SSR route checks passed; includes two actual HTTP 404 responses.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
