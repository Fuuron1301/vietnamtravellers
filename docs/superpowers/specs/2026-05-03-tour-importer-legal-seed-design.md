# Tour Importer Legal Seed Design

Date: 2026-05-03
Status: Approved brief, pending written-spec review

## Feature Summary

Build a safe tour importer and tour-content schema for adding BestPriceTravel-inspired tour inventory into the Ha Long Luxury Travel platform. The system may use public factual references such as tour name, duration, route, price, rating, review count, and source URL, but must not copy protected long-form descriptions, blogs, or branded/watermarked images.

The imported tours are land tours only, not cruises. Each tour should render as a polished luxury journey page with clear thumbnail, gallery, price guide, itinerary, included/excluded services, travel notes, FAQ, and CTA.

## Primary User Action

A traveler should quickly understand whether a tour fits their route, time, budget, and travel style, then click to customize or request a quote.

Editors and developers should be able to add or refresh tour seed data through a predictable importer without manually hand-editing hundreds of objects in `fallback-data.ts`.

## Design Direction

- Register: product UI for the importer/admin data path, brand-led product surface for public tour pages.
- Color strategy: restrained on data/admin surfaces; committed navy/gold luxury treatment on public tour detail blocks already established in the project.
- Theme scene: a traveler researches Vietnam or Indochina tours on a bright desktop or phone screen, comparing price and itinerary details while expecting premium but practical guidance.
- Anchor references: BestPriceTravel for information clarity, Asia Pioneer Travel for destination hub logic, LuxTravel DMC for luxury visual tone.

The implementation must not replicate BestPriceTravel's protected layout or assets verbatim. It should preserve the useful information architecture: fast comparison, visible pricing, route facts, day-by-day itinerary, inclusions, notes, and quote CTA.

## Scope

- Fidelity: production-ready for schema/importer, high-quality for public tour layout improvements.
- Breadth: data schema, importer script, seed data integration, tour listing support, tour detail content sections.
- Interactivity: shipped-quality Next.js routes/components, static data import at build time, optional future WordPress import path.
- Time intent: practical first version that can support hundreds of tours without breaking existing cruise/tour separation.

## Data Strategy

### Source Boundaries

Allowed from public references:

- Tour title
- Duration
- Route or places visited
- Public price and old price when visible
- Rating and review count when visible
- Tour category/style when visible
- Source URL for internal traceability

Not allowed without permission:

- Full copied descriptions
- Full copied blog sections
- Original BestPriceTravel images, thumbnails, videos, or watermarked assets
- Exact proprietary page structure, branded graphics, or downloadable media

### Generated/Original Content

For each imported tour, the platform should create original copy:

- Short excerpt
- Overview paragraph
- Highlights
- Itinerary day summaries
- Included and excluded services
- Travel notes
- FAQ
- SEO title/description
- Blog-style narrative sections

Copy should be written in a polished travel-advisor tone and must not paraphrase protected text too closely.

### Image Strategy

Use only images with safe licensing or user-provided assets:

- Prefer Unsplash/Pexels or a configured legal image provider.
- Use high-resolution URLs, target width at least 1920px, preferably 2400px or higher.
- Store each image with alt text, provider, source URL, width hint, and license note when available.
- Reject or replace images containing visible watermark/logo/copyright badges.
- Never hotlink BestPriceTravel images.

## Proposed Schema

Create a normalized seed format separate from `CmsItem` so raw source facts and generated public content stay clear.

Recommended fields:

- `id`
- `title`
- `slug`
- `country`
- `destinationHub`
- `durationDays`
- `durationLabel`
- `route`
- `places`
- `style`
- `priceFromUsd`
- `oldPriceUsd`
- `rating`
- `reviewCount`
- `sourceUrl`
- `thumbnail`
- `gallery`
- `excerpt`
- `overview`
- `highlights`
- `itinerary`
- `included`
- `excluded`
- `travelNotes`
- `faq`
- `blogSections`
- `seo`

