import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadContent } from './load-content.mjs';
const { projectFilterHref } = loadContent('src/lib/project-filters.ts');
const { festivalAchievements, publicAchievementOutcomeCount } = loadContent('src/lib/achievement-records.ts');
const { experienceGroups } = loadContent('src/lib/portfolio.ts');
const results = [];
function check(name, test) { test(); results.push({name,status:'PASS'}); }
check('combined filters round-trip literal text, ampersands and local-looking input safely', () => {
  const url = new URL(projectFilterHref('IoT',' A&B <script> //evil.test ', 'Belum dipublikasikan'),'http://localhost');
  assert.equal(url.pathname,'/projects'); assert.equal(url.host,'localhost');
  assert.equal(url.searchParams.get('q'),'A&B <script> //evil.test');
  assert.equal(url.searchParams.get('category'),'IoT'); assert.equal(url.searchParams.get('status'),'Belum dipublikasikan');
});
check('reset omits empty/default values; trimmed search is bounded to 100 characters', () => {
  assert.equal(projectFilterHref('Semua','  ','Semua'),'/projects');
  assert.equal(new URL(projectFilterHref('Web','x'.repeat(200),'Online'),'http://localhost').searchParams.get('q').length,100);
});
check('new lab has exact approved duties, no invented period; PM remains withdrawn', () => {
  const labs = experienceGroups.flatMap(g=>g.items);
  const lab = labs.find(r=>r.id==='lab-automation-robotics-pvte');
  assert.equal(lab.role,'Asisten Lab Otomasi Cerdas dan Robotika'); assert.equal(lab.organization,'PVTE');
  assert.equal(lab.period,undefined); assert.match(lab.context,/Pengelolaan laboratorium/); assert.match(lab.context,/dukungan teknis/);
  assert.doesNotMatch(JSON.stringify(labs),/Project Manager|Lab Robotic/);
});
check('two ESF outcomes add no fabricated category, certificate URL, team or project', () => {
  assert.equal(publicAchievementOutcomeCount,9); assert.equal(festivalAchievements.length,1);
  const [event] = festivalAchievements;
  assert.deepEqual(Array.from(event.outcomes),['Juara 3','Finalis Top 10 Essay']);
  for (const field of ['category','certificate','source','team','projectSlug']) assert.equal(event[field],undefined);
});
check('the official brand font remains bundled, licensed and served locally', () => {
  const font = fs.readFileSync('src/app/fonts/Syne-Variable.ttf');
  assert.ok(font.includes(Buffer.from('ss04'))); assert.match(fs.readFileSync('src/app/fonts/OFL-Syne.txt','utf8'),/SIL OPEN FONT LICENSE/);
  assert.match(fs.readFileSync('src/app/globals.css','utf8'),/font-feature-settings:"ss04" 1/);
  assert.match(fs.readFileSync('src/app/layout.tsx','utf8'),/next\/font\/local/);
});
fs.writeFileSync(process.env.MHDRHN_QA_GLYPH_EVIDENCE || 'docs/execution/evidence/glyph-filter-content-2026-10-19/targeted-checks.json',JSON.stringify({results},null,2));
console.log(`${results.length} targeted regression checks passed.`);
