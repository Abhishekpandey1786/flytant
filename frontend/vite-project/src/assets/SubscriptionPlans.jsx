// src/pages/SubscriptionPlans.jsx
import React, { useState } from "react";
import p1 from "./image/p1.png";
import p2 from "./image/p2.png";
import p3 from "./image/p3.png";  
import p4 from "./image/p4.png";
import p5 from "./image/p5.png";
import p6 from "./image/p6.png";
import p7 from "./image/p7.png";
import p8 from "./image/p8.png";

const plans = [
  {
    id: 1,
    title: "Billed Yearly",
    price: 28,
    oldPrice: 36,
    discount: "Extra 20% Off",
  },
  {
    id: 2,
    title: "Billed Half Yearly",
    price: 16,
    oldPrice: 18,
    discount: "Extra 10% Off",
  },
  {
    id: 3,
    title: "Billed Quarterly",
    price: 8,
    oldPrice: 9,
    discount: "Extra 5% Off",
  },
  {
    id: 4,
    title: "Billed Monthly",
    price: 3,
    oldPrice: 4,
    discount: null,
  },
];

const influencers = [p1, p2, p3, p4, p5, p6, p7, p8];

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(1);

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

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-2xl p-6 cursor-pointer border transition transform hover:-translate-y-1 
                ${
                  selectedPlan === plan.id
                    ? "bg-slate-900 text-white neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                    : "bg-slate-900 text-white neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                }`}
            >
              {/* Title */}
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-base sm:text-lg">{plan.title}</h3>
                <input
                  type="radio"
                  checked={selectedPlan === plan.id}
                  onChange={() => setSelectedPlan(plan.id)}
                  className="w-4 h-4 accent-fuchsia-600"
                />
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  ${plan.price}
                </span>
                {plan.oldPrice && (
                  <span className="line-through ml-3 text-gray-500 text-sm sm:text-base">
                    ${plan.oldPrice}
                  </span>
                )}
              </div>

              {/* Discount */}
              {plan.discount && (
                <p className="mt-2 text-sm font-medium text-white">
                  {plan.discount}
                </p>
              )}

              {/* Neon Buy Button */}
              <button
                className={`relative w-full mt-6 py-3 rounded-xl font-semibold overflow-hidden transition 
                  ${
                    selectedPlan === plan.id
                      ? "bg-fuchsia-700 neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                      : "bg-slate-800 text-gray-300 shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                  }`}
              >
                <span className="relative z-10">Buy Now</span>
                <span
                  className={`absolute inset-0 blur-md opacity-60 ${
                    selectedPlan === plan.id
                      ? "bg-fuchsia-800 animate-pulse"
                      : "bg-slate-700"
                  }`}
                ></span>
              </button>
            </div>
          ))}
        </div>

        {/* ---- Influencers Section ---- */}
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
                <img
                  src={src}
                  alt={`influencer-${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
