// Run against a built local preview; keep this audit's evidence separate from earlier work.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const directory=process.env.MHDRHN_QA_AUDIT_EVIDENCE || 'docs/execution/evidence/home-about-polish-2026-10-20';
fs.mkdirSync(directory,{recursive:true});
const env={...process.env,MHDRHN_QA_ORIGIN:process.env.MHDRHN_QA_ORIGIN||'http://127.0.0.1:3005'};
for(const key of ['HOME','TECHNOLOGY','COMPLETENESS','HERO','CARD','READINESS'])env[`MHDRHN_QA_${key}_EVIDENCE`]=directory;
for(const [key,file] of Object.entries({COMPLETION:'completion',HANDLER:'handlers',REFINEMENT:'refinement',THEME:'theme',GLYPH:'glyph'}))env[`MHDRHN_QA_${key}_EVIDENCE`]=`${directory}/${file}-checks.json`;
env.MHDRHN_QA_EVIDENCE=`${directory}/http-smoke.json`;
const suites=['verify-public-content','verify-completion','verify-completion-handlers','verify-glyph-filter-content','verify-theme-interactions','smoke-frontend','verify-completeness','verify-technology-inventory','verify-refinement','verify-home-expansion','verify-route-readiness','verify-hero-diagram','verify-project-cards','verify-education'];
const results=[];
for(const suite of suites){
  const result=spawnSync(process.execPath,[`scripts/${suite}.mjs`],{env,encoding:'utf8',timeout:120000});
  const log=`${result.stdout||''}${result.stderr||''}${result.error||''}`;
  fs.writeFileSync(`${directory}/${suite}.log`,log);
  const count=suite==='smoke-frontend'&&result.status===0 ? JSON.parse(fs.readFileSync(env.MHDRHN_QA_EVIDENCE,'utf8')).length : Number(log.match(/(\d+) [^\n]*checks passed/)?.[1] || (log.match(/^PASS /gm)||[]).length);
  results.push({suite,status:result.status===0?'PASS':'FAIL',checks:count,exitCode:result.status});
  console.log(`${results.at(-1).status} ${suite}: ${count} checks`);
  if(result.status!==0)console.log(log.slice(-2500));
}
fs.writeFileSync(`${directory}/test-summary.json`,JSON.stringify({origin:env.MHDRHN_QA_ORIGIN,total:results.reduce((sum,r)=>sum+r.checks,0),results},null,2));
if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
