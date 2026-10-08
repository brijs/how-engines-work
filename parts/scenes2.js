/* ===== scenes 7-10: circulation systems, layouts ===== */
function gauge(label,unit){const d=h('div');d.innerHTML=`<label class="sl">${label}: <b class="gv">-</b></label><div class="meter"><i></i></div>`;d.set=(v,f,c)=>{d.querySelector('.gv').textContent=v+(unit||'');const i=d.querySelector('i');i.style.width=clamp(f,0,1)*100+'%';i.style.background=c||'var(--amber)'};return d}
function radiator(w,hh,d,col){const g=new T.Group();const core=new T.Mesh(new T.BoxGeometry(w,hh,d),new T.MeshStandardMaterial({color:col||0x3b4148,metalness:.7,roughness:.5}));g.add(core);
 const lm=new T.LineBasicMaterial({color:0x8a9098});const pts=[];for(let y=-hh/2+.5;y<hh/2;y+=.5){pts.push(V3(-w/2-.01,y,-d/2),V3(-w/2-.01,y,d/2))}const ls=new T.LineSegments(new T.BufferGeometry().setFromPoints(pts),lm);g.add(ls);const ls2=ls.clone();ls2.position.x=w+.02;g.add(ls2);
 for(const s of[-1,1]){const tank=new T.Mesh(new T.BoxGeometry(w+.6,1.2,d+.6),MAT.dark());tank.position.y=s*(hh/2+.6);g.add(tank)}return g}

