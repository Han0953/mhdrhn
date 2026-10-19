// Local specimen using installed production fonts; never added to public routes.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
const directory = process.env.MHDRHN_DESCENDER_EVIDENCE || 'docs/execution/evidence/descenders-2026-10-19';
fs.mkdirSync(directory,{recursive:true});
const chunks='.next/static/chunks';
const compiled=fs.readdirSync(chunks).filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(path.join(chunks,f),'utf8')).join('\n');
const fonts=(compiled.match(/@font-face\{[^}]+\}/g)||[]).join('\n').replace(/url\(([^)]+\.(?:woff2|ttf))\)/g,(_,url)=>`url(data:font/${url.endsWith('ttf')?'ttf':'woff2'};base64,${fs.readFileSync(path.resolve(chunks,url)).toString('base64')})`);
const syne=fs.readFileSync('src/app/fonts/Syne-Variable.ttf').toString('base64');
const specimen=(name,family)=>`<section><p>${name} · tanpa mask, line-height 1.8</p><div class="sample" style="font-family:${family}">g j p q y</div><div class="words" style="font-family:${family}">Typography · Jogging<br>Playing · Projects<br>pengecekan · dukungan</div></section>`;
const html=`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Descender specimen</title><style>${fonts}@font-face{font-family:SyneFull;src:url(data:font/ttf;base64,${syne});font-weight:400 800}body{margin:24px;background:#000;color:#f3f0e9;font-family:Manrope,sans-serif}section{padding:16px 0;border-bottom:1px solid #555}.sample{font-size:clamp(40px,9vw,100px);font-weight:700;line-height:1.8;font-feature-settings:"ss04" 1;overflow:visible;color:#ff6973}.words{font-size:clamp(26px,4vw,46px);font-weight:700;line-height:1.8;font-feature-settings:"ss04" 1;overflow:visible}p{margin:0}</style>${specimen('Syne saat ini','SyneFull')}${specimen('Manrope pembanding','Manrope')}</html>`;
fs.writeFileSync(`${directory}/font-specimen.html`,html);
const versions={before:execFileSync('git',['show','HEAD:src/app/globals.css'],{encoding:'utf8'}),after:fs.readFileSync('src/app/globals.css','utf8')};
const pages={};
for(const [version,css] of Object.entries(versions)) {
  const content=[400,600,700,800].map(weight=>`<section class="section"><p>Weight ${weight} · ${version}</p><h2 style="font-weight:${weight}">g j p q y</h2><h2 style="font-weight:${weight}">Typography<br>Jogging · Playing</h2><h3 style="font-weight:${weight}">Projects · Quality<br>pengecekan · dukungan</h3></section>`).join('');
  pages[version]=`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Descender ${version}</title><style>${fonts}@font-face{font-family:SyneFull;src:url(data:font/ttf;base64,${syne});font-weight:400 800}${css.replace(/@import[^;]+;/g,'')}html{--font-body:Manrope;--font-brand:SyneFull;${version==='before'?'--font-display:SyneFull;':''}}.section h2,.section h3{margin-block:20px}.dark{--accent-text:#ff6973}</style><body class="dark"><main class="wrap"><p>Local specimen · actual ${version} CSS</p>${content}</main></body></html>`;
  fs.writeFileSync(`${directory}/descenders-${version}.html`,pages[version]);
}
http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(req.url==='/before'?pages.before:req.url==='/after'?pages.after:html);}).listen(3006,'127.0.0.1',()=>console.log('Descender specimen http://127.0.0.1:3006 (/, /before, /after)'));
