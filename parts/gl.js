/* ===== three.js: Stage, materials, engine model, flows, layouts ===== */
const T=window.THREE;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const V3=(x,y,z)=>new T.Vector3(x,y,z);
function makeLabel(text,color,size,bg){const c=document.createElement('canvas'),x=c.getContext('2d'),f=44;x.font=`700 ${f}px system-ui,sans-serif`;const w=Math.ceil(x.measureText(text).width)+28;c.width=w;c.height=f+22;
 x.font=`700 ${f}px system-ui,sans-serif`;x.textBaseline='middle';x.fillStyle=bg||'rgba(20,14,8,.82)';x.beginPath();x.roundRect?x.roundRect(0,0,w,f+22,18):x.rect(0,0,w,f+22);x.fill();
 x.fillStyle=color||'#ffe3b0';x.fillText(text,14,(f+22)/2+2);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.SpriteMaterial({map:tex,transparent:true,depthTest:false});const s=new T.Sprite(m);s.scale.set(size*w/(f+22),size,1);s.renderOrder=20;s.userData.label=true;return s}
let GLOW_TEX=null;
function glowTex(){if(GLOW_TEX)return GLOW_TEX;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,240,200,.8)');g.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=g;x.fillRect(0,0,64,64);GLOW_TEX=new T.CanvasTexture(c);return GLOW_TEX}
function glowSprite(color,size){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));s.scale.set(size,size,1);s.userData.keepTex=true;return s}

class Stage{
 constructor(cv,o={}){this.c=cv;this.t=0;this.up=[];this.tw=[];this.pick=[];this.onPick=o.onPick;this.onHover=o.onHover;this.o=o;
  try{this.r=new T.WebGLRenderer({canvas:cv,antialias:true});if(!this.r.getContext())throw 0}catch(e){this.fail=true;cv.insertAdjacentHTML('afterend','<div class="card" style="position:absolute;inset:20px">WebGL is not available in this browser, so the 3D view cannot be shown. The controls and text still work.</div>');return}
  const r=this.r;r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.localClippingEnabled=true;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
  this.scene=new T.Scene();this.scene.background=new T.Color(o.bg??0x0f0c0a);
  try{const pm=new T.PMREMGenerator(r);this.envRT=pm.fromScene(new T.RoomEnvironment(),.04);this.scene.environment=this.envRT.texture;this.scene.environmentIntensity=.55;pm.dispose()}catch(e){}
  this.cam=new T.PerspectiveCamera(o.fov||40,1,.5,2000);{const b=cv.getBoundingClientRect(),asp=b.width/Math.max(1,b.height);this.k=1.3*(asp<1.25?Math.pow(1.25/asp,.75):1)}
  this.tg0=o.target||[0,0,0];const p=(o.pos||[30,25,55]).map((v,i)=>this.tg0[i]+(v-this.tg0[i])*this.k);this.cam.position.set(...p);
  this.ctl=new OrbitControls(this.cam,cv);this.ctl.enableDamping=true;this.ctl.dampingFactor=.08;this.ctl.screenSpacePanning=true;this.ctl.minDistance=o.minD||8;this.ctl.maxDistance=o.maxD||260;
  this.ctl.autoRotate=!REDUCED&&!!o.auto;this.ctl.autoRotateSpeed=o.auto||.6;if(o.target)this.ctl.target.set(...o.target);
  this.scene.add(new T.HemisphereLight(0xfff0d8,0x2a1c10,.9));
  this.dir=new T.DirectionalLight(0xffe6c4,1.8);this.dir.position.set(30,60,40);this.scene.add(this.dir);
  const rim=new T.DirectionalLight(0x6fa8ff,.7);rim.position.set(-40,20,-40);this.scene.add(rim);
  this.lamp=new T.PointLight(0xffa040,180,140,1.6);this.lamp.position.set(-20,45,25);this.scene.add(this.lamp);
  if(o.floor!==false){const fy=o.floorY??-14;const fl=new T.Mesh(new T.CircleGeometry(90,64),new T.MeshStandardMaterial({color:0x1b1511,roughness:.95,metalness:0}));fl.rotation.x=-Math.PI/2;fl.position.y=fy;this.scene.add(fl);
   const gr=new T.GridHelper(160,40,0x5a4128,0x2a2018);gr.position.y=fy+.02;gr.material.transparent=true;gr.material.opacity=.5;this.scene.add(gr)}
  this.ray=new T.Raycaster();this.mv=new T.Vector2();
  cv.addEventListener('pointerdown',e=>{this.down={x:e.clientX,y:e.clientY};this.ctl.autoRotate=false});
  cv.addEventListener('pointerup',e=>{if(this.down&&Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)<6)this.doPick(e,true);this.down=null});
  cv.addEventListener('pointermove',e=>{if(!this.down&&(this.onHover||this.onPick)&&(this.hv=(this.hv||0)+1)%3===0)this.doPick(e,false)});
  this.resize();this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(cv);LIVE.push(this)}
 resize(){const b=this.c.getBoundingClientRect(),w=Math.max(10,b.width),hh=Math.max(10,b.height);this.r.setSize(w,hh,false);this.cam.aspect=w/hh;this.cam.updateProjectionMatrix();this.w=w;this.h=hh}
 add(o,pickable){this.scene.add(o);if(pickable)this.pick.push(o);return o}
 hit(e){const b=this.c.getBoundingClientRect();this.mv.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height)*2+1);this.ray.setFromCamera(this.mv,this.cam);
  const vis=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true};
  for(const x of this.ray.intersectObjects(this.pick,true)){if(!vis(x.object)||x.object.userData.label||x.object.userData.noPick)continue;const mm=x.object.material;if(mm&&mm.transparent&&mm.opacity<.2)continue;let o=x.object;while(o&&!o.userData.part)o=o.parent;if(o)return{part:o.userData.part,obj:o,point:x.point}}return null}
 doPick(e,click){const hh=this.hit(e);if(click){this.onPick&&this.onPick(hh)}else{this.c.style.cursor=hh?'pointer':'grab';this.onHover&&this.onHover(hh)}}
 tween(dur,fn,done){this.tw.push({t:0,d:dur,fn,done})}
 focus(target,dist,dur=.9){const c=this.ctl,s=c.target.clone(),e=V3(...target),dir=this.cam.position.clone().sub(c.target).normalize(),d0=this.cam.position.distanceTo(c.target);
  this.tween(dur,k=>{k=ease(k);c.target.lerpVectors(s,e,k);this.cam.position.copy(c.target).addScaledVector(dir,lerp(d0,dist,k))})}
 view(pos,target,dur=1){pos=pos.map((v,i)=>target[i]+(v-target[i])*this.k);const c=this.ctl,s=c.target.clone(),sp=this.cam.position.clone(),e=V3(...target),ep=V3(...pos);
  this.tween(dur,k=>{k=ease(k);c.target.lerpVectors(s,e,k);this.cam.position.lerpVectors(sp,ep,k)})}
 tick(dt){if(!this.c.isConnected)return;this.t+=dt;for(const u of this.up)u(dt,this.t);for(let i=this.tw.length-1;i>=0;i--){const w=this.tw[i];w.t+=dt;const k=Math.min(1,w.t/w.d);w.fn(k);if(k>=1){this.tw.splice(i,1);w.done&&w.done()}}
  this.ctl.update();this.r.render(this.scene,this.cam)}
 destroy(){if(!this.r)return;this.ro.disconnect();this.ctl.dispose();this.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms){if(m.map&&!o.userData.keepTex)m.map.dispose();m.dispose()}});
  this.envRT&&this.envRT.dispose();this.r.dispose();this.r.forceContextLoss();this.r=null;const i=LIVE.indexOf(this);if(i>=0)LIVE.splice(i,1)}
}
/* Stage in root's .viz; replaces the canvas with a fresh one so a lost context is never reused */
function mkStage(root,o){const old=root.querySelector('canvas.gl');const cv=old.cloneNode();old.replaceWith(cv);const s=new Stage(cv,o);return s.fail?null:s}

