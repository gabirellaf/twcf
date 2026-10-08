// Example: wire this into the Continue to Payment button on donate.html.
//
// IMPORTANT:
// - Convert dollars to cents before sending.
// - Send the amount/name/email already collected on donate.html.
// - Do not collect card information on donate.html.

async function continueToPayment() {
  const amountInDollars = Number(document.querySelector("#donation-amount").value);
  const amount = Math.round(amountInDollars * 100);

  const name = document.querySelector("#donor-name").value.trim();
  const email = document.querySelector("#donor-email").value.trim();
  const note = document.querySelector("#donor-note")?.value.trim() || "";

  const response = await fetch("/prepare-donation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount,
      name,
      email,
      note
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to continue to payment.");
  }

  window.location.href = data.checkoutUrl;
}
