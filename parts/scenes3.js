/* ===== scenes 11-14: torque & power, RE dyno, lab, quiz ===== */
function pchip(xs,ys){const n=xs.length,h2=[],d=[],m=new Array(n).fill(0);for(let i=0;i<n-1;i++){h2.push(xs[i+1]-xs[i]);d.push((ys[i+1]-ys[i])/h2[i])}m[0]=d[0];m[n-1]=d[n-2];
 for(let i=1;i<n-1;i++){if(d[i-1]*d[i]<=0)m[i]=0;else{const w1=2*h2[i]+h2[i-1],w2=h2[i]+2*h2[i-1];m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i])}}
 return x=>{x=clamp(x,xs[0],xs[n-1]);let i=0;while(i<n-2&&x>xs[i+1])i++;const t=(x-xs[i])/h2[i],t2=t*t,t3=t2*t;return(2*t3-3*t2+1)*ys[i]+(t3-2*t2+t)*h2[i]*m[i]+(-2*t3+3*t2)*ys[i+1]+(t3-t2)*h2[i]*m[i+1]}}
/* Peak points: Royal Enfield spec sheets / published listings. Curve shapes between peaks: illustrative interpolation. */
const BIKES=[
 {k:'c350',n:'Classic 350',col:'#c97f22',eng:'349 cc single (J-series), SOHC 2-valve, air-oil cooled, EFI',bore:72,stroke:85.8,cr:'9.5 : 1',pk:[14.87,6100],tk:[27,4000],ps:'20.2 bhp',x:[1500,2500,3000,4000,5000,6100,6500],y:[20.5,24.2,25.6,27,26,23.28,21.4]},
 {k:'h450',n:'Himalayan 450',col:'#3a9cc4',eng:'452 cc single (Sherpa), DOHC 4-valve, liquid cooled, ride-by-wire EFI',bore:84,stroke:81.5,cr:'11.5 : 1',pk:[29.44,8000],tk:[40,5500],ps:'40.0 PS',x:[2000,3000,4000,5500,6500,7500,8000,8500],y:[29,36,38.4,40,39.2,37.1,35.14,32.5]},
 {k:'i650',n:'Interceptor 650',col:'#d9587a',eng:'648 cc parallel twin, 270° crank, SOHC, air-oil cooled, EFI',bore:78,stroke:67.8,cr:'9.5 : 1',pk:[34.6,7150],tk:[52.3,5150],ps:'47 PS',x:[1500,2500,3500,4500,5150,6000,7150,7500],y:[37,42.5,47.5,51.4,52.3,50.6,46.17,43.5]}];
BIKES.forEach(b=>{b.T=pchip(b.x,b.y);b.P=r=>b.T(r)*r/9549});

