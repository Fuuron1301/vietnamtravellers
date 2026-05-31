# WordPress Admin 90 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the local Next.js admin into a production-grade WordPress-like CMS with verified DB runtime, session/RBAC/CSRF security, complete CMS workflows, and stricter wp-admin behavior parity.

**Architecture:** Keep the existing admin shell and API routes, but harden the shared admin backend primitives first: DB setup, session validation, CSRF validation, request schemas, and consistent API responses. Then progressively bind the current UI to relational CMS APIs for posts/pages/tours/media/menus instead of JSON/local fallback.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Zod, HTTP-only sessions, double-submit CSRF token.

---

## File Map

- `lib/admin/auth.ts`: session lookup, page guard, mutation capability guard, CSRF helpers.
- `lib/admin/api.ts`: response envelope, JSON parsing, Zod validation helpers.
- `middleware.ts`: coarse admin route gate only; server page guard validates real session.
- `app/admin/page.tsx`, `app/admin/[section]/page.tsx`: fail-closed server session validation.
- `app/api/admin/**/route.ts`: RBAC + CSRF + validation per admin route.
- `components/admin/wordpress-admin-clone.tsx`: admin fetch wrapper, nonce propagation, real list pagination/bulk actions, editor hooks.
- `components/admin/site-content-editor.tsx`: remove JSON-as-primary copy, route saves through settings/menu APIs.
- `scripts/seed-admin-cms.mjs`: deterministic seed for roles, users, taxonomy, menu, settings, sample content.
- `scripts/admin-smoke.mjs`: unauthenticated/authenticated API smoke checks.

## Phase Tasks

### Task 1: Baseline and DB Setup
- [ ] Run `npm run typecheck` and lint before edits.
- [ ] Add/verify local DB setup docs and scripts.
- [ ] Add deterministic CMS seed script.
- [ ] Run `npx prisma generate` and Prisma status/migrate command.

### Task 2: Auth, RBAC, CSRF
- [ ] Add CSRF cookie/header helper using double-submit token.
- [ ] Set CSRF cookie on login and expose current token through `/api/admin/auth/me`.
- [ ] Clear CSRF cookie on logout.
- [ ] Add `requireAdminMutationCapability()` and use it on every admin mutation route.
- [ ] Add server-side admin page guard using the session DB, not cookie presence.

### Task 3: API Validation Contract
- [ ] Add Zod-based `readValidatedJson()` helper.
- [ ] Add schemas for posts/pages/tours/products, media metadata, menus, taxonomy, settings, users, revisions, autosaves.
- [ ] Return consistent 400 validation errors.
- [ ] Ensure list routes expose pagination metadata consistently.

### Task 4: CMS Workflow Completion
- [ ] Expose taxonomy/media/page parent/tour metadata fields in editor payloads.
- [ ] Add autosave GET/recover API and UI warning.
- [ ] Add revisions list/restore UI.
- [ ] Add media delete/update/select modal workflow.
- [ ] Add normalized menu builder with nested drag/drop save.

### Task 5: Frontend CMS Synchronization
- [ ] Make header/footer/menu use DB options/menus first.
- [ ] Make blog/tour/page reads DB-first and production fail closed if CMS DB is unavailable.
- [ ] Remove JSON file as primary CMS source; keep fallback only for explicit demo mode.
- [ ] Revalidate tags after all CMS mutations.

### Task 6: Verification and Strict Re-Audit
- [ ] Run `npx prisma generate`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint -- --max-warnings=0 --ignore-pattern .local-logs/**`.
- [ ] Run admin smoke tests for 401/403/400 and authenticated CRUD when DB is available.
- [ ] Produce final strict parity report with remaining WordPress Core differences.
