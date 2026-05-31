# Governed Design Platform Design

## Goal
Transform the frontend design system into a governed design platform that prevents UI drift while preserving the product roots:
1. Asia Pioneer Travel style SEO skeleton: destination menu and country hub pages for Vietnam, Thailand, Cambodia, Laos and Multi-country tours.
2. Asiatica Travel style conversion: dominant Tailor-made / Customize Your Trip CTA and professional multi-step inquiry form.
3. LuxTravel DMC / modern Asia Pioneer visual layer: large sharp imagery, luxury restraint, line icons and editorial travel aesthetics.

## Governance Layers
- UI contracts: every registered component declares spacing, typography, color, layout, motion, interaction and root-reference obligations.
- Component registry: required components are registered with deterministic contracts and page usage rules.
- Page composition engine: pages are declared as compositions of governed components, not ad-hoc layouts.
- Validation rules: source scanning rejects arbitrary Tailwind values, disallowed spacing tokens, unapproved hex colors, invalid motion durations and missing registry contracts.
- Visual determinism: each component contract produces a baseline hash so contract drift is visible in CI.

## Strict Tokens
Spacing: 4, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128 only.
Typography: display 80/64/48, headings 40/32/24, body 18/16/14.
Motion: 200ms micro, 400ms transition, 800ms section entry, easing cubic-bezier(0.22, 1, 0.36, 1).
Colors: Midnight Navy, Ivory, Gold and gray 50-900 only.

## Enforcement
`npm run governance:check` runs a Node validator. It verifies registry completeness, page blueprints, contract hashes and source-level token violations. The validator is conceptual-enforcement for visual governance and should be run with typecheck/lint/build before delivery.
