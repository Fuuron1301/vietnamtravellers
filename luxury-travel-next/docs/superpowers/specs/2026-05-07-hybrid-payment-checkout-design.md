# Hybrid Payment Checkout Design

## Feature Summary

Build a secure-looking online payment page for guests who already have a booking or quote. VietQR should generate a real bank-transfer QR when bank environment variables are configured. MoMo, VNPay, OnePay, PayPal, NAPAS and cards should show demo payment intents until official gateway credentials and adapters are added.

## Primary User Action

The guest selects a payment method, confirms the booking reference and amount, then scans or copies the generated payment instruction.

## Design Direction

Use a restrained luxury travel surface with a committed dark teal payment rail inspired by the existing footer payment badge strip. The physical scene is a guest reviewing a quote at night before confirming a private journey, so the surface should feel calm, secure and concierge-led rather than checkout-pressure heavy. Keep existing Manrope and Playfair Display identity choices.

## Scope

Production-ready page shell and safe payment-session API. VietQR is real when configured through `VIETQR_BANK_ID`, `VIETQR_ACCOUNT_NO` and `VIETQR_ACCOUNT_NAME`; other gateways are demo-only with clear copy.

## Layout Strategy

Use a two-column desktop layout: left side for payment context, method selection and trust notes; right side for the generated QR, copyable transfer details and next-step messaging. On mobile, method selection becomes a horizontal wrap/scroll area and the QR panel moves directly below the amount inputs.

## Key States

- Default: generated session for the default VietQR selection.
- Loading: QR panel shows a secure generation message.
- Error: invalid amount, missing booking reference or failed API response is shown inline.
- VietQR configured: real VietQR image URL is returned.
- VietQR missing config: QR falls back to a demo instruction and tells the admin which env vars are needed.
- Demo gateways: QR encodes a demo intent and labels the method as sandbox/demo.

## Interaction Model

Changing amount, currency, booking reference or method regenerates the payment session after a short debounce. Buttons copy the transfer note or QR payload to clipboard. No payment is captured by demo gateways.

## Content Requirements

Use clear labels: booking reference, amount, currency, payment method, QR status, copy payment note, copy QR data. Security copy should say the proposal is checked before payment and payment details are handled by configured gateways.

## Open Questions

Official merchant credentials and return URLs are still required before non-VietQR gateways can process real money.
