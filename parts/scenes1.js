/* ===== scenes 1-6 ===== */
const VIZ=(hint,extra='')=>`<div class="viz"><canvas class="gl"></canvas><div class="hint">${hint||'Drag: rotate · Right-drag: pan · Scroll: zoom'}</div><div class="hud"></div><div class="tl"></div>${extra}</div>`;
function modeChips(get,val='solid'){return chips([{l:'Solid',v:'solid'},{l:'X-ray',v:'xray'},{l:'Cutaway',v:'cut'}],val,m=>{for(const u of get())u.setMode(m)})}
function strokeBadge(a){const s=STROKES[strokeOf(a)];return `<span class="stroke-badge" style="color:${s.c};border-color:${s.c}">${s.n} · ${s.w}</span>`}
function addLabels(st,list){const g=new T.Group();for(const [t,p,c] of list){const s=makeLabel(t,c||'#ffe3b0',1.6);s.position.set(...p);g.add(s)}st.add(g);return g}

/* 1 welcome */
SCENES.push({id:'welcome',belt:0,mood:'happy',title:'Welcome to the garage',
 html:`<div class="wrap">${VIZ()}<div class="side">
 <div class="card"><h3>On the stand: a single-cylinder four-stroke</h3><p>The same basic design as a Royal Enfield Classic 350 or Himalayan 450: one big piston that "thumps" once every two turns of the crank.</p></div>
 <div class="card"><h3>Try it</h3><div id="w-mode"></div><label class="sl">&nbsp;</label><div id="w-spd"></div><div class="row" style="margin-top:8px" id="w-lab"></div></div>
 <div class="card small"><b>You will learn:</b> the parts · the four-stroke cycle · cams and valves · air, fuel and spark · two-strokes · cooling, oil, intake and exhaust · single/twin/V/boxer/inline layouts · torque vs power · Royal Enfield dyno curves.</div>
 </div></div>`,
 init(w){const st=mkStage(w,{pos:[34,24,46],target:[0,10,0],auto:.7});const sd=$('#w-spd');let rate=160;
  sd.appendChild(slider('Engine speed (slow motion)',20,900,160,10,v=>v<200?'crawl':v<500?'tick-over':'brisk',v=>rate=v));
  if(!st){return}const u=new CylUnit();st.add(u.g);let a=0,labels=addLabels(st,[['Spark plug',[0,34,0]],['Cylinder head',[-9,24,6]],['Cylinder (finned)',[9,14,7]],['Crankcase',[-10,-4,6]],['Flywheel',[0,-2,-12]],['Exhaust',[13,22,0],'#ffb07a'],['Intake',[-13,25,0],'#9fd0ff']]);
  $('#w-mode').appendChild(modeChips(()=>[u]));$('#w-lab').appendChild(toggle('Labels',true,v=>labels.visible=v));
  st.up.push(dt=>{a+=rate*dt;u.update(a,dt)})}});

/* 2 anatomy */
const ANAT=['piston','conrod','crankshaft','flywheel','barrel','head','intakevalve','exhaustvalve','intakecam','exhaustcam','sparkplug','chain','crankcase','intakeport','exhaustport','camcover'];
SCENES.push({id:'anatomy',belt:0,mood:'think',title:'Anatomy: take it apart',
 html:`<div class="wrap">${VIZ('Click any part · drag to rotate · scroll to zoom')}<div class="side">
 <div class="card"><div id="an-ex"></div><div class="row" style="margin-top:6px" id="an-mode"></div><div class="row" style="margin-top:6px" id="an-run"></div></div>
 <div class="card" id="an-info"><h3>Click a part</h3><p class="small">Explode the engine with the slider, then click parts to see what they do. Find any 6 to earn your first spanner.</p></div>
 <div class="card"><b>Found <span id="an-n">0</span>/6</b><ul class="checklist" id="an-list"></ul></div>
 </div></div>`,
 init(w){const found=new Set();const list=$('#an-list');ANAT.forEach(k=>list.appendChild(h('li',{id:'an-'+k},PART_INFO[k][0].replace(/ \(.*\)/,''))));
  let u,st,hl=null,run=true;
  const select=k=>{const [n,d]=PART_INFO[k];$('#an-info').innerHTML=`<h3>${n}</h3><p>${d}</p>`;
   if(hl)hl.traverse(o=>{if(o.material&&o.userData.e0!==undefined){o.material.emissive.setHex(o.userData.e0);}});
   hl=u&&u.parts[k];if(hl)hl.traverse(o=>{if(o.material&&o.material.emissive){if(o.userData.e0===undefined)o.userData.e0=o.material.emissive.getHex();o.material.emissive.setHex(0x7a4a00)}});
   if(!found.has(k)){found.add(k);$('#an-'+k).classList.add('got');$('#an-n').textContent=Math.min(6,found.size);if(found.size===6){toast('🔧 Spanner earned: you know your parts!');react('Shabash! You can name the key parts now.','happy')}else react(n+'. '+['Good eye.','Nice.','That one matters.','Keep going.'][found.size%4],'happy')}};
  $$('#an-list li').forEach(li=>{li.style.cursor='pointer';li.onclick=()=>select(li.id.slice(3))});
  st=mkStage(w,{pos:[38,26,50],target:[0,10,0],auto:.3,onPick:hh=>{if(hh)select(hh.part)}});
  $('#an-ex').appendChild(slider('Explode',0,1,0,.01,v=>v<.05?'assembled':Math.round(v*100)+'%',v=>u&&u.explode(v)));
  if(!st)return;u=new CylUnit({mode:'cut'});st.add(u.g,true);
  $('#an-mode').appendChild(modeChips(()=>[u],'cut'));$('#an-run').appendChild(toggle('Run engine',true,v=>run=v));
  let a=0;st.up.push(dt=>{if(run)a+=70*dt;u.update(a,dt)})}});

