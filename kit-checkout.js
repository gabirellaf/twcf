const STRIPE_PUBLISHABLE_KEY = "pk_live_51TZg8LFjVlpP57Og7x9EbOhpJbNfZF8uTWmyTN4UqmvHl6REGuuf8V86NV9Anqp11affWmGe6EWwL6kQaZ9PFtGI00ODGPq9Zd";

const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

const submitButton = document.querySelector("#submit");
const buttonText = document.querySelector("#button-text");
const spinner = document.querySelector("#spinner");
const paymentMessage = document.querySelector("#payment-message");
const amountLabel = document.querySelector("#donation-amount");
const nameHeading = document.querySelector("#kit-name-heading");

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
      `Complete ${amountLabel.textContent} Sponsorship`;
  }
}

function showMessage(message) {
  paymentMessage.textContent = message || "";
}

function initialize() {
  const stored = sessionStorage.getItem("twcfKitPayment");

  if (!stored) {
    throw new Error(
      "No kit sponsorship session was found. Please return to Our Care Kits and try again."
    );
  }

  const payment = JSON.parse(stored);

  if (!payment.clientSecret || !payment.amount) {
    throw new Error("Kit sponsorship information is incomplete.");
  }

  amountLabel.textContent = formatMoney(payment.amount);
  if (payment.kitName) {
    nameHeading.textContent = `Sponsor: ${payment.kitName}`;
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
    `Complete ${amountLabel.textContent} Sponsorship`;
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
          `${window.location.origin}/kit-complete.html`
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
