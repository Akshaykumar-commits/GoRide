// GoRide accounts: login/signup, profile, saved places, wallet, contacts, offers, help, schedule, safety
// GoRide accounts v2: login/signup, profile, saved places, wallet, contacts, offers, help, languages.
// Works with the Node backend; if no backend is reachable (e.g. GitHub Pages) it falls back to browser-only accounts.
(()=>{
const API=window.GORIDE_API||(location.protocol==='file:'?'http://localhost:3000':'');
const $=id=>document.getElementById(id),LG=['en','te','hi'],LN=['English','తెలుగు','हिन्दी'];
let tok=localStorage.getItem('gr-t'),me=null,lang=localStorage.getItem('gr-l')||'en',mode='login',pg='',off=false;
const t=k=>(L[lang]||L.en)[k]||L.en[k]||k,li=()=>LG.indexOf(lang)-1;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const EM=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ---------- browser-only fallback backend ----------
const hs=async s=>{try{return[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('goride:'+s)))].map(x=>x.toString(16).padStart(2,'0')).join('')}catch{return btoa(unescape(encodeURIComponent(s)))}};
const pub=u=>{const{pw,...r}=u;return r};
async function loc(m,p,b){b=b||{};const Us=JSON.parse(localStorage.getItem('gr-users')||'{}'),sv=()=>localStorage.setItem('gr-users',JSON.stringify(Us)),e=String(b.email||'').trim().toLowerCase();
 if(p==='/signup'){if(!EM.test(e)||String(b.password||'').length<8||!String(b.name||'').trim())throw new Error('Enter a name, valid email and a password of 8+ characters.');if(Us[e])throw new Error('Email already registered.');
  Us[e]={name:b.name.trim().slice(0,60),email:e,phone:'',lang:'en',settings:{notify:true,sound:true},extra:{},wallet:1000,rides:[],pw:await hs(b.password)};sv();return{token:'local:'+e,user:pub(Us[e])}}
 if(p==='/login'){const u=Us[e];if(!u||u.pw!==await hs(b.password||''))throw new Error('Wrong email or password.');return{token:'local:'+e,user:pub(u)}}
 const u=Us[(tok||'').slice(6)];if(!u){const x=new Error('Please log in again.');x.auth=1;throw x}
 if(p==='/me'&&m==='GET')return{user:pub(u)};
 if(p==='/me'&&m==='PUT'){if(typeof b.name==='string'&&b.name.trim())u.name=b.name.trim().slice(0,60);if(typeof b.phone==='string'){if(b.phone&&!/^\d{10}$/.test(b.phone))throw new Error('Phone must be 10 digits.');u.phone=b.phone}
  if(LG.includes(b.lang))u.lang=b.lang;if(b.settings)u.settings={notify:!!b.settings.notify,sound:!!b.settings.sound};if(b.extra)u.extra=b.extra;sv();return{user:pub(u)}}
 if(p==='/password'){if(u.pw!==await hs(b.old||''))throw new Error('Current password is wrong.');if(String(b.new||'').length<8)throw new Error('New password needs 8+ characters.');u.pw=await hs(b.new);sv();return{ok:true}}
 if(p==='/state'){if(Number.isFinite(+b.wallet))u.wallet=Math.max(0,Math.round(b.wallet));if(Array.isArray(b.rides))u.rides=b.rides.slice(0,30);sv();return{ok:true}}
 if(p==='/me'&&m==='DELETE'){delete Us[u.email];sv();return{ok:true}}throw new Error('Not found')}
async function api(m,p,b){
 if(off||(tok||'').startsWith('local:'))return loc(m,p,b);
 try{const r=await fetch(API+'/api'+p,{method:m,headers:{'Content-Type':'application/json',...(tok?{Authorization:'Bearer '+tok}:{})},body:b?JSON.stringify(b):undefined});
  if(r.status===404||r.status===405||r.status>=500)throw new TypeError('no server');
  const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||'Error');e.auth=r.status===401&&p!=='/login'&&p!=='/password';throw e}return j}
 catch(e){if(e instanceof TypeError&&(p==='/login'||p==='/signup')){off=true;return loc(m,p,b)}throw e}}
