import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {loadMotion} from './motion-test-support.mjs';
const results=[];
function check(name,fn){fn();results.push({name,status:'PASS'});console.log('PASS '+name);}
function fixture({minimal=false,reduced=false,io=true,blockedStorage=false}={}){
 const dataset={},timers=new Map(),events=new Map();let next=0;
 const document={documentElement:{dataset,hasAttribute:()=>dataset.motionStartup!==undefined}};
 const window={matchMedia:()=>({matches:reduced}),addEventListener(name,fn){events.set(name,fn);},removeEventListener(name){events.delete(name);},dispatchEvent(event){events.get(event.type)?.(event);}};
 const globals={document,window,Event,IntersectionObserver:io?class{}:undefined,localStorage:{getItem(){if(blockedStorage)throw Error('blocked');return minimal?'minimal':null;}},setTimeout(fn,delay){const id=++next;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id)};
 const mod=loadMotion('src/lib/motion/startup.ts',globals);
 const run=()=>vm.runInNewContext(mod.motionStartupScript,globals);
 return{...mod,run,document,window,events,timers,dataset,fire(name){events.get(name)?.();},expire(){[...timers.values()].forEach(t=>t.fn());}};
}
check('parser-time script enables CSS entrance immediately, with no global visibility gate',()=>{const f=fixture();assert.equal(f.dataset.motionStartup,undefined);f.run();assert.equal(f.dataset.motionStartup,'pending');assert.ok(f.motionStartupStyle.includes('@keyframes mhdrhn-startup-in'));assert.ok(!f.motionStartupStyle.includes('visibility:hidden'));assert.equal([...f.timers.values()][0].delay,5000);f.releaseMotionStartup({closest:()=>null});assert.equal(f.dataset.motionStartup,'pending');f.releaseMotionStartup({closest:()=>({})});assert.equal(f.dataset.motionStartup,'ready');assert.equal(f.timers.size,0);assert.equal(f.events.size,0);f.expire();assert.equal(f.dataset.motionStartup,'ready');});
check('no JavaScript leaves no gate; Minimal, OS reduction and missing IO skip it',()=>{const noJs=fixture();assert.equal(noJs.dataset.motionStartup,undefined);for(const options of [{minimal:true},{reduced:true},{io:false}]){const f=fixture(options);f.run();assert.equal(f.dataset.motionStartup,'skipped');assert.equal(f.timers.size,0);assert.equal(f.events.size,0);}});
check('blocked storage still works; watchdog opens content and late scripts cannot re-arm it',()=>{const f=fixture({blockedStorage:true});f.run();assert.equal(f.dataset.motionStartup,'pending');f.expire();assert.equal(f.dataset.motionStartup,'fallback');assert.equal(f.motionStartupFailed(),true);assert.equal(f.events.size,0);assert.equal(f.timers.size,0);f.releaseMotionStartup({closest:()=>({})});f.run();assert.equal(f.dataset.motionStartup,'fallback');assert.equal(f.timers.size,0);});
check('keyboard, wheel, touch and page hide fail open without retaining listeners',()=>{for(const event of ['keydown','wheel','touchstart','pagehide']){const f=fixture();f.run();f.fire(event);assert.equal(f.dataset.motionStartup,'fallback');assert.equal(f.events.size,0);assert.equal(f.timers.size,0);}});
check('touch and wheel against the visit intro preserve the pending entrance; pagehide still cleans up',()=>{const f=fixture();f.dataset.visitIntro='active';f.run();for(const type of ['wheel','touchstart','keydown'])f.events.get(type)({type});assert.equal(f.dataset.motionStartup,'pending');f.dataset.visitIntro='leaving';f.events.get('wheel')({type:'wheel'});assert.equal(f.dataset.motionStartup,'pending');f.events.get('pagehide')({type:'pagehide'});assert.equal(f.dataset.motionStartup,'fallback');assert.equal(f.events.size,0);assert.equal(f.timers.size,0);});
check('twenty documents release all bootstrap timers/listeners after staging',()=>{for(let i=0;i<20;i++){const f=fixture();f.run();f.releaseMotionStartup({closest:()=>({})});assert.equal(f.timers.size,0);assert.equal(f.events.size,0);}});
check('locale cleanup of html attributes cannot arm the initial-document gate again',()=>{const f=fixture();f.run();f.releaseMotionStartup({closest:()=>({})});delete f.dataset.motionStartup;f.run();assert.equal(f.dataset.motionStartup,undefined);assert.equal(f.timers.size,0);assert.equal(f.events.size,0);});
const layout=fs.readFileSync('src/app/[locale]/layout.tsx','utf8');
{
 let resolves=[],completed=0,stale=0;
 const animations=[];
 const node={dataset:{},getAnimations:()=>animations};
 const mod=loadMotion('src/lib/motion/startup.ts',{getComputedStyle:()=>({animationName:'mhdrhn-startup-in'})});
 const animation=()=>({animationName:'mhdrhn-startup-in',currentTime:340,finished:new Promise(resolve=>resolves.push(resolve)),finish(){this.currentTime=1350;}});
 animations.push(animation());
 check('hydration and Strict Mode remount claim a running CSS entrance without resetting its playback position',()=>{assert.equal(mod.claimStartupReveal(node,()=>stale++),true);assert.equal(mod.claimStartupReveal(node,()=>completed++),true);assert.equal(animations[0].currentTime,340);assert.equal(node.dataset.startupReveal,'owned');assert.equal(stale,0);});
 mod.settleStartupReveal(node);assert.equal(node.dataset.startupReveal,'done');assert.equal(completed,1);
 resolves.forEach(resolve=>resolve());await Promise.resolve();await Promise.resolve();
 check('completion, cleanup and remount do not replay the initial CSS entrance',()=>{assert.equal(completed,1);assert.equal(mod.claimStartupReveal(node,()=>completed++),true);assert.equal(node.dataset.startupReveal,'done');assert.equal(completed,1);});
}
check('critical entrance CSS and bootstrap are emitted in head before body, outside locale-translated content',()=>{assert.ok(layout.indexOf('id="mhdrhn-motion-startup-style"')>layout.indexOf('<head>'));assert.ok(layout.indexOf('id="mhdrhn-motion-startup-style"')<layout.indexOf('<StartupBootstrap'));assert.ok(layout.indexOf('<StartupBootstrap')<layout.indexOf('<body>'));});
fs.mkdirSync('docs/execution/evidence/motion-startup-2026-10-25',{recursive:true});fs.writeFileSync('docs/execution/evidence/motion-startup-2026-10-25/bootstrap-checks.json',JSON.stringify({method:'Actual parser-time script and module with explicit document/event/clock doubles; not browser paint evidence.',results},null,2));console.log(results.length+' startup checks passed.');
