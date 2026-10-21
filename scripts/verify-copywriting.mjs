import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import {loadContent} from './load-content.mjs';
const directory=process.env.MHDRHN_QA_COPY_EVIDENCE||'docs/execution/evidence/copywriting-audit-2026-10-20';
const origin=process.env.MHDRHN_QA_ORIGIN||'http://127.0.0.1:3005';
assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname));
const require=createRequire(import.meta.url),content=loadContent(),portfolio=loadContent('src/lib/portfolio.ts'),results=[],pages=new Map();
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log(`PASS ${name}`);}
const plain=s=>s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g,'').replace(/<[^>]*>/g,' ').replaceAll('&amp;','&').replace(/\s+/g,' ').trim();
const clean=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<!--[\s\S]*?-->/g,'');
const paths=['/','/about','/projects','/experience','/lab','/achievements','/contact',...content.getPublishedProjects().map(p=>'/projects/'+p.slug)];
const forbidden=/Catatan konteks|Keterangan konteks|Konteks pengalaman|Detail sementara|Catatan data|Metadata pengalaman|Ringkasan internal|Status:\s*publik|Sumber data:|Disetujui untuk publikasi|Metadata belum tersedia|tercatat dalam arsip karya|Identitas proyek dipertahankan/i;
for(const path of paths)await check(`public copy and SEO: ${path}`,async()=>{
 const response=await fetch(origin+path);assert.equal(response.status,200);const html=clean(await response.text());pages.set(path,html);
 assert.doesNotMatch(plain(html),forbidden);assert.equal((html.match(/<h1\b/g)||[]).length,1);
 const title=plain(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]??'');assert.ok(title.length>=8&&title.length<=110,title);
 const description=html.match(/<meta name="description" content="([^"]+)"/);assert.ok(description,`Description: ${path}`);assert.ok(description[1].length>=35&&description[1].length<=350);
 if(path.startsWith('/projects/')){const project=content.getProjectBySlug(path.split('/').at(-1));assert.ok(plain(html).includes(project.summary));assert.ok(plain(html).includes(project.approach));assert.ok(plain(html).includes(project.limitation));}
});
await check('all ten experience descriptions are initially closed, preserving native disclosure, identities and approved lab duties',()=>{
 const html=pages.get('/experience');assert.equal((html.match(/class="timeline-row"/g)||[]).length,10);assert.equal((html.match(/<details\b[^>]*\bopen=""/g)||[]).length,0);assert.equal((html.match(/<summary>Tentang peran<\/summary>/g)||[]).length,10);
 for(const record of portfolio.experienceGroups.flatMap(g=>g.items)){assert.ok(plain(html).includes(record.context),record.id);assert.ok(record.context.length>=40,record.id);}
 assert.doesNotMatch(html,/Project Manager|Lab Robotic|pegawai tetap|karyawan tetap/);
});
await check('22 individual project summaries replace the archive template without promoting unknown technical fields',()=>{
 const projects=content.getPublishedProjects();assert.equal(projects.length,22);assert.equal(new Set(projects.map(p=>p.summary)).size,22);
 for(const p of projects.filter(p=>p.format==='summary'&&p.slug!=='mhdrhn-portfolio')){assert.equal(p.technologies.length,0);assert.equal(p.year,undefined);assert.equal(p.role,undefined);assert.equal(p.status,undefined);assert.equal(p.link,undefined);}
});
await check('achievements retain seven rows and nine outcomes; certificates reflect identified owner documents without invented credentials',()=>{
 const html=pages.get('/achievements');assert.equal((html.match(/data-achievement-id=/g)||[]).length,7);assert.equal(loadContent('src/lib/achievement-records.ts').publicAchievementOutcomeCount,9);
 assert.equal((html.match(/data-certificate-id=/g)||[]).length,loadContent('src/lib/media.ts').certificates.length);assert.match(html,/Dokumen belum tersedia/);assert.doesNotMatch(html,/AWS Certified|credential ID|Sertifikat terverifikasi|record-provenance/);
});
await check('status wording stays separate from stable query values; unknown status still returns the same twenty projects',async()=>{
 assert.equal(content.projectStatusLabels['Belum dipublikasikan'],'Belum diinformasikan');
 const href=loadContent('src/lib/project-filters.ts').projectFilterHref('Semua','','Belum dipublikasikan');assert.equal(new URL(href,origin).searchParams.get('status'),'Belum dipublikasikan');
 const response=await fetch(origin+href);assert.equal(response.status,200);const html=clean(await response.text());assert.match(html,/20 proyek ditemukan/);assert.match(html,/Belum diinformasikan/);assert.doesNotMatch(plain(html),/Semua · Semua/);
});
function component(file,mocks={}){
 const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,{exports,require(id){if(id in mocks)return mocks[id];if(id==='@/components/layout/RouteTransition')return {SiteLink:'a'};if(id==='@/components/media/ProjectCover')return {ProjectCover:'figure'};return require(id);}},{timeout:1000});return exports;
}
await check('error and not-found copy render with one heading; actual retry callback remains callable',()=>{
 const editorial=component('src/components/ui/Editorial.tsx');const ErrorPage=component('src/app/error.tsx').default,NotFound=component('src/app/not-found.tsx',{'@/components/ui/Editorial':editorial}).default;
 let retried=0;const error=ErrorPage({reset(){retried++;}});const markup=renderToStaticMarkup(error);assert.match(markup,/Coba lagi/);assert.match(markup,/Halaman belum/);error.props.children[1].props.children[0].props.onClick();assert.equal(retried,1);
 const notfound=renderToStaticMarkup(NotFound());assert.equal((notfound.match(/<h1\b/g)||[]).length,1);assert.match(notfound,/Alamat yang kamu buka tidak tersedia/);
 fs.writeFileSync(`${directory}/recovery-copy.html`,markup+'\n'+notfound);
});
await check('all nine Azura reply branches use local, public destinations and retain a clear demo fallback',()=>{
 const source=fs.readFileSync('src/components/layout/SiteChrome.tsx','utf8');const ast=ts.createSourceFile('SiteChrome.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='replyTo');assert.ok(fn);
 const exports={};const code=ts.transpileModule(fn.getText(ast)+'\nexports.replyTo=replyTo;',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(code,{exports},{timeout:1000});
 const replies=['Vircuit','AURA POD','Kontak','riset IoT','Siapa Rehan','skill','pengalaman','proyek','resep makan malam'].map(q=>({question:q,...exports.replyTo(q)}));
 for(const r of replies){assert.ok(r.text.length>=40&&r.text.length<=350);assert.ok(r.href.startsWith('/'));assert.doesNotMatch(r.text,forbidden);}
 assert.match(replies.at(-1).text,/demo ini/);assert.match(source,/Demo lokal/);assert.match(source,/tidak dikirim ke layanan AI/);assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|WebSocket/);
 fs.writeFileSync(`${directory}/azura-replies.json`,JSON.stringify(replies,null,2));
});
fs.writeFileSync(`${directory}/copywriting-checks.json`,JSON.stringify({method:'Actual script-free HTTP/SSR for 29 public URLs; real source functions and React recovery rendering. Not a browser or forced runtime exception.',results},null,2));
console.log(`${results.length} copywriting checks passed.`);
