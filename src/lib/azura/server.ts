import 'server-only';
import {createHash} from 'node:crypto';
import {parseChatInput,type AiError} from './protocol';
import {azuraInstruction} from './knowledge';

type Limits={window:number;count:number;active:number;clients:Map<string,{until:number;count:number}>};
const shared=globalThis as typeof globalThis & {__azuraLimits?:Limits};
const limits=shared.__azuraLimits??={window:Date.now(),count:0,active:0,clients:new Map()};
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const error=(code:AiError,status:number)=>Response.json({error:code},{status,headers:{...headers,...(status===429?{'Retry-After':'60'}:{})}});

async function boundedJson(request:Request):Promise<unknown>{
  const reader=request.body?.getReader();if(!reader)throw Error('body');
  const chunks:Uint8Array[]=[];let size=0,expired=false;
  const timer=setTimeout(()=>{expired=true;void reader.cancel().catch(()=>{});},5000);
  try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>36000){await reader.cancel();throw Error('size');}chunks.push(value);}}
  finally{clearTimeout(timer);reader.releaseLock();}
  if(expired)throw Error('timeout');
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
function reserve(request:Request){
  const now=Date.now();
  if(now-limits.window>=3600000){limits.window=now;limits.count=0;}
  for(const [key,entry] of limits.clients)if(entry.until<=now)limits.clients.delete(key);
  // IP hints are not trusted authentication; the global cap also bounds spoofing.
  const id=createHash('sha256').update((request.headers.get('x-forwarded-for')??'local').split(',')[0].slice(0,100)).digest('hex');
  const client=limits.clients.get(id)??{until:now+60000,count:0};
  if(limits.active>=2||limits.count>=60||client.count>=6||(!limits.clients.has(id)&&limits.clients.size>=512))return false;
  client.count++;limits.clients.set(id,client);limits.count++;limits.active++;return true;
}
function record(value:unknown):value is Record<string,unknown>{return !!value&&typeof value==='object'&&!Array.isArray(value);}
function generatedText(value:unknown):string{
  if(!record(value)||!Array.isArray(value.candidates))return '';
  const first:unknown=value.candidates[0];if(!record(first))return '';
  if(first.finishReason!==undefined&&first.finishReason!=='STOP'&&first.finishReason!=='MAX_TOKENS')return '';
  if(!record(first.content)||!Array.isArray(first.content.parts))return '';
  return first.content.parts.flatMap((part:unknown)=>record(part)&&typeof part.text==='string'&&part.thought!==true?[part.text]:[]).join('').trim().slice(0,3500);
}
export async function handleAzura(request:Request,fetcher:typeof fetch=fetch):Promise<Response>{
  const origin=request.headers.get('origin');
  // Next may normalize request.url to its listening hostname. Compare the
  // browser Origin against the actual Host, never an untrusted forwarded host.
  let sameHost=false;
  try{const source=new URL(origin??'');sameHost=(source.protocol==='http:'||source.protocol==='https:')&&source.origin===origin&&source.host===(request.headers.get('host')??new URL(request.url).host);}catch{/* Reject invalid or opaque origins. */}
  if(!sameHost||request.headers.get('sec-fetch-site')==='cross-site')return error('invalid',403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return error('invalid',415);
  let input;try{input=parseChatInput(await boundedJson(request));}catch{return error('invalid',400);}if(!input)return error('invalid',400);
  const key=process.env.GEMINI_API_KEY?.trim(),model=process.env.GEMINI_MODEL?.trim()||'gemini-3.5-flash-lite';
  if(!key||!/^gemini-[a-z0-9.-]+$/.test(model))return error('not_configured',503);
  if(!reserve(request))return error('rate_limit',429);
  try{
    const response=await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},cache:'no-store',
      signal:AbortSignal.any([request.signal,AbortSignal.timeout(25000)]),
      body:JSON.stringify({systemInstruction:{parts:[{text:azuraInstruction(input.locale)}]},contents:[...input.history,{role:'user',text:input.question}].map(turn=>({role:turn.role,parts:[{text:turn.text}]})),generationConfig:{maxOutputTokens:900,thinkingConfig:{thinkingLevel:'minimal'}}}),
    });
    if(!response.ok){await response.body?.cancel();return error(response.status===429?'rate_limit':'upstream',response.status===429?429:502);}
    const text=generatedText(await response.json());if(!text)return error('upstream',502);
    return Response.json({text},{headers});
  }catch(cause){
    if(request.signal.aborted)return error('interrupted',499);
    const timeout=cause instanceof Error&&(cause.name==='TimeoutError'||cause.name==='AbortError');
    return error(timeout?'timeout':'upstream',timeout?504:502);
  }
  finally{limits.active--;}
}
