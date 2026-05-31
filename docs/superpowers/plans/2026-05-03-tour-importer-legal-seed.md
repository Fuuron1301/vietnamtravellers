# Tour Importer Legal Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a legal tour seed importer that maps public factual tour references into rich original `CmsItem` tour data, then render large tour catalogs and premium tour detail content without importing cruises or third-party copyrighted media.

**Architecture:** Store source facts in `data/bestprice-public-tour-facts.json`, legal image pools in `data/legal-tour-images.json`, and generated `CmsItem` data in `data/generated-legal-tours.json`. A Node generator validates source/image data and writes generated tours; Next.js imports those generated tours into existing fallback data while UI components render the larger catalog and structured detail sections.

**Tech Stack:** Next.js 16 App Router, React 18, TypeScript strict mode, JSON seed files, Node `.mjs` scripts with built-in `assert`, Tailwind CSS utility classes.

---

### Task 1: Add Importer Red Test

**Files:**
- Create: `luxury-travel-next/scripts/test-tour-importer.mjs`

- [ ] **Step 1: Write the failing test**

Create `luxury-travel-next/scripts/test-tour-importer.mjs` with Node assertions that import `generateToursFromFacts` from `scripts/generate-legal-tour-data.mjs`. The test must verify: generated items are `hlt_tour`, source URLs are preserved in `meta.details.sourceUrl`, generated image URLs do not contain `bestpricetravel` or `cloudfront`, pricing maps to `meta.pricing`, and generated blog sections exist.

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-tour-importer.mjs`

Expected: FAIL with `Cannot find module` or missing `generate-legal-tour-data.mjs`, proving implementation is not present yet.

### Task 2: Implement Generator And Curated Seed Data

**Files:**
- Create: `luxury-travel-next/scripts/generate-legal-tour-data.mjs`
- Create: `luxury-travel-next/data/bestprice-public-tour-facts.json`
- Create: `luxury-travel-next/data/legal-tour-images.json`
- Create: `luxury-travel-next/data/generated-legal-tours.json`
- Modify: `luxury-travel-next/package.json`

- [ ] **Step 1: Add legal image pools**

Create `data/legal-tour-images.json` with HD/FHD/4K Unsplash image URLs grouped by place/style. Each item must include `url`, `alt`, `provider`, `sourceUrl`, `license`, `width`, and `height`.

- [ ] **Step 2: Add public source facts**

Create `data/bestprice-public-tour-facts.json` with public factual fields only: `title`, `sourceUrl`, `country`, `route`, `places`, `durationDays`, `durationLabel`, `style`, `priceFromUsd`, `oldPriceUsd`, `rating`, `reviewCount`, and `categories`. Do not store BestPrice image URLs, copied descriptions, copied highlights, or copied reviews.

- [ ] **Step 3: Implement generator**

Create `scripts/generate-legal-tour-data.mjs` exporting `generateToursFromFacts`, `validateFacts`, `selectImages`, and `tourFactToCmsItem`. Generated tours must produce original excerpts, overview content, highlights, itinerary summaries, includes/excludes, travel notes, FAQ, pricing, SEO, gallery, and `meta.details.blogSections`.

- [ ] **Step 4: Add package scripts**

Add `tours:generate` and `tours:test` scripts to `package.json`:

```json
"tours:generate": "node scripts/generate-legal-tour-data.mjs",
"tours:test": "node scripts/test-tour-importer.mjs"
```

- [ ] **Step 5: Run the importer test**

Run: `npm run tours:test`

Expected: PASS with assertions confirming legal generated tour data.

- [ ] **Step 6: Generate catalog**

Run: `npm run tours:generate`

Expected: `data/generated-legal-tours.json` written with all valid source facts and no rejected image URLs.

### Task 3: Wire Generated Tours Into Existing CMS Fallback

**Files:**
- Modify: `luxury-travel-next/lib/types.ts`
- Modify: `luxury-travel-next/lib/fallback-data.ts`

- [ ] **Step 1: Add optional structured detail types**

Extend `lib/types.ts` with reusable optional detail shapes for imported tour images and blog sections while preserving `CmsItem.meta.details` compatibility.

- [ ] **Step 2: Import generated tour JSON**

Modify `lib/fallback-data.ts` to import `generated-legal-tours.json`, type it as `CmsItem[]`, remove duplicates by slug, and append generated tours after existing hand-crafted fallback tours.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS or only pre-existing unrelated errors; fix new errors in touched files.

### Task 4: Render Large Tour Catalogs On Hub Pages

**Files:**
- Create: `luxury-travel-next/components/tour-catalog.tsx`
- Modify: `luxury-travel-next/components/hub-page.tsx`

- [ ] **Step 1: Add catalog component**

Create a client component with search, style filter, duration filter, budget filter, result count, 12-card initial render, and load-more behavior. It must use existing `TourCard` and not render cruise items.

- [ ] **Step 2: Replace six-card hub slice**

Modify `components/hub-page.tsx` so the tour section uses `TourCatalog` for the full filtered hub list instead of `featured.slice(0, 6)`.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS or only pre-existing unrelated errors; fix new component typing issues.

### Task 5: Render Premium Imported Tour Detail Sections

**Files:**
- Modify: `luxury-travel-next/components/tour-detail-page.tsx`

- [ ] **Step 1: Add safe meta readers**

Add helper functions in `tour-detail-page.tsx` to read string arrays and blog-section records safely from `tour.meta.details`.

- [ ] **Step 2: Upgrade detail layout**

Add a fact panel beside gallery, rating/reviews, route/places, price anchor, overview/highlights, blog sections, travel notes, and image attribution notes when present. Keep existing itinerary, pricing, FAQ, related tours, and TailorMadeForm.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS or only pre-existing unrelated errors; fix new UI typing issues.

### Task 6: Verify The End-To-End Change

**Files:**
- No new files; verification only.

- [ ] **Step 1: Run importer tests**

Run: `npm run tours:test`

Expected: PASS.

- [ ] **Step 2: Run generation**

Run: `npm run tours:generate`

Expected: generated JSON count matches source facts and generator reports no BestPrice image URLs.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Expected: PASS or report existing repository lint issues separately from current edits.

- [ ] **Step 5: Run production route smoke if practical**

Run: `npm run smoke:routes`

Expected: PASS if required server dependencies are running; if not, record exact failure and give manual route checks.
