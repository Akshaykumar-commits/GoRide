// Smoke test: node backend/test.js  (starts server on port 3999)
process.env.PORT=3999;process.env.ADMIN_KEY='k';require('fs').rmSync(__dirname+'/data.json',{force:true});require('./server.js');
const B='http://localhost:3999',j=async(m,p,b,t)=>{const r=await fetch(B+p,{method:m,headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:b?JSON.stringify(b):undefined});return[r.status,await r.json().catch(()=>({}))]};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
setTimeout(async()=>{
 let [s,r]=await j('POST','/api/signup',{name:'Test',email:'a@b.co',password:'secret123'});ok(s===200&&r.token,'signup');const t=r.token;
 [s]=await j('POST','/api/signup',{name:'T',email:'a@b.co',password:'secret123'});ok(s===409,'duplicate email rejected');
 [s]=await j('POST','/api/login',{email:'a@b.co',password:'wrong'});ok(s===401,'wrong password rejected');
 [s,r]=await j('POST','/api/login',{email:'a@b.co',password:'secret123'});ok(s===200,'login');
 [s]=await j('GET','/api/me');ok(s===401,'me needs token');
 [s,r]=await j('PUT','/api/me',{name:'New',phone:'9876543210',lang:'te',extra:{home:1,contacts:[{n:'A',p:'9999999999'}]}},t);ok(s===200&&r.user.lang==='te'&&r.user.extra.home===1,'update profile + extra');
 [s]=await j('PUT','/api/me',{phone:'123'},t);ok(s===400,'bad phone rejected');
 [s]=await j('PUT','/api/state',{wallet:750,rides:[{a:'X',b:'Y',e:'🚗',k:'3.2',f:120,p:'UPI',d:'1 Jan',rating:5}]},t);[s,r]=await j('GET','/api/me',null,t);ok(r.user.wallet===750&&r.user.rides.length===1,'wallet + rides saved');
 [s]=await j('POST','/api/password',{old:'secret123',new:'newsecret1'},t);ok(s===200,'change password');
 [s]=await j('POST','/api/login',{email:'a@b.co',password:'newsecret1'});ok(s===200,'login with new password');
 [s,r]=await j('GET','/api/health');ok(s===200,'health');
 const a=await fetch(B+'/api/admin/stats',{headers:{'x-admin-key':'k'}});ok(a.status===200,'admin stats');
 const f=await fetch(B+'/');ok(f.status===200&&(await f.text()).includes('GoRide'),'serves frontend');
 const bd=await fetch(B+'/backend/server.js');ok(bd.status===404,'backend code not exposed');
 [s]=await j('DELETE','/api/me',null,t);ok(s===200,'delete account');
 require('fs').rmSync(__dirname+'/data.json',{force:true});process.exit();
},400);
