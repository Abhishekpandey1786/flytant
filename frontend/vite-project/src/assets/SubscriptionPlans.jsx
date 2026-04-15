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

const plans = [
  {
    name: "Basic",
    price: 1,
    oldPrice: 199,
    discount: "Get 50% Off",
    features: [
      "Higher Visibility",
      "Apply For 6 Campaigns Monthly",
      "Profile Recommendation to Brands",
    ],
  },
  {
    name: "Standard",
    price: 2,
    oldPrice: 499,
    discount: "Get 40% Off",
    features: [
      "Higher Visibility",
      "Apply For 15 Campaigns Monthly",
      "Profile Recommendation to Brands",
    ],
  },
  {
    name: "Advance",
    price: 3,
    oldPrice: 999,
    discount: "Get 40% Off",
    popular: true,
    features: [
      "Higher Visibility",
      "Apply For 40 Campaigns Monthly",
      "Profile Recommendation to Brands",
    ],
  },
  {
    name: "Premium",
    price: 4,
    oldPrice: 1999,
    discount: "Get 50% Off",
    features: [
      "Higher Visibility",
      "Apply For Unlimited Campaigns",
      "Profile Recommendation to Brands",
    ],
  },
];

const influencers = [p1, p2, p3, p4, p5, p6, p7, p8];

// INR Formatter
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
        },
      );

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Payment Error:", err);
      const errorMsg =
        err.response?.data?.error || "Payment failed! Please try again.";
      alert(errorMsg);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full py-3 rounded-xl font-semibold text-white transition  bg-fuchsia-800 neno-button shadow-xl border-fuchsia-800 flex items-center justify-center"
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
    <div className="bg-gradient-to-b from-slate-950 to-slate-900 min-h-screen flex flex-col items-center py-16 px-4 md:px-10">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 text-center drop-shadow-lg">
        Subscription Plans
      </h2>

      <p className="text-gray-400 mb-12 sm:mb-16 text-center max-w-2xl">
        Choose the plan that best fits your needs and unlock new opportunities
        for sponsorships & collaborations 🚀
      </p>

      {/* Plans */}
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl w-full">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPlan(plan)}
            className={`relative rounded-2xl border shadow-xl p-6 sm:p-8 flex flex-col items-center text-center bg-slate-800 transition transform hover:-translate-y-2 hover:shadow-fuchsia-800 cursor-pointer ${
              plan.popular ? "bg-fuchsia-800 neno-button shadow-xl border-fuchsia-800" : ""
            } ${
              selectedPlan.name === plan.name ? "bg-fuchsia-800 neno-button shadow-xl border-fuchsia-800" : ""
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <span className="absolute -top-3 bg-fuchsia-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full shadow-md">
                Most Popular
              </span>
            )}

            {/* Plan Name */}
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">
              {plan.name}
            </h3>

            {/* Pricing */}
            <div className="flex items-center mb-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {formatINR(plan.price)}
              </span>
              <span className="text-gray-500 line-through ml-2 sm:ml-3 text-base sm:text-lg">
                {formatINR(plan.oldPrice)}
              </span>
            </div>

            {/* Discount */}
            <p className="text-fuchsia-500 font-medium mb-6 text-sm sm:text-base">
              {plan.discount}
            </p>

            {/* Payment Button */}
            <div className="w-full mb-6">
              {selectedPlan.name === plan.name && (
                <InstamojoCheckoutForm selectedPlan={selectedPlan} />
              )}
            </div>

            {/* Features */}
            <ul className="text-gray-300 text-sm space-y-3 text-center w-full">
              {plan.features.map((feature, i) => (
                <li key={i}>✔ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-20 sm:mt-28 text-center px-4">
        <h4 className="text-xl sm:text-2xl font-semibold mb-6 text-white">
          Trusted by 100K+ Influencers Across India
        </h4>

        <div className="flex flex-wrap justify-center gap-4">
          {influencers.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="influencer"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-fuchsia-500 shadow-md object-cover hover:scale-110 transition-transform duration-300"
            />
          ))}
        </div>
      </div>
      <div className="mt-20 text-center px-4">
        <h4 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
          Still have Questions?
        </h4>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          If you have questions about pricing or implementation, please email us
          at{" "}
          <a
            href="mailto:information@vistafluence.com"
            className="text-fuchsia-400 underline font-medium"
          >
            information@vistafluence.com
          </a>
        </p>
      </div>
    </div>
  );
}
