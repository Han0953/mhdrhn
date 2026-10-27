import {isAiError,type AiError,type ChatInput} from './protocol';
let retryUntil=0;
export async function requestAnswer(input:ChatInput,signal:AbortSignal):Promise<{text:string}|{error:AiError}>{
  // Do not spend another request while the server's quota window is still closed.
  // Resetting the transcript never resets the server quota or this local cooldown.
  if(Date.now()<retryUntil)return {error:'rate_limit'};
  const controller=new AbortController(),abort=()=>controller.abort();
  signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();
  const timer=setTimeout(abort,45000);
  try{
    const response=await fetch('/api/azura',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:controller.signal,cache:'no-store'});
    if(response.status===429){const seconds=Number(response.headers.get('retry-after'));retryUntil=Date.now()+Math.min(3600,Math.max(1,Number.isFinite(seconds)&&seconds>0?seconds:60))*1000;}
    const data:unknown=await response.json();
    if(data&&typeof data==='object'){
      const value=data as Record<string,unknown>;
      if(response.ok&&typeof value.text==='string'&&value.text.trim()&&value.text.length<=3500)return{text:value.text};
      if(isAiError(value.error))return{error:value.error};
    }
    return {error:'upstream'};
  }catch{return {error:signal.aborted?'interrupted':controller.signal.aborted?'timeout':'upstream'};}
  finally{clearTimeout(timer);signal.removeEventListener('abort',abort);}
}
