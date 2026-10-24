/** Bounded word cadence; no perpetual interval or per-word animation owners. */
export function revealAnswer(text:string,part:(previous:number,end:number)=>void,done:()=>void){
  const ends=Array.from(text.matchAll(/\S+\s*/gu),m=>m.index+m[0].length);
  const batch=Math.max(1,Math.ceil(ends.length/100));
  let current=0,previous=0,stopped=false,timer:ReturnType<typeof setTimeout>;
  function tick(){if(stopped)return;current=Math.min(ends.length,current+batch);const end=ends[current-1]??text.length;part(previous,end);previous=end;if(current>=ends.length){timer=setTimeout(()=>{if(!stopped)done();},120);}else timer=setTimeout(tick,35);}
  timer=setTimeout(tick,35);
  return()=>{stopped=true;clearTimeout(timer);};
}
