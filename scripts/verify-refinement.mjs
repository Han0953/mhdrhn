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

let reduced=false,serial=0;
const timers=new Map(),animations=[],releases=[];
const title={},status={};
const layer={dataset:{},style:{},parentElement:{dataset:{},setAttribute(){}},querySelector(selector){return selector==='.route-title'?title:status;},animate(frames,options){const a={frames,options,onfinish:null,cancelled:false,cancel(){this.cancelled=true;}};animations.push(a);return a;}};
const {createRouteWipe}=load('src/lib/route-motion.ts',{setTimeout(callback,delay){const id=++serial;timers.set(id,{callback,delay});return id;},clearTimeout(id){timers.delete(id);}});
const wipe=createRouteWipe(()=>layer,()=>reduced,(active,completed)=>releases.push({active,completed}));
check('entry mirrors direction and destination title; real pending holds solid red',()=>{
 wipe.play(1,false,'About');assert.equal(title.textContent,'About');assert.equal(animations.at(-1).frames[0].transform,'translateX(101%)');
 animations.at(-1).onfinish();assert.equal(layer.dataset.phase,'holding');assert.equal(layer.style.transform,'translateX(0)');assert.equal(timers.size,1);
 const stall=[...timers.values()][0];assert.equal(stall.delay,12000);stall.callback();assert.equal(layer.dataset.stalled,'true');assert.equal(layer.dataset.phase,'holding');
});
check('only destination ready reveals; stale completion cannot reveal next route',()=>{
 const old=wipe.play(-1,false,'Home');animations.at(-1).onfinish();
 const latest=wipe.play(1,false,'Contact');animations.at(-1).onfinish();wipe.ready(old);assert.equal(layer.dataset.phase,'holding');
 wipe.ready(latest);assert.equal(layer.dataset.phase,'leaving');assert.equal(animations.at(-1).frames[1].transform,'translateX(-101%)');animations.at(-1).onfinish();
 assert.equal(layer.dataset.phase,'idle');assert.equal(timers.size,0);assert.equal(releases.at(-1).completed,true);
});
check('fast readiness still reaches full cover before exiting',()=>{
 const id=wipe.play(-1);wipe.ready(id);assert.equal(layer.dataset.phase,'entering');animations.at(-1).onfinish();assert.equal(layer.dataset.phase,'leaving');
 assert.equal(animations.at(-1).frames[0].transform,'translateX(0)');assert.equal(animations.at(-1).frames[1].transform,'translateX(101%)');animations.at(-1).onfinish();
});
check('100 rapid requests own one animation and two timers, cancellation releases all',()=>{
 for(let i=0;i<100;i++)wipe.play(i%2?1:-1);assert.equal(animations.filter(a=>!a.cancelled).length,1);assert.equal(timers.size,2);wipe.clear();assert.equal(timers.size,0);assert.equal(releases.at(-1).completed,false);
});
check('a queued callback from a superseded exit cannot clear the new cover',()=>{
 const old=wipe.play(1);animations.at(-1).onfinish();wipe.ready(old);const stale=animations.at(-1).onfinish;
 wipe.play(-1,false,'Home');stale();assert.equal(layer.dataset.phase,'entering');assert.equal(title.textContent,'Home');wipe.clear();
});
check('missing animation finish watchdog enters holding instead of revealing unloaded content',()=>{
 const id=wipe.play(1);[...timers.values()].find(t=>t.delay===340).callback();assert.equal(layer.dataset.phase,'holding');wipe.ready(id);[...timers.values()].find(t=>t.delay===340).callback();assert.equal(layer.dataset.phase,'idle');assert.equal(timers.size,0);
});
check('history has mirrored 160ms entry and normal readiness semantics',()=>{
 const id=wipe.play(-1,true,'Home');assert.equal(layer.dataset.navigation,'history');assert.equal(animations.at(-1).options.duration,160);animations.at(-1).onfinish();wipe.ready(id);animations.at(-1).onfinish();
});
check('reduced motion uses a static cover, waits for ready, and live preference cancels movement',()=>{
 reduced=true;const count=animations.length,id=wipe.play(1);assert.equal(animations.length,count);assert.equal(layer.dataset.phase,'holding');wipe.ready(id);assert.equal(layer.dataset.phase,'idle');
 reduced=false;wipe.play(1);reduced=true;wipe.preferenceChanged();assert.equal(layer.dataset.phase,'holding');assert.equal(animations.at(-1).cancelled,true);wipe.clear();reduced=false;assert.equal(timers.size,0);
});
check('unavailable or throwing animation API holds a static cover until ready',()=>{
 assert.equal(createRouteWipe(()=>null,()=>false).play(1),false);
 for(const mode of ['missing','throw']){const fallback={...layer,dataset:{},animate:mode==='missing'?undefined:()=>{throw Error('unavailable');}};const w=createRouteWipe(()=>fallback,()=>false);const id=w.play(1);assert.equal(fallback.dataset.phase,'holding');w.ready(id);assert.equal(fallback.dataset.phase,'idle');}assert.equal(timers.size,0);
});
check('unmount and zero-direction requests leave no animation or timer',()=>{
 assert.equal(wipe.play(0),false);for(let i=0;i<20;i++){wipe.play(1);wipe.clear();}assert.equal(timers.size,0);assert.equal(animations.filter(a=>!a.cancelled).length,0);
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
