# Booking Smart Match Handoff Design

## Feature Summary

After a guest completes the tailor-made booking form, the site should keep the existing automated email submission and then show the guest a clearer next step. The completed brief is matched against the tour catalog, then the success state offers either online payment or direct consultation by email and WhatsApp.

## Primary User Action

The guest reviews matching tour suggestions, then chooses either to pay online for the recommended route or talk directly with a consultant.

## Design Direction

Keep the current calm luxury booking interface. The success state should feel like a concierge handoff: affirmative, low pressure and useful. Use the existing navy, pearl and gold palette with a slightly richer post-submit panel so the two next actions are obvious.

## Scope

Use a smart scoring matcher rather than strict filtering. Match by destination, duration, style, route focus, interests and budget. Show top results in the form summary and again after successful email submission. Payment links prefill `/payment` with booking/lead reference, amount and currency. Consultation links prefill email and WhatsApp text.

## Key States

- During form: summary step shows top matching tours when enough choices exist.
- Submit loading: existing loading behavior remains.
- Success with matches: show lead ID, email confirmation copy, recommended tour cards and two action groups.
- Success without matches: show consultation-first fallback and payment deposit option.
- Error: existing inline form error remains.

## Data Flow

Server pages pass a compact tour catalog into `TailorMadeForm`. The client-side matcher scores this compact catalog against watched form values. On submit, matched tours are included in the lead payload so the automated email can show the recommendations.

## Open Questions

Payment amount uses the selected tour's `priceFromUsd` when available. If no price exists, the payment link uses a configurable consultation deposit fallback.