// ---------- styles ----------
const st=document.createElement('style');st.textContent='#auth{position:fixed;inset:0;z-index:50;background:#f1efe9;display:grid;place-items:center;padding:16px;overflow:auto}#auth .card{width:100%;max-width:380px;background:#fff;border-radius:18px;padding:22px;box-shadow:0 4px 24px rgba(0,0,0,.18)}#auth input,.acv input,.acv select{margin-top:8px}select{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:#fff}.acv .lbl{display:block;margin-top:12px}.link{background:none;border:0;width:100%;margin-top:12px;color:#1a73e8;font-weight:600}.acv details{padding:10px 0;border-bottom:1px solid var(--line)}.acv summary{font-weight:600;cursor:pointer}.cp{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;margin-top:8px;border-radius:12px;background:var(--bg)}.cp b{letter-spacing:.05em}.stt{display:flex;gap:8px;margin-top:10px}.stt div{flex:1;background:var(--bg);border-radius:12px;padding:10px;text-align:center}.stt b{display:block;font-size:18px}';document.head.appendChild(st);
// ---------- views ----------
const X=()=>me.extra||(me.extra={}),RT=[['bike','Bike'],['auto','Auto'],['mini','Mini'],['sedan','Sedan'],['pool','Pool']],PY=[['upi','UPI'],['card','Card'],['cash','Cash'],['wallet','Wallet']];
const langBar=()=>`<div class="seg">${LG.map((x,i)=>`<button data-lg="${x}" aria-pressed="${lang===x}">${LN[i]}</button>`).join('')}</div>`;
function overlay(){let a=$('auth');if(me){a&&a.remove();return}if(!a){a=document.createElement('div');a.id='auth';document.body.appendChild(a)}
 a.innerHTML=`<div class="card"><div class="logo" style="font-size:28px">Go<b>Ride</b></div><p class="sub">${t('tag')}</p>${langBar()}<h2 style="margin-top:16px">${t(mode)}</h2>${mode==='signup'?`<input id="an" placeholder="${t('name')}" autocomplete="name">`:''}<input id="ae" type="email" placeholder="${t('email')}" autocomplete="email"><input id="ap" type="password" placeholder="${t('pw')}" autocomplete="${mode==='login'?'current-password':'new-password'}"><div class="err" id="aerr"></div><button class="cta" style="margin-top:4px" data-ac="go">${t(mode)}</button><button class="link" data-ac="sw">${t(mode==='login'?'sw1':'sw2')}</button></div>`}
const rows=[['profile','👤'],['places','📍'],['wallet','💳'],['contacts','🆘'],['offers','🎁'],['prefs','⚙️'],['help','❓'],['sec','🔒']];
function page(){const x=X(),s=me.settings||{},bk=`<button class="link" data-pg="" style="text-align:left;margin:0 0 6px">← ${t('acct')}</button>`,tot=H.reduce((a,h)=>a+(+h.f||0),0);
 const inp=(id,v,ph,ex='')=>`<input id="${id}" value="${esc(v)}" placeholder="${ph}" ${ex}>`,sel=(id,v)=>`<select id="${id}"><option value="">${t('none')}</option>${PL.map(p=>`<option value="${p.i}"${v===p.i?' selected':''}>${p.n}</option>`).join('')}</select>`;
 if(pg==='profile')return bk+`<h2>${t('profile')}</h2><label class="lbl"><small>${t('name')}</small></label>${inp('fn',me.name,'')}<label class="lbl"><small>${t('email')}</small></label><input value="${esc(me.email)}" disabled><label class="lbl"><small>${t('phone')}</small></label>${inp('fp',me.phone||'','','inputmode="numeric" maxlength="10"')}<div class="stt"><div><b>${H.length}</b><small>${t('stats')}</small></div><div><b>${R(tot)}</b><small>${t('spent')}</small></div></div><div class="err" id="ae1"></div><button class="cta" style="margin-top:4px" data-ac="save">${t('save')}</button>`;
 if(pg==='places')return bk+`<h2>${t('places')}</h2><label class="lbl"><small>🏠 ${t('home')}</small></label>${sel('sh',x.home)}<label class="lbl"><small>💼 ${t('work')}</small></label>${sel('sw',x.work)}<button class="cta" data-ac="sp">${t('save')}</button>`;
 if(pg==='wallet')return bk+`<h2>${t('wallet')}</h2><div class="pin"><small>${t('bal')}</small><h2 style="margin:4px 0 0">${R(W)}</h2></div><div class="seg">${[100,500,1000].map(v=>`<button data-top="${v}">+ ${R(v)}</button>`).join('')}</div><label class="lbl"><small>${t('defpay')}</small></label><div class="seg">${PY.map(p=>`<button data-dp="${p[0]}" aria-pressed="${(x.pay||'upi')===p[0]}">${p[1]}</button>`).join('')}</div>`;
 if(pg==='contacts'){const c=x.contacts||[];return bk+`<h2>${t('contacts')}</h2>${c.map((k,i)=>`<div class="cp"><span><b style="letter-spacing:0">${esc(k.n)}</b><br><small>${esc(k.p)}</small></span><button class="sm" data-rm="${i}" style="padding:8px 12px">✕</button></div>`).join('')||`<p class="sub">${t('max3')}</p>`}${c.length<3?`<input id="cn" placeholder="${t('cname')}"><input id="cp" placeholder="${t('phone')}" inputmode="numeric" maxlength="10"><div class="err" id="ae1"></div><button class="cta" style="margin-top:4px" data-ac="ac">${t('addc')}</button>`:''}`}
 if(pg==='offers')return bk+`<h2>${t('offers')}</h2><small>${t('cpn')}</small>${[['GORIDE20','20% off, up to ₹60'],['WELCOME50','₹50 off rides above ₹100']].map(c=>`<div class="cp"><span><b>${c[0]}</b><br><small>${c[1]}</small></span><button class="sm" data-cp="${c[0]}" style="padding:8px 14px">${t('apply')}</button></div>`).join('')}<label class="lbl"><small>${t('ref')}</small></label><div class="cp"><b>${x.ref}</b><button class="sm" data-ac="cr" style="padding:8px 14px">${t('copy')}</button></div><p class="sub" style="margin-top:8px">${t('refd')}</p>`;
 if(pg==='prefs')return bk+`<h2>${t('prefs')}</h2><label class="lbl"><small>${t('lang')}</small></label>${langBar()}<label class="lbl"><small>${t('defride')}</small></label><div class="seg">${RT.map(r=>`<button data-dr="${r[0]}" aria-pressed="${(x.ride||'mini')===r[0]}">${r[1]}</button>`).join('')}</div><div class="seg"><button data-tg="notify" aria-pressed="${!!s.notify}">${t('notify')}: ${t(s.notify?'on':'off')}</button><button data-tg="sound" aria-pressed="${!!s.sound}">${t('sound')}: ${t(s.sound?'on':'off')}</button></div>`;
 if(pg==='help')return bk+`<h2>${t('help')}</h2><p class="sub">${t('faq')}</p>${[['How is my fare calculated?','Base fare + distance × per-km rate + 5% fees, with higher prices at busy times. Coupons are applied after.'],['How do I cancel a ride?','Tap Cancel ride any time before the trip starts. '+t('cancelled')],['My driver did not arrive','Cancel and book again, or contact support below with your ride details.'],['How do I start my trip?','Enter the 4-digit PIN shown on your driver card when the driver arrives.'],['Lost an item in the ride?','Open Activity, find the ride, then contact support with the driver name and plate.']].map(f=>`<details><summary>${f[0]}</summary><p class="sub">${f[1]}</p></details>`).join('')}<a class="ghost" style="display:block;text-align:center;text-decoration:none;color:inherit" href="mailto:support@goride.example">✉️ ${t('contact')}</a>`;
 if(pg==='sec')return bk+`<h2>${t('sec')}</h2><label class="lbl"><small>${t('chpw')}</small></label><input id="po" type="password" placeholder="${t('old')}" autocomplete="current-password"><input id="pn" type="password" placeholder="${t('nw')}" autocomplete="new-password"><div class="err" id="ae2"></div><button class="ghost" data-ac="pw">${t('chpw')}</button><button class="ghost" data-ac="dl">${t('dl')}</button><button class="ghost cx" data-ac="del">${t('del')}</button>`;
 return `<div class="drv" style="border-top:0"><div class="av">${esc(me.name[0]||'?').toUpperCase()}</div><div style="flex:1"><b>${esc(me.name)}</b><br><small>${esc(me.email)}</small></div></div>${rows.map(r=>`<button class="pl" data-pg="${r[0]}"><span style="font-size:22px">${r[1]}</span><b>${t(r[0])}</b></button>`).join('')}<button class="ghost" data-ac="out">${t('out')}</button>`}
