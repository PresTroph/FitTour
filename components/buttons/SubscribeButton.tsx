"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
    });

    const data = await res.json();

    if (data.sessionId) {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      stripe?.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleSubscribe}
      className="bg-black text-white px-4 py-2 rounded-xl mt-4 hover:opacity-90"
      disabled={loading}
    >
      {loading ? "Redirecting..." : "Subscribe to FitTour Pro"}
    </button>
  );
}
