
const COOKIE = "cj_admin";
const enc = new TextEncoder();

function b64(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function unb64(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

async function key(secret) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function sign(value, secret) {
  return b64(
    new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        await key(secret),
        enc.encode(value)
      )
    )
  );
}

export async function verify(value, sig, secret) {
  try {
    return await crypto.subtle.verify(
      "HMAC",
      await key(secret),
      unb64(sig),
      enc.encode(value)
    );
  } catch {
    return false;
  }
}

export function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}

export function cookieValue(request, name = COOKIE) {
  const raw = request.headers.get("Cookie") || "";
  const item = raw
    .split(";")
    .map(x => x.trim())
    .find(x => x.startsWith(name + "="));

  if (!item) return "";

  try {
    return decodeURIComponent(item.slice(name.length + 1));
  } catch {
    return "";
  }
}

export async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return false;
  }

  const token = cookieValue(request);
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [expiry, sig] = parts;

  if (!expiry || !sig || !/^\d+$/.test(expiry)) {
    return false;
  }

  if (Number(expiry) < Date.now()) {
    return false;
  }

  return await verify(expiry, sig, env.SESSION_SECRET);
}

export const cookieName = COOKIE;

export function validUrl(s) {
  if (!s) return "";

  try {
    const u = new URL(s);

    return ["https:", "http:"].includes(u.protocol)
      ? u.href
      : "";
  } catch {
    return "";
  }
}

export function cleanProduct(p) {
  return {
    name: String(p.name || "").trim().slice(0, 160),
    price: String(p.price || "").trim().slice(0, 80),
    category: String(p.category || "Other").trim().slice(0, 80),
    image: validUrl(p.image),
    tiktok: validUrl(p.tiktok),
    shopee: validUrl(p.shopee),
    description: String(p.description || "").trim().slice(0, 500)
  };
}
