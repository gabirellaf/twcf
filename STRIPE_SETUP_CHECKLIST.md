# Stripe Payment Setup Checklist — Sponsor a Care Kit

Do this in your Stripe Dashboard (dashboard.stripe.com), same account as the old membership checkout.

## 1. Branding (do this first, 2 minutes)
- [ ] Go to account settings → Branding
- [ ] Upload the TWCF logo
- [ ] Set brand color to TWCF purple (#5C2D91)
- This makes every Payment Link page below look like TWCF, not generic Stripe.

## 2. Check Stripe Climate
- [ ] Go to Settings → Climate
- [ ] Decide whether to keep or turn OFF the "contribute 1% to carbon removal" feature
- (It showed as already enabled in the payment link preview — if you don't want 1% of every donation diverted from kits, turn it off.)

## 3. Create Payment Link #1 — $15 tier
- [ ] Dashboard → Payment links → + New
- [ ] Select type: "Products or subscriptions"
- [ ] Product → "+ Add new product" → name: **"Sponsor a Children's Education & Comfort Kit"** → price **$15.00 USD, one-time**
- [ ] Leave "Enable Managed Payments" OFF (adds a 3.5% fee)
- [ ] Leave "Collect tax automatically" OFF (this is a donation, not a taxable sale)
- [ ] Turn "Collect customer names" ON (so you know who to thank)
- [ ] Leave business name / address / phone / payment limit OFF unless you want them
- [ ] Check the "After payment" tab — optionally set a custom thank-you message
- [ ] Click **Create link** → copy the resulting URL (looks like `buy.stripe.com/xxxxx`)

## 4. Create Payment Link #2 — $30 tier
- [ ] Repeat step 3, but product name **"Sponsor a Baby & Maternal Care Kit"**, price **$30.00 USD, one-time**
- [ ] Copy that URL too

## 5. Send both URLs back
- [ ] Give both links to Claude — the "Sponsor for $15" / "Sponsor for $30" buttons on where-kits-go.html will get wired to them and redeployed.
