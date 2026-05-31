# Phase B Runtime + Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect DB-backed CMS blocks, live preview, revisions, media picker, and design runtime to the public frontend and admin panel without breaking the current UI.

**Architecture:** Keep the existing wp-admin-like shell and extend it with a server-rendered CMS runtime, a client-side preview canvas, and narrow API updates. Treat `PostMeta._cms_blocks` as the source for page-level block trees, resolve reusable blocks/templates at render time, and revalidate frontend tags after every admin mutation. Build editor upgrades as focused components that can be mounted inside the existing admin screens.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma, PostgreSQL, Tailwind, Zod, `revalidateTag`, existing admin auth/RBAC/CSRF helpers.

---

### Task 1: Frontend block runtime

**Files:**
- Modify: `lib/blocks/block-types.ts`
- Modify: `lib/blocks/block-renderer.tsx`
- Modify: `components/blocks/cms-block-renderer.tsx`
- Modify: `app/[tourSlug]/page.tsx`
- Modify: `app/travel-styles/[slug]/page.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/page.tsx`
- Modify: `app/cruises/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add failing route/runtime test cases**
  - Add smoke coverage that a page with `_cms_blocks` renders block output and reusable blocks resolve by slug.
- [ ] **Step 2: Run smoke and confirm missing runtime behavior**
  - Run the new smoke check and verify `_cms_blocks` is still not rendered on public routes.
- [ ] **Step 3: Implement DB-driven runtime**
  - Resolve block trees from `PostMeta` and `BlockTemplate`, inject design tokens, and render through the existing block renderer.
- [ ] **Step 4: Verify rendering**
  - Re-run the smoke check and confirm CMS blocks render on public pages without breaking existing fallback content.

### Task 2: Block canvas and preview

**Files:**
- Modify: `components/admin/block-manager.tsx`
- Modify: `components/admin/wordpress-admin-clone.tsx`
- Create: `components/admin/block-canvas.tsx`
- Create: `components/admin/block-preview-panel.tsx`

- [ ] **Step 1: Add failing editor test/smoke assertions**
  - Confirm block ordering, nesting, and preview controls are absent in the current block manager.
- [ ] **Step 2: Implement drag/drop-safe block canvas**
  - Add in-memory reorder/nest controls and serialize the resulting tree to the existing block API.
- [ ] **Step 3: Add live preview panel**
  - Render the current block tree with design CSS variables and responsive preview mode toggles.
- [ ] **Step 4: Verify editor behavior**
  - Confirm save/load preserves order, nesting, and preview updates without page reload.

### Task 3: Revision compare and restore

**Files:**
- Modify: `lib/admin/content-service.ts`
- Modify: `app/api/admin/revisions/route.ts`
- Create: `components/admin/revision-diff.tsx`
- Modify: `components/admin/wordpress-admin-clone.tsx`

- [ ] **Step 1: Add failing revision restore coverage**
  - Confirm revisions can list but not compare before implementation.
- [ ] **Step 2: Implement diff payload generation**
  - Expose old/current snapshot pairs and a simple visual diff model for posts/pages/templates.
- [ ] **Step 3: Implement restore UI**
  - Add compare/restore actions in the editor panel and call the restore API.
- [ ] **Step 4: Verify revisions**
  - Confirm restore creates a new current state and preserves prior revision history.

### Task 4: Media modal and picker

**Files:**
- Modify: `app/api/admin/media/route.ts`
- Create: `components/admin/media-modal.tsx`
- Modify: `components/admin/wordpress-admin-clone.tsx`

- [ ] **Step 1: Add failing picker coverage**
  - Confirm upload/select/reuse/attach flows are missing from the current media UI.
- [ ] **Step 2: Implement modal picker**
  - Add search, select, reuse, metadata editing, and attach/detach actions.
- [ ] **Step 3: Wire picker into content editors**
  - Reuse the modal from post/page/template/block editing and featured image selection.
- [ ] **Step 4: Verify media workflows**
  - Confirm media upload and detach/delete rules still work with the protected DB state.

### Task 5: Design runtime and env safety

**Files:**
- Modify: `lib/design-runtime.ts`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `.env.local`
- Modify: `.env.example`

- [ ] **Step 1: Add failing design runtime assertions**
  - Confirm frontend still needs manual token plumbing and env keys are not documented.
- [ ] **Step 2: Ensure DB-backed tokens are the runtime source**
  - Inject CSS variables from the active `DesignPreset` only.
- [ ] **Step 3: Document production env vars**
  - Add `NEXT_PUBLIC_SITE_URL` and `NEXT_REVALIDATION_SECRET` to the env templates.
- [ ] **Step 4: Verify design and env safety**
  - Confirm a design edit changes runtime tokens after revalidation.

### Task 6: Smoke and verification

**Files:**
- Modify: `scripts/admin-smoke.mjs`
- Modify: `scripts/production-route-smoke.mjs`

- [ ] **Step 1: Add failing smoke checks**
  - Assert `_cms_blocks`, preview, revision restore, and media picker endpoints behave as expected.
- [ ] **Step 2: Extend smoke coverage**
  - Check revalidation paths, active design tokens, and block-template persistence.
- [ ] **Step 3: Run full verification**
  - `npx prisma validate`
  - `npx prisma generate`
  - `npm run typecheck`
  - `npm run lint -- --max-warnings=0 --ignore-pattern .local-logs/**`
  - `npm run admin:smoke`
  - `npm run production:check`
- [ ] **Step 4: Verify no file deletions occurred**
  - Check `git status` and ensure only edits/additions are present.