/* ---- materials ---- */
const MAT={
 steel:()=>new T.MeshStandardMaterial({color:0xc9ced6,metalness:.95,roughness:.28}),
 alu:()=>new T.MeshStandardMaterial({color:0xb8bcc2,metalness:.85,roughness:.42}),
 dark:()=>new T.MeshStandardMaterial({color:0x34363b,metalness:.7,roughness:.45}),
 black:()=>new T.MeshStandardMaterial({color:0x1d1d20,metalness:.5,roughness:.55}),
 brass:()=>new T.MeshStandardMaterial({color:0xd8a24a,metalness:.95,roughness:.3}),
 copper:()=>new T.MeshStandardMaterial({color:0xc9744a,metalness:.95,roughness:.3}),
 ceramic:()=>new T.MeshStandardMaterial({color:0xf2efe8,metalness:0,roughness:.35}),
 red:()=>new T.MeshStandardMaterial({color:0xb5382a,metalness:.4,roughness:.4}),
 intake:()=>new T.MeshStandardMaterial({color:0x4a8fe0,metalness:.6,roughness:.35}),
 exhaust:()=>new T.MeshStandardMaterial({color:0xd0703a,metalness:.6,roughness:.35}),
};
function shellMat(color,z){const m=new T.MeshStandardMaterial({color,metalness:.75,roughness:.5,side:T.DoubleSide});m.userData.plane=new T.Plane(V3(0,0,-1),z||0);return m}
function setShellMode(mats,mode){for(const m of mats){m.transparent=mode==='xray';m.opacity=mode==='xray'?.13:1;m.depthWrite=mode!=='xray';m.clippingPlanes=mode==='cut'?[m.userData.plane]:[];m.needsUpdate=true}}

/* ---- geometry helpers ---- */
function gearShape(n,r,th){const s=new T.Shape();for(let i=0;i<=n*4;i++){const a=i/(n*4)*Math.PI*2,k=i%4,rr=(k===1||k===2)?r+th:r;const x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?s.lineTo(x,y):s.moveTo(x,y)}
 const hole=new T.Path();hole.absarc(0,0,r*.3,0,Math.PI*2,true);s.holes.push(hole);return s}
