import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { loadContent } from './load-content.mjs';
import { validateLogo, vendorPlan } from './vendor-technology-logos.mjs';
const {brandFilesForTechnology,technologyBrandAssets,technologyBrandFallbacks}=loadContent('src/lib/technology-brands.ts');
const {technologyInventoryGroups,homeTechnologyGroups}=loadContent('src/lib/technology-inventory.ts');
const manifest=JSON.parse(fs.readFileSync('public/brand-icons/manifest.json','utf8'));
const results=[];
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS '+name);}
await check('every referenced original asset matches its recorded source hash, safe format, and bounded file size',()=>{
  const files=new Set(Object.values(technologyBrandAssets));
  assert.equal(files.size,38);assert.equal(manifest.assets.length,38);assert.equal(vendorPlan.length,38);
  for(const asset of manifest.assets){assert.match(asset.file,/^[a-z0-9-]+\.(svg|png)$/);assert.ok(files.has(asset.file));assert.equal(vendorPlan.find(item=>item.file===asset.file)?.url,asset.url);const bytes=fs.readFileSync(`public/brand-icons/${asset.file}`);validateLogo(bytes,asset.file);assert.equal(bytes.length,asset.bytes);assert.ok(bytes.length<200000);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);assert.match(asset.url,/^https:\/\//);}
});
await check('SVG guard rejects executable/external artwork and PNG guard rejects disguised files',()=>{
  for(const dangerous of ['<script/>','<foreignObject/>','<path onclick="go()"/>','<image href="https://example.test/a.png"/>','<!DOCTYPE svg>','<style>.x{fill:url(https://example.test/a)}</style>'])assert.throws(()=>validateLogo(Buffer.from(`<svg viewBox="0 0 24 24"><path d="M0 0h24v24Z"/>${dangerous}</svg>`),'bad.svg'));
  assert.throws(()=>validateLogo(Buffer.from('<svg/>'),'bad.png'));
});
await check('every Tech, Embedded, and Tools record uses a reviewed mark or an explicit fallback reason',()=>{
  for(const group of technologyInventoryGroups.filter(g=>g.id!=='capabilities'))for(const item of group.items)assert.ok(brandFilesForTechnology(item.id).length||technologyBrandFallbacks[item.id],`Unreviewed ${item.id}`);
  assert.deepEqual(Array.from(brandFilesForTechnology('postgresql-supabase')),['postgresql.svg','supabase.svg']);
});
await check('restricted identities and non-brand concepts do not acquire misleading product logos',()=>{
  for(const id of ['vs-code','raspberry-pi','microsoft-office','sql','rest-api','web-worker','react-three-fiber','monaco-editor','laravel-pint'])assert.equal(brandFilesForTechnology(id).length,0,id);
  assert.equal(brandFilesForTechnology('esp8266')[0],'espressif.svg');assert.equal(brandFilesForTechnology('esp32')[0],'espressif.svg');assert.equal(brandFilesForTechnology('stm32')[0],'stmicroelectronics.svg');
  for(const item of technologyInventoryGroups.find(g=>g.id==='capabilities').items)assert.equal(brandFilesForTechnology(item.id).length,0);
});
await check('collection licences and brand attribution are distributed with the original local files',()=>{
  for(const file of ['DEVICON-LICENSE.txt','LOBE-ICONS-LICENSE.txt'])assert.match(fs.readFileSync(`public/brand-icons/${file}`,'utf8'),/Permission is hereby granted/);
  const notice=fs.readFileSync('public/brand-icons/README.md','utf8');for(const value of ['CC0-1.0','CC-BY-3.0','CC-BY-SA-4.0','Jason Long','konpa','LobeHub','Google'])assert.ok(notice.includes(value),value);
});
const origin=process.env.MHDRHN_QA_ORIGIN;
if(origin){
  assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname));
  await check('all local mask assets are served successfully with correct bytes and media type',async()=>{
    for(let start=0;start<manifest.assets.length;start+=6)await Promise.all(manifest.assets.slice(start,start+6).map(async asset=>{const response=await fetch(`${origin}/brand-icons/${asset.file}`);assert.equal(response.status,200,asset.file);assert.match(response.headers.get('content-type'),asset.file.endsWith('.png')?/image\/png/:/image\/svg\+xml/);const bytes=Buffer.from(await response.arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.file);}));
  });
  await check('Home and About use same-origin brand masks with unchanged accessible names',async()=>{
    for(const [route,groups] of [['/',homeTechnologyGroups],['/about',technologyInventoryGroups]]){const response=await fetch(origin+route);const html=(await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');for(const group of groups)for(const item of group.items){const row=html.match(new RegExp(`<li[^>]*data-technology="${item.id}"[^>]*>([\\s\\S]*?)<\\/li>`))?.[1];assert.ok(row,item.id);for(const file of brandFilesForTechnology(item.id)){assert.ok(row.includes(`data-brand-asset="${file}"`),item.id);assert.ok(row.includes(`/brand-icons/${file}`),item.id);}assert.doesNotMatch(row,/(?:src|href)=.https?:\/\/|url\((?:&quot;|.)?https?:\/\//);}}
  });
}
const directory='docs/execution/evidence/monochrome-brands-2026-10-23';fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(`${directory}/brand-checks.json`,JSON.stringify({method:'Asset hash/safety/provenance validation and actual localhost HTTP/SSR; does not prove physical-device rendering.',assetCount:manifest.assets.length,totalBytes:manifest.assets.reduce((n,a)=>n+a.bytes,0),results},null,2));
console.log(`${results.length} brand checks passed.`);
