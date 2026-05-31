# Real Public Data Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Public website data, admin DB, and frontend render all real site content and stay editable without smoke/fake data.

**Architecture:** Keep current UI and public routes. Treat public website as source of truth for mirrorable content, then sync into admin DB with `_mirror_source` markers and no destructive cleanup of real records. Public runtime keeps current look, but reads DB-backed content where available and falls back only when explicitly allowed. Audit scripts enforce no smoke markers, and admin surfaces only source-backed items.

**Tech Stack:** Next.js App Router, React, Prisma, PostgreSQL, Zod, Playwright, Node scripts, next-intl.

---

### Task 1: Public source audit and mirror map

**Files:**
- Modify: `scripts/admin-real-data-audit.mjs`
- Modify: `scripts/mirror-current-site-to-admin.mjs`
- Create: `scripts/public-source-audit.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing audit for source-backed items only**

```js
// scripts/public-source-audit.mjs
// Check public routes, DB posts/pages/tours/blogs/media/menus, and emit counts:
// - mirrored items with _mirror_source
// - items missing featured image/content/meta
// - items carrying smoke/fake markers
```

- [ ] **Step 2: Run audit to see current gaps**

Run: `node scripts/public-source-audit.mjs`
Expected: reports missing meta/image/content gaps for real items, no fake markers.

- [ ] **Step 3: Extend mirror script to keep source-backed items**

```js
// scripts/mirror-current-site-to-admin.mjs
// Preserve all current real records.
// Populate missing admin-only mirrors for pages, tours, blogs, menus, media, meta.
// Never delete live-backed records; only skip smoke/fake markers.
```

- [ ] **Step 4: Re-run audit to confirm mirror coverage**

Run: `npm run cms:mirror-current && npm run audit:real-data`
Expected: PASS with zero smoke/fake issues.

- [ ] **Step 5: Commit**

```bash
git add scripts/admin-real-data-audit.mjs scripts/mirror-current-site-to-admin.mjs scripts/public-source-audit.mjs package.json
git commit -m "feat: audit and mirror real public data"
```

### Task 2: Admin filters for source-backed content only

**Files:**
- Modify: `app/admin/[section]/page.tsx`
- Modify: `components/admin/wordpress-admin-clone.tsx`
- Modify: `app/api/admin/posts/route.ts`
- Modify: `app/api/admin/pages/route.ts`
- Modify: `app/api/admin/tours/route.ts`
- Modify: `app/api/admin/media/route.ts`
- Modify: `app/api/admin/menus/route.ts`
- Modify: `app/api/admin/meta/route.ts`
- Modify: `app/api/admin/design/route.ts`

- [ ] **Step 1: Write failing UI/API assertions for source-backed lists**

```ts
// tests should assert list queries exclude smoke markers
// and show only records with _mirror_source or real authored records.
```

- [ ] **Step 2: Run list smoke to see fake rows still present**

Run: `npm run admin:smoke`
Expected: find any fake/smoke markers or unfiltered rows.

- [ ] **Step 3: Filter lists to source-backed rows only**

```ts
// List queries exclude smoke/fake markers.
// Admin list text and cards show only real records.
```

- [ ] **Step 4: Re-run admin smoke**

Run: `npm run admin:smoke && npm run admin:ui-smoke`
Expected: PASS, all visible rows source-backed.

- [ ] **Step 5: Commit**

```bash
git add app/admin/[section]/page.tsx components/admin/wordpress-admin-clone.tsx app/api/admin/posts/route.ts app/api/admin/pages/route.ts app/api/admin/tours/route.ts app/api/admin/media/route.ts app/api/admin/menus/route.ts app/api/admin/meta/route.ts app/api/admin/design/route.ts
git commit -m "feat: hide smoke data from admin lists"
```

### Task 3: Public render parity for real data

**Files:**
- Modify: `lib/site-content.ts`
- Modify: `lib/cms.ts`
- Modify: `lib/admin/site-content-mirror.ts`
- Modify: `components/header.tsx`
- Modify: `components/footer.tsx`
- Modify: `components/hub-page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write failing route checks for DB-backed public render**

```js
// scripts/production-route-smoke.mjs
// Assert home, blog, tour, footer, and menu render DB-backed labels,
// and no smoke markers appear in HTML.
```

- [ ] **Step 2: Run route smoke to confirm current runtime**

Run: `npm run smoke:routes`
Expected: PASS with current content, no smoke markers.

- [ ] **Step 3: Make public render consume mirrored real data first**

```ts
// public render reads admin_site_content, menus, posts, media, design tokens.
// Keep fallback only when DB has no source-backed record.
```

- [ ] **Step 4: Re-run route smoke and browser spot-check**

Run: `npm run smoke:routes`
Expected: PASS and browser shows same public content as site now.

- [ ] **Step 5: Commit**

```bash
git add lib/site-content.ts lib/cms.ts lib/admin/site-content-mirror.ts components/header.tsx components/footer.tsx components/hub-page.tsx app/layout.tsx
git commit -m "feat: keep public render on real mirrored content"
```

### Task 4: Final validation and report

**Files:**
- Modify: `scripts/admin-real-data-audit.mjs`
- Modify: `scripts/production-readiness-check.mjs`
- Modify: `scripts/production-route-smoke.mjs`

- [ ] **Step 1: Add final safety checks**

```js
// final audit must fail on any fake/smoke marker
// and must report missing source-backed images/content/meta.
```

- [ ] **Step 2: Run full verification**

Run: `npx prisma validate && npx prisma migrate status && npm run typecheck && npm run lint -- --max-warnings=0 --ignore-pattern .local-logs/** && npm run audit:real-data && npm run admin:smoke && npm run admin:ui-smoke && npm run smoke:routes && npm run production:check`
Expected: all PASS.

- [ ] **Step 3: Summarize real-data gaps only**

Report: missing 4K proof, short blogs, and any public fields still static-only.

- [ ] **Step 4: Commit**

```bash
git add scripts/admin-real-data-audit.mjs scripts/production-readiness-check.mjs scripts/production-route-smoke.mjs
git commit -m "chore: harden real-data parity checks"
```