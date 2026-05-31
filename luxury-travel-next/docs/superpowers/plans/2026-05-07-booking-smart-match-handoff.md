# Booking Smart Match Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add smart tour recommendations and post-submit payment/consultation choices to the tailor-made booking form.

**Architecture:** Create a pure matcher module that can run on server and client, pass compact catalog data from server pages to the client form, and preserve the existing `/api/leads` email flow. The payment page accepts query defaults for booking reference and amount.

**Tech Stack:** Next.js App Router, TypeScript, React Hook Form, existing Tailwind design system.

---

### Task 1: Matcher

**Files:**
- Create: `scripts/test-booking-tour-matcher.mjs`
- Create: `lib/booking-tour-matcher.ts`

- [ ] Write a failing test for destination, duration, style and budget matching.
- [ ] Implement compact catalog mapping, scoring and top-match selection.
- [ ] Re-run matcher test and confirm pass.

### Task 2: Lead Payload

**Files:**
- Modify: `lib/types.ts`
- Modify: `app/api/leads/route.ts`
- Modify: `lib/email.ts`

- [ ] Allow optional `matchedTours` in lead payload.
- [ ] Include matched tours in the admin email template.

### Task 3: Form Handoff UI

**Files:**
- Modify: `components/tailor-made-form.tsx`
- Modify: `app/customize-your-trip/page.tsx`
- Modify: `components/hub-page.tsx`
- Modify: `app/cruise/[slug]/page.tsx`

- [ ] Pass compact tour catalog into the form.
- [ ] Show recommended tours on summary and success.
- [ ] After submit, show Pay Online and Consult Directly options.

### Task 4: Payment Query Prefill

**Files:**
- Modify: `components/payment/checkout-experience.tsx`
- Modify: `app/payment/page.tsx`

- [ ] Accept initial booking reference, amount and currency props from URL search params.
- [ ] Keep existing payment behavior unchanged when no query is present.

### Task 5: Verification

**Files:**
- No new production files unless fixes are needed.

- [ ] Run matcher and payment tests.
- [ ] Run `npm run typecheck`.
- [ ] Run targeted ESLint for touched files.
- [ ] Run `npm run build` if typecheck passes.
