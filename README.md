# TWCF Donation Checkout

This version is donation-only.

The donate page collects:
- donation amount
- donor name
- donor email
- optional note/dedication

The checkout page collects only:
- payment information

## Files

- `public/checkout.html`
- `public/checkout.css`
- `public/checkout.js`
- `public/complete.html`
- `public/complete.js`
- `server.js`
- `donate-integration.js`

## Setup

1. Put your Stripe secret test key in `.env`:

   STRIPE_SECRET_KEY=sk_test_...
   DOMAIN=http://localhost:4242
   PORT=4242

2. Put your Stripe publishable test key in:

   public/checkout.js

3. Run:

   npm install
   npm start

4. Wire your donate page's Continue to Payment button using the pattern in `donate-integration.js`.

## Flow

donate.html
→ POST /prepare-donation
→ checkout.html?token=...
→ Stripe Payment Element
→ complete.html

## Important

The included in-memory donation token store is appropriate for local testing, not production. Before launch, move pending donation data into durable storage or use a signed server-side token design.

Also add Stripe webhooks before relying on payment completion for receipts, CRM updates, fulfillment, or accounting automation.
