// Local QA only: preserve RSC headers; delay the real scene chunk or disable WebGL.
import http from 'node:http';
import fs from 'node:fs';
const [mode='slow',portText='3015',upstreamText='3014']=process.argv.slice(2),port=Number(portText),upstream=Number(upstreamText);
if(!['slow','no-webgl','nojs'].includes(mode)||![port,upstream].every(n=>Number.isInteger(n)&&n>=1024&&n<65536))throw Error('Invalid QA arguments');
const sceneChunks=fs.readdirSync('.next/static/chunks').filter(n=>n.endsWith('.js')&&fs.readFileSync('.next/static/chunks/'+n,'utf8').includes('KHR_parallel_shader_compile'));
const disable=mode==='no-webgl'?`var original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/i.test(kind)?null:original.call(this,kind,...args);};`:'';
const probe=`<script>(()=>{${disable}var root=document.documentElement,rows=[],last='';function sample(){var scene=document.querySelector('[data-home-scene]'),wipe=document.querySelector('.route-wipe'),title=document.querySelector('.hero-identity h1>span'),frame=document.querySelector('.hero-signal-frame'),v={boot:root.dataset.homeSceneBoot,scene:scene?.dataset.sceneState,phase:wipe?.dataset.phase,active:document.querySelector('.route-transition-viewport')?.dataset.active,titleOpacity:title?getComputedStyle(title).opacity:undefined,sceneOpacity:frame?getComputedStyle(frame).opacity:undefined,titlePlay:title?getComputedStyle(title).animationPlayState:undefined};var key=JSON.stringify(v);if(key!==last){rows.push({ms:Math.round(performance.now()),...v});root.dataset.sceneQa=JSON.stringify(rows);last=key;}}var loop=setInterval(sample,40),end=setTimeout(stop,10000);function stop(){sample();clearInterval(loop);clearTimeout(end);window.removeEventListener('pagehide',stop);}window.addEventListener('pagehide',stop);})();</script>`;
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://127.0.0.1:'+port);
 if(mode==='slow'&&sceneChunks.some(n=>url.pathname.endsWith('/'+n)))await new Promise(resolve=>setTimeout(resolve,2500));
 const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value&&!['host','connection','accept-encoding','content-length','transfer-encoding','upgrade'].includes(key))headers.set(key,Array.isArray(value)?value.join(','):value);
 const response=await fetch('http://127.0.0.1:'+upstream+url.pathname+url.search,{headers});const type=response.headers.get('content-type')??'';const output=Object.fromEntries(response.headers);
 for(const key of ['content-encoding','content-length','transfer-encoding','connection'])delete output[key];res.writeHead(response.status,{...output,'Cache-Control':'no-store'});
 if(type.includes('text/html')){let html=await response.text();html=mode==='nojs'?html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''):html.replace('<head>','<head>'+probe);res.end(html);}else res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(502);res.end('Local QA upstream unavailable');}});
server.listen(port,'127.0.0.1',()=>console.log(`Home scene QA ${mode} http://127.0.0.1:${port}, scene chunks ${sceneChunks.join(',')}`));
