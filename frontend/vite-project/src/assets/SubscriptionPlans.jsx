import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

import p1 from "./image/p1.webp";
import p2 from "./image/p2.webp";
import p3 from "./image/p3.webp";
import p4 from "./image/p4.webp";
import p5 from "./image/p5.webp";
import p6 from "./image/p6.webp";
import p7 from "./image/p7.webp";
import p8 from "./image/p8.webp";

// INR Pricing
const plans = [
  { name: "Basic", price: 99, oldPrice: 199, discount: "50% Off" },
  { name: "Standard", price: 299, oldPrice: 499, discount: "40% Off" },
  { name: "Advance", price: 599, oldPrice: 999, discount: "40% Off" },
  { name: "Premium", price: 999, oldPrice: 1999, discount: "50% Off" },
];

const influencers = [p1, p2, p3, p4, p5, p6, p7, p8];

// Price Formatter for INR
const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    ></path>
  </svg>
);

function InstamojoCheckoutForm({ selectedPlan }) {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const handlePayment = async () => {
    if (!user || !user._id) {
      alert("Please login first");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const { data } = await axios.post(
        "https://vistafluence.onrender.com/api/instamojo/pay",
        {
          plan: selectedPlan,
          userId: user._id,
          email: user.email,
          userName: user.name || "User",
          phone: user.phone,
          currency: "INR",
        }
      );

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Payment Error:", err);
      const errorMsg =
        err.response?.data?.error ||
        "Payment failed! Please try again.";
      alert(errorMsg);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full mt-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-all duration-300"
    >
      {loading && <Spinner />}
      {loading
        ? "Redirecting..."
        : `Upgrade Now - ${formatINR(selectedPlan.price)}`}
    </button>
  );
}

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-black px-4 sm:px-6 py-14">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-4xl font-extrabold text-white text-center mb-4">
          Choose Your Perfect Plan
        </h2>
        <p className="text-center text-gray-400 mb-12">
          Affordable pricing designed for creators and influencers in India 🇮🇳
        </p>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan)}
              className={`relative rounded-2xl p-6 cursor-pointer transition-all border backdrop-blur-lg ${
                selectedPlan.name === plan.name
                  ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-green-500 border-2 shadow-[0_0_25px_rgba(34,197,94,0.4)] scale-105"
                  : "bg-white/5 text-white border-gray-700 hover:border-green-400 hover:shadow-lg"
              }`}
            >
              {/* Popular Badge */}
              {plan.name === "Premium" && (
                <span className="absolute -top-3 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow">
                  Most Popular
                </span>
              )}

              {/* Plan Name */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl">{plan.name}</h3>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan.name === plan.name
                      ? "border-green-500"
                      : "border-gray-500"
                  }`}
                >
                  {selectedPlan.name === plan.name && (
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-green-400">
                  {formatINR(plan.price)}
                </span>
                <span className="line-through text-gray-500 text-lg">
                  {formatINR(plan.oldPrice)}
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-green-400 bg-green-400/10 inline-block px-2 py-1 rounded">
                {plan.discount}
              </p>

              {/* Features */}
              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                <li>✔ Full Marketplace Access</li>
                <li>✔ Priority Support</li>
                <li>✔ Verified Influencers</li>
                <li>✔ Secure Payments</li>
              </ul>

              {/* Payment Button */}
              <div className="mt-8">
                {selectedPlan.name === plan.name && (
                  <InstamojoCheckoutForm selectedPlan={selectedPlan} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Influencers Section */}
        <div className="mt-24 text-center">
          <h3 className="text-2xl font-bold mb-10 text-white/80">
            Trusted by 100K+ Influencers Across India
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {influencers.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="influencer"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-green-500/50 shadow-md object-cover hover:scale-110 transition-transform duration-300"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}