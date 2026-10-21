import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const directory='docs/execution/evidence/phase1-media-2026-10-21';
fs.mkdirSync(directory,{recursive:true});
function walk(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(item=>item.isDirectory()?walk(path.join(folder,item.name)):[path.join(folder,item.name).replaceAll('\\','/')]);}
const assets=[];
for(const file of walk('public')){
 const bytes=fs.readFileSync(file),isImage=/\.(webp|png|jpe?g|svg|avif)$/i.test(file);
 const metadata=isImage?await sharp(bytes).metadata():{};
 assets.push({file,url:'/'+file.slice(7),format:metadata.format??path.extname(file).slice(1),bytes:bytes.length,width:metadata.width??null,height:metadata.height??null,orientation:metadata.width?(metadata.width===metadata.height?'square':metadata.width>metadata.height?'landscape':'portrait'):null,aspectRatio:metadata.width?Number((metadata.width/metadata.height).toFixed(4)):null,hasExif:!!metadata.exif,hasIcc:!!metadata.icc,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
const duplicates=assets.filter((a,i)=>assets.findIndex(b=>b.sha256===a.sha256)!==i).map(a=>a.file);
const mode=process.argv[2]??'capture';
if(mode==='capture'){
 if(fs.existsSync(`${directory}/asset-baseline.json`))throw Error('Preserve original asset baseline');
 fs.writeFileSync(`${directory}/asset-baseline.json`,JSON.stringify({assets,duplicates},null,2));
 fs.writeFileSync(`${directory}/git-before.txt`,(await import('node:child_process')).execFileSync('git',['status','--short'],{encoding:'utf8'}));
}else{
 const before=JSON.parse(fs.readFileSync(`${directory}/asset-baseline.json`));
 for(const original of before.assets){if(!assets.some(a=>a.file===original.file&&a.sha256===original.sha256))throw Error(`Original asset changed: ${original.file}`);}
 fs.writeFileSync(`${directory}/asset-final.json`,JSON.stringify({assets,duplicates,originalsUnchanged:true},null,2));
}
console.log(JSON.stringify({files:assets.length,raster:assets.filter(a=>a.format==='webp').length,svg:assets.filter(a=>a.format==='svg').length,bytes:assets.reduce((sum,a)=>sum+a.bytes,0),duplicates,images:assets.filter(a=>a.width).map(({file,width,height,bytes})=>({file,width,height,bytes}))},null,2));
