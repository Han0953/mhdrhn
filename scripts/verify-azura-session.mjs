import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadMotion } from './motion-test-support.mjs';
const results = [];
function check(name, fn) { fn(); results.push({ name, status:'PASS' }); console.log('PASS '+name); }
function emitter(initial={}) {
  const listeners = new Map();
  return Object.assign(initial, {addEventListener(k,fn){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(fn);},removeEventListener(k,fn){listeners.get(k)?.delete(fn);},emit(k,event={}){listeners.get(k)?.forEach(fn=>fn(event));},count(){return [...listeners.values()].reduce((n,set)=>n+set.size,0);}});
}
function fixture() {
  let now=1000000, raw=null, blocked=false, seq=0;
  const timers=new Map(),frames=new Map();
  const storage={getItem(){if(blocked)throw Error('blocked');return raw;},setItem(k,v){if(blocked)throw Error('blocked');raw=v;},removeItem(){if(blocked)throw Error('blocked');raw=null;}};
  const viewport=emitter({height:700,offsetTop:0});
  const window=emitter({localStorage:storage,visualViewport:viewport,innerHeight:700});
  const document=emitter({hidden:false});
  const globals={window,document,Date:{now:()=>now},setTimeout(fn,delay){const id=++seq;timers.set(id,{fn,delay});return id;},clearTimeout(id){timers.delete(id);},requestAnimationFrame(fn){const id=++seq;frames.set(id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);}};
  const {createChatHistory,decodeHistory,CHAT_TTL,CHAT_CACHE_KEY}=loadMotion('src/lib/azura/history.ts',globals);
  return {window,document,viewport,timers,frames,create:()=>createChatHistory(),decodeHistory,CHAT_TTL,CHAT_CACHE_KEY,globals,get raw(){return raw;},seed(v){raw=v;},block(){blocked=true;},advance(ms){now+=ms;},tick(){const list=[...timers.values()];timers.clear();list.forEach(t=>t.fn());},flush(){const list=[...frames.values()];frames.clear();list.forEach(fn=>fn());}};
}
const message=(id=1)=>({id,question:'Tentang Rehan',reply:{text:'Local',href:'/about',label:'About'},ready:false});
check('SSR snapshot is stable and does not access browser storage',()=>{const f=fixture(),s=f.create();assert.equal(s.getSnapshot(),s.getServerSnapshot());assert.equal(s.getServerSnapshot().length,0);});
check('refresh restores the actual AI answer without replaying its reveal',()=>{const f=fixture(),a=f.create();const off=a.subscribe(()=>{});a.append(message());a.finish(1,{text:'Actual provider answer'});const saved=JSON.parse(f.raw);assert.equal(saved.expiresAt,1000000+f.CHAT_TTL);assert.equal(saved.messages[0].reply.text,'Actual provider answer');assert.equal(saved.messages[0].animate,undefined);off();const b=f.create(),end=b.subscribe(()=>{});assert.equal(b.getSnapshot()[0].question,'Tentang Rehan');assert.equal(b.getSnapshot()[0].ready,true);assert.equal(b.getSnapshot()[0].reply.text,'Actual provider answer');assert.equal(b.getSnapshot()[0].animate,undefined);end();});
check('refresh and finishing typing do not extend the one-hour expiry',()=>{const f=fixture(),a=f.create(),off=a.subscribe(()=>{});a.append(message());const expires=JSON.parse(f.raw).expiresAt;a.finish(1);off();f.advance(200000);const b=f.create(),end=b.subscribe(()=>{});assert.equal(JSON.parse(f.raw).expiresAt,expires);assert.equal([...f.timers.values()][0].delay,f.CHAT_TTL-200000);end();});
check('new question renews activity expiry; expiration clears memory and saved chat',()=>{const f=fixture(),s=f.create(),off=s.subscribe(()=>{});s.append(message());f.advance(1000);s.append(message(2));assert.equal(JSON.parse(f.raw).expiresAt,1001000+f.CHAT_TTL);f.advance(f.CHAT_TTL);f.tick();assert.equal(s.getSnapshot().length,0);assert.equal(f.raw,null);off();});
check('reset removes cache; later typing completion cannot recreate messages',()=>{const f=fixture(),s=f.create(),off=s.subscribe(()=>{});s.append(message());s.reset();s.finish(1);assert.equal(s.getSnapshot().length,0);assert.equal(f.raw,null);assert.equal(f.timers.size,0);off();});
check('invalid, expired, oversized, duplicate and unexpected cache payloads are rejected',()=>{const f=fixture();const base={version:1,expiresAt:1001000,questions:[{id:1,question:'Hi'}]};for(const value of ['bad','null',JSON.stringify({...base,version:2}),JSON.stringify({...base,expiresAt:1000000}),JSON.stringify({...base,expiresAt:1000001+f.CHAT_TTL}),JSON.stringify({...base,questions:[base.questions[0],base.questions[0]]}),JSON.stringify({...base,questions:[{id:1,question:'x'.repeat(501)}]}),'x'.repeat(60001)])assert.equal(f.decodeHistory(value,1000000),null);});
check('storage denied still permits send, typing completion and reset',()=>{const f=fixture();f.block();const s=f.create(),off=s.subscribe(()=>{});s.append(message());s.finish(1);assert.equal(s.getSnapshot()[0].ready,true);s.reset();assert.equal(s.getSnapshot().length,0);off();});
check('cross-tab reset and visibility expiry update the active chat',()=>{const f=fixture(),s=f.create(),off=s.subscribe(()=>{});s.append(message());f.seed(null);f.window.emit('storage',{key:f.CHAT_CACHE_KEY});assert.equal(s.getSnapshot().length,0);s.append(message(2));f.advance(f.CHAT_TTL);f.document.emit('visibilitychange');assert.equal(s.getSnapshot().length,0);off();});
check('twenty subscription cycles release listeners and timers',()=>{const f=fixture(),s=f.create();for(let i=0;i<20;i++){const off=s.subscribe(()=>{});s.append(message(i));off();assert.equal(f.window.count(),0);assert.equal(f.document.count(),0);assert.equal(f.timers.size,0);s.reset();}});
check('visible keyboard viewport sets panel height/top and coalesces changes',()=>{const f=fixture(),{mountChatViewport}=loadMotion('src/lib/azura/viewport.ts',f.globals),props={};const d={dataset:{},style:{setProperty:(k,v)=>props[k]=v}};const off=mountChatViewport(d);assert.equal(props['--chat-viewport-height'],'700px');f.viewport.height=340;f.viewport.offsetTop=25;f.viewport.emit('resize');f.viewport.emit('scroll');assert.equal(f.frames.size,1);f.flush();assert.equal(props['--chat-viewport-height'],'340px');assert.equal(props['--chat-viewport-top'],'25px');assert.equal(d.dataset.keyboard,'true');off();assert.equal(f.viewport.count(),0);assert.equal(f.window.count(),0);assert.equal(f.frames.size,0);});
check('missing visualViewport uses window dimensions and cleans queued resize',()=>{const f=fixture();delete f.window.visualViewport;const {mountChatViewport}=loadMotion('src/lib/azura/viewport.ts',f.globals),props={};const off=mountChatViewport({dataset:{},style:{setProperty:(k,v)=>props[k]=v}});assert.equal(props['--chat-viewport-height'],'700px');f.window.emit('resize');off();assert.equal(f.frames.size,0);});
function morphFixture() {
  const f=fixture(),media=emitter({matches:false}),animations=[];
  f.window.matchMedia=()=>media;f.document.documentElement={dataset:{}};
  let visual={transform:'none',opacity:'1'};
  const panel={getBoundingClientRect:()=>({left:10,top:20,width:400,height:600}),animate(frames,options){const a={frames,options,cancel(){this.cancelled=true;},onfinish:null,oncancel:null};animations.push(a);return a;}};
  const dialog=emitter({dataset:{},open:false,querySelector:()=>panel,querySelectorAll:()=>[],showModal(){this.open=true;},close(){this.open=false;this.emit('close');}});
  const {mountDialog}=loadMotion('src/lib/motion/dialog.ts',{...f.globals,getComputedStyle:()=>visual});
  const controller=mountDialog(dialog,false,()=>({getBoundingClientRect:()=>({left:350,top:640,width:40,height:40})}));
  return {...f,controller,dialog,animations,visual(v){visual=v;},finish(){animations.at(-1).onfinish?.();}};
}
check('chat preserves its 520ms entrance and shrinks back over 560ms before native close',()=>{const f=morphFixture();f.controller.open();assert.equal(f.animations[0].options.duration,520);assert.match(f.animations[0].frames[0].transform,/translate\(160px,340px\) scale\(0.1,0.066/);assert.equal(f.animations[0].frames[1].transform,'none');f.finish();f.controller.close();assert.equal(f.animations.at(-1).options.duration,560);assert.equal(f.animations.at(-1).options.easing,'cubic-bezier(.2,.8,.2,1)');assert.equal(f.dialog.open,true);assert.equal(f.animations.at(-1).frames[1].opacity,0);assert.match(f.animations.at(-1).frames[1].transform,/scale\(0.1,/);f.finish();assert.equal(f.dialog.open,false);f.controller.dispose();assert.equal(f.timers.size,0);});
check('interrupted chat entrance snapshots current transform instead of jumping full size',()=>{const f=morphFixture();f.controller.open();f.visual({transform:'matrix(.5,0,0,.5,80,170)',opacity:'.5'});f.controller.close();assert.equal(f.animations.at(-1).frames[0].transform,'matrix(.5,0,0,.5,80,170)');assert.equal(f.animations.at(-1).frames[0].opacity,'.5');const stale=f.animations.at(-1).onfinish;f.controller.open();stale();assert.equal(f.dialog.open,true);f.controller.dispose();});
const dir='docs/execution/evidence/azura-refinement-2026-10-23';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/session-checks.json`,JSON.stringify({method:'Real TypeScript store/viewport/dialog modules with deterministic clock, storage, WAAPI and viewport doubles. Not a physical keyboard or touch rendering test.',results},null,2));
console.log(`${results.length} checks passed.`);
