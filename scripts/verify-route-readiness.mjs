import { motionDependencies } from "./motion-test-support.mjs";
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const results=[];
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log(`PASS ${name}`);}
function load(file,globals={},dependencies={}){
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
 const exports={};vm.runInNewContext(code,{exports,...globals,require(id){if(id in dependencies)return dependencies[id];if(id==="@/i18n/LocaleProvider")return {useTranslation:()=>({locale:"id",t:value=>value})};if(id==="@/i18n/translate")return {translateTree:node=>node};throw Error(id);}},{timeout:1000});return exports;
}
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
function image({lazy=false,visible=true,complete=false}={}){const listeners=new Map();return {loading:lazy?'lazy':'eager',complete,hasAttribute(){return false;},getBoundingClientRect(){return {top:visible?100:2000,bottom:visible?300:2200,width:320};},addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name){listeners.delete(name);},emit(name){this.complete=true;listeners.get(name)?.();},listeners};}
function runtime(images=[]){const fonts=deferred(),frames=new Map(),timers=new Map(),main={dataset:{},querySelector(){return {textContent:"Heading"};},querySelectorAll(){return images;}};let n=0;
 const {awaitRouteAssets}=load('src/lib/route-readiness.ts',{document:{fonts:{load(){return fonts.promise;}}},getComputedStyle(){return {fontWeight:"700",fontSize:"64px",fontFamily:"Syne"};},setTimeout(fn,delay){const id=++n;timers.set(id,{fn,delay});return id;},clearTimeout(id){timers.delete(id);},window:{innerHeight:900},requestAnimationFrame(fn){frames.set(++n,fn);return n;},cancelAnimationFrame(id){frames.delete(id);}});
 const controller=new AbortController();const pending=awaitRouteAssets(main,controller.signal);
 return {fonts,frames,timers,main,pending,controller,async flush(){await new Promise(resolve=>setImmediate(resolve));for(let i=0;i<2;i++){const run=[...frames.values()];frames.clear();run.forEach(f=>f());}}};
}
await check('fonts and visible image both settle before two paint frames release',async()=>{
 const img=image(),t=runtime([img]);let ready=false;t.pending.then(()=>ready=true);t.fonts.resolve();await t.flush();assert.equal(ready,false);assert.equal(t.frames.size,0);img.emit('load');await t.flush();assert.equal(await t.pending,true);assert.equal(img.listeners.size,0);
});
await check('failed images settle instead of trapping the cover',async()=>{const img=image(),t=runtime([img]);img.emit('error');t.fonts.resolve();await t.flush();assert.equal(await t.pending,true);});
await check('offscreen lazy image does not block, visible lazy image does',async()=>{
 const off=image({lazy:true,visible:false}),visible=image({lazy:true}),t=runtime([off,visible]);assert.equal(off.listeners.size,0);assert.equal(visible.listeners.size,2);t.fonts.resolve();visible.emit('load');await t.flush();assert.equal(await t.pending,true);
});
await check('abort releases image listeners while a font or network is still pending',async()=>{
 const img=image(),t=runtime([img]);t.controller.abort();assert.equal(await t.pending,false);assert.equal(img.listeners.size,0);t.fonts.resolve();await t.flush();assert.equal(t.frames.size,0);
});
await check('abort after scheduling paint cancels RAF without stale readiness',async()=>{
 const t=runtime();t.fonts.resolve();await new Promise(resolve=>setImmediate(resolve));assert.equal(t.frames.size,1);t.controller.abort();assert.equal(await t.pending,false);assert.equal(t.frames.size,0);
});
await check('already-aborted requests resolve without resource listeners',async()=>{
 const {awaitRouteAssets}=load('src/lib/route-readiness.ts',{cancelAnimationFrame(){}});const c=new AbortController();c.abort();assert.equal(await awaitRouteAssets(null,c.signal),false);
});
await check('even eager images below the viewport are outside the critical barrier',async()=>{
 const off=image({visible:false}),t=runtime([off]);assert.equal(off.listeners.size,0);t.fonts.resolve();await t.flush();assert.equal(await t.pending,true);assert.equal(t.timers.size,0);
});
await check('visible decoded image waits for decode, including its rejection fallback',async()=>{
 for(const reject of [false,true]){const d=deferred(),img=image({complete:true});img.decode=()=>reject?Promise.reject(Error('decode')):d.promise;const t=runtime([img]);t.fonts.resolve();await t.flush();if(!reject){assert.equal(t.main.dataset.routeAssets,'pending');d.resolve();}await t.flush();assert.equal(await t.pending,true);assert.equal(t.main.dataset.routeAssets,'ready');}
});
await check('a hung font or image budget explicitly chooses shell fallback and releases listeners',async()=>{
 const img=image(),t=runtime([img]);const timer=[...t.timers.values()][0];assert.equal(timer.delay,1800);timer.fn();assert.equal(await t.pending,true);assert.equal(t.main.dataset.routeAssets,'fallback');assert.equal(img.listeners.size,0);assert.equal(t.timers.size,0);t.fonts.resolve();await t.flush();assert.equal(t.frames.size,0);
});
await check('abort while decode is pending rejects stale readiness and releases the budget timer',async()=>{
 const d=deferred(),img=image({complete:true});img.decode=()=>d.promise;const t=runtime([img]);t.controller.abort();assert.equal(await t.pending,false);assert.equal(t.timers.size,0);d.resolve();t.fonts.resolve();await t.flush();assert.equal(t.frames.size,0);
});
for(const reduced of [false,true])await check(`footer back-to-top focuses main and forwards ${reduced?'instant reduced motion':'smooth scrolling'} to the shared adapter`,()=>{
 let scrolled,focused;const jsx=(type,props)=>({type,props});const {BackToTop}=load('src/components/ui/BackToTop.tsx',{window:{matchMedia(){return {matches:reduced};}},document:{querySelector(){return {focus(value){focused=value;}};}}},{...motionDependencies({matches:reduced}),'@/lib/motion/smooth-scroll':{scrollToPosition(top,immediate){scrolled={top,immediate};}},'react/jsx-runtime':{jsx,jsxs:jsx},'lucide-react':{ArrowUp:'ArrowUp'}});
 BackToTop().props.onClick();assert.equal(scrolled.top,0);assert.equal(scrolled.immediate,reduced);assert.equal(focused.preventScroll,true);
});
const directory=process.env.MHDRHN_QA_READINESS_EVIDENCE || 'docs/execution/evidence/immersive-navigation-2026-10-19';fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(`${directory}/readiness-footer-checks.json`,JSON.stringify({method:'Actual source handlers with deterministic font/image/RAF/DOM doubles, not browser rendering.',results},null,2));
console.log(`${results.length} readiness and footer checks passed.`);
