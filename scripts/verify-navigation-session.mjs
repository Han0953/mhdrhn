import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadMotion } from './motion-test-support.mjs';
import { loadContent } from './load-content.mjs';
const results=[];
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log(`PASS ${name}`);}
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
const flush=()=>new Promise(r=>setImmediate(r));
const projects=loadContent().getPublishedProjects().map(({slug,title})=>({slug,title}));
function runtime({enabled=true,throws=false,animate=true}={}){
 let serial=0,url='http://local/',allow=enabled,session;const timers=new Map(),animations=[],pushes=[],prefetches=[],fallbacks=[],assets=[],ends=[];
 const globals={URL,URLSearchParams,AbortController,setTimeout(fn,delay){const id=++serial;timers.set(id,{fn,delay});return id;},clearTimeout(id){timers.delete(id);}};
 const {createRouteWipe}=loadMotion('src/lib/route-motion.ts',globals),{createRouteSession}=loadMotion('src/lib/route-session.ts',globals);
 const title={},status={},layer={dataset:{},style:{},parentElement:{dataset:{},setAttribute(){}},querySelector(s){return s==='.route-title'?title:status;}};
 if(animate)layer.animate=(frames,options)=>{const a={frames,options,cancel(){this.cancelled=true;}};animations.push(a);return a;};
 const wipe=createRouteWipe(()=>layer,()=>false,(active,completed)=>{if(!active){const request=session?.complete();if(request)ends.push({request,completed});}});
 session=createRouteSession({wipe,projects,location:()=>url,enabled:()=>allow&&animate,
  navigate(href,options){if(throws)throw Error('router failed');pushes.push({href,options});url=new URL(href,url).href;},fallback:href=>fallbacks.push(href),prefetch:href=>prefetches.push(href),captureFocus:()=>null,begin(){},
  assets(signal){const d=deferred();assets.push({...d,signal});return d.promise;},
 });
 return {session,wipe,layer,title,timers,animations,pushes,prefetches,fallbacks,assets,ends,
  setURL(value){url=new URL(value,url).href;},setEnabled(value){allow=value;},finish(){animations.at(-1)?.onfinish?.();},
 };
}
await check('URL normalization preserves object arrays/encoding while local query/hash/external links stay native',()=>{
 const {resolveInternalHref}=loadMotion('src/lib/navigation.ts',{URL,URLSearchParams});
 const u=resolveInternalHref({pathname:'/projects',query:{q:'a b',category:['IoT','Web']}},'http://local/about');assert.equal(u.pathname,'/projects');assert.equal(u.searchParams.get('q'),'a b');assert.equal(u.searchParams.getAll('category').length,2);
 for(const href of ['/about?q=x','#education','/projects#x','https://elsewhere.test/','mailto:x@y.test',{host:'elsewhere.test',pathname:'/'}])assert.equal(resolveInternalHref(href,'http://local/about'),null);
});
await check('every adjacent project uses the same order as previous/next and exact destination names',()=>{
 const nav=loadMotion('src/lib/navigation.ts');for(let i=1;i<projects.length;i++){
  const from=`/projects/${projects[i-1].slug}`,to=`/projects/${projects[i].slug}`;
  assert.equal(nav.resolveNavigation(from,to,projects).direction,1);assert.equal(nav.resolveNavigation(to,from,projects).direction,-1);assert.equal(nav.navigationLabel(to,projects),projects[i].title);
 }
});
await check('one router handoff only after full cover; cached readiness adds no artificial hold',async()=>{
 const t=runtime();assert.equal(t.session.intent('/about'),true);assert.equal(t.pushes.length,0);assert.equal(t.layer.dataset.phase,'entering');t.session.committed('/about');assert.equal(t.assets.length,0);
 t.finish();assert.equal(t.pushes.length,1);assert.equal(t.layer.dataset.phase,'holding');t.session.committed('/about');t.assets[0].resolve(true);await flush();assert.equal(t.layer.dataset.phase,'leaving');t.finish();assert.equal(t.layer.dataset.phase,'idle');assert.equal(t.timers.size,0);assert.equal(t.ends[0].completed,true);
});
await check('twenty superseding covering intents reject stale cover callbacks and issue only the latest',()=>{
 const t=runtime();t.session.intent('/about');const stale=t.animations[0].onfinish;
 for(let i=0;i<20;i++)t.session.intent(i%2?'/contact':'/projects');stale();assert.equal(t.pushes.length,0);t.finish();assert.equal(t.pushes.length,1);assert.equal(t.pushes[0].href,'/contact');assert.equal(t.title.textContent,'Contact');t.session.dispose();assert.equal(t.timers.size,0);
});
await check('superseded asset completion cannot reveal a later transaction',async()=>{
 const t=runtime();t.session.intent('/about');t.finish();t.session.committed('/about');const old=t.assets[0];t.session.intent('/contact');assert.equal(old.signal.aborted,true);t.finish();t.session.committed('/contact');old.resolve(true);await flush();assert.equal(t.layer.dataset.phase,'holding');t.assets[1].resolve(true);await flush();assert.equal(t.layer.dataset.phase,'leaving');t.finish();
});
await check('object href, replace, scroll=false and disabled prefetch survive the deferred handoff',()=>{
 const t=runtime();t.session.intent({pathname:'/projects',query:{q:'ESP32'}},{replace:true,scroll:false,prefetch:false});assert.equal(t.prefetches.length,0);t.finish();assert.equal(t.pushes[0].href,'/projects?q=ESP32');assert.equal(t.pushes[0].options.replace,true);assert.equal(t.pushes[0].options.scroll,false);t.session.dispose();
});
await check('query/hash/external/same URL and unknown root never create a full-page transaction',()=>{
 const t=runtime();for(const href of ['/?q=a','/#x','https://elsewhere.test/about','/','/missing'])assert.equal(t.session.intent(href),false);assert.equal(t.pushes.length,0);assert.equal(t.animations.length,0);
});
await check('history follows the actual URL, never pushes again and retains its history marker',async()=>{
 const t=runtime();t.setURL('/projects/vircuit');t.session.history('/about');assert.equal(t.layer.dataset.navigation,'history');t.finish();assert.equal(t.pushes.length,0);t.session.committed('/projects/vircuit');t.assets[0].resolve(true);await flush();t.finish();assert.equal(t.ends[0].request.history,true);
});
await check('stale path markers are ignored; actual committed redirect cancels rather than falsely completing',()=>{
 const t=runtime();t.session.intent('/about');t.finish();t.session.committed('/projects');assert.equal(t.session.current().path,'/about');t.setURL('/contact');t.session.committed('/contact');assert.equal(t.layer.dataset.phase,'idle');assert.equal(t.ends[0].completed,false);assert.equal(t.assets.length,0);
});
await check('Escape before handoff cancels navigation; after handoff it only releases the visual wait',()=>{
 const t=runtime();t.session.intent('/about');const old=t.animations[0].onfinish;t.session.cancel();old();assert.equal(t.pushes.length,0);assert.equal(t.session.current(),null);
 t.session.intent('/contact');t.finish();t.session.cancel();assert.equal(t.pushes.length,1);assert.equal(t.layer.dataset.phase,'idle');assert.equal(t.session.current(),null);
});
await check('live Minimal/hidden skip preserves the accepted navigation once and removes blocking cover',()=>{
 const t=runtime();t.session.intent('/about');t.session.skip();assert.equal(t.pushes.length,1);assert.equal(t.layer.dataset.phase,'idle');t.session.skip();assert.equal(t.pushes.length,1);assert.equal(t.timers.size,0);
});
await check('reduced motion and missing WAAPI leave Link native without a static red hold',()=>{
 for(const options of [{enabled:false},{animate:false}]){const t=runtime(options);assert.equal(t.session.intent('/about'),false);assert.equal(t.animations.length,0);assert.equal(t.pushes.length,0);assert.equal(t.session.current(),null);}
});
await check('router exceptions release resources and use native navigation fallback',()=>{
 const t=runtime({throws:true});t.session.intent('/about');t.finish();assert.equal(t.fallbacks[0],'/about');assert.equal(t.layer.dataset.phase,'idle');assert.equal(t.timers.size,0);
});
await check('destination error-ready releases recovery immediately, without waiting for images',()=>{
 const t=runtime();t.session.intent('/projects/invalid');t.finish();t.session.committed('/projects/invalid',true);assert.equal(t.assets.length,0);assert.equal(t.layer.dataset.phase,'leaving');t.finish();assert.equal(t.ends[0].completed,true);
});
await check('feedback and recovery thresholds never pretend that network readiness happened',()=>{
 const t=runtime();t.session.intent('/about');t.finish();[...t.timers.values()].find(x=>x.delay===1500).fn();assert.equal(t.layer.dataset.pending,'true');[...t.timers.values()].find(x=>x.delay===8000).fn();assert.equal(t.layer.dataset.stalled,'true');assert.equal(t.layer.dataset.phase,'holding');t.session.dispose();
});
await check('twenty lifetimes dispose pending assets, animations, feedback and watchdogs',async()=>{
 for(let i=0;i<20;i++){const t=runtime();t.session.intent('/about');t.finish();t.session.committed('/about');t.session.dispose();assert.equal(t.assets[0].signal.aborted,true);assert.equal(t.timers.size,0);assert.equal(t.animations.filter(a=>!a.cancelled).length,0);t.assets[0].resolve(true);await flush();assert.equal(t.layer.dataset.phase,'idle');assert.equal(t.session.intent('/contact'),false);}
});
const directory=process.env.MHDRHN_QA_SESSION_EVIDENCE||'docs/execution/evidence/p2-b-2026-10-21';fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(`${directory}/navigation-session-checks.json`,JSON.stringify({method:'Real TypeScript route/session controllers with deterministic router/WAAPI/assets/URL/timer doubles, not network/browser emulation.',results},null,2));
console.log(`${results.length} navigation session checks passed.`);
