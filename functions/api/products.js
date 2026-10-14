import {json,isAdmin,cleanProduct} from "../_lib.js";
export async function onRequestGet({request,env}) {
  if(!env.DB) return json({error:"Database not configured. Follow README setup."},503);
  const url=new URL(request.url),id=url.searchParams.get("id");
  if(id && await isAdmin(request,env)) { const p=await env.DB.prepare("SELECT * FROM products WHERE id=?").bind(id).first(); return p?json({product:p}):json({error:"Not found"},404); }
  const {results=[]}=await env.DB.prepare("SELECT id,name,price,category,image,tiktok,shopee,description,created_at,updated_at FROM products ORDER BY created_at DESC").all();
  return json({products:results});
}
export async function onRequestPost({request,env}) {
  if(!await isAdmin(request,env))return json({error:"Admin login required"},401);
  if(!env.DB)return json({error:"Database not configured"},503);
  let body;try{body=await request.json()}catch{return json({error:"Invalid JSON"},400)}
  const p=cleanProduct(body);if(!p.name)return json({error:"Product name is required"},400);
  const id=crypto.randomUUID();
  await env.DB.prepare("INSERT INTO products (id,name,price,category,image,tiktok,shopee,description) VALUES (?,?,?,?,?,?,?,?)").bind(id,p.name,p.price,p.category,p.image,p.tiktok,p.shopee,p.description).run();
  return json({id,...p},201);
}
export async function onRequestPut({request,env}) {
  if(!await isAdmin(request,env))return json({error:"Admin login required"},401);
  if(!env.DB)return json({error:"Database not configured"},503);
  const id=new URL(request.url).searchParams.get("id");if(!id)return json({error:"Product id required"},400);
  let body;try{body=await request.json()}catch{return json({error:"Invalid JSON"},400)}
  const p=cleanProduct(body);if(!p.name)return json({error:"Product name is required"},400);
  const r=await env.DB.prepare("UPDATE products SET name=?,price=?,category=?,image=?,tiktok=?,shopee=?,description=?,updated_at=datetime('now') WHERE id=?").bind(p.name,p.price,p.category,p.image,p.tiktok,p.shopee,p.description,id).run();
  if(!r.meta?.changes)return json({error:"Product not found"},404);return json({id,...p});
}
export async function onRequestDelete({request,env}) {
  if(!await isAdmin(request,env))return json({error:"Admin login required"},401);
  if(!env.DB)return json({error:"Database not configured"},503);
  const id=new URL(request.url).searchParams.get("id");if(!id)return json({error:"Product id required"},400);
  const r=await env.DB.prepare("DELETE FROM products WHERE id=?").bind(id).run();
  if(!r.meta?.changes)return json({error:"Product not found"},404);return json({ok:true});
    }
