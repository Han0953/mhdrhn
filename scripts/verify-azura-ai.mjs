import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
import {loadMotion} from './motion-test-support.mjs';
const results=[];
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS '+name);}
const protocol=loadMotion('src/lib/azura/protocol.ts');
function fixture(env={GEMINI_API_KEY:'test-secret',GEMINI_MODEL:'gemini-3.5-flash-lite'}){
 const exports={},sandbox={exports,process:{env},URL,Request,Response,AbortSignal,TextDecoder,Uint8Array,setTimeout,clearTimeout,Error,fetch,require(id){if(id==='server-only')return {};if(id==='node:crypto')return crypto;if(id==='./protocol')return protocol;if(id==='./knowledge')return {azuraInstruction:l=>'Public portfolio '+l};throw Error(id);}};
 const code=ts.transpileModule(fs.readFileSync('src/lib/azura/server.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,sandbox);return {handle:exports.handleAzura,sandbox};
}
const question={question:'Siapa Rehan?',locale:'id',history:[]};
const request=(body=question,headers={})=>new Request('http://localhost:3000/api/azura',{method:'POST',headers:{origin:'http://localhost:3000','content-type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
const answer=(text='Jawaban AI aktual')=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'private thought',thought:true},{text}]}}]});
await check('same-origin, JSON, schema and size checks reject before provider',async()=>{
 const f=fixture();let calls=0;const mock=async()=>{calls++;return answer();};
 for(const [req,status]of [[request(question,{origin:'https://evil.test'}),403],[request(question,{'sec-fetch-site':'cross-site'}),403],[request(question,{'content-type':'text/plain'}),415],[request({}),400],[request({ ...question,question:'x'.repeat(501)}),400],[request({ ...question,history:[{role:'model',text:'bad'}]}),400],[request({ ...question,history:[{role:'user',text:'orphan'}]}),400],[request('x'.repeat(36001)),400],[request('not json'),400]])assert.equal((await f.handle(req,mock)).status,status);
 assert.equal(calls,0);
});
await check('missing key and invalid model fail safely before provider',async()=>{for(const env of [{},{GEMINI_API_KEY:'test',GEMINI_MODEL:'../secret'}]){const r=await fixture(env).handle(request(),()=>{throw Error('must not call');});assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'not_configured'});}});
await check('Next normalized URL accepts matching browser Host but ignores forwarded-host spoofing',async()=>{const f=fixture();assert.equal((await f.handle(request(question,{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}),async()=>answer())).status,200);assert.equal((await f.handle(request(question,{'x-forwarded-host':'evil.test',origin:'https://evil.test'}),async()=>answer())).status,403);});
await check('provider receives server key, system instruction, bounded history and minimal thinking',async()=>{
 let captured;const r=await fixture().handle(request({...question,history:[{role:'user',text:'halo'},{role:'model',text:'Selamat datang'}]}),async(url,options)=>{captured={url,options};return answer();});
 assert.equal(r.status,200);assert.deepEqual(await r.json(),{text:'Jawaban AI aktual'});assert.equal(r.headers.get('cache-control'),'no-store');
 assert.equal(captured.options.headers['x-goog-api-key'],'test-secret');assert.ok(!captured.url.includes('test-secret'));const body=JSON.parse(captured.options.body);assert.equal(body.contents.length,3);assert.equal(body.systemInstruction.parts[0].text,'Public portfolio id');assert.equal(body.generationConfig.thinkingConfig.thinkingLevel,'minimal');assert.equal(body.generationConfig.maxOutputTokens,900);
});
await check('malformed, blocked and failed provider responses never become fake answers',async()=>{for(const response of [Response.json({secret:'provider detail'},{status:500}),Response.json({candidates:[{finishReason:'SAFETY',content:{parts:[{text:'blocked'}]}}]}),Response.json({candidates:[{content:{parts:[{text:42}]}}]}),new Response('bad json')]){const r=await fixture().handle(request(),async()=>response);assert.equal(r.status,502);assert.deepEqual(await r.json(),{error:'upstream'});}});
await check('quota, timeout, network and caller cancellation are sanitized and release concurrency',async()=>{
 for(const [mock,status,error] of [[async()=>Response.json({secret:'detail'},{status:429}),429,'rate_limit'],[async()=>{throw Object.assign(Error('sensitive'),{name:'TimeoutError'});},504,'timeout'],[async()=>{throw Error('network secret');},502,'upstream']]){const f=fixture(),r=await f.handle(request(),mock);assert.equal(r.status,status);assert.deepEqual(await r.json(),{error});assert.equal(f.sandbox.__azuraLimits.active,0);}
 const f=fixture(),controller=new AbortController(),req=new Request(request(),{signal:controller.signal});controller.abort();const r=await f.handle(req,async()=>{throw Error('aborted');});assert.equal(r.status,499);assert.equal(f.sandbox.__azuraLimits.active,0);
});
await check('per-client quota bounds repeated calls; global quota also bounds spoofed IPs',async()=>{
 const f=fixture();for(let i=0;i<6;i++)assert.equal((await f.handle(request(),async()=>answer())).status,200);const blocked=await f.handle(request(),()=>{throw Error('must not call');});assert.equal(blocked.status,429);assert.equal(blocked.headers.get('retry-after'),'60');
 const g=fixture();for(let i=0;i<60;i++)assert.equal((await g.handle(request(question,{'x-forwarded-for':String(i)}),async()=>answer())).status,200);assert.equal((await g.handle(request(question,{'x-forwarded-for':'next'}),async()=>answer())).status,429);
});
await check('only two provider requests can run simultaneously',async()=>{const f=fixture(),resolvers=[];const mock=()=>new Promise(resolve=>resolvers.push(resolve));const first=f.handle(request(),mock),second=f.handle(request(),mock);while(resolvers.length<2)await new Promise(resolve=>setTimeout(resolve,0));assert.equal((await f.handle(request(),async()=>answer())).status,429);resolvers.forEach(resolve=>resolve(answer()));assert.equal((await first).status,200);assert.equal((await second).status,200);assert.equal(f.sandbox.__azuraLimits.active,0);});
await check('reveal progresses in bounded word batches, preserves Unicode and cleans timers',()=>{
 let now=0,seq=0;const timers=new Map(),globals={setTimeout(fn,delay){const id=++seq;timers.set(id,{fn,at:now+delay});return id;},clearTimeout:id=>timers.delete(id)};
 const {revealAnswer}=loadMotion('src/lib/azura/reveal.ts',globals);
 const run=()=>{const [id,t]=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];timers.delete(id);now=t.at;t.fn();};
 const text='Halo 👋, ini jawaban.\n\n'+Array.from({length:400},(_,i)=>'kata'+i).join(' ');let chunks=0,end=0,done=0;
 revealAnswer(text,(previous,next)=>{assert.equal(previous,end);assert.ok(next>previous);end=next;chunks++;},()=>done++);
 assert.equal(end,0);while(timers.size)run();assert.equal(text.slice(0,end),text);assert.equal(done,1);assert.ok(chunks<=100);assert.ok(now<=3620);
 for(let i=0;i<20;i++){const stop=revealAnswer(text,()=>{},()=>{throw Error('cancelled callback');});run();stop();assert.equal(timers.size,0);}
});
await check('cache preserves real answers and legacy questions without inventing responses',()=>{
 const {decodeHistory,conversationTurns,CHAT_TTL}=loadMotion('src/lib/azura/history.ts');const now=1000;
 const old=decodeHistory(JSON.stringify({version:1,expiresAt:now+CHAT_TTL,questions:[{id:1,question:'Halo'}]}),now);assert.equal(old.messages[0].error,'interrupted');assert.equal(old.messages[0].reply.text,'');
 const entries=Array.from({length:5},(_,i)=>({id:i,question:'q'+i,reply:{text:'AI'+i},ready:true}));entries[3].error='timeout';const turns=conversationTurns(entries);assert.equal(turns.length,4);assert.equal(turns[0].text,'q2');assert.equal(turns[3].text,'AI4');
 for(const version of ['2',3])assert.equal(decodeHistory(JSON.stringify({version,expiresAt:now+CHAT_TTL,messages:entries}),now),null);
});
fs.mkdirSync('docs/execution/evidence/azura-ai-2026-10-25',{recursive:true});fs.writeFileSync('docs/execution/evidence/azura-ai-2026-10-25/automated.json',JSON.stringify({method:'Real TypeScript modules; mocked provider, deterministic reveal clock; not live Gemini evidence.',results},null,2));
console.log(results.length+' checks passed.');
