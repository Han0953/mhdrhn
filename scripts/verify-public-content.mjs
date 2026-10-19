// Content invariants and regression checks. Uses the installed TS compiler; no test dependency.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const code = ts.transpileModule(fs.readFileSync('src/lib/content.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(code, sandbox, { timeout: 1000 });
const data = sandbox.exports;
let checks = 0;
function check(name, test) { test(); checks++; console.log(`PASS ${name}`); }
const projects = data.getPublishedProjects();
check('unique, canonical project slugs', () => {
  assert.equal(new Set(projects.map(p => p.slug)).size, projects.length);
  projects.forEach(p => assert.match(p.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/));
});
check('public records have context, summaries and honest limitations', () => {
  projects.forEach(p => ['title','summary','context','approach','limitation'].forEach(key => assert.ok(p[key]?.trim(), `${p.slug}: ${key}`)));
});
check('unknown and noncanonical slugs fail closed', () => {
  ['../DATA.md', '__proto__', 'Vircuit', 'vircuit/', 'zhy-ai', 'not-published'].forEach(slug => assert.equal(data.getProjectBySlug(slug), undefined));
});
check('outbound links use HTTPS without credentials', () => {
  [...projects.map(p => p.link).filter(Boolean), data.profile.github, ...data.achievements.map(a => a.source)].forEach(href => {
    const url = new URL(href); assert.equal(url.protocol, 'https:'); assert.equal(url.username, ''); assert.equal(url.password, '');
  });
});
check('featured order and award relations resolve', () => {
  const featured = data.getFeaturedProjects();
  assert.equal(new Set(featured.map(p => p.featured)).size, featured.length);
  assert.equal(featured[0].slug, 'vircuit');
  data.achievements.forEach(a => assert.ok(data.getProjectBySlug(a.projectSlug)));
});
check('search matches case-insensitively and respects combined filters', () => {
  assert.equal(data.filterProjects('Web', '  VIRCuit  ')[0].slug, 'vircuit');
  assert.equal(data.filterProjects('IoT', 'vircuit').length, 0);
  assert.equal(data.filterProjects('Research', '').length, 1);
  assert.equal(data.filterProjects('Semua', '<script>alert(1)</script>').length, 0);
});
check('two distinct incubators and one PVTE system', () => {
  assert.equal(projects.filter(p => p.slug.startsWith('iot-egg-incubator-')).length, 2);
  assert.equal(projects.filter(p => /pvte|himpteka/.test(p.slug)).length, 1);
  assert.equal(data.getProjectBySlug('iot-egg-incubator-blynk').year, undefined);
});
check('withdrawn and unconfirmed experience records stay out of public data', () => {
  assert.doesNotMatch(JSON.stringify(data.experiences), /Pranala|HyperOS|ASUS|Project Manager|Robotic|Robotika/i);
  assert.equal(data.profile.gpa, undefined); assert.equal(data.profile.currentSemester, undefined);
});
console.log(`${checks} content checks passed.`);