/* 7 cooling */
SCENES.push({id:'cooling',belt:1,mood:'alert',title:'Cooling: getting rid of heat',
 html:`<div class="wrap">${VIZ('Front of the bike is to the right · drag to rotate')}<div class="side">
 <div class="card"><b>Cooling type</b><div id="co-type" style="margin-top:6px"></div><p class="small" id="co-desc"></p></div>
 <div class="card"><div id="co-spd"></div><div id="co-load"></div></div>
 <div class="card" id="co-g"></div>
 <div class="card small">Temperatures are an illustrative simulation. Real limits depend on the engine. Typical liquid-cooled thermostats open around 80–90 °C.</div>
 </div></div>`,
 init(w){let mode='air',speed=60,load=.5,temp=70,a=0,warned=false;
  const D={air:'Air-cooled: deep fins give the cylinder lots of surface. Moving air carries the heat away. Simple and light, but it struggles in slow traffic.',oil:'Air-oil cooled (Classic 350, Interceptor 650): fins plus oil that carries heat from the hottest spots, the head and the piston underside. The 650 twins add an oil-cooler radiator.',liquid:'Liquid-cooled (Himalayan 450): a pump pushes coolant through a jacket around the cylinder, then to a radiator. A thermostat keeps it shut until the engine is warm. A fan helps when stopped.'};
  const st=mkStage(w,{pos:[42,26,48],target:[4,10,0],auto:0});let u=null,air=[],oilF=[],cool=[],coolHot=[],bypass,rad,fan,thermo,oilc,pump;
  if(st){u=new CylUnit({mode:'solid',chain:false});st.add(u.g);
   for(const [y,z] of[[10,-3],[12.5,3],[15,-2],[17.5,2.5],[20,-3],[23,1],[25.5,-1.5]]){const f=new Flow([[-28,y,z],[-8,y+.3,z*1.4],[8,y-.3,z*1.4],[28,y,z]],{color:0xbfe6ff,r:.22,dens:.7,jit:.8,op:.8,speed:20});st.add(f.g);air.push(f)}
   oilc=radiator(1.4,7,8,0x6b5b2a);oilc.position.set(18,4,0);st.add(oilc);
   for(const pts of[[[3,24,4],[10,25,5],[17.3,7,3.5]],[[17.3,1,3.5],[12,-3,5],[4,-5,4.5]]]){const f=new Flow(pts,{color:0xe0a526,hot:0xff5a1f,tube:.45,tubeColor:0x6b5b2a,r:.3,dens:1.4,speed:8});f.heat=pts[0][1]>20?(()=>1):(()=>0);st.add(f.g);oilF.push(f)}
   rad=radiator(1.6,16,13);rad.position.set(21,17,0);st.add(rad);
   fan=new T.Group();for(let i=0;i<5;i++){const b=new T.Mesh(new T.BoxGeometry(.2,5,1.6),MAT.black());b.rotation.x=i/5*Math.PI*2;b.position.set(0,0,0);const bh=new T.Group();bh.rotation.x=i/5*Math.PI*2;b.rotation.set(0,.5,0);b.position.y=2.6;bh.add(b);fan.add(bh)}fan.position.set(19.4,17,0);st.add(fan);
   pump=new T.Mesh(new T.CylinderGeometry(1.6,1.6,1.4,20),MAT.alu());pump.rotation.x=Math.PI/2;pump.position.set(6,-2,6.2);st.add(pump);
   thermo=new T.Mesh(new T.SphereGeometry(1,16,12),MAT.brass());thermo.position.set(3,25.6,4);st.add(thermo);
   const hp=(pts,heat)=>{const f=new Flow(pts,{color:0x35d0c0,hot:0xff4a2a,tube:.55,tubeColor:0x2b2f35,tubeOp:.5,r:.32,dens:1.3,speed:10});f.heat=heat;st.add(f.g);cool.push(f);return f};
   hp([[3,25.6,4],[10,28,5],[20.4,25,4]],()=>1);hp([[21,24,2],[21,17,2.5],[21,10,2]],u2=>1-u2);hp([[21,24,-2],[21,17,-2.5],[21,10,-2]],u2=>1-u2);
   hp([[20.4,9.5,4],[13,3,6],[6,-2,7]],()=>0);hp([[6,-2,6.2],[6.8,4,5],[6.6,9.5,3.5]],()=>0);
   const ring=[];for(let i=0;i<=24;i++){const t2=i/24*Math.PI*2;ring.push([Math.cos(t2)*5.9,9.5+i/24*10.5,Math.sin(t2)*5.9])}hp(ring,u2=>u2);hp([[0,20.2,5.9],[2,22.5,5.2],[3,25.6,4]],()=>1);
   bypass=new Flow([[3,25.6,4],[9,16,9],[6,-2,7]],{color:0x35d0c0,hot:0xff4a2a,tube:.35,tubeColor:0x2b2f35,tubeOp:.5,r:.25,dens:1.3,speed:6});bypass.heat=()=>.6;st.add(bypass.g);
   addLabels(st,[['Radiator',[21,28,0]],['Thermostat',[3,28.5,6]],['Water pump',[6,-5,9]],['Oil cooler',[18,10,0],'#e0c070']]);st.labels=st.scene.children.at(-1)}
  const g1=gauge('Engine temperature',' °C'),g2=gauge('Status');$('#co-g').append(g1,g2);
  $('#co-spd').appendChild(slider('Riding speed',0,120,60,5,v=>v===0?'stuck in traffic':v+' km/h',v=>speed=v));
  $('#co-load').appendChild(slider('Engine load',0,1,.5,.05,v=>Math.round(v*100)+'%',v=>load=v));
  const setMode=m=>{mode=m;$('#co-desc').textContent=D[m];if(!u)return;u.setCooling(m==='liquid'?'liquid':'air');u.setMode(m==='liquid'?'cut':'solid');
   for(const f of oilF){f.g.visible=m==='oil'}oilc.visible=m==='oil';st.labels.children.forEach((l,i)=>l.visible=i<3?m==='liquid':m==='oil');for(const f of cool)f.g.visible=m==='liquid';bypass.g.visible=m==='liquid';rad.visible=fan.visible=pump.visible=thermo.visible=m==='liquid';
   st.view(m==='liquid'?[44,30,40]:[42,26,48],[6,10,0]);warned=false};
  $('#co-type').appendChild(chips([{l:'Air',v:'air'},{l:'Air + oil',v:'oil'},{l:'Liquid',v:'liquid'}],'air',setMode));setMode('air');
  TICKS.push(dt=>{a+=(120+load*300)*dt;u&&u.update(a,dt);const Q=3*(.6+2.4*load);let k,open=false,fanOn=false;
   if(mode==='liquid'){open=temp>85;fanOn=temp>100&&speed<30;k=open?.08+.03*speed/100+(fanOn?.05:0):.008}else k=.012+.05*speed/100+(mode==='oil'?.018:0);
   temp+=(Q-k*(temp-30))*dt*1.6;temp=clamp(temp,25,160);
   for(const f of air){f.speed=speed*.35;f.show(mode!=='liquid'||speed>0);f.tick(dt)}
   if(u){for(const f of oilF)f.tick(dt);for(const f of cool){f.speed=open?10+speed*.05:0;f.tick(dt)}bypass.speed=open?0:6;bypass.show(!open);bypass.tick(dt);if(fanOn)fan.rotation.x+=dt*25;pump.rotation.y+=dt*8;
    thermo.material.emissive.setHex(open?0x553300:0x000000);const hot=clamp((temp-90)/60,0,1);for(const m of[u.barrelMat,...u.fins.children.slice(0,1).map(f=>f.material)])m.emissive.setRGB(hot*.6,hot*.12,0)}
   g1.set(temp.toFixed(0),(temp-25)/135,temp>130?'#e5533d':temp>105?'#ffb347':'#6fd08c');
   const s=temp>130?'⚠ Overheating! Oil thins, power fades, parts expand.':mode==='liquid'?(open?(fanOn?'Thermostat open + fan running':'Thermostat open: coolant to radiator'):'Warming up: thermostat closed (bypass loop)'):temp>105?'Getting hot: needs more airflow':'Happy temperature';
   g2.set(s,1,temp>130?'#e5533d':'#3b3127');
   if(temp>130&&!warned){warned=true;react(mode==='liquid'?'Even liquid cooling cooks under full load with no airflow!':'Stuck in traffic with no wind, those fins cannot shed heat. This is why air-cooled engines hate jams.','alert')}})}});