/* 3 four-stroke */
SCENES.push({id:'fourstroke',belt:0,mood:'neutral',title:'The four-stroke cycle',captureArrows:false,
 html:`<div class="wrap">${VIZ('Cutaway view · drag to rotate · scroll to zoom')}<div class="side">
 <div class="card"><div class="row"><button class="btn on" id="fs-play">⏸ Pause</button><button class="btn" id="fs-step">+10° step</button></div>
  <div id="fs-spd"></div><div id="fs-scrub"></div>
  <div class="row" id="fs-jump" style="margin-top:6px"></div></div>
 <div class="card"><canvas class="c2" id="fs-wheel"></canvas><div class="kv" style="margin-top:6px"><span>Crank angle</span><b id="fs-ang">0°</b><span>Crank turns this cycle</span><b id="fs-rev">0</b><span>Cam turns</span><b id="fs-cam">0</b></div></div>
 <div class="card"><b>Check yourself</b><p class="small">I freeze the engine and you name the stroke. Get 3 right.</p><button class="btn" id="fs-q">Freeze &amp; ask</button><div class="row" id="fs-ans" style="margin-top:6px"></div><div id="fs-score" class="small"></div></div>
 </div></div>`,
 init(w){let a=0,play=true,rate=90,score=0,ask=null;const hud=w.querySelector('.hud');
  const st=mkStage(w,{pos:[26,22,40],target:[0,13,0],auto:0});let u=null;if(st){u=new CylUnit({mode:'cut',flywheel:true});st.add(u.g)}
  $('#fs-spd').appendChild(slider('Speed',15,540,90,5,v=>v+'°/s',v=>rate=v));
  let scrubbing=false;const sc=slider('Crank angle (scrub)',0,719,0,1,v=>v+'°',v=>{if(scrubbing){a=v}});sc.input.addEventListener('pointerdown',()=>{scrubbing=true;setPlay(false)});sc.input.addEventListener('input',()=>{scrubbing=true;setPlay(false);a=+sc.input.value});$('#fs-scrub').appendChild(sc);
  const setPlay=v=>{play=v;$('#fs-play').textContent=v?'⏸ Pause':'▶ Play';$('#fs-play').classList.toggle('on',v)};
  $('#fs-play').onclick=()=>setPlay(!play);$('#fs-step').onclick=()=>{setPlay(false);a+=10};
  STROKES.forEach((s,i)=>{const b=h('button',{class:'btn chip',style:`border-color:${s.c}`},s.n);b.onclick=()=>{setPlay(false);a=i*180+5;react(['Intake: piston goes down, intake valve open, mixture rushes in.','Compression: both valves shut, piston squeezes the charge about 10 to 1.','Power: spark lit it, hot gas shoves the piston down. The only stroke that makes work!','Exhaust: exhaust valve opens, piston pushes the burnt gas out.'][i],'think')};$('#fs-jump').appendChild(b)});
  const cv=$('#fs-wheel');let C=fit2d(cv,170);
  const draw=()=>{const {x,w:W,h:H}=C;x.clearRect(0,0,W,H);const cx=W/2,cy=H/2,R=Math.min(W,H)/2-14;
   STROKES.forEach((s,i)=>{x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,R,-Math.PI/2+i*Math.PI/2,-Math.PI/2+(i+1)*Math.PI/2);x.closePath();x.fillStyle=s.c+(strokeOf(a)===i?'ee':'55');x.fill();
    const m=-Math.PI/2+(i+.5)*Math.PI/2;x.fillStyle='#120e0a';x.font='700 12px system-ui';x.textAlign='center';x.fillText(s.w,cx+Math.cos(m)*R*.6,cy+Math.sin(m)*R*.6+4)});
   const sa=-Math.PI/2+VT.spark/720*Math.PI*2;x.fillStyle='#fff';x.beginPath();x.arc(cx+Math.cos(sa)*(R+6),cy+Math.sin(sa)*(R+6),4,0,7);x.fill();x.font='11px system-ui';x.fillStyle='#ffe3b0';x.fillText('⚡ spark',cx+Math.cos(sa)*(R+6)-30,cy+Math.sin(sa)*(R+6)+14);
   const na=-Math.PI/2+(a%720)/720*Math.PI*2;x.strokeStyle='#fff';x.lineWidth=3;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(na)*R,cy+Math.sin(na)*R);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,5,0,7);x.fill();
   x.fillStyle='#b9ab94';x.font='11px system-ui';x.fillText('one ring = 720° = 2 crank turns',cx,H-2)};
  let last=-1;
  TICKS.push(dt=>{if(play)a+=rate*dt;a=(a%720+720)%720;if(u){u.update(a,dt)}if(!scrubbing||true)sc.input.value=Math.floor(a);if(!play)scrubbing=false;
   const k=strokeOf(a);if(k!==last){last=k;hud.innerHTML=strokeBadge(a)}$('#fs-ang').textContent=Math.floor(a%360)+'° ('+Math.floor(a)+'° of 720)';$('#fs-rev').textContent=a<360?'1st':'2nd';$('#fs-cam').textContent=(a/720).toFixed(2);draw()});
  if(st)st.up.push(()=>{});
  $('#fs-q').onclick=()=>{setPlay(false);const k=Math.floor(Math.random()*4);a=k*180+30+Math.random()*120;ask=k;const box=$('#fs-ans');box.innerHTML='';hud.style.visibility='hidden';
   STROKES.forEach((s,i)=>{const b=h('button',{class:'btn chip'},s.n);b.onclick=()=>{if(ask===null)return;hud.style.visibility='';if(i===ask){score++;react(score>=3?'Three right! You can read an engine like a book.':'Correct! Look at the valves and the gas colour.','happy');b.classList.add('on')}else react('Not quite. It is '+STROKES[ask].n+'. Check which valve is open.','think');ask=null;$('#fs-score').textContent='Score: '+score+(score>=3?' ✔':'')};box.appendChild(b)})};
  CLEAN.push(()=>{})}});

