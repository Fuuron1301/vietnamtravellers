# Ha Long Luxury Headless CMS

This folder is now a WordPress plugin package, not a public frontend theme.

## Install

1. Copy `halong-cruise-wp` to `wp-content/plugins/halong-cruise-wp`.
2. In WordPress admin, open `Plugins` and activate `Ha Long Luxury Headless CMS`.
3. Use the standard WordPress admin to manage:
   - Countries
   - Tours
   - Travel Styles
   - Posts
   - Testimonials
   - Leads
   - Bookings
   - Media Library
4. Set permalinks to `Post name`.
5. Configure the Next.js frontend with `WORDPRESS_API_URL=https://your-domain.com/wp-json/hlt/v1`.

## REST API

- `GET /wp-json/hlt/v1/content/countries`
- `GET /wp-json/hlt/v1/content/tours` returns only tours that pass the data health checks.
- `GET /wp-json/hlt/v1/content/styles`
- `GET /wp-json/hlt/v1/content/posts`
- `GET /wp-json/hlt/v1/content/testimonials`
- `GET /wp-json/hlt/v1/content/tours/{slug}` returns a SEO-safe tour payload or `404` when the tour is incomplete.
- `POST /wp-json/hlt/v1/lead`
- `POST /wp-json/hlt/v1/booking`

## SEO Fields

Each content item supports meta title, meta description, focus keyword, H1, canonical URL, OG image, robots directive, schema JSON, and translations JSON.

## Lead Handling

Tailor-made form submissions are saved as `Leads` in wp-admin. The `Export CSV` submenu exports inquiries for sales follow-up.

## Tour Data Governance

Tours are validated before they are exposed to the Next.js frontend. The health engine checks title, slug, country, duration, price range, itinerary, highlights, includes, excludes, gallery URLs, SEO title/description and VI/EN/ZH translation completeness.

In the native WordPress admin, tour editors get:

- `Tour Data Health Panel` metabox with completion, SEO score, language status, warnings and quick actions.
- Tour list columns for thumbnail, country, duration, price range, SEO score, sync status, languages and missing field count.
- Filters for sync status, completion and missing translations.
- Bulk actions for validation, sync refresh, SEO suggestions and translation checks.
- Hourly cron validation through `hlt_validate_tours_event`.

## Travel OS Enterprise Foundation

Travel OS adds workflow state, sync state, event logging, deterministic AI-ready content scoring and queue-based frontend revalidation.

Public tours require:
- workflow state `approved` or `published`
- sync state `clean`
- validation status `synced`
- content score `85+`

Set `Settings > Travel OS` with the Next.js revalidation URL and shared secret.
