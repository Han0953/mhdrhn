import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the component's real setup/cleanup with explicit React/DOM doubles.
// Browser QA separately measures actual paint visibility and WebGL buffer order.
const timers=new Map(),frames=new Map(),layouts=[],passives=[],states=[];
let active=false,locale='id',next=0,disposals=0,created=0;
class Node extends EventTarget{dataset={};children=[];prepend(child){this.children=[child];}}
const canvas=new Node();
const controller={state:()=>({selected:2,expanded:true}),attach(host){host.prepend(canvas);},dispose(){disposals++;}};
const exports={};
const compiled=ts.transpileModule(fs.readFileSync('src/components/sections/HeroSignal3D.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function jsx(type,props){const node=new Node();for(const [key,value]of Object.entries(props??{}))if(key.startsWith('data-'))node.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;if(props?.ref)props.ref.current=node;return {type,props,node};}
vm.runInNewContext(compiled,{exports,AbortController,Event,queueMicrotask,
 document:{querySelector:()=>null},window:new EventTarget(),
 setTimeout(fn){timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id),
 requestAnimationFrame(fn){frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id),
 require(id){
  if(id==='react')return{useRef:()=>({current:null}),useState(value){const slot={value};states.push(slot);return[value,next=>slot.value=next];},useLayoutEffect:fn=>layouts.push(fn),useEffect:fn=>passives.push(fn)};
  if(id==='react/jsx-runtime')return{jsx,jsxs:jsx};
  if(id==='lucide-react')return{Layers:'Layers',RotateCcw:'RotateCcw'};
  if(id==='@/i18n/LocaleProvider')return{useTranslation:()=>({locale})};
  if(id==='@/lib/motion/language-checkpoint')return{languageMotionActive:()=>active};
  if(id==='@/lib/three/signal-core')return{mountSignalCore:async host=>{created++;host.prepend(canvas);return controller;}};
  throw Error(id);
 }
});
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
const first=exports.HeroSignal3D();assert.equal(passives.length,0);assert.equal(layouts.length,1);
const stop=layouts.pop()();await flush();for(const fn of frames.values())fn();frames.clear();assert.equal(first.node.dataset.sceneState,'ready');
active=true;stop();locale='en';const translated=exports.HeroSignal3D(),finish=layouts.pop()();
assert.equal(translated.node.dataset.sceneState,'ready','retained canvas must be visible before any passive effect or microtask');
const stage=translated.props.children[1].node;assert.equal(stage.children[0],canvas);assert.equal(created,1);assert.equal(disposals,0);
await flush();assert.equal(states.at(-2).value,2);assert.equal(states.at(-1).value,true);
active=false;finish();assert.equal(disposals,1);assert.equal(timers.size,0);assert.equal(frames.size,0);
console.log('PASS locale handoff attaches the same live canvas before paint, restores controls and cleans up the lease');
