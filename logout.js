import {json,cookieName} from "../../_lib.js";
export async function onRequestPost() {
 return json({ok:true},200,{"Set-Cookie":`${cookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`});
}
