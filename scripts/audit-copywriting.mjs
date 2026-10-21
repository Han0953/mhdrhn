// Inventory active route modules, retain a before/after ledger, and guard factual data.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import ts from 'typescript';
import {loadContent} from './load-content.mjs';
const directory=process.env.MHDRHN_QA_COPY_EVIDENCE||'docs/execution/evidence/copywriting-audit-2026-10-20';
fs.mkdirSync(directory,{recursive:true});
const normalize=p=>p.replaceAll('\\','/');
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[normalize(path.join(p,e.name))]);}
function modules(){
 const seen=new Set();
 function visit(file){if(seen.has(file))return;seen.add(file);const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);for(const n of ast.statements){if(!ts.isImportDeclaration(n)&&!ts.isExportDeclaration(n))continue;const s=n.moduleSpecifier?.text;if(!s||(!s.startsWith('.')&&!s.startsWith('@/')))continue;const p=s.startsWith('@/')?'src/'+s.slice(2):normalize(path.join(path.dirname(file),s));const target=[p,p+'.ts',p+'.tsx',p+'/index.ts',p+'/index.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());if(target)visit(target);}}
 walk('src/app').filter(f=>f.endsWith('.tsx')).forEach(visit);return [...seen].sort();
}
const fields=new Set(['name','title','subtitle','summary','description','bio','context','approach','limitation','label','text','role','organization','group','program','period','level','scoreLabel','scoreDisplay','scoreMaxDisplay','recognition','short','result','additional','event','organizer','category','team','evidence','default','latest','electronics']);
const attributes=new Set(['aria-label','aria-description','placeholder','title','alt','label','eyebrow','description','intro','linkLabel']);
function inventory(file,source){
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS),rows=[];
 function visible(n){
  if(ts.isJsxText(n))return true;
  if(ts.isJsxAttribute(n.parent))return attributes.has(n.parent.name.getText(ast));
  if(ts.isPropertyAssignment(n.parent)&&fields.has(n.parent.name.getText(ast).replaceAll('"','')))return true;
  if(ts.isCallExpression(n.parent)&&['setError','skills'].includes(n.parent.expression.getText(ast)))return true;
  for(let p=n.parent;p;p=p.parent){if(ts.isBinaryExpression(p)&&[ts.SyntaxKind.EqualsEqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsEqualsToken,ts.SyntaxKind.EqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsToken].includes(p.operatorToken.kind))return false;if(ts.isJsxAttribute(p))return attributes.has(p.name.getText(ast));if(ts.isJsxExpression(p))return !ts.isJsxAttribute(p.parent)||attributes.has(p.parent.name.getText(ast));if(ts.isVariableDeclaration(p))return ['interests','hobbies','categories','projectStatuses','projectStatusLabels','certificateCategories','capabilityBasisLabels'].includes(p.name.getText(ast));}
  return false;
 }
 function context(n){let field='text',block=path.basename(file);for(let p=n.parent;p;p=p.parent){if(ts.isPropertyAssignment(p)&&field==='text')field=p.name.getText(ast);if(ts.isJsxAttribute(p))field=p.name.getText(ast);if(ts.isJsxElement(p)&&field==='text')field=p.openingElement.tagName.getText(ast);if(ts.isObjectLiteralExpression(p)){const id=p.properties.find(r=>ts.isPropertyAssignment(r)&&['id','slug'].includes(r.name.getText(ast))&&ts.isStringLiteralLike(r.initializer));if(id){block=id.initializer.text;break;}if(ts.isPropertyAssignment(p.parent)&&ts.isStringLiteralLike(p.parent.name)){block=p.parent.name.text;break;}}}return{field,block};}
 function visit(n){if((ts.isJsxText(n)||ts.isStringLiteralLike(n)||ts.isTemplateExpression(n))&&visible(n)){const text=(ts.isJsxText(n)?n.getText(ast):ts.isTemplateExpression(n)?n.getText(ast):n.text).replace(/\s+/g,' ').trim();if(/[\p{L}\p{N}]/u.test(text))rows.push({file,line:ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1,text,kind:ts.SyntaxKind[n.kind],...context(n)});}ts.forEachChild(n,visit);}visit(ast);return rows;
}
function routes(file){if(file==='src/app/page.tsx')return '/';if(file.startsWith('src/app/'))return file.includes('(index)')?'/projects':file.includes('[slug]')?'/projects/[slug]':file.endsWith('/page.tsx')?'/'+file.split('/')[2]:'Semua halaman / state pemulihan';if(file.includes('/layout/')||file.includes('/ui/'))return 'Bersama / lintas halaman';if(file.endsWith('portfolio.ts'))return '/about, /experience, /lab';if(file.endsWith('project-archive.ts'))return '/projects, /projects/[slug]';if(file.endsWith('capabilities.ts'))return '/about';if(file.endsWith('achievement-records.ts'))return '/, /achievements, /projects/[slug]';if(file.endsWith('home-content.ts'))return '/, /achievements';if(file.endsWith('technology-inventory.ts')||file.includes('Technology'))return '/, /about';return '/ / komponen bersama';}
function issue(before,field){if(/Catatan konteks|Metadata|Sumber data|Status: publik|Disetujui|tercatat dalam|dipertahankan|asal datanya|tanpa mengasumsikan/i.test(before??''))return 'Label atau uraian internal';if(/kemungkinan|Pertanyaan bagus|memberinya|bertemu|Mengelola kebutuhan|Elektronika memberi bentuk/i.test(before??''))return 'Abstrak atau klise';if(['aria-label','placeholder','label','title'].includes(field))return 'Microcopy / konsistensi';if(['summary','subtitle','approach','limitation','context','description','bio'].includes(field))return 'Keterbacaan / pengantar / ringkasan';return 'Kelancaran dan terminologi';}
function facts(){
 const content=loadContent(),portfolio=loadContent('src/lib/portfolio.ts'),awards=loadContent('src/lib/achievement-records.ts');
 const pick=(r,keys)=>Object.fromEntries(keys.filter(k=>r[k]!==undefined).map(k=>[k,r[k]]));
 return JSON.parse(JSON.stringify({
  projects:content.getPublishedProjects().map(r=>pick(r,['slug','title','categories','year','role','technologies','link','status','featured','visual','format','source'])),
  experiences:portfolio.experienceGroups.flatMap(g=>g.items).map(r=>pick(r,['id','period','role','organization','source'])),
  lab:[...portfolio.research,...portfolio.communityService].map(r=>pick(r,['id','title','year','role','source','projectSlug'])),
  awards:[...awards.featuredAchievements,...awards.educationAchievements,...awards.festivalAchievements].map(r=>pick(r,['id','result','additional','outcomes','event','organizer','category','year','period','team','projectSlug','publication','provenance','source','context'])),
  education:loadContent('src/lib/education.ts').educationRecords,
  skills:portfolio.skillGroups.map(g=>({id:g.id,skills:g.skills,projectSlug:g.projectSlug})),
  inventory:loadContent('src/lib/technology-inventory.ts').technologyInventoryItems,
  profile:pick(content.profile,['name','brand','location','github']),
  navigation:loadContent('src/lib/navigation.ts').navigation,
  statuses:content.projectStatuses,
 }));
}
const immutable=['src/app/globals.css','src/app/fonts/Syne-Variable.ttf','package.json','package-lock.json','next.config.ts','tsconfig.json'];
const hashes=()=>Object.fromEntries(immutable.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const mode=process.argv[2];
if(mode==='capture'){
 assert.ok(!fs.existsSync(`${directory}/before.json`),'Never overwrite the original audit baseline');
 const sources=Object.fromEntries(modules().map(f=>[f,fs.readFileSync(f,'utf8')]));
 const rows=Object.entries(sources).flatMap(([f,s])=>inventory(f,s));
 fs.writeFileSync(`${directory}/before.json`,JSON.stringify({sources,rows,facts:facts(),hashes:hashes()},null,2));
 console.log(`Captured ${rows.length} source copy units in ${Object.keys(sources).length} active modules.`);
}else if(mode==='finish'){
 const before=JSON.parse(fs.readFileSync(`${directory}/before.json`,'utf8'));
 // Re-derive from preserved sources so inventory extraction can improve without changing the baseline.
 before.rows=Object.entries(before.sources).flatMap(([file,source])=>inventory(file,source));
 assert.deepEqual(facts(),before.facts,'Factual records must remain unchanged');assert.deepEqual(hashes(),before.hashes,'Design, fonts, dependencies and configuration must remain unchanged');
 for(const file of ['src/lib/navigation.ts','src/lib/route-motion.ts','src/lib/project-story-motion.ts','src/lib/route-readiness.ts','src/components/sections/ProjectStoryViewport.tsx','src/components/sections/RotatingRoles.tsx','src/components/sections/SignalDiagram.tsx','src/components/ui/ThemeToggle.tsx'])assert.equal(fs.readFileSync(file,'utf8'),before.sources[file],`Unchanged interaction controller: ${file}`);
 const after=modules().flatMap(f=>inventory(f,fs.readFileSync(f,'utf8'))),changes=[];
 for(const file of Object.keys(before.sources)){
  const a=before.rows.filter(r=>r.file===file),b=after.filter(r=>r.file===file),table=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
  for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)table[i][j]=a[i].text===b[j].text?table[i+1][j+1]+1:Math.max(table[i+1][j],table[i][j+1]);
  let i=0,j=0,old=[],next=[];
  const flush=()=>{for(let k=0;k<Math.max(old.length,next.length);k++){const row=next[k]??old[k];changes.push({file,routes:routes(file),block:row.block,field:row.field,issue:issue(old[k]?.text,row.field),before:old[k]?.text??null,after:next[k]?.text??null,lineBefore:old[k]?.line??null,lineAfter:next[k]?.line??null});}old=[];next=[];};
  while(i<a.length||j<b.length){if(i<a.length&&j<b.length&&a[i].text===b[j].text){flush();i++;j++;}else if(i<a.length&&(j===b.length||table[i+1][j]>=table[i][j+1]))old.push(a[i++]);else next.push(b[j++]);}flush();
 }
 const summary={method:'Copy units are source occurrences (including conditional states, arrays and record fields), not unique visitor-visible phrases. LCS pairs changed blocks; null marks additions/removals.',modules:Object.keys(before.sources).length,evaluatedBefore:before.rows.length,evaluatedAfter:after.length,changedUnits:changes.length,changedFiles:[...new Set(changes.map(r=>r.file))],factsUnchanged:true,designAndConfigurationUnchanged:true};
 fs.writeFileSync(`${directory}/after.json`,JSON.stringify({summary,rows:after,changes},null,2));
 const escape=s=>(s??'—').replaceAll('|','\\|').replaceAll('\n',' ');
 fs.writeFileSync(`${directory}/COPY-INVENTORY.md`,['# Copy inventory — 20 Oktober 2026','',summary.method,'',`Evaluated before: ${summary.evaluatedBefore}; after: ${summary.evaluatedAfter}; changed units: ${summary.changedUnits}.`,'','| Route | Komponen / record | Field | File | Masalah | Sebelum | Sesudah |','|---|---|---|---|---|---|---|',...changes.map(r=>`| ${r.routes} | ${r.block} | ${r.field} | ${r.file}:${r.lineAfter??r.lineBefore} | ${r.issue} | ${escape(r.before)} | ${escape(r.after)} |`)].join('\n')+'\n');
 console.log(JSON.stringify(summary,null,2));
}else throw Error('Use capture or finish');
