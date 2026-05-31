# Production WordPress-Like CMS Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing WordPress-like admin from a JSON-backed UI prototype into a secure, database-backed CMS foundation without redesigning the current UI.

**Architecture:** Keep the existing `/admin` UI shell intact, replace spoofable admin API access with session auth and server-side RBAC, add Prisma CMS entities, and introduce stable `/api/admin/*` resources. Existing JSON readers become backward-compatible fallbacks while database records become the primary source when `DATABASE_URL` is configured.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Prisma/PostgreSQL, Zod, Node crypto, Node filesystem for local media uploads.

---

### Task 1: Security And Database Foundation

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `lib/admin/rbac.ts`
- Create: `lib/admin/api.ts`
- Create: `lib/admin/auth.ts`
- Create: `scripts/create-admin-user.mjs`
- Modify: `.env.example`

- [ ] Add CMS entities for users, roles, sessions, posts, media, categories, tags, menus, revisions, autosaves, options and custom post types.
- [ ] Add password hashing and opaque session tokens stored as hashes in the database.
- [ ] Remove trust in request headers for roles and authorize every admin API by authenticated database user.
- [ ] Add a local script for creating the first administrator.
- [ ] Verify with `npx prisma generate` and `npm run typecheck`.

### Task 2: Stable Admin API Layer

**Files:**
- Create: `lib/admin/content-service.ts`
- Create: `lib/admin/taxonomy-service.ts`
- Create: `lib/admin/menu-service.ts`
- Create: `app/api/admin/posts/route.ts`
- Create: `app/api/admin/pages/route.ts`
- Create: `app/api/admin/tours/route.ts`
- Create: `app/api/admin/products/route.ts`
- Create: `app/api/admin/media/route.ts`
- Create: `app/api/admin/taxonomy/route.ts`
- Create: `app/api/admin/menus/route.ts`
- Create: `app/api/admin/users/route.ts`
- Create: `app/api/admin/settings/route.ts`

- [ ] Implement consistent response format: `{ ok, data }` and `{ ok:false, error:{ code, message } }`.
- [ ] Support pagination, filtering, sorting and status filters for content lists.
- [ ] Implement draft, publish, schedule, trash and restore state transitions.
- [ ] Persist categories, tags, featured images and SEO metadata.
- [ ] Verify API handlers typecheck.

### Task 3: Revisions, Autosave And Media Upload

**Files:**
- Create: `app/api/admin/revisions/route.ts`
- Create: `app/api/admin/autosaves/route.ts`
- Modify: `lib/admin/content-service.ts`
- Modify: `app/api/admin/media/route.ts`

- [ ] Create a revision before content mutations.
- [ ] Store autosave snapshots separately from canonical content.
- [ ] Support revision restore for posts/pages/tours/products.
- [ ] Accept multipart media upload and create a database media record.
- [ ] Verify upload route uses Node runtime and rejects unauthorized requests.

### Task 4: Backward Compatibility And Frontend Sync

**Files:**
- Modify: `lib/cms.ts`
- Create: `lib/cms-db.ts`
- Modify: `lib/site-content.ts`
- Modify: `app/api/admin/site-content/route.ts`

- [ ] Read published CMS content from database first when available.
- [ ] Keep fallback/static data only for development and migration safety.
- [ ] Store site identity/header/footer/home options in database option records.
- [ ] Revalidate affected tags after admin mutations.
- [ ] Keep legacy `/api/admin/site-content` protected and compatible with current UI.

### Task 5: WordPress Parity Behavior Polish

**Files:**
- Modify: `components/admin/wordpress-admin-clone.tsx`
- Modify: `components/admin/wp-admin-ui.tsx`

- [ ] Replace symbolic icons with Dashicons-like labels/classes.
- [ ] Fix sidebar active submenu behavior and collapsed state persistence.
- [ ] Add admin bar account dropdown connected to session/logout.
- [ ] Normalize list table density, notices and WP button states.
- [ ] Do not redesign the admin layout.

### Task 6: Verification

**Commands:**
- `npx prisma generate`
- `npm run typecheck`
- `npm run lint -- --max-warnings=0 --ignore-pattern .local-logs/**`
- `Invoke-WebRequest -UseBasicParsing http://localhost:3000/admin`

- [ ] Report any unrelated lint failures separately.
- [ ] Report exact changed files and diff stats.
