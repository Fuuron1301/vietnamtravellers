# Tour Full Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** full tour detail editor in admin that maps every public section to editable DB-backed fields.

**Architecture:** extend admin content API to persist public tour meta keys, extend CMS runtime to merge those keys into tour data, and expand tour editor UI into sectioned fields with preview hints. Keep mirror raw as fallback only.

**Tech Stack:** Next.js App Router, React, Prisma, PostgreSQL, Zod, Tailwind.

---

### Task 1: Tour meta persistence
**Files:**
- Modify: `lib/admin/content-service.ts`
- Modify: `lib/cms-db.ts`
- Modify: `lib/admin/schemas.ts`

- [ ] Add post meta support for public tour sections: `_public_details`, `_public_pricing`, `_public_faq`, `_google_maps_embed`.
- [ ] Merge those keys into public tour runtime before mirror fallback.
- [ ] Accept and validate JSON payloads for itinerary/pricing/faq.
- [ ] Run `npm run typecheck`.

### Task 2: Tour editor UI
**Files:**
- Modify: `components/admin/wordpress-admin-clone.tsx`

- [ ] Add Tour Full Editor tabs and fields.
- [ ] Expose every public section label in editor.
- [ ] Save structured JSON back to API.
- [ ] Run `npm run lint -- --max-warnings=0 --ignore-pattern .local-logs/**`.

### Task 3: Verification
**Files:**
- None

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint -- --max-warnings=0 --ignore-pattern .local-logs/**`.
- [ ] Run `npm run smoke:routes`.
- [ ] Run `npm run production:check`.
