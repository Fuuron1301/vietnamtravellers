# Travel OS Enterprise Architecture Design

## Goal
Transform the current headless WordPress and Next.js luxury travel platform into an enterprise Travel Operating System with event-driven sync, workflow-controlled publishing, AI-ready content governance and zero-drift public rendering.

The product roots remain fixed:
1. Asia Pioneer Travel structure: country hub pages and SEO internal linking stay first-class.
2. Asiatica Travel conversion: Tailor-made / Customize Your Trip remains the dominant lead path.
3. LuxTravel DMC aesthetic: frontend continues to prioritize luxury imagery, editorial rhythm and premium trust signals.

## Key Decisions
- WordPress remains the single source of truth and the native admin UI. No custom React admin replacement.
- Next.js must not render raw WordPress content. It consumes only validated, safe payloads.
- Enterprise behavior is introduced incrementally inside the existing plugin first, using event logs, meta state, cron workers and REST endpoints.
- AI governance is provider-ready but safe by default. Phase 1 uses deterministic rules and stores AI-style suggestions without requiring paid credentials.
- Real-time sync is modeled as events and queue processing first. External queue infrastructure can be added later without changing editor workflows.

## Five-Layer Architecture

### Layer 1: Content Source Of Truth (WordPress)
WordPress stores all canonical content: countries, tours, travel styles, testimonials, leads, bookings, media, SEO fields and translations. Tour content receives enterprise metadata:
- `workflow_state`: `draft`, `in_review`, `ai_review_pending`, `approved`, `published`, `archived`.
- `sync_state`: `clean`, `outdated`, `invalid`, `processing`, `failed`.
- `content_score`: integer 0-100.
- `last_validation_score`, `last_sync_timestamp`, `payload_hash`.
- validation details: missing fields, warnings, SEO score, language status and AI suggestions.

### Layer 2: Event-Driven Sync Engine
Every content mutation creates a durable event. Initial implementation uses a lightweight WordPress event store, either a custom table `hlt_sync_events` or a private internal CPT if table creation is unavailable.

Required event names:
- `tour.created`
- `tour.updated`
- `tour.deleted`
- `seo.updated`
- `translation.updated`
- `workflow.changed`

Each event stores: event id, entity type, entity id, event name, payload hash, status, retry count, error message, created time, processed time and actor id. Status values are `pending`, `processing`, `clean`, `invalid`, `failed`.

### Layer 3: Validated Data Pipeline
A queue processor normalizes events in this order:
1. Load canonical WordPress post and meta.
2. Run strict schema validation.
3. Run content governance scoring.
4. Build a clean public payload.
5. Persist payload hash and sync status.
6. Trigger frontend revalidation when configured.

If validation fails, the event becomes `invalid`, the tour becomes hidden from public listings, and editors see actionable feedback in WordPress.

### Layer 4: AI Data Governance Engine
The AI layer produces structured feedback, not uncontrolled content changes. It evaluates:
- title clarity
- SEO meta completeness and length
- readability and grammar consistency
- itinerary completeness and logical day sequence
- pricing sanity and format consistency
- duplicate or near-duplicate content signals
- VI/EN/ZH translation completeness and tone consistency
- UX completeness for conversion readiness

Content score bands:
- `<70`: blocked from frontend.
- `70-84`: editor warning, not publish-ready.
- `85-94`: publish-ready.
- `95+`: featured-eligible.

Auto-fix mode can generate draft suggestions for SEO meta, itinerary improvements, translation repairs, pricing normalization and CTA wording. Editors must apply suggestions explicitly unless a future admin setting enables controlled auto-apply.

### Layer 5: Frontend Experience Engine
Next.js renders only clean content. It uses validated endpoints and fallback-safe rendering:
- hub pages use only clean country/tour clusters.
- tour detail pages return not found or fallback safe pages when content is invalid.
- SEO schema is injected only from validated data.
- ISR/revalidation targets the changed hub, tour, sitemap and related internal-link clusters.

## Workflow Engine
Workflow states control visibility and responsibilities:
- `draft`: editor is writing content.
- `in_review`: SEO/content reviewer checks the tour.
- `ai_review_pending`: event queue and AI governance are processing.
- `approved`: content passes governance and can be published.
- `published`: public-visible only when sync state is `clean` and score is at least 85.
- `archived`: hidden from frontend but retained in admin.

Role mapping:
- Admin: full control, settings, manual override and queue repair.
- Editor: edit content and request review.
- SEO Specialist: approve SEO fields and schema readiness.
- AI Validator: run governance actions and apply suggestions.
- Sales Agent: view leads/bookings and read tour readiness, no schema edits by default.

