// Loopback-only QA fixture: deliberately hold About RSC requests until a local release.
import http from 'node:http';
let released=false;
const held=new Set();
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:3008');
 if(url.pathname==='/__qa/state'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({held:held.size,released}));return;}
 if(url.pathname==='/__qa/release/about'){released=true;for(const forward of [...held]){held.delete(forward);forward();}res.end('released');return;}
 function forward(){
  if(res.destroyed)return;
  const headers={...req.headers,host:'127.0.0.1:3005'};
  const upstream=http.request({hostname:'127.0.0.1',port:3005,path:req.url,method:req.method,headers},incoming=>{res.writeHead(incoming.statusCode,incoming.headers);incoming.pipe(res);});
  upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end('QA upstream unavailable');});
  res.on('close',()=>upstream.destroy());req.pipe(upstream);
 }
 if(!released && url.pathname==='/about' && (req.headers.rsc==='1'||url.searchParams.has('_rsc'))){held.add(forward);res.on('close',()=>held.delete(forward));}
 else forward();
});
server.listen(3008,'127.0.0.1',()=>console.log('QA gate on 127.0.0.1:3008 -> 127.0.0.1:3005; About RSC held until /__qa/release/about'));