/* 11 torque, power, gears */
SCENES.push({id:'power',belt:2,mood:'happy',title:'Torque, power, rpm and gears',
 html:`<div class="wrap"><div class="viz" style="display:flex;flex-direction:column"><div class="row" style="padding:8px" id="pw-tab"></div><canvas id="pw-cv" style="flex:1;width:100%;min-height:300px"></canvas><div class="hint">Engine: Himalayan 450 curve (peaks official, shape illustrative)</div></div><div class="side">
 <div class="card"><div id="pw-rpm"></div><button class="btn" id="pw-rev" style="margin-top:6px">🏍 Blip the throttle</button><div id="pw-gear" style="margin-top:8px"></div></div>
 <div class="card"><div class="kv" id="pw-kv"></div></div>
 <div class="card small" id="pw-note"></div>
 </div></div>`,
 init(w){const B=BIKES[1];let rpm=4000,tab='tp',gear=1,blip=0;const RAT={pri:2.3,g:[2.6,1.8,1.4,1.15,.97,.85],fin:3.1,circ:2.0,rw:.32};
  const cv=$('#pw-cv');let C;const rs=()=>{C=fit2d(cv,Math.max(300,cv.parentElement.clientHeight-50))};rs();const ro=new ResizeObserver(rs);ro.observe(cv.parentElement);CLEAN.push(()=>ro.disconnect());
  const NOTE={tp:'<b>Torque</b> (N·m) is the twisting force on the crank: like pushing a spanner. <b>Power</b> is how fast that work is done: <b>kW = N·m × rpm ÷ 9549</b>. That is why power keeps rising after the torque peak: rpm grows faster than torque falls. 1 PS = 0.7355 kW; 1 bhp = 0.7457 kW.',gr:'Gears multiply torque. In 1st the wheel gets about 18× the crank torque, but tops out near 50 km/h. In 6th it gets about 6×, but goes three times as fast. Ratios here are illustrative, not factory data.'};
  $('#pw-tab').appendChild(chips([{l:'Torque & power',v:'tp'},{l:'Gears',v:'gr'}],'tp',v=>{tab=v;$('#pw-note').innerHTML=NOTE[v];$('#pw-gear').style.display=v==='gr'?'':'none'}));$('#pw-note').innerHTML=NOTE.tp;
  const rs2=slider('Engine speed',2000,8500,4000,50,v=>v+' rpm',v=>rpm=v);$('#pw-rpm').appendChild(rs2);
  $('#pw-gear').appendChild(chips(RAT.g.map((g,i)=>({l:['1st','2nd','3rd','4th','5th','6th'][i],v:i+1})),1,v=>{gear=v;react(v<=2?'Low gear: huge torque at the wheel, for pulling away and climbing.':v>=5?'Tall gear: low wheel torque but high road speed. Cruising!':'Middle gears: a balance of both.','think')}));$('#pw-gear').style.display='none';
  $('#pw-rev').onclick=()=>{blip=1.6;react('Vroom! Watch power climb faster than torque.','happy')};
  let ang=0;TICKS.push((dt,t)=>{if(blip>0){blip-=dt;const k=blip>.8?(1.6-blip)/.8:blip/.8;rs2.set(Math.round((2000+k*6300)/50)*50)}
   const Tq=B.T(rpm),P=B.P(rpm),tot=RAT.pri*RAT.g[gear-1]*RAT.fin,v=rpm/tot*RAT.circ*60/1000,wt=Tq*tot,F=wt*.9/RAT.rw;
   $('#pw-kv').innerHTML=`<span>Torque</span><b>${Tq.toFixed(1)} N·m</b><span>Power</span><b>${P.toFixed(1)} kW = ${(P/.7355).toFixed(1)} PS</b><span>Formula</span><b>${Tq.toFixed(1)} × ${rpm} ÷ 9549</b>`+(tab==='gr'?`<span>Gear ratio total</span><b>${tot.toFixed(1)} : 1</b><span>Road speed</span><b>${v.toFixed(0)} km/h</b><span>Wheel torque</span><b>${wt.toFixed(0)} N·m</b>`:'');
   const {x,w:W,h:H}=C;x.clearRect(0,0,W,H);const narrow=W<600;ang+=rpm/60*dt*Math.PI*2*.02;
   if(tab==='tp'){/* tacho + crank wheel with torque arrow */
    const gr=narrow?Math.min(W*.42,H*.24):Math.min(W*.2,H*.36),gx=narrow?W*.27:W*.22,gy=narrow?H*.28:H*.45;
    const arc=(v0,v1,c,lw)=>{x.strokeStyle=c;x.lineWidth=lw;x.beginPath();x.arc(gx,gy,gr,Math.PI*.75+v0/9000*Math.PI*1.5,Math.PI*.75+v1/9000*Math.PI*1.5);x.stroke()};
    arc(0,9000,'#2f2820',12);arc(0,rpm,'#ffb347',12);arc(8500,9000,'#e5533d',12);
    x.fillStyle='#d9ccb4';x.font='11px system-ui';x.textAlign='center';for(let k=0;k<=9;k++){const a2=Math.PI*.75+k/9*Math.PI*1.5;x.fillText(k,gx+Math.cos(a2)*(gr-20),gy+Math.sin(a2)*(gr-20)+4)}
    const na=Math.PI*.75+rpm/9000*Math.PI*1.5;x.strokeStyle='#fff';x.lineWidth=3;x.beginPath();x.moveTo(gx,gy);x.lineTo(gx+Math.cos(na)*(gr-8),gy+Math.sin(na)*(gr-8));x.stroke();
    x.font='700 18px system-ui';x.fillStyle='#fff';x.fillText(rpm+' rpm',gx,gy+gr*.55);x.font='11px system-ui';x.fillStyle='#b9ab94';x.fillText('× 1000 rpm',gx,gy+gr*.55+16);
    const cx2=narrow?W*.74:W*.5,cy2=gy,cr=gr*.7;x.save();x.translate(cx2,cy2);x.rotate(ang);x.fillStyle='#3a3530';x.beginPath();x.arc(0,0,cr,0,7);x.fill();x.strokeStyle='#8a8f98';x.lineWidth=3;x.stroke();for(let k=0;k<6;k++){x.rotate(Math.PI/3);x.fillStyle='#55504a';x.fillRect(-3,cr*.3,6,cr*.6)}x.restore();
    const al=Tq/52*cr*1.6;x.strokeStyle='#ffb347';x.lineWidth=6;x.beginPath();x.arc(cx2,cy2,cr+14,-Math.PI*.9,-Math.PI*.9+al/(cr+14));x.stroke();const ea=-Math.PI*.9+al/(cr+14);x.fillStyle='#ffb347';x.beginPath();x.moveTo(cx2+Math.cos(ea)*(cr+26),cy2+Math.sin(ea)*(cr+26));x.lineTo(cx2+Math.cos(ea)*(cr+2),cy2+Math.sin(ea)*(cr+2));x.lineTo(cx2+Math.cos(ea+.18)*(cr+14),cy2+Math.sin(ea+.18)*(cr+14));x.fill();
    x.fillStyle='#ffe3b0';x.font='700 14px system-ui';x.fillText('Torque '+Tq.toFixed(1)+' N·m',cx2,cy2+cr+40);
    /* mini curves: torque and power as two small charts (no dual axis) */
    const mx=narrow?20:W*.68,mw=narrow?W-40:W*.3,mh=narrow?H*.2:H*.36,my1=narrow?H*.55:H*.08,my2=my1+mh+(narrow?24:30);
    const mini=(y0,f,max,c,lab,unit)=>{x.strokeStyle='#3b3127';x.lineWidth=1;x.strokeRect(mx,y0,mw,mh);x.fillStyle='#d9ccb4';x.textAlign='left';x.font='12px system-ui';x.fillText(lab,mx+4,y0-5);
     const X=r=>mx+(r-2000)/6500*mw,Y=v=>y0+mh-v/max*mh;x.strokeStyle=c;x.lineWidth=2;x.beginPath();for(let r=2000;r<=8500;r+=50){const yy=Y(f(r));r===2000?x.moveTo(X(r),yy):x.lineTo(X(r),yy)}x.stroke();
     x.fillStyle='#fff';x.beginPath();x.arc(X(rpm),Y(f(rpm)),5,0,7);x.fill();x.strokeStyle='#ffffff55';x.beginPath();x.moveTo(X(rpm),y0);x.lineTo(X(rpm),y0+mh);x.stroke();x.fillStyle='#b9ab94';x.font='10px system-ui';x.fillText(f(rpm).toFixed(1)+' '+unit,X(rpm)+6,Y(f(rpm))-6)};
    mini(my1,B.T,45,'#3a9cc4','Torque (N·m) vs rpm','N·m');mini(my2,B.P,32,'#ffb347','Power (kW) vs rpm','kW');
   }else{/* tractive force vs speed for each gear */
    const px=50,py=24,pw=W-70,ph=H-70,maxV=170,maxF=2400,X=v=>px+v/maxV*pw,Y=f=>py+ph-f/maxF*ph;
    x.strokeStyle='#2f2820';x.lineWidth=1;x.fillStyle='#b9ab94';x.font='11px system-ui';x.textAlign='right';for(let f=0;f<=maxF;f+=400){x.beginPath();x.moveTo(px,Y(f));x.lineTo(px+pw,Y(f));x.stroke();x.fillText(f,px-4,Y(f)+4)}
    x.textAlign='center';for(let v=0;v<=maxV;v+=20)x.fillText(v,X(v),py+ph+16);x.fillText('Road speed (km/h)',px+pw/2,py+ph+34);x.save();x.translate(14,py+ph/2);x.rotate(-Math.PI/2);x.fillText('Push at the rear tyre (N)',0,0);x.restore();
    const ramp=['#ffe0b3','#ffc97a','#f5a742','#d9861f','#b0660f','#7f4708'];
    RAT.g.forEach((g,i)=>{const tt=RAT.pri*g*RAT.fin;x.strokeStyle=ramp[i];x.lineWidth=i+1===gear?4:2;x.beginPath();let lx,ly,pk=0,pkx=0,pky=0;for(let r=2000;r<=8500;r+=100){const v=r/tt*RAT.circ*.06,F=B.T(r)*tt*.9/RAT.rw;r===2000?x.moveTo(X(v),Y(F)):x.lineTo(X(v),Y(F));if(F>pk){pk=F;pkx=X(v);pky=Y(F)}}x.stroke();
     x.fillStyle='#e8dcc4';x.font=(i+1===gear?'700 ':'')+'12px system-ui';x.fillText(['1st','2nd','3rd','4th','5th','6th'][i],pkx,pky-8)});
    const tt=RAT.pri*RAT.g[gear-1]*RAT.fin,v=rpm/tt*RAT.circ*.06,F=B.T(rpm)*tt*.9/RAT.rw;x.fillStyle='#fff';x.strokeStyle='#14110e';x.lineWidth=2;x.beginPath();x.arc(X(v),Y(F),7,0,7);x.fill();x.stroke();
    x.textAlign='left';x.fillStyle='#fff';x.font='700 13px system-ui';x.fillText(`${v.toFixed(0)} km/h · ${F.toFixed(0)} N`,X(v)+12,Y(F)+20)}})}});

