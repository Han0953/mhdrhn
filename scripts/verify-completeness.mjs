// Per-record source reconciliation plus SSR coverage. No browser claims are made here.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadContent } from './load-content.mjs';
const directory = process.env.MHDRHN_QA_COMPLETENESS_EVIDENCE || 'docs/execution/evidence/completeness-2026-10-19';
fs.mkdirSync(directory, { recursive: true });
const master = fs.readFileSync('agent/docs/DATA.md', 'utf8');
const legacy = loadContent('src/lib/data.ts');
const content = loadContent(), portfolio = loadContent('src/lib/portfolio.ts');
const awards = loadContent('src/lib/achievement-records.ts'), capabilities = loadContent('src/lib/capabilities.ts');
const results = [], records = [];
const origin = process.env.MHDRHN_QA_ORIGIN;
if (origin) assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname));
function check(name, test) { test(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
function sourceSection(section) {
  if (section === '10') return master.split('# 10. ')[1].split('# 11. ')[0];
  const match = master.match(new RegExp(`^## ${section.replace('.', '\\.')} [^\\n]+\\n([\\s\\S]*?)(?=^##? |$(?![\\s\\S]))`, 'm'));
  assert.ok(match, `Missing source section ${section}`); return match[0];
}
function row(id, category, source, route, text, note = '', status = 'PUBLIC') {
  records.push({ id, category, source, sourceStatus: status === 'PUBLIC' ? 'Source matched; publication allowed' : status, publication: status, route, expectedText: text, implementation: status === 'PUBLIC' ? 'SSR pending' : 'WITHHELD', note });
}
const expectedProjects = [
  ['vircuit','9.2','Vircuit'],['aura-pod','9.1','AURA POD'],['website-pvte-himpteka','9.3','PVTE'],
  ['iot-egg-incubator-research','9.4','MQTT'],['iot-egg-incubator-blynk','9.5','Blynk'],['website-lazismu-kuansing','9.6','LAZISMU'],
  ['air-quality-monitoring','9.7','Air Quality Monitoring System'],['smart-home-iot','9.8','Smart Home IoT'],['industrial-machine-safety','9.9','Industrial Machine Safety System'],['drone-stm32','9.10','Drone STM32'],['zhy-ai','9.11','Zhy AI'],['mhdrhn-portfolio','9.12','mhdrhn.'],
  ['running-text-display','10','Running Text Display'],['robot-tank-wifi-esp8266','10','Robot Tank WiFi ESP8266'],['robot-arm','10','Robot Arm'],['robot-wifi-car-esp32','10','Robot WiFi Car ESP32'],['automatic-plant-watering','10','Automatic Plant Watering System'],['smart-reminder','10','Smart Reminder'],['early-fire-detection','10','Early Fire Detection System'],['solar-tracking-system','10','Solar Tracking System'],['mini-radar-detection','10','Mini Radar Detection'],['academic-information-dashboard','10','Academic Information Dashboard'],
];
check('every project identity resolves to its own source section and summary, not just a catalog total', () => {
  assert.equal(content.getPublishedProjects().length, expectedProjects.length);
  for (const [id, section, name] of expectedProjects) {
    const project = content.getProjectBySlug(id); assert.ok(project, id); assert.ok(sourceSection(section).includes(name), name);
    assert.ok(project.source.includes(`§${section}`)); assert.ok(project.summary.trim());
    row(id,'project',`DATA §${section}`,`/projects/${id}`,[project.title,project.summary],project.format === 'summary' ? 'Identity note; unverified technical fields withheld' : 'Curated detail; limitations remain explicit');
  }
});
for (const group of portfolio.experienceGroups) for (const record of group.items) {
  check(`source identity, role and period: ${record.id}`, () => {
    const section = record.source.replace('DATA §',''); const source = section === '6' ? master.split('# 6. ')[1].split('# 7. ')[0] : sourceSection(section);
    assert.ok(source.includes(record.role), record.role); if (record.period) assert.ok(source.includes(record.period), record.period);
    assert.ok(source.includes(record.organization.split(' · ')[0]), record.organization);
    row(record.id,`experience/${group.id}`,record.source,'/experience',[record.role,record.organization,record.period ?? 'Periode belum dicantumkan'],record.context);
  });
}
check('school records match four distinct source claims and legacy education; publication explicitly approved on 19 Oct', () => {
  const expected = ['Lulusan Terbaik','Juara 3 Kelas 12','Juara 2 Kelas 11','Juara 1 Kelas 10'];
  assert.deepEqual(Array.from(awards.educationAchievements, a=>a.result),expected);
  for (const award of awards.educationAchievements) {
    assert.ok(sourceSection('2.2').includes(award.result)); assert.ok(JSON.stringify(legacy.education).includes(award.result));
    assert.equal(award.period,'2021–2024'); assert.equal(award.year,undefined);
    row(award.id,'achievement outcome',award.provenance,'/achievements',[award.result,award.context],'Owner approved publication; school period is not award date; no certificate claim');
  }
});
check('BPDC/FESTRA team results and owner-approved ESF results retain their event contexts', () => {
  const [aura,vircuit] = awards.featuredAchievements;
  assert.equal(aura.team,'ALGA NOVA'); assert.equal(aura.projectSlug,'aura-pod'); assert.deepEqual(Array.from(aura.outcomes),['Juara 1','Most Favorite']);
  assert.equal(vircuit.team,'Trio Hengker Enjoyer'); assert.equal(vircuit.projectSlug,'vircuit'); assert.equal(awards.publicAchievementOutcomeCount,9);
  for (const award of awards.featuredAchievements) for (const outcome of award.outcomes) {
    assert.ok(sourceSection(award.id === 'aura-2026' ? '11.1' : '11.2').includes(award.team));
    row(`${award.id}/${outcome}`,'achievement outcome',award.provenance,'/achievements',[award.result,award.additional,award.event,award.team],`One event row ${award.id}; public article link, not certificate`);
  }
  const [esf] = awards.festivalAchievements;
  assert.deepEqual(Array.from(esf.outcomes), ['Juara 3','Finalis Top 10 Essay']);
  assert.equal(esf.year,2025); assert.equal(esf.certificate,undefined); assert.equal(esf.source,undefined);
  for (const outcome of esf.outcomes) {
    assert.ok(sourceSection('11.3').includes(outcome));
    row(`${esf.id}/${outcome}`,'achievement outcome',esf.provenance,'/achievements',[outcome,esf.event,esf.organizer,esf.evidence],'Owner approved; certificate not yet supplied; categories/round relationship unspecified');
  }
});
for (const [recordsOfKind, category] of [[portfolio.research,'research'],[portfolio.communityService,'community service']]) for (const record of recordsOfKind) {
  check(`source title and public context: ${record.id}`, () => {
    const section = record.source.replace('DATA §',''); assert.ok(sourceSection(section).includes(record.title));
    row(record.id,category,record.source,'/lab',[record.title,record.summary,record.note],'Project reference does not create a second project');
  });
}
for (const [index, group] of portfolio.skillGroups.entries()) for (const skill of group.skills) {
  check(`source inventory item: ${group.id}/${skill.name}`, () => {
    assert.ok(sourceSection(`12.${index+1}`).includes(skill.name), skill.name);
    if (['Flutter','Firebase'].includes(skill.name)) assert.equal(skill.learning,true);
    row(`skill/${group.id}/${skill.name}`,'skill inventory',`DATA §12.${index+1}`,'/about',[skill.name],skill.learning ? 'Learning, not proficiency' : group.description);
  });
}
for (const group of capabilities.capabilityGroups) for (const item of group.items) {
  check(`showcase source, classification and live destination: ${item.id}`, () => {
    assert.match(item.source,/DATA §/); assert.ok(master.includes(item.name) || item.basis === 'experience');
    const [path,hash] = item.href.split('#');
    if(path.startsWith('/projects/')) assert.ok(content.getProjectBySlug(path.split('/').at(-1)));
    if(hash?.startsWith('skills-')) assert.ok(portfolio.skillGroups.some(g=>hash===`skills-${g.id}`));
    if(path==='/experience') assert.ok(portfolio.experienceGroups.flatMap(g=>g.items).some(r=>r.id===hash));
    if(path==='/lab') assert.ok(portfolio.communityService.some(r=>r.id===hash));
    if(item.id==='typescript') assert.equal(item.basis,'team');
    if(item.id==='flutter') assert.equal(item.basis,'learning');
    row(`capability/${item.id}`,`showcase/${group.id}`,item.source,'/about',[item.name,item.context,capabilities.capabilityBasisLabels[item.basis]],`Derived presentation of existing records; destination ${item.href}; not an extra skill count`);
  });
}
row('profile','profile','DATA §1','/about',[content.profile.name,content.profile.bio],'Temporal GPA/current semester withheld');
row('education-umri','education','DATA §2.1','/about',['Universitas Muhammadiyah Riau','2024–sekarang','Pendidikan Vokasional Teknik Elektronika']);
row('education-smk','education','DATA §2.2','/about',['SMKS Bina Profesi Pekanbaru','2021–2024','Teknik Komputer dan Jaringan']);
for(const [items,kind,section] of [[portfolio.interests,'interest','1.3'],[portfolio.hobbies,'hobby','1.4']]) for(const name of items) {
  assert.ok(sourceSection(section).includes(name)); row(`${kind}/${name}`,kind,`DATA §${section}`,'/about',[name]);
}
row('contact/github','contact','DATA §14','/contact',[content.profile.github,'Han0953']);
row('contact/location','contact','DATA §14','/contact',[content.profile.location]);
for(const [id,category,source,note] of [
  ['robotic-period','experience field','DATA §5.2','Period not supplied; role and duties approved and public'],
  ['gpa','profile field','DATA §1 / §2.1','Current value unconfirmed'],['semester','profile field','DATA §1','Time-sensitive field unconfirmed'],
  ['contact/email','contact','DATA §14','No address'],['contact/linkedin','contact','DATA §14','No URL'],['contact/instagram','contact','DATA §14','No URL'],['contact/production','contact','DATA §14','No confirmed host'],
  ['certificates','asset slot','DATA §15.1','Zero supplied certificate records'],['papers','asset slot','DATA §15.2','Zero confirmed published papers'],['media','asset slot','DATA §15.4','Project evidence and Azura asset unavailable'],
]) row(id,category,source,null,[],note,'REVIEW');
for(const [id,note] of [['Project Manager','Withdrawn by owner 19 Oct 2026'],['Pranala Institute','Retracted organization'],['ASUS ROG UI','Retracted testing'],['Xiaomi HyperOS','Retracted testing'],['Cum Laude (Expected)','Unsubstantiated prediction withdrawn'],['quickStats','Unsupported aggregate claims']]) row(id,'exclusion','Owner / previous review',null,[],note,'WITHDRAWN');
for(const [id,note] of [['pvte-himpteka','One website, not two projects'],['research-mqtt-project','Lab record references existing MQTT incubator'],['lazismu-service-project','Service record references existing website'],['school-legacy-occurrences','Four legacy references corroborate the same four school outcomes'],['esf-legacy-occurrences','Two legacy references corroborate the same owner-approved outcomes']]) row(id,'source relationship','DATA / legacy',null,[],note,'DUPLICATE REFERENCE');
const htmlCache = new Map();
if(origin) for (const record of records.filter(r=>r.publication==='PUBLIC')) {
  if(!htmlCache.has(record.route)) {
    const response = await fetch(origin+record.route); assert.equal(response.status,200,record.route);
    const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<!--[\s\S]*?-->/g,''); htmlCache.set(record.route,html);
  }
  check(`SSR identity and content ${record.id}`,()=>{
    const html = htmlCache.get(record.route);
    for(const text of record.expectedText) assert.ok(html.includes(text.replaceAll('&','&amp;').replaceAll('"','&quot;')),`${record.id}: ${text}`);
    record.implementation='SSR VERIFIED';
  });
}
check('withdrawn values remain absent after owner-approved content updates',()=>assert.doesNotMatch(JSON.stringify({content,portfolio,awards,capabilities}),/Pranala|HyperOS|ASUS ROG|Project Manager|Lab Robotic|3\.85|Cum Laude/));
if(origin) check('all seven achievement rows and three capability groups are SSR; Home stays a preview',()=>{
  const html = htmlCache.get('/achievements'); assert.equal((html.match(/data-achievement-id=/g)||[]).length,7);
  assert.equal((htmlCache.get('/about').match(/class="capability-group"/g)||[]).length,3);
});
const counts = {};
for(const category of new Set(records.map(r=>r.category))) {
  const rows=records.filter(r=>r.category===category);
  counts[category]={sourceUnits:rows.length,eligible:rows.filter(r=>r.publication==='PUBLIC').length,rendered:rows.filter(r=>r.implementation==='SSR VERIFIED').length,review:rows.filter(r=>r.publication==='REVIEW').length,withdrawn:rows.filter(r=>r.publication==='WITHDRAWN').length,duplicateReferences:rows.filter(r=>r.publication==='DUPLICATE REFERENCE').length};
}
const ledger={method:'Explicit source-section/identity/field assertions, then script-free SSR text for each public row. Not browser visual QA.',counting:'Counts are per category; never sum skills, showcase and project stacks as unique competencies. Asset slots and profile fields are not missing person/project records. Achievement unit = atomic outcome (9 public outcomes); 7 UI rows, 2 team events, 1 ESF event, 4 school records. Duplicate references are not extra achievements.',counts,records,results};
fs.writeFileSync(`${directory}/content-coverage.json`,JSON.stringify(ledger,null,2));
const lines=['# Content coverage — 19 October 2026','',ledger.counting,'','| Record ID | Kategori | Status sumber / sumber | Ditampilkan di | Status implementasi | Catatan |','|---|---|---|---|---|---|'];
for(const r of records) lines.push(`| ${r.id} | ${r.category} | ${r.publication} · ${r.source} | ${r.route||'—'} | ${r.implementation} | ${r.note} |`);
fs.writeFileSync(`${directory}/CONTENT-COVERAGE.md`,lines.join('\n')+'\n');
console.log(`${results.length} completeness checks passed; coverage ledger generated.`);
