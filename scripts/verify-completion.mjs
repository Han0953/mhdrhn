import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadContent } from './load-content.mjs';
const data = loadContent();
const portfolio = loadContent('src/lib/portfolio.ts');
const projects = data.getPublishedProjects();
const results = [];
function check(name, test) { test(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
check('all 22 retained project identities are unique with provenance', () => {
  assert.equal(projects.length, 22);
  assert.equal(new Set(projects.map(p => p.slug)).size, projects.length);
  projects.forEach(p => assert.match(p.source, /DATA §/));
  ['air-quality-monitoring','smart-home-iot','industrial-machine-safety','drone-stm32','zhy-ai','mhdrhn-portfolio','academic-information-dashboard'].forEach(slug => assert.ok(data.getProjectBySlug(slug), slug));
});
check('archive notes do not promote REVIEW hardware, role, dates or completion status', () => {
  projects.filter(p => p.format === 'summary' && p.slug !== 'mhdrhn-portfolio').forEach(p => {
    assert.equal(p.role, undefined); assert.equal(p.year, undefined); assert.equal(p.status, undefined); assert.equal(p.link, undefined); assert.equal(p.technologies.length, 0);
  });
  assert.equal(data.getProjectBySlug('mhdrhn-portfolio').status, 'Dalam pengembangan');
  assert.equal(data.getProjectBySlug('website-pvte-himpteka').status, 'Online');
});
check('category, search and public-status filters intersect without inventing Completed', () => {
  assert.equal(data.filterProjects('Web', '', 'Online').length, 1);
  assert.equal(data.filterProjects('IoT', '', 'Online').length, 0);
  assert.equal(data.filterProjects('Web', 'MHDRHN', 'Dalam pengembangan')[0].slug, 'mhdrhn-portfolio');
  assert.equal(data.filterProjects('Semua', '', 'Belum dipublikasikan').length, 20);
  assert.equal(data.filterProjects('Semua', '<script>alert(1)</script>').length, 0);
});
check('ten experience IDs preserve known periods; new approved lab has no invented date', () => {
  const records = portfolio.experienceGroups.flatMap(g => g.items);
  assert.equal(records.length, 10); assert.equal(portfolio.experienceGroups.length, 4);
  assert.equal(new Set(records.map(r => r.id)).size, 10);
  records.forEach(r => { if (r.id !== 'lab-automation-robotics-pvte') assert.ok(r.period); assert.match(r.source, /DATA §/); });
  assert.equal(records.find(r => r.id === 'lab-automation-robotics-pvte').period, undefined);
  assert.equal(records.find(r => r.id === 'e2id-vii-2026').period, '2026');
  assert.equal(records.find(r => r.id === 'himpteka-vice-2025').role, 'Wakil Bupati');
});
check('eight competency groups preserve Learning and related project validity', () => {
  assert.equal(portfolio.skillGroups.length, 8);
  const mobile = portfolio.skillGroups.find(g => g.id === 'mobile');
  ['Flutter','Firebase'].forEach(name => assert.equal(mobile.skills.find(s => s.name === name).learning, true));
  portfolio.skillGroups.filter(g => g.projectSlug).forEach(g => assert.ok(data.getProjectBySlug(g.projectSlug)));
});
check('research and community service keep canonical relationships and never claim published validation', () => {
  assert.equal(portfolio.research.length, 2); assert.equal(portfolio.communityService.length, 2);
  assert.equal(portfolio.research.find(r => r.id === 'research-mqtt-2026').projectSlug, 'iot-egg-incubator-research');
  const telehealth = portfolio.research.find(r => r.id === 'research-telehealth-2026');
  assert.equal(telehealth.projectSlug, undefined); assert.equal(telehealth.role, undefined); assert.match(telehealth.note, /hasil validasi belum tersedia/); assert.match(telehealth.note, /Belum ada tautan publikasi ilmiah/);
  assert.equal(portfolio.communityService.find(r => r.id === 'pkm-lazismu-2024').projectSlug, 'website-lazismu-kuansing');
});
check('public payload excludes held/retracted and temporal personal fields', () => {
  assert.doesNotMatch(JSON.stringify({ ...data, portfolio }), /Pranala|HyperOS|ASUS ROG|Project Manager|Lab Robotic|Economic and Social Festival|Cum Laude|MQ135|DHT11/);
});
check('related projects are bounded, resolve and never self-reference', () => {
  projects.forEach(p => { const related = data.getRelatedProjects(p); assert.ok(related.length <= 2); related.forEach(r => { assert.notEqual(r.slug, p.slug); assert.ok(data.getProjectBySlug(r.slug)); }); });
});
const origin = process.env.MHDRHN_QA_ORIGIN;
if (origin) {
  assert.ok(['127.0.0.1','localhost','[::1]'].includes(new URL(origin).hostname));
  for (const project of projects) {
    const response = await fetch(`${origin}/projects/${project.slug}`);
    const html = await response.text();
    check(`HTTP/SSR public project ${project.slug}`, () => { assert.equal(response.status, 200); assert.equal((html.match(/<h1\b/g)||[]).length, 1); assert.ok(html.includes(project.title.replaceAll('&', '&amp;'))); assert.match(html, /Salin tautan proyek/); assert.doesNotMatch(html, /Project Manager|Pranala Institute|ASUS ROG UI|Xiaomi HyperOS/); });
  }
  for (const [path, expected, absent] of [
    ['/about', ['Learning','Photography','Firebase','STM32','IPK','3.85','/4.00','Nilai rata-rata','/100','S1 Pendidikan Vokasional Teknik Elektronika'], ['semester 5']],
    ['/lab', ['Heart Rate','Oxygen Saturation','Bukit Payung','LAZISMU'], ['Project Manager']],
    ['/experience?category=mobile-testing', ['Velotow','War Thunder Mobile','Modern Warships'], ['HIMPTEKA UMRI','E2ID VII']],
    ['/projects?status=Online', ['1 proyek ditemukan','PVTE + HIMPTEKA','Hapus semua filter'], ['<h3><a href="/projects/vircuit"']],
    ['/projects?category=IoT&status=Online', ['0 proyek ditemukan','Proyek tidak ditemukan'], []],
  ]) {
    const response = await fetch(origin + path), html = (await response.text()).replace(/<!--[\s\S]*?-->/g, '');
    check(`HTTP/SSR content and query ${path}`, () => { assert.equal(response.status, 200); expected.forEach(text => assert.ok(html.includes(text), text)); absent.forEach(text => assert.ok(!html.includes(text), text)); });
  }
}
fs.writeFileSync(process.env.MHDRHN_QA_COMPLETION_EVIDENCE || 'docs/execution/evidence/completion-2026-10-19/completion-checks.json', JSON.stringify({ origin: origin || null, results }, null, 2));
console.log(`${results.length} completion checks passed.`);
