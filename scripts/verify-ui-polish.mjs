// Real handlers/controllers with explicit browser doubles; visual QA is separate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const results=[];
function check(name,fn){fn();results.push({name,status:'PASS'});console.log('PASS '+name);}
function load(file,deps={},globals={}){
  const exports={};
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code,{exports,...globals,require:id=>{assert.ok(id in deps,id);return deps[id];}});
  return exports;
}
function clock(){let id=0;const timers=new Map(),frames=new Map();return{timers,frames,
  setTimeout(fn,delay){const n=++id;timers.set(n,{fn,delay});return n;},clearTimeout(n){timers.delete(n);},
  requestAnimationFrame(fn){const n=++id;frames.set(n,fn);return n;},cancelAnimationFrame(n){frames.delete(n);},
  flush(){for(const[n,fn]of frames){frames.delete(n);fn();}},
  tick(delay){for(const[n,t]of [...timers])if(t.delay===delay){timers.delete(n);t.fn();}},
};}
check('theme observes class only, skips initial paint and ignores unrelated classes',()=>{
  const c=clock(),root={dataset:{},dark:false,classList:{contains:()=>root.dark}},observers=[];
  class MO{constructor(fn){this.fn=fn;observers.push(this);}observe(_root,options){this.options=options;}disconnect(){this.off=true;}}
  const{mountThemeMotion}=load('src/lib/motion/theme.ts',{}, {...c,MutationObserver:MO});
  const dispose=mountThemeMotion(root),observer=observers[0];assert.equal(root.dataset.themeReady,undefined);c.flush();assert.equal(root.dataset.themeReady,'true');
  observer.fn();assert.equal(root.dataset.themeChanging,undefined);assert.equal(c.timers.size,0);
  assert.deepEqual(Array.from(observer.options.attributeFilter),['class']);dispose();assert.equal(observer.off,true);
});
check('rapid theme reversals own one timer and disposal removes all pending work',()=>{
  for(let n=0;n<20;n++){
    const c=clock(),root={dataset:{},dark:false,classList:{contains:()=>root.dark}},observers=[];
    class MO{constructor(fn){observers.push(this);this.fn=fn;}observe(){}disconnect(){this.off=true;}}
    const{mountThemeMotion}=load('src/lib/motion/theme.ts',{}, {...c,MutationObserver:MO});const dispose=mountThemeMotion(root),observer=observers[0];c.flush();
    for(let i=0;i<50;i++){root.dark=!root.dark;observer.fn();assert.equal(c.timers.size,1);}
    assert.equal(root.dataset.themeChanging,'true');c.tick(520);assert.equal(root.dataset.themeChanging,undefined);
    root.dark=!root.dark;observer.fn();dispose();assert.equal(c.timers.size,0);assert.equal(c.frames.size,0);assert.equal(Object.keys(root.dataset).length,0);
  }
});
check('dialog animates its panel while the top-layer mobile header stays stationary',()=>{
  const c=clock(),animations=[],listeners=new Map(),docEvents=new Map();let reduced=false,preference;
  const panel={animate(frames,options){const a={frames,options,cancel(){}};animations.push(a);return a;}};
  const dialog={open:false,dataset:{},querySelector:()=>panel,querySelectorAll:()=>[],show(){this.open=true;},showModal(){this.open=true;},close(){this.open=false;listeners.get('close')?.();},
    addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k),animate(){throw Error('header must not move');}};
  const{mountDialog}=load('src/lib/motion/dialog.ts',{'./preferences':{prefersReducedMotion:()=>reduced,subscribeMotion(fn){preference=fn;return()=>preference=null;}},'./tokens':{motionTokens:{duration:{modalOpen:520,modalClose:420},easing:{response:'ease',editorial:'ease'}}}},
    {...c,document:{hidden:false,addEventListener:(k,v)=>docEvents.set(k,v),removeEventListener:k=>docEvents.delete(k)}});
  const controller=mountDialog(dialog);controller.open();assert.equal(dialog.open,true);assert.equal(animations[0].options.duration,520);animations[0].onfinish();
  controller.close();assert.equal(dialog.open,true);assert.equal(animations[1].options.duration,420);animations[1].onfinish();assert.equal(dialog.open,false);
  reduced=true;controller.open();assert.equal(animations.length,2);controller.close();assert.equal(dialog.open,false);
  controller.dispose();assert.equal(c.timers.size,0);assert.equal(listeners.size,0);assert.equal(docEvents.size,0);assert.equal(preference,null);
});
check('side panel stays opaque, travels its full width and morphs three hamburger lines without restarting close',()=>{
  const c=clock(),animations=[],listeners=new Map();
  const target=name=>({animate(frames,options){const a={name,frames,options,cancel(){this.cancelled=true;}};animations.push(a);return a;}});
  const panel=target('panel'),lines=[target('top'),target('middle'),target('bottom')];
  const dialog={open:false,dataset:{},querySelector:()=>panel,querySelectorAll:selector=>selector==='.menu-glyph>span'?lines:[],show(){this.open=true;},showModal(){this.open=true;},close(){this.open=false;listeners.get('close')?.();},addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
  const{mountDialog}=load('src/lib/motion/dialog.ts',{'./preferences':{prefersReducedMotion:()=>false,subscribeMotion:()=>()=>{}},'./tokens':{motionTokens:{duration:{modalOpen:520,modalClose:420},easing:{response:'ease',editorial:'ease'}}}},{...c,document:{hidden:false,addEventListener(){},removeEventListener(){}}});
  const controller=mountDialog(dialog,true);controller.open();
  assert.equal(animations[0].frames.some(frame=>'opacity'in frame),false);
  assert.equal(animations[0].frames[0].transform,'translateX(100%)');
  assert.equal(animations[0].options.duration,620);assert.equal(animations[0].options.fill,'both');
  assert.equal(animations[1].frames[0].transform,'translateY(-5px) rotate(0deg)');
  assert.equal(animations[1].frames[1].transform,'translateY(0px) rotate(45deg)');
  assert.equal(animations[2].frames[1].opacity,0);
  assert.equal(animations[3].frames[1].transform,'translateY(0px) rotate(-45deg)');
  animations[0].onfinish();controller.close();assert.equal(dialog.open,true);
  assert.equal(animations[4].frames[1].transform,'translateX(100%)');assert.equal(animations[4].options.duration,460);
  assert.equal(animations[5].frames[1].transform,'translateY(-5px) rotate(0deg)');
  assert.equal(animations[6].frames[1].opacity,1);
  const count=animations.length;for(let i=0;i<20;i++)controller.close();assert.equal(animations.length,count);
  animations[4].onfinish();assert.equal(dialog.open,false);controller.dispose();
  assert.equal(c.timers.size,0);assert.ok(animations.every(a=>a.cancelled));
});
check('menu text keeps its stagger after the panel settles and cleanup cancels trailing animation',()=>{
  const c=clock(),animations=[],listeners=new Map();
  const target=()=>({animate(frames,options){const a={frames,options,cancel(){this.cancelled=true;}};animations.push(a);return a;}});
  const panel=target(),text=Array.from({length:9},target);
  const dialog={open:false,dataset:{},querySelector:()=>panel,querySelectorAll:s=>s==='.menu-glyph>span'?[]:text,show(){this.open=true;},showModal(){this.open=true;},close(){this.open=false;listeners.get('close')?.();},addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
  const{mountDialog}=load('src/lib/motion/dialog.ts',{'./preferences':{prefersReducedMotion:()=>false,subscribeMotion:()=>()=>{}},'./tokens':{motionTokens:{duration:{modalOpen:520,modalClose:420},easing:{response:'ease',transfer:'ease',editorial:'ease'}}}},{...c,document:{hidden:false,addEventListener(){},removeEventListener(){}}});
  const controller=mountDialog(dialog,true);controller.open();
  assert.equal(animations[1].options.delay,279);assert.equal(animations.at(-1).options.delay,599);
  assert.equal(animations.at(-1).options.duration,360);animations[0].onfinish();
  assert.equal(dialog.dataset.motionState,undefined);assert.equal(dialog.open,true);
  assert.ok(animations.slice(1).every(a=>!a.cancelled));
  c.tick(1079);assert.ok(animations.every(a=>a.cancelled));assert.equal(c.timers.size,0);controller.dispose();
});
function chromeFixture(){
  const c=clock(),slots=[],effects=[],subscriptions=new Set(),scrolls=[];let cursor=0,dirty=false,tree,reduced=false,pathname='/about';
  const changed=(a,b)=>!a||a.length!==b.length||a.some((x,i)=>!Object.is(x,b[i]));
  const react={
    useState(initial){const i=cursor++;slots[i]??={value:initial};return[slots[i].value,value=>{slots[i].value=typeof value==='function'?value(slots[i].value):value;dirty=true;}];},
    useRef(value){const i=cursor++;slots[i]??={current:value};return slots[i];},
    useSyncExternalStore(_subscribe,snapshot){return snapshot();},
    useCallback(fn,deps){const i=cursor++;if(changed(slots[i]?.deps,deps))slots[i]={deps,fn};return slots[i].fn;},
    useEffect(fn,deps){const i=cursor++;if(changed(slots[i]?.deps,deps))effects.push(()=>{slots[i]?.cleanup?.();slots[i]={deps,cleanup:fn()};});},
  };
  const all=(node,predicate,out=[])=>{if(!node)return out;if(Array.isArray(node)){node.forEach(n=>all(n,predicate,out));return out;}if(typeof node!=='object')return out;if(predicate(node))out.push(node);all(node.props?.children,predicate,out);return out;};
  const find=(predicate)=>all(tree,predicate)[0];
  const button=name=>find(n=>n.props?.['aria-label']===name);
  const jsx=(type,props)=>({type,props});
  const dependencies={react,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'fragment'},'framer-motion':{motion:new Proxy({},{get:(_t,key)=>'motion.'+key}),AnimatePresence:'presence'},
    '@/components/motion/PageMotion':{},'@/lib/motion/preferences':{prefersReducedMotion:()=>reduced,subscribeMotion(fn){subscriptions.add(fn);return()=>subscriptions.delete(fn);}},
    'next/navigation':{usePathname:()=>pathname},'lucide-react':{},'@/components/ui/ThemeToggle':{},'./RouteTransition':{SiteLink:'link'},'@/lib/navigation':{navigation:[]},
    '@/lib/motion/dialog':{mountDialog:dialog=>({open(){dialog.open=true;},close(){dialog.close();},dispose(){}})},
  };
  const document={body:{style:{overflow:''}},querySelectorAll:()=>[],querySelector:()=>null};
  const{SiteChrome}=load('src/components/layout/SiteChrome.tsx',dependencies,{...c,document,window:{matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}})}});
  const dialogs=new Map();
  function render(){let limit=0;do{dirty=false;cursor=0;tree=SiteChrome();for(const node of all(tree,n=>n.type==='dialog')){
    let dialog=dialogs.get(node.props.id);if(!dialog){dialog={open:false,close(){if(this.open){this.open=false;this.onClose();}}};dialogs.set(node.props.id,dialog);}
    dialog.onClose=node.props.onClose;node.props.ref.current=dialog;
  }
  find(n=>n.props?.className==='chat-log').props.ref.current={scrollHeight:800,scrollTo:options=>scrolls.push(options)};
  effects.splice(0).forEach(fn=>fn());assert.ok(++limit<10);
  }while(dirty);return tree;}
  const count=()=>all(tree,n=>n.props?.className==='chat-exchange').length;
  const busy=()=>find(n=>n.props?.className==='chat-log').props['aria-busy'];
  const ask=text=>{find(n=>n.type==='input').props.onChange({target:{value:text}});render();find(n=>n.type==='form').props.onSubmit({preventDefault(){}});render();};
  render();return{c,render,button,find,ask,count,busy,dialogs,scrolls,subscriptions,document,
    reset(){find(n=>n.props?.className==='reset-chat').props.onClick();render();},
    reduce(){reduced=true;subscriptions.forEach(fn=>fn());render();},
    open(){button('Buka Azura — demo lokal').props.onClick();render();},
    navigate(){pathname='/projects';render();},
    unmount(){slots.forEach(s=>s?.cleanup?.());},
  };
}
check('menu reuses its page header rather than rendering a popup header for native close to remove',()=>{
  const t=chromeFixture();const header=t.find(n=>n.props?.pathname==='/about'&&n.props?.popup===undefined);
  header.props.onMenu();t.render();assert.equal(t.dialogs.get('site-menu').open,true);
  const menu=t.find(n=>n.props?.id==='site-menu');assert.equal(menu.props.children.props.className,'menu-panel');
  t.find(n=>n.props?.pathname==='/about'&&n.props?.popup===undefined).props.onMenu();t.render();assert.equal(t.dialogs.get('site-menu').open,false);t.unmount();
});
check('sending renders the user message first, typing feedback, then the real local reply',()=>{
  const t=chromeFixture();t.open();t.ask('Proyek Vircuit');assert.equal(t.count(),1);assert.equal(t.busy(),true);assert.equal(t.button('Kirim pertanyaan').props.disabled,true);
  assert.equal(t.c.timers.size,1);t.c.tick(640);t.render();assert.equal(t.busy(),false);assert.equal(t.c.timers.size,0);assert.ok(t.find(n=>n.props?.className==='chat-reply'&&n.props.onAnimationComplete));t.unmount();
});
check('rapid submits cannot duplicate pending messages; reset cancels the pending reply',()=>{
  const t=chromeFixture();t.open();t.ask('Tentang Rehan');t.ask('Kontak');assert.equal(t.count(),1);assert.equal(t.c.timers.size,1);t.reset();t.c.tick(640);t.render();assert.equal(t.count(),0);assert.equal(t.busy(),false);assert.equal(t.c.timers.size,0);t.unmount();
});
check('minimize and route navigation settle typing while preserving local conversation',()=>{
  const t=chromeFixture();t.open();t.ask('Kompetensi');t.button('Minimalkan Azura').props.onClick();t.render();assert.equal(t.busy(),false);assert.equal(t.c.timers.size,0);assert.equal(t.count(),1);assert.equal(t.dialogs.get('azura-dialog').open,false);
  t.open();t.ask('Kontak');t.navigate();assert.equal(t.busy(),false);assert.equal(t.c.timers.size,0);assert.equal(t.count(),2);assert.equal(t.dialogs.get('azura-dialog').open,false);t.unmount();
});
check('live Minimal finishes typing; empty/length/count limits still enforce the local chat boundary',()=>{
  const t=chromeFixture();t.open();t.ask('Tentang Rehan');t.reduce();assert.equal(t.busy(),false);assert.equal(t.c.timers.size,0);t.reset();
  t.ask('   ');t.ask('x'.repeat(501));assert.equal(t.count(),0);
  for(let i=0;i<20;i++)t.ask('Kontak');assert.equal(t.count(),20);t.ask('lagi');assert.equal(t.count(),20);assert.equal(t.c.timers.size,0);t.unmount();assert.equal(t.subscriptions.size,0);
});
check('unmount releases a pending reply and body scroll lock',()=>{
  const t=chromeFixture();t.open();t.ask('Kontak');assert.equal(t.c.timers.size,1);assert.equal(t.document.body.style.overflow,'hidden');t.unmount();assert.equal(t.c.timers.size,0);assert.equal(t.subscriptions.size,0);assert.equal(t.document.body.style.overflow,'');
});
check('portrait owns a separate upward reveal, keeping existing media trajectories intact',()=>{
  const{revealPlan}=load('src/lib/motion/choreography.ts',{'./preferences':{},'./engines':{},'./entrance':{}},{window:{innerWidth:1280}});
  const node={matches:s=>s==='.portrait-photo',closest:()=>null};const plan=revealPlan(node,'about',0);
  assert.equal(plan.kind,'portrait');assert.match(plan.from,/translate3d\(0px,96px,0\)/);assert.match(plan.from,/scale\(1\)/);assert.equal(plan.delay,0);
});
const dir=process.env.MHDRHN_QA_UI_EVIDENCE||'docs/execution/evidence/ui-polish-2026-10-22';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/ui-polish-checks.json',JSON.stringify({method:'Real theme/dialog controllers and SiteChrome handlers with deterministic React/DOM/timer doubles; no browser or performance claims.',results},null,2));console.log(results.length+' UI polish checks passed.');
