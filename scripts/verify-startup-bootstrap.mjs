import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const file='src/components/motion/StartupBootstrap.tsx';
const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function load(client){const exports={};vm.runInNewContext(code,{exports,require(id){if(id==='react'&&client)return{...React,useSyncExternalStore:(subscribe,snapshot)=>{const stop=subscribe(()=>{});assert.equal(typeof stop,'function');stop();return snapshot();}};return require(id);}});return exports.StartupBootstrap;}
const source='window.__bootstrapProof=true;';
const Server=load(false),html=renderToStaticMarkup(React.createElement(Server,{source}));
assert.ok(html.includes('<script id="mhdrhn-motion-startup">'+source+'</script>'));
assert.ok(!html.includes('<template'));
console.log('PASS real React server render preserves the executable parser-time bootstrap');
const Client=load(true);
for(let i=0;i<20;i++){const tree=Client({source});assert.equal(tree.type,'template');assert.equal(tree.props['data-startup-bootstrap'],'inactive');assert.equal(tree.props.dangerouslySetInnerHTML,undefined);assert.ok(!renderToStaticMarkup(tree).includes('<script'));}
console.log('PASS twenty client/locale mounts return inert templates without script elements or execution');
