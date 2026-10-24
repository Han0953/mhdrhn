import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadMotion} from './motion-test-support.mjs';

const classes=new Set(['font-brand','font-body','dark']);
let stored='dark',systemDark=false,blocked=false;
const head=new Set();
const root={classList:{contains:v=>classes.has(v),toggle(v,on){if(on)classes.add(v);else classes.delete(v);}},style:{}};
const document={documentElement:root,head:{append(node){node.isConnected=true;head.add(node);}},createElement(){return {isConnected:false,textContent:'',remove(){this.isConnected=false;head.delete(this);}};}};
const theme=loadMotion('src/lib/motion/theme.ts',{document,localStorage:{getItem(){if(blocked)throw Error('blocked');return stored;}},matchMedia:()=>({matches:systemDark})});
const checks=[];
function check(name,run){run();checks.push(name);console.log('PASS '+name);}

check('a locale commit that replaces html classes restores the held dark theme before paint',()=>{
 theme.captureLanguageTheme();classes.delete('dark');classes.add('light');stored='system';systemDark=false;
 theme.restoreThemeBeforePaint(root);assert.ok(classes.has('dark'));assert.ok(!classes.has('light'));assert.equal(root.style.colorScheme,'dark');assert.ok(classes.has('font-brand'));assert.equal(head.size,1);
 theme.releaseLanguageTheme();assert.equal(head.size,0);
});
check('explicit light remains light even when system preference is dark',()=>{
 stored='light';systemDark=true;theme.restoreThemeBeforePaint(root);assert.ok(classes.has('light'));assert.ok(!classes.has('dark'));assert.equal(root.style.colorScheme,'light');
});
check('system preference resolves before paint in both directions',()=>{
 stored='system';for(const dark of [false,true]){systemDark=dark;theme.restoreThemeBeforePaint(root);assert.equal(classes.has('dark'),dark);assert.equal(root.style.colorScheme,dark?'dark':'light');}
});
check('blocked storage preserves the theme already applied by bootstrap',()=>{
 blocked=true;systemDark=false;theme.restoreThemeBeforePaint(root);assert.ok(classes.has('dark'));blocked=false;
});
check('rapid language intents and release never accumulate temporary theme styles',()=>{
 for(let i=0;i<20;i++){theme.captureLanguageTheme();theme.captureLanguageTheme();assert.equal(head.size,1);theme.releaseLanguageTheme();assert.equal(head.size,0);}
});
const dir='docs/execution/evidence/language-theme-header-2026-10-23';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/theme-regressions.json',JSON.stringify({checks},null,2));
