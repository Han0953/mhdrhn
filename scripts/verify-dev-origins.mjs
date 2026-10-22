// Runs Next's installed origin guard with the real before/after configuration.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {blockCrossSiteDEV}=require('next/dist/server/lib/router-utils/block-cross-site-dev');
function readConfig(file,interfaces){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:id=>{assert.equal(id,'node:os');return interfaces?{networkInterfaces:()=>interfaces}:require(id);}});return exports.default;}
const config=readConfig('next.config.ts',{wifi:[{family:'IPv4',internal:false,address:'192.168.1.3'}]}),allowed=Array.from(config.allowedDevOrigins??[]),results=[];
const warnings=[],warn=console.warn;console.warn=(...args)=>warnings.push(args.join(' '));
function guard(origin,origins=allowed,headers={},url='/_next/webpack-hmr'){
  const res={statusCode:200,end(body){this.body=body;}};
  const blocked=!!blockCrossSiteDEV({url,headers:{...(origin===undefined?{}:{origin}),...headers}},res,origins,'0.0.0.0');
  return{blocked,status:res.statusCode,body:res.body};
}
function check(name,fn){fn();results.push({name,status:'PASS'});console.log('PASS '+name);}
try{
  check('development allowlist contains only the verified loopback and LAN hosts',()=>{assert.deepEqual(allowed,['127.0.0.1','192.168.1.3']);assert.ok(!allowed.some(host=>host.includes('*')||host.includes('://')));});
  check('a DHCP change follows the actual local interface without allowing the old address',()=>{const c=readConfig('next.config.ts',{wifi:[{family:'IPv4',internal:false,address:'192.168.1.44'}]});assert.deepEqual(Array.from(c.allowedDevOrigins),['127.0.0.1','192.168.1.44']);});
  check('public, IPv6 and internal interfaces are excluded; duplicate LAN addresses are deduplicated',()=>{const c=readConfig('next.config.ts',{wifi:[{family:'IPv4',internal:false,address:'192.168.1.44'},{family:'IPv4',internal:false,address:'192.168.1.44'},{family:'IPv4',internal:false,address:'203.0.113.7'},{family:'IPv6',internal:false,address:'fe80::1'},{family:'IPv4',internal:true,address:'10.0.0.1'}]});assert.deepEqual(Array.from(c.allowedDevOrigins),['127.0.0.1','192.168.1.44']);});
  check('previous default configuration reproduces a blocked LAN development request',()=>{assert.equal(guard('http://192.168.1.3:3000',[]).status,403);});
  check('previous default configuration also blocks the numeric loopback origin',()=>{assert.equal(guard('http://127.0.0.1:3000',[]).status,403);});
  check('verified loopback and LAN development origins now pass the installed Next guard',()=>{for(const host of allowed){const r=guard('http://'+host+':3000');assert.equal(r.blocked,false);assert.equal(r.status,200);}});
  check('localhost and same-site requests without Origin retain their original behavior',()=>{assert.equal(guard('http://localhost:3000').blocked,false);assert.equal(guard(undefined).blocked,false);});
  check('untrusted development origins are still denied with 403',()=>{assert.equal(guard('http://untrusted.invalid:3000').status,403);});
  check('opaque origins are still denied rather than enabling a blanket bypass',()=>{assert.equal(guard('null').status,403);});
  check('cross-site scripts require a verified Referer and reject untrusted Referer',()=>{for(const host of allowed)assert.equal(guard(undefined,allowed,{'sec-fetch-mode':'no-cors','sec-fetch-site':'cross-site',referer:'http://'+host+':3000/about'}).blocked,false);assert.equal(guard(undefined,allowed,{'sec-fetch-mode':'no-cors','sec-fetch-site':'cross-site',referer:'http://untrusted.invalid/'}).status,403);});
  check('this development-only option does not introduce a guard on public page URLs',()=>{assert.equal(guard('http://untrusted.invalid',allowed,{},'/about').blocked,false);});
}finally{console.warn=warn;}
const dir=process.env.MHDRHN_QA_DEV_ORIGINS_EVIDENCE||'docs/execution/evidence/mobile-header-fix-2026-10-22';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/dev-origin-checks.json',JSON.stringify({method:'Installed Next.js 16.2.10 origin guard, real next.config.ts with deterministic NIC fixtures and request/response objects; live HTTP and browser results are recorded separately.',allowed,results,warnings},null,2));console.log(results.length+' development-origin checks passed.');
