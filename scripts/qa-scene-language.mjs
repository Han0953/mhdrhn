// Loopback-only visual continuity probe. No changes to the application runtime.
import http from 'node:http';
const port=Number(process.argv[2]??3018);
const upstream=Number(process.argv[3]??3000);
const probe=`<script>(()=>{
 const root=document.documentElement;let rows=[],frame=0,end=0;
 for(const key of ['width','height']){const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,key);Object.defineProperty(HTMLCanvasElement.prototype,key,{...descriptor,set(value){descriptor.set.call(this,value);if(this.closest('.hero-scene-stage'))this.dataset.sceneBuffer='cleared';}});}
 for(const context of [window.WebGLRenderingContext,window.WebGL2RenderingContext])if(context)for(const key of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const original=context.prototype[key];if(original)context.prototype[key]=function(...args){const result=original.apply(this,args);if(this.canvas.closest('.hero-scene-stage'))this.canvas.dataset.sceneBuffer='painted';return result;};}
 function sample(){
  const scene=document.querySelector('[data-home-scene]'),canvas=scene?.querySelector('canvas'),parents=[];
  for(let node=canvas??scene;node;node=node.parentElement){const s=getComputedStyle(node);parents.push({tag:node.tagName,cls:node.className,opacity:s.opacity,visibility:s.visibility,animation:s.animationName,reveal:node.dataset?.reveal,startup:node.dataset?.startupReveal,claimed:node.dataset?.startupClaimed});}
  rows.push({ms:Math.round(performance.now()),lang:root.lang,changing:root.dataset.languageChanging,state:scene?.dataset.sceneState,instance:canvas?.parentElement.dataset.sceneInstance,buffer:canvas?.dataset.sceneBuffer,parents});
  root.dataset.sceneLanguageQa=JSON.stringify(rows);if(performance.now()<end)frame=requestAnimationFrame(sample);
 }
 document.addEventListener('click',event=>{if(event.target.closest('[role="menuitemradio"]')){cancelAnimationFrame(frame);rows=[];end=performance.now()+3000;sample();}},true);
 window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
})();</script>`;
http.createServer(async(req,res)=>{try{
 const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value&&!['host','connection','accept-encoding','content-length','transfer-encoding','upgrade'].includes(key))headers.set(key,Array.isArray(value)?value.join(','):value);
 const response=await fetch('http://127.0.0.1:'+upstream+req.url,{headers});const type=response.headers.get('content-type')??'',output=Object.fromEntries(response.headers);
 for(const key of ['content-encoding','content-length','transfer-encoding','connection'])delete output[key];res.writeHead(response.status,{...output,'Cache-Control':'no-store'});
 if(type.includes('text/html'))res.end((await response.text()).replace('<head>','<head>'+probe));else res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(502);res.end('QA upstream unavailable');}}).listen(port,'127.0.0.1',()=>console.log('Scene language probe http://127.0.0.1:'+port));
