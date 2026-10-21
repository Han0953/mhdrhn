// Actual component handlers with small React/DOM doubles; no browser emulation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const results = [];
async function check(name, test) { await test(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
function runtime(file, dependencies = {}, globals = {}) {
  const slots = [], effects = [];
  let cursor = 0, updates = 0;
  const changed = (a,b) => !a || a.length !== b.length || a.some((v,i) => !Object.is(v,b[i]));
  const react = {
    createContext: value => ({ value }), useContext: () => dependencies.begin || (()=>{}),
    useState(initial) { const i=cursor++; slots[i] ??= {value:initial}; return [slots[i].value, value => { slots[i].value=value; updates++; }]; },
    useRef(initial) { const i=cursor++; slots[i] ??= {current:initial}; return slots[i]; },
    useEffect(callback, deps) { const i=cursor++; if(changed(slots[i]?.deps,deps)) effects.push(()=>{slots[i]?.cleanup?.(); slots[i]={deps,cleanup:callback()};}); },
  };
  const jsx = (type, props) => ({type,props});
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code,{exports,...globals,require(name) {
    if(name==='react')return react;
    if(name==='react/jsx-runtime')return {jsx,jsxs:jsx};
    if(dependencies[name])return dependencies[name];
    throw new Error(`Unexpected dependency ${name}`);
  }},{timeout:1000});
  return { exports, render(component,props={}) { cursor=0; const tree=component(props); effects.splice(0).forEach(run=>run()); return tree; }, unmount(){slots.forEach(slot=>slot?.cleanup?.());}, get updates(){return updates;} };
}
const browserLocation={origin:'http://127.0.0.1:3003',pathname:'/projects/drone-stm32',search:'?private=never-copy',hash:'#details'};
await check('copy uses the current project URL and confirms actual clipboard success', async()=>{
  let copied;
  const test=runtime('src/components/ui/CopyProjectLink.tsx',{}, {window:{location:browserLocation},navigator:{clipboard:{async writeText(url){copied=url;}}}});
  let tree=test.render(test.exports.CopyProjectLink);
  await tree.props.children[0].props.onClick(); tree=test.render(test.exports.CopyProjectLink);
  assert.equal(copied,'http://127.0.0.1:3003/projects/drone-stm32'); assert.equal(tree.props.children[1].props.children,'Tautan tersalin.'); test.unmount();
});
for (const unavailable of [true,false]) await check(`clipboard ${unavailable?'unavailable':'denied'} offers a selectable manual fallback`, async()=>{
  const navigator=unavailable?{}:{clipboard:{async writeText(){throw new Error('permission denied');}}};
  const test=runtime('src/components/ui/CopyProjectLink.tsx',{}, {window:{location:browserLocation},navigator});
  let tree=test.render(test.exports.CopyProjectLink); await tree.props.children[0].props.onClick(); tree=test.render(test.exports.CopyProjectLink);
  const label=tree.props.children[2]; assert.equal(label.type,'label'); assert.equal(label.props.children[1].props.readOnly,true);
  assert.equal(label.props.children[1].props.value,'http://127.0.0.1:3003/projects/drone-stm32'); assert.match(tree.props.children[1].props.children,/Ctrl\+C/); assert.match(tree.props.children[1].props.children,/menu salin/); test.unmount();
});
await check('a clipboard response after unmount cannot update removed UI',async()=>{
  let finish;
  const test=runtime('src/components/ui/CopyProjectLink.tsx',{}, {window:{location:browserLocation},navigator:{clipboard:{writeText(){return new Promise(resolve=>{finish=resolve;});}}}});
  const tree=test.render(test.exports.CopyProjectLink), copying=tree.props.children[0].props.onClick(); test.unmount(); finish(); await copying; assert.equal(test.updates,0);
});
function navigationRuntime(pending) {
  const timers=new Map(); let serial=0, began=0;
  const test=runtime('src/components/layout/RouteTransition.tsx',{
    begin(){began++;}, 'next/link':{default:'Link',useLinkStatus:()=>({pending})}, 'next/navigation':{}, '@/lib/navigation':{}, '@/lib/route-motion':{}, '@/lib/route-readiness':{},
  },{setTimeout(callback,delay){const id=++serial;timers.set(id,{callback,delay});return id;},clearTimeout(id){timers.delete(id);}});
  const link=test.render(test.exports.SiteLink,{href:'/projects',children:'Projects'});
  return {test,timers,link,get began(){return began;}};
}
await check('a ready Link produces no pending UI and never delays or cancels navigation',()=>{
  const r=navigationRuntime(false), pendingComponent=r.link.props.children[1]; assert.equal(r.test.render(pendingComponent.type),null);
  let prevented=0; r.link.props.onNavigate({preventDefault(){prevented++;}}); assert.equal(prevented,0);assert.equal(r.began,1); assert.equal(r.timers.size,0);
});
await check('fast pending navigation cancels its notice timer before anything is shown',()=>{
  const r=navigationRuntime(true), pending=r.test.render(r.link.props.children[1].type);
  assert.equal(r.test.render(pending.type),null); assert.equal([...r.timers.values()][0].delay,1200);r.test.unmount();assert.equal(r.timers.size,0);
});
await check('a genuinely pending Link gets one polite notice after 1200ms and releases resources',()=>{
  const r=navigationRuntime(true), pending=r.test.render(r.link.props.children[1].type);r.test.render(pending.type);
  const [id,timer]=[...r.timers][0];r.timers.delete(id);timer.callback(); const notice=r.test.render(pending.type);
  assert.equal(notice.props.role,'status');assert.match(notice.props.children,/tetap bisa memakai navigasi/); r.test.unmount();assert.equal(r.timers.size,0);
});
fs.writeFileSync(process.env.MHDRHN_QA_HANDLER_EVIDENCE || 'docs/execution/evidence/completion-2026-10-19/handler-checks.json',JSON.stringify({method:'Actual handlers with React, timer and clipboard doubles; no slow network or OS preference emulation.',results},null,2));
console.log(`${results.length} completion handler checks passed.`);
