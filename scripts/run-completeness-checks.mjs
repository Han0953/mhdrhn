// Reuses installed tools only. Build/browser are separate gates, never fabricated here.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const directory = 'docs/execution/evidence/completeness-2026-10-19';
const origin = process.env.MHDRHN_QA_ORIGIN || 'http://127.0.0.1:3000';
const env = { ...process.env, MHDRHN_QA_ORIGIN: origin,
  MHDRHN_QA_COMPLETION_EVIDENCE:`${directory}/completion-checks.json`, MHDRHN_QA_HANDLER_EVIDENCE:`${directory}/handler-checks.json`,
  MHDRHN_QA_REFINEMENT_EVIDENCE:`${directory}/refinement-checks.json`, MHDRHN_QA_THEME_EVIDENCE:`${directory}/theme-handler-checks.json`, MHDRHN_QA_EVIDENCE:`${directory}/http-smoke.json` };
const commands = [
  ['lint',['node_modules/eslint/bin/eslint.js','.']],['typescript',['node_modules/typescript/bin/tsc','--noEmit']],
  ...['verify-public-content','verify-completion','verify-completion-handlers','verify-refinement','verify-theme-interactions','smoke-frontend','verify-completeness'].map(name=>[name,[`scripts/${name}.mjs`]]),
];
const results=[];
for(const [name,args] of commands) {
  const start=Date.now(); const result=spawnSync(process.execPath,args,{env,encoding:'utf8',timeout:180000});
  fs.writeFileSync(`${directory}/${name}.log`,`${result.stdout||''}${result.stderr||''}${result.error||''}`);
  const row={name,command:[process.execPath,...args],exitCode:result.status,status:result.status===0?'PASS':'FAIL',durationMs:Date.now()-start};results.push(row);console.log(`${row.status} ${name} (${row.durationMs} ms)`);
}
fs.writeFileSync(`${directory}/test-summary.json`,JSON.stringify({origin,mode:process.env.MHDRHN_QA_MODE || 'Existing development server; not a production build or browser renderer',results},null,2));
if(results.some(r=>r.status!=='PASS')) process.exitCode=1;
