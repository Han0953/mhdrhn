import assert from 'node:assert/strict';
import vm from 'node:vm';
import {loadMotion} from './motion-test-support.mjs';
const {visitIntroScript}=loadMotion('src/lib/motion/visit-intro.ts');
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
function fixture({type='navigate',referrer='',theme='light',darkSystem=false,minimal=false,reduced=false,blocked=false,io=true}={}){
 const timers=new Map(),events=new Map(),domEvents=new Map(),mediaEvents=new Map(),dataset={};let clock=0,id=0;
 const media={matches:reduced,addEventListener:(name,fn)=>mediaEvents.set(name,fn),removeEventListener:name=>mediaEvents.delete(name)};
 const window={addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name),matchMedia:q=>q.includes('reduced')?media:{matches:darkSystem}};
 const document={documentElement:{dataset},referrer,readyState:'loading',addEventListener:(name,fn)=>domEvents.set(name,fn),removeEventListener:name=>domEvents.delete(name)};
 const globals={window,document,performance:{getEntriesByType:()=>type?[{type}]:[]},URL,location:{origin:'https://portfolio.test'},IntersectionObserver:io?class{}:undefined,localStorage:{getItem(key){if(blocked)throw Error('blocked');return key==='theme'?theme:minimal?'minimal':null;}},setTimeout(fn,ms){const next=++id;timers.set(next,{at:clock+ms,fn});return next;},clearTimeout:id=>timers.delete(id)};
 const run=()=>vm.runInNewContext(visitIntroScript,globals);
 function advance(ms){const end=clock+ms;while(true){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;timers.delete(next[0]);clock=next[1].at;next[1].fn();}clock=end;}
 function parsed(){const fn=domEvents.get('DOMContentLoaded');domEvents.delete('DOMContentLoaded');fn?.();}
 run();return{dataset,timers,events,mediaEvents,domEvents,media,run,advance,parsed,fire:(name,value={})=>events.get(name)?.(value)};
}
function clean(f){assert.equal(f.timers.size,0);assert.equal(f.events.size,0);assert.equal(f.mediaEvents.size,0);assert.equal(f.domEvents.size,0);}
check('new address entry and external search entry qualify without a storage dependency',()=>{for(const options of [{},{referrer:'https://www.google.com/search?q=rehan'},{blocked:true}]){const f=fixture(options);assert.equal(f.dataset.visitIntro,'active');f.fire('pagehide');clean(f);}});
check('refresh, history, internal full navigation and unknown navigation bypass intro',()=>{for(const options of [{type:'reload'},{type:'back_forward'},{type:null},{referrer:'https://portfolio.test/about'}]){const f=fixture(options);assert.equal(f.dataset.visitIntro,'skipped');clean(f);}});
check('Minimal, reduced motion and unsupported enhancement bypass without timers',()=>{for(const options of [{minimal:true},{reduced:true},{io:false}]){const f=fixture(options);assert.equal(f.dataset.visitIntro,'skipped');clean(f);}});
check('intro uses the opposite of saved light/dark and resolved System theme',()=>{for(const [options,tone] of [[{theme:'light'},'dark'],[{theme:'dark'},'light'],[{theme:'system',darkSystem:true},'light'],[{theme:'system',darkSystem:false},'dark']]){const f=fixture(options);assert.equal(f.dataset.visitIntroTone,tone);f.fire('pagehide');clean(f);}});
check('page ready early still waits four seconds and completes the stagger before releasing',()=>{const f=fixture();f.parsed();f.fire('mhdrhn:motion-staged');f.advance(3999);assert.equal(f.dataset.visitIntro,'active');f.advance(1);assert.equal(f.dataset.visitIntro,'leaving');f.advance(2099);assert.equal(f.dataset.visitIntro,'leaving');f.advance(1);assert.equal(f.dataset.visitIntro,'done');clean(f);});
check('slow hydration holds the full-progress screen until page staging then exits',()=>{const f=fixture();f.parsed();f.advance(5500);assert.equal(f.dataset.visitIntro,'active');f.fire('mhdrhn:motion-staged');assert.equal(f.dataset.visitIntro,'leaving');f.advance(2100);assert.equal(f.dataset.visitIntro,'done');clean(f);});
check('missing readiness has a finite fail-open watchdog',()=>{const f=fixture();f.advance(10000);assert.equal(f.dataset.visitIntro,'done');clean(f);});
check('Escape/Tab, page departure, BFCache restore and live reduced preference release all resources',()=>{for(const [event,value] of [['keydown',{key:'Escape'}],['keydown',{key:'Tab'}],['pagehide',{}],['pageshow',{persisted:true}]]){const f=fixture();f.fire(event,value);assert.equal(f.dataset.visitIntro,'done');clean(f);}const f=fixture();f.media.matches=true;f.mediaEvents.get('change')();assert.equal(f.dataset.visitIntro,'done');clean(f);});
check('document bootstrap is idempotent and cannot replay after locale/layout rerenders',()=>{const f=fixture();const count=f.timers.size;f.run();assert.equal(f.timers.size,count);f.fire('pagehide');f.run();assert.equal(f.dataset.visitIntro,'done');clean(f);});
console.log(`${checks} visit-intro checks passed.`);
