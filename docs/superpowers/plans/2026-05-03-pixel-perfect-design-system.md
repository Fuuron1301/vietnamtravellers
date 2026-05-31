# Pixel-Perfect Luxury Travel Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable LuxTravel-style design system and refactor the public frontend pages to use it.

**Architecture:** Add token/motion foundations, create layout and UI atomic components, then compose section components and refactor existing pages around page blueprints. Backend/API contracts remain unchanged.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, Framer Motion, TypeScript, React Hook Form.

---

### Task 1: Foundations
- [ ] Create `lib/design-tokens.ts` with spacing, colors, typography, grid and motion constants.
- [ ] Replace `tailwind.config.js` extension with token-aligned values.
- [ ] Replace globals with design-system utility classes.
- [ ] Expand `lib/motion.ts` with strict presets.

### Task 2: Layout + UI Atoms
- [ ] Create layout components: `Container`, `Section`, `Grid12`, `SplitLayout`.
- [ ] Create typography components: `Eyebrow`, `Heading`, `Lead`, `BodyText`.
- [ ] Create UI atoms: `CTAButton`, `DestinationCard`, `TourCard`, `Accordion`.
- [ ] Replace old card exports with compatibility wrappers where needed.

### Task 3: Section Components
- [ ] Create HeroSection, DestinationMosaic, FeaturedTours, WhyChooseUs, JourneyFlow, TestimonialCinema, BlogPreview, FinalCTA.
- [ ] Ensure each section consumes CMS data and tokenized spacing.

### Task 4: Page Refactor
- [ ] Refactor Home to compose section components.
- [ ] Refactor Hub page with hero, SEO block, filter bar, tour grid, FAQ and CTA.
- [ ] Refactor Tour detail with gallery, sticky booking, timeline, pricing, FAQ.
- [ ] Refactor Blog/style/customize pages to use tokens and layout components.

### Task 5: Verification
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
