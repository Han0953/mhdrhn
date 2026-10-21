import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import {loadContent} from './load-content.mjs';
const require=createRequire(import.meta.url),results=[];
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log(`PASS ${name}`);}
const home=loadContent('src/lib/home-content.ts');
const exports={};
const code=ts.transpileModule(fs.readFileSync('src/components/ui/Editorial.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
vm.runInNewContext(code,{exports,require(id){if(id==='@/components/layout/RouteTransition')return {SiteLink:'a'};return require(id);}},{timeout:1000});
await check('all four actual ProjectArt preview variants contain graphics and no caption, SVG text, brand or field-note copy',()=>{
 for(const kind of ['circuit','aura','portal','research']){const html=renderToStaticMarkup(exports.ProjectArt({kind,title:'Preview fixture',variant:'preview'}));assert.match(html,/<svg/);assert.match(html,/aria-hidden="true"/);assert.doesNotMatch(html,/<text\b|<figcaption|art-top|Preview fixture|FIELD NOTES|mhdrhn\.|Ilustrasi konsep/);}
});
await check('default ProjectArt on full project pages retains its existing provenance caption',()=>{
 const html=renderToStaticMarkup(exports.ProjectArt({kind:'circuit',title:'Documentation fixture'}));assert.match(html,/<figcaption>Documentation fixture/);assert.match(html,/Visual konsep · dokumentasi produk belum tersedia/);assert.match(html,/<text\b/);
});
await check('ten concise Home summaries cover the two existing collections without changing source records or claiming deployment',()=>{
 const projects=[...home.latestProjects,...home.electronicsProjects];assert.equal(Object.keys(home.projectPreviewSummaries).length,10);
 for(const p of projects){const copy=home.projectPreviewSummaries[p.slug];assert.ok(copy, p.slug);assert.ok(copy.length<=110,p.slug);assert.doesNotMatch(copy,/sudah online|sudah dideploy|berhasil diuji|terverifikasi|tercatat dalam arsip/i);}
 assert.match(projects.find(p=>p.slug==='air-quality-monitoring').summary,/pemantauan kualitas udara/);
});
const origin=process.env.MHDRHN_QA_ORIGIN;
if(origin){
 assert.ok(['127.0.0.1','localhost'].includes(new URL(origin).hostname));
 const response=await fetch(origin);assert.equal(response.status,200);const html=(await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 const stories=['latest-projects','electronics-projects'].map(id=>{const match=html.match(new RegExp(`<section\\b[^>]*data-home-section="${id}"[\\s\\S]*?<\\/section>`));assert.ok(match,id);return match[0];});
 await check('both Home introductions use portfolio copy instead of chronology or implementation notes',()=>{
  assert.ok(stories[0].includes(home.projectSectionIntros.latest));assert.ok(stories[1].includes(home.projectSectionIntros.electronics));
  for(const s of stories)assert.doesNotMatch(s,/urutannya bersifat editorial|Proyek tanpa tahun|Pilihan ini bukan urutan waktu|Lima pilihan lain/);
 });
 await check('all ten actual SSR media frames are text-free decorative graphics with no caption overlay',()=>{
  const figures=stories.flatMap(s=>[...s.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map(m=>m[0]));assert.equal(figures.length,10);
  for(const f of figures){assert.match(f,/aria-hidden="true"/);assert.doesNotMatch(f,/<text\b|<figcaption|art-top|Ilustrasi konsep|bukan dokumentasi/);}
 });
 await check('ten named project CTAs replace Lihat catatan and resolve to the original project identities',()=>{
  for(const [i,projects] of [home.latestProjects,home.electronicsProjects].entries())for(const p of projects){assert.ok(stories[i].includes(`aria-label="Jelajahi proyek ${p.title}"`));assert.ok(stories[i].includes(`/projects/${p.slug}`));assert.ok(stories[i].includes(home.projectPreviewSummaries[p.slug]));}
  for(const s of stories)assert.doesNotMatch(s,/Lihat catatan|Catatan arsip|Status penyelesaian belum dipublikasikan/);
 });
}
const d=process.env.MHDRHN_QA_CARD_EVIDENCE||'docs/execution/evidence/project-cards-2026-10-20';fs.mkdirSync(d,{recursive:true});fs.writeFileSync(`${d}/project-card-checks.json`,JSON.stringify({origin:origin??null,method:'Actual React server rendering of shared graphics, source reconciliation and Home HTTP/SSR. Layout/browser evidence separate.',results},null,2));console.log(`${results.length} project card checks passed.`);
