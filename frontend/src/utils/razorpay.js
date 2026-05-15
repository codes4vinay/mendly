let razorpayScriptPromise = null;

export const loadRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => {
        razorpayScriptPromise = null;
        reject(new Error("Failed to load Razorpay checkout"));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
};

export const openRazorpayCheckout = async ({
  checkout,
  prefill,
  notes,
}) => {
  const Razorpay = await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const instance = new Razorpay({
      key: checkout.key,
      amount: checkout.amount,
      currency: checkout.currency,
      name: "RPAR",
      description: checkout.entityName,
      order_id: checkout.razorpayOrderId,
      prefill,
      notes,
      theme: {
        color: "#4f46e5",
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
      handler: (response) => {
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
    });

    instance.open();
  });
};