function gearMesh(n,r,th,depth,mat){const g=new T.ExtrudeGeometry(gearShape(n,r,th),{depth,bevelEnabled:false,curveSegments:4});g.translate(0,0,-depth/2);return new T.Mesh(g,mat)}
function helix(r,h,turns,tube,mat){const pts=[];for(let i=0;i<=turns*24;i++){const a=i/24*Math.PI*2;pts.push(V3(Math.cos(a)*r,i/(turns*24)*h,Math.sin(a)*r))}return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),turns*24,tube,6),mat)}
function lathe(pts,mat,seg=40){return new T.Mesh(new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg),mat)}
function hull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
 for(const p of pts){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(const p of pts.slice().reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}return lo.slice(0,-1).concat(up.slice(0,-1))}

/* ---- valve timing (typical road-engine values, illustrative) ---- */
const VT={io:700,id:240,eo:500,ed:240,max:.95,spark:345};
function liftAt(a,open,dur){const d=((a-open)%720+720)%720;return d<dur?.5-.5*Math.cos(2*Math.PI*d/dur):0}
const liftI=a=>liftAt(a,VT.io,VT.id),liftE=a=>liftAt(a,VT.eo,VT.ed);
function strokeOf(a){a=((a%720)+720)%720;return a<180?0:a<360?1:a<540?2:3}
const STROKES=[{n:'Intake',c:'#4fa3ff',w:'Suck'},{n:'Compression',c:'#9b7bff',w:'Squeeze'},{n:'Power',c:'#ff7a2f',w:'Bang'},{n:'Exhaust',c:'#9aa0a8',w:'Blow'}];

/* ---- particle flow along a curve ---- */
const SPH=new T.SphereGeometry(1,8,6);
class Flow{
 constructor(points,o={}){this.curve=new T.CatmullRomCurve3(points.map(p=>p.isVector3?p:V3(...p)),!!o.closed,'centripetal');this.g=new T.Group();this.len=this.curve.getLength();
  this.n=o.n||Math.max(8,Math.round(this.len*(o.dens||1.2)));this.speed=o.speed??6;this.on=true;this.base=new T.Color(o.color??0xffffff);this.hot=o.hot?new T.Color(o.hot):null;
  if(o.tube){this.pipe=new T.Mesh(new T.TubeGeometry(this.curve,Math.max(16,Math.round(this.len*2)),o.tube,10,!!o.closed),o.tubeMat||new T.MeshStandardMaterial({color:o.tubeColor??0x8a8f98,transparent:true,opacity:o.tubeOp??.28,metalness:.3,roughness:.4,depthWrite:false,side:T.DoubleSide}));this.g.add(this.pipe)}
  const geo=SPH.clone();this.im=new T.InstancedMesh(geo,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:o.op??.95,depthWrite:false,blending:o.add?T.AdditiveBlending:T.NormalBlending}),this.n);
  this.im.frustumCulled=false;this.r=o.r||.32;this.u=[];this.jit=o.jit||0;this.jv=[];for(let i=0;i<this.n;i++){this.u.push(i/this.n);this.jv.push([Math.random()-.5,Math.random()-.5,Math.random()-.5])}
  this.m=new T.Matrix4();this.p=new T.Vector3();this.col=new T.Color();this.g.add(this.im);this.place()}
 place(){for(let i=0;i<this.n;i++){this.curve.getPointAt(this.u[i],this.p);const j=this.jv[i];this.p.x+=j[0]*this.jit;this.p.y+=j[1]*this.jit;this.p.z+=j[2]*this.jit;
  const s=this.on?this.r:0;this.m.makeScale(s,s,s).setPosition(this.p);this.im.setMatrixAt(i,this.m);
  if(this.hot){this.col.copy(this.base).lerp(this.hot,this.heat?this.heat(this.u[i]):0);this.im.setColorAt(i,this.col)}else if(!this.colored){this.im.setColorAt(i,this.base)}}
  this.colored=true;this.im.instanceMatrix.needsUpdate=true;if(this.im.instanceColor)this.im.instanceColor.needsUpdate=true}
 tick(dt){if(this.on&&this.speed)for(let i=0;i<this.n;i++){this.u[i]=(this.u[i]+dt*this.speed/this.len)%1;if(this.u[i]<0)this.u[i]+=1}this.place()}
 show(v){this.on=v;this.g.visible=v||!!this.pipe;this.im.visible=v}
}

