# Hybrid Headless WordPress + Next.js Luxury Travel Design

## Goal
Build a premium tailor-made travel platform with WordPress as the editorial/admin CMS and Next.js as the public SEO/performance frontend.

## Key Decisions
- WordPress remains the admin panel: authentication, roles, media, editor UI, content CRUD, leads, bookings.
- Next.js renders all public pages and consumes WordPress through REST endpoints.
- UI is original, luxury-inspired, and avoids copying protected code/assets/content from reference sites.
- Initial delivery is a production-ready foundation: CMS plugin, frontend architecture, page templates, lead form, SEO/schema, payment scaffolding, and deployment docs.

## Architecture
- `halong-cruise-wp/`: WordPress plugin package named Ha Long Luxury Headless CMS.
- `luxury-travel-next/`: Next.js App Router frontend.
- REST boundary: WordPress exposes `/wp-json/hlt/v1/*`; Next.js reads public content and submits leads/bookings.
- Payment providers are abstracted behind Next API routes and environment variables.

## Scope
Included now: content types, SEO meta boxes, lead admin, CSV export, REST API, Next.js luxury pages, multilingual-ready copy, tailor-made multi-step form, schema, sitemap, robots, docs.
Deferred to credentials/config: live VNPAY signing, PayPal production app credentials, SMTP server details.
