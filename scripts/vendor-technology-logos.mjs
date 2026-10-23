// Explicit maintenance command, never called by build or in the browser.
// Downloads original public artwork; SVG paths/pixels are not rewritten.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const simple = '90bd1f3e7b77851fd0c56474f6fa43b816babdab';
const devicon = '6a37858047b0e8d9c9c0e68f4a071fc410652e89';
const lobe = '680f1d7f95b5ae6a494fe43539da8a992f17b53d';
const icons = [
  ['cplusplus','cplusplus'],['javascript','javascript'],['typescript','typescript'],['php','php'],['python','python'],['micropython','micropython'],['dart','dart'],['html5','html5'],
  ['react','react'],['nextjs','nextdotjs'],['vite','vite'],['tailwindcss','tailwindcss'],['laravel','laravel'],['mysql','mysql'],['postgresql','postgresql'],['supabase','supabase'],
  ['gsap','gsap'],['threejs','threedotjs'],['flutter','flutter'],['firebase','firebase'],['arduino','arduino'],['mqtt','mqtt'],['espressif','espressif'],['stmicroelectronics','stmicroelectronics'],
  ['androidstudio','androidstudio'],['git','git'],['autocad','autocad'],['vitest','vitest'],
].map(([id,slug])=>({id,file:`${id}.svg`,url:`https://raw.githubusercontent.com/simple-icons/simple-icons/${simple}/icons/${slug}.svg`,collection:'Simple Icons',revision:simple,license:'CC0-1.0 collection; underlying brand rights apply'}));
for (const [id,folder,version] of [['css3','css3','plain'],['canva','canva','original'],['playwright','playwright','plain'],['framermotion','framermotion','original']]) icons.push({id,file:`${id}.svg`,url:`https://raw.githubusercontent.com/devicons/devicon/${devicon}/icons/${folder}/${folder}-${version}.svg`,collection:'Devicon',revision:devicon,license:'MIT collection; underlying brand rights apply'});
for(const [id,slug] of [['opencode','opencode'],['claudecode','claudecode']]) icons.push({id,file:`${id}.svg`,url:`https://raw.githubusercontent.com/lobehub/lobe-icons/${lobe}/packages/static-svg/icons/${slug}.svg`,collection:'Lobe Icons',revision:lobe,license:'MIT collection; underlying brand rights apply'});
icons.push(
  {id:'antigravity',file:'antigravity.svg',url:'https://antigravity.google/assets/image/brand/antigravity-icon__one-color.svg',collection:'Official Antigravity press assets',license:'Google brand guidelines'},
  {id:'wokwi',file:'wokwi.svg',url:'https://wokwi.com/favicon.svg',collection:'Official Wokwi website',license:'Wokwi brand rights'},
  {id:'blynk',file:'blynk.svg',url:'https://cdn.prod.website-files.com/6272e11601c9e296becde07b/68b4aa5387e457b5e3fe57a6_B-Logotype.svg',collection:'Official Blynk website stylesheet nav-logo-new-black',license:'Blynk brand rights'},
  {id:'cirkit-designer',file:'cirkit-designer.png',url:'https://www.cirkitdesigner.com/dist/ico/favicon-32x32.png',collection:'Official Cirkit Designer website',license:'Cirkit Design brand rights'},
);
export const vendorPlan = icons;
export function validateLogo(bytes, file) {
  if (file.endsWith('.png')) {
    if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw Error(`Invalid PNG ${file}`);
  } else {
    const svg=bytes.toString('utf8');
    if(!/<svg\b/.test(svg)||!/<(?:path|polygon|rect|circle|ellipse|g)\b/.test(svg)||! /viewBox\s*=/.test(svg))throw Error(`Invalid SVG ${file}`);
    if(/<script\b|<foreignObject\b|<!DOCTYPE|<!ENTITY|\son\w+\s*=|(?:href|url\()\s*[=\s"']*(?:https?:|data:|javascript:|\/\/)/i.test(svg)) throw Error(`Unsafe SVG ${file}`);
  }
}
if(process.argv.includes('--download')) {
  const directory=path.resolve('public/brand-icons');
  await fs.mkdir(directory,{recursive:true});
  const results=[];
  for(const item of icons) {
    const response=await fetch(item.url,{signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw Error(`${response.status} ${item.url}`);
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length>200000)throw Error(`Oversized logo ${item.file}`);
    validateLogo(bytes,item.file);
    const target=path.join(directory,item.file);
    try { await fs.writeFile(target,bytes,{flag:'wx'}); }
    catch(error){if(error.code!=='EEXIST')throw error;const previous=await fs.readFile(target);if(!previous.equals(bytes))throw Error(`Refusing to overwrite changed asset ${item.file}`);}
    results.push({...item,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
    console.log(`OK ${item.file} (${bytes.length} bytes)`);
  }
  for(const [name,url] of [
    ['DEVICON-LICENSE.txt',`https://raw.githubusercontent.com/devicons/devicon/${devicon}/LICENSE`],
    ['LOBE-ICONS-LICENSE.txt',`https://raw.githubusercontent.com/lobehub/lobe-icons/${lobe}/LICENSE`],
  ]) {
    const response=await fetch(url);if(!response.ok)throw Error(`License ${response.status} ${url}`);
    const text=await response.text();await fs.writeFile(path.join(directory,name),text,{flag:'wx'}).catch(error=>{if(error.code!=='EEXIST')throw error;});
  }
  await fs.writeFile(path.join(directory,'manifest.json'),JSON.stringify({retrievedOn:'2026-10-23',method:'Original upstream files, unchanged; vector alpha masks and bitmap CSS compositing provide monochrome presentation. No runtime remote requests.',assets:results},null,2)+'\n');
  console.log(`${results.length} local brand assets verified.`);
}
