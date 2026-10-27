import 'server-only';
import {createHmac,randomUUID} from 'node:crypto';
import {isIP} from 'node:net';
import {firebaseCredentials,changeFirebaseQuota} from './firestore';

type Reservation = {ok:true;release:()=>Promise<void>} | {ok:false;reason:'limited'|'unavailable';retryAfter?:number};
const MINUTE=60000,HOUR=3600000,LEASE=60000;
type Memory={version:2;hour:number[];minute:number[];active:Map<string,number>;clients:Map<string,number[]>};
const shared=globalThis as typeof globalThis & {__azuraLimits?:Memory};
function localReservation():Reservation{
  // Next dev keeps globalThis during HMR, including the previous limiter's shape.
  if(shared.__azuraLimits?.version!==2)shared.__azuraLimits={version:2,hour:[],minute:[],active:new Map(),clients:new Map()};
  const state=shared.__azuraLimits;
  const now=Date.now();
  state.hour=state.hour.filter(at=>at>now-HOUR);state.minute=state.minute.filter(at=>at>now-MINUTE);
  for(const [id,until] of state.active)if(until<=now)state.active.delete(id);
  // Local dev never trusts request-supplied IP headers.
  const recent=(state.clients.get('local')??[]).filter(at=>at>now-MINUTE);
  const waits=[recent.length>=6?recent[0]+MINUTE-now:0,state.minute.length>=10?state.minute[0]+MINUTE-now:0,state.hour.length>=60?state.hour[0]+HOUR-now:0,state.active.size>=2?Math.min(...state.active.values())-now:0];
  const wait=Math.max(...waits);
  if(wait>0)return {ok:false,reason:'limited',retryAfter:Math.ceil(wait/1000)};
  const token=randomUUID();state.clients.set('local',[...recent,now]);state.minute.push(now);state.hour.push(now);state.active.set(token,now+LEASE);
  return {ok:true,release:async()=>{state.active.delete(token);}};
}

export async function reserveAzura(request:Request,fetcher:typeof fetch=fetch):Promise<Reservation>{
  // Explicit opt-in permits local Firestore testing; public deployment always requires it.
  const remote=process.env.NODE_ENV==='production'||process.env.VERCEL==='1'||process.env.AZURA_LIMITER_MODE==='firestore';
  if(!remote)return localReservation();
  const config=firebaseCredentials(),salt=process.env.AZURA_RATE_LIMIT_SALT?.trim();
  if(!config||!salt||salt.length<32)return {ok:false,reason:'unavailable'};
  const ip=process.env.VERCEL==='1'?request.headers.get('x-vercel-forwarded-for')?.trim():process.env.NODE_ENV!=='production'?'127.0.0.1':undefined;
  if(!ip||!isIP(ip))return {ok:false,reason:'unavailable'};
  const canonical=isIP(ip)===6?new URL('http://['+ip+']/').hostname:ip;
  const client=createHmac('sha256',salt).update(canonical).digest('hex'),token=randomUUID();
  try{
    const result=await changeFirebaseQuota(config,client,token,false,fetcher,AbortSignal.any([request.signal,AbortSignal.timeout(6000)]));
    if(!result.allowed)return {ok:false,reason:'limited',retryAfter:result.retryAfter};
    return {ok:true,release:async()=>{
      try{await changeFirebaseQuota(config,client,token,true,fetcher,AbortSignal.timeout(6000));}
      catch{if(process.env.AZURA_LOG_EVENTS!=='0')console.warn(JSON.stringify({event:'azura_limiter_release_failed'}));}
    }};
  }catch{return {ok:false,reason:'unavailable'};}
}
