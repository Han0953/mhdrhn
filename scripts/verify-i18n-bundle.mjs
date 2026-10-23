import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {load} from './verify-i18n.mjs';
const root='docs/execution/evidence/bilingual-2026-10-23';
const {getPublishedProjects}=load('src/lib/content.ts');
const {serverTranslator}=load('src/i18n/server.ts');
const {mediaAssets}=load('src/lib/media.ts');
const t=serverTranslator('en');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const chunks=files('.next/static/chunks').filter(f=>f.endsWith('.js'));
const sentinels=getPublishedProjects().map(p=>p.summary).flatMap(value=>[value,t(value)]);
const leaked=chunks.flatMap(file=>{const text=fs.readFileSync(file,'utf8');return sentinels.filter(s=>text.includes(s)).map(value=>({file,value}));});
assert.equal(leaked.length,0,'Full project narratives must remain on the server');
const font='src/app/fonts/ClashDisplay-Semibold.woff2';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(fs.readFileSync(font)),sha(execFileSync('git',['show','HEAD:'+font])),'Approved font changed');
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean);
assert.ok(!changed.some(f=>f.startsWith('public/')||['package.json','package-lock.json'].includes(f)),'Media or dependencies changed');
const origin='http://127.0.0.1:3004';const images=[];
for(const m of Object.values(mediaAssets).filter(m=>m.publication==='PUBLIC')){const response=await fetch(origin+encodeURI(m.src));assert.equal(response.status,200,m.src);assert.ok(response.headers.get('content-type')?.startsWith('image/'),m.src);const bytes=(await response.arrayBuffer()).byteLength;assert.ok(bytes>0);images.push({id:m.id,src:m.src,status:response.status,bytes});}
const homepage=await fetch(origin+'/en').then(r=>r.text());const sitemap=await fetch(origin+'/sitemap.xml').then(r=>r.text());
const result={buildId:fs.readFileSync('.next/BUILD_ID','utf8'),clientChunks:chunks.length,clientChunkBytes:chunks.reduce((n,f)=>n+fs.statSync(f).size,0),narrativeSentinels:sentinels.length,leaked,fontSha256:sha(fs.readFileSync(font)),mediaAndDependencyChanges:false,publicImageChecks:images,seo:{canonicalEmitted:homepage.includes('rel="canonical"'),sitemapUrls:(sitemap.match(/<loc>/g)||[]).length,noindex:homepage.includes('noindex')}};
fs.writeFileSync(root+'/bundle-assets-seo.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,publicImageChecks:images.length},null,2));