/* 4 cams & valve timing */
SCENES.push({id:'cams',belt:0,mood:'think',title:'Camshaft, valves and timing',
 html:`<div class="wrap">${VIZ('Watch the red timing marks · drag to rotate')}<div class="side">
 <div class="card"><div class="row"><button class="btn on" id="cm-play">⏸ Pause</button></div><div id="cm-spd"></div></div>
 <div class="card"><b>Valve lift vs crank angle</b> <span class="small">(drag on the chart to scrub)</span><canvas class="c2" id="cm-chart" style="cursor:ew-resize;touch-action:none"></canvas>
  <div class="legend" style="margin-top:4px"><span><i style="background:#4fa3ff"></i>Intake lift</span><span><i style="background:#ff8f4a"></i>Exhaust lift</span><span><i style="background:#ffe08a55;border:1px solid #ffe08a"></i>Overlap</span></div>
  <p class="small">Typical road-engine timing shown (illustrative): intake opens ≈20° before TDC and closes ≈40° after BDC. Exhaust opens ≈40° before BDC.</p></div>
 <div class="card"><div class="kv"><span>Crank revolutions</span><b id="cm-cr">0</b><span>Cam revolutions</span><b id="cm-ca">0</b><span>Ratio</span><b>12 : 24 teeth = 2 : 1</b></div>
  <p class="small" style="margin-top:6px"><b>Challenge:</b> pause the engine where <i>both</i> valves are open (overlap).</p></div>
 </div></div>`,
 init(w){let a=650,play=true,rate=60,crank=0,won=false;
  const st=mkStage(w,{pos:[26,30,-20],target:[0,20,-1],auto:0});let u=null;if(st){u=new CylUnit({mode:'xray'});st.add(u.g);addLabels(st,[['Cam sprocket (24 teeth)',[0,32.5,-8]],['Crank sprocket (12 teeth)',[0,-3.5,-8]],['Intake cam',[-5,30.6,0],'#9fd0ff'],['Exhaust cam',[5,30.6,0],'#ffb07a']])}
  $('#cm-spd').appendChild(slider('Speed',10,360,60,5,v=>v+'°/s',v=>rate=v));
  const setPlay=v=>{play=v;$('#cm-play').textContent=v?'⏸ Pause':'▶ Play';$('#cm-play').classList.toggle('on',v);if(!v&&!won&&liftI(a)>.02&&liftE(a)>.02){won=true;react('Yes! Overlap: the exhaust is still closing while the intake opens. Outgoing gas helps pull the fresh charge in.','happy')}else if(!v&&!won)react('Not overlap yet. Look near top dead centre, between exhaust and intake.','think')};
  $('#cm-play').onclick=()=>setPlay(!play);
  const cv=$('#cm-chart');const C=fit2d(cv,150);
  const X=v=>16+v/720*(C.w-24),Y=l=>C.h-26-l*(C.h-44);
  const scrub=e=>{const b=cv.getBoundingClientRect();a=clamp((e.clientX-b.left-16)/(C.w-24)*720,0,719);if(play)setPlay(false)};
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);scrub(e);cv.onpointermove=scrub});cv.addEventListener('pointerup',()=>cv.onpointermove=null);
  const draw=()=>{const x=C.x;x.clearRect(0,0,C.w,C.h);
   STROKES.forEach((s,i)=>{x.fillStyle=s.c+'33';x.fillRect(X(i*180),C.h-22,X(180)-X(0),16);x.fillStyle='#d9ccb4';x.font='10px system-ui';x.textAlign='center';x.fillText(s.n,X(i*180+90),C.h-10)});
   x.fillStyle='#ffe08a33';for(let v=0;v<720;v+=2)if(liftI(v)>.01&&liftE(v)>.01)x.fillRect(X(v),Y(1),X(2)-X(0)+.5,Y(0)-Y(1));
   for(const [f,c] of[[liftI,'#4fa3ff'],[liftE,'#ff8f4a']]){x.strokeStyle=c;x.lineWidth=2;x.beginPath();for(let v=0;v<=720;v+=3){const yy=Y(f(v));v?x.lineTo(X(v),yy):x.moveTo(X(v),yy)}x.stroke()}
   x.strokeStyle='#3b3127';x.lineWidth=1;x.beginPath();x.moveTo(X(0),Y(0));x.lineTo(X(720),Y(0));x.stroke();
   x.fillStyle='#b9ab94';x.textAlign='center';for(const [v,t] of[[0,'TDC'],[180,'BDC'],[360,'TDC⚡'],[540,'BDC'],[720,'TDC']])x.fillText(t,clamp(X(v),14,C.w-14),12);
   x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(X(a),16);x.lineTo(X(a),Y(0));x.stroke()};
  TICKS.push(dt=>{const da=play?rate*dt:0;a+=da;crank+=da;a=(a%720+720)%720;u&&u.update(a,dt);$('#cm-cr').textContent=(crank/360).toFixed(2);$('#cm-ca').textContent=(crank/720).toFixed(2);draw()})}});