// ---------- wiring into the app ----------
function setUser(u){me=u;lang=u.lang||lang;localStorage.setItem('gr-l',lang);if(!me.extra)me.extra={};if(!me.extra.ref)me.extra.ref='GO'+Math.random().toString(36).slice(2,7).toUpperCase();W=u.wallet;H=u.rides||[];S.type=me.extra.ride||S.type;S.pay=me.extra.pay||S.pay;pg='';overlay();nav();render()}
function logout(){tok=null;me=null;off=false;localStorage.removeItem('gr-t');S.tab='book';S.st='pick';S.run++;H=[];W=1000;overlay();render()}
function nav(){}
function tr(){const i=li(),b=$('acb');if(b)b.textContent=t('acct');const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),hit=[];let n;while(n=w.nextNode())hit.push(n);
 hit.forEach(n=>{if(n.parentNode.closest('#auth,.acv,script,style'))return;const o=n.__o||n.nodeValue.trim();if(!U[o]&&!n.__o)return;n.__o=o;n.nodeValue=i<0?o:U[o][i]});
 document.querySelectorAll('input[placeholder="Search places"]').forEach(x=>x.placeholder=i<0?'Search places':U['Search places'][i]);document.documentElement.lang=lang;if($('lg'))$('lg').value=lang}
const R0=render;render=function(){R0();tr();notif()};
const K0=keep;keep=function(){K0();if(me)api('PUT','/state',{wallet:W,rides:H.slice(0,30)}).catch(()=>{})};
async function put(o,id){try{const r=await api('PUT','/me',o);me=r.user;lang=me.lang||lang;localStorage.setItem('gr-l',lang);render();return true}catch(e){if(e.auth)return logout();const z=$(id);if(z)z.textContent=e.message;return false}}
const ex=()=>put({extra:me.extra},'ae1');
document.addEventListener('click',async e=>{const b=e.target.closest('[data-lg],[data-tg],[data-ac],[data-pg],[data-sp],[data-top],[data-dp],[data-dr],[data-rm],[data-cp],[data-qa],[data-re],[data-rc],[data-sc],[data-x],[data-a="book"],[data-a="share"],[data-a="sos"],[data-a="rcpt"],[data-a="rep"]');if(!b)return;if(b.dataset.a==='book'&&!S.sched)return;e.stopPropagation();const d=b.dataset,x=me&&X();
 if(d.qa)qa(d.qa);else if(d.re!==undefined)rebook(+d.re);else if(d.rc!==undefined)receipt(H[+d.rc]);else if(d.sc!==undefined){x.sched.splice(+d.sc,1);ex()}else if(d.x){const m=$('sosm');m&&m.remove();if(d.x==='sosadd'){S.tab='acct';pg='contacts';render()}}else if(d.a==='book')schedule();else if(d.a==='share')share();else if(d.a==='sos')sos();else if(d.a==='rcpt')receipt(H[0]);else if(d.a==='rep')report();else if(d.lg){lang=d.lg;localStorage.setItem('gr-l',lang);me?put({lang},'ae1'):overlay();render()}
 else if(d.sp!==undefined){if(S.st==='pick'){S.to=+d.sp;if(S.to===S.from)S.from=(S.to+1)%PL.length;preview();render()}}
 else if(d.pg!==undefined){if(d.go){S.tab='acct';S.pk=null}pg=d.pg;render()}
 else if(d.tg){const s={...me.settings};s[d.tg]=!s[d.tg];put({settings:s},'ae1')}
 else if(d.top){W+=+d.top;keep();render();toast(t('saved'))}
 else if(d.dp){x.pay=d.dp;S.pay=d.dp;ex()}
 else if(d.dr){x.ride=d.dr;S.type=d.dr;ex()}
 else if(d.rm!==undefined){x.contacts.splice(+d.rm,1);ex()}
 else if(d.cp){S.promo=d.cp;toast(d.cp+' ✓');S.tab='book';render()}
 else if(d.ac==='sw'){mode=mode==='login'?'signup':'login';overlay()}
 else if(d.ac==='go'){try{const r=await api('POST','/'+mode,{name:$('an')&&$('an').value,email:$('ae').value,password:$('ap').value});tok=r.token;localStorage.setItem('gr-t',tok);setUser(r.user)}catch(z){$('aerr').textContent=z.message}}
 else if(d.ac==='save'){if(await put({name:$('fn').value,phone:$('fp').value},'ae1'))toast(t('saved'))}
 else if(d.ac==='sp'){const g=v=>v===''?null:+v;x.home=g($('sh').value);x.work=g($('sw').value);if(await ex())toast(t('saved'))}
 else if(d.ac==='ac'){const n=$('cn').value.trim(),p=$('cp').value.trim();if(!n||!/^\d{10}$/.test(p)){$('ae1').textContent=t('phone');return}(x.contacts=x.contacts||[]).push({n:n.slice(0,40),p});ex()}
 else if(d.ac==='cr'){try{await navigator.clipboard.writeText(x.ref)}catch{}toast(t('copied'))}
 else if(d.ac==='pw'){try{await api('POST','/password',{old:$('po').value,new:$('pn').value});toast(t('pwd'));render()}catch(z){$('ae2').textContent=z.message}}
 else if(d.ac==='dl'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({profile:me,rides:H},null,2)],{type:'application/json'}));a.download='goride-my-data.json';a.click()}
 else if(d.ac==='out')logout();
 else if(d.ac==='del'&&confirm(t('delq'))){try{await api('DELETE','/me');logout()}catch(z){$('ae2').textContent=z.message}}},true);
