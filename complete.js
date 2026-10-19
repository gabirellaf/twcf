async function verifyDonation() {
  const params = new URLSearchParams(window.location.search);
  const paymentIntentId = params.get("payment_intent");

  const title = document.querySelector("#status-title");
  const copy = document.querySelector("#status-copy");
  const link = document.querySelector("#continue-link");

  if (!paymentIntentId) {
    title.textContent = "We couldn't verify that donation.";
    copy.textContent = "No Stripe payment reference was found.";
    link.style.display = "inline";
    return;
  }

  try {
    const response = await fetch(`/api/donation-status?payment_intent=${encodeURIComponent(paymentIntentId)}`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Unable to verify donation.");

    if (data.status === "succeeded" && data.campaignName) {
      title.textContent = "Thank you for your donation.";
      copy.textContent =
        `Your payment was successfully processed. Your gift is designated to the ${data.campaignName}. We’re grateful for your help getting care kits where they’re needed.`;
    } else if (data.status === "succeeded") {
      title.textContent = "Thank you for your donation.";
      copy.textContent =
        "Your payment was successfully processed. We’re grateful for your support of The Women and Children Foundation.";
    } else if (data.status === "processing") {
      title.textContent = "Your donation is processing.";
      copy.textContent = "Stripe is still processing the payment. You do not need to submit it again.";
    } else {
      title.textContent = "Your donation is not complete yet.";
      copy.textContent = "The payment was not marked successful.";
    }

    if (data.campaignId === "dzaleka_shipping_2026") {
      link.setAttribute("href", "/dzaleka-shipping-fund.html");
      link.textContent = "Return to the Dzaleka Relief Shipping Fund →";
    } else if (data.campaignId === "dzaleka_kit_sponsorship_2026") {
      link.setAttribute("href", "/where-kits-go.html#sponsor");
      link.textContent = "Return to Where Kits Go →";
    }

    link.style.display = "inline";
  } catch (error) {
    title.textContent = "We couldn't verify your donation.";
    copy.textContent = error.message;
    link.style.display = "inline";
  }
}

verifyDonation();