/* 8 lubrication */
SCENES.push({id:'oil',belt:1,mood:'neutral',title:'Lubrication: the oil circuit',
 html:`<div class="wrap">${VIZ('X-ray view · gold dots are oil · drag to rotate')}<div class="side">
 <div class="card"><b>Sump type</b><div id="oi-type" style="margin:6px 0"></div><p class="small" id="oi-desc"></p></div>
 <div class="card"><div class="row"><button class="btn" id="oi-drain">🛢 Drain the oil</button><button class="btn" id="oi-fill" disabled>Refill</button></div><div id="oi-g" style="margin-top:6px"></div></div>
 <div class="card small"><b>Oil's four jobs:</b> ① a pressurised film so metal never touches metal ② carries heat away (pistons, head) ③ cleans, trapping grit in the filter ④ seals the rings. Many bikes share engine oil with the gearbox and wet clutch, which is why motorcycle oil is special (JASO MA).</div>
 </div></div>`,
 init(w){let a=0,level=1,draining=false,temp=90,rpm=1,mode='wet';
  const st=mkStage(w,{pos:[40,18,44],target:[0,6,0],auto:0});let u,sump,oilLvl,tank,feed=[],dry=[],spray,pumpG,sparks;
  if(st){u=new CylUnit({mode:'xray',chain:true});st.add(u.g);
   sump=new T.Mesh(new T.BoxGeometry(14,4,9),new T.MeshStandardMaterial({color:0x9a9ea6,transparent:true,opacity:.18,depthWrite:false,side:T.DoubleSide}));sump.position.set(0,-11,0);st.add(sump);
   oilLvl=new T.Mesh(new T.BoxGeometry(13.4,1,8.4),new T.MeshStandardMaterial({color:0xd99a1a,metalness:.2,roughness:.15,transparent:true,opacity:.75,emissive:0x442a00}));oilLvl.geometry.translate(0,.5,0);oilLvl.position.set(0,-12.8,0);oilLvl.scale.y=3;st.add(oilLvl);
   pumpG=new T.Group();const g1=gearMesh(10,.9,.25,.8,MAT.brass()),g2=g1.clone();g2.position.x=1.9;pumpG.add(g1,g2);pumpG.position.set(4,-7.5,4.6);st.add(pumpG);
   const filt=new T.Mesh(new T.CylinderGeometry(1.5,1.5,3.2,20),new T.MeshStandardMaterial({color:0x2d5fa8,metalness:.5,roughness:.4}));filt.rotation.z=Math.PI/2;filt.position.set(10.5,-4,5.5);st.add(filt);
   const of=(pts,o={})=>{const f=new Flow(pts,Object.assign({color:0xffc233,tube:.32,tubeColor:0x8a6a20,tubeOp:.35,r:.3,dens:1.6,speed:9,add:true},o));st.add(f.g);return f};
   feed.push(of([[2,-12,1],[3,-9.5,3],[4,-7.5,4.6]]),of([[5.5,-7.5,4.6],[9,-5.5,5.5],[10.5,-4,5.5]]),of([[12,-4,5.5],[10,-1,5.5],[3,0,5.6],[0,0,5.6]]),
    of([[10,-1,5.5],[7.2,4,4.4],[7.2,18,4.4],[4,24,3.5],[2.4,26.6,1.4]]),of([[-2.4,27,-1],[-4,25,-3.5],[-7,20,-3.6],[-7,6,-3.6],[-5,-4,-3],[-2,-10.5,-2]],{tube:0,r:.28}),
    of([[5,4,0],[3,7,0],[1,10.5,0]],{tube:.2,jit:.4}),of([[2.4,26.6,1.4],[0,28.5,.5],[-2.4,27,-1]],{tube:0,jit:.8}));
   tank=new T.Mesh(new T.CylinderGeometry(3.2,3.2,9,24),new T.MeshStandardMaterial({color:0x6b6f75,metalness:.7,roughness:.4,transparent:true,opacity:.5}));tank.position.set(-19,2,0);st.add(tank);
   dry.push(of([[-2,-12,-1],[-10,-11,0],[-17,-6,0],[-19,-2,0]]),of([[-19,6,1],[-12,2,4],[0,-6,6],[4,-7.5,4.6]]));
   sparks=new T.Group();for(let i=0;i<6;i++){const s=glowSprite(0xffa040,0);sparks.add(s)}st.add(sparks);
   addLabels(st,[['Sump',[0,-15.5,6]],['Pump',[4,-9.5,8]],['Filter',[12,-7,7]],['Main gallery',[9,13,7]],['Cam spray',[0,31,3]],['Piston jet',[3,7,4]],['Oil tank (dry sump)',[-19,9,0]]]).children.at(-1).userData.dry=true;
   setTimeout(()=>{st.scene.traverse(o=>{if(o.userData.dry)o.visible=mode==='dry'})},0)}
  const D={wet:'Wet sump (Classic 350, Interceptor 650): oil lives in the bottom of the crankcase. Simple and cheap.',dry:'Dry sump (race bikes, some Harleys, and semi-dry on the Himalayan 450): a scavenge pump moves oil to a separate tank. The engine can sit lower and oil does not slosh in hard corners.'};
  const gT=gauge('Oil pressure'),gH=gauge('Bearing temperature',' °C');$('#oi-g').append(gT,gH);
  const setMode=m=>{mode=m;$('#oi-desc').textContent=D[m];if(!st)return;tank.visible=m==='dry';for(const f of dry)f.g.visible=m==='dry';st.scene.traverse(o=>{if(o.userData.dry)o.visible=m==='dry'});sump.scale.y=m==='dry'?.5:1;st.view(m==='dry'?[30,22,56]:[40,18,44],m==='dry'?[-6,6,0]:[0,6,0])};
  $('#oi-type').appendChild(chips([{l:'Wet sump',v:'wet'},{l:'Dry sump',v:'dry'}],'wet',setMode));setMode('wet');
  $('#oi-drain').onclick=()=>{draining=true;$('#oi-drain').disabled=true;$('#oi-fill').disabled=false;react('Watch the pressure drop and the bearings heat up. Never ride like this!','alert')};
  $('#oi-fill').onclick=()=>{draining=false;level=1;temp=90;rpm=1;$('#oi-drain').disabled=false;$('#oi-fill').disabled=true;react('Fresh oil. Pressure is back and the bearings breathe again.','happy')};
  TICKS.push((dt,t)=>{if(draining)level=Math.max(0,level-dt*.35);const p=level>.25?1:level/.25;
   if(level<.05){temp=Math.min(260,temp+dt*28);if(temp>200)rpm=Math.max(0,rpm-dt*.25)}else temp=Math.max(90,temp-dt*20);
   a+=150*rpm*dt;if(!u)return;u.update(a,dt);oilLvl.scale.y=Math.max(.02,3*level);pumpG.children[0].rotation.z+=dt*6*rpm;pumpG.children[1].rotation.z-=dt*6*rpm;
   for(const f of feed){f.speed=9*p*rpm;f.show(p>.02);f.tick(dt)}for(const f of dry){f.speed=8*p*rpm;f.show(p>.02&&mode==='dry');f.tick(dt)}
   const hot=level<.05&&rpm>0;sparks.children.forEach((s,i)=>{s.scale.setScalar(hot&&Math.random()<.5?1.5+Math.random()*2:0);const th=-(a%360)*DEG;s.position.set(Math.sin(-th)*G.r+(Math.random()-.5)*2,Math.cos(-th)*G.r+(Math.random()-.5)*2,1.6)});
   gT.set(level>.25?'normal':level>.05?'LOW':'ZERO',p,p<.5?'#e5533d':'#6fd08c');gH.set(temp.toFixed(0),(temp-60)/200,temp>150?'#e5533d':'#6fd08c');
   if(rpm===0&&!this.seized){this.seized=true;react('Seized! Metal welded itself together. That is why we check the oil.','alert')}if(rpm>0)this.seized=false})}});