## WordPress Admin Enhancements
Admin UI stays native. Enhancements are metaboxes, table columns, filters, notices and bulk actions.

New panels:
- `Travel OS Status`: workflow state, sync state, last event, last sync time, payload hash.
- `AI Content Intelligence`: content score, SEO score, itinerary logic, pricing checks, translation status and suggestions.
- `Queue Diagnostics`: latest events, failures, retry actions and frontend revalidation result.

Smart actions:
- `Run AI Validation`
- `AI Auto-Fix Content`
- `Generate SEO Pack`
- `Fix Translations`
- `Optimize Itinerary`
- `Sync to Frontend`
- `Repair Sync Drift`

Bulk actions:
- bulk AI validation
- bulk SEO regeneration
- bulk translation check
- bulk sync repair
- bulk workflow transition to review

## Strict Data Schema
A public tour payload is valid only when these fields pass:
- title, slug, country, duration, price range
- itinerary array with non-empty day title and body
- highlights, includes, excludes
- gallery with valid image URLs
- SEO title, SEO description, H1, canonical or clean slug fallback
- FAQ when schema is enabled
- VI/EN/ZH translation fields
- workflow state approved or published
- sync state clean
- content score at least 85 for public rendering

The safe payload must include defaults for optional fields: travel style, best time to visit, difficulty level, private group flag, luxury rating, fallback image and empty arrays for repeatable sections.

## Zero Data Drift Strategy
The system treats drift as a detectable failure state, not a manual cleanup task.

Rules:
- WordPress save creates an event and marks entity `outdated` until processed.
- Public REST list endpoints exclude non-clean tours.
- Single tour endpoints return 404 for invalid or stale public content.
- Payload hash is compared after validation. Changed hash triggers cache revalidation.
- Failed events retain error messages and retry count.
- Scheduled drift scan re-validates tours and compares stored hash with current safe payload hash.

## Multi-Language Synchronization
VI is the canonical source language for editorial intent unless a tour explicitly sets another source locale. EN and ZH are localized variants, not direct raw copies.

Validation checks:
- all required language fields exist
- translated slugs are present and unique
- pricing and duration are semantically consistent across languages
- SEO title and description meet length rules per locale
- tone remains premium and conversion-focused

AI suggestions can propose missing translations, but editor approval is required before publishing.

## Frontend Safe-Render Rules
Next.js must consume only the validated API layer:
- no direct use of raw WordPress post meta in page components
- normalize every API response through typed parsers
- image fallback is mandatory
- arrays default to empty arrays
- missing SEO fields use controlled fallback metadata
- invalid tour detail pages use `notFound()` or a controlled unavailable state
- sitemap includes clean public URLs only

## Performance And Sync Delivery
Initial delivery uses WordPress cron and Next.js ISR hooks:
- queue events are processed in small batches
- failed jobs retry with bounded attempts
- frontend revalidation URL and secret are environment-configured
- hub pages revalidate when any child tour changes
- sitemap and robots remain generated from clean data only

Future externalization path:
- replace WP cron processor with queue worker
- move event store to PostgreSQL or managed queue
- add observability dashboard
- add AI provider calls with rate limits and audit logs

## Error Handling
- Invalid tour data blocks public rendering but never blocks WordPress editing.
- AI provider failures do not erase deterministic validation results.
- Queue failures are visible in admin and retryable.
- Frontend revalidation failures mark sync state `failed` and preserve the last clean public payload.
- Destructive actions such as archive/delete create events and invalidate frontend cache.

## Testing Strategy
- PHP unit-style tests for validation, scoring, workflow transitions and event creation where the local WP test harness is available.
- REST smoke tests for list filtering, invalid single tour 404 and safe payload defaults.
- Next.js tests for typed parser fallback behavior and sitemap filtering.
- Manual admin QA for metaboxes, columns, filters, bulk actions and smart action nonces.
- Verification commands remain: frontend governance, typecheck, lint, build and npm audit.

## Implementation Phases

### Phase 1: Enterprise Foundation
Build event store, workflow metadata, sync state matrix, deterministic governance score, admin panels and validated REST filtering. No external AI dependency.

### Phase 2: Sync And Revalidation
Add queue processor, payload hashing, Next.js revalidation hook, drift scan and queue diagnostics.

### Phase 3: AI Provider Layer
Add provider abstraction, prompt contracts, structured AI suggestions, audit log and manual apply controls.

### Phase 4: SaaS-Grade Hardening
Add multi-tenant-ready settings, external queue option, observability, role capability refinements and more complete automated tests.
