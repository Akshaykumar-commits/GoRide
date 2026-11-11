// GoRide core: city map, routing, fares, ride flow (simulated drivers)
const $=id=>document.getElementById(id);
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rnd=rng(11),GX=10,GY=11,id=(i,j)=>j*GX+i,N=[],E=[];
for(let j=0;j<GY;j++)for(let i=0;i<GX;i++)N.push({x:10+i*96+(rnd()-.5)*34,y:26+j*84+(rnd()-.5)*34});
function add(a,b){const p=N[a],q=N[b],ja=a/GX|0,jb=b/GX|0,ia=a%GX,ib=b%GX;let k=0;if(ja===jb&&ja===3)k=2;else if((ja===jb&&(ja===1||ja===6))||(ia===ib&&(ia===2||ia===4)))k=1;
E.push({a,b,k,c:{x:(p.x+q.x)/2+(rnd()-.5)*20,y:(p.y+q.y)/2+(rnd()-.5)*20},len:Math.hypot(p.x-q.x,p.y-q.y)*1.06,tr:rnd()<.16?1.7:1})}
for(let j=0;j<GY;j++)for(let i=0;i<GX;i++){if(i<GX-1)add(id(i,j),id(i+1,j));if(j<GY-1)add(id(i,j),id(i,j+1));if(i<GX-1&&j<GY-1&&rnd()<.13)add(id(i,j),id(i+1,j+1))}
function conn(){const adj=N.map(()=>[]);E.forEach(e=>{if(!e.dead){adj[e.a].push(e.b);adj[e.b].push(e.a)}});const seen=new Set([0]),q=[0];while(q.length)for(const n of adj[q.pop()])if(!seen.has(n)){seen.add(n);q.push(n)}return seen.size===N.length}
E.forEach(e=>{if(!e.k&&rnd()<.16){e.dead=true;if(!conn())e.dead=false}});
const ADJ=N.map(()=>[]);E.forEach(e=>{if(!e.dead){ADJ[e.a].push({to:e.b,e});ADJ[e.b].push({to:e.a,e})}});
const cache={};
function pathTo(s,t){const key=s+"-"+t;if(cache[key])return cache[key];const dist=N.map(()=>1e9),prev=N.map(()=>null),done=new Set;dist[s]=0;
while(done.size<N.length){let u=-1;dist.forEach((d,n)=>{if(!done.has(n)&&(u<0||d<dist[u]))u=n});if(u<0||u===t)break;done.add(u);ADJ[u].forEach(({to,e})=>{const w=dist[u]+e.len*e.tr;if(w<dist[to]){dist[to]=w;prev[to]={u,e}}})}
const seq=[];for(let n=t;prev[n];n=prev[n].u)seq.unshift({n,e:prev[n].e,u:prev[n].u});let d=`M${N[s].x} ${N[s].y}`,len=0;seq.forEach(x=>{d+=`Q${x.e.c.x} ${x.e.c.y} ${N[x.n].x} ${N[x.n].y}`;len+=x.e.len});return cache[key]={d,len}}
const PL=[["Central Station",1,1],["City Mall",2,0],["Airport",6,7],["Tech Park",5,1],["University",2,3],["Govt Hospital",3,2],["Old Town Market",3,5],["Beach Road",6,2],["Bus Stand",0,5],["Lake View",5,4],["Stadium",1,6],["Metro Hub",4,5],["Railway Colony",8,1],["IT Park",9,3],["Temple Street",7,5],["Bus Depot",9,6],["Cricket Ground",7,8],["Harbour",8,9],["Orchard Mall",1,9],["Engineering College",4,10],["New Town",9,10],["Collectorate",0,10]].map((p,i)=>({i,n:p[0],nd:id(p[1],p[2]),x:N[id(p[1],p[2])].x,y:N[id(p[1],p[2])].y}));
const T=[{k:"bike",n:"Bike",e:"🏍️",b:20,r:6,c:"1 seat",w:2,v:"Honda Shine"},{k:"auto",n:"Auto",e:"🛺",b:30,r:9,c:"3 seats",w:3,v:"Bajaj RE"},{k:"mini",n:"Mini",e:"🚗",b:40,r:11,c:"4 seats",w:4,v:"Maruti Swift"},{k:"sedan",n:"Sedan",e:"🚕",b:60,r:15,c:"4 seats · AC",w:5,v:"Toyota Etios"},{k:"pool",n:"Pool",e:"👥",b:25,r:7,c:"Shared ride",w:6,v:"Hyundai Aura"}];
const NM=["Ramesh","Suresh","Anil","Kiran","Venkat","Srinivas","Ravi","Mahesh"],PAY=[["upi","UPI"],["card","Card"],["cash","Cash"],["wallet","Wallet"]];
const KM=.0115,R=n=>"₹"+n.toLocaleString("en-IN"),tp=()=>T.find(t=>t.k===S.type),hm=m=>new Date(Date.now()+m*6e4).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"});
let S={tab:"book",pk:null,from:0,to:2,type:"mini",pay:"upi",st:"pick",run:0,promo:"",tip:0,sg:[1,1,1.2,1.3][Math.random()*4|0]},D=null,QQ=null,H=[],W=1000;
try{H=JSON.parse(localStorage.getItem("goride-h")||"[]");W=+(localStorage.getItem("goride-w")||1000)}catch(e){}
function keep(){try{localStorage.setItem("goride-h",JSON.stringify(H.slice(0,30)));localStorage.setItem("goride-w",W)}catch(e){}}
function toast(m){const t=$("toast");t.textContent=m;t.style.display="block";clearTimeout(toast.k);toast.k=setTimeout(()=>t.style.display="none",2600)}
const rt=()=>pathTo(PL[S.from].nd,PL[S.to].nd);
function quote(t){const r=rt(),d=r.len*KM,full=Math.round((t.b+t.r*d)*1.05*S.sg);let c=0;if(S.promo==="GORIDE20")c=Math.min(Math.round(full*.2),60);if(S.promo==="WELCOME50"&&full>=100)c=50;return{t,d,full,c,pay:Math.max(full-c,20)}}
const QD=(i,j,u0,u1,v0,v1)=>{const p=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]].map(([a,b])=>N[id(a,b)]),f=(u,v)=>[(1-u)*(1-v)*p[0].x+u*(1-v)*p[1].x+u*v*p[2].x+(1-u)*v*p[3].x,(1-u)*(1-v)*p[0].y+u*(1-v)*p[1].y+u*v*p[2].y+(1-u)*v*p[3].y];return [f(u0,v0),f(u1,v0),f(u1,v1),f(u0,v1)].map(a=>a.map(n=>n.toFixed(1)).join(",")).join(" ")};
let AM=[];
function drawMap(){const BC=["#ddd9cf","#e2ded5","#d7d3c9"],pd=e=>`M${N[e.a].x} ${N[e.a].y}Q${e.c.x} ${e.c.y} ${N[e.b].x} ${N[e.b].y}`,live=E.filter(e=>!e.dead);
let h=`<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="640"><stop offset="0" stop-color="#22e6c6"/><stop offset="1" stop-color="#7c5cff"/></linearGradient><filter id="gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs><rect x="-200" y="-200" width="1400" height="1400" fill="#f1efe9"/>`;
for(let j=0;j<GY-1;j++)for(let i=0;i<GX-1;i++){h+=`<polygon points="${QD(i,j,.06,.94,.06,.94)}" fill="${rnd()<.11?"#cfe6c8":"#e8e4dc"}"/>`;
for(const a of[0,1])for(const b of[0,1])if(rnd()<.82)h+=`<polygon points="${QD(i,j,.13+a*.41,.13+a*.41+.33,.13+b*.41,.13+b*.41+.33)}" fill="${BC[rnd()*3|0]}"/>`}
h+=`<path d="M-30 372C130 300 230 440 360 390S530 330 640 410S800 480 940 400" fill="none" stroke="#a9d3ec" stroke-width="40" stroke-linecap="round"/><path d="M-30 372C130 300 230 440 360 390S530 330 640 410S800 480 940 400" fill="none" stroke="#94c5e6" stroke-width="3" opacity=".7" stroke-linecap="round"/>`;
const W2=[[10,12,15],[7,9,12],[5,7,9]];live.forEach(e=>h+=`<path d="${pd(e)}" fill="none" stroke="${["#d4d7dc","#c7cbd1","#e2a82c"][e.k]}" stroke-width="${[10,13,16][e.k]}" stroke-linecap="round"/>`);
live.forEach(e=>h+=`<path d="${pd(e)}" fill="none" stroke="${e.tr>1?"#f0a097":["#fff","#fff","#ffd666"][e.k]}" stroke-width="${[6,9,11][e.k]}" stroke-linecap="round"/>`);
h+=`<g id="rl" fill="none" stroke-linecap="round" stroke-linejoin="round"><path id="rc" stroke="#fff" stroke-width="11"/><path id="rt" stroke="#111" stroke-width="5"/><path id="rf" stroke="none"/></g><g id="amb"></g><g id="mk"></g><g id="car" style="display:none"><g id="cr"><path d="M0-25L9-12H-9Z" fill="#111"/></g><circle r="15" fill="#fff" stroke="#111" stroke-width="2.5"/><text id="ce" text-anchor="middle" dy="6" font-size="17">🚗</text></g>`;
$("map").innerHTML=h;
AM=Array.from({length:7},()=>({n:rnd()*N.length|0}));$("amb").innerHTML=AM.map((a,i)=>`<g class="amb" id="a${i}" style="transform:translate(${N[a.n].x}px,${N[a.n].y}px)"><rect x="-4" y="-6" width="8" height="12" rx="2.5" fill="#111" opacity=".7"/></g>`).join("")}
setInterval(()=>AM.forEach((a,i)=>{const o=ADJ[a.n][rnd()*ADJ[a.n].length|0];a.n=o.to;const g=$("a"+i);if(g)g.style.transform=`translate(${N[a.n].x}px,${N[a.n].y}px)`}),2600);
function marks(){$("mk").innerHTML=PL.map(p=>{const f=p.i===S.from,t=p.i===S.to,on=f||t;return `<g data-p="${p.i}" style="cursor:pointer">${f&&S.st==="find"?`<circle class="pulse" cx="${p.x}" cy="${p.y}" r="20"/>`:""}${t?`<rect x="${p.x-8}" y="${p.y-8}" width="16" height="16" fill="#111" stroke="#fff" stroke-width="3"/><rect x="${p.x-3}" y="${p.y-3}" width="6" height="6" fill="#fff"/>`:`<circle cx="${p.x}" cy="${p.y}" r="${f?9:4.5}" fill="${f?"#111":"#8a8a8a"}" stroke="#fff" stroke-width="${f?3:2}"/>${f?`<circle cx="${p.x}" cy="${p.y}" r="3" fill="#fff"/>`:""}`}<text x="${p.x}" y="${p.y-14}" text-anchor="middle" font-size="${on?12:10.5}" font-weight="${on?700:500}" fill="${on?"#111":"#666"}" stroke="#f1efe9" stroke-width="3.5" paint-order="stroke">${p.n}</text></g>`}).join("")}
function setD(d){["rc","rt","rf"].forEach(i=>$(i).setAttribute("d",d));$("rf").setAttribute("class",d?"flow":"")}
function preview(){setD(S.from===S.to?"":rt().d);$("car").style.display="none";marks()}
function go(d,dur,tick,done){setD(d);const p0=$("rt"),L=p0.getTotalLength(),rid=++S.run,t0=performance.now();$("car").style.display="";marks();
(function f(n){if(rid!==S.run)return;const t=Math.min(1,(n-t0)/dur),p=p0.getPointAtLength(t*L),q=p0.getPointAtLength(Math.min(L,t*L+4));$("car").setAttribute("transform",`translate(${p.x} ${p.y})`);$("cr").setAttribute("transform",`rotate(${Math.atan2(q.y-p.y,q.x-p.x)*57.3+90})`);tick&&tick(t);if(t<1)requestAnimationFrame(f);else done&&done()})(t0)}
const dc=()=>`<div class="drv"><div class="av">${D.n[0]}</div><div style="flex:1"><b>${D.n}</b> ★ ${D.r}<br><small>${D.v}</small></div><span class="plate">${D.p}</span></div><div class="row" style="margin-top:0"><button class="ghost" data-a="call">📞 Call</button><button class="ghost" data-a="chat">💬 Message</button></div>`;
function vPick(){const a=PL[S.from],b=PL[S.to],ok=S.from!==S.to,cur=quote(tp());
return `<h2>Where to?</h2><div class="rt2"><button class="r" data-pk="from"><span class="dot"></span><div><small>Pickup</small><b>${a.n}</b></div></button><button class="r" data-pk="to"><span class="dot d"></span><div><small>Drop</small><b>${b.n}</b></div></button><button class="swap" data-a="swap" aria-label="Swap pickup and drop">⇅</button></div>${typeof QA==="function"?QA():""}
${S.sg>1?`<p class="warn">Fares are slightly higher than usual due to high demand.</p>`:""}
${T.map(x=>{const q=quote(x);return `<button class="opt" data-ty="${x.k}" aria-pressed="${x.k===S.type}"><span>${x.e}</span><div><b>${x.n}</b><small>${ok?`${x.w} min away · ${hm(x.w+q.d*3.5)} drop · ${x.c}`:"Choose different places"}</small></div><div class="pr"><b>${ok?R(q.pay):"–"}</b>${ok&&q.c?`<s>${R(q.full)}</s>`:""}</div></button>`}).join("")}
<div class="row"><input id="pc" placeholder="Apply coupon (try GORIDE20)" value="${S.promo}" aria-label="Coupon code"><button class="sm" data-a="promo">Apply</button></div>
<div class="seg">${PAY.map(p=>`<button data-pay="${p[0]}" aria-pressed="${S.pay===p[0]}">${p[1]}</button>`).join("")}</div>
<button class="cta" data-a="book"${ok?"":" disabled"}>${ok?`${S.sched?"Schedule":"Book"} ${tp().n} · ${R(cur.pay)}`:"Pick different places"}</button>`}
const vFind=()=>`<h2>Looking for nearby drivers</h2><p class="sub">Finding a ${tp().n} near ${PL[S.from].n}</p><div class="ind"><i></i></div><button class="ghost" data-a="cancel">Cancel</button>`;
const vArr=()=>`<h2 id="eta">Driver is on the way</h2><div class="bar"><i id="pg"></i></div>${dc()}<div class="pin"><small>Start your trip with this PIN</small><div class="otpb">${[...D.o].map(c=>`<b>${c}</b>`).join("")}</div></div><button class="ghost cx" data-a="cancel">Cancel ride</button>`;
const vOtp=()=>`<h2>Your driver has arrived</h2>${dc()}<label for="otp"><small>Enter the 4-digit PIN from your driver card</small></label><input id="otp" inputmode="numeric" maxlength="4" autocomplete="off" style="margin-top:6px;text-align:center;font-size:22px;letter-spacing:.3em"><div class="err" id="oe"></div><button class="cta" style="margin-top:0" data-a="start">Start trip</button><button class="ghost cx" data-a="cancel">Cancel ride</button>`;
const vTrip=()=>`<h2>Heading to ${PL[S.to].n}</h2><div class="bar"><i id="pg"></i></div><p class="sub"><span id="rm">–</span> km left · Arrive by ${hm(QQ.d*3.5)}</p>${dc()}<div class="rowl"><span>Fare</span><b id="fm">${R(0)}</b></div><div class="row"><button class="ghost" data-a="share">Share trip</button><button class="ghost cx" data-a="sos">Safety</button></div>`;
function vDone(){const q=QQ,r=(H[0]||{}).rating||0;
return `<div class="tick">✓</div><h2 style="text-align:center">Ride completed</h2><div class="rc"><span>Base fare</span><span>${R(q.t.b)}</span><span>Distance (${q.d.toFixed(1)} km)</span><span>${R(Math.round(q.t.r*q.d))}</span><span>Taxes and fees</span><span>${R(q.full-q.t.b-Math.round(q.t.r*q.d))}</span>${q.c?`<span class="ok">Coupon ${S.promo}</span><span class="ok">−${R(q.c)}</span>`:""}${S.tip?`<span>Tip</span><span>${R(S.tip)}</span>`:""}<span class="t">Total</span><span class="t">${R(q.pay+S.tip)}</span></div>
<small>Paid with ${PAY.find(p=>p[0]===S.pay)[1]}</small><div class="seg">${[0,10,20,50].map(v=>`<button data-tip="${v}" aria-pressed="${S.tip===v}">${v?"Tip "+R(v):"No tip"}</button>`).join("")}</div>
<p style="text-align:center;margin:12px 0 0">How was your ride with ${D.n}?</p><div class="stars">${[1,2,3,4,5].map(n=>`<button data-n="${n}" class="${n<=r?"on":""}" aria-label="${n} star">★</button>`).join("")}</div><div class="row"><button class="ghost" data-a="rcpt">🧾 Receipt</button><button class="ghost" data-a="rep">⚠️ Report issue</button></div><button class="cta" style="margin-top:4px" data-a="again">Done</button>`}
const vHist=()=>`<h2>Your rides</h2>${typeof UPC==="function"?UPC():""}`+(H.length?H.map((h,i)=>`<div class="h" style="flex-wrap:wrap"><div><b>${h.e} ${h.a} → ${h.b}</b><br><small>${h.d} · ${h.k} km · ${h.p} · ${h.rating?"★ "+h.rating:"not rated"}</small></div><b>${R(h.f)}</b><div class="row" style="width:100%;margin-top:0"><button class="ghost" style="padding:8px" data-re="${i}">↻ Book again</button><button class="ghost" style="padding:8px" data-rc="${i}">🧾 Receipt</button></div></div>`).join(""):`<p>No rides yet.</p><button class="cta" data-t="book">Book your first ride</button>`);
function vPlaces(q){const s=(q||"").toLowerCase();return PL.filter(p=>p.n.toLowerCase().includes(s)).map(p=>`<button class="pl" data-pl="${p.i}"><span class="dot${S.pk==="to"?" d":""}"></span><b>${p.n}</b></button>`).join("")||"<p>No places found.</p>"}
const vPk=()=>`<h2>${S.pk==="from"?"Pickup":"Drop"} location</h2><input id="ps" placeholder="Search places" aria-label="Search places" autocomplete="off"><div id="pls">${vPlaces("")}</div><button class="ghost" data-a="back">Back</button>`;
function render(){$("wal").textContent="Wallet "+R(W);$("amb").style.display=S.st==="pick"||S.st==="find"?"":"none";document.querySelectorAll("nav button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.t===S.tab));
$("panel").innerHTML=`<div class="grab"></div><div class="v">${S.tab==="hist"?vHist():S.tab==="acct"&&typeof vAcct==="function"?vAcct():S.pk?vPk():({pick:vPick,find:vFind,arr:vArr,otp:vOtp,trip:vTrip,done:vDone})[S.st]()}</div>`;if(S.pk){const i=$("ps");i&&i.focus()}}
function assign(){const t=tp(),a=PL[S.from];let s;do{s=PL[Math.random()*PL.length|0]}while(s.i===a.i);
D={n:NM[Math.random()*NM.length|0],r:(4.5+Math.random()*.4).toFixed(1),v:t.v,p:`AP 39 ${"ABCDEFGH"[Math.random()*8|0]}${"JKLMNPQR"[Math.random()*8|0]} ${1000+(Math.random()*9000|0)}`,o:String(1000+(Math.random()*9000|0))};
S.st="arr";$("ce").textContent=t.e;render();const r=pathTo(s.nd,a.nd),dist=Math.max(r.len*KM,.6);
go(r.d,4500+dist*500,p=>{const e=$("eta");if(e){e.textContent=`Arriving in ${Math.max(1,Math.ceil((1-p)*Math.max(2,dist*2.4)))} min`;$("pg").style.width=p*100+"%"}},()=>{S.st="otp";render()})}
function start(){if($("otp").value!==D.o){$("oe").textContent="That OTP doesn’t match the one on your driver card.";return}
const a=PL[S.from],b=PL[S.to];S.st="trip";render();
go(rt().d,10000,p=>{const g=$("pg");if(g){g.style.width=p*100+"%";$("fm").textContent=R(Math.round(QQ.pay*p));$("rm").textContent=(QQ.d*(1-p)).toFixed(1)}},()=>{
H.unshift({a:a.n,b:b.n,e:QQ.t.e,k:QQ.d.toFixed(1),f:QQ.pay,p:PAY.find(x=>x[0]===S.pay)[1],d:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"}),rating:0});
if(S.pay==="wallet")W-=QQ.pay;keep();S.st="done";S.tip=0;render()})}
function reset(m){S.run++;S.st="pick";S.pk=null;preview();render();if(m)toast(m)}
function book(){QQ=quote(tp());if(S.pay==="wallet"&&W<QQ.pay){toast("Wallet balance is too low. Pick another way to pay.");render();return}S.st="find";marks();render();const x=++S.run;setTimeout(()=>{if(S.run===x&&S.st==="find")assign()},2400)}
document.addEventListener("click",e=>{const t=e.target.closest("[data-a],[data-ty],[data-pay],[data-t],[data-p],[data-n],[data-pk],[data-pl],[data-tip]");if(!t)return;const d=t.dataset;
if(d.t){S.tab=d.t;S.pk=null;render()}
else if(d.p!==undefined){if(S.st==="pick"&&S.tab==="book"){S.to=+d.p;if(S.to===S.from)S.from=(S.to+1)%PL.length;S.pk=null;preview();render()}}
else if(d.pk){S.pk=d.pk;render()}
else if(d.pl!==undefined){S[S.pk]=+d.pl;if(S.from===S.to)S[S.pk==="from"?"to":"from"]=(+d.pl+1)%PL.length;S.pk=null;preview();render()}
else if(d.ty){S.type=d.ty;render()}
else if(d.pay){S.pay=d.pay;render()}
else if(d.tip!==undefined){const n=+d.tip;if(S.pay==="wallet")W-=n-S.tip;S.tip=n;H[0].f=QQ.pay+n;keep();render()}
else if(d.n){H[0].rating=+d.n;keep();render()}
else switch(d.a){
case"book":book();break;
case"swap":[S.from,S.to]=[S.to,S.from];preview();render();break;
case"back":S.pk=null;render();break;
case"promo":{const c=$("pc").value.trim().toUpperCase();if(c===""){S.promo="";render();break}if(c==="GORIDE20"||c==="WELCOME50"){S.promo=c;toast(c==="GORIDE20"?"GORIDE20 applied: 20% off, up to ₹60":"WELCOME50 applied: ₹50 off rides above ₹100")}else toast("That promo code isn’t valid.");render();break}
case"cancel":reset("Ride cancelled");break;
case"start":start();break;
case"again":S.tip=0;reset();break;
case"call":toast("Calling "+D.n+"… (demo)");break;
case"chat":toast("Messaging is a demo feature here.");break;
case"share":toast("Trip link copied (demo)");break;
case"sos":toast("Emergency contacts alerted with your live location (demo)");break;
case"t3":{const m=$("mw").classList.toggle("t3");t.setAttribute("aria-pressed",m);break}}});
document.addEventListener("input",e=>{if(e.target.id==="ps")$("pls").innerHTML=vPlaces(e.target.value)});
drawMap();preview();render();