/* 12 Royal Enfield dyno */
SCENES.push({id:'dyno',belt:2,mood:'happy',title:'Royal Enfield on the dyno',
 html:`<div class="wrap"><div class="viz" style="overflow:auto;padding:10px 12px;background:#14110e"><div class="row" id="dy-pick"></div><div id="dy-charts" style="position:relative;margin-top:6px"></div>
  <p class="small" style="margin:4px 0 0">Peak points (dots) from Royal Enfield spec sheets and published listings. Curves between peaks are smooth <b>illustrative</b> interpolations; RE does not publish full dyno curves. <button class="btn chip" id="dy-tbl">Show as table</button></p><div id="dy-table"></div></div>
 <div class="side"><div id="dy-cards"></div><div class="card"><b>Bore × stroke (to scale)</b><svg id="dy-bs" viewBox="0 0 300 130" width="100%" role="img" aria-label="Bore and stroke comparison"></svg><p class="small">A long stroke (taller than wide) favours low-rpm torque and the classic thump. A short stroke lets the piston travel less per turn, so the engine can rev higher.</p></div></div></div>`,
 init(w){const on=new Set(['c350','h450','i650']);const box=$('#dy-charts');
  const pick=$('#dy-pick');BIKES.forEach(b=>{const t=toggle(`<i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${b.col};margin-right:5px"></i>${b.n}`,true,v=>{v?on.add(b.k):on.delete(b.k);draw()});pick.appendChild(t)});
  $('#dy-cards').innerHTML=BIKES.map(b=>`<div class="card" style="border-left:4px solid ${b.col}"><h3 style="color:#f3ead8">${b.n}</h3><div class="small">${b.eng}</div><div class="kv" style="margin-top:4px"><span>Peak power</span><b>${b.ps} (${b.pk[0]} kW) @ ${b.pk[1]} rpm</b><span>Peak torque</span><b>${b.tk[0]} N·m @ ${b.tk[1]} rpm</b><span>Bore × stroke</span><b>${b.bore} × ${b.stroke} mm</b><span>Compression</span><b>${b.cr}</b></div></div>`).join('');
  const bs=$('#dy-bs');bs.innerHTML=BIKES.map((b,i)=>{const x0=20+i*95,s=.9,bw=b.bore*s,sh=b.stroke*s;return `<rect x="${x0+(80-bw)/2}" y="${115-sh}" width="${bw}" height="${sh}" rx="4" fill="none" stroke="${b.col}" stroke-width="2.5"/><text x="${x0+40}" y="${125}" fill="#d9ccb4" font-size="10" text-anchor="middle">${b.n.split(' ')[0]} ${b.bore}×${b.stroke}</text><text x="${x0+40}" y="${112-sh/2}" fill="#b9ab94" font-size="9" text-anchor="middle">${b.stroke>b.bore?'long-stroke':'short-stroke'}</text>`}).join('');
  $('#dy-tbl').onclick=()=>{const t=$('#dy-table');if(t.innerHTML){t.innerHTML='';return}const rs=[2000,3000,4000,5000,6000,7000,8000];
   t.innerHTML=`<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:6px"><tr><th style="text-align:left">rpm</th>${BIKES.map(b=>`<th>${b.n}<br>N·m / kW</th>`).join('')}</tr>${rs.map(r=>`<tr><td>${r}</td>${BIKES.map(b=>`<td style="text-align:center">${r>=b.x[0]&&r<=b.x[b.x.length-1]?b.T(r).toFixed(1)+' / '+b.P(r).toFixed(1):'–'}</td>`).join('')}</tr>`).join('')}</table>`};
  const draw=()=>{const W=Math.max(300,box.clientWidth),H=Math.round(clamp(W*.3,150,230)),pl=44,pr=16,R0=1000,R1=9000,X=r=>pl+(r-R0)/(R1-R0)*(W-pl-pr);
   const chart=(id,f,max,step,unit,title,peak)=>{const Y=v=>12+(H-34)*(1-v/max);let s=`<svg width="${W}" height="${H}" data-c="${id}" style="display:block"><text x="${pl}" y="10" fill="#d9ccb4" font-size="12" font-weight="700">${title}</text>`;
    for(let v=0;v<=max;v+=step)s+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#2b241d"/><text x="${pl-6}" y="${Y(v)+4}" fill="#9a8c76" font-size="10" text-anchor="end">${v}</text>`;
    for(let r=1000;r<=9000;r+=1000)s+=`<text x="${X(r)}" y="${H-8}" fill="#9a8c76" font-size="10" text-anchor="middle">${r/1000}k</text>`;
    for(const b of BIKES){if(!on.has(b.k))continue;let d='';for(let r=b.x[0];r<=b.x[b.x.length-1];r+=50)d+=(d?'L':'M')+X(r).toFixed(1)+','+Y(f(b,r)).toFixed(1);
     s+=`<path d="${d}" fill="none" stroke="${b.col}" stroke-width="2.4" stroke-linejoin="round"/>`;const [pv,pr2]=peak(b);s+=`<circle cx="${X(pr2)}" cy="${Y(pv)}" r="5" fill="${b.col}" stroke="#14110e" stroke-width="2"/><text x="${X(pr2)}" y="${Y(pv)-9}" fill="#e8dcc4" font-size="10.5" text-anchor="middle">${pv} @ ${pr2}</text>`;
     const re=b.x[b.x.length-1];s+=`<text x="${Math.min(X(re)+4,W-pr-2)}" y="${Y(f(b,re))+4}" fill="#e8dcc4" font-size="10.5" text-anchor="${X(re)+70>W?'end':'start'}">${b.n.split(' ')[0]}</text>`}
    return s+`<line class="xh" x1="0" x2="0" y1="12" y2="${H-22}" stroke="#fff6" visibility="hidden"/><rect x="${pl}" y="0" width="${W-pl-pr}" height="${H}" fill="transparent"/></svg>`};
   box.innerHTML=chart('t',(b,r)=>b.T(r),60,10,'N·m','Torque (N·m)',b=>b.tk)+chart('p',(b,r)=>b.P(r),40,10,'kW','Power (kW)',b=>b.pk)+`<div class="tip" style="display:none"></div><div class="small" style="text-align:center">Engine speed (rpm)</div>`;
   const tip=box.querySelector('.tip');
   box.querySelectorAll('svg').forEach(svg=>{const mv=e=>{const bb=svg.getBoundingClientRect(),cx=(e.clientX-bb.left),r=Math.round((R0+(cx-pl)/(W-pl-pr)*(R1-R0))/50)*50;if(r<R0||r>R1)return;
     box.querySelectorAll('.xh').forEach(l=>{l.setAttribute('x1',X(r));l.setAttribute('x2',X(r));l.setAttribute('visibility','visible')});
     const rows=BIKES.filter(b=>on.has(b.k)).map(b=>r<b.x[0]||r>b.x[b.x.length-1]?`<div><i style="display:inline-block;width:9px;height:9px;background:${b.col};margin-right:5px"></i>${b.n}: (outside range)</div>`:`<div><i style="display:inline-block;width:9px;height:9px;background:${b.col};margin-right:5px"></i>${b.n}: <b>${b.T(r).toFixed(1)} N·m · ${b.P(r).toFixed(1)} kW</b></div>`).join('');
     tip.innerHTML=`<b>${r} rpm</b>${rows}`;tip.style.display='block';const bx=box.getBoundingClientRect();let tx=e.clientX-bx.left+14;if(tx+260>bx.width)tx=e.clientX-bx.left-270;tip.style.left=Math.max(0,tx)+'px';tip.style.top=(e.clientY-bx.top+10)+'px'};
    svg.addEventListener('pointermove',mv);svg.addEventListener('pointerleave',()=>{tip.style.display='none';box.querySelectorAll('.xh').forEach(l=>l.setAttribute('visibility','hidden'))})})};
  draw();const ro=new ResizeObserver(()=>draw());ro.observe(box);CLEAN.push(()=>ro.disconnect())}});

