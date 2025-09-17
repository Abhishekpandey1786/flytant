import React from "react";
import { Link } from "react-router-dom";
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
    name: "Basic",
    price: 3,
    oldPrice: 4,
    discount: "Get 20% Off",
    features: [
      "Higher Visibility",
      "Apply For 6 Campaigns Monthly",
      "❌ No Direct Message Credit",
      "❌ Profile Recommendation to brands",
    ],
    popular: false,
  },
  {
    name: "Standard",
    price: 5,
    oldPrice: 7,
    discount: "Get 30% Off",
    features: [
      "Higher Visibility",
      "Apply For 15 Campaigns Monthly",
      "Get 15 Direct Message Credit",
      "❌ Profile Recommendation to brands",
    ],
    popular: false,
  },
  {
    name: "Advance",
    price: 9,
    oldPrice: 18,
    discount: "Get 40% Off",
    features: [
      "Higher Visibility",
      "Apply For 40 Campaigns Monthly",
      "Get 40 Direct Message Credit",
      "Profile Recommendation to brands",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: 19,
    oldPrice: 39,
    discount: "Get 50% Off",
    features: [
      "Higher Visibility",
      "Apply For Unlimited Campaigns Monthly",
      "Unlimited Direct Message Credit",
      "Profile Recommendation to brands",
    ],
    popular: false,
  },
];

const influencers = [
  p1,p2,p3,p4,p5,p6,p7,p8,
];

export default function Subscription() {
  return (
    <div className="bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center py-16 px-4 md:px-10">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 text-center drop-shadow-lg">
        Subscription Plans
      </h2>
      <p className="text-gray-400 mb-12 sm:mb-16 text-center max-w-2xl">
        Choose the plan that best fits your needs and unlock new opportunities
        for sponsorships & collaborations 🚀
      </p>

      
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl w-full">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative rounded-2xl border shadow-xl p-6 sm:p-8 flex flex-col items-center text-center bg-slate-800 transition transform hover:-translate-y-2 hover:shadow-fuchsia-800 neno-button ${
              plan.popular ? "ring-2 ring-fuchsia-600" : ""
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 sm:-top-4 bg-fuchsia-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full shadow-md">
                Most Popular
              </span>
            )}

            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">
              {plan.name}
            </h3>

            <div className="flex items-center mb-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                ${plan.price}
              </span>
              <span className="text-gray-500 line-through ml-2 sm:ml-3 text-base sm:text-lg">
                ${plan.oldPrice}
              </span>
            </div>

            <p className="text-fuchsia-500 font-medium mb-6 text-sm sm:text-base">
              {plan.discount}
            </p>

            <Link to="/SubscriptionPlans" className="w-full">
              <button
                className={`w-full py-3 rounded-xl font-semibold text-white transition shadow-md mb-6 neno-button bg-fuchsia-800 ${
                  plan.popular
                    ? "  shadow-fuchsia-800"
                    : "bg-fusion-800  border border-fuchsia-800"
                }`}
              >
                Select Plan
              </button>
            </Link>

            <ul className="text-gray-300 text-sm space-y-3 text-center w-full">
              {plan.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-center gap-2 leading-snug"
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-20 sm:mt-28 w-full text-center">
        <h3 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-white drop-shadow-md">
          100K+ Influencers already taking the advantages
        </h3>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          {influencers.map((src, idx) => (
            <div
              key={idx}
              className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-fuchsia-400 overflow-hidden shadow-lg hover:scale-110 transition transform"
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

      {/* ---- Footer Q&A ---- */}
      <div className="mt-20 sm:mt-28 text-center px-4">
        <h4 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
          Still have Questions?
        </h4>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          If you have questions about Flytant, product, pricing, implementation
          or anything else, please email us at{" "}
          <a
            href="mailto:influencers@flytant.com"
            className="text-fuchsia-400 underline font-medium"
          >
            influencers@InfluZone.com
          </a>
        </p>
      </div>
    </div>
  );
}
