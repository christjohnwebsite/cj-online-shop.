import {json,sign,cookieName} from "../../_lib.js";
export async function onRequestPost({request,env}) {
  if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return json({error:"Admin secrets are not configured yet."},503);
  let body;try{body=await request.json()}catch{return json({error:"Invalid request"},400)}
  const supplied=String(body.password||"");
  const a=new TextEncoder().encode(supplied),b=new TextEncoder().encode(env.ADMIN_PASSWORD);
  let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a[i]||0)^(b[i]||0);
  if(diff!==0)return json({error:"Incorrect password"},401);
  const expiry=String(Date.now()+8*60*60*1000),sig=await sign(expiry,env.SESSION_SECRET);
  return json({ok:true},200,{"Set-Cookie":`${cookieName}=${encodeURIComponent(expiry+"."+sig)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`});
}
