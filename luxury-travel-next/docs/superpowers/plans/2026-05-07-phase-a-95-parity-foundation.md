# Phase A 95 Parity Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the WordPress-like metadata, audit, design-token, block/template, and runtime foundations needed to move the admin toward WordPress + Elementor-style parity.

**Architecture:** Keep the existing wp-admin-like shell and Prisma CMS runtime. Add normalized DB tables, focused service modules, secure admin APIs, frontend runtime adapters, and lightweight admin screens without rewriting existing admin pages.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma/PostgreSQL, Zod, RBAC, CSRF, Tailwind/CSS variables.

---

## Tasks

- [ ] Baseline: run typecheck, lint, prisma validate/status, admin smoke.
- [ ] RED smoke: add design/blocks/meta checks to `scripts/admin-smoke.mjs` and confirm they fail before implementation.
- [ ] Schema: add metadata/design/block/audit models and migration.
- [ ] Services: add `meta-service`, `audit-service`, `design-service`, `block-service`.
- [ ] APIs: add `/api/admin/design`, `/api/admin/blocks`, `/api/admin/meta` with RBAC, CSRF, Zod, audit, revalidate tags.
- [ ] Runtime: add design CSS-variable runtime and block renderer foundation.
- [ ] Admin UI: add Design and Blocks sections to the existing wp-admin clone.
- [ ] Seed: add idempotent active design preset, reusable CTA block, homepage template.
- [ ] Verification: run Prisma, seed, typecheck, lint, admin smoke, production check where applicable.
