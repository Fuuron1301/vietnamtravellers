# Hybrid Payment Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hybrid online payment page with automatic QR generation for VietQR and demo gateway intents.

**Architecture:** Keep payment intent construction in a small pure TypeScript module, expose it through a safe Next.js API route, and render the UI with a dedicated client component. Avoid wiring real non-VietQR gateway charges until official credentials and provider adapters exist.

**Tech Stack:** Next.js App Router, TypeScript, React client component, existing Tailwind design tokens.

---

### Task 1: Payment Session Model

**Files:**
- Create: `scripts/test-payment-session.mjs`
- Create: `lib/payment-session.ts`

- [ ] Write a failing Node test that imports `buildPaymentSession`, `normalizePaymentRequest` and `paymentMethods` from `lib/payment-session.ts`.
- [ ] Run `node --experimental-strip-types scripts/test-payment-session.mjs`; expect module-not-found failure before implementation.
- [ ] Implement method metadata, request validation, VietQR URL generation and demo payment payload generation.
- [ ] Re-run the test; expect pass.

### Task 2: Payment Session API

**Files:**
- Create: `app/api/payments/session/route.ts`

- [ ] Add a POST route that rate-limits payment-session creation.
- [ ] Parse JSON, validate through `normalizePaymentRequest`, build the session and return JSON.
- [ ] Return status `400` for invalid request data and `429` for rate limiting.

### Task 3: Checkout UI

**Files:**
- Create: `components/payment/payment-method-badge.tsx`
- Create: `components/payment/checkout-experience.tsx`
- Create: `app/payment/page.tsx`

- [ ] Build payment badges for VietQR, NAPAS, MoMo, VNPay, Visa, Mastercard, OnePay and PayPal.
- [ ] Build the client-side checkout experience with amount, currency, booking reference and method controls.
- [ ] Render the generated QR image, session status, copy buttons and clear demo/real labels.
- [ ] Add the `/payment/` page metadata and page shell.

### Task 4: Verification

**Files:**
- Modify only if needed: project config files.

- [ ] Run `node --experimental-strip-types scripts/test-payment-session.mjs`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint` if typecheck passes.
