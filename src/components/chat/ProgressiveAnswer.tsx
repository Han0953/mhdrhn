'use client';
import {useEffect,useLayoutEffect,useState} from 'react';
import {motion} from 'framer-motion';
import {revealAnswer} from '@/lib/azura/reveal';

export function ProgressiveAnswer({id,text,animate,reduced,onDone,onProgress}:{id:number;text:string;animate:boolean;reduced:boolean;onDone:(id:number)=>void;onProgress:()=>void}){
  const [range,setRange]=useState({previous:0,end:0});
  useEffect(()=>{
    if(!animate)return;
    if(reduced){onDone(id);return;}
    return revealAnswer(text,(previous,end)=>setRange({previous,end}),()=>onDone(id));
  },[id,text,animate,reduced,onDone]);
  useLayoutEffect(()=>{onProgress();},[range,onProgress]);
  if(!animate||reduced)return <p data-no-translate>{text}</p>;
  return <p data-no-translate><span className="sr-only">{text}</span><span aria-hidden="true">{text.slice(0,range.previous)}<motion.span key={range.end} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.12}}>{text.slice(range.previous,range.end)}</motion.span></span></p>;
}
