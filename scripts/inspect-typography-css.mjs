// Source diagnostics only. Browser font readiness, pixels and computed layout remain separate gates.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import postcss from 'postcss';
const css = fs.readFileSync('src/app/globals.css','utf8'), tree = postcss.parse(css);
const riskRules=[], typeRules=[];
tree.walkRules(rule=>{
  const declarations={}; rule.each(node=>{if(node.type==='decl')declarations[node.prop]=node.value;});
  if(Object.keys(declarations).some(key=>/height|overflow|clip|mask|transform/.test(key))) riskRules.push({selector:rule.selector,line:rule.source.start.line,declarations});
  if(Object.keys(declarations).some(key=>/font|line-height/.test(key))) typeRules.push({selector:rule.selector,line:rule.source.start.line,declarations});
});
const clippers=riskRules.filter(r=>Object.entries(r.declarations).some(([key,value])=>/overflow/.test(key)&&/hidden|clip/.test(value)||/clip|mask/.test(key)&&value!=='none'));
assert.deepEqual(clippers.map(r=>r.selector),['.sr-only','.route-transition-viewport']);
assert.ok(!riskRules.some(r=>/(^|,)\s*(html|body)\s*(,|$)/.test(r.selector)&&r.declarations['overflow-x']));
const directory='docs/execution/evidence/completeness-2026-10-19';
fs.writeFileSync(`${directory}/typography-css-audit.json`,JSON.stringify({method:'PostCSS source declarations, not computed styles or glyph screenshots',status:'STATIC DIAGNOSTICS COMPLETE; VISUAL NOT VERIFIED',clippers,expectedClippers:{'.sr-only':'Intentionally hidden accessible labels; not visible display text','.route-transition-viewport':'Decorative wipe only, no text children'},riskRules,typeRules,remaining:'Rendered ancestor geometry, fixed dialog dimensions, font readiness, CSS cascade after hydration and every visual viewport/theme case require browser access.'},null,2));
console.log('PASS source clipping contract: only accessible hidden labels and the decorative transition wrapper clip. Browser glyph/overflow acceptance is NOT RUN.');