/* ---- one cylinder: barrel, head, piston, rod, crank throw, valves, cams, plug, gas, ports ---- */
const G={R:4.2,r:4.1,l:13.5,crown:2.2,deck:20.8,base:8.5,camY:27.6,camX:2.4,vX:2,vR:1.45,cr0:1};
class CylUnit{
 constructor(o={}){this.o=o=Object.assign({fins:true,finW:13,depth:10,chain:true,flywheel:true,crankcase:true,ports:true,labels:false,clipZ:0,mode:'solid'},o);
  const g=this.g=new T.Group();this.parts={};this.shells=[];this.ex=0;this.alpha=0;this.flows=[];
  const part=(name,dir)=>{const p=new T.Group();p.userData.part=name;p.userData.dir=V3(...dir);g.add(p);this.parts[name]=p;return p};
  const sh=c=>{const m=shellMat(c,o.clipZ);this.shells.push(m);return m};
  /* crankcase */
  if(o.crankcase){const cc=part('crankcase',[0,-1,0]);const shape=new T.Shape();shape.moveTo(-8,-6);shape.quadraticCurveTo(-8,-9,-5,-9);shape.lineTo(5,-9);shape.quadraticCurveTo(8,-9,8,-6);shape.lineTo(8,5);shape.quadraticCurveTo(8,G.base,5.2,G.base);shape.lineTo(-5.2,G.base);shape.quadraticCurveTo(-8,G.base,-8,5);shape.closePath();
   const geo=new T.ExtrudeGeometry(shape,{depth:o.depth,bevelEnabled:true,bevelSize:.5,bevelThickness:.5,bevelSegments:2});geo.translate(0,0,-o.depth/2);cc.add(new T.Mesh(geo,sh(0x9a9ea6)))}
  /* barrel */
  const bar=part('barrel',[0,0,0]);this.barrelMat=sh(0xa7abb2);bar.add(lathe([[G.R+.05,G.base],[G.R+1,G.base],[G.R+1,G.deck],[G.R+.05,G.deck],[G.R+.05,G.base]],this.barrelMat,48));
  this.fins=new T.Group();bar.add(this.fins);const fw=o.finW/2,fs=new T.Shape();fs.moveTo(-fw,-fw*.8);fs.lineTo(fw,-fw*.8);fs.lineTo(fw,fw*.8);fs.lineTo(-fw,fw*.8);fs.closePath();const fh=new T.Path();fh.absarc(0,0,G.R+.9,0,Math.PI*2,true);fs.holes.push(fh);
  const fg=new T.ExtrudeGeometry(fs,{depth:.24,bevelEnabled:false,curveSegments:24});fg.rotateX(-Math.PI/2);const fm=sh(0xb4b8be);
  for(let y=G.base+.9;y<G.deck-.3;y+=1.15){const f=new T.Mesh(fg,fm);f.position.y=y;this.fins.add(f)}
  this.jacket=lathe([[G.R+1,G.base+.6],[G.R+2.3,G.base+.6],[G.R+2.3,G.deck-.2],[G.R+1,G.deck-.2]],sh(0x6f7782),48);bar.add(this.jacket);this.jacket.visible=false;
  this.fins.visible=o.fins;
  /* head + cam cover */
  const head=part('head',[0,1,0]);const hd=new T.Mesh(new T.BoxGeometry(o.finW-.6,5.4,o.depth),sh(0x9ea3aa));hd.position.y=G.deck+2.7;head.add(hd);
  if(o.fins){const hf=new T.BoxGeometry(o.finW+.6,.22,o.depth+1.2),hm=this.shells[this.shells.length-1];for(let i=0;i<3;i++){const f=new T.Mesh(hf,hm);f.position.y=G.deck+1.2+i*1.5;head.add(f)}}
  const cover=part('camcover',[0,1,0]);const cv=new T.Mesh(new T.BoxGeometry(o.finW-1.6,3.6,o.depth-1),sh(0x55595f));cv.position.y=G.camY+.3;cover.add(cv);
  /* ports */
  if(o.ports){const ip=new T.CatmullRomCurve3([V3(-G.vX,G.deck+.4,0),V3(-3.6,G.deck+2,0),V3(-7,G.deck+3,0),V3(-10.5,G.deck+3.3,0)]);
   const ep=new T.CatmullRomCurve3([V3(G.vX,G.deck+.4,0),V3(3.6,G.deck+1.8,0),V3(7,G.deck+2.2,0),V3(10.5,G.deck+1.4,0)]);
   this.ipc=ip;this.epc=ep;const pi=part('intakeport',[-1,0,0]),pe=part('exhaustport',[1,0,0]);
   pi.add(new T.Mesh(new T.TubeGeometry(ip,24,.95,12),new T.MeshStandardMaterial({color:0x3a6fb0,metalness:.6,roughness:.4,transparent:true,opacity:.55,depthWrite:false})));
   pe.add(new T.Mesh(new T.TubeGeometry(ep,24,.95,12),new T.MeshStandardMaterial({color:0xb0603a,metalness:.6,roughness:.4,transparent:true,opacity:.55,depthWrite:false})));
   this.fIn=new Flow(ip.getPoints(12).reverse(),{color:0x6fb6ff,r:.3,dens:1.6,jit:.9,speed:0});pi.add(this.fIn.g);
   this.fEx=new Flow(ep.getPoints(12),{color:0xa8a29a,hot:0xff8a3d,r:.32,dens:1.6,jit:.9,speed:0});this.fEx.heat=u=>1-u;pe.add(this.fEx.g)}
  /* piston */
  const pis=part('piston',[0,0,0]);this.pist=new T.Group();pis.add(this.pist);
  this.pist.add(lathe([[0,G.crown],[G.R-.08,G.crown],[G.R-.08,G.crown-.25],[G.R-.12,G.crown-.3],[G.R-.12,-3.2],[G.R-.4,-3.3],[0,-3.3]],MAT.alu(),40));
  const rm=MAT.dark();for(const y of[G.crown-.55,G.crown-1.05,G.crown-1.6]){const ring=new T.Mesh(new T.TorusGeometry(G.R-.06,.11,6,40),rm);ring.rotation.x=Math.PI/2;ring.position.y=y;this.pist.add(ring)}
  const gp=new T.Mesh(new T.CylinderGeometry(.75,.75,6.6,16),MAT.steel());gp.rotation.x=Math.PI/2;this.pist.add(gp);
  /* conrod */
  const rod=part('conrod',[0,0,0]);this.rod=new T.Group();rod.add(this.rod);const rmat=MAT.steel();
  const big=new T.Mesh(new T.TorusGeometry(1.45,.55,10,24),rmat);this.rod.add(big);const sm=new T.Mesh(new T.TorusGeometry(.95,.35,8,20),rmat);sm.position.y=G.l;this.rod.add(sm);
  const beam=new T.Mesh(new T.BoxGeometry(1.1,G.l-2.6,.9),rmat);beam.position.y=G.l/2;this.rod.add(beam);const cap=new T.Mesh(new T.BoxGeometry(4.2,.6,1.1),rmat);cap.position.y=-1.95;this.rod.add(cap);
  /* crank */
  const crk=part('crankshaft',[0,0,0]);this.crank=new T.Group();crk.add(this.crank);const cm=MAT.steel();
  const web=new T.Shape();web.moveTo(-1.8,G.r);web.absarc(0,G.r,1.8,Math.PI,0,true);web.lineTo(1.8,0);web.absarc(0,0,5.3,0,-Math.PI,true);web.lineTo(-1.8,G.r);
  const wg=new T.ExtrudeGeometry(web,{depth:.9,bevelEnabled:false,curveSegments:24});for(const z of[-1.75,.85]){const w=new T.Mesh(wg,cm);w.position.z=z;this.crank.add(w)}
  const cp=new T.Mesh(new T.CylinderGeometry(1,1,2.6,16),MAT.steel());cp.rotation.x=Math.PI/2;cp.position.y=G.r;this.crank.add(cp);
  const ms=new T.Mesh(new T.CylinderGeometry(1.15,1.15,o.mainLen||(o.chain?17:o.depth+3),16),MAT.steel());ms.rotation.x=Math.PI/2;if(o.chain||o.flywheel)ms.position.z=-2;this.crank.add(ms);
  if(o.flywheel){const fwp=part('flywheel',[0,-.4,-1.3]);this.fly=new T.Group();fwp.add(this.fly);const f=new T.Mesh(new T.CylinderGeometry(6.2,6.2,1.3,40),MAT.dark());f.rotation.x=Math.PI/2;f.position.z=-o.depth/2-3.4;this.fly.add(f);
   const mag=new T.Mesh(new T.TorusGeometry(5.4,.35,8,40),MAT.copper());mag.position.z=-o.depth/2-4.1;this.fly.add(mag)}
  /* valves, springs, buckets */
  const mkValve=(name,x,mat)=>{const p=part(name,[x>0?1:-1,1,0]);const v=new T.Group();p.add(v);const len=G.camY-G.cr0-.7-G.deck;
   v.add(lathe([[0,0],[G.vR,0],[G.vR,.18],[.35,.9],[.2,1.3],[.2,len],[0,len]],mat,28));const b=new T.Mesh(new T.CylinderGeometry(.8,.8,.7,20),MAT.dark());b.position.y=len+.35;v.add(b);
   v.position.set(x,G.deck,0);const sp=helix(.62,1,5,.09,MAT.steel());sp.position.set(x,G.deck+2.6,0);p.add(sp);return{v,sp,len}};
  this.vi=mkValve('intakevalve',-G.vX,MAT.intake());this.ve=mkValve('exhaustvalve',G.vX,MAT.exhaust());
  /* cams: lobe profile = base circle + valve-lift curve so the drawn lobe really drives the drawn valve */
  const mkCam=(name,x,liftFn,col)=>{const p=part(name,[x>0?1:-1,1.5,0]);const c=new T.Group();c.position.set(x,G.camY,0);p.add(c);const s=new T.Shape();
   for(let i=0;i<=144;i++){const b=i/144*360,rr=G.cr0+VT.max*liftFn(((2*(b+90))%720+720)%720);const x2=Math.cos(b*DEG)*rr,y2=Math.sin(b*DEG)*rr;i?s.lineTo(x2,y2):s.moveTo(x2,y2)}
   const lg=new T.ExtrudeGeometry(s,{depth:1.1,bevelEnabled:false});lg.translate(0,0,-.55);c.add(new T.Mesh(lg,new T.MeshStandardMaterial({color:col,metalness:.9,roughness:.3})));
   const sh2=new T.Mesh(new T.CylinderGeometry(.45,.45,o.chain?8.6:o.depth-1,12),MAT.steel());sh2.rotation.x=Math.PI/2;sh2.position.z=o.chain?-2.5:0;c.add(sh2);
   if(o.chain){const sp=gearMesh(24,2.05,.22,.45,MAT.brass());sp.position.z=-6.8;c.add(sp);const mk=new T.Mesh(new T.CylinderGeometry(.28,.28,.2,10),MAT.red());mk.rotation.x=Math.PI/2;mk.position.set(0,1.5,-7.1);c.add(mk)}return c};
  this.ci=mkCam('intakecam',-G.camX,liftI,0x7fb4ff);this.ce=mkCam('exhaustcam',G.camX,liftE,0xff9a62);
  /* timing chain: 12-tooth crank sprocket, 24-tooth cam sprockets = 2:1 */
  if(o.chain){const ch=part('chain',[0,.2,-.6]);const cs=gearMesh(12,1.02,.2,.45,MAT.brass());cs.position.z=-6.8;this.crank.add(cs);const mk=new T.Mesh(new T.CylinderGeometry(.22,.22,.2,10),MAT.red());mk.rotation.x=Math.PI/2;mk.position.set(0,.75,-7.1);this.crank.add(mk);
   const pts=[];for(const [cx,cy,rr] of[[0,0,1.45],[-G.camX,G.camY,2.48],[G.camX,G.camY,2.48]])for(let i=0;i<48;i++){const a=i/48*Math.PI*2;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}
   const hl=hull(pts);const curve=new T.CatmullRomCurve3(hl.map(p=>V3(p[0],p[1],-6.8)),true,'centripetal',.1);this.chainCurve=curve;this.chainLen=curve.getLength();
   const nl=Math.round(this.chainLen/.55);this.links=new T.InstancedMesh(new T.BoxGeometry(.5,.32,.55),MAT.dark(),nl);this.links.frustumCulled=false;ch.add(this.links);this.nl=nl}
  /* spark plug + lead */
  const pl=part('sparkplug',[0,1.6,0]);const plug=new T.Group();pl.add(plug);plug.position.y=G.deck;
  plug.add(lathe([[0,-.2],[.28,-.2],[.28,1.6],[.5,1.6],[.5,3.6]],MAT.steel(),16));const hex=new T.Mesh(new T.CylinderGeometry(.85,.85,1,6),MAT.steel());hex.position.y=4.1;plug.add(hex);
  plug.add(lathe([[0,4.6],[.55,4.6],[.42,8.4],[.25,9.6],[0,9.6]],MAT.ceramic(),20));const capm=new T.Mesh(new T.CylinderGeometry(.6,.6,1.6,14),MAT.black());capm.position.y=10.1;plug.add(capm);
  this.lead=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V3(0,10.6,0),V3(0,12,0),V3(-2,13.5,-1),V3(-6,13.2,-3)]),20,.22,8),MAT.black());plug.add(this.lead);
  this.spark=glowSprite(0x9fd4ff,0);this.spark.position.set(0,G.deck-.4,0);g.add(this.spark);
  this.flash=new T.PointLight(0xff8a30,0,40,1.4);this.flash.position.set(0,G.deck-2,0);g.add(this.flash);
  /* combustion gas */
  const gg=new T.CylinderGeometry(G.R-.03,G.R-.03,1,40);gg.translate(0,.5,0);this.gasMat=new T.MeshBasicMaterial({color:0x4fa3ff,transparent:true,opacity:.2,depthWrite:false});
  this.gas=new T.Mesh(gg,this.gasMat);this.gas.renderOrder=2;this.parts.piston.add(this.gas);this.gas.userData.noPick=true;
  for(const k in this.parts){const p=this.parts[k];p.userData.base=p.position.clone()}
  this.setMode(o.mode);this.update(0)}
 setMode(m){this.mode=m;setShellMode(this.shells,m);if(this.fIn){const op=m==='solid'?.0:.55;for(const p of[this.parts.intakeport,this.parts.exhaustport])p.children[0].material.opacity=m==='solid'?.9:op,p.children[0].material.transparent=m!=='solid',p.children[0].material.depthWrite=m==='solid'}}
 setCooling(k){this.fins.visible=k!=='liquid';this.jacket.visible=k==='liquid';this.parts.head.children.slice(1).forEach(f=>f.visible=k!=='liquid')}
 explode(k){this.ex=k;for(const n in this.parts){const p=this.parts[n];p.position.copy(p.userData.base).addScaledVector(p.userData.dir,k*9)}}
 update(alpha,dt=0){alpha=((alpha%720)+720)%720;this.alpha=alpha;const th=alpha%360*DEG,r=G.r,l=G.l;
  const px=r*Math.sin(th),py=r*Math.cos(th),yp=py+Math.sqrt(l*l-px*px);this.pinY=yp;
  this.crank.rotation.z=-th;if(this.fly)this.fly.rotation.z=-th;this.rod.position.set(px,py,0);this.rod.rotation.z=Math.atan2(px,yp-py);this.pist.position.y=yp;
  const li=liftI(alpha),le=liftE(alpha);this.li=li;this.le=le;
  this.vi.v.position.y=G.deck-li*VT.max;this.ve.v.position.y=G.deck-le*VT.max;
  for(const [vv,l2] of[[this.vi,li],[this.ve,le]]){const top=G.camY-G.cr0-.7-l2*VT.max,bot=G.deck+2.2;vv.sp.position.y=bot;vv.sp.scale.y=top-bot}
  this.ci.rotation.z=-alpha/2*DEG;this.ce.rotation.z=-alpha/2*DEG;
  if(this.links){const dA=this.prevA===undefined?0:((alpha-this.prevA+1080)%720)-360;this.prevA=alpha;this.chOff=((this.chOff||0)+dA/360*(2*Math.PI*1.12)/this.chainLen)%1;const off=this.chOff;const m=new T.Matrix4(),q=new T.Quaternion(),p=V3(0,0,0),tg=V3(0,0,0),X=V3(1,0,0),s=V3(1,1,1);
   for(let i=0;i<this.nl;i++){const u=((i/this.nl-off)%1+1)%1;this.chainCurve.getPointAt(u,p);this.chainCurve.getTangentAt(u,tg);q.setFromUnitVectors(X,tg);m.compose(p,q,s);this.links.setMatrixAt(i,m)}this.links.instanceMatrix.needsUpdate=true}
  /* gas: height from crown to deck, colour by stroke */
  const crown=yp+G.crown;this.gas.scale.y=Math.max(.05,G.deck-crown);this.gas.position.y=crown;
  const st=strokeOf(alpha),f=(alpha%180)/180,c=this.gasMat.color;let op=.2,fl=0;
  if(st===0){c.set(0x4fa3ff);op=.12+.25*f}else if(st===1){c.set(0x6f8dff).lerp(new T.Color(0x9b7bff),f);op=.38+.25*f}
  else if(st===2){c.set(0xfff2b0).lerp(new T.Color(0xff6a10),Math.min(1,f*2.2)).lerp(new T.Color(0x7a2a12),Math.max(0,f*1.4-.4));op=.9-.45*f;fl=Math.max(0,1-f*1.6)}
  else{c.set(0x8a8f98);op=.45-.32*f}
  this.gasMat.opacity=this.burnOff?.06:op;
  const sp=alpha>=VT.spark&&alpha<366;this.spark.scale.setScalar(sp&&!this.burnOff?3.2+Math.random()*1.5:0);this.flash.intensity=this.burnOff?0:(sp?260:fl*420);
  if(this.fIn){this.fIn.speed=li*this.flowK;this.fEx.speed=le*this.flowK*1.2;this.fIn.show(li>.02);this.fEx.show(le>.02);this.fIn.tick(dt);this.fEx.tick(dt)}
  for(const fw of this.flows)fw.tick(dt)}
 get flowK(){return this._fk??14}set flowK(v){this._fk=v}
 pickables(){return Object.values(this.parts)}
}

