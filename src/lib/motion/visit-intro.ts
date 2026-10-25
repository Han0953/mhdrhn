import {revealSelector} from './selectors';

/** Critical styles run before React; page entrances retain their playback position. */
export const visitIntroStyle=`
.visit-intro {display:none;}
html:is([data-visit-intro="active"],[data-visit-intro="leaving"]) {overflow:hidden;overscroll-behavior:none;scrollbar-gutter:auto;}
html:is([data-visit-intro="active"],[data-visit-intro="leaving"]) .visit-intro {display:grid;position:fixed;inset:0;width:100vw;z-index:100000;place-items:center;color:var(--intro-fg);isolation:isolate;touch-action:none;}
html[data-visit-intro-tone="dark"] {--intro-bg:#111;--intro-fg:#f3f0e9;}
html[data-visit-intro-tone="light"] {--intro-bg:#f3f0e9;--intro-fg:#111;}
.visit-intro-columns {position:absolute;inset:0;display:grid;grid-template-columns:repeat(5,1fr);z-index:-1;}
.visit-intro-columns>span {background:var(--intro-bg);margin-inline-end:-1px;}
.visit-intro-content {position:absolute;inset:0;}
/* A fixed viewport track keeps the widest language from pushing other words sideways. */
.visit-intro-greetings {position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr);place-items:center;font-family:var(--font-display),sans-serif;font-size:clamp(48px,8vw,88px);font-weight:600;line-height:1.5;letter-spacing:-.035em;}
.visit-intro-greetings>span {grid-area:1/1;white-space:nowrap;opacity:0;animation:visit-greeting .38s cubic-bezier(.22,1,.36,1) calc(var(--greeting)*.38s) both;}
.visit-intro-greetings>span:last-child {animation:visit-greeting-final .38s cubic-bezier(.22,1,.36,1) 3.42s both;}
.visit-intro-greetings i {font-style:normal;color:#e33c48;}
.visit-intro-loading {position:absolute;left:50%;top:calc(50% + clamp(72px,12vw,112px));width:min(380px,calc(100vw - 64px));transform:translateX(-50%);}
.visit-intro-progress {height:2px;background:color-mix(in srgb,var(--intro-fg) 20%,transparent);overflow:hidden;}
.visit-intro-progress>span {display:block;height:100%;background:var(--intro-fg);transform-origin:left;animation:visit-progress 4s cubic-bezier(.35,.05,.25,1) both;}
.visit-intro-status {display:grid;margin-top:14px;font-family:var(--font-body),sans-serif;font-size:11px;letter-spacing:.06em;line-height:1.8;}
.visit-intro-status>span {grid-area:1/1;animation:visit-status 1s both;}
.visit-intro-status>span:nth-child(2) {animation-delay:1s;}.visit-intro-status>span:nth-child(3) {animation-delay:2s;}.visit-intro-status>span:last-child {animation:visit-greeting-final .3s ease 3s both;}
.visit-intro-dots {display:inline-block;animation:visit-dots .7s ease-in-out infinite alternate;}
html[data-visit-intro="leaving"] .visit-intro-content {animation:visit-content-out .3s ease both;}
html[data-visit-intro="leaving"] .visit-intro-columns>span {animation:visit-column-out 1.25s cubic-bezier(.76,0,.24,1) calc(.3s + var(--column)*.13s) both;}
/* Neither the initial CSS entrance nor Azura may finish underneath the intro. */
html:is([data-visit-intro="active"],[data-visit-intro="leaving"]) :is([data-startup-reveal="owned"],.azura-launcher),
html:is([data-visit-intro="active"],[data-visit-intro="leaving"]) :where(:has(>[data-page-motion]):not([data-startup-claimed])) :is(${revealSelector},.hero-identity h1>span,.display-line-content) {animation-play-state:paused;}
@keyframes visit-greeting {0% {opacity:0;transform:translateY(14px);}24%,70% {opacity:1;transform:none;}100% {opacity:0;transform:translateY(-12px);}}
@keyframes visit-greeting-final {from {opacity:0;transform:translateY(10px);}to {opacity:1;transform:none;}}
@keyframes visit-progress {from {transform:scaleX(0);}to {transform:scaleX(1);}}
@keyframes visit-status {0% {opacity:0;transform:translateY(5px);}15%,85% {opacity:.65;transform:none;}100% {opacity:0;transform:translateY(-5px);}}
@keyframes visit-dots {to {opacity:.25;}}
@keyframes visit-content-out {to {opacity:0;transform:translateY(-12px);}}
@keyframes visit-column-out {to {transform:translateY(-101%);}}
`;

/** External/address entry qualifies; reload, history and internal links do not. */
export const visitIntroScript=`(()=>{
 if(window.__mhdrhnVisitIntroStarted)return;window.__mhdrhnVisitIntroStarted=true;
 var root=document.documentElement,media=window.matchMedia('(prefers-reduced-motion: reduce)'),nav=performance.getEntriesByType('navigation')[0];
 var minimal=false,theme='system';try{minimal=localStorage.getItem('mhdrhn-motion')==='minimal';theme=localStorage.getItem('theme')||'system';}catch{}
 var internal=false;try{internal=!!document.referrer&&new URL(document.referrer).origin===location.origin;}catch{}
 if(!nav||nav.type!=='navigate'||internal||minimal||media.matches||typeof IntersectionObserver==='undefined'){root.dataset.visitIntro='skipped';return;}
 root.dataset.visitIntroTone=(theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches))?'light':'dark';
 root.dataset.visitIntro='active';
 var minimum=false,ready=false,disposed=false,timers=[],started=false;
 function later(fn,ms){var id=setTimeout(fn,ms);timers.push(id);}
 function finish(){if(disposed)return;disposed=true;root.dataset.visitIntro='done';timers.forEach(clearTimeout);window.removeEventListener('mhdrhn:motion-staged',staged);window.removeEventListener('keydown',key);window.removeEventListener('pagehide',finish);window.removeEventListener('pageshow',restore);document.removeEventListener('DOMContentLoaded',start);media.removeEventListener('change',reduce);}
 function leave(){if(disposed||!minimum||!ready||root.dataset.visitIntro!=='active')return;root.dataset.visitIntro='leaving';later(finish,2100);}
 function staged(){ready=true;leave();}
 function key(event){if(event.key==='Escape'||event.key==='Tab')finish();}
 function reduce(){if(media.matches)finish();}
 function restore(event){if(event.persisted)finish();}
 function start(){if(started||disposed)return;started=true;later(function(){minimum=true;leave();},4000);}
 window.addEventListener('mhdrhn:motion-staged',staged);window.addEventListener('keydown',key);window.addEventListener('pagehide',finish);window.addEventListener('pageshow',restore);media.addEventListener('change',reduce);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 later(finish,10000);
})();`;
