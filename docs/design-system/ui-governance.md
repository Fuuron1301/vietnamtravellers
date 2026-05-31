# UI Governance Rules

This project is governed by three product roots:

1. Asia Pioneer Travel SEO skeleton: country hub pages, destination menu structure, tour grids, blog-to-hub linking and FAQ schema.
2. Asiatica Travel conversion flow: the Tailor-made / Customize Your Trip CTA must remain highly visible and the BookingWizard must ask one professional planning question per step.
3. LuxTravel DMC / modern Asia Pioneer visual layer: cinematic imagery, restrained navy/ivory/gold palette, line icons and editorial luxury typography.

## Hard Rules

- No arbitrary Tailwind values in app/components source.
- Spacing must use the governed scale only: 0, 4, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128.
- Typography must map to display 80/64/48, heading 40/32/24 or body 18/16/14.
- Colors must come from navy, ivory, gold, pearl and gray tokens.
- Motion must use 200ms, 400ms or 800ms durations and the approved luxury easing curve.
- Pages are component compositions, not custom visual layouts.

## Enforcement

Run:

```bash
npm run governance:check
```

The script validates component registry completeness, page blueprints, root references, visual fingerprint output and source-level token violations.
