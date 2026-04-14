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
  { name: "Basic", price: 1, oldPrice: 4, discount: "20% Off" },
  { name: "Standard", price: 5, oldPrice: 7, discount: "30% Off" },
  { name: "Advance", price: 9, oldPrice: 18, discount: "40% Off" },
  { name: "Premium", price: 19, oldPrice: 39, discount: "50% Off" },
];

const influencers = [p1, p2, p3, p4, p5, p6, p7, p8];

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
    // 1. Check if user is logged in
    if (!user || !user._id) {
      alert("Please login first");
      return;
    }

    // 2. Updated Validation: Sirf check karein ki phone 10 digits ka hai ya nahi
    // Aapne apna number block list mein dala hua tha, use ab hata diya hai.
    const userPhone = user.phone || "";
    if (userPhone.length < 10) {
      alert("Please update a valid 10-digit phone number in your profile to continue.");
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
          userName: user.name,
          phone: user.phone, // Ab ye real number jayega
        }
      );

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Payment failed! Please try again.";
      alert(errorMsg);
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full mt-4 py-3 rounded-xl font-semibold bg-green-600 text-white shadow-lg flex items-center justify-center disabled:opacity-50 hover:bg-green-700 transition-colors"
    >
      {loading && <Spinner />}
      {loading ? "Redirecting..." : `Upgrade Now - $${selectedPlan.price}`}
    </button>
  );
}

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-white text-center mb-10">
          Choose Your Plan
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan)}
              className={`relative rounded-2xl p-6 cursor-pointer transition-all border flex flex-col justify-between ${
                selectedPlan.name === plan.name
                  ? "bg-slate-900 text-white border-green-600 border-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-105"
                  : "bg-slate-900/50 text-white border-gray-700 hover:border-gray-500 shadow-lg"
              }`}
            >
              <div>
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

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">
                    ${plan.price}
                  </span>
                  <span className="line-through text-gray-500 text-lg">
                    ${plan.oldPrice}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-green-400 bg-green-400/10 inline-block px-2 py-1 rounded">
                  {plan.discount}
                </p>

                <ul className="mt-6 space-y-3 text-sm text-gray-300">
                  <li>✓ Full Marketplace Access</li>
                  <li>✓ Priority Support</li>
                </ul>
              </div>

              <div className="mt-8">
                {selectedPlan.name === plan.name && (
                  <InstamojoCheckoutForm selectedPlan={selectedPlan} />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <h3 className="text-2xl font-bold mb-10 text-white/80">
            Trusted by 100K+ Influencers Worldwide
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {influencers.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="influencer"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-green-500/50 shadow-md object-cover hover:scale-110 transition-transform"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}