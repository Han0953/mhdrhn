import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadContent } from './load-content.mjs';

const directory = process.env.MHDRHN_QA_TECHNOLOGY_EVIDENCE || 'docs/execution/evidence/technology-inventory-2026-10-19';
fs.mkdirSync(directory,{recursive:true});
const master=fs.readFileSync('agent/docs/DATA.md','utf8');
const {technologyInventoryGroups:groups,technologyInventoryItems:items,homeTechnologyGroups:homeGroups,ownerSoftware,inventoryIconNames}=loadContent('src/lib/technology-inventory.ts');
const {skillGroups}=loadContent('src/lib/portfolio.ts');
const results=[];
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log(`PASS ${name}`);}
function sourceItems(section){
  const source=master.match(new RegExp(`^## 12\\.${section} [^\\n]+\\n([\\s\\S]*?)(?=^##? |$(?![\\s\\S]))`,'m'));
  assert.ok(source,`Missing DATA 12.${section}`);
  return [...source[1].matchAll(/^- (.+)$/gm)].flatMap(match=>match[1].replace(/\s*\([^)]*\)/g,'').split(/,\s*/)).map(name=>name.trim());
}
await check('all DATA 12.1–8 inventory entries are present exactly once in the full inventory, independently parsed from the document',()=>{
  const aliases={'Bug Hunting pada aplikasi/game mobile':'Bug Hunting','User Experience Testing pada aplikasi mobile':'User Experience Testing'};
  for(let section=1;section<=8;section++)for(const raw of sourceItems(section)){
    const name=aliases[raw]??raw;const matches=items.filter(item=>item.name===name);
    assert.equal(matches.length,1,`DATA 12.${section}: ${name}`);assert.equal(matches[0].source,`DATA §12.${section}`);
  }
});
await check('current owner selection replaces Codex while preserving the historical DATA software record',()=>{
  const recorded=['VS Code','Antigravity IDE','Codex','Canva','Microsoft Office','Arduino IDE','Android Studio','Git','Wokwi','AutoCAD','Cirkit Designer IDE','Open Code','Claude Code'];
  const expected=recorded.filter(name=>name!=='Codex');
  assert.deepEqual(Array.from(ownerSoftware,item=>item.name),expected);assert.deepEqual(sourceItems(9),recorded);
  const tools=groups.find(g=>g.id==='tools');assert.equal(tools.items.length,13);
  expected.concat('MIT App Inventor').forEach(name=>assert.ok(tools.items.some(item=>item.name===name),name));
  for(const name of ['Monaco Editor','React Flow / XYFlow','Vitest','Playwright','Laravel Pint'])assert.ok(!tools.items.some(item=>item.name===name),name);
});
await check('requested and source Learning markers are consistent in Home and About',()=>{
  const learning=['Python','MicroPython','Dart','Flutter','Firebase','STM32','Raspberry Pi'];
  assert.deepEqual(Array.from(items.filter(item=>item.learning),item=>item.name).sort(),learning.toSorted());
  for(const name of learning)assert.equal(skillGroups.flatMap(g=>g.skills).find(item=>item.name===name)?.learning,true,name);
  assert.ok(master.includes('- Dart (**Learning**)'),'Preserve owner Dart edit');
});
await check('every item has one stable ID, name, known icon, source, and no navigation destination',()=>{
  assert.equal(new Set(items.map(item=>item.id)).size,items.length);assert.equal(new Set(items.map(item=>item.name)).size,items.length);
  for(const item of items){assert.ok(inventoryIconNames.includes(item.icon),item.name);if(['problem-solving','teamwork'].includes(item.id))assert.equal(item.source,'Konfirmasi pemilik · 23 Oktober 2026');else assert.match(item.source,/^DATA §(?:9|12)\./);assert.ok(!('href'in item));}
});
await check('hardware and IoT inventories are complete while project code tools retain accurate provenance',()=>{
  const embedded=groups.find(g=>g.id==='embedded');assert.equal(embedded.items.length,11);
  for(const name of ['Arduino Uno','Arduino Nano','ESP8266','ESP32','STM32','Raspberry Pi','MQTT','Blynk / Blynk Cloud HTTP API','Remote Monitoring','Smart Automation','Sensor Monitoring'])assert.ok(embedded.items.some(item=>item.name===name),name);
  for(const name of ['TypeScript','Monaco Editor','React Flow / XYFlow','Vitest','Playwright'])assert.equal(items.find(item=>item.name===name).basis,'team');
  assert.equal(items.find(item=>item.name==='Laravel Pint').basis,'project');
});
const origin=process.env.MHDRHN_QA_ORIGIN;
if(origin){
  assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname));
  const response=await fetch(origin);assert.equal(response.status,200);const html=(await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  const section=html.match(/<section\b[^>]*data-home-section="technology"[^>]*>([\s\S]*?)<\/section>/)?.[1];assert.ok(section);
  await check('actual Home SSR technology section contains no links, buttons, tabindex or navigation affordances',()=>{
    assert.doesNotMatch(section,/<a\b|<button\b|tabindex=|role="(?:link|button)"|Seluruh bidang &amp; kemampuan/i);
    assert.equal((section.match(/data-inventory-group=/g)||[]).length,4);
  });
  await check('Home curates 34 records across four groups, preserving source identity, icons and only Learning labels',()=>{
    const preview=homeGroups.flatMap(g=>g.items);assert.equal(preview.length,34);assert.equal((section.match(/data-technology=/g)||[]).length,34);
    assert.ok(homeGroups.every(g=>g.items.length>=6));assert.doesNotMatch(section,/Team Stack|data-basis="(?:team|project)"/);
    assert.equal((section.match(/<svg\b/g)||[]).length,34);assert.equal((section.match(/data-basis="learning"/g)||[]).length,4);
    for(const item of preview){assert.ok(items.some(full=>full.id===item.id&&full.source===item.source));const row=section.match(new RegExp(`<li[^>]*data-technology="${item.id}"[^>]*>([\\s\\S]*?)<\\/li>`))?.[1];assert.ok(row,item.name);assert.ok(row.includes(item.name.replaceAll('&','&amp;')),item.name);assert.match(row,/<svg[^>]*aria-hidden="true"/);if(item.learning)assert.match(row,/data-basis="learning"/);}
  });
  await check('About owns all 69 names with matching SVGs and exactly seven Learning records',async()=>{
    const response=await fetch(origin+'/about');assert.equal(response.status,200);const about=(await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
    assert.equal(items.length,69);assert.equal((about.match(/data-technology=/g)||[]).length,69);
    for(const item of items){const row=about.match(new RegExp(`<li[^>]*data-technology="${item.id}"[^>]*>([\\s\\S]*?)<\\/li>`))?.[1];assert.ok(row,item.name);assert.ok(row.includes(item.name.replaceAll('&','&amp;')),item.name);assert.match(row,/<svg[^>]*aria-hidden="true"/);if(item.learning)assert.match(row,/data-basis="learning"/);assert.doesNotMatch(row,/data-basis="(?:team|project)"/);}
    assert.equal((about.match(/class="technology-badge" data-basis="learning"/g)||[]).length,7);
  });
  await check('About keeps new learning fields and the unrelated Home/story content remains available',async()=>{
    const about=await fetch(origin+'/about');assert.equal(about.status,200);const text=await about.text();for(const name of ['Raspberry Pi','MicroPython','STM32','Dart'])assert.ok(text.includes(name));
    assert.equal((html.match(/data-project-slug=/g)||[]).length,10);assert.equal((html.match(/data-home-achievement=/g)||[]).length,5);
  });
}
fs.writeFileSync(`${directory}/inventory-checks.json`,JSON.stringify({origin:origin??null,total:items.length,groups:groups.map(g=>({id:g.id,count:g.items.length})),results},null,2));
console.log(`${results.length} technology inventory checks passed.`);
