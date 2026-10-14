# CJ ONLINE SHOP — Upgrade package

Pre, apil na ang redesigned storefront, server-side admin login, Cloudflare Pages Functions API, D1 schema, ug affiliate click redirect tracking.

## Importante
Kini nga ZIP **dili pa live/deployed** ug walay access sa imong GitHub o Cloudflare account. Ang online database ug admin login dili molihok hangtod mahuman ang setup sa ubos. Ayaw i-upload ang secrets sa GitHub.

## Unsa ang sulod
- `index.html` — redesigned responsive storefront, search, category filters, sorting, admin login/form.
- `functions/api/products.js` — public catalog + authenticated product CRUD.
- `functions/api/admin/login.js` and `logout.js` — signed, HttpOnly admin session cookie.
- `functions/api/click.js` — records click then redirects to the affiliate URL.
- `functions/_lib.js` — validation and session helpers.
- `migrations/0001_products.sql` — D1 tables for products and affiliate clicks.

## Setup sa Cloudflare Pages

1. **Backup una.** Sa GitHub, himoa ang branch nga `backup-before-cj-upgrade` o download ang current repository ZIP.
2. Ibutang ang files niini nga package sa root sa repository. Keep your existing Cloudflare Pages project and build settings unless verified otherwise.
3. Sa Cloudflare dashboard, ablihi **Workers & Pages → D1 SQL Database** ug paghimo og database (pananglitan `cj-online-shop-db`).
4. Sa D1 Console, run ang sulod sa `migrations/0001_products.sql`.
5. Sa Cloudflare Pages project, adto sa **Settings → Bindings → Add → D1 database binding**. Binding variable name: `DB`. Pilia ang imong D1 database ug save.
6. Sa Pages project, adto sa **Settings → Variables and Secrets**. Ibutang ang duha ka secrets:
   - `ADMIN_PASSWORD` — lig-on ug talagsaon nga password (minimum 12+ characters recommended).
   - `SESSION_SECRET` — random secret nga taas ug dili parehas sa admin password.
   Set them for Production (and Preview only if you want preview admin access).
7. Siguroha nga ang Pages Functions apil sa deploy. Sa Pages project nga Git-integrated, push ang changes sa imong deployment branch ug hulata ang build/deploy.
8. Ablihi ang site, sulayi ang admin login ug paghimo og test product. Sulayi ang TikTok/Shopee buttons. Ayaw pa i-delete ang old site/backup hangtod ma-verify ang tanan.

Official Cloudflare references:
- Pages Functions & bindings: https://developers.cloudflare.com/pages/functions/bindings/
- Pages Functions: https://developers.cloudflare.com/pages/functions/

## Existing products
Ang original HTML nga imong gi-upload nagtipig sa products sa `localStorage` sa usa ka browser/device. Dili kini automatic nga naa sa D1. Kung naa kay existing products sa old site, exporta una ang backup gikan sa old admin page kung mahimo. Human ma-configure ang online admin, idugang balik ang products gamit ang admin form. Ang sample demo products sa bag-ong design dili tinuod nga affiliate offers ug walay affiliate URLs.

## Security notes
- Ang admin writes gi-protect sa server-side session; ayaw pagbutang password sa HTML o GitHub.
- HTTPS kinahanglan (Cloudflare Pages default).
- Human sa deployment, sulayi ang login/logout ug CRUD sa production ug ayaw i-share ang admin password.
- Kini nga package wala pa gi-deploy o live-tested sa imong account. Review/test sa backup/preview deployment una.
