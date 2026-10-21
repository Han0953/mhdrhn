// Local-only QA: force a real image error without changing production code or assets.
import http from 'node:http';
const upstream='http://127.0.0.1:3005';
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:3008');
 if(url.pathname==='/_next/image'&&['/project/web/vircuit.webp','/project/hardware/inkubator-mqtt.webp'].includes(url.searchParams.get('url'))){
  res.writeHead(503,{'content-type':'text/plain','cache-control':'no-store'});res.end('Intentional local QA image failure');return;
 }
 try{const response=await fetch(upstream+req.url,{headers:{...req.headers,host:'127.0.0.1:3005'}});res.writeHead(response.status,Object.fromEntries([...response.headers].filter(([key])=>!['content-encoding','content-length','transfer-encoding'].includes(key))));res.end(Buffer.from(await response.arrayBuffer()));}
 catch{res.writeHead(502);res.end('Local QA upstream unavailable');}
}).listen(3008,'127.0.0.1',()=>console.log('QA image failure proxy: http://127.0.0.1:3008'));
