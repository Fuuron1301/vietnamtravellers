# Hybrid Luxury Travel Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static/old WordPress theme with a headless WordPress CMS plus Next.js luxury travel frontend.

**Architecture:** WordPress provides standard admin, roles, media, CPTs, SEO fields, leads and bookings via REST API. Next.js App Router renders public pages, forms, SEO/schema, sitemap, robots, and payment handoff screens.

**Tech Stack:** WordPress PHP plugin, Next.js 14, TypeScript, Tailwind CSS, Framer Motion, React Hook Form, next-intl-style message files, Prisma schema, REST API.

---

### Task 1: Clean Legacy Files
**Files:** remove root static demo assets and replace `halong-cruise-wp` theme with plugin package.
- [ ] Verify current working directory is project root.
- [ ] Remove `index.html`, `styles.css`, `script.js`, `dist`, `test-screenshots`.
- [ ] Remove old theme PHP templates/assets from `halong-cruise-wp`.
- [ ] Keep `halong-cruise-wp` directory and recreate it as WordPress plugin package.

### Task 2: WordPress Headless CMS Plugin
**Files:** create `halong-cruise-wp/halong-cruise-headless.php`, `includes/*.php`, `README.md`.
- [ ] Register CPTs: country, tour, travel_style, testimonial, lead, booking.
- [ ] Register roles: hlt_sales and hlt_editor capabilities.
- [ ] Add SEO/meta boxes for multilingual fields, gallery, itinerary, FAQ, lead status, booking status.
- [ ] Add REST endpoints under `/wp-json/hlt/v1`.
- [ ] Add CSV export for leads in admin.

### Task 3: Next.js Frontend Foundation
**Files:** create `luxury-travel-next` app config, app routes, components, lib, styles, messages.
- [ ] Add package metadata and scripts.
- [ ] Add Tailwind theme with luxury colors/typography.
- [ ] Add CMS client with fallback demo content.
- [ ] Add root layout, home, hub, tour, style, blog, customize pages.

### Task 4: Conversion + Payment Flow
**Files:** create `components/tailor-made-form.tsx`, `app/api/leads/route.ts`, `app/api/payments/*`.
- [ ] Build multi-step React Hook Form with progress and localStorage draft.
- [ ] Submit leads to Next API then WordPress REST.
- [ ] Generate booking ID and provider URLs/QR placeholders from env.

### Task 5: SEO, Docs, Verification
**Files:** create `app/sitemap.ts`, `app/robots.ts`, `DEPLOYMENT.md`, `.env.example`.
- [ ] Add JSON-LD schemas for TravelAgency, Tour, FAQ.
- [ ] Add deployment/setup docs for WordPress plugin and Next frontend.
- [ ] Run install/build checks where possible.
