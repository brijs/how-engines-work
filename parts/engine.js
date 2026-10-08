/* ===== core: utils, loop, navigation, narration, character ===== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEG=Math.PI/180;
const LIVE=[];   // stages: {tick(dt),destroy()}
const TICKS=[];  // per-scene frame callbacks, cleared on scene change
const CLEAN=[];  // per-scene cleanup callbacks
const SCENES=[];
const RANKS=[{n:'Apprentice',c:'#9aa0a8'},{n:'Mechanic',c:'#c9803a'},{n:'Senior Mechanic',c:'#d8dde3'},{n:'Ustad',c:'#ffcf4a'}];
let cur=-1,soundOn=true,muted=false,autoAdv=false,maxRank=0,quizPassed=false;
const visited=new Set();

function h(tag,attrs={},html=''){const e=document.createElement(tag);for(const k in attrs){if(k==='on')for(const ev in attrs.on)e.addEventListener(ev,attrs.on[ev]);else e.setAttribute(k,attrs[k])}if(html)e.innerHTML=html;return e}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2600)}
function react(t,mood='happy'){const e=$('#react');e.textContent='Ustad: '+t;e.classList.add('show');setMood(mood);clearTimeout(react.t);react.t=setTimeout(()=>{e.classList.remove('show');setMood('neutral')},4200)}
function fmt(v,d=1){return Number(v).toFixed(d)}

/* ---- frame loop ---- */
let lastT=performance.now();
function frame(t){const dt=Math.min(.05,(t-lastT)/1000);lastT=t;
 if(!document.hidden){for(const s of LIVE.slice())s.tick(dt);for(const f of TICKS.slice())f(dt,t/1000)}
 charTick(dt,t/1000);capTick();requestAnimationFrame(frame)}

/* ---- character (Ustad) ---- */
function charSVG(){return `<svg viewBox="0 0 100 110" role="img" aria-label="Ustad, a friendly mechanic with a cap and moustache">
<g id="uBody">
 <path d="M18 110 Q20 78 50 76 Q80 78 82 110Z" fill="#2f5d8a"/><path d="M38 78 L50 96 L62 78" fill="#e9e1d0"/>
 <rect x="30" y="86" width="40" height="24" rx="3" fill="#264d73"/><circle cx="36" cy="90" r="2" fill="#c9d3dd"/><circle cx="64" cy="90" r="2" fill="#c9d3dd"/>
 <g id="uSpanner" transform="translate(78,92) rotate(-30)"><rect x="-2" y="-16" width="4" height="22" rx="2" fill="#aab4bf"/><path d="M-6 -22 a6 6 0 1 0 12 0 l-3 0 l0 4 l-6 0 l0 -4z" fill="#aab4bf"/></g>
 <g id="uHead">
  <ellipse cx="50" cy="50" rx="22" ry="25" fill="#b97a4f"/>
  <ellipse cx="28" cy="52" rx="4" ry="6" fill="#a86d45"/><ellipse cx="72" cy="52" rx="4" ry="6" fill="#a86d45"/>
  <path d="M27 36 Q50 12 73 36 L76 38 Q50 30 24 38Z" fill="#3b3f46"/><path d="M26 37 Q50 26 74 37 Q82 39 86 43 Q60 36 26 40Z" fill="#2b2e33"/>
  <circle id="uBadge" cx="50" cy="27" r="4.2" fill="#9aa0a8" stroke="#111" stroke-width=".8"/>
  <path id="uBrowL" d="M36 42 Q41 39 46 42" stroke="#ddd" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path id="uBrowR" d="M54 42 Q59 39 64 42" stroke="#ddd" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <g id="uEyes"><ellipse cx="41" cy="48" rx="2.6" ry="3" fill="#1a1a1a"/><ellipse cx="59" cy="48" rx="2.6" ry="3" fill="#1a1a1a"/></g>
  <path d="M50 49 Q47 57 50 59" stroke="#8d5734" stroke-width="2" fill="none"/>
  <ellipse id="uMouth" cx="50" cy="66" rx="5" ry="1.2" fill="#5a1f1a"/>
  <path d="M32 62 Q40 56 50 60 Q60 56 68 62 Q60 64 50 62 Q40 64 32 62Z" fill="#e8e8e8"/>
 </g>
</g></svg>`}
let mood='neutral',blinkT=2,mouthLevel=0,bowT=0;
function setMood(m){mood=m;const L=$('#uBrowL'),R=$('#uBrowR');if(!L)return;
 const P={neutral:['M36 42 Q41 39 46 42','M54 42 Q59 39 64 42'],happy:['M36 41 Q41 37 46 41','M54 41 Q59 37 64 41'],think:['M36 43 Q41 42 46 41','M54 39 Q59 36 64 40'],alert:['M36 39 Q41 34 46 39','M54 39 Q59 34 64 39']}[m]||[];
 L.setAttribute('d',P[0]);R.setAttribute('d',P[1])}
