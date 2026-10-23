import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
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
  assert.equal(lab.period,undefined); assert.match(lab.context,/pengelolaan laboratorium/i); assert.match(lab.context,/dukungan teknis/);
  assert.doesNotMatch(JSON.stringify(labs),/Project Manager|Lab Robotic/);
});
check('two ESF outcomes add no fabricated category, certificate URL, team or project', () => {
  assert.equal(publicAchievementOutcomeCount,9); assert.equal(festivalAchievements.length,1);
  const [event] = festivalAchievements;
  assert.deepEqual(Array.from(event.outcomes),['Juara 3','Finalis Top 10 Essay']);
  for (const field of ['category','certificate','source','team','projectSlug']) assert.equal(event[field],undefined);
});
check('the official brand font remains bundled, licensed and served locally', () => {
  const font = fs.readFileSync('src/app/fonts/ClashDisplay-Semibold.woff2');
  assert.equal(font.toString('ascii',0,4),'wOF2');
  assert.equal(createHash('sha256').update(font).digest('hex'),'e748ea11c49f39ae2375dce4fbda8dc971c5ca8b64ac8a838b5daba96f61a10a');
  assert.match(fs.readFileSync('src/app/fonts/ITF-FFL-ClashDisplay.txt','utf8'),/You may self-host the Font Software/);
  const layout=fs.readFileSync('src/app/layout.tsx','utf8');
  assert.match(layout,/next\/font\/local/);
  assert.match(layout,/ClashDisplay-Semibold\.woff2/);
  assert.match(layout,/weight: "600"/);
});
fs.writeFileSync(process.env.MHDRHN_QA_GLYPH_EVIDENCE || 'docs/execution/evidence/glyph-filter-content-2026-10-19/targeted-checks.json',JSON.stringify({results},null,2));
console.log(`${results.length} targeted regression checks passed.`);
