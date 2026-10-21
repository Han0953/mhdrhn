import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadContent} from './load-content.mjs';
const {educationRecords}=loadContent('src/lib/education.ts');
const directory=process.env.MHDRHN_QA_AUDIT_EVIDENCE || 'docs/execution/evidence/education-2026-10-20';
fs.mkdirSync(directory,{recursive:true});
const results=[];
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log(`PASS ${name}`);}
await check('only two source-backed education records; owner-confirmed scores are 3.85 and 90',()=>{
  assert.equal(educationRecords.length,2);assert.equal(new Set(educationRecords.map(r=>r.id)).size,2);
  assert.deepEqual(Array.from(educationRecords,r=>[r.score,r.scoreDisplay,r.scoreMax,r.scoreMaxDisplay,r.scoreLabel]),[[3.85,'3.85',4,'4.00','IPK'],[90,'90',100,'100','Nilai rata-rata']]);
  assert.equal(educationRecords[0].program,'S1 Pendidikan Vokasional Teknik Elektronika');assert.equal(educationRecords[1].recognition,'Siswa Lulusan terbaik & ranking 1');
  const source=fs.readFileSync('agent/docs/DATA.md','utf8');
  for(const record of educationRecords){const section=record.source.split('§')[1];const body=source.match(new RegExp(`^## ${section.replace('.','\\.')} [^\\n]+\\n([\\s\\S]*?)(?=^##? |$(?![\\s\\S]))`,'m'))?.[0];assert.ok(body,record.source);for(const value of [record.institution,record.program,`${record.scoreDisplay}/${record.scoreMaxDisplay}`])assert.ok(body.includes(value),value);if(record.recognition)assert.ok(body.includes(record.recognition));assert.equal(record.confirmedOn,'2026-10-20');}
});
const origin=process.env.MHDRHN_QA_ORIGIN;
if(origin){
  assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname));
  const pages=new Map();
  for(const path of ['/','/about'])await check(`${path} serves both schools, periods, programs and matching scores in script-free HTML`,async()=>{
    const response=await fetch(origin+path);assert.equal(response.status,200);const html=(await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<!--[\s\S]*?-->/g,'');pages.set(path,html);
    assert.equal((html.match(/data-education-id=/g)||[]).length,2);
    for(const record of educationRecords){const row=html.match(new RegExp(`<article[^>]*data-education-id="${record.id}"[^>]*>([\\s\\S]*?)<\\/article>`))?.[1];assert.ok(row,record.id);const text=row.replace(/<[^>]*>/g,' ').replaceAll('&amp;','&');for(const value of [record.institution,record.program,record.period,record.scoreLabel,record.scoreDisplay,`/${record.scoreMaxDisplay}`])assert.ok(text.includes(value),`${record.id}: ${value}`);if(record.recognition)assert.ok(text.includes(record.recognition));assert.match(row,/<dl\b/);assert.match(row,/<dt>/);assert.match(row,/<dd>/);}
  });
  await check('Home education is immediately above experience; CTA reaches the About education anchor',()=>{
    const sections=[...pages.get('/').matchAll(/<section\b[^>]*data-home-section="([^"]+)"/g)].map(m=>m[1]);
    const i=sections.indexOf('education');assert.ok(i>0);assert.equal(sections[i-1],'electronics-projects');assert.equal(sections[i+1],'experience');assert.ok(pages.get('/').includes('href="/about#education-heading"'));assert.ok(pages.get('/about').includes('id="education-heading"'));
  });
  await check('school achievement link still resolves to the public archive, with no reference-image facts imported',async()=>{
    assert.ok(pages.get('/about').includes('href="/achievements#education-achievements"'));
    const response=await fetch(origin+'/achievements');assert.equal(response.status,200);assert.ok((await response.text()).includes('id="education-achievements"'));
    for(const html of pages.values()){
      const text=[...html.matchAll(/<article\b[^>]*data-education-id="[^"]+"[^>]*>([\s\S]*?)<\/article>/g)].map(m=>m[1].replace(/<[^>]*>/g,' ')).join(' ');
      assert.doesNotMatch(text,/3\.91|87\.34|SMKN 2 Pekanbaru|Beasiswa Pemerintah/);
    }
  });
}
fs.writeFileSync(`${directory}/education-checks.json`,JSON.stringify({origin:origin??null,method:'Owner-confirmed source records plus actual script-free HTTP/SSR. Browser layout checked separately.',results},null,2));
console.log(`${results.length} education checks passed.`);
