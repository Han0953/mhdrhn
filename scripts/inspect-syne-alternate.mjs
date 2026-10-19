// Compare the two glyph forms using the exact cached production font.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const directory = 'docs/execution/evidence/glyph-filter-content-2026-10-19';
fs.mkdirSync(directory, { recursive: true });
const chunks = '.next/static/chunks';
const css = fs.readdirSync(chunks).filter(n => n.endsWith('.css')).map(n => fs.readFileSync(path.join(chunks,n),'utf8')).join('\n');
const fonts = (css.match(/@font-face\{[^}]+\}/g)||[]).join('\n').replace(/url\(([^)]+\.woff2)\)/g, (_, url) => `url(data:font/woff2;base64,${fs.readFileSync(path.resolve(chunks,url)).toString('base64')})`);
const html = `<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Syne glyph diagnostic</title><style>${fonts} body{margin:32px;background:#000;color:#f3f0e9;font-family:Manrope,sans-serif}.sample{font:700 clamp(32px,7vw,88px)/1.8 Syne,sans-serif;overflow:visible;margin:0;padding:20px 0;color:#ff6973}.alternate{font-feature-settings:"ss04" 1}p{margin:0}</style><p>Original glyph · unmasked, line-height 1.8</p><div class="sample">kemungkinan. g j p q y</div><p>Alternate glyph · ss04, same font and spacing</p><div class="sample alternate">kemungkinan. g j p q y</div></html>`;
const fullFont = fs.readFileSync('src/app/fonts/Syne-Variable.ttf').toString('base64');
const comparison = html.replace('</style>', `@font-face{font-family:SyneFull;src:url(data:font/ttf;base64,${fullFont});font-weight:400 800}.alternate{font-family:SyneFull}</style>`);
fs.writeFileSync(`${directory}/syne-alternate.html`, comparison);
http.createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(comparison);}).listen(3006,'127.0.0.1',()=>console.log('Font diagnostic http://127.0.0.1:3006'));