Map this seed into existing `CmsItem` fields:

- `featuredImage` from `thumbnail.url`
- `meta.gallery` from gallery image URLs
- `meta.itinerary` from itinerary rows
- `meta.pricing` from price fields
- `meta.details` from country, route, duration, style, places, rating, reviews, source URL, highlights, includes, excludes, notes, and image attribution
- `content` from generated blog sections rendered as safe HTML or structured sections

## Layout Strategy

### Tour Listing

Listings should support more than 218 tours without hiding most of them:

- Keep featured/highlighted area at the top.
- Add full tour grid with search/filter/sort or pagination.
- Tour card should show thumbnail, duration, route/style, rating, review count, price from, and CTA.
- Avoid showing cruises in tour hubs.

### Tour Detail

Tour detail should become clearer and more premium:

- Hero with large HD thumbnail, H1, rating/reviews, price from, and CTA.
- Fact panel: duration, places, meals/group size if available, operated by/site brand, source-derived factual price note.
- Gallery strip/grid using legal HD images.
- Overview and highlights section.
- Day-by-day itinerary timeline.
- Price guide and inclusions/exclusions.
- Blog-style sections: why go, route experience, best time, food/culture notes, preparation notes.
- FAQ and related tours.

The design should feel inspired by strong travel commerce clarity, not copied from a third-party site.

## Key States

- Default: tours loaded from generated seed data.
- Empty: show a helpful message and CTA to customize a trip.
- Loading: keep existing Next.js route behavior; use skeletons only if client filtering is added.
- Error: importer reports invalid rows with exact file/row/field.
- Partial image match: importer uses fallback legal image and records warning.
- Duplicate slug: importer deduplicates or fails with a clear error.
- Missing price: show `Price on request` and keep CTA.
- Large catalog: listing uses pagination or `show more` to avoid rendering hundreds of cards at once on first load.

## Interaction Model

- Developer runs an importer/build script to convert seed data into generated `CmsItem` data.
- Public visitors browse hub pages, filter/search if implemented, open detail pages, and convert through `Customize this tour` or quote CTA.
- Editors can later move generated data into WordPress with a separate WP import path if needed.

## Content Requirements

For each tour, minimum publishable content:

- Title and slug
- Duration
- Country/hub
- Route or places
- Price or price-on-request fallback
- Thumbnail and at least 3 gallery images
- Excerpt and overview
- At least 3 highlights
- Itinerary rows matching duration or summarized by day ranges for long trips
- Includes/excludes
- SEO title and description
- Source URL kept internally for traceability

## Implementation Notes

Recommended file areas:

- `luxury-travel-next/lib/types.ts`: add seed/image/content section types if needed.
- `luxury-travel-next/lib/fallback-data.ts`: keep existing small handcrafted fallback or import generated tour data from a separate module.
- `luxury-travel-next/data/`: add source seed and generated tour modules.
- `luxury-travel-next/scripts/`: add validation/generation/importer script.
- `luxury-travel-next/components/tour-detail-page.tsx`: render blog sections and richer facts if present.
- `luxury-travel-next/components/hub-page.tsx`: support larger tour lists beyond the first 6.
- `halong-cruise-wp/includes/rest-api.php`: later, if WordPress drives production, increase pagination handling or add page-based fetching in Next.

## Testing And Verification

- Validate seed schema with TypeScript or a small Node script.
- Run generation script and fail on invalid image/source/slug fields.
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run a targeted route smoke test if build/runtime allows.
- Verify no BestPriceTravel image URLs are present in generated public data.
- Verify no `hlt_cruise` items are included in imported tours.

## Open Questions

- Whether the first implementation should seed a small representative batch or attempt the full 218+ catalog immediately.
- Whether image sourcing should be static curated URLs first or API-backed search later.
- Whether generated tour data should remain in Next.js static files or be pushed into WordPress `hlt_tour` posts.