overlay();
if(tok)api('GET','/me').then(r=>setUser(r.user)).catch(()=>logout());
Object.assign(L.en,{sched:'Schedule',schd:'Ride scheduled',future:'Pick a time in the future',due:'Your scheduled ride is starting',upc:'Upcoming rides',wal:'Wallet',off:'Offers',safe:'Safety',hlp:'Help',close:'Close'});
Object.assign(L.te,{sched:'షెడ్యూల్',upc:'రాబోయే రైడ్‌లు',wal:'వాలెట్',off:'ఆఫర్లు',safe:'భద్రత',hlp:'సహాయం',close:'మూసివేయి'});
Object.assign(L.hi,{sched:'शेड्यूल',upc:'आगामी राइड',wal:'वॉलेट',off:'ऑफ़र',safe:'सुरक्षा',hlp:'मदद',close:'बंद करें'});
Object.assign(U,{"↻ Book again":["↻ మళ్లీ బుక్ చేయండి","↻ फिर बुक करें"],"🧾 Receipt":["🧾 రసీదు","🧾 रसीद"],"⚠️ Report issue":["⚠️ సమస్య తెలపండి","⚠️ समस्या बताएँ"],"Book your first ride":["మీ మొదటి రైడ్ బుక్ చేయండి","अपनी पहली राइड बुक करें"]});
const lt=m=>new Date(Date.now()+m*6e4-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16);
window.vAcct=()=>me?'<div class="acv">'+page()+'</div>':'';
window.QA=()=>{const x=me&&me.extra||{},ch=[['home','🏠'],['work','💼']].map(k=>x[k[0]]!=null?`<button data-sp="${x[k[0]]}">${k[1]} ${t(k[0])}</button>`:`<button data-pg="places" data-go="1">＋ ${t(k[0])}</button>`).join('');
 return `<div class="seg" style="margin:10px 0 0">${ch}<button data-qa="sched" aria-pressed="${S.sched!=null}">🕒 ${t('sched')}</button></div>${S.sched!=null?`<input id="sdt" type="datetime-local" value="${S.sched}" min="${lt(0)}" aria-label="${t('sched')}" style="margin-top:8px">`:''}<div class="seg" style="margin:8px 0 0">${[['wallet','💳','wal'],['offers','🎁','off'],['contacts','🆘','safe'],['help','❓','hlp']].map(k=>`<button data-pg="${k[0]}" data-go="1">${k[1]} ${t(k[2])}</button>`).join('')}</div>`};
