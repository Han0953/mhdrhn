import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const results = [];
function check(name, test) { test(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
function load(path, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const sandbox = { exports: {}, ...globals };
  vm.runInNewContext(code, sandbox, { timeout: 1000 });
  return sandbox.exports;
}

const navigation = load('src/lib/navigation.ts');
check('42 directions follow the single navbar order', () => {
  assert.equal(navigation.navigation.length, 7);
  navigation.navigation.forEach((from, i) => navigation.navigation.forEach((to, j) => {
    assert.equal(navigation.resolveNavigation(from.href, to.href).direction, Math.sign(j - i));
  }));
});
check('project nesting has detail, return and peer semantics', () => {
  assert.equal(navigation.resolveNavigation('/projects', '/projects/vircuit').direction, 1);
  assert.equal(navigation.resolveNavigation('/projects/vircuit', '/projects').direction, -1);
  assert.equal(navigation.resolveNavigation('/projects/vircuit', '/about').direction, 1);
  assert.equal(navigation.resolveNavigation('/projects/vircuit', '/projects/aura-pod').kind, 'peer');
  assert.equal(navigation.resolveNavigation('/projects/vircuit', '/projects/aura-pod').direction, 0);
});
check('same path, queries, hashes and unknown groups never invent a tab', () => {
  assert.equal(navigation.resolveNavigation('/projects?q=a', '/projects?q=b').direction, 0);
  assert.equal(navigation.resolveNavigation('/about/', '/about#education').kind, 'none');
  assert.equal(navigation.getNavigationIndex('/projects-other'), -1);
  assert.equal(navigation.resolveNavigation('/missing', '/contact').direction, 0);
});

let reduced = false;
let serial = 0;
const timers = new Map();
const animations = [];
const layer = {
  dataset: {},
  animate(frames, options) {
    const animation = { frames, options, onfinish: null, cancelled: false, cancel() { this.cancelled = true; } };
    animations.push(animation); return animation;
  },
};
const { createRouteWipe } = load('src/lib/route-motion.ts', {
  setTimeout(callback, delay) { const id = ++serial; timers.set(id, { callback, delay }); return id; },
  clearTimeout(id) { timers.delete(id); },
});
const wipe = createRouteWipe(() => layer, () => reduced);
check('right and left wipes mirror keyframes, remain bounded, and mark their direction', () => {
  wipe.play(1); const right = animations.at(-1);
  assert.equal(right.frames[0].transform, 'translateX(101%)');
  assert.equal(right.frames[2].transform, 'translateX(-101%)');
  assert.equal(layer.dataset.direction, 'right'); assert.equal(right.options.duration, 360);
  wipe.play(-1); const left = animations.at(-1);
  assert.equal(right.cancelled, true); assert.equal(left.frames[0].transform, 'translateX(-101%)');
  assert.equal(layer.dataset.direction, 'left'); assert.equal(timers.size, 1);
});
check('100 rapid requests keep exactly one animation and watchdog', () => {
  for (let i = 0; i < 100; i++) wipe.play(i % 2 ? 1 : -1);
  assert.equal(animations.filter(animation => !animation.cancelled).length, 1);
  assert.equal(timers.size, 1);
});
check('normal completion releases owned animation and timer', () => {
  animations.at(-1).onfinish();
  assert.equal(animations.filter(animation => !animation.cancelled).length, 0);
  assert.equal(timers.size, 0);
});
check('watchdog clears a missing finish callback within 600ms', () => {
  wipe.play(1);
  const watchdog = [...timers.values()][0]; assert.equal(watchdog.delay, 600);
  watchdog.callback(); assert.equal(timers.size, 0); assert.equal(animations.at(-1).cancelled, true);
});
check('history mirrors direction with a shorter, nonblocking 260ms duration', () => {
  wipe.play(-1, true); assert.equal(layer.dataset.navigation, 'history');
  assert.equal(animations.at(-1).options.duration, 260); wipe.clear();
});
check('live reduced-motion cancellation and unmount cleanup leave zero owned resources', () => {
  wipe.play(1); reduced = true; wipe.clear();
  assert.equal(wipe.play(-1), false); assert.equal(timers.size, 0);
  assert.equal(animations.filter(animation => !animation.cancelled).length, 0);
  reduced = false;
  for (let i = 0; i < 20; i++) { wipe.play(1); wipe.clear(); }
  assert.equal(timers.size, 0);
  assert.equal(animations.filter(animation => !animation.cancelled).length, 0);
});
check('missing or throwing animation APIs fall back without throwing or timers', () => {
  assert.equal(createRouteWipe(() => null, () => false).play(1), false);
  assert.equal(createRouteWipe(() => ({}), () => false).play(1), false);
  assert.equal(createRouteWipe(() => ({ dataset: {}, animate() { throw new Error('unavailable'); } }), () => false).play(1), false);
  assert.equal(timers.size, 0);
});
check('no transition for a zero-direction request', () => {
  const count = animations.length; assert.equal(wipe.play(0), false);
  assert.equal(animations.length, count); assert.equal(timers.size, 0);
});

const origin = process.env.MHDRHN_QA_ORIGIN;
if (origin) {
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname));
  const response = await fetch(origin);
  const html = await response.text();
  check('Home SSR delivers nine ordered, readable sections and one H1', () => {
    assert.equal(response.status, 200);
    const sections = [...html.matchAll(/<section\b[^>]*data-home-section="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(sections, ['hero','introduction','technology','latest-projects','electronics-projects','experience','recognition','certificates','closing']);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    ['Creative Engineering.', 'Sense', 'Compute', 'Build', 'Velotow', 'ALGA NOVA', 'Trio Hengker Enjoyer', 'PVTE + HIMPTEKA'].forEach(text => assert.ok(html.includes(text), text));
  });
  check('two five-project collections, five focus domains, team awards and separate incubators', () => {
    assert.equal((html.match(/data-project-slug=/g) || []).length, 10);
    assert.ok(html.includes('/projects/website-pvte-himpteka'));
    assert.ok(html.includes('Mobile Application Testing / QA'));
    assert.ok(html.includes('/projects/iot-egg-incubator-blynk'));
    assert.ok(html.includes('/projects/iot-egg-incubator-research'));
    assert.doesNotMatch(html, /Pranala Institute|ASUS ROG UI|Xiaomi HyperOS|Project Manager|Lab Robotic/);
  });
  check('theme trigger is available in SSR while closed options are inert', () => {
    assert.match(html, /aria-label="Pilihan tema"[^>]*aria-expanded="false"/);
    assert.match(html, /id="theme-options"[^>]*aria-hidden="true"[^>]*inert=""/);
  });
}
const evidence = process.env.MHDRHN_QA_REFINEMENT_EVIDENCE || 'docs/execution/evidence/refinement-2026-10-19/automated-checks.json';
fs.mkdirSync(evidence.slice(0, evidence.lastIndexOf('/')), { recursive: true });
fs.writeFileSync(evidence, JSON.stringify({ origin: origin || null, results, note: 'Controller tests use deterministic DOM/timer doubles. They are not a browser heap measurement.' }, null, 2));
console.log(`${results.length} refinement checks passed.${origin ? ' Includes actual HTTP/SSR.' : ' HTTP/SSR not run without MHDRHN_QA_ORIGIN.'}`);
