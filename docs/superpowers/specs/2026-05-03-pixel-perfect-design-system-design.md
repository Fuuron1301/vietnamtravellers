# Pixel-Perfect Luxury Travel Design System Design

## Goal
Refactor the Next.js frontend into a five-layer design system capable of recreating LuxTravel DMC-level luxury travel UI structure consistently at component level, while preserving the existing WordPress CMS, API contracts, SEO routes and booking flow.

## Layers
1. Design Tokens: strict 4px spacing scale, navy/ivory/gold palette, gray scale, radius, shadows and transition tokens.
2. Typography: reusable editorial components for H1/H2/H3, eyebrow, lead and body copy with fixed responsive scale.
3. Grid/Layout: container, section, 12-column grid, split layout and page shell rules with 1440px page max and 1200px content max.
4. Atomic Components: CTA buttons, destination cards, tour cards, accordion, booking shell and navigation bar.
5. Motion Engine: Framer Motion presets for fadeUp, stagger, imageZoom, hoverLift, nav scroll, slide step and parallax-like drift.

## Page Blueprints
Home composes HeroSection, DestinationMosaic, FeaturedTours, WhyChooseUs, JourneyFlow, TestimonialCinema, BlogPreview and FinalCTA. Hub pages use HeroSection, SEO block, filter bar, tour grid, FAQ and CTA. Tour detail uses hero, masonry gallery, sticky booking sidebar, itinerary timeline, includes/excludes, pricing, FAQ and CTA. Blog pages use editorial card systems.

## Constraints
Do not copy protected assets or code. Do not change WordPress plugin/backend/API routes. Replace arbitrary spacing in touched components with tokenized Tailwind values.
