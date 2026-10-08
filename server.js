require("dotenv").config();

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

const PORT = process.env.PORT || 4242;
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// In-memory token store for local testing.
// For production, move this to durable storage or encode/verify securely.
const donationSessions = new Map();

function sanitizeDonationPayload(body) {
  const amount = Number(body.amount);

  if (!Number.isInteger(amount) || amount < 100 || amount > 10000000) {
    throw new Error("Donation amount must be between $1 and $100,000.");
  }

  return { amount };
}

// donate.html POSTs here first.
// Response gives a one-time token, then the browser goes to checkout.html?token=...
app.post("/prepare-donation", (req, res) => {
  try {
    const donation = sanitizeDonationPayload(req.body);
    const token = crypto.randomBytes(24).toString("hex");

    donationSessions.set(token, {
      ...donation,
      createdAt: Date.now()
    });

    res.json({
      token,
    checkoutUrl: `${DOMAIN}/checkout.html?token=${token}`    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/create-donation-payment", async (req, res) => {
  try {
    const token = req.query.token;
    const donation = donationSessions.get(token);

    if (!donation) {
      return res.status(404).json({ error: "Donation session not found or expired." });
    }

    // Expire local test tokens after 30 minutes.
    if (Date.now() - donation.createdAt > 30 * 60 * 1000) {
      donationSessions.delete(token);
      return res.status(410).json({ error: "Donation session expired. Please start again." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
  amount: donation.amount,
  currency: "usd",

  description: "Donation to The Women and Children Foundation",

  metadata: {
    type: "donation"
  },

  automatic_payment_methods: {
    enabled: true
  }
});

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: donation.amount
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Unable to create donation payment." });
  }
});

app.get("/donation-status", async (req, res) => {
  try {
    const paymentIntentId = req.query.payment_intent;
    if (!paymentIntentId) {
      return res.status(400).json({ error: "Missing payment intent." });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      email: paymentIntent.receipt_email || null
    });
  } catch (error) {
    res.status(400).json({ error: "Unable to verify donation." });
  }
});

app.listen(PORT, () => {
  console.log(`TWCF donation checkout running at ${DOMAIN}/checkout.html`);
});
