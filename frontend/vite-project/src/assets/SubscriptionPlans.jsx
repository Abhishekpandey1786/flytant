// src/pages/SubscriptionPlans.jsx
import React, { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import p1 from "./image/p1.png";
import p2 from "./image/p2.png";
import p3 from "./image/p3.png";
import p4 from "./image/p4.png";
import p5 from "./image/p5.png";
import p6 from "./image/p6.png";
import p7 from "./image/p7.png";
import p8 from "./image/p8.png";

const stripePromise = loadStripe(""); // apni publishable key dalna

const plans = [
  { id: 1, title: "Billed Yearly", price: 500000, oldPrice: 3600, discount: "Extra 20% Off" },
  { id: 2, title: "Billed Half Yearly", price: 1600, oldPrice: 1800, discount: "Extra 10% Off" },
  { id: 3, title: "Billed Quarterly", price: 800, oldPrice: 900, discount: "Extra 5% Off" },
  { id: 4, title: "Billed Monthly", price:9, oldPrice: 400, discount: null },
];

const influencers = [p1, p2, p3, p4, p5, p6, p7, p8];

// ---- Checkout Form ----
function CheckoutForm({ selectedPlan }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // 1. Backend API hit karo
      const { data } = await axios.post("", {
        amount: selectedPlan.price, // paisa in INR cents (₹28 = 2800)
        currency: "inr",
      });

      const clientSecret = data.clientSecret;

      // 2. Card se confirm karo
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        alert(`✅ Payment successful for ${selectedPlan.title}`);
      }
    } catch (error) {
      alert("Payment failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="mt-6 space-y-4">
      <CardElement className="p-3 border rounded-xl bg-white text-black" />
      <button
        onClick={handlePayment}
        disabled={!stripe || loading}
        className="relative w-full mt-4 py-3 rounded-xl font-semibold bg-fuchsia-700 text-white shadow-lg hover:shadow-fuchsia-800/50"
      >
        {loading ? "Processing..." : `Buy Now - ₹${selectedPlan.price / 100}`}
      </button>
    </div>
  );
}

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="items-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 text-center drop-shadow-lg">
            Subscription Plans
          </h2>
          <p className="text-gray-400 mb-8 sm:mb-12 md:mb-16 text-center max-w-2xl mx-auto px-2">
            Choose the plan that best fits your needs and unlock new opportunities
            for sponsorships & collaborations 🚀
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`relative rounded-2xl p-6 cursor-pointer border transition transform hover:-translate-y-1 ${
                selectedPlan.id === plan.id
                  ? "bg-slate-900 text-white shadow-xl border-2 border-fuchsia-800"
                  : "bg-slate-900 text-white shadow-lg border border-gray-700"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-base sm:text-lg">{plan.title}</h3>
                <input
                  type="radio"
                  checked={selectedPlan.id === plan.id}
                  onChange={() => setSelectedPlan(plan)}
                  className="w-4 h-4 accent-fuchsia-600"
                />
              </div>

              <div className="mt-4 flex items-baseline">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  ₹{plan.price / 100}
                </span>
                {plan.oldPrice && (
                  <span className="line-through ml-3 text-gray-500 text-sm sm:text-base">
                    ₹{plan.oldPrice}
                  </span>
                )}
              </div>

              {plan.discount && (
                <p className="mt-2 text-sm font-medium text-white">{plan.discount}</p>
              )}

              {/* Checkout Form */}
              {selectedPlan.id === plan.id && (
                <Elements stripe={stripePromise}>
                  <CheckoutForm selectedPlan={plan} />
                </Elements>
              )}
            </div>
          ))}
        </div>

        {/* Influencers */}
        <div className="mt-20 sm:mt-28 w-full text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 text-white drop-shadow-lg">
            100K+ Influencers already taking the advantages
          </h3>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
            {influencers.map((src, idx) => (
              <div
                key={idx}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full border-4 border-orange-400 overflow-hidden shadow-lg hover:scale-110 transition transform"
              >
                <img src={src} alt={`influencer-${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
