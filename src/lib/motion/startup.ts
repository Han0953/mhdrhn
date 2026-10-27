import {revealSelector} from './selectors';

const startupTargets=`:is(${revealSelector},.hero-identity h1>span,.display-line-content):not(:where(dialog *,[hidden],[hidden] *,.sr-only,.sr-only *,.role-stage *,.portrait-photo,.signal-diagram *,.hero-signal-frame *,[data-motion-static],[data-motion-static] *,summary *,details:not([open])>:not(summary),details:not([open])>:not(summary) *,h1:has(.display-line-content),h2:has(.display-line-content),.hero-identity h1))`;
/** Critical CSS starts on first paint, without waiting for the React bundles. */
export const motionStartupStyle=`
/* The persistent chat launcher lives outside PageMotion. Backwards fill reserves
   its entrance before hydration, then releases all properties to hover/dialog motion. */
@keyframes mhdrhn-azura-enter {from {opacity:0;translate:0 16px;scale:.78;}to {opacity:1;translate:0 0;scale:1;}}
.azura-launcher {animation:mhdrhn-azura-enter .68s cubic-bezier(.22,1,.36,1) .36s backwards;}
@keyframes mhdrhn-startup-in {from {opacity:0;transform:var(--startup-from,translate3d(0,10px,0));}to {opacity:1;transform:none;}}
html:is([data-motion-startup="pending"],[data-motion-startup="ready"]) :where(:has(>[data-page-motion]):not([data-startup-claimed])) ${startupTargets},
[data-startup-reveal="owned"] {animation:mhdrhn-startup-in var(--startup-duration,.65s) cubic-bezier(.22,1,.36,1) var(--startup-delay,0s) both;}
/* New visits retain the coordinated 3D/intro handoff. On reload, readable
   content enters with the header; only the actual scene waits for its frame. */
html:not([data-home-scene-boot="reload"]):not([data-motion-startup="fallback"]) .home-hero:has([data-home-scene][data-scene-state="pending"]) ${startupTargets} {animation-play-state:paused;}
html:not([data-motion-startup="fallback"]) .home-hero:has([data-home-scene][data-scene-state="pending"]) .hero-signal-frame {animation-play-state:paused;}
:is(h1,h2,h3,h4,.display-line-content,.hero-identity h1>span) {--startup-from:perspective(900px) translate3d(0,44px,0) rotate(.7deg);--startup-duration:1.05s;}
.home-hero .hero-identity h1>span {--startup-duration:1.35s;}
.home-hero .hero-greeting {--startup-delay:.09s;}
.home-hero .hero-identity h1>span:nth-child(1) {--startup-delay:.18s;}
.home-hero .hero-identity h1>span:nth-child(2) {--startup-delay:.27s;}
.home-hero .rotating-roles {--startup-delay:.36s;}
.home-hero .hero-signal-frame {--startup-delay:.12s;--startup-duration:1s;}
html[data-home-scene-boot="reload"] .home-hero .hero-signal-frame {--startup-delay:0s;--startup-duration:.55s;--startup-from:translate3d(0,10px,0) scale(.98);}
.home-hero .hero-bottom>p {--startup-delay:.54s;}
.home-hero .hero-bottom .button-primary {--startup-delay:.63s;}
.home-hero .hero-bottom .text-link {--startup-delay:.72s;}
.footer-cta {--startup-from:translate3d(-12px,28px,0);--startup-duration:.95s;}
.footer-back-top {--startup-from:translate3d(-8px,18px,0);--startup-duration:.8s;}
:is(.hero-signal-frame,.story-media,.archive-thumbnail) {--startup-from:translate3d(0,18px,0) scale(.94);--startup-duration:1.1s;}
.desktop-nav>a:nth-child(2) {--startup-delay:65ms;}.desktop-nav>a:nth-child(3) {--startup-delay:130ms;}.desktop-nav>a:nth-child(4) {--startup-delay:195ms;}.desktop-nav>a:nth-child(5) {--startup-delay:260ms;}.desktop-nav>a:nth-child(6) {--startup-delay:325ms;}.desktop-nav>a:nth-child(7) {--startup-delay:390ms;}
.header-controls-entry {--startup-delay:455ms;}
@media(max-width:1279px) {.header-controls-entry {--startup-delay:130ms;}}
@media(max-width:767px) {:is(h1,h2,h3,h4,.display-line-content,.hero-identity h1>span) {--startup-from:perspective(900px) translate3d(0,24px,0) rotate(.4deg);}}
`;

/** Parser-time enhancement only. No JS, blocked scripts and Minimal stay readable. */
export const motionStartupScript = `(()=>{
  var root=document.documentElement;
  if(window.__mhdrhnMotionStarted||root.hasAttribute('data-motion-startup'))return;
  window.__mhdrhnMotionStarted=true;
  var mode='system';
  try{if(localStorage.getItem('mhdrhn-motion')==='minimal')mode='minimal';}catch{}
  root.dataset.motion=mode;
  if(mode==='minimal'||typeof IntersectionObserver==='undefined'||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
    root.dataset.motionStartup='skipped';return;
  }
  root.dataset.motionStartup='pending';
  var timer;
  var events=['keydown','wheel','touchstart','pagehide'];
  function finish(state){
    if(root.dataset.motionStartup!=='pending')return;
    root.dataset.motionStartup=state;
    clearTimeout(timer);
    window.removeEventListener('mhdrhn:motion-staged',ready);
    events.forEach(function(name){window.removeEventListener(name,fallback);});
  }
  function ready(){finish('ready');}
  function fallback(event){
    // Touch/wheel input against the intro must not consume the page entrance.
    if(event&&event.type!=='pagehide'&&(root.dataset.visitIntro==='active'||root.dataset.visitIntro==='leaving'))return;
    finish('fallback');
  }
  window.addEventListener('mhdrhn:motion-staged',ready);
  events.forEach(function(name){window.addEventListener(name,fallback,{passive:true});});
  timer=setTimeout(fallback,5000);
})();`;

export function motionStartupFailed() {
  return document.documentElement?.dataset.motionStartup === 'fallback';
}

/** Header/footer readiness cannot release a still-unprepared destination main. */
export function releaseMotionStartup(root:HTMLElement) {
  const main=root.closest('main');
  const reload=root.ownerDocument?.documentElement.dataset.homeSceneBoot==='reload';
  if(main&&(reload||!main.querySelector?.('[data-home-scene][data-scene-state="pending"]')))window.dispatchEvent(new Event('mhdrhn:motion-staged'));
}

type StartupClaim={animations:Animation[];complete:()=>void;onComplete:()=>void};
const claims=new WeakMap<HTMLElement,StartupClaim>();
const startupAnimations=(node:HTMLElement)=>node.getAnimations?.().filter(animation=>'animationName' in animation&&animation.animationName==='mhdrhn-startup-in')??[];

/** Keep the browser's already-playing entrance; hydration must not reset it. */
export function claimStartupReveal(node:HTMLElement,onComplete:()=>void) {
  if(node.dataset.startupReveal==='done')return true;
  const existing=claims.get(node);
  if(existing){existing.onComplete=onComplete;return true;}
  if(!getComputedStyle(node).animationName.split(',').some(name=>name.trim()==='mhdrhn-startup-in'))return false;
  const animations=startupAnimations(node);
  const claim:StartupClaim={animations,onComplete,complete(){
    if(claims.get(node)!==claim)return;
    claims.delete(node);node.dataset.startupReveal='done';claim.onComplete();
  }};
  claims.set(node,claim);node.dataset.startupReveal='owned';
  if(animations.length)void Promise.allSettled(animations.map(animation=>animation.finished)).then(claim.complete);
  return true;
}

export function settleStartupReveal(node:HTMLElement) {
  const claim=claims.get(node);if(!claim)return;
  claim.animations.forEach(animation=>{try{animation.finish();}catch{/* Detached or already cancelled. */}});
  claim.complete();
}
