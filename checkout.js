const STRIPE_PUBLISHABLE_KEY = "pk_live_51TZg8LFjVlpP57Og7x9EbOhpJbNfZF8uTWmyTN4UqmvHl6REGuuf8V86NV9Anqp11affWmGe6EWwL6kQaZ9PFtGI00ODGPq9Zd";

const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

const submitButton = document.querySelector("#submit");
const buttonText = document.querySelector("#button-text");
const spinner = document.querySelector("#spinner");
const paymentMessage = document.querySelector("#payment-message");
const donationAmountLabel = document.querySelector("#donation-amount");

let elements;

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

function setLoading(loading) {
  submitButton.disabled = loading;
  spinner.hidden = !loading;

  if (loading) {
    buttonText.textContent = "Processing…";
  } else {
    buttonText.textContent =
      `Complete ${donationAmountLabel.textContent} Donation`;
  }
}

function showMessage(message) {
  paymentMessage.textContent = message || "";
}

function initialize() {
  const stored = sessionStorage.getItem("twcfDonationPayment");

  if (!stored) {
    throw new Error(
      "No donation payment session was found. Please return to the donation page."
    );
  }

  const payment = JSON.parse(stored);

  if (!payment.clientSecret || !payment.amount) {
    throw new Error("Donation payment information is incomplete.");
  }

  donationAmountLabel.textContent = formatMoney(payment.amount);

  // Designated campaign gifts: show the fund before the donor confirms, and
  // send "Back" to the campaign page rather than the general Donate page.
  const campaignPages = {
    dzaleka_shipping_2026: "/dzaleka-shipping-fund.html#donate",
    dzaleka_kit_sponsorship_2026: "/where-kits-go.html#sponsor"
  };
  const campaignNotes = {
    dzaleka_shipping_2026: "which covers transport and import logistics for donated care kits",
    dzaleka_kit_sponsorship_2026: "which funds care kits for women and children at Dzaleka Refugee Camp, Malawi"
  };

  if (payment.campaign && payment.campaignName) {
    document.querySelector("#donation-campaign").textContent = payment.campaignName;
    document.querySelector("#donation-designation").hidden = false;
    document.querySelector("#impact-note").textContent =
      `Your gift is designated to the ${payment.campaignName}${campaignNotes[payment.campaign] ? ", " + campaignNotes[payment.campaign] : ""}. This is a one-time gift.`;

    const backHref = campaignPages[payment.campaign];
    if (backHref) {
      document.querySelectorAll(".back-link, .brand").forEach(link => {
        link.setAttribute("href", backHref);
      });
    }
  }

  const appearance = {
    theme: "flat",
    variables: {
      colorPrimary: "#5c2d91",
      colorText: "#1d1930",
      colorTextSecondary: "#68647a",
      colorBackground: "#ffffff",
      colorDanger: "#b4233f",
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      borderRadius: "12px"
    }
  };

  elements = stripe.elements({
    clientSecret: payment.clientSecret,
    appearance
  });

  const paymentElement = elements.create("payment", {
    layout: "tabs"
  });

  paymentElement.mount("#payment-element");

  submitButton.disabled = false;
  buttonText.textContent =
    `Complete ${donationAmountLabel.textContent} Donation`;
}

document
  .querySelector("#payment-form")
  .addEventListener("submit", async event => {
    event.preventDefault();

    showMessage("");
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          `${window.location.origin}/complete.html`
      }
    });

    if (error) {
      showMessage(error.message || "Payment could not be completed.");
      setLoading(false);
    }
  });

try {
  initialize();
} catch (error) {
  showMessage(error.message);
  buttonText.textContent = "Checkout unavailable";
  submitButton.disabled = true;
}