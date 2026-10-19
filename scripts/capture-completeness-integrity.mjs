import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const directory='docs/execution/evidence/completeness-2026-10-19';
const baseline=JSON.parse(fs.readFileSync(`${directory}/baseline.json`,'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const paths=execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{encoding:'utf8'}).trimEnd().split('\n').filter(Boolean).map(line=>({status:line.slice(0,2),path:line.slice(3).replace(/^"|"$/g,'')}));
const files=paths.filter(f=>f.path!==`${directory}/integrity.json`).map(file=>{
  const before=baseline.files.find(f=>f.path===file.path);
  const sha256=fs.existsSync(file.path)?hash(fs.readFileSync(file.path)):null;
  return {...file,sha256,deltaThisSession:!before?(file.status==='??'?'NEW':'MODIFIED PREVIOUSLY CLEAN'):before.sha256===sha256?'UNCHANGED FROM DIRTY BASELINE':'MODIFIED THIS SESSION',beforeSha256:before?.sha256||null};
});
const protectedFiles=['agent/docs/DATA.md','src/lib/data.ts','package.json','package-lock.json','next.config.ts','tsconfig.json','src/app/layout.tsx'].filter(f=>fs.existsSync(f)).map(path=>{
  const bytes=fs.readFileSync(path), headBytes=execFileSync('git',['show',`HEAD:${path}`]);
  const sha256=hash(bytes), headSha256=hash(headBytes);
  return {path,sha256,headSha256,bytesEqual:sha256===headSha256,contentUnchangedFromHead:bytes.toString('utf8').replaceAll('\r\n','\n')===headBytes.toString('utf8').replaceAll('\r\n','\n')};
});
const result={branch:git('branch','--show-current'),head:git('rev-parse','HEAD'),initialHead:baseline.head,headUnchanged:git('rev-parse','HEAD')===baseline.head,method:'Read-only Git status/rev-parse/show and SHA-256; previous uncommitted work retained. No Git mutation.',protectedFiles,files};
fs.writeFileSync(`${directory}/integrity.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({headUnchanged:result.headUnchanged,protectedContentUnchanged:protectedFiles.every(f=>f.contentUnchangedFromHead),changedThisSession:files.filter(f=>f.deltaThisSession.startsWith('MODIFIED')).map(f=>f.path),newFileCount:files.filter(f=>f.deltaThisSession==='NEW').length},null,2));
if(!result.headUnchanged||protectedFiles.some(f=>!f.contentUnchangedFromHead))process.exitCode=1;
