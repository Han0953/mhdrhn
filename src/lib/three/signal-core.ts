import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export interface SignalCore {select:(index:number)=>void;explode:(value:boolean)=>void;pulse:()=>void;dispose:()=>void;attach:(host:HTMLElement,surface:HTMLElement,onFailure:()=>void)=>void;state:()=>{selected:number;expanded:boolean}}
let instance=0;

/** One procedural sculpture. No model/texture downloads, postprocessing or perpetual render loop. */
export async function mountSignalCore(host:HTMLElement,surface:HTMLElement,onFailure:()=>void,signal:AbortSignal):Promise<SignalCore>{
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
  const instanceId=String(++instance);host.dataset.sceneInstance=instanceId;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera();
  camera.position.set(6.2,5.2,8.5);camera.lookAt(0,.2,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x666677,2.4));
  const key=new THREE.DirectionalLight(0xffffff,3.8);key.position.set(-3,6,4);scene.add(key);
  const rim=new THREE.DirectionalLight(0xff454f,1.8);rim.position.set(4,1,-4);scene.add(rim);
  const sculpture=new THREE.Group();scene.add(sculpture);
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
  const material=(color:number,metalness=.55,roughness=.36)=>{const m=new THREE.MeshStandardMaterial({color,metalness,roughness});materials.add(m);return m;};
  const shell=material(0x28282c),silver=material(0xd4d1c9,.8,.28),ceramic=material(0xeee9dd,.25,.42),red=material(0xc92632,.4,.3);
  const luminous=new THREE.MeshStandardMaterial({color:0xff3f4c,emissive:0xc92632,emissiveIntensity:.8,roughness:.25});materials.add(luminous);
  function box(w:number,h:number,d:number,m:THREE.Material,parent:THREE.Object3D=sculpture){const g=new RoundedBoxGeometry(w,h,d,2,Math.min(.045,h*.2));geometries.add(g);const mesh=new THREE.Mesh(g,m);parent.add(mesh);return mesh;}
  const layers: {node:THREE.Object3D;y:number;lift:number}[]=[];
  const plate=(w:number,h:number,d:number,y:number,m:THREE.Material,lift:number)=>{const node=box(w,h,d,m);node.position.y=y;layers.push({node,y,lift});return node;};
  plate(4.35,.12,2.75,-.36,shell,-.38);plate(4.15,.055,2.56,-.24,silver,-.16);plate(3.98,.09,2.4,-.12,shell,0);
  const processor=new THREE.Group();sculpture.add(processor);processor.position.y=.02;layers.push({node:processor,y:.02,lift:.85});
  box(1.46,.12,1.46,silver,processor);box(1.28,.48,1.28,shell,processor).position.y=.25;
  box(1.06,.07,1.06,ceramic,processor).position.y=.53;
  box(.66,.025,.66,red,processor).position.y=.58;
  // Repeated contacts are instanced: one draw call per metal family.
  const pinsGeometry=new THREE.BoxGeometry(.075,.09,.21);geometries.add(pinsGeometry);
  const pins=new THREE.InstancedMesh(pinsGeometry,silver,40),dummy=new THREE.Object3D();processor.add(pins);
  for(let i=0;i<40;i++){const side=Math.floor(i/10),offset=(i%10-4.5)*.125;dummy.position.set(side<2?offset:(side===2?-.82:.82),.015,side<2?(side===0?-.82:.82):offset);dummy.rotation.y=side<2?0:Math.PI/2;dummy.updateMatrix();pins.setMatrixAt(i,dummy.matrix);}
  const postsGeometry=new THREE.CylinderGeometry(.055,.055,.14,12);geometries.add(postsGeometry);
  const posts=new THREE.InstancedMesh(postsGeometry,silver,4);sculpture.add(posts);
  [[-1.92,-1.08],[1.92,-1.08],[-1.92,1.08],[1.92,1.08]].forEach(([x,z],i)=>{dummy.position.set(x,-.02,z);dummy.rotation.set(0,0,0);dummy.updateMatrix();posts.setMatrixAt(i,dummy.matrix);});
  const input=new THREE.Group();input.position.set(-1.48,.07,.25);sculpture.add(input);layers.push({node:input,y:.07,lift:.48});
  box(.61,.17,.82,silver,input);box(.44,.3,.59,shell,input).position.y=.18;
  const ringGeometry=new THREE.TorusGeometry(.17,.035,8,32);geometries.add(ringGeometry);
  const lens=new THREE.Mesh(ringGeometry,red);lens.rotation.x=-Math.PI/2;lens.position.y=.35;input.add(lens);
  const output=new THREE.Group();output.position.set(1.42,.04,-.12);sculpture.add(output);layers.push({node:output,y:.04,lift:.62});
  box(.68,.13,1.03,silver,output);box(.5,.32,.8,shell,output).position.y=.21;
  for(let i=0;i<3;i++)box(.35,.04,.075,i===0?red:ceramic,output).position.set(0,.4,(i-1)*.19);
  const detailsGeometry=new THREE.BoxGeometry(.12,.07,.19);geometries.add(detailsGeometry);
  const details=new THREE.InstancedMesh(detailsGeometry,ceramic,16);sculpture.add(details);
  for(let i=0;i<16;i++){dummy.position.set((i%8-3.5)*.38,.015,i<8?-.99:1.02);dummy.rotation.set(0,0,0);dummy.updateMatrix();details.setMatrixAt(i,dummy.matrix);}
  const paths=[
    new THREE.CatmullRomCurve3([new THREE.Vector3(-1.45,.015,.25),new THREE.Vector3(-1.1,.015,.75),new THREE.Vector3(-.5,.015,.75),new THREE.Vector3(0,.015,0)],false,'catmullrom',.05),
    new THREE.CatmullRomCurve3([new THREE.Vector3(0,.015,0),new THREE.Vector3(.65,.015,-.7),new THREE.Vector3(1.05,.015,-.7),new THREE.Vector3(1.42,.015,-.12)],false,'catmullrom',.05),
  ];
  paths.forEach(curve=>{const g=new THREE.TubeGeometry(curve,28,.022,5,false);geometries.add(g);sculpture.add(new THREE.Mesh(g,red));});
  const pulseGeometry=new THREE.SphereGeometry(.055,12,8);geometries.add(pulseGeometry);
  const sparks=Array.from({length:3},()=>{const node=new THREE.Mesh(pulseGeometry,luminous);node.visible=false;sculpture.add(node);return node;});
  // An offset outline gives the assembly a spatial frame without a heavy environment map.
  const outlineGeometry=new THREE.BufferGeometry().setFromPoints([[-2.45,-.42,-1.7],[2.45,-.42,-1.7],[2.45,-.42,1.7],[-2.45,-.42,1.7],[-2.45,-.42,-1.7]].map(p=>new THREE.Vector3(...p)));
  geometries.add(outlineGeometry);const outlineMaterial=new THREE.LineBasicMaterial({color:0x888888,transparent:true,opacity:.35});materials.add(outlineMaterial);sculpture.add(new THREE.Line(outlineGeometry,outlineMaterial));
  let disposed=false,frame=0,last=0,visible=true,dragging=false,moved=false,travel=0,originX=0,originY=0,selected=0;
  let compiled=false,sizedWidth=0,sizedHeight=0,sizedRatio=0;
  let angle=-.5,targetAngle=-.5,tilt=0,targetTilt=0,spread=0,targetSpread=0,pulseTime=0,intro=0,started=false;
  const root=document.documentElement;
  const reduceMedia=matchMedia('(prefers-reduced-motion: reduce)');
  const reduced=()=>root.dataset.motion==='minimal'||reduceMedia.matches;
  const covered=()=>host.closest<HTMLElement>('[data-home-scene]')?.dataset.sceneState==='pending'||!!document.querySelector('.route-transition-viewport[data-active="true"]')||root.dataset.visitIntro==='active'||root.dataset.visitIntro==='leaving'||root.dataset.homeSceneBoot==='pending'||root.dataset.homeSceneBoot==='covered';
  const blend=(a:number,b:number,dt:number)=>THREE.MathUtils.damp(a,b,8,dt);
  function theme(){const dark=root.classList.contains('dark');shell.color.setHex(dark?0x32343b:0x29282d);silver.color.setHex(dark?0xdedbd4:0x9b9996);ceramic.color.setHex(dark?0xeee9dd:0xf4f0e7);outlineMaterial.color.setHex(dark?0xaaa8a1:0x77736d);wake();}
  function resize(){
    if(disposed)return;
    const rect=host.getBoundingClientRect(),width=Math.max(1,rect.width),height=Math.max(1,rect.height),ratio=Math.min(devicePixelRatio||1,width<600?1.4:1.75);
    if(width===sizedWidth&&height===sizedHeight&&ratio===sizedRatio)return;
    const aspect=width/height,view=Math.max(4.7,5.8/aspect);
    if(ratio!==sizedRatio)renderer.setPixelRatio(ratio);
    renderer.setSize(width,height,false);sizedWidth=width;sizedHeight=height;sizedRatio=ratio;
    camera.left=-view*aspect/2;camera.right=view*aspect/2;camera.top=view/2;camera.bottom=-view/2;camera.near=.1;camera.far=50;camera.updateProjectionMatrix();
    // ResizeObserver runs after RAF, before paint. Resizing clears WebGL's
    // drawing buffer, so repaint now instead of showing one blank frame.
    if(compiled)renderer.render(scene,camera);
    wake();
  }
  function render(now:number){frame=0;if(disposed||document.hidden||!visible)return;const dt=Math.min((now-last)/1000||.016,.05);last=now;
    const still=reduced(),gate=covered();if(!gate&&!started){started=true;intro=still?1:0;}
    if(started)intro=still?1:Math.min(1,intro+dt/1.15);
    angle=still?targetAngle:blend(angle,targetAngle,dt);tilt=still?0:blend(tilt,targetTilt,dt);spread=still?targetSpread:blend(spread,targetSpread,dt);
    const entry=1-Math.pow(1-intro,3);sculpture.rotation.set(.02+tilt+(started?(1-entry)*.18:0),angle,0);sculpture.position.y=started?(1-entry)*-.45:0;
    layers.forEach(({node,y,lift},i)=>{node.position.y=y+spread*lift+(started?(1-entry)*(i*.07):0);});
    pulseTime=Math.max(0,pulseTime-dt);sparks.forEach((spark,i)=>{const u=1-pulseTime/2.4-i*.11;spark.visible=pulseTime>0&&u>=0&&u<=1;if(spark.visible){const path=u<.5?paths[0]:paths[1];spark.position.copy(path.getPointAt((u% .5)*2));spark.position.y+=.035+spread*.25;}});
    luminous.emissiveIntensity=pulseTime>0?1.4:.6;renderer.render(scene,camera);
    host.dataset.sceneFrames=String(Number(host.dataset.sceneFrames||0)+1);host.dataset.sceneDrawCalls=String(renderer.info.render.calls);host.dataset.sceneTriangles=String(renderer.info.render.triangles);
    const moving=!still&&(Math.abs(angle-targetAngle)>.0005||Math.abs(tilt-targetTilt)>.0005||Math.abs(spread-targetSpread)>.0005||pulseTime>0||(started&&intro<1));
    host.dataset.sceneLoop=moving?'active':'idle';if(moving)frame=requestAnimationFrame(render);
  }
  function wake(){if(!disposed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
  function down(event:PointerEvent){if(event.button!==0)return;dragging=true;moved=false;travel=0;originX=event.clientX;originY=event.clientY;surface.setPointerCapture(event.pointerId);}
  function move(event:PointerEvent){const rect=surface.getBoundingClientRect();if(dragging){const dx=event.clientX-originX,dy=event.clientY-originY;travel+=Math.abs(dx)+Math.abs(dy);if(travel>3)moved=true;targetAngle+=dx*.006;targetTilt=THREE.MathUtils.clamp(targetTilt+dy*.003,-.28,.28);originX=event.clientX;originY=event.clientY;}else if(event.pointerType==='mouse'){targetTilt=(event.clientY-rect.top-rect.height/2)/rect.height*.12;}wake();}
  function up(){dragging=false;}
  function leave(){if(!dragging){targetTilt=0;wake();}}
  function pulse(){if(disposed)return;pulseTime=reduced()?0:2.4;targetAngle+=.18;wake();}
  function click(event:MouseEvent){if(event.detail===0||!moved)pulse();}
  function keyboard(event:KeyboardEvent){if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();targetAngle+=event.key==='ArrowLeft'?-.28:.28;wake();}if(event.key==='Home'){event.preventDefault();targetAngle=-.5;targetTilt=0;wake();}}
  function visibility(){if(document.hidden||!visible){cancelAnimationFrame(frame);frame=0;host.dataset.sceneLoop='paused';}else{last=0;wake();}}
  function preference(){if(reduced())pulseTime=0;wake();}
  function lost(event:Event){event.preventDefault();dispose();onFailure();}
  function events(node:HTMLElement,add:boolean){const method=add?'addEventListener':'removeEventListener';node[method]('pointerdown',down as EventListener);node[method]('pointermove',move as EventListener);node[method]('pointerup',up);node[method]('pointercancel',up);node[method]('pointerleave',leave);node[method]('click',click as EventListener);node[method]('keydown',keyboard as EventListener);}
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();observer.disconnect();reduceMedia.removeEventListener('change',preference);signal.removeEventListener('abort',dispose);document.removeEventListener('visibilitychange',visibility);surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerup',up);surface.removeEventListener('pointercancel',up);surface.removeEventListener('pointerleave',leave);surface.removeEventListener('click',click);surface.removeEventListener('keydown',keyboard);canvas.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();host.dataset.sceneLoop='disposed';}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);visibility();});intersection.observe(host);
  const observer=new MutationObserver(()=>{theme();if(reduced())pulseTime=0;wake();});
  function observePresentation(){observer.disconnect();observer.observe(root,{attributes:true,attributeFilter:['class','data-motion','data-visit-intro','data-home-scene-boot']});const curtain=document.querySelector('.route-transition-viewport');if(curtain)observer.observe(curtain,{attributes:true,attributeFilter:['data-active']});const owner=host.closest<HTMLElement>('[data-home-scene]');if(owner)observer.observe(owner,{attributes:true,attributeFilter:['data-scene-state']});}
  observePresentation();
  events(surface,true);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',lost);
  reduceMedia.addEventListener('change',preference);
  signal.addEventListener('abort',dispose,{once:true});if(signal.aborted)dispose();
  try{if(!disposed){resize();theme();await renderer.compileAsync(scene,camera);}if(!disposed){compiled=true;renderer.render(scene,camera);host.dataset.sceneDrawCalls=String(renderer.info.render.calls);host.dataset.sceneTriangles=String(renderer.info.render.triangles);wake();}}
  catch(error){dispose();throw error;}
  return{select(index){selected=index;targetAngle=[-.5,-.1,.4][selected]??-.24;pulse();},explode(value){targetSpread=value?1:0;wake();},pulse,dispose,state:()=>({selected,expanded:targetSpread>.5}),attach(nextHost,nextSurface,nextFailure){
    if(disposed)return;events(surface,false);resizeObserver.unobserve(host);intersection.unobserve(host);
    const frames=host.dataset.sceneFrames;host=nextHost;surface=nextSurface;onFailure=nextFailure;host.prepend(canvas);host.dataset.sceneInstance=instanceId;host.dataset.sceneFrames=frames??'0';
    resizeObserver.observe(host);intersection.observe(host);visible=true;events(surface,true);resize();renderer.render(scene,camera);
    observePresentation();
  }};
}
