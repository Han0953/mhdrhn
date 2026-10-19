import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const directory='docs/execution/evidence/completeness-2026-10-19';
const read=name=>JSON.parse(fs.readFileSync(`${directory}/${name}`,'utf8'));
const layouts=read('browser-layouts.json').records;
assert.equal(layouts.length,406);
assert.equal(new Set(layouts.map(r=>`${r.route}/${r.viewport}/${r.requestedTheme}`)).size,406);
const failures=layouts.filter(r=>r.scrollWidth>r.width+1||r.offenders.length||r.h1!==1||r.fonts.status!=='loaded'||!r.fonts.syne||!r.fonts.manrope||!r.theme.includes(r.requestedTheme)||r.headings.some(h=>h.ancestors.length)||r.width>r.viewport||r.viewport-r.width>20);
assert.equal(failures.length,0);
const layoutSummary={status:'PASS CSS BOX/ROOT/ANCESTOR CHECKS',cases:406,routes:29,widths:[320,360,390,768,1024,1280,1440],themes:['light','dark'],failures,method:'Actual production app in Codex IAB; font readiness/check, computed style and DOM geometry; actual client widths equal requested width minus scrollbar. Does not certify glyph ink or physical devices.'};
fs.writeFileSync(`${directory}/browser-layout-summary.json`,JSON.stringify(layoutSummary,null,2));
const original=read('floating-layouts.json'), revisions=read('floating-revisions.json'), visible=read('theme-desktop-state.json');
const latest=new Map(), invalid=[];
for(const r of [...original,...revisions]) {
  if(r.width!==r.viewport) {invalid.push({...r,reason:'Requested and actual viewport differ; not accepted'});continue;}
  latest.set(`${r.selector}/${r.theme}/${r.viewport}`,r);
}
latest.set('#theme-options/dark/1440',{selector:'#theme-options',theme:'dark',viewport:1440,width:visible.width,rect:visible.rect,visibility:visible.visibility,hidden:visible.hidden,opacity:visible.opacity});
const accepted=[];
for(const r of latest.values()) {
  const hasBox=r.rect.right-r.rect.left>0, expectedClosed=r.selector==='#site-menu'&&r.viewport>=1280;
  const bounds=r.width===r.viewport&&r.rect.left>=-1&&r.rect.right<=r.width+1&&r.rect.top>=-1&&r.rect.bottom<=901;
  const geometryPass=bounds&&(expectedClosed?!hasBox:hasBox);
  accepted.push({...r,geometryPass,actualVisibleStateVerified:r.selector!=='#theme-options'||r.visibility==='visible'&&r.hidden==='false'&&+r.opacity>0,note:expectedClosed?'Menu auto-closes at desktop breakpoint':r.selector==='#theme-options'&&r.visibility===undefined?'Geometry only; initial measurements omitted visibility/aria-hidden. Not a full visible-state acceptance.':'Open dialog or explicitly visible popover'});
}
assert.equal(accepted.length,42);assert.ok(accepted.every(r=>r.geometryPass));
const floating={method:'Canonical geometry cases after rejecting viewport mismatches and retaining explicit state corrections. Raw diagnostics remain in floating-layouts.json/floating-revisions.json.',geometryCases:accepted.length,visibleStateCases:accepted.filter(r=>r.actualVisibleStateVerified).length,remainingVisibleStates:accepted.filter(r=>!r.actualVisibleStateVerified).length,invalidMeasurements:invalid,records:accepted};
fs.writeFileSync(`${directory}/floating-validation.json`,JSON.stringify(floating,null,2));
const build={command:'npm run build',exitCode:0,status:'PASS',framework:'Next.js 16.2.10',staticOutputs:33,projectDetails:22,buildId:fs.readFileSync('.next/BUILD_ID','utf8').trim(),preview:'http://192.168.1.4:3000/',serverCommand:'npm run start -- --hostname 0.0.0.0 --port 3000',note:'Initial restricted run failed to fetch Google Fonts. Initial network retry was not executed because approval reviewer was at capacity. After user resumed and tool access recovered, the same authorized network build exited 0. stdout is recorded in the chat tool results. Not a production deployment.'};
fs.writeFileSync(`${directory}/build-summary.json`,JSON.stringify(build,null,2));
const images=fs.readdirSync(directory).filter(f=>/\.(jpg|png)$/.test(f)).map(file=>{const bytes=fs.readFileSync(`${directory}/${file}`);return{file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};});
fs.writeFileSync(`${directory}/screenshot-inventory.json`,JSON.stringify({method:'Actual CUA screenshots. Native screenshots can be scaled; requested viewport is corroborated by layout records. Not generated mockups. Files named initial/before are not evidence of reproducing the owner-reported glyph defect.',images},null,2));
console.log(JSON.stringify({layoutCases:layouts.length,layoutFailures:failures.length,floatingGeometryCases:floating.geometryCases,fullyObservedFloatingStates:floating.visibleStateCases,remainingPopupVisibilityCases:floating.remainingVisibleStates,screenshots:images.length,build:build.status},null,2));
