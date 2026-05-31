# Luxury UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Next.js frontend into a LuxTravel-inspired luxury UI while preserving SEO hub architecture and booking flow.

**Architecture:** Add shared design tokens and motion primitives, then refactor visual components page-by-page. Keep API and content contracts unchanged.

**Tech Stack:** Next.js 14, Tailwind CSS, Framer Motion, React Hook Form, TypeScript.

---

### Task 1: Design System
- [ ] Update Tailwind colors, shadows, radius, typography.
- [ ] Update globals with luxury utility classes and smooth defaults.
- [ ] Add shared motion variants.

### Task 2: Navigation and Core Cards
- [ ] Redesign scroll-aware glass header.
- [ ] Redesign sticky CTA.
- [ ] Redesign tour cards with image-first hover reveal.

### Task 3: Home Page
- [ ] Rebuild home structure: 100vh hero, inquiry strip, USP blocks, editorial intro, featured tours horizontal scroll, asym destination grid, journey flow, testimonials, final CTA.

### Task 4: Conversion Form
- [ ] Upgrade tailor-made wizard with luxury progress, step transitions, large touch fields, summary step and stronger submit CTA.

### Task 5: Hub/Tour/Blog Pages
- [ ] Redesign country hub pages with SEO copy, destination grid, featured tours and embedded CTA form.
- [ ] Redesign tour detail with hero, gallery, sticky booking card, timeline and FAQ.
- [ ] Redesign blog index/detail in editorial style.

### Task 6: Verification
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