function setBadge(){const b=$('#uBadge');if(b)b.setAttribute('fill',RANKS[maxRank].c)}
function bow(){bowT=1.2}
function charTick(dt,t){const H=$('#uHead'),B=$('#uBody');if(!H)return;
 blinkT-=dt;const e=$('#uEyes');if(blinkT<0){e.setAttribute('transform','translate(0,48) scale(1,.1) translate(0,-48)');if(blinkT<-.12){e.removeAttribute('transform');blinkT=2+Math.random()*3}}
 const bob=REDUCED?0:Math.sin(t*2)*1.2;let rot=0;if(bowT>0){bowT-=dt;rot=Math.sin((1.2-bowT)/1.2*Math.PI)*18}
 B.setAttribute('transform',`translate(0,${bob}) rotate(${rot} 50 100)`);
 let lv=0;if(!au.paused&&!muted){lv=analyser?rms():(.4+.4*Math.sin(t*18))}
 mouthLevel=lerp(mouthLevel,lv,.35);const m=$('#uMouth');m.setAttribute('ry',(1.2+mouthLevel*9).toFixed(2));m.setAttribute('rx',(5+mouthLevel*2).toFixed(2));
 if(mood==='happy'&&au.paused)m.setAttribute('ry','2.4');
 $('#uSpanner').setAttribute('transform',`translate(78,92) rotate(${-30+(mood==='alert'?Math.sin(t*10)*10:0)})`)}

/* ---- narration ---- */
const au=new Audio();au.preload='auto';
let actx=null,analyser=null,abuf=null;
function wireAudio(){if(actx)return;try{actx=new (window.AudioContext||window.webkitAudioContext)();const src=actx.createMediaElementSource(au);analyser=actx.createAnalyser();analyser.fftSize=512;src.connect(analyser);analyser.connect(actx.destination);abuf=new Uint8Array(analyser.fftSize)}catch(e){analyser=null}}
function rms(){analyser.getByteTimeDomainData(abuf);let s=0;for(const v of abuf){const x=(v-128)/128;s+=x*x}return clamp(Math.sqrt(s/abuf.length)*5,0,1)}
let capWords=[],capW=[];
function setCaption(id){const t=NARR[id]||'';const c=$('#cap');c.innerHTML='';capWords=[];capW=[];let tot=0;
 for(const w of t.split(/\s+/)){const s=h('span',{},w+' ');c.appendChild(s);capWords.push(s);tot+=w.length+1;capW.push(tot)}capW=capW.map(x=>x/tot)}
function capTick(){if(!capWords.length)return;let f=0;if(au.duration&&!isNaN(au.duration))f=au.currentTime/au.duration;else if(!soundOn||muted)f=1;
 for(let i=0;i<capWords.length;i++)capWords[i].classList.toggle('lit',capW[i]<=f+.001)}
function narrate(id){setCaption(id);$('#next').classList.remove('pulse');au.pause();
 if(soundOn&&AUDIO[id]){au.src=AUDIO[id];au.muted=muted;if(actx&&actx.state==='suspended')actx.resume();au.play().catch(()=>{});setMood('neutral')}
 else{au.removeAttribute('src');setTimeout(()=>$('#next').classList.add('pulse'),4000)}}
au.addEventListener('ended',()=>{$('#next').classList.add('pulse');setMood('happy');if(autoAdv&&cur<SCENES.length-1)setTimeout(()=>{if(au.ended)go(cur+1)},1500)});

/* ---- navigation ---- */
function rankOf(i){return SCENES[i].belt}
function go(i){i=clamp(i,0,SCENES.length-1);
 for(const s of LIVE.slice())s.destroy();LIVE.length=0;TICKS.length=0;for(const f of CLEAN.splice(0))try{f()}catch(e){}
 cur=i;visited.add(i);$('#react').classList.remove('show');clearTimeout(react.t);const sc=SCENES[i],root=$('#scene');root.scrollTop=0;
 root.innerHTML=`<div class="sc-title"><span class="tag">${i+1}/${SCENES.length} · ${RANKS[sc.belt].n}</span><h2>${sc.title}</h2></div>`+sc.html;
 const r=Math.min(sc.belt,quizPassed?3:2);if(r>maxRank){maxRank=r;toast('⭐ Promoted to '+RANKS[r].n+'!');bow();setBadge()}
 $('#rankName').textContent=RANKS[maxRank].n;
 $$('#dots button').forEach((b,j)=>{b.classList.toggle('on',j===i);b.classList.toggle('done',visited.has(j));b.setAttribute('aria-current',j===i?'step':'false')});
 $('#back').disabled=i===0;$('#next').textContent=i===SCENES.length-1?'Done ✓':'Next ▶';
 try{sc.init&&sc.init(root.querySelector('.wrap')||root)}catch(e){console.error(e)}
 narrate(sc.id);setMood(sc.mood||'neutral')}
