import {isAiError,type AiError,type ChatTurn} from './protocol';
export interface Reply {text:string;href?:string;label?:string}
export interface Exchange {id:number;question:string;reply:Reply;ready:boolean;error?:AiError;animate?:boolean}
export const CHAT_CACHE_KEY='mhdrhn.azura.history.v1';
export const CHAT_TTL=60*60*1000;
type Saved={expiresAt:number;messages:Exchange[]};
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object';
export function decodeHistory(raw:string|null,now=Date.now()):Saved|null{
  if(!raw||raw.length>500000)return null;
  try{
    const value:unknown=JSON.parse(raw);if(!record(value)||(value.version!==1&&value.version!==2)||typeof value.expiresAt!=='number'||!Number.isFinite(value.expiresAt)||value.expiresAt<=now||value.expiresAt>now+CHAT_TTL)return null;
    const entries=value.version===1?value.questions:value.messages;if(!Array.isArray(entries)||entries.length>20)return null;
    const ids=new Set<number>(),messages:Exchange[]=[];
    for(const entry of entries){
      if(!record(entry)||typeof entry.id!=='number'||!Number.isSafeInteger(entry.id)||entry.id<0||ids.has(entry.id)||typeof entry.question!=='string'||!entry.question.trim()||entry.question.length>500)return null;
      ids.add(entry.id);
      const text=value.version===2&&record(entry.reply)&&typeof entry.reply.text==='string'?entry.reply.text:'';
      if(text.length>3500||entry.error!==undefined&&!isAiError(entry.error))return null;
      messages.push({id:entry.id,question:entry.question,reply:{text},ready:true,error:isAiError(entry.error)?entry.error:!text?'interrupted':undefined});
    }
    return {expiresAt:value.expiresAt,messages};
  }catch{return null;}
}
export function conversationTurns(messages:readonly Exchange[]):ChatTurn[]{
  return messages.filter(m=>m.ready&&!m.error&&m.reply.text).slice(-2).flatMap(m=>[{role:'user' as const,text:m.question},{role:'model' as const,text:m.reply.text}]);
}
export function createChatHistory(){
  const empty:Exchange[]=[];let messages=empty,expiresAt=0,timer:ReturnType<typeof setTimeout>|undefined;
  const listeners=new Set<()=>void>();
  const emit=()=>listeners.forEach(listener=>listener());
  function removeSaved(){try{window.localStorage.removeItem(CHAT_CACHE_KEY);}catch{/* Memory remains usable. */}}
  function save(){try{window.localStorage.setItem(CHAT_CACHE_KEY,JSON.stringify({version:2,expiresAt,messages:messages.map(({id,question,reply,error})=>({id,question,reply:{text:reply.text},error}))}));}catch{/* Storage must not block replies. */}}
  function reset(){clearTimeout(timer);timer=undefined;messages=empty;expiresAt=0;removeSaved();emit();}
  function expire(){if(expiresAt&&expiresAt<=Date.now())reset();}
  function schedule(){clearTimeout(timer);if(expiresAt&&listeners.size)timer=setTimeout(expire,Math.max(0,expiresAt-Date.now()));}
  function restore(){
    try{const raw=window.localStorage.getItem(CHAT_CACHE_KEY),saved=decodeHistory(raw);if(saved){expiresAt=saved.expiresAt;messages=saved.messages;}else{messages=empty;expiresAt=0;if(raw)removeSaved();}}
    catch{expire();}schedule();emit();
  }
  function storage(event:StorageEvent){if(event.key===CHAT_CACHE_KEY||event.key===null)restore();}
  function visibility(){if(!document.hidden)expire();}
  return{
    getSnapshot:()=>messages,getServerSnapshot:()=>empty,
    subscribe(listener:()=>void){listeners.add(listener);if(listeners.size===1){restore();window.addEventListener('storage',storage);document.addEventListener('visibilitychange',visibility);}return()=>{listeners.delete(listener);if(!listeners.size){clearTimeout(timer);window.removeEventListener('storage',storage);document.removeEventListener('visibilitychange',visibility);}};},
    append(message:Exchange){expire();messages=[...messages,message];expiresAt=Date.now()+CHAT_TTL;save();schedule();emit();},
    finish(id:number,reply?:Reply){if(!messages.some(m=>m.id===id))return;messages=messages.map(m=>m.id===id?{...m,reply:reply??m.reply,ready:true,error:undefined,animate:!!reply}:m);save();emit();},
    fail(id:number,error:AiError){if(!messages.some(m=>m.id===id))return;messages=messages.map(m=>m.id===id?{...m,ready:true,reply:{text:''},error,animate:false}:m);save();emit();},
    settle(id?:number){if(!messages.some(m=>m.animate&&(id===undefined||m.id===id)))return;messages=messages.map(m=>id===undefined||m.id===id?{...m,animate:false}:m);emit();},
    reset,
  };
}