/* 13 engine lab */
SCENES.push({id:'lab',belt:3,mood:'happy',title:'Engine Lab (free play)',
 html:`<div class="wrap">${VIZ('Click parts to identify · drag rotate · right-drag pan · scroll zoom')}<div class="side">
 <div class="card"><b>Layout</b><div id="lb-lay" style="margin-top:6px"></div></div>
 <div class="card"><div id="lb-rpm"></div><div id="lb-ex"></div><div id="lb-mode" style="margin-top:6px"></div><div class="row" id="lb-tg" style="margin-top:6px"></div></div>
 <div class="card" id="lb-info"><h3>Tinker away</h3><p class="small">Pick a layout, switch to cutaway, and click any part to identify it. Pause, then scrub to study one moment.</p></div>
 </div></div>`,
 init(w){let key='single',M=null,th=0,rpm=120,mode='solid',ex=0,run=true,gas=true,liquid=false;
  const st=mkStage(w,{pos:[44,32,52],target:[0,8,0],auto:.4,onPick:hh=>{if(!hh)return;const i=PART_INFO[hh.part];if(i)$('#lb-info').innerHTML=`<h3>${i[0]}</h3><p>${i[1]}</p>`}});
  const build=k=>{key=k;if(!st)return;if(M){st.scene.remove(M.g);M.g.traverse(o=>o.geometry&&o.geometry.dispose());st.pick.length=0}M=new Multi(k);M.setMode(mode);M.setCooling(liquid?'liquid':'air');M.explode(ex);st.add(M.g,true);
   for(const u of M.units){u.fIn&&u.fIn.g.traverse(o=>o.visible=gas);u.fEx&&u.fEx.g.traverse(o=>o.visible=gas);u.burnOff=!gas}};
  $('#lb-lay').appendChild(chips(Object.keys(LAYOUTS).map(k=>({l:LAYOUTS[k].n.replace(' (flat)','').replace(' (L-twin)',''),v:k})),'single',build));
  $('#lb-rpm').appendChild(slider('Speed (slow motion)',0,600,120,10,v=>v===0?'paused':v+'°/s',v=>rpm=v));
  $('#lb-ex').appendChild(slider('Explode',0,1,0,.01,v=>Math.round(v*100)+'%',v=>{ex=v;M&&M.explode(v)}));
  $('#lb-mode').appendChild(chips([{l:'Solid',v:'solid'},{l:'X-ray',v:'xray'},{l:'Cutaway',v:'cut'}],'solid',m=>{mode=m;M&&M.setMode(m)}));
  const tg=$('#lb-tg');tg.appendChild(toggle('Gas + flame',true,v=>{gas=v;build(key)}));tg.appendChild(toggle('Liquid-cooled',false,v=>{liquid=v;M&&M.setCooling(v?'liquid':'air')}));tg.appendChild(toggle('Auto-spin',true,v=>{if(st)st.ctl.autoRotate=v}));
  build('single');TICKS.push(dt=>{th+=rpm*dt;M&&M.update(th,dt)})}});

