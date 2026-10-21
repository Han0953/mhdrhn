import fs from 'node:fs';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {loadContent} from './load-content.mjs';
const directory=process.env.MHDRHN_QA_MEDIA_EVIDENCE||'docs/execution/evidence/phase1-media-2026-10-21';
const origin=process.env.MHDRHN_QA_ORIGIN||'http://127.0.0.1:3005';
assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname));
const media=loadContent('src/lib/media.ts'),content=loadContent(),results=[],sizes=[];
async function check(name,fn){await fn();results.push({name,status:'PASS'});console.log(`PASS ${name}`);}
await check('all registered assets have actual files, matching dimensions, useful alt/caption, and unique IDs',async()=>{
 const ids=new Set();for(const item of Object.values(media.mediaAssets)){
  assert.ok(!ids.has(item.id),item.id);ids.add(item.id);assert.ok(item.src.startsWith('/')&&!item.src.startsWith('/public/'));
  assert.ok(item.alt.length>10&&item.caption.length>10&&item.credit);const actual=await sharp('public'+item.src).metadata();assert.equal(actual.width,item.width,item.id);assert.equal(actual.height,item.height,item.id);
 }
});
await check('project mapping only names published records and never shares another project photo',()=>{
 const used=new Set();for(const [slug,items] of Object.entries(media.projectMedia)){
  assert.ok(content.getProjectBySlug(slug),slug);for(const item of items){assert.ok(!used.has(item.src),`Media reused across projects: ${slug}`);used.add(item.src);}
 }
 assert.match(media.getProjectMedia('iot-egg-incubator-research')[0].src,/inkubator-mqtt/);assert.match(media.getProjectMedia('iot-egg-incubator-blynk')[0].src,/inkubator-blynk/);
 assert.equal(media.getProjectMedia('aura-pod').length,2);assert.deepEqual(Array.from(media.getProjectMedia('air-quality-monitoring')),[]);
});
await check('reviewed media are not returned by public accessors; certificates keep original readable metadata',()=>{
 for(const items of Object.values(media.projectMedia))for(const item of items.filter(i=>i.publication==='REVIEW'))assert.ok(!Object.values(media.projectMedia).flatMap((_,i)=>media.getProjectMedia(Object.keys(media.projectMedia)[i])).some(i=>i.src===item.src));
 for(const id of Object.keys(media.achievementMedia))assert.ok(media.getAchievementMedia(id).every(i=>i.publication==='PUBLIC'));
 assert.equal(media.certificates.length,3);assert.equal(media.certificates.find(c=>c.id==='gemini-student').issued,'03/08/2026');assert.equal(media.certificates.find(c=>c.id==='gemini-student').expires,'03/08/2029');assert.ok(!media.certificates.some(c=>c.category==='AWS'));
 for(const c of media.certificates){assert.equal(c.media.publication,'PUBLIC');assert.ok(c.title&&c.issuer&&c.issued);assert.ok(!c.verificationUrl,'No invented verification URLs');}
});
for(const item of Object.values(media.mediaAssets).filter(i=>i.publication==='PUBLIC'))await check(`original and responsive optimizer: ${item.id}`,async()=>{
 const original=await fetch(origin+item.src);assert.equal(original.status,200,item.src);assert.match(original.headers.get('content-type'),/^image\//);
 const response=await fetch(`${origin}/_next/image?url=${encodeURIComponent(item.src)}&w=640&q=75`,{headers:{Accept:'image/webp'}});assert.equal(response.status,200,item.id);
 const buffer=Buffer.from(await response.arrayBuffer()),metadata=await sharp(buffer).metadata();assert.ok(metadata.width<=640);assert.ok(metadata.height>0);
 sizes.push({id:item.id,originalBytes:fs.statSync('public'+item.src).size,optimizedBytes:buffer.length,width:metadata.width,height:metadata.height,format:metadata.format});
});
await check('all 22 detail routes retain text, using either their own gallery or an editorial fallback',async()=>{
 for(const project of content.getPublishedProjects()){
  const response=await fetch(origin+'/projects/'+project.slug);assert.equal(response.status,200);const html=(await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  assert.ok(html.includes(project.title));const items=media.getProjectMedia(project.slug);
  if(items.length){for(const item of items)assert.ok(html.includes(encodeURIComponent(item.src)),item.id);assert.ok(html.includes('Perbesar gambar'));}
  else{assert.ok(html.includes('data-media-status="fallback"'),project.slug);assert.ok(html.includes('Visual editorial'));}
  assert.doesNotMatch(html,/Ilustrasi konsep, bukan dokumentasi produk|Coming Soon|<img[^>]*src=""/i);
 }
});
await check('catalog contains all 22 entries with thumbnails or editorial covers, without hiding records lacking photos',async()=>{
 const html=(await (await fetch(origin+'/projects')).text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<!--[\s\S]*?-->/g,'');assert.ok(/22 proyek ditemukan/.test(html),'Catalog result count');assert.equal((html.match(/data-media-project=/g)||[]).length,22);
 for(const p of content.getPublishedProjects())assert.ok(html.includes('/projects/'+p.slug));
});
await check('Home and Lab use the correct two incubator photos; research results stay unclaimed',async()=>{
 const home=await (await fetch(origin)).text(),lab=await (await fetch(origin+'/lab')).text();
 for(const html of [home,lab]){assert.ok(html.includes(encodeURIComponent(media.mediaAssets.mqtt.src)));assert.ok(html.includes(encodeURIComponent(media.mediaAssets.blynk.src)));}
 assert.match(lab,/Hasil akhir pengujian dan validasi koneksi online belum tersedia/);
});
fs.writeFileSync(`${directory}/media-checks.json`,JSON.stringify({results,sizes},null,2));
console.log(`${results.length} media checks passed.`);
