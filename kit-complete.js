async function verifyKitSponsorship() {
  const params = new URLSearchParams(window.location.search);
  const paymentIntentId = params.get("payment_intent");

  const title = document.querySelector("#status-title");
  const copy = document.querySelector("#status-copy");
  const link = document.querySelector("#continue-link");

  if (!paymentIntentId) {
    title.textContent = "We couldn't verify that sponsorship.";
    copy.textContent = "No Stripe payment reference was found.";
    link.style.display = "inline";
    return;
  }

  try {
    const response = await fetch(`/api/kit-payment-status?payment_intent=${encodeURIComponent(paymentIntentId)}`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Unable to verify sponsorship.");

    if (data.status === "succeeded") {
      title.textContent = "Thank you for sponsoring a kit.";
      copy.textContent =
        "Your payment was successfully processed. We'll put this kit together and get it where it's needed.";
    } else if (data.status === "processing") {
      title.textContent = "Your sponsorship is processing.";
      copy.textContent = "Stripe is still processing the payment. You do not need to submit it again.";
    } else {
      title.textContent = "Your sponsorship is not complete yet.";
      copy.textContent = "The payment was not marked successful.";
    }

    link.style.display = "inline";
  } catch (error) {
    title.textContent = "We couldn't verify your sponsorship.";
    copy.textContent = error.message;
    link.style.display = "inline";
  }
}

verifyKitSponsorship();
