import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';

// Exercise the real overlay lifecycle, with animation/DOM boundary doubles.
function setup(supported=true){
 const calls=[], nodes=new Set(), listeners=new Map(), timers=new Map();
 class Node {
  constructor(tag){this.tag=tag;this.style={};this.dataset={};this.children=[];}
  append(node){this.children.push(node);nodes.add(node);}
  setAttribute(){}
  remove(){this.children.forEach(node=>node.remove());nodes.delete(this);}
 }
 const highlights=new Map(), document={head:new Node('head'),body:new Node('body'),createElement:tag=>new Node(tag),querySelectorAll:()=>[],querySelector:()=>null};
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/i18n/word-morph.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
  exports,document,CSS:supported?{highlights}:{},Highlight:class{constructor(...ranges){this.ranges=ranges;}},
  window:{addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)},
  setTimeout:(fn,ms)=>{timers.set(fn,ms);return fn;},clearTimeout:fn=>timers.delete(fn),
  require:id=>id==='framer-motion'?{animate:(node,frames,options)=>{const control={stop(){this.stopped=true;},then(){}};calls.push({node,frames,options,control});return control;}}:id==='./language-context'?{disclosureTextHidden:()=>false}:id==='@/lib/motion/language-checkpoint'?{motionElementKey:()=>''}:(()=>{throw Error(id);})(),
 });
 return{...exports,calls,nodes,listeners,timers,highlights};
}
const word=(text,y,offset=0,x=0)=>({text,offset,x,y,height:20,font:'16px Manrope',color:'white',spacing:'normal',transform:'none',features:'normal',chrome:null});
const block=(text,words)=>({text,words,ranges:words.map(()=>({}))});
const snapshot=(value)=>new Map([['copy',value]]);
const results=[];
async function check(name,run){await run();results.push(name);console.log('PASS '+name);}
await check('shorter English copy moves incoming and outgoing words toward the new baseline',async()=>{
 const h=setup(), run=h.morphWords(snapshot(block('Panjang',[word('Panjang',300)])),snapshot(block('Short',[word('Short',240)])));
 assert.equal(h.calls.length,2);assert.deepEqual(Array.from(h.calls[0].frames.transform),['translate(0px, 0px)','translate(0px, -64px)']);assert.deepEqual(Array.from(h.calls[1].frames.transform),['translate(0px, 65px)','translate(0px, 0px)']);
 run.stop();await run.finished;
});
await check('longer Indonesian copy expands smoothly in the reverse direction',()=>{
 const h=setup(), run=h.morphWords(snapshot(block('Short',[word('Short',240)])),snapshot(block('Panjang',[word('Panjang',300)])));
 assert.deepEqual(Array.from(h.calls[1].frames.transform),['translate(0px, -55px)','translate(0px, 0px)']);run.stop();
});
await check('unchanged names reflow without fading or replaying entrance',()=>{
 const h=setup(), run=h.morphWords(snapshot(block('AURA POD',[word('AURA',320),word('POD',320,5,45)])),snapshot(block('AURA POD',[word('AURA',260),word('POD',260,5,45)])));
 assert.equal(h.calls.length,2);for(const c of h.calls){assert.deepEqual(Array.from(c.frames.opacity),[1,1]);assert.deepEqual(Array.from(c.frames.transform),['translate(0px, 60px)','translate(0px, 0px)']);assert.equal(c.options.delay,0);}run.stop();
});
await check('stationary copy creates no overlay or listeners',async()=>{
 const h=setup(), copy=block('Fixed',[word('Fixed',100)]),run=h.morphWords(snapshot(copy),snapshot(copy));await run.finished;assert.equal(h.calls.length,0);assert.equal(h.nodes.size,0);assert.equal(h.listeners.size,0);
});
await check('viewport crop changes preserve source-word identity',()=>{
 const h=setup(),run=h.morphWords(snapshot(block('AURA POD',[word('POD',320,5)])),snapshot(block('AURA POD',[word('AURA',260),word('POD',280,5)])));
 assert.equal(h.calls.length,1);assert.equal(h.calls[0].node.textContent,'POD');assert.deepEqual(Array.from(h.calls[0].frames.transform),['translate(0px, 40px)','translate(0px, 0px)']);run.stop();
});
await check('word timing is slightly longer and capped at 620ms for dense copy',()=>{
 const h=setup(),words=Array.from({length:100},(_,i)=>word('word',100,i)),run=h.morphWords(new Map(),snapshot(block('Translated',words)));
 const longest=Math.max(...h.calls.map(c=>c.options.duration+c.options.delay));assert.equal(longest,.62);assert.equal([...h.timers.values()][0],1000);run.stop();
});
await check('interruptions release highlights, nodes, listeners, controls and completion',async()=>{
 const h=setup(),run=h.morphWords(new Map(),snapshot(block('New',[word('New',100)])));assert.ok(h.highlights.size);h.listeners.get('wheel')();await run.finished;run.stop();
 assert.equal(h.highlights.size,0);assert.equal(h.nodes.size,0);assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);assert.ok(h.calls.every(c=>c.control.stopped));
});
await check('unsupported highlight browsers keep real translated text visible',async()=>{
 const h=setup(false),run=h.morphWords(new Map(),snapshot(block('New',[word('New',100)])));await run.finished;assert.equal(h.calls.length,0);assert.equal(h.nodes.size,0);
});
console.log(`${results.length} language reflow checks passed`);