/* 5 air, fuel & spark (2D model) */
SCENES.push({id:'mixture',belt:1,mood:'think',title:'Air, fuel and spark',
 html:`<div class="wrap"><div class="viz" style="display:flex;flex-direction:column"><canvas id="mx-cv" style="flex:1;width:100%;min-height:280px"></canvas><div class="hint">Illustrative model, not engine data</div></div><div class="side">
 <div class="card"><div id="mx-afr"></div><div id="mx-adv"></div></div>
 <div class="card"><div class="kv" id="mx-out"></div></div>
 <div class="card"><b>How fuel gets in</b><div id="mx-sys" style="margin:6px 0"></div><p id="mx-systxt" class="small"></p></div>
 </div></div>`,
 init(w){let afr=14.7,adv=15,t0=0,sys='efi',ready=false;const cv=$('#mx-cv');let C=null;const rs=()=>{C=fit2d(cv,Math.max(280,cv.parentElement.clientHeight-4))};rs();const ro=new ResizeObserver(rs);ro.observe(cv.parentElement);CLEAN.push(()=>ro.disconnect());
  const SYS={carb:'Carburettor: air rushing through a narrow venturi drops in pressure and sucks fuel from a jet, like a perfume sprayer. Simple, but it cannot adapt well to altitude or temperature.',efi:'Fuel injection (EFI): an ECU reads sensors (throttle, air temperature, oxygen in the exhaust) and pulses an injector for a few milliseconds. Modern Royal Enfields use EFI, which keeps the mixture close to 14.7:1 so the catalytic converter works.'};
  $('#mx-sys').appendChild(chips([{l:'Carburettor',v:'carb'},{l:'Fuel injection',v:'efi'}],'efi',v=>{sys=v;$('#mx-systxt').textContent=SYS[v]}));$('#mx-systxt').textContent=SYS.efi;
  const model=()=>{const sf=Math.exp(-(((afr-12.8)/3.4)**2)),burn=38/(.5+.5*sf),pk=-adv+.55*burn,teff=Math.exp(-(((pk-15)/22)**2));
   const ap=afr<12.8?1-.012*(afr-12.8)**2:1-.02*(afr-12.8)**2,pow=clamp(ap,0,1)*teff;const eco=clamp(1-.035*(afr-15.8)**2,0,1)*teff;
   const lim=34-Math.max(0,afr-14.7)*4+Math.max(0,13.2-afr)*3,knock=adv>lim;return{burn,pk,pow:knock?pow*.85:pow,eco,knock,lean:afr>15.6,rich:afr<13.6,misfire:afr>18.5}};
  let M=model();const upd=()=>{M=model();const r=(n,v,c)=>`<span>${n}</span><span><div class="meter"><i style="width:${clamp(v,0,1)*100}%;background:${c}"></i></div></span>`;
   $('#mx-out').innerHTML=r('Power',M.pow,'#ffb347')+r('Economy',M.eco,'#6fd08c')+`<span>Peak pressure</span><b>${M.pk<0?(-M.pk).toFixed(0)+'° before':M.pk.toFixed(0)+'° after'} TDC ${Math.abs(M.pk-15)<6?'✔ ideal ≈15° after':''}</b><span>Knock</span><b style="color:${M.knock?'#e5533d':'#6fd08c'}">${M.knock?'⚠ PINGING!':'none'}</b><span>Exhaust</span><b>${M.misfire?'misfires, raw fuel':M.rich?'black smoke, CO, wasted fuel':M.lean?'very hot, NOx, risk of burnt valves':'clean: catalytic converter happy'}</b>`;
   if(M.knock)react('Hear that ping? The spark is too early, so the end gas explodes on its own. Back off the advance!','alert');
   else if(Math.abs(afr-14.7)<.3&&Math.abs(M.pk-15)<5)react('Lovely. Near 14.7 to 1 with peak pressure just after top dead centre.','happy')};upd();
  $('#mx-afr').appendChild(slider('Air : fuel ratio',10,20,14.7,.1,v=>v.toFixed(1)+' : 1 '+(v<13.8?'(rich)':v>15.6?'(lean)':'(≈ stoichiometric)'),v=>{afr=v;if(ready)upd()}));
  $('#mx-adv').appendChild(slider('Spark advance',0,50,15,1,v=>v+'° before TDC',v=>{adv=v;if(ready)upd()}));ready=true;
  TICKS.push((dt,t)=>{if(!C)return;const {x,w:W,h:H}=C;x.clearRect(0,0,W,H);const narrow=W<560;
   /* left: combustion chamber with flame front */
   const cw=narrow?W:W*.45,cx=cw/2,cy=narrow?H*.27:H/2,R=Math.min(cw*.36,narrow?H*.22:H*.36);
   x.fillStyle='#2a231c';x.beginPath();x.arc(cx,cy,R+10,0,7);x.fill();x.fillStyle='#120e0a';x.beginPath();x.arc(cx,cy,R,0,7);x.fill();
   const cyc=1.6,ph=((t-t0)%cyc)/cyc;const fr=M.misfire&&Math.sin(t*5)>0?0:clamp((ph-.1)/(.5*M.burn/40),0,1);
   const col=M.rich?[255,170,40]:M.lean?[150,150,255]:[80,160,255];
   if(ph>.1&&fr>0){const g=x.createRadialGradient(cx,cy-R*.2,0,cx,cy-R*.2,R*1.3*fr);g.addColorStop(0,`rgba(${col},.95)`);g.addColorStop(.7,`rgba(${col},.55)`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.save();x.beginPath();x.arc(cx,cy,R,0,7);x.clip();x.fillRect(cx-R,cy-R,2*R,2*R);
    if(M.knock&&fr>.45){for(let i=0;i<5;i++){const a2=i*1.3+t*3;x.fillStyle='rgba(255,60,40,.9)';x.beginPath();x.arc(cx+Math.cos(a2)*R*.85,cy+Math.sin(a2)*R*.85,R*.12*Math.random()+3,0,7);x.fill()}}x.restore()}
   if(ph>.08&&ph<.13){x.fillStyle='#fff';x.beginPath();x.arc(cx,cy-R*.2,6,0,7);x.fill()}
   x.fillStyle='#ddd';x.fillRect(cx-3,cy-R-14,6,R*.8-6);x.fillStyle='#b9ab94';x.font='12px system-ui';x.textAlign='center';x.fillText('View looking up into the chamber: plug in the middle',cx,cy+R+26);
   if(M.knock&&fr>.45){x.fillStyle='#e5533d';x.font='900 22px system-ui';x.fillText('PING!',cx+R*.6,cy-R*.6)}
   /* right: cylinder pressure vs crank angle */
   const gx=narrow?20:W*.5,gy=narrow?H*.56:30,gw=narrow?W-34:W*.47,gh=narrow?H*.4:H-80;
   x.strokeStyle='#3b3127';x.lineWidth=1;x.strokeRect(gx,gy,gw,gh);x.fillStyle='#d9ccb4';x.textAlign='left';x.font='12px system-ui';x.fillText('Cylinder pressure',gx+6,gy+16);
   const A0=-60,A1=100,PX=v=>gx+(v-A0)/(A1-A0)*gw,vol=v=>{const th=v*DEG,R3=3.3;return 1/9+.5*(R3+1-Math.cos(th)-Math.sqrt(R3*R3-Math.sin(th)**2))};
   const q=M.misfire?0:clamp(afr<12.8?1-.012*(afr-12.8)**2:1-.02*(afr-12.8)**2,0,1);const P=[];
   for(let v=A0;v<=A1;v++){const V=vol(v),s=-adv,d=M.burn,xb=v<s?0:1-Math.exp(-5*Math.pow(clamp((v-s)/d,0,1.6),3));P.push(Math.pow(vol(-180)/V,1.3)*(1+3.2*q*xb))}
   const PY=p=>gy+gh-Math.min(p,120)/120*(gh-26);
   x.strokeStyle='#2f2820';for(const v of[0]){x.beginPath();x.moveTo(PX(v),gy);x.lineTo(PX(v),gy+gh);x.stroke()}x.fillStyle='#b9ab94';x.textAlign='center';x.fillText('TDC',PX(0),gy+gh+14);x.fillText('-60°',PX(-60)+12,gy+gh+14);x.fillText('+100°',PX(100)-18,gy+gh+14);
   x.strokeStyle='#ffe08a';x.setLineDash([4,4]);x.beginPath();x.moveTo(PX(-adv),gy+20);x.lineTo(PX(-adv),gy+gh);x.stroke();x.setLineDash([]);x.fillStyle='#ffe08a';x.fillText('⚡',PX(-adv),gy+30);
   x.strokeStyle=M.knock?'#e5533d':'#ffb347';x.lineWidth=2.5;x.beginPath();P.forEach((p,i)=>{const X=PX(A0+i),Y=PY(p)+(M.knock&&i>60&&i<90?Math.sin(i*2.3+t*40)*6:0);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();
   x.fillStyle='#6fd08c33';x.fillRect(PX(10),gy+20,PX(20)-PX(10),gh-20);x.fillStyle='#6fd08c';x.fillText('best peak',PX(15),gy+gh-6)})}});

/* 6 two-stroke vs four-stroke */
class TwoStroke{
 constructor(){const g=this.g=new T.Group();this.shells=[];const sh=c=>{const m=shellMat(c,0);this.shells.push(m);return m};
  const cc=new T.Mesh(new T.CylinderGeometry(7.5,7.5,8,40),sh(0x9a9ea6));cc.rotation.x=Math.PI/2;g.add(cc);
  g.add(lathe([[G.R+.05,G.base-2],[G.R+1,G.base-2],[G.R+1,G.deck],[G.R+.05,G.deck],[G.R+.05,G.base-2]],sh(0xa7abb2),48));
  const fsh=new T.Shape();fsh.absarc(0,0,6.6,0,Math.PI*2);const fh=new T.Path();fh.absarc(0,0,G.R+.9,0,Math.PI*2,true);fsh.holes.push(fh);const fg=new T.ExtrudeGeometry(fsh,{depth:.22,bevelEnabled:false,curveSegments:32});fg.rotateX(-Math.PI/2);const fm=sh(0xb4b8be);
  for(let y=G.base+.5;y<G.deck+3;y+=1.1){const f=new T.Mesh(fg,fm);f.position.y=y;g.add(f)}
  const hd=lathe([[0,G.deck+3.4],[G.R+1,G.deck+2.2],[G.R+1,G.deck],[0,G.deck]],sh(0x9ea3aa),40);g.add(hd);
  this.exTop=15,this.trTop=13.6;
  const ex=new T.CatmullRomCurve3([V3(G.R-.5,13.3,0),V3(8,13,0),V3(12,11,0),V3(16,6,0)]),tr=new T.CatmullRomCurve3([V3(-3,3,0),V3(-6.3,6,0),V3(-6.3,11,0),V3(-G.R+.4,12.7,0),V3(-1,14.5,0)]),it=new T.CatmullRomCurve3([V3(-16,-1,0),V3(-10,-1,0),V3(-5,-.5,0)]);
  const pipe=(c,col,r)=>{const m=new T.Mesh(new T.TubeGeometry(c,30,r,10),new T.MeshStandardMaterial({color:col,transparent:true,opacity:.35,depthWrite:false,metalness:.4,roughness:.4}));g.add(m)};
  pipe(ex,0xb0603a,1.2);pipe(tr,0x3a6fb0,.8);pipe(it,0x3a6fb0,1);
  this.fEx=new Flow(ex.getPoints(14),{color:0xa8a29a,r:.35,jit:1.2,dens:1.4,speed:0});g.add(this.fEx.g);
  for(let i=0;i<this.fEx.n;i+=4)this.fEx.im.setColorAt(i,new T.Color(0x4fa3ff));this.fEx.colored=true;
  this.fTr=new Flow(tr.getPoints(14),{color:0x6fb6ff,r:.3,jit:.6,dens:1.6,speed:0});g.add(this.fTr.g);this.fIn=new Flow(it.getPoints(10),{color:0x6fb6ff,r:.32,jit:.9,dens:1.4,speed:0});g.add(this.fIn.g);
  const reed=new T.Mesh(new T.BoxGeometry(.2,2,2),MAT.black());reed.position.set(-5,-.5,0);g.add(reed);this.reed=reed;
  this.pist=new T.Group();g.add(this.pist);this.pist.add(lathe([[0,G.crown],[G.R-.08,G.crown],[G.R-.12,-3.6],[0,-3.6]],MAT.alu(),40));
  const rm=MAT.dark();for(const y of[G.crown-.5,G.crown-1.1]){const ring=new T.Mesh(new T.TorusGeometry(G.R-.06,.11,6,40),rm);ring.rotation.x=Math.PI/2;ring.position.y=y;this.pist.add(ring)}
  this.rod=new T.Group();g.add(this.rod);const rmat=MAT.steel();this.rod.add(new T.Mesh(new T.TorusGeometry(1.45,.55,10,24),rmat));const sm=new T.Mesh(new T.TorusGeometry(.95,.35,8,20),rmat);sm.position.y=G.l;this.rod.add(sm);const beam=new T.Mesh(new T.BoxGeometry(1.1,G.l-2.6,.9),rmat);beam.position.y=G.l/2;this.rod.add(beam);
  this.crank=new T.Group();g.add(this.crank);const disc=new T.Mesh(new T.CylinderGeometry(6,6,.9,40),MAT.steel());disc.rotation.x=Math.PI/2;for(const z of[-1.3,1.3]){const d=disc.clone();d.position.z=z;this.crank.add(d)}const cp=new T.Mesh(new T.CylinderGeometry(1,1,2.6,16),MAT.steel());cp.rotation.x=Math.PI/2;cp.position.y=G.r;this.crank.add(cp);
  const plug=lathe([[0,0],[.3,0],[.3,2],[.55,2],[.55,4],[.4,7],[0,7]],MAT.ceramic(),16);plug.position.y=G.deck+.4;g.add(plug);
  this.spark=glowSprite(0x9fd4ff,0);this.spark.position.set(0,G.deck+.2,0);g.add(this.spark);this.flash=new T.PointLight(0xff8a30,0,40,1.4);this.flash.position.set(0,G.deck-1,0);g.add(this.flash);
  const gg=new T.CylinderGeometry(G.R-.03,G.R-.03,1,40);gg.translate(0,.5,0);this.gasMat=new T.MeshBasicMaterial({color:0x4fa3ff,transparent:true,opacity:.3,depthWrite:false});this.gas=new T.Mesh(gg,this.gasMat);g.add(this.gas);
  this.ccMat=new T.MeshBasicMaterial({color:0x4fa3ff,transparent:true,opacity:.15,depthWrite:false});const ccg=new T.Mesh(new T.CylinderGeometry(7.2,7.2,7.6,40),this.ccMat);ccg.rotation.x=Math.PI/2;g.add(ccg);
  this.setMode('cut')}
 setMode(m){setShellMode(this.shells,m)}
 update(a,dt){const th=(a%360+360)%360,t=th*DEG,px=G.r*Math.sin(t),py=G.r*Math.cos(t),yp=py+Math.sqrt(G.l**2-px*px),crown=yp+G.crown;
  this.crank.rotation.z=-t;this.rod.position.set(px,py,0);this.rod.rotation.z=Math.atan2(px,yp-py);this.pist.position.y=yp;
  const exOpen=crown<this.exTop,trOpen=crown<this.trTop,up=th>180;this.exOpen=exOpen;this.trOpen=trOpen;this.up=up;
  this.gas.position.y=crown;this.gas.scale.y=G.deck+1.4-crown;const c=this.gasMat.color;
  if(th<5||th>=345){c.set(0xfff2b0);this.gasMat.opacity=.85}else if(th<110){c.set(0xffb060).lerp(new T.Color(0xff5a10),th/110);this.gasMat.opacity=.8-.3*th/110}
  else if(trOpen){c.set(0x8aa0d8);this.gasMat.opacity=.45}else if(exOpen){c.set(0x8a8f98);this.gasMat.opacity=.4}else{c.set(0x7f8dff);this.gasMat.opacity=.35+.3*(th-250)/95}
  this.ccMat.opacity=up?.12+.2*(th-180)/180:.32-.18*(th/180);this.reed.rotation.y=up?.5:0;
  this.fEx.speed=exOpen?18:0;this.fEx.show(exOpen);this.fTr.speed=trOpen?14:0;this.fTr.show(trOpen);this.fIn.speed=up?10:0;this.fIn.show(up);for(const f of[this.fEx,this.fTr,this.fIn])f.tick(dt);
  const sp=th>=340&&th<358;this.spark.scale.setScalar(sp?3.5:0);this.flash.intensity=sp?260:(th<90?(1-th/90)*400:0)}
}
SCENES.push({id:'twostroke',belt:1,mood:'neutral',title:'Two-stroke vs four-stroke',
 html:`<div class="wrap">${VIZ('Both engines share one crank speed · drag to rotate')}<div class="side">
 <div class="card"><div class="row"><button class="btn on" id="ts-play">⏸ Pause</button></div><div id="ts-spd"></div><div id="ts-show" style="margin-top:6px"></div></div>
 <div class="card"><div class="kv"><span>Crank turns</span><b id="ts-rev">0</b><span>4-stroke power pulses</span><b id="ts-p4" style="color:#ff9a62">0</b><span>2-stroke power pulses</span><b id="ts-p2" style="color:#ff9a62">0</b></div></div>
 <div class="card"><b>Right now in the 2-stroke</b><p id="ts-now" class="small"></p></div>
 <div class="card small"><b>Trade-off:</b> a two-stroke fires every turn with no valves, so it is light and punchy (dirt bikes, the RD350 and older scooters). But it burns oil mixed into its fuel, and some fresh charge escapes with the exhaust (the blue dots in the grey stream). Tighter emissions rules pushed most road bikes to four-strokes.</div>
 </div></div>`,
 init(w){let a=0,play=true,rate=120,p2=0,p4=0,prev=0;const st=mkStage(w,{pos:[0,20,70],target:[0,10,0],auto:0});let u4=null,u2=null;
  if(st){u4=new CylUnit({mode:'cut',chain:false,flywheel:false});u4.g.position.x=-16;st.add(u4.g);u2=new TwoStroke();u2.g.position.x=16;st.add(u2.g);
   for(const m of u4.shells)m.userData.plane.constant=0;addLabels(st,[['4-STROKE',[-16,36,0],'#ffe3b0'],['2-STROKE',[16,33,0],'#ffe3b0'],['exhaust port',[29,8,0],'#ffb07a'],['transfer port',[5,6,4],'#9fd0ff'],['reed intake',[2,-4,4],'#9fd0ff']])}
  $('#ts-spd').appendChild(slider('Speed',20,540,120,5,v=>v+'°/s',v=>rate=v));
  $('#ts-show').appendChild(chips([{l:'Both',v:'b'},{l:'4-stroke',v:'4'},{l:'2-stroke',v:'2'}],'b',v=>{if(!st)return;st.view(v==='b'?[0,20,70]:v==='4'?[-6,20,40]:[26,18,40],v==='b'?[0,10,0]:v==='4'?[-16,12,0]:[16,10,0])}));
  const setPlay=v=>{play=v;$('#ts-play').textContent=v?'⏸ Pause':'▶ Play';$('#ts-play').classList.toggle('on',v)};$('#ts-play').onclick=()=>setPlay(!play);
  TICKS.push(dt=>{const pa=a;if(play)a+=rate*dt;if(Math.floor((pa-360)/720)!==Math.floor((a-360)/720)){p4++}if(Math.floor((pa)/360)!==Math.floor(a/360)){p2++}
   u4&&u4.update(a,dt);u2&&u2.update(a,dt);$('#ts-rev').textContent=(a/360).toFixed(1);$('#ts-p4').textContent=p4;$('#ts-p2').textContent=p2;
   const th=a%360,tx=u2?(th<110?'Power: burning gas drives the piston down. Below it, the crankcase is being squeezed.':u2.trOpen?'Transfer ports uncovered: fresh charge rushes up from the crankcase and pushes exhaust out (scavenging).':u2.exOpen&&!u2.up?'Exhaust port uncovered: burnt gas blows out first.':u2.up&&!u2.exOpen?'Upstroke: squeezing the charge above while the vacuum below sucks new mixture through the reed valve.':'Port closing: the piston seals the cylinder again.'):'';
   if(tx!==prev){prev=tx;$('#ts-now').textContent=tx}})}});
