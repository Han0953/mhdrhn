import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';

function setup(){
 const calls=[],listeners=new Map(),timers=new Map(),nodes=[];
 class Element{
  constructor(key,x=0,y=0,parent=null){this.key=key;this.x=x;this.y=y;this.parentElement=parent;this.style={transform:'rotate(2deg)',translate:'0 -5px'};this.dataset={};this.computed={display:'block',opacity:'1',visibility:'visible',position:'static'};this.tagName='DIV';this.className='';}
  getBoundingClientRect(){return {left:this.x,top:this.y,right:this.x+100,bottom:this.y+50,width:100,height:50};}
  closest(selector){return selector.includes('script,style')?(this.excluded?this:null):null;}
  matches(){return false;}
  animate(frames,options){if(this.unsupported)throw Error('unsupported');let done;const finished=new Promise(resolve=>{done=resolve;});const animation={finished,cancelled:false,cancel(){this.cancelled=true;done();},finish:done};calls.push({node:this,frames,options,animation});return animation;}
 }
 class SVG extends Element{}
 const body=new Element('body'),document={body,querySelectorAll:()=>nodes};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/i18n/layout-reflow.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
  exports,document,HTMLElement:Element,SVGSVGElement:SVG,innerHeight:800,innerWidth:1200,getComputedStyle:node=>node.computed,
  window:{addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)},setTimeout:(fn,ms)=>{timers.set(fn,ms);return fn;},clearTimeout:fn=>timers.delete(fn),
  require:id=>id==='@/lib/motion/language-checkpoint'?{motionElementKey:node=>node.key}:id==='./language-context'?{disclosureTextHidden:node=>!!node.disclosureHidden}:(()=>{throw Error(id);})(),
 });return {...exports,calls,listeners,timers,nodes,Element,SVG};
}
const before=(...pairs)=>new Map(pairs.map(([node,x,y])=>[node.key,{node,x,y}]));
const after=(...nodes)=>new Map(nodes.map(node=>[node.key,{node,x:node.x,y:node.y}]));
const results=[];
async function check(name,run){await run();results.push(name);console.log('PASS '+name);}
await check('a card and its icon move once as a whole',()=>{
 const h=setup(),card=new h.Element('card',0,200),icon=new h.SVG('icon',20,220,card),run=h.animateLanguageLayout(before([card,0,260],[icon,20,280]),after(card,icon));
 assert.equal(h.calls.length,1);assert.equal(h.calls[0].node,card);assert.equal(h.calls[0].frames[0].translate,'0px 60px');run.stop();
});
await check('nested icon reflow animates only its residual displacement',()=>{
 const h=setup(),card=new h.Element('card',0,200),icon=new h.SVG('icon',20,220,card),run=h.animateLanguageLayout(before([card,0,260],[icon,20,310]),after(card,icon));
 assert.equal(h.calls.length,2);assert.equal(h.calls[1].frames[0].translate,'0px 30px');run.stop();
});
await check('a stationary child compensates its moving ancestor',()=>{
 const h=setup(),card=new h.Element('card',0,200),label=new h.Element('label',20,220,card),run=h.animateLanguageLayout(before([card,0,260],[label,20,220]),after(card,label));
 assert.equal(h.calls[1].frames[0].translate,'0px -60px');run.stop();
});
await check('horizontal rewrap and existing hover/GSAP styles are preserved',()=>{
 const h=setup(),node=new h.Element('button',100,200),original={...node.style},run=h.animateLanguageLayout(before([node,160,230]),after(node));
 assert.equal(h.calls[0].frames[0].translate,'60px 30px');assert.equal(h.calls[0].options.composite,'add');assert.deepEqual(node.style,original);run.stop();assert.deepEqual(node.style,original);
});
await check('subpixel stationary content allocates no animations/listeners',async()=>{
 const h=setup(),node=new h.Element('text',0,200),run=h.animateLanguageLayout(before([node,0,200.1]),after(node));await run.finished;assert.equal(h.calls.length,0);assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
});
await check('natural completion cancels fill effects and releases listeners/timer',async()=>{
 const h=setup(),node=new h.Element('card',0,200),run=h.animateLanguageLayout(before([node,0,260]),after(node));assert.equal(h.calls[0].options.duration,480);h.calls.forEach(c=>c.animation.finish());await run.finished;assert.ok(h.calls.every(c=>c.animation.cancelled));assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
});
await check('wheel/touch/resize interruption resolves and leaves no animation resources',async()=>{
 for(const event of ['wheel','touchstart','resize']){const h=setup(),node=new h.Element('card',0,200),run=h.animateLanguageLayout(before([node,0,260]),after(node));h.listeners.get(event)();await run.finished;run.stop();assert.ok(h.calls[0].animation.cancelled);assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);}
});
await check('unsupported parent animation does not invent an inherited child shift',async()=>{
 const h=setup(),parent=new h.Element('parent',0,200),child=new h.Element('child',0,220,parent);parent.unsupported=true;const run=h.animateLanguageLayout(before([parent,0,260],[child,0,280]),after(parent,child));assert.equal(h.calls.length,1);assert.equal(h.calls[0].frames[0].translate,'0px 60px');run.stop();await run.finished;
});
await check('capture excludes queued/closed/fixed/sticky and nontransformable inline nodes',()=>{
 const h=setup();for(let i=0;i<7;i++)h.nodes.push(new h.Element('n'+i,0,100));h.nodes[0].excluded=true;h.nodes[1].disclosureHidden=true;h.nodes[2].computed.position='fixed';h.nodes[3].computed.position='sticky';h.nodes[4].computed.display='inline';h.nodes[5].computed.opacity='0';assert.equal(h.captureLanguageLayout().size,1);
});
await check('capture covers entering content with bounded viewport overscan and SVG roots',()=>{
 const h=setup();h.nodes.push(new h.SVG('icon',0,900),new h.Element('far',0,1700));assert.equal(h.captureLanguageLayout().size,1);
});
await check('pinned story children reflow while their sticky positioning owner stays untouched',()=>{
 const h=setup(),sticky=new h.Element('sticky',0,0),card=new h.Element('story-card',0,100,sticky);sticky.computed.position='sticky';h.nodes.push(sticky,card);const saved=h.captureLanguageLayout();assert.equal(saved.size,1);assert.equal([...saved.values()][0].node,card);
});
await check('capture budget and repeated lifetimes stay bounded',async()=>{
 const h=setup();for(let i=0;i<1010;i++)h.nodes.push(new h.Element('n'+i,0,100));assert.equal(h.captureLanguageLayout().size,1000);
 for(let i=0;i<20;i++){const node=h.nodes[0],run=h.animateLanguageLayout(before([node,0,160]),after(node));run.stop();await run.finished;}assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);assert.ok(h.calls.every(c=>c.animation.cancelled));
});
console.log(`${results.length} language layout checks passed`);
