# Ha Long Luxury Travel Platform

Hybrid headless WordPress + Next.js luxury tailor-made travel website.

## Structure

- `halong-cruise-wp/`: WordPress plugin for standard wp-admin CMS, SEO fields, leads, bookings and REST API.
- `luxury-travel-next/`: Next.js 14 App Router frontend with Tailwind, Framer Motion, React Hook Form, SEO routes and payment scaffolding.
- `docs/superpowers/`: design and implementation notes.
- `DEPLOYMENT.md`: production setup guide.

## Development

1. Install and activate the WordPress plugin from `halong-cruise-wp`.
2. Configure `luxury-travel-next/.env.local` from `.env.example`.
3. Run:

```bash
cd luxury-travel-next
npm install
npm run dev
```

## Admin

Content editing happens in normal WordPress admin. No custom Next.js admin is used because this project intentionally keeps WordPress as the CMS/admin panel.
