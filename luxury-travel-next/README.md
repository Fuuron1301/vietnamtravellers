# Luxury Travel Next Frontend

Next.js public frontend for the headless WordPress luxury travel CMS.

## Quick Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

`WORDPRESS_API_URL` is optional. Leave it empty when using the built-in admin/local capture flow. Lead and booking submissions will be written to `.local-data/leads.json` and `.local-data/bookings.json`.

If you still want to connect an external WordPress endpoint, set `WORDPRESS_API_URL`, for example:

```text
https://cms.example.com/wp-json/hlt/v1
```

Set `WORDPRESS_ADMIN_URL` to the WordPress dashboard login URL used by `/admin`:

```text
https://cms.example.com/wp-admin
```

## Routes

- `/`
- `/vietnam-tours/`
- `/thailand-tours/`
- `/cambodia-tours/`
- `/laos-tours/`
- `/multi-country-tours/`
- `/travel-styles/[slug]/`
- `/[tourSlug]/`
- `/blog/`
- `/blog/[slug]/`
- `/customize-your-trip/`
- `/admin/`

## Payments

Payment routes generate booking IDs and provider handoff payloads. Add real VNPAY, VietQR and PayPal credentials in `.env.local` before production use.

## Validated CMS Rendering

The frontend consumes only normalized CMS payloads from `lib/validated-cms.ts`. WordPress can call `POST /api/revalidate` with `NEXT_REVALIDATION_SECRET` to revalidate changed tour pages, country hubs, home and sitemap.

## WordPress Admin Gateway

`/admin/` is a noindex gateway into the real WordPress admin panel. It does not replace WordPress authentication. Configure either:

- `WORDPRESS_ADMIN_URL`, preferred for the exact dashboard URL.
- `WORDPRESS_API_URL`, fallback used to infer `/wp-admin/` from the WordPress site origin.

To make every frontend detail controllable from WordPress, WordPress must expose matching structured data for each section, card, CTA, legal block, FAQ, travel style, tour and design setting. Then each hardcoded frontend section should be migrated to CMS-driven rendering.
