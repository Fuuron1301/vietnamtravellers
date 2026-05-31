# Cinematic 3D Luxury Travel Platform Design

## Goal
Add a full cinematic 3D experience layer while preserving the project roots: Asia Pioneer SEO hub architecture, Asiatica tailor-made conversion flow, and LuxTravel DMC luxury visual identity.

## Strategy
Use progressive enhancement. SEO-first HTML, H1, hub copy, internal links, tours, FAQ schema and booking form remain server-rendered. WebGL scenes lazy-load client-side and fall back to static cinematic imagery on reduced-motion or low-power contexts.

## 3D Components
- CinematicHeroScene: React Three Fiber scene with layered planes, floating islands, water, warm gold light and cursor camera tilt.
- DestinationCard3D: CSS/Framer 3D card with floating sine motion, hover tilt, image zoom and glow border.
- ParallaxDepthLayer: multi-layer cinematic section backgrounds.
- MagneticButton: cursor-follow CTA with spring motion and glow.
- CinematicBookingShell: booking wizard visual upgrade with step scenery and floating summary.

## Non-negotiable Roots
- Hub routes stay `/vietnam-tours`, `/thailand-tours`, `/cambodia-tours`, `/laos-tours`, `/multi-country-tours`.
- Sticky CTA text remains `Tailor-made / Customize Your Trip`, appears globally, delayed and pulsing.
- Visuals remain luxury/editorial, not game-like.
