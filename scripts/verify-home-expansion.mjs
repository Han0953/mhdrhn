import { motionDependencies } from "./motion-test-support.mjs";
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { loadContent } from './load-content.mjs';

const directory = process.env.MHDRHN_QA_HOME_EVIDENCE || 'docs/execution/evidence/home-expansion-2026-10-19';
fs.mkdirSync(directory, {recursive:true});
const results = [];
async function check(name, fn) { await fn(); results.push({name,status:'PASS'}); console.log(`PASS ${name}`); }
const home = loadContent('src/lib/home-content.ts');
const inventory = loadContent('src/lib/technology-inventory.ts');
await check('latest uses only known years, descending; no invented dates or duplicate identities',()=>{
  assert.equal(home.latestProjects.length,5);
  assert.deepEqual(Array.from(home.latestProjects,p=>p.slug),['vircuit','aura-pod','website-pvte-himpteka','iot-egg-incubator-research','website-lazismu-kuansing']);
  home.latestProjects.forEach((p,i,all)=>{assert.ok(p.year); if(i) assert.ok(all[i-1].year>=p.year);});
  assert.match(home.latestOrderingNote,/editorial/);
});
await check('electronics has five public domain records, no overlap; incubators stay distinct',()=>{
  assert.equal(home.electronicsProjects.length,5);
  for(const p of home.electronicsProjects){assert.ok(p.categories.some(c=>['IoT','Electronics','Embedded'].includes(c)));assert.ok(!home.latestProjects.some(q=>q.slug===p.slug));}
  assert.ok(home.electronicsProjects.some(p=>p.slug==='iot-egg-incubator-blynk'));
});
await check('five atomic outcomes preserve three event contexts; certificates use actual document titles',()=>{
  assert.equal(home.homeAchievements.length,5); assert.equal(new Set(home.homeAchievements.map(a=>a.event)).size,3);
  for(const a of home.homeAchievements) {assert.match(a.href,/^\/achievements#/);assert.match(a.source,/DATA/);}
  assert.equal(loadContent('src/lib/media.ts').certificates.length,3);
  for(const r of home.heroRoles) assert.match(r.source,/DATA/);
});
function compile(file, globals={}, dependencies={}) {
  const exports={}; const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(code,{exports,...globals,require(id){if(id in dependencies)return dependencies[id];throw new Error(id);}},{timeout:1000}); return exports;
}
function emitter(target={}) {const listeners=new Map();return Object.assign(target,{listeners,addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name,fn){assert.equal(listeners.get(name),fn);listeners.delete(name);}});}
function style(){return {setProperty(k,v){this[k]=v;},removeProperty(k){delete this[k];}};}
function storyRuntime() {
  let y=0, rafId=0;const frames=new Map(),observers=[];
  const reduced=emitter({matches:false}), desktop=emitter({matches:true});
  const browser=emitter({innerHeight:1000,get scrollY(){return y;},scrollTo({top}){y=top;},matchMedia(query){return query.includes('reduce')?reduced:desktop;}});
  const cards=Array.from({length:5},(_,i)=>({offsetLeft:20+i*980,offsetWidth:960,clientHeight:500,scrollHeight:500,contains(target){return target.card===i;}}));
  const track={scrollWidth:5000,style:style(),querySelectorAll(){return cards;}};
  const viewport={clientWidth:1000,clientHeight:700,scrollLeft:0,getBoundingClientRect(){return {left:0,right:1000};},scrollTo({left}){this.scrollLeft=left;}};
  const sticky={getBoundingClientRect(){return {height:700};}};
  const root=emitter({dataset:{view:'scroll'},style:style(),contains(){return true;},getBoundingClientRect(){return {top:1000-y,left:20};},querySelector(selector){return {'.story-sticky':sticky,'.story-overview':{getBoundingClientRect(){return {height:200};}},'.story-track':track,'.story-viewport':viewport}[selector];}});
  class Observer {constructor(fn){this.fn=fn;this.disconnected=false;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
  const {mountProjectStory}=compile('src/lib/project-story-motion.ts',{window:browser,document:{documentElement:{},fonts:{ready:Promise.resolve()}},getComputedStyle(){return {getPropertyValue(){return '80px';}};},ResizeObserver:Observer,MutationObserver:Observer,requestAnimationFrame(fn){frames.set(++rafId,fn);return rafId;},cancelAnimationFrame(id){frames.delete(id);}},motionDependencies(reduced));
  const cleanup=mountProjectStory(root);
  return {root,track,cards,viewport,browser,reduced,desktop,observers,frames,cleanup,setY(value){y=value;},get y(){return y;},flush(){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());}};
}
await check('viewport gutter and available screen height are measured; overflowing text falls back to native flow',()=>{
  const t=storyRuntime();assert.equal(t.root.style['--story-gutter'],'20px');assert.equal(t.root.style['--story-height'],'920px');
  t.cards[0].scrollHeight=600;t.browser.listeners.get('resize')();assert.equal(t.root.dataset.mode,'native');assert.equal(t.root.style.height,'');
  t.cards[0].clientHeight=800;t.cards[0].scrollHeight=800;t.browser.listeners.get('resize')();assert.equal(t.root.dataset.mode,'native');
  t.cleanup();assert.equal(t.root.style['--story-gutter'],undefined);assert.equal(t.root.style['--story-height'],undefined);
});
await check('sticky native scrolling maps start, midpoint and end with bounded transforms',()=>{
  const t=storyRuntime(); assert.equal(t.root.dataset.mode,'pinned');assert.equal(t.root.style.height,'4758px');
  for(const [y,x] of [[0,0],[3120,2000],[5040,3920],[9000,3920]]){t.setY(y);t.browser.listeners.get('scroll')();t.flush();assert.equal(t.track.style.transform,`translate3d(${-x}px,0,0)`);}
  t.cleanup();
});
await check('reduced motion and explicit list remove pin; mobile retains sequential horizontal storytelling',()=>{
  const t=storyRuntime();
  t.reduced.matches=true;t.reduced.listeners.get('change')();assert.equal(t.root.dataset.mode,'native');assert.equal(t.track.style.transform,'');
  t.reduced.matches=false;t.desktop.matches=false;t.desktop.listeners.get('change')();assert.equal(t.root.dataset.mode,'pinned');assert.equal(t.root.style['--story-top'],'-120px');
  t.browser.innerHeight=400;t.browser.listeners.get('resize')();assert.equal(t.root.dataset.mode,'native');
  t.browser.innerHeight=1000;t.browser.listeners.get('resize')();assert.equal(t.root.dataset.mode,'pinned');
  t.desktop.matches=true;t.root.dataset.view='list';t.observers[1].fn();assert.equal(t.root.dataset.mode,'native');
  t.root.dataset.view='scroll';t.observers[1].fn();assert.equal(t.root.dataset.mode,'pinned');t.cleanup();
});
await check('offscreen keyboard focus and direct selection reveal the requested card; short screens fall back',()=>{
  const t=storyRuntime();t.viewport.scrollLeft=500;
  t.root.listeners.get('focusin')({target:{card:4,getBoundingClientRect(){return {left:4080,right:4500};}}});
  assert.equal(t.y,5040);assert.equal(t.viewport.scrollLeft,0);
  t.root.listeners.get('click')({target:{closest(){return {dataset:{storyTarget:'0'}};}}});assert.equal(t.y,1120);
  t.browser.innerHeight=500;t.browser.listeners.get('resize')();assert.equal(t.root.dataset.mode,'native');
  t.root.listeners.get('click')({target:{closest(){return {dataset:{storyTarget:'3'}};}}});assert.equal(t.viewport.scrollLeft,2940);t.cleanup();
});
await check('mobile scroll finishes horizontal travel before releasing the section, with reversible bounds',()=>{
 const t=storyRuntime();t.desktop.matches=false;t.desktop.listeners.get('change')();
 for(const [y,x] of [[1000,0],[1120,0],[3120,2000],[5040,3920],[6000,3920],[3120,2000]]){t.setY(y);t.browser.listeners.get('scroll')();t.flush();assert.equal(t.track.style.transform,`translate3d(${-x}px,0,0)`);}
 t.root.listeners.get('click')({target:{closest(){return {dataset:{storyTarget:'4'}};}}});assert.equal(t.y,5040);t.cleanup();
});
await check('last-card geometry retains the trailing gutter even when scrollWidth under-reports flex overflow; laptop heights stay pinned',()=>{
 const t=storyRuntime();t.track.scrollWidth=3800;t.browser.innerHeight=720;t.browser.listeners.get('resize')();assert.equal(t.root.dataset.mode,'pinned');
 t.setY(5040);t.browser.listeners.get('scroll')();t.flush();assert.equal(t.track.style.transform,'translate3d(-3920px,0,0)');
 assert.equal(t.cards.at(-1).offsetLeft+t.cards.at(-1).offsetWidth-3920,t.viewport.clientWidth-20);
 assert.equal(Number.parseFloat(t.root.style.height)-700-3920,96);t.cleanup();
});
await check('twenty mount/unmount cycles release observers, listeners, RAF and pending fonts callbacks',async()=>{
  for(let i=0;i<20;i++){const t=storyRuntime();t.browser.listeners.get('scroll')();t.browser.listeners.get('resize')();t.cleanup();await Promise.resolve();assert.equal(t.frames.size,0);assert.equal(t.root.listeners.size+t.browser.listeners.size+t.reduced.listeners.size+t.desktop.listeners.size,0);assert.ok(t.observers.every(o=>o.disconnected));assert.equal(t.root.style.height,'');}
});

// Actual RotatingRoles hook lifecycle with deterministic timers, not a parallel implementation.
let cursor=0, serial=0;const slots=[],effects=[],intervals=new Map(),roleObservers=[];
const media=emitter({matches:false}), doc=emitter({hidden:false});
const react={useRef(value){const i=cursor++;return slots[i]??=( {current:value});},useState(value){const i=cursor++;slots[i]??={value};return [slots[i].value,next=>{slots[i].value=typeof next==='function'?next(slots[i].value):next;}];},useEffect(fn,deps){const i=cursor++;if(!slots[i]||deps.some((d,j)=>d!==slots[i].deps[j]))effects.push(()=>{slots[i]?.cleanup?.();slots[i]={deps,cleanup:fn()};});}};
const jsx=(type,props)=>({type,props});
class RoleObserver {constructor(fn){this.fn=fn;roleObservers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
const {RotatingRoles}=compile('src/components/sections/RotatingRoles.tsx',{window:{matchMedia(){return media;}},document:doc,IntersectionObserver:RoleObserver,setInterval(fn,delay){intervals.set(++serial,{fn,delay});return serial;},clearInterval(id){intervals.delete(id);}},{...motionDependencies(media),react,'react/jsx-runtime':{jsx,jsxs:jsx},'lucide-react':{Pause:'Pause',Play:'Play'}});
const roleElement=emitter({contains(target){return target===this;}});const roles=['First','Second','Third'];function render(){cursor=0;const tree=RotatingRoles({roles});tree.props.ref.current=roleElement;effects.splice(0).forEach(fn=>fn());return tree;}
await check('role advances at 3000ms with stable reserved labels and a non-live accessible summary',()=>{
  const tree=render();assert.equal(intervals.size,1);const timer=[...intervals.values()][0];assert.equal(timer.delay,3000);timer.fn();const updated=render();
  assert.equal(updated.props.children[1].props.children[1].props.className,'role-visible');assert.equal(tree.props.children[1].props['aria-hidden'],'true');assert.equal(tree.props.children[0].props['aria-live'],undefined);
});
await check('hover/focus, live reduced motion, hidden tab and offscreen visibility stop timers without a pause button',()=>{
 const tree=render();assert.equal(tree.props.children.some(child=>child?.type==='button'),false);roleElement.listeners.get('pointerenter')();assert.equal(intervals.size,0);roleElement.listeners.get('pointerleave')();assert.equal(intervals.size,1);roleElement.listeners.get('focusin')();assert.equal(intervals.size,0);roleElement.listeners.get('focusout')({relatedTarget:null});assert.equal(intervals.size,1);
  media.matches=true;media.listeners.get('change')();assert.equal(intervals.size,0);media.matches=false;media.listeners.get('change')();assert.equal(intervals.size,1);
  doc.hidden=true;doc.listeners.get('visibilitychange')();assert.equal(intervals.size,0);doc.hidden=false;doc.listeners.get('visibilitychange')();
  roleObservers.at(-1).fn([{isIntersecting:false}]);assert.equal(intervals.size,0);roleObservers.at(-1).fn([{isIntersecting:true}]);assert.equal(intervals.size,1);
  slots.forEach(s=>s?.cleanup?.());assert.equal(intervals.size,0);assert.equal(media.listeners.size+doc.listeners.size+roleElement.listeners.size,0);assert.ok(roleObservers.every(o=>o.disconnected));
});
const origin=process.env.MHDRHN_QA_ORIGIN;
if(origin){
  assert.ok(['127.0.0.1','localhost'].includes(new URL(origin).hostname));
  const response=await fetch(origin);assert.equal(response.status,200);const html=(await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  await check('SSR includes 10 project identities, the curated technology preview, five outcomes and named certificate disclosures',()=>{
    assert.equal((html.match(/data-project-slug=/g)||[]).length,10);assert.equal((html.match(/data-technology=/g)||[]).length,inventory.homeTechnologyGroups.flatMap(g=>g.items).length);assert.equal((html.match(/data-home-achievement=/g)||[]).length,5);assert.equal((html.match(/data-certificate-category=/g)||[]).length,0);
    for(const p of [...home.latestProjects,...home.electronicsProjects])assert.ok(html.includes(`/projects/${p.slug}`));
    for(const text of ['Learning','AI Ready ASEAN','Siswa Tersertifikasi Gemini','Google Fill &amp; Feel Festival'])assert.ok(html.includes(text));
    assert.doesNotMatch(html,/belum ada dokumen yang dapat ditampilkan/);
    assert.doesNotMatch(html,/Team Stack/);
    assert.ok(html.includes(home.projectSectionIntros.latest));assert.ok(html.includes(home.projectSectionIntros.electronics));
    assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.doesNotMatch(html,/AWS Certified|credential ID|Sertifikat terverifikasi/);
  });
  await check('project and achievement Home internal links and hashes have real destinations; technologies are informational',async()=>{
    const links=[...html.matchAll(/href="(\/(?:about|projects|achievements|lab)[^"]*)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
    const cache=new Map();for(const link of new Set(links)){const [path,hash]=link.split('#');if(!cache.has(path)){const r=await fetch(origin+path);assert.equal(r.status,200,path);cache.set(path,await r.text());}if(hash)assert.ok(cache.get(path).includes(`id="${hash}"`),link);}
  });
}
fs.writeFileSync(`${directory}/home-checks.json`,JSON.stringify({origin:origin??null,method:'Public source reconciliation, actual controllers with deterministic hook/DOM/timer doubles, plus HTTP/SSR when supplied. Browser evidence separate.',results},null,2));
console.log(`${results.length} Home expansion checks passed.`);
