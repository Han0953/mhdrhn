// Local visual fixture with the exact built fonts. Never added to public routes.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
const directory = process.env.MHDRHN_QA_TYPOGRAPHY_EVIDENCE || 'docs/execution/evidence/completion-2026-10-19';
const port = Number(process.env.MHDRHN_QA_TYPOGRAPHY_PORT || 3004);
fs.mkdirSync(directory, { recursive: true });
const chunks = '.next/static/chunks';
const compiled = fs.readdirSync(chunks).filter(name => name.endsWith('.css')).map(name => fs.readFileSync(path.join(chunks,name),'utf8')).join('\n');
const fonts = (compiled.match(/@font-face\{[^}]+\}/g)||[]).join('\n').replace(/url\(([^)]+\.woff2)\)/g, (_all, url) => `url(data:font/woff2;base64,${fs.readFileSync(path.resolve(chunks,url)).toString('base64')})`);
if (!fonts.includes('Syne') || !fonts.includes('Manrope')) throw new Error('Built fonts missing');
const versions = { before: execFileSync('git',['show','HEAD:src/app/globals.css'],{encoding:'utf8'}), after:fs.readFileSync('src/app/globals.css','utf8') };
for (const [version, css] of Object.entries(versions)) {
  const specimen = theme => `<section class="fixture-sheet ${theme}"><p class="eyebrow">${version} · ${theme||'light'} · Actual Syne / Manrope</p><header class="page-heading"><h1>Typography</h1></header><div class="hero-identity"><h1><span>Playing</span><span>Jogging</span></h1></div><h2>Engineering</h2><h2>Design · Technology</h2><h3>Projects · g j p q y</h3><p>Typography · Engineering · Design · Technology · Projects · Playing · Jogging · g j p q y</p><h3>Universitas Muhammadiyah Riau — Pendidikan Vokasional Teknik Elektronika</h3><p>Industrial Machine Safety System · Academic Information Dashboard</p><a href="#top" class="text-link">Projects · g j p q y</a></section>`;
  const html=`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Typography QA — ${version}</title><style>${fonts}\n${css.replace(/@import[^;]+;/g,'')}\n.fixture-sheet{padding:28px 20px;background:var(--canvas);color:var(--ink)}.fixture-sheet h2,.fixture-sheet h3,.fixture-sheet>p{margin-block:24px}.fixture-sheet .hero-identity{margin-bottom:32px}</style><body id="top" style="--font-display:Syne;--font-body:Manrope"><p class="wrap">Local typography test fixture — not a portfolio page.</p>${specimen('')}${specimen('dark')}</body></html>`;
  fs.writeFileSync(`${directory}/typography-${version}.html`,html);
}
if(process.argv.includes('--serve')) http.createServer((req,res)=>{
  const version=req.url==='/before'?'before':req.url==='/after'?'after':null;
  if(!version){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  res.end(fs.readFileSync(`${directory}/typography-${version}.html`));
}).listen(port,'127.0.0.1',()=>console.log(`Typography fixtures only: http://127.0.0.1:${port}/before and /after`));
