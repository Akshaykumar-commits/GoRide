// GoRide backend: zero-dependency Node.js (v18+). Run: node backend/server.js
const http=require('http'),fs=require('fs'),path=require('path'),c=require('crypto');
const PORT=process.env.PORT||3000,SECRET=process.env.SECRET||c.randomBytes(32).toString('hex');
const DB=path.join(__dirname,'data.json'),ROOT=path.join(__dirname,'..','frontend');
let db={users:{}};try{db=JSON.parse(fs.readFileSync(DB,'utf8'))}catch{}
const save=()=>fs.writeFileSync(DB,JSON.stringify(db));
const hash=(p,s)=>c.scryptSync(p,s,32).toString('hex');
const sign=e=>{const b=Buffer.from(JSON.stringify({e,x:Date.now()+6048e5})).toString('base64url');return b+'.'+c.createHmac('sha256',SECRET).update(b).digest('base64url')};
function who(req){const t=(req.headers.authorization||'').slice(7),[b,s]=t.split('.');if(!b||!s)return null;
 const ok=c.createHmac('sha256',SECRET).update(b).digest('base64url');if(s.length!==ok.length||!c.timingSafeEqual(Buffer.from(s),Buffer.from(ok)))return null;
 try{const p=JSON.parse(Buffer.from(b,'base64url'));return p.x>Date.now()?db.users[p.e]||null:null}catch{return null}}
const pub=u=>({name:u.name,email:u.email,phone:u.phone,lang:u.lang,settings:u.settings,wallet:u.wallet,rides:u.rides,extra:u.extra||{}});
const hits={};const limited=ip=>{const h=hits[ip]=hits[ip]||{n:0,t:Date.now()};if(Date.now()-h.t>6e5){h.n=0;h.t=Date.now()}return++h.n>10};
const body=req=>new Promise((ok,no)=>{let s='';req.on('data',d=>{s+=d;if(s.length>1e5){no();req.destroy()}});req.on('end',()=>{try{ok(JSON.parse(s||'{}'))}catch{ok({})}})});
const send=(res,code,o)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(o))};
const EM=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
http.createServer(async(req,res)=>{
 res.setHeader('Access-Control-Allow-Origin',process.env.ALLOWED_ORIGIN||'*');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
 if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
 const url=req.url.split('?')[0];
 if(url.startsWith('/api/')){try{
  const b=req.method==='GET'?{}:await body(req),ip=req.socket.remoteAddress;
  if(url==='/api/signup'){if(limited(ip))return send(res,429,{error:'Too many attempts. Try later.'});
   const e=String(b.email||'').trim().toLowerCase();
   if(!EM.test(e)||String(b.password||'').length<8||!String(b.name||'').trim())return send(res,400,{error:'Enter a name, valid email and a password of 8+ characters.'});
   if(db.users[e])return send(res,409,{error:'Email already registered.'});
   const salt=c.randomBytes(16).toString('hex');
   db.users[e]={name:String(b.name).trim().slice(0,60),email:e,phone:'',lang:'en',settings:{notify:true,sound:true},extra:{},wallet:1000,rides:[],salt,pw:hash(b.password,salt)};save();
   return send(res,200,{token:sign(e),user:pub(db.users[e])})}
  if(url==='/api/login'){if(limited(ip))return send(res,429,{error:'Too many attempts. Try later.'});
   const u=db.users[String(b.email||'').trim().toLowerCase()];
   if(!u||hash(String(b.password||''),u.salt)!==u.pw)return send(res,401,{error:'Wrong email or password.'});
   return send(res,200,{token:sign(u.email),user:pub(u)})}
  if(url==='/api/health')return send(res,200,{ok:true,users:Object.keys(db.users).length});
  if(url==='/api/coupons')return send(res,200,{coupons:[{code:'GORIDE20',info:'20% off, up to Rs 60'},{code:'WELCOME50',info:'Rs 50 off rides above Rs 100'}]});
  if(url==='/api/admin/stats'){if(!process.env.ADMIN_KEY||req.headers['x-admin-key']!==process.env.ADMIN_KEY)return send(res,403,{error:'Forbidden'});const us=Object.values(db.users);return send(res,200,{users:us.length,rides:us.reduce((a,x)=>a+x.rides.length,0),revenue:us.reduce((a,x)=>a+x.rides.reduce((b,r)=>b+r.f,0),0)})}
  const u=who(req);if(!u)return send(res,401,{error:'Please log in again.'});
  if(url==='/api/me'&&req.method==='GET')return send(res,200,{user:pub(u)});
  if(url==='/api/me'&&req.method==='PUT'){
   if(typeof b.name==='string'&&b.name.trim())u.name=b.name.trim().slice(0,60);
   if(typeof b.phone==='string'){if(b.phone&&!/^\d{10}$/.test(b.phone))return send(res,400,{error:'Phone must be 10 digits.'});u.phone=b.phone}
   if(['en','te','hi'].includes(b.lang))u.lang=b.lang;
   if(b.settings)u.settings={notify:!!b.settings.notify,sound:!!b.settings.sound};
   if(b.extra&&typeof b.extra==='object'&&JSON.stringify(b.extra).length<5000)u.extra=b.extra;
   save();return send(res,200,{user:pub(u)})}
  if(url==='/api/password'){if(hash(String(b.old||''),u.salt)!==u.pw)return send(res,401,{error:'Current password is wrong.'});
   if(String(b.new||'').length<8)return send(res,400,{error:'New password needs 8+ characters.'});
   u.salt=c.randomBytes(16).toString('hex');u.pw=hash(b.new,u.salt);save();return send(res,200,{ok:true})}
  if(url==='/api/state'){const w=+b.wallet;if(Number.isFinite(w))u.wallet=Math.min(Math.max(Math.round(w),0),1e5);
   if(Array.isArray(b.rides))u.rides=b.rides.slice(0,30).map(r=>({a:String(r.a).slice(0,40),b:String(r.b).slice(0,40),e:String(r.e).slice(0,4),k:String(r.k),f:+r.f||0,p:String(r.p).slice(0,10),d:String(r.d).slice(0,12),rating:+r.rating||0}));
   save();return send(res,200,{ok:true})}
  if(url==='/api/me'&&req.method==='DELETE'){delete db.users[u.email];save();return send(res,200,{ok:true})}
  return send(res,404,{error:'Not found'})}catch{return send(res,400,{error:'Bad request'})}}
 // static files (never the backend folder)
 let f=path.normalize(path.join(ROOT,url==='/'?'index.html':decodeURIComponent(url)));
 if(!f.startsWith(ROOT)||f.startsWith(__dirname)||!MIME[path.extname(f)]){res.writeHead(404);return res.end('Not found')}
 fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]});res.end(d)})
}).listen(PORT,()=>console.log('GoRide on http://localhost:'+PORT));