/* 14 quiz + cheat sheet */
const CHEAT=`HOW ENGINES WORK: CHEAT SHEET (from Ustad's garage)
FOUR-STROKE  Intake → Compression → Power → Exhaust ("suck, squeeze, bang, blow")
             1 cycle = 720° = 2 crank turns; only 1 stroke in 4 makes work
CAMSHAFT     turns at ½ crank speed (cam sprocket has 2× the teeth); lobes open valves
OVERLAP      both valves slightly open near TDC: outgoing exhaust helps pull in the fresh charge
SPARK        fires before TDC (advance) so peak pressure lands ≈ 10–20° after TDC
             too much advance → knock/ping (end-gas self-ignites)
MIXTURE      stoichiometric petrol ≈ 14.7 : 1 air : fuel by mass
             rich (<14.7): more power up to a point, smoke, CO · lean (>14.7): hot, NOx
TWO-STROKE   ports instead of valves, power every turn; light and punchy, dirtier
COOLING      air (fins) · air-oil (Classic 350, 650 twins) · liquid (Himalayan 450): pump, radiator, thermostat, fan
OIL          sump → pump → filter → bearings / cams / piston jets → drains back
             wet sump (oil under the crank) vs dry sump (separate tank, scavenge pump)
BREATHING    air box → throttle body → intake port; tank → pump → injector; header → catalytic converter → muffler
LAYOUTS      single · parallel twin (360/270/180°) · V-twin (45°, 90°) · boxer · inline-3 · inline-4
             RE 650 twin: 270° crank, fires 270°/450° like a 90° V-twin
POWER        kW = N·m × rpm ÷ 9549  ·  hp = lb-ft × rpm ÷ 5252  ·  1 PS = 0.7355 kW
GEARS        low gear = more wheel torque, less speed; high gear = the reverse
RE NUMBERS   Classic 350: 349 cc, 72×85.8 mm, 20.2 bhp @ 6100, 27 N·m @ 4000
             Himalayan 450: 452 cc, 84×81.5 mm, 40 PS @ 8000, 40 N·m @ 5500
             Interceptor 650: 648 cc twin, 78×67.8 mm, ≈47 PS @ ≈7150, ≈52 N·m @ ≈5150`;
