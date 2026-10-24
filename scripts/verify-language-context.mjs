import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';
const results=[];
function check(name,run){run();results.push(name);console.log('PASS '+name);}
function load(file,deps,globals){const exports={};const context=vm.createContext({exports,require:id=>{if(!(id in deps))throw Error(id);return deps[id];},...globals});vm.runInContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);return {exports,context};}
let currentY=1000;
class Element {
 constructor(tag,id='',top=0,height=50){this.tagName=tag;this.id=id;this.top=top;this.height=height;this.dataset={};this.open=false;this.children=[];this.children.item=i=>this.children[i]??null;}
 add(node){node.parentElement=this;this.children.push(node);return node;}
 contains(node){return node===this||this.children.some(child=>child.contains(node));}
 getAttribute(name){return this[name]??null;}
 getBoundingClientRect(){return{top:this.top-currentY,bottom:this.top-currentY+this.height,left:0,right:900,width:900,height:this.height};}
 closest(query){if(query==='main'&&this.tagName==='MAIN')return this;if(query.startsWith('details:')&&this.tagName==='DETAILS'&&(!this.open||this.dataset.motionState==='closing'))return this;if(query==='[id],[data-home-section],[data-education-id],[data-certificate-id]'&&this.id)return this;return this.parentElement?.closest(query)??null;}
 querySelector(query){if(query.startsWith('#'))return this.find(n=>n.id===query.slice(1));return null;}
 find(test){for(const n of this.children){if(test(n))return n;const found=n.find(test);if(found)return found;}return null;}
 querySelectorAll(query){if(query==='details')return this.all(n=>n.tagName==='DETAILS');if(query==='[data-home-section] .story-root')return[];return this.all(n=>['H2','P','SUMMARY'].includes(n.tagName));}
 all(test){return this.children.flatMap(n=>[...(test(n)?[n]:[]),...n.all(test)]);}
}
const root=new Element('MAIN','main-content');
const education=root.add(new Element('H2','education-heading',1120,90));
const details=root.add(new Element('DETAILS','role-context',1400));
const summary=details.add(new Element('SUMMARY','',1400)),body=details.add(new Element('DIV','',1450));
const head=new Set();
const document={querySelector:()=>({getBoundingClientRect:()=>({bottom:68})}),head:{append(n){head.add(n);}},createElement:()=>({textContent:'',remove(){head.delete(this);}})};
const motion=load('src/lib/motion/language-checkpoint.ts',{},{}).exports;
const context=load('src/i18n/language-context.ts',{'@/lib/motion/language-checkpoint':motion},{document}).exports;
const frames=new Map(),listeners=new Map(),observers=[];let frame=0;
const window={addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)};
class ResizeObserver{constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
const anchorModule=load('src/i18n/viewport-anchor.ts',{'@/lib/motion/language-checkpoint':motion,'./language-context':context},{document,window,HTMLElement:Element,CSS:{escape:v=>v},innerHeight:900,innerWidth:1200,scrollY:currentY,ResizeObserver,requestAnimationFrame:fn=>{frames.set(++frame,fn);return frame;},cancelAnimationFrame:id=>frames.delete(id)});
const anchor=anchorModule.exports;
function scroll(y){currentY=y;anchorModule.context.scrollY=y;}
check('Education retains its viewport pixel after project rails add 1400px above it',()=>{const saved=anchor.captureViewportAnchor(root);assert.equal(saved.scope,'#education-heading');education.top+=1400;const target=anchor.resolveViewportAnchor(root,saved);assert.equal(target,2400);scroll(target);assert.equal(education.getBoundingClientRect().top,saved.top);education.top-=1400;scroll(1000);});
check('a translated landmark changing its own height does not invent section progress',()=>{const saved=anchor.captureViewportAnchor(root);education.height=700;assert.equal(anchor.resolveViewportAnchor(root,saved),1000);education.height=90;});
check('a clipped paragraph from the previous section cannot steal a fully visible education landmark',()=>{root.add(new Element('P','previous-copy',1060,80));const saved=anchor.captureViewportAnchor(root);assert.equal(saved.scope,'#education-heading');root.children.pop();});
check('unavailable landmarks use the captured absolute scroll fallback',()=>{const saved=anchor.captureViewportAnchor(root);saved.scope='#removed';assert.equal(anchor.resolveViewportAnchor(root,saved),1000);});
check('a viewport without a main landmark retains its absolute scroll instead of jumping to main',()=>{assert.equal(anchor.resolveViewportAnchor(root,{scope:'',path:'',top:0,y:1000}),1000);});
check('late layout resize is corrected; the next user wheel immediately releases position ownership',()=>{const saved=anchor.captureViewportAnchor(root);const stop=anchor.maintainViewportAnchor(root,saved,scroll);education.top+=150;observers.at(-1).fn();assert.equal(currentY,1150);listeners.get('wheel')();assert.ok(observers.at(-1).disconnected);assert.equal(listeners.size,0);assert.equal(frames.size,0);education.top+=100;observers.at(-1).fn();assert.equal(currentY,1150);stop();education.top-=250;scroll(1000);});
check('cached route scroll restoration is reconciled even when document height is unchanged',()=>{const saved=anchor.captureViewportAnchor(root);const stop=anchor.maintainViewportAnchor(root,saved,scroll);scroll(400);listeners.get('scroll')();for(let i=0;i<2;i++){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());}assert.equal(currentY,1000);stop();assert.equal(listeners.size,0);assert.equal(frames.size,0);});
check('closed or closing descriptions never supply overlay words; their summary remains visible',()=>{details.open=false;assert.equal(context.disclosureTextHidden(body),true);assert.equal(context.disclosureTextHidden(summary),false);details.open=true;assert.equal(context.disclosureTextHidden(body),false);details.dataset.motionState='closing';assert.equal(context.disclosureTextHidden(body),true);assert.equal(context.disclosureTextHidden(summary),false);delete details.dataset.motionState;});
check('a closing disclosure is restored closed, despite native open remaining true during exit',()=>{details.open=true;details.dataset.motionState='closing';context.captureLanguageContext(root);delete details.dataset.motionState;context.restoreLanguageDisclosure(details);assert.equal(details.open,false);context.clearLanguageContext();assert.equal(head.size,0);});
check('expanded descriptions survive locale remount; closed ones stay closed',()=>{for(const expanded of [false,true]){details.open=expanded;context.captureLanguageContext(root);details.open=!expanded;context.restoreLanguageDisclosure(details);assert.equal(details.open,expanded);context.clearLanguageContext();}});
check('project list view is available before measurement and released after the language transaction',()=>{const original=root.querySelectorAll;const story={dataset:{view:'list'},closest:()=>({dataset:{homeSection:'latest-projects'}})};root.querySelectorAll=function(query){return query==='[data-home-section] .story-root'?[story]:original.call(this,query);};context.captureLanguageContext(root);assert.equal(context.languageStoryList('latest'),true);context.clearLanguageContext();assert.equal(context.languageStoryList('latest'),undefined);root.querySelectorAll=original;});
const dir='docs/execution/evidence/language-position-disclosure-2026-10-24';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/regressions.json',JSON.stringify({results},null,2));
