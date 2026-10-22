import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMotion} from './motion-test-support.mjs';
const results=[];
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log(`PASS ${name}`);}
function emitter(target={}){const events=new Map();return Object.assign(target,{events,addEventListener(k,f){if(!events.has(k))events.set(k,new Set());events.get(k).add(f);},removeEventListener(k,f){events.get(k)?.delete(f);},emit(k,e){for(const f of events.get(k)||[])f(e);},count(){return [...events.values()].reduce((n,s)=>n+s.size,0);}});}
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function fixture({profile='about',reduced=false,io=true,loader}={}){
 const timers=new Map(),frames=new Map(),observers=[],animations=[];let serial=0;
 const media=emitter({matches:reduced}),cover={dataset:{}};
 const document=emitter({hidden:false,activeElement:null,documentElement:{dataset:{}},querySelector(){return cover;}});
 const window=emitter({innerWidth:390,matchMedia:()=>media,localStorage:{getItem:()=>null}});
 const nodes=[];
 function node(kind='h2') {const n={kind,dataset:{},isConnected:true,rects:true,blocked:false,child:{},matches(selector){return selector.split(',').some(s=>s===kind);},getClientRects(){return this.rects?[{}]:[];},closest(){return this.blocked?{}:null;},contains(child){return child===this||child===this.child;},querySelectorAll(){return [this];},animate(keyframes,options){const a={keyframes,options,cancelled:false,cancel(){this.cancelled=true;}};animations.push(a);return a;}};nodes.push(n);return n;}
 const root=emitter({querySelectorAll:()=>nodes});
 class IO {constructor(fn){this.fn=fn;this.observed=new Set();observers.push(this);}observe(n){this.observed.add(n);}unobserve(n){this.observed.delete(n);}disconnect(){this.disconnected=true;this.observed.clear();}}
 class MO {constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
 const globals={window,document,IntersectionObserver:io?IO:undefined,MutationObserver:MO,setTimeout(fn,delay){const id=++serial;timers.set(id,{fn,delay});return id;},clearTimeout(id){timers.delete(id);},requestAnimationFrame(fn){const id=++serial;frames.set(id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);}};
 const choreography=loadMotion('src/lib/motion/choreography.ts',globals);
 node();
 const cleanup=choreography.mountPageMotion(root,profile,loader);
 return {root,nodes,node,window,document,media,cover,timers,frames,observers,animations,cleanup,choreography,
   async visible(n=nodes[0]){observers[0].fn([{isIntersecting:true,target:n}]);await flush();},
   async release(){delete cover.dataset.active;observers.at(-1).fn();await flush();},
   tick(){const pending=[...timers.values()];timers.clear();pending.forEach(t=>t.fn());},
   mutation(){observers[io?1:0].fn();const pending=[...frames.values()];frames.clear();pending.forEach(f=>f());},
 };
}
await check('each visible beat runs once, with a small mobile displacement and no opacity-zero start',async()=>{
 const t=fixture();await t.visible();assert.equal(t.animations.length,1);assert.equal(t.animations[0].keyframes[0].opacity,.72);assert.match(t.animations[0].keyframes[0].transform,/12px/);await t.visible();assert.equal(t.animations.length,1);t.tick();assert.equal(t.nodes[0].dataset.motionBeat,undefined);assert.equal(t.animations[0].cancelled,true);t.cleanup();
});
await check('a covered route queues the beat and waits for cover release before touching content',async()=>{
 const t=fixture();t.cover.dataset.active='true';t.nodes[0].blocked=true;await t.visible();assert.equal(t.animations.length,0);t.nodes[0].blocked=false;await t.release();assert.equal(t.animations.length,1);t.cleanup();
});
await check('Minimal, hidden documents and missing IntersectionObserver leave visible content static',async()=>{
 const t=fixture({reduced:true});await t.visible();assert.equal(t.animations.length,0);t.cleanup();
 const h=fixture();h.document.hidden=true;await h.visible();assert.equal(h.animations.length,0);h.document.hidden=false;h.document.emit('visibilitychange');await flush();assert.equal(h.animations.length,1);h.cleanup();
 const n=fixture({io:false});assert.equal(n.animations.length,0);n.cleanup();
});
await check('switching preference or hiding the tab cancels active animation and clears watchdogs',async()=>{
 for(const hidden of [false,true]){const t=fixture();await t.visible();if(hidden){t.document.hidden=true;t.document.emit('visibilitychange');}else{t.media.matches=true;t.media.emit('change');}assert.equal(t.animations[0].cancelled,true);assert.equal(t.timers.size,0);assert.equal(t.nodes[0].dataset.motionBeat,undefined);t.cleanup();}
});
await check('keyboard focus settles a moving group immediately and an already focused heading never moves',async()=>{
 const t=fixture();await t.visible();t.root.emit('focusin',{target:t.nodes[0].child});assert.equal(t.animations[0].cancelled,true);t.cleanup();
 const f=fixture();f.document.activeElement=f.nodes[0];await f.visible();assert.equal(f.animations.length,0);f.cleanup();
});
await check('new query-result DOM gets a local short beat without replaying existing headings',async()=>{
 const t=fixture({profile:'projects'});await t.visible();const node=t.node('.catalog-results');t.mutation();await t.visible(node);assert.equal(t.animations.length,2);assert.equal(t.animations.at(-1).options.duration,140);await t.visible(t.nodes[0]);assert.equal(t.animations.length,2);t.cleanup();
});
await check('detached and closed-disclosure targets are not animated',async()=>{
 const t=fixture();t.nodes[0].isConnected=false;await t.visible();assert.equal(t.animations.length,0);t.nodes[0].isConnected=true;t.nodes[0].blocked=true;await t.visible();assert.equal(t.animations.length,0);t.cleanup();
});
await check('Home lazily shares one GSAP loader across beats, without loading it on other pages',async()=>{
 let loads=0,plays=0;const loader=async()=>{loads++;return()=>{plays++;return()=>{};};};
 const t=fixture({profile:'home',loader});await t.visible();const node=t.node('h3');t.mutation();await t.visible(node);assert.equal(loads,1);assert.equal(plays,2);t.cleanup();
 const a=fixture({loader});await a.visible();assert.equal(loads,1);a.cleanup();
});
await check('Home import failure falls back to native movement instead of hiding server HTML',async()=>{
 const t=fixture({profile:'home',loader:async()=>{throw Error('offline chunk');}});await t.visible();assert.equal(t.animations.length,1);t.cleanup();
});
await check('a late engine import cannot start work after unmount, preference change or hidden-tab cancellation',async()=>{
 for(const cancel of ['unmount','preference','hidden']){let resolve,plays=0;const t=fixture({profile:'home',loader:()=>new Promise(r=>{resolve=r;})});await t.visible();if(cancel==='unmount')t.cleanup();else if(cancel==='hidden'){t.document.hidden=true;t.document.emit('visibilitychange');}else{t.media.matches=true;t.media.emit('change');}resolve(()=>{plays++;return()=>{};});await flush();assert.equal(plays,0);if(cancel!=='unmount')t.cleanup();}
});
await check('missing or throwing WAAPI and sequence failure do not leave an active beat',async()=>{
 for(const mode of ['missing','throwing']){const t=fixture();t.nodes[0].animate=mode==='missing'?undefined:()=>{throw Error('WAAPI');};await t.visible();assert.equal(t.nodes[0].dataset.motionBeat,undefined);assert.equal(t.timers.size,0);t.cleanup();}
 const t=fixture({profile:'home',loader:async()=>()=>{throw Error('engine');}});await t.visible();assert.equal(t.nodes[0].dataset.motionBeat,undefined);t.cleanup();
});
await check('twenty page lifetimes release observers, pending RAF, subscriptions, animations and timers',async()=>{
 for(let i=0;i<20;i++){const t=fixture();await t.visible();t.observers[1].fn();t.cleanup();assert.equal(t.frames.size+t.timers.size+t.root.count()+t.window.count()+t.document.count()+t.media.count(),0);assert.ok(t.observers.every(o=>o.disconnected));assert.ok(t.animations.every(a=>a.cancelled));}
});
const directory=process.env.MHDRHN_QA_CHOREOGRAPHY_EVIDENCE||'docs/execution/evidence/p2-cd-2026-10-22';fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(`${directory}/page-choreography-checks.json`,JSON.stringify({method:'Real TypeScript page controller and native sequence with explicit DOM/IO/engine/timer doubles. Not a frame benchmark or browser rendering test.',results},null,2));
console.log(`${results.length} page choreography checks passed.`);