/* ---- labels that float beside parts (anatomy, lab) ---- */
const PART_INFO={
 piston:['Piston','An aluminium plug that slides up and down the bore. Combustion pressure pushes on its crown. Three rings seal the gap: two compression rings and one oil-control ring.'],
 conrod:['Connecting rod','Links the piston (small end, gudgeon pin) to the crankshaft (big end). It turns up-and-down motion into rotation, the slider-crank mechanism.'],
 crankshaft:['Crankshaft','The offset crankpin makes a circle. Push the pin down and the shaft turns. Counterweighted webs balance the swinging mass.'],
 flywheel:['Flywheel and magneto','A heavy rotor that stores momentum to carry the engine through the three non-power strokes. On bikes it often doubles as the alternator or magneto rotor.'],
 barrel:['Cylinder (barrel)','The bore the piston rides in. Air-cooled engines like the Classic 350 wear deep fins here. Liquid-cooled engines hide a water jacket inside instead.'],
 head:['Cylinder head','Caps the cylinder. It holds the combustion chamber, the valve seats, the ports and the spark plug, and it carries the camshafts above.'],
 camcover:['Cam cover','The lid over the camshafts and valve train, keeping oil in and dirt out.'],
 intakevalve:['Intake valve','A mushroom-shaped poppet valve that lets the air-fuel charge in. It is usually the larger of the two, because filling the cylinder is the hard part.'],
 exhaustvalve:['Exhaust valve','Lets burnt gas out. It runs very hot, so it is made of heat-resistant steel and cools by touching its seat.'],
 intakecam:['Intake camshaft','Each egg-shaped lobe pushes a bucket and opens its valve. The lobe shape sets when the valve opens, how far, and for how long.'],
 exhaustcam:['Exhaust camshaft','Opens the exhaust valve near the end of the power stroke. Two cams make a DOHC head, like the Himalayan 450. The Classic 350 uses one cam (SOHC) with rockers.'],
 sparkplug:['Spark plug','Around 20,000+ volts jump the tiny electrode gap and light the squeezed mixture, timed a few degrees before top dead centre.'],
 chain:['Timing chain and sprockets','Connects crank to cams. The cam sprockets have twice the teeth of the crank sprocket, so the cams turn at half crank speed. Line up the red marks to set the timing.'],
 crankcase:['Crankcase','Houses the crank and, on most bikes, the gearbox and clutch too (unit construction). The bottom often doubles as the oil sump.'],
 intakeport:['Intake port','The passage from the throttle body to the intake valve. Its shape helps the charge swirl and tumble for a fast burn.'],
 exhaustport:['Exhaust port','Carries hot gas from the exhaust valve to the header pipe.'],
};

