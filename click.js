import {json,validUrl} from "../_lib.js";
export async function onRequestGet({request,env}) {
 if(!env.DB)return json({error:"Database not configured"},503);
 const url=new URL(request.url),id=url.searchParams.get("id"),store=url.searchParams.get("store");
 if(!id||!["tiktok","shopee"].includes(store))return json({error:"Invalid link"},400);
 const p=await env.DB.prepare("SELECT tiktok,shopee FROM products WHERE id=?").bind(id).first();
 const target=p?validUrl(store==="tiktok"?p.tiktok:p.shopee):"";
 if(!target)return new Response("Affiliate link not found",{status:404});
 await env.DB.prepare("INSERT INTO affiliate_clicks(product_id,store) VALUES(?,?)").bind(id,store).run();
 return Response.redirect(target,302);
}