/* 9 breathing: fuel, air, exhaust */
SCENES.push({id:'breathing',belt:1,mood:'neutral',title:'Breathing: fuel, air and exhaust',
 html:`<div class="wrap">${VIZ('Blue = air · orange = fuel · grey = exhaust · drag to rotate')}<div class="side">
 <div class="card"><div id="br-thr"></div><div class="row" style="margin-top:6px" id="br-tg"></div></div>
 <div class="card"><div class="kv" id="br-kv"></div></div>
 <div class="card small"><b>The path:</b> air box (filter) → throttle body (butterfly valve, this is what your right hand turns) → intake port → cylinder. Fuel: tank → electric pump → pressure regulator → injector sprays into the port. Out: exhaust port → header → catalytic converter (burns CO, HC and NOx) → muffler → tailpipe.</div>
 </div></div>`,
 init(w){let thr=.25,a=0;const st=mkStage(w,{pos:[10,30,72],target:[-2,12,0],auto:0});let u,airF=[],fuelF=[],exF=[],butter,cat,spray,fuelLvl;
  if(st){u=new CylUnit({mode:'cut',chain:false});st.add(u.g);
   const box=new T.Mesh(new T.BoxGeometry(9,7,8),new T.MeshStandardMaterial({color:0x2c2f34,metalness:.4,roughness:.6,transparent:true,opacity:.6}));box.position.set(-27,25,0);st.add(box);
   const tb=new T.Mesh(new T.CylinderGeometry(1.5,1.5,4,24,1,true),new T.MeshStandardMaterial({color:0xb8bcc2,metalness:.85,roughness:.35,side:T.DoubleSide,transparent:true,opacity:.6}));tb.rotation.z=Math.PI/2;tb.position.set(-15,24.2,0);st.add(tb);
   butter=new T.Group();const disc=new T.Mesh(new T.CircleGeometry(1.4,24),new T.MeshStandardMaterial({color:0xffb347,metalness:.6,roughness:.3,side:T.DoubleSide}));disc.rotation.y=Math.PI/2;butter.add(disc);butter.position.copy(tb.position);st.add(butter);
   const fl=(pts,o)=>{const f=new Flow(pts,Object.assign({r:.32,dens:1.3,speed:8,jit:.5},o));st.add(f.g);return f};
   airF.push(fl([[-36,25,0],[-31.5,25,0]],{color:0xbfe6ff,jit:2}),fl([[-22.5,25,0],[-19,24.4,0],[-10.5,24.1,0]],{color:0x8fd3ff,tube:1.5,tubeColor:0x555a60,tubeOp:.25}));
   const tank=new T.Mesh(new T.BoxGeometry(16,7,10),new T.MeshStandardMaterial({color:0x7a1f1f,metalness:.5,roughness:.35,transparent:true,opacity:.35,depthWrite:false}));tank.position.set(-6,45,0);st.add(tank);
   fuelLvl=new T.Mesh(new T.BoxGeometry(15.4,3.8,9.4),new T.MeshStandardMaterial({color:0xff8a3d,transparent:true,opacity:.55,emissive:0x331100}));fuelLvl.position.set(-6,43.3,0);st.add(fuelLvl);
   const fp=new T.Mesh(new T.CylinderGeometry(.9,.9,3,16),MAT.dark());fp.position.set(-9,43,0);st.add(fp);
   fuelF.push(fl([[-9,41.5,0],[-10,36,2],[-8.5,30,2],[-8,26.4,.6]],{color:0xff8a3d,tube:.25,tubeColor:0x333333,tubeOp:.6,r:.22,speed:6}));
   const inj=new T.Mesh(new T.CylinderGeometry(.5,.35,2.6,12),MAT.black());inj.position.set(-8,26.6,.3);inj.rotation.z=-.5;st.add(inj);
   spray=fl([[-7.6,25.6,.2],[-5.5,23.8,0],[-3.4,22.4,0]],{color:0xffa04d,r:.2,jit:.9,dens:3,speed:6});
   exF.push(fl([[10.5,22.2,0],[13.5,19,0],[15,10,1],[14,0,3],[9,-8,5],[2,-10,7]],{color:0x9aa0a8,hot:0xff7a2a,tube:1,tubeColor:0x9a6a4a,tubeOp:.35,speed:10}),
    fl([[-6,-10,7],[-14,-10,7]],{color:0x9aa0a8,speed:10}),fl([[-26,-9.5,7],[-32,-9,7],[-38,-8.5,7]],{color:0xb8bcc4,jit:1.8,speed:12}));exF[0].heat=u2=>1-u2;
   cat=new T.Mesh(new T.CylinderGeometry(2.4,2.4,8,24),new T.MeshStandardMaterial({color:0x8a6a4a,metalness:.7,roughness:.4,emissive:0x331000}));cat.rotation.z=Math.PI/2;cat.position.set(-2,-10,7);st.add(cat);
   const muf=new T.Mesh(new T.CylinderGeometry(3,3.4,12,28),new T.MeshStandardMaterial({color:0xc9ced6,metalness:.95,roughness:.22}));muf.rotation.z=Math.PI/2;muf.position.set(-20,-9.6,7);st.add(muf);
   addLabels(st,[['Air box',[-27,30.5,0]],['Throttle body',[-15,28,0]],['Fuel tank',[-6,50,0]],['Injector',[-8,30.5,-3]],['Header',[16,14,4]],['Catalytic converter',[-2,-5,9]],['Muffler',[-20,-4,9]]])}
  $('#br-thr').appendChild(slider('Throttle (your right hand)',0,1,.25,.01,v=>v<.03?'closed (idle)':Math.round(v*100)+'% open',v=>thr=v));
  const tgs={air:true,fuel:true,ex:true};const tg=$('#br-tg');
  for(const [k,l] of[['air','Air'],['fuel','Fuel'],['ex','Exhaust']])tg.appendChild(toggle(l,true,v=>tgs[k]=v));
  TICKS.push(dt=>{const rpm=1000+thr*6500,rate=rpm/16;a+=rate*dt;if(!u)return;u.flowK=10+thr*30;u.update(a,dt);
   butter.rotation.z=(1-thr)*Math.PI/2*.92;const sp=4+thr*22;
   u.fIn.g.visible=tgs.air||tgs.fuel;u.fEx.g.visible=tgs.ex;
   for(const f of airF){f.speed=sp;f.show(tgs.air);f.tick(dt)}for(const f of fuelF){f.speed=2+thr*6;f.show(tgs.fuel);f.tick(dt)}spray.speed=sp*.5;spray.show(tgs.fuel&&u.li>.05);spray.tick(dt);
   for(const f of exF){f.speed=sp*1.2;f.show(tgs.ex);f.tick(dt)}cat.material.emissive.setRGB(.25+thr*.6,.08+thr*.15,0);
   $('#br-kv').innerHTML=`<span>Engine speed</span><b>${Math.round(rpm/50)*50} rpm</b><span>Air per cycle</span><b>${Math.round(15+thr*85)}% of a full cylinder</b><span>Fuel per squirt</span><b>≈ air ÷ 14.7</b><span>Exhaust</span><b>${thr>.6?'roaring':'purring'}</b>`})}});

