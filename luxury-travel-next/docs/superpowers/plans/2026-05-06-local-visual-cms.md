# Local Visual CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the local `/admin` panel into the source of truth for visible website content and layout, starting with global identity, navigation, footer, homepage hero and homepage section layout.

**Architecture:** Add a local JSON-backed CMS store in `.local-data/site-content.json`, expose it through server helpers and admin API routes, then refactor public components to read the same data. The admin UI edits structured fields and saves through `/api/admin/site-content`, so changes are immediately reflected by dynamic public routes.

**Tech Stack:** Next.js App Router, React client components, TypeScript, JSON file storage with atomic writes, localStorage only for admin UI preferences.

---

### Task 1: Local CMS Store

**Files:**
- Create: `lib/site-content.ts`
- Create: `app/api/admin/site-content/route.ts`

- [ ] Define `SiteContent` types and defaults for identity, navigation, footer, homepage hero and homepage section layout.
- [ ] Implement `getSiteContent()` to read `.local-data/site-content.json`, merge with defaults, and return safe data.
- [ ] Implement `saveSiteContent()` with atomic write.
- [ ] Add GET/PUT API route for admin save/load.
- [ ] Verify with `npm run typecheck`.

### Task 2: Public Website Reads CMS Data

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `components/brand-logo.tsx`
- Modify: `components/header.tsx`
- Modify: `components/footer.tsx`
- Modify: `components/home/home-page.tsx`

- [ ] Pass site content from layout/page into header/footer/home.
- [ ] Replace hardcoded logo text, tagline, header navigation, CTA and homepage hero with CMS data.
- [ ] Render homepage sections by CMS-controlled order and visibility.
- [ ] Verify `/`, `/admin` render with `Invoke-WebRequest` and Playwright smoke.

### Task 3: Admin Editors

**Files:**
- Modify: `components/admin/wordpress-admin-clone.tsx`
- Modify: `app/admin/page.tsx`

- [ ] Add `Site Identity` editor for logo/name/tagline/admin site label.
- [ ] Add `Navigation` editor for header tour menu, about menu and primary CTA.
- [ ] Add `Homepage Builder` editor for hero fields, CTA fields, section order and visibility.
- [ ] Add save/reset buttons using `/api/admin/site-content`.
- [ ] Show save status and keep the wp-admin clone look.

### Task 4: Verification

**Files:**
- None

- [ ] Run `npm run typecheck`.
- [ ] Smoke test `/admin` and `/`.
- [ ] Use Playwright to edit logo/title in admin, save, reload homepage, and verify the public page shows the edited value.
