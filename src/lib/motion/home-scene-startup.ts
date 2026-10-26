/** The existing red tab curtain doubles as the initial Home render barrier. */
export const homeSceneStartupStyle=`
html[data-home-scene-boot="pending"] .route-transition-viewport {display:block;visibility:visible;pointer-events:auto;}
html[data-home-scene-boot="pending"] .route-wipe {transform:translateX(0)!important;}
html:is([data-home-scene-boot="pending"],[data-home-scene-boot="covered"]) :is([data-startup-reveal="owned"],.azura-launcher),
html:is([data-home-scene-boot="pending"],[data-home-scene-boot="covered"]) :where(:has(>[data-page-motion]):not([data-startup-claimed])) * {animation-play-state:paused;}
`;
export const homeSceneStartupScript=`(()=>{
 if(window.__mhdrhnHomeSceneBoot)return;window.__mhdrhnHomeSceneBoot=true;
 if(!/^\\/(?:en\\/?|id\\/?)?$/.test(location.pathname))return;
 // Refresh follows every other tab: no route curtain for the current page.
 // A new visit and an actual tab navigation keep their existing readiness gate.
 var nav=window.performance&&window.performance.getEntriesByType('navigation')[0];
 if(nav&&nav.type==='reload')return;
 var root=document.documentElement;root.dataset.homeSceneBoot='pending';
 var timer=setTimeout(finish,10000);
 function finish(){root.dataset.homeSceneBoot='done';clearTimeout(timer);window.removeEventListener('mhdrhn:home-scene-released',finish);window.removeEventListener('pagehide',finish);window.removeEventListener('mhdrhn:scene-settled',settled);}
 function settled(){if(root.dataset.homeSceneBoot==='pending')finish();}
 window.addEventListener('mhdrhn:scene-settled',settled);window.addEventListener('mhdrhn:home-scene-released',finish);window.addEventListener('pagehide',finish);
})();`;