/* 10 layouts */
const SND={ctx:null,noise:null,
 init(){if(this.ctx)return true;try{this.ctx=actx||new (window.AudioContext||window.webkitAudioContext)();const n=this.ctx.sampleRate*.2,b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);this.noise=b;this.out=this.ctx.createGain();this.out.gain.value=.5;this.out.connect(this.ctx.destination);return true}catch(e){return false}},
 thump(t,vol=1){const c=this.ctx;const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(95,t);o.frequency.exponentialRampToValueAtTime(38,t+.09);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.7*vol,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.13);o.connect(g);g.connect(this.out);o.start(t);o.stop(t+.15);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g2=c.createGain();s.buffer=this.noise;f.type='lowpass';f.frequency.value=700;g2.gain.setValueAtTime(.35*vol,t);g2.gain.exponentialRampToValueAtTime(.0001,t+.07);s.connect(f);f.connect(g2);g2.connect(this.out);s.start(t);s.stop(t+.08)}};
SCENES.push({id:'layouts',belt:2,mood:'happy',title:'Engine layouts: singles, twins, Vs, boxers and fours',
 html:`<div class="wrap">${VIZ('Drag to rotate · scroll to zoom · cutaway shows pistons')}<div class="side">
 <div class="card"><b>Layout</b><div id="ly-pick" style="margin-top:6px"></div></div>
 <div class="card"><div id="ly-rpm"></div><div id="ly-slow"></div><div class="row" style="margin-top:6px"><span id="ly-listen"></span><span id="ly-mode"></span></div></div>
 <div class="card"><b>Firing timeline (one 720° cycle)</b><canvas class="c2" id="ly-tl"></canvas><p class="small" id="ly-int"></p></div>
 <div class="card" id="ly-info"></div>
 </div></div>`,
 init(w){let key='single',rpm=1500,slow=.04,th=0,sth=0,listen=false,M=null,mode='cut';const st=mkStage(w,{pos:[40,30,50],target:[0,8,0],auto:0});
  const build=k=>{key=k;if(st){if(M){st.scene.remove(M.g);M.g.traverse(o=>{o.geometry&&o.geometry.dispose()})}M=new Multi(k);M.setMode(mode);st.add(M.g);const n=M.L.cyl.length;st.view(k==='boxer'?[10,40,60]:k.startsWith('v')?[34,34,50]:[40+n*5,30,46+n*6],[0,k==='boxer'?2:8,0])}
   const L=LAYOUTS[k],f=fireAngles(L).slice().sort((a,b)=>a-b),iv=f.map((v,i)=>((f[(i+1)%f.length]-v+720)%720)||720);
   $('#ly-int').textContent='Firing intervals: '+iv.map(v=>v+'°').join(' → ')+(new Set(iv).size===1?' (even)':' (uneven: that is the "lope")');
   $('#ly-info').innerHTML=`<h3>${L.n}</h3><p>${L.feel}</p><p class="small"><b>Found in:</b> ${L.bikes}</p>`};
  const opts=Object.keys(LAYOUTS).map(k=>({l:LAYOUTS[k].n.replace(' (flat)','').replace(' (L-twin)',''),v:k}));$('#ly-pick').appendChild(chips(opts,'single',k=>{build(k);if(k==='twin270')react('The Interceptor 650 twin! Its 270 degree crank fires like a 90 degree V-twin. Press listen.','happy')}));
  $('#ly-rpm').appendChild(slider('Engine rpm (for sound)',800,6000,1500,50,v=>v+' rpm',v=>rpm=v));
  $('#ly-slow').appendChild(slider('Visual slow-motion',.01,.2,.04,.005,v=>'×'+v.toFixed(3),v=>slow=v));
  $('#ly-listen').appendChild(toggle('🔊 Listen',false,v=>{listen=v&&SND.init();if(listen&&SND.ctx.state==='suspended')SND.ctx.resume();if(v)au.pause()}));
  $('#ly-mode').appendChild(chips([{l:'Solid',v:'solid'},{l:'Cutaway',v:'cut'}],'cut',m=>{mode=m;M&&M.setMode(m)}));
  CLEAN.push(()=>{listen=false});build('single');
  const cv=$('#ly-tl');let C=fit2d(cv,130);
  const drawTL=()=>{const L=LAYOUTS[key],n=L.cyl.length,x=C.x,W=C.w,rh=Math.min(22,(C.h-20)/n),X=v=>30+v/720*(W-36);x.clearRect(0,0,W,C.h);
   L.cyl.forEach((c,i)=>{const y=6+i*(rh+3);x.fillStyle='#b9ab94';x.font='11px system-ui';x.textAlign='left';x.fillText('#'+(i+1),4,y+rh*.7);
    for(let s=0;s<4;s++){const st0=((s*180-c.c)%720+720)%720;x.fillStyle=STROKES[s].c+(s===2?'ff':'55');const w2=X(180)-X(0);if(st0+180<=720)x.fillRect(X(st0),y,w2-1,rh);else{x.fillRect(X(st0),y,X(720)-X(st0),rh);x.fillRect(X(0),y,X(st0+180-720)-X(0)-1,rh)}}
    const fa=((360-c.c)%720+720)%720;x.fillStyle='#fff';x.font='12px system-ui';x.fillText('⚡',X(fa)-5,y+rh*.75)});
   x.fillStyle='#b9ab94';x.textAlign='center';x.font='10px system-ui';for(const v of[0,180,360,540,720])x.fillText(v+'°',clamp(X(v),12,W-12),C.h-3);
   const mx=X(((th%720)+720)%720);x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(mx,2);x.lineTo(mx,C.h-14);x.stroke()};
  TICKS.push(dt=>{th+=rpm*6*slow*dt;if(M)M.update(th,dt);
   if(listen&&SND.ctx){const prev=sth;sth+=rpm*6*dt;const fa=M?M.fires:fireAngles(LAYOUTS[key]);const now=SND.ctx.currentTime;
    for(const f of fa){let k0=Math.ceil((prev-f)/720),k1=Math.floor((sth-f)/720);for(let k=k0;k<=k1;k++){const at=f+k*720;SND.thump(now+.05+(at-prev)/(rpm*6),1)}}}
   drawTL()})}});
