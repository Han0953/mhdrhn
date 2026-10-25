// Local-only QA proxy: delays application bundles, never production source.
import http from 'node:http';
const mode=process.argv[2]??'slow',port=Number(process.argv[3]??3015),upstreamPort=Number(process.argv[4]??3014);
if(!['normal','slow','late','nojs'].includes(mode)||![port,upstreamPort].every(value=>Number.isInteger(value)&&value>=1024&&value<=65535))throw Error('Invalid QA mode or port');
const probe=`<script id="startup-qa-probe">(()=>{
var root=document.documentElement,records=[],last='',started=performance.now();
function alpha(node){var result=1;if(!node)return 0;for(;node&&node!==root;node=node.parentElement)result*=Number(getComputedStyle(node).opacity);return Math.round(result*100)/100;}
function sample(){var title=document.querySelector('h1');if(!title)return;
 var leaf=title.querySelector('.display-line-content')||title.firstElementChild||title,opacity=1;
 for(var node=leaf;node&&node!==root;node=node.parentElement)opacity*=Number(getComputedStyle(node).opacity);
 var state={boot:root.dataset.motionStartup||'none',visibility:getComputedStyle(leaf).visibility,opacity:Math.round(opacity*100)/100,roleOpacity:alpha(document.querySelector('.role-visible')),headerOpacity:alpha(document.querySelector('.wordmark')),titleQueued:!!leaf.closest('[data-reveal="queued"],[data-reveal="prepared"]'),ready:!!document.querySelector('main [data-motion-ready="true"]'),staged:!!document.querySelector('main [data-reveal]')};
 var key=JSON.stringify(state);if(key!==last&&records.length<150){records.push({ms:Math.round(performance.now()-started),...state});last=key;root.dataset.startupQa=JSON.stringify(records);}
}
var interval=setInterval(sample,40),timer=setTimeout(stop,8500);
function stop(){sample();clearInterval(interval);clearTimeout(timer);window.removeEventListener('pagehide',stop);}
window.addEventListener('pagehide',stop,{once:true});sample();
})();</script>`;
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:'+port);
  if(/\/_next\/static\/.*\.js$/.test(url.pathname))await new Promise(resolve=>setTimeout(resolve,mode==='slow'?1000:mode==='late'?6500:0));
  const forwarded=new Headers();
  for(const [name,value] of Object.entries(req.headers))if(value&&!['host','connection','accept-encoding','content-length','transfer-encoding','upgrade'].includes(name))forwarded.set(name,Array.isArray(value)?value.join(','):value);
  const upstream=await fetch('http://127.0.0.1:'+upstreamPort+url.pathname+url.search,{headers:forwarded});
  const type=upstream.headers.get('content-type')??'application/octet-stream';
  const responseHeaders=Object.fromEntries(upstream.headers);
  for(const name of ['content-encoding','content-length','transfer-encoding','connection'])delete responseHeaders[name];
  res.writeHead(upstream.status,{...responseHeaders,'Content-Type':type,'Cache-Control':'no-store'});
  if(type.includes('text/html')){
   let html=await upstream.text();
   if(mode==='nojs')html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
   else html=html.replace('</head>',probe+'</head>');
   res.end(html);
  }else res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch{res.writeHead(502,{'Content-Type':'text/plain'});res.end('Local QA upstream unavailable');}
});
server.listen(port,'127.0.0.1',()=>console.log('Startup QA '+mode+' http://127.0.0.1:'+port));