SCENES.push({id:'quiz',belt:3,mood:'happy',title:'Final inspection',
 html:`<div class="wrap" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><div class="side" id="qz"></div><div class="side"><div class="card" id="qz-res"><h3>Score 6/8 to earn the Ustad badge</h3><p class="small">Answer every question for your result.</p></div>
 <div class="card"><h3>Cheat sheet</h3><pre class="cheat" id="qz-cheat"></pre><button class="btn" id="qz-copy">📋 Copy cheat sheet</button></div>
 <div class="card small"><b>Sources:</b> Royal Enfield technical specification sheets (Classic 350 J-series), published Himalayan 450 and Interceptor 650 specification listings (e.g. Team-BHP, 1000PS, Smartprix), and Royal Enfield's 650 twin engine reveal (270° crank, balance shaft). Valve timing, gear ratios, the mixture/knock model and temperatures are illustrative. 3D rendering by three.js (MIT). Narration by Kokoro TTS.</div></div></div>`,
 init(w){$('#qz-cheat').textContent=CHEAT;$('#qz-copy').onclick=()=>{const done=()=>{toast('Cheat sheet copied!');react('Keep it in your toolbox.','happy')};
   if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(CHEAT).then(done,()=>{sel()});else sel();function sel(){const r=document.createRange();r.selectNodeContents($('#qz-cheat'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Selected: press Ctrl/Cmd+C')}};
  quiz($('#qz'),[
   {q:'How many crank revolutions does one four-stroke cycle take?',a:['One','Two','Four'],c:1,e:'Four strokes of 180° each = 720° = two full turns.'},
   {q:'What actually pushes the valves open?',a:['The piston','The camshaft lobes','Spring pressure'],c:1,e:'Cam lobes push the valves open; springs close them again.'},
   {q:'Relative to the crankshaft, the camshaft turns at…',a:['Half speed','The same speed','Double speed'],c:0,e:'Each valve opens once per cycle, which is two crank turns, so the cam turns at half speed.'},
   {q:'The chemically ideal (stoichiometric) air-fuel ratio for petrol is about…',a:['8 : 1','14.7 : 1','25 : 1'],c:1,e:'≈14.7 kg of air burns 1 kg of petrol completely.'},
   {q:'Why does the spark fire before top dead centre?',a:['To start the engine faster','The flame needs time, so peak pressure lands just after TDC','To cool the piston'],c:1,e:'Burning takes a few milliseconds. Starting early puts peak pressure where it pushes best, ≈15° after TDC.'},
   {q:'Which Royal Enfield here is liquid-cooled?',a:['Classic 350','Himalayan 450','Interceptor 650'],c:1,e:'The Sherpa 450 engine is liquid-cooled. The Classic 350 and 650 twins are air-oil cooled.'},
   {q:'An engine makes 40 N·m at 5500 rpm. Its power is about…',a:['23 kW','40 kW','220 kW'],c:0,e:'40 × 5500 ÷ 9549 ≈ 23 kW (≈31 PS).'},
   {q:'The Interceptor 650 parallel twin uses a 270° crank. That makes it fire…',a:['Evenly every 360°','At 270° then 450°, like a 90° V-twin','Both cylinders together'],c:1,e:'Uneven 270/450 firing gives the V-twin-like beat and better traction feel.'}],
   s=>{const pass=s>=6;if(pass){quizPassed=true;promote(3);bow()}$('#qz-res').innerHTML=`<h3>${s}/8 · ${pass?'🏅 Ustad badge earned!':'Almost there'}</h3><p>${pass?'You now know the heartbeat, the breathing, the blood and the family tree of engines. Shabash!':'Revisit the scenes using the dots at the top, then come back. The quiz resets when you return.'}</p>`;react(pass?'You are an Ustad now. My cap off to you!':'Good try. Revisit and come back stronger.',pass?'happy':'think')})}});

boot();