/* ---- multi-cylinder layouts: bank angle φ, crankpin phase ψ, cycle offset c (c ≡ ψ-φ mod 360) ---- */
const LAYOUTS={
 single:{n:'Single',cyl:[{z:0,phi:0,psi:0,c:0}],bikes:'Royal Enfield Classic 350, Himalayan 450, Bullet; KTM 390 Duke',feel:'Thumpy, narrow, light and simple. Strong low-down pulls, more vibration.'},
 twin360:{n:'Parallel twin (360°)',cyl:[{z:-5.2,phi:0,psi:0,c:0},{z:5.2,phi:0,psi:0,c:360}],bikes:'Classic British twins (Triumph Bonneville T120 era); Kawasaki W800',feel:'Even 360° firing, so it sounds like a big single. Simple, but needs balancing.'},
 twin270:{n:'Parallel twin (270°)',cyl:[{z:-5.2,phi:0,psi:0,c:0},{z:5.2,phi:0,psi:270,c:270}],bikes:'Royal Enfield Interceptor 650, Continental GT 650, Super Meteor 650',feel:'Fires 270° then 450°, the same rhythm as a 90° V-twin. Lumpy, characterful, torquey.'},
 twin180:{n:'Parallel twin (180°)',cyl:[{z:-5.2,phi:0,psi:0,c:0},{z:5.2,phi:0,psi:180,c:180}],bikes:'Many Japanese twins, e.g. older Kawasaki Ninja 650',feel:'Pistons go opposite ways, firing 180° then 540°. Revvy, smooth primary balance, a rocking couple.'},
 v45:{n:'V-twin 45°',cyl:[{z:-1.2,phi:-22.5,psi:0,c:22.5},{z:1.2,phi:22.5,psi:0,c:337.5}],bikes:'Harley-Davidson big twins',feel:'Shared crankpin, uneven 315°/405° firing: the famous "potato-potato" lope.'},
 v90:{n:'V-twin 90° (L-twin)',cyl:[{z:-1.2,phi:-45,psi:0,c:45},{z:1.2,phi:45,psi:0,c:315}],bikes:'Ducati L-twins, Moto Guzzi (transverse), Suzuki SV650',feel:'Perfect primary balance. 270°/450° firing gives a strong, smooth thrum.'},
 boxer:{n:'Boxer twin (flat)',cyl:[{z:-2,phi:-90,psi:0,c:90},{z:2,phi:90,psi:180,c:450}],bikes:'BMW R-series (R 1300 GS, R nineT)',feel:'Opposed pistons cancel each other out: very smooth, low centre of gravity, cylinders stick out into the wind for cooling.'},
 i3:{n:'Inline triple',cyl:[{z:-10.4,phi:0,psi:0,c:0},{z:0,phi:0,psi:240,c:240},{z:10.4,phi:0,psi:120,c:480}],bikes:'Triumph Street/Speed Triple, Tiger; Yamaha MT-09',feel:'Fires every 240°. Twin-like torque with four-like revs and a distinctive howl.'},
 i4:{n:'Inline four',cyl:[{z:-15.6,phi:0,psi:0,c:0},{z:-5.2,phi:0,psi:180,c:180},{z:5.2,phi:0,psi:180,c:540},{z:15.6,phi:0,psi:0,c:360}],bikes:'Honda CB/CBR, Kawasaki Z/ZX, Suzuki GSX-R, Yamaha R1 (crossplane variant)',feel:'Fires every 180° (order 1-3-4-2 here). Smooth, high-revving, wide engine with a scream at the top.'},
};
function fireAngles(L){return L.cyl.map(c=>((360-c.c)%720+720)%720)}
class Multi{
 constructor(key,o={}){const L=this.L=LAYOUTS[key];this.key=key;this.g=new T.Group();this.units=[];const multi=L.cyl.length>1;
  for(const c of L.cyl){const u=new CylUnit(Object.assign({chain:false,flywheel:!multi,crankcase:!multi,finW:multi?10:13,depth:multi?9.8:10,clipZ:c.z,mainLen:multi?10.4:13},o));
   const holder=new T.Group();holder.position.z=c.z;holder.rotation.z=-c.phi*DEG;u.g.position.z=0;holder.add(u.g);this.g.add(holder);u.cfg=c;u.holder=holder;this.units.push(u);
   for(const m of u.shells)m.userData.plane.constant=c.z}
  if(multi){const zs=L.cyl.map(c=>c.z),z0=Math.min(...zs)-5.4,z1=Math.max(...zs)+5.4,wide=key==='boxer'||key.startsWith('v');
   this.cc=new T.Mesh(new T.BoxGeometry(wide?15:16,wide?15:17,z1-z0),shellMat(0x9a9ea6));this.cc.material.userData.plane.constant=0;this.cc.position.set(0,wide?0:-.5,(z0+z1)/2);this.g.add(this.cc);this.shells=[this.cc.material];
   const fw=new T.Mesh(new T.CylinderGeometry(6,6,1.3,40),MAT.dark());fw.rotation.x=Math.PI/2;fw.position.z=z0-1.4;this.g.add(fw);this.fw=fw}else this.shells=[];
  this.fires=fireAngles(L)}
 setMode(m){for(const u of this.units)u.setMode(m);setShellMode(this.shells,m==='cut'?'xray':m)}
 setCooling(k){for(const u of this.units)u.setCooling(k)}
 explode(k){for(const u of this.units)u.explode(k)}
 update(theta,dt){for(const u of this.units)u.update(theta+u.cfg.c,dt);if(this.fw)this.fw.rotation.z=-(theta%360)*DEG}
}