function promote(r){if(r>maxRank){maxRank=r;$('#rankName').textContent=RANKS[r].n;toast('🏅 Promoted to '+RANKS[r].n+'!');bow();setBadge()}}

function boot(){
 $('#ustad').innerHTML=charSVG();
 SCENES.forEach((s,i)=>{const b=h('button',{'aria-label':`Scene ${i+1}: ${s.title}`,title:s.title});b.onclick=()=>go(i);$('#dots').appendChild(b)});
 $('#next').onclick=()=>{if(cur<SCENES.length-1)go(cur+1);else react('Great work. Come back to the Engine Lab any time!','happy')};
 $('#back').onclick=()=>go(cur-1);
 $('#bReplay').onclick=()=>narrate(SCENES[cur].id);
 $('#bStop').onclick=()=>{au.pause();au.currentTime=au.duration||0};
 $('#bMute').onclick=e=>{muted=!muted;au.muted=muted;e.currentTarget.textContent=muted?'🔇':'🔊';e.currentTarget.classList.toggle('on',muted)};
 $('#bAuto').onclick=e=>{autoAdv=!autoAdv;e.currentTarget.classList.toggle('on',autoAdv);toast(autoAdv?'Auto-advance on':'Auto-advance off')};
 $('#fxbtn').onclick=e=>{const on=document.body.classList.toggle('nofx');e.currentTarget.setAttribute('aria-pressed',String(!on))};
 const enter=s=>{soundOn=s;if(s)wireAudio();$('#intro').remove();go(0)};
 $('#goSound').onclick=()=>enter(true);$('#goSilent').onclick=()=>enter(false);
 addEventListener('keydown',e=>{if($('#intro'))return;const sc=SCENES[cur];if(sc&&sc.onKey&&sc.onKey(e)===true)return;
  if(e.target.closest&&e.target.closest('input,textarea,select'))return;
  if(e.key==='ArrowRight'&&!(sc&&sc.captureArrows))go(cur+1);if(e.key==='ArrowLeft'&&!(sc&&sc.captureArrows))go(cur-1)});
 requestAnimationFrame(frame)}

/* ---- widgets ---- */
function quiz(root,qs,onDone){let ans=0,score=0;root.classList.add('quiz');
 qs.forEach((q,qi)=>{const d=h('div',{class:'q card'},`<b>${qi+1}. ${q.q}</b>`);const o=h('div',{class:'opts'});
  q.a.forEach((a,ai)=>{const b=h('button',{},a);b.onclick=()=>{if(d.dataset.done)return;d.dataset.done=1;ans++;const ok=ai===q.c;if(ok)score++;
   b.classList.add(ok?'ok':'no');if(!ok)o.children[q.c].classList.add('ok');d.appendChild(h('div',{class:'ex'},(ok?'✔ ':'✘ ')+q.e));
   react(ok?['Correct!','Spot on.','Shabash!','Exactly right.'][qi%4]:'Not quite. Read the note.',ok?'happy':'think');if(ans===qs.length)onDone(score)};o.appendChild(b)});
  d.appendChild(o);root.appendChild(d)})}
function slider(label,min,max,val,step,fmtFn,on){const w=h('div');const l=h('label',{class:'sl'});const i=h('input',{type:'range',min,max,step,value:val,'aria-label':label});
 const upd=()=>{l.innerHTML=`${label}: <b>${fmtFn(+i.value)}</b>`;on&&on(+i.value)};i.addEventListener('input',upd);w.append(l,i);upd();w.input=i;w.set=v=>{i.value=v;upd()};return w}
function chips(opts,val,on,cls='chip'){const w=h('div',{class:'row',role:'group'});const bs=opts.map(o=>{const b=h('button',{class:'btn '+cls,'aria-pressed':String(o.v===val)},o.l);b.onclick=()=>{bs.forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});b.classList.add('on');b.setAttribute('aria-pressed','true');on(o.v)};if(o.v===val)b.classList.add('on');w.appendChild(b);return b});w.btns=bs;return w}
function toggle(label,val,on){const b=h('button',{class:'btn chip'+(val?' on':''),'aria-pressed':String(val)},label);b.onclick=()=>{val=!val;b.classList.toggle('on',val);b.setAttribute('aria-pressed',String(val));on(val)};return b}
function fit2d(cv,hgt){const d=Math.min(devicePixelRatio||1,2),w=cv.clientWidth||300;cv.width=w*d;cv.height=hgt*d;cv.style.height=hgt+'px';const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return{x,w,h:hgt}}
