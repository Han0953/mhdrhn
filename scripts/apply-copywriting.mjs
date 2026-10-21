// Apply reviewed, contextual edits from the audit ledger, never directory-wide substitutions.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const file=process.argv[2] || 'docs/execution/evidence/copywriting-audit-2026-10-20/editorial-edits.json';
const entries=JSON.parse(fs.readFileSync(file,'utf8')),sources=new Map();
for(const entry of entries){
 const original=sources.get(entry.file)??fs.readFileSync(entry.file,'utf8');let next;
 if(entry.record){
  const ast=ts.createSourceFile(entry.file,original,ts.ScriptTarget.Latest,true),matches=[];
  function visit(n){if(ts.isObjectLiteralExpression(n)){
   const key=n.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(ast)===entry.record.key);
   if(key&&ts.isStringLiteralLike(key.initializer)&&key.initializer.text===entry.record.value){
    const prop=n.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(ast)===entry.field);if(prop)matches.push(prop.initializer);
   }
  }ts.forEachChild(n,visit);}visit(ast);
  assert.equal(matches.length,1,`${entry.file}: ${entry.record.value}/${entry.field}`);const node=matches[0];assert.equal(node.text,entry.before);
  next=original.slice(0,node.getStart(ast))+JSON.stringify(entry.after)+original.slice(node.end);
 }else{
  const count=original.split(entry.before).length-1;assert.equal(count,entry.expected??1,`${entry.file}: ${entry.before}`);
  next=original.split(entry.before).join(entry.after);
 }
 sources.set(entry.file,next);
}
// Validate every edit before writing the first file.
for(const [file,source] of sources)fs.writeFileSync(file,source);
console.log(`Applied ${entries.length} reviewed edits across ${sources.size} files.`);
