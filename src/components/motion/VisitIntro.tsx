import type {CSSProperties} from 'react';

const greetings=[['id','Halo'],['en','Hello'],['es','Hola'],['fr','Bonjour'],['it','Ciao'],['pt','Olá'],['ja','こんにちは'],['ko','안녕하세요'],['ar','مرحبًا'],['id','Halo']];

/** Decorative first-entry sequence, outside the translated page tree. */
export function VisitIntro(){
  return <div className="visit-intro" aria-hidden="true" data-lenis-prevent>
    <div className="visit-intro-columns">{Array.from({length:5},(_,index)=><span key={index} style={{'--column':index} as CSSProperties}/>)}</div>
    <div className="visit-intro-content">
      <div className="visit-intro-greetings">{greetings.map(([lang,text],index)=><span key={index} lang={lang} dir={lang==='ar'?'rtl':undefined} style={{'--greeting':index} as CSSProperties}>{text}<i>.</i></span>)}</div>
      <div className="visit-intro-loading">
        <div className="visit-intro-progress"><span/></div>
        <div className="visit-intro-status"><span>compile<span className="visit-intro-dots">...</span></span><span>initialize...</span><span>render...</span><span>ready.</span></div>
      </div>
    </div>
  </div>;
}