window.UPC=()=>{const s=me&&me.extra&&me.extra.sched||[];return s.length?`<small>${t('upc')}</small>`+s.map((r,i)=>`<div class="h"><div><b>🕒 ${PL[r.a].n} → ${PL[r.b].n}</b><br><small>${new Date(r.at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})} · ${R(r.f)}</small></div><button class="sm" style="padding:8px 12px" data-sc="${i}">✕</button></div>`).join(''):''};
function qa(k){if(k==='sched'){S.sched=S.sched==null?lt(30):null;render()}}
document.addEventListener('input',e=>{if(e.target.id==='sdt')S.sched=e.target.value});
$('lg').addEventListener('change',e=>{lang=e.target.value;localStorage.setItem('gr-l',lang);me?put({lang},'ae1'):overlay();render()});
function schedule(){if(S.from===S.to||!me)return;if(!S.sched||S.sched<=lt(0)){toast(t('future'));return}const x=X(),q=quote(tp());(x.sched=x.sched||[]).push({a:S.from,b:S.to,ty:S.type,at:S.sched,f:q.pay});x.sched.sort((p,q)=>p.at<q.at?-1:1);S.sched=null;S.tab='hist';ex().then(()=>toast(t('schd')))}
setInterval(()=>{if(!me||S.st!=='pick')return;const s=X().sched||[],i=s.findIndex(r=>r.at<=lt(0));if(i<0)return;const r=s.splice(i,1)[0];S.from=r.a;S.to=r.b;S.type=r.ty;S.tab='book';preview();ex();toast(t('due'));book()},20000);
function rebook(i){const h=H[i],a=PL.find(p=>p.n===h.a),b=PL.find(p=>p.n===h.b);if(!a||!b)return;if(S.st==='done')S.st='pick';S.from=a.i;S.to=b.i;S.tab='book';S.pk=null;if(S.st==='pick')preview();render()}
function save(txt,name){const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));l.download=name;l.click()}
function receipt(h){if(!h)return;save(['GoRide receipt','','Date: '+h.d,'Trip: '+h.a+' to '+h.b,'Ride: '+h.k+' km','Paid with: '+h.p,'Total: Rs '+h.f,'Rider: '+me.name].join('\n'),'goride-receipt.txt')}
function report(){location.href='mailto:support@goride.example?subject='+encodeURIComponent('GoRide ride issue')+'&body='+encodeURIComponent('Ride: '+(H[0]?H[0].a+' to '+H[0].b:'')+'\nIssue: ')}
async function share(){const m=`I'm on a GoRide trip to ${PL[S.to].n}. Driver: ${D.n}, ${D.v}, ${D.p}.`;try{if(navigator.share){await navigator.share({title:'GoRide trip',text:m});return}await navigator.clipboard.writeText(m);toast(t('copied'))}catch{}}
function sos(){const c=(me.extra&&me.extra.contacts)||[];let m=$('sosm');if(!m){m=document.createElement('div');m.id='sosm';m.style.cssText='position:fixed;inset:0;z-index:45;background:rgba(0,0,0,.5);display:grid;place-items:end center';document.body.appendChild(m)}
 m.innerHTML=`<div style="background:#fff;width:100%;max-width:420px;border-radius:18px 18px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px))"><h2>🆘 ${t('safe')}</h2><a class="cta" style="display:block;text-align:center;text-decoration:none;margin-top:0" href="tel:112">📞 112</a>${c.map(k=>`<a class="ghost" style="display:block;text-align:center;text-decoration:none;color:inherit" href="tel:${esc(k.p)}">📞 ${esc(k.n)} · ${esc(k.p)}</a>`).join('')}${c.length<3?`<button class="ghost" data-x="sosadd">＋ ${t('addc')}</button>`:''}<button class="ghost" data-x="sosx">${t('close')}</button></div>`}
let ls='';function notif(){if(!me||ls===S.st)return;const was=ls;ls=S.st;const s=me.settings||{},m={arr:'Driver is on the way',otp:'Your driver has arrived',done:'Ride completed'}[S.st];if(!was||!m)return;if(s.notify)toast(m);if(s.sound)beep()}
function beep(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator();o.connect(c.destination);o.frequency.value=880;o.start();o.stop(c.currentTime+.15)}catch{}}
})();
