"use client";

import {useLayoutEffect,useRef,useState} from 'react';
import {Layers,RotateCcw} from 'lucide-react';
import type {SignalCore} from '@/lib/three/signal-core';
import {useTranslation} from '@/i18n/LocaleProvider';
import {languageMotionActive} from '@/lib/motion/language-checkpoint';

// A locale commit may remount Home. Move the real renderer, never a screenshot,
// to the new host; release the short handoff lease if that host never arrives.
let retained:{controller:SignalCore;abort:AbortController;timer:ReturnType<typeof setTimeout>}|null=null;

export function HeroSignal3D(){
  const {locale}=useTranslation(),en=locale==='en';
  const root=useRef<HTMLElement>(null),host=useRef<HTMLDivElement>(null),surface=useRef<HTMLButtonElement>(null),core=useRef<SignalCore|null>(null);
  const [phase,setPhase]=useState('pending'),[active,setActive]=useState(0),[expanded,setExpanded]=useState(false);
  useLayoutEffect(()=>{
    const element=root.current,stage=host.current,button=surface.current;if(!element||!stage||!button)return;
    // An App Router history cache can retain React state after effects were stopped.
    // Re-arm readiness before a new renderer starts, even when phase was "ready".
    let disposed=false,frame=0;const held=retained;retained=null;
    // A translated host must receive the live canvas before the browser paints.
    // Only a genuinely new renderer needs the pending/readiness barrier.
    if(!held)element.dataset.sceneState='pending';
    const abort=held?.abort??new AbortController();
    function settle(value:'ready'|'unavailable'){
      if(disposed)return;element!.dataset.sceneState=value;setPhase(value);
      element!.dispatchEvent(new Event('mhdrhn:scene-state'));
      window.dispatchEvent(new Event('mhdrhn:scene-settled'));
      if(document.querySelector('main [data-motion-ready="true"]'))window.dispatchEvent(new Event('mhdrhn:motion-staged'));
    }
    function fail(){clearTimeout(timer);cancelAnimationFrame(frame);abort.abort();core.current=null;settle('unavailable');disposed=true;}
    const timer=setTimeout(fail,8000);element.addEventListener('mhdrhn:scene-timeout',fail);
    if(held){
      clearTimeout(held.timer);clearTimeout(timer);core.current=held.controller;held.controller.attach(stage,button,fail);
      element.dataset.sceneState='ready';
      queueMicrotask(()=>{if(!disposed){const state=held.controller.state();setActive(state.selected);setExpanded(state.expanded);settle('ready');}});
    }else void import('@/lib/three/signal-core').then(async({mountSignalCore})=>{
      if(disposed)return;
      const controller=await mountSignalCore(stage,button,fail,abort.signal);
      if(disposed){controller.dispose();return;}core.current=controller;
      frame=requestAnimationFrame(()=>{if(!disposed){clearTimeout(timer);settle('ready');}});
    }).catch(()=>{clearTimeout(timer);settle('unavailable');});
    return()=>{disposed=true;cancelAnimationFrame(frame);clearTimeout(timer);element.removeEventListener('mhdrhn:scene-timeout',fail);
      const controller=core.current;core.current=null;
      if(controller&&languageMotionActive()){
        if(retained){clearTimeout(retained.timer);retained.abort.abort();retained.controller.dispose();}
        const lease={controller,abort,timer:setTimeout(()=>{if(retained===lease){retained=null;abort.abort();controller.dispose();}},1000)};retained=lease;
      }else{abort.abort();controller?.dispose();}
    };
  },[]);
  return <figure ref={root} className="hero-scene" data-home-scene data-scene-state={phase} data-motion-static>
    <div className="hero-scene-heading"><span className="eyebrow">{en?'From signal to system':'Dari sinyal ke sistem'}</span><span className="meta">01 / SIGNAL CORE</span></div>
    <div className="hero-scene-stage" ref={host}>
      <button ref={surface} type="button" className="hero-scene-surface" disabled={phase!=='ready'} aria-label={en?'Rotate the 3D assembly by dragging or using the arrow keys. Click to send a signal.':'Putar objek 3D dengan menyeret atau tombol panah. Klik untuk mengalirkan sinyal.'}/>
    </div>
    <div className="hero-scene-toolbar">
      <div className="hero-scene-steps" role="group" aria-label={en?'Explore the engineering process':'Jelajahi alur engineering'}>{['Sense','Compute','Build'].map((title,index)=><button key={title} type="button" disabled={phase!=='ready'} aria-pressed={active===index} onClick={()=>{setActive(index);core.current?.select(index);}}><span className="meta">0{index+1}</span>{title}</button>)}</div>
      <div className="hero-scene-actions"><button className="icon-button" type="button" disabled={phase!=='ready'} aria-pressed={expanded} aria-label={en?'Separate the layers':'Pisahkan lapisan'} title={en?'Separate the layers':'Pisahkan lapisan'} onClick={()=>{setExpanded(!expanded);core.current?.explode(!expanded);}}><Layers size={17}/></button><button className="icon-button" type="button" disabled={phase!=='ready'} aria-label={en?'Reset the view':'Atur ulang tampilan'} title={en?'Reset the view':'Atur ulang tampilan'} onClick={()=>{setExpanded(false);setActive(0);core.current?.explode(false);core.current?.select(0);}}><RotateCcw size={16}/></button></div>
    </div>
    <figcaption className="meta">{en?'Drag to explore · Click to send a signal':'Geser untuk menjelajah · Klik untuk mengalirkan sinyal'}</figcaption>
  </figure>;
}
