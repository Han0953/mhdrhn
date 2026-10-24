import {isAiError,type AiError,type ChatInput} from './protocol';
export async function requestAnswer(input:ChatInput,signal:AbortSignal):Promise<{text:string}|{error:AiError}>{
  const controller=new AbortController(),abort=()=>controller.abort();
  signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();
  const timer=setTimeout(abort,30000);
  try{
    const response=await fetch('/api/azura',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:controller.signal,cache:'no-store'});
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
