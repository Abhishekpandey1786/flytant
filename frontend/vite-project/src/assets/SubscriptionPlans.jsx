import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

// Image placeholders (replace with your actual image imports)
const p1 = "https://placehold.co/80x80/fuchsia/white?text=P1";
const p2 = "https://placehold.co/80x80/fuchsia/white?text=P2";
const p3 = "https://placehold.co/80x80/fuchsia/white?text=P3";
const p4 = "https://placehold.co/80x80/fuchsia/white?text=P4";
const p5 = "https://placehold.co/80x80/fuchsia/white?text=P5";
const p6 = "https://placehold.co/80x80/fuchsia/white?text=P6";
const p7 = "https://placehold.co/80x80/fuchsia/white?text=P7";
const p8 = "https://placehold.co/80x80/fuchsia/white?text=P8";

const influencers = [p1, p2, p3, p4, p5, p6, p7, p8];

// Correct INR-based pricing
const plans = [
  { name: "Basic", title: "Billed Monthly", price: 2, oldPrice: 4, discount: "Get 20% Off" },
  { name: "Standard", title: "Billed Monthly", price: 500, oldPrice: 700, discount: "Get 30% Off" },
  { name: "Advance", title: "Billed Monthly", price: 900, oldPrice: 1800, discount: "Get 40% Off" },
  { name: "Premium", title: "Billed Monthly", price: 1900, oldPrice: 3900, discount: "Get 50% Off" },
];

// Spinner
const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// Load Cashfree SDK dynamically
const loadCashfreeSdk = () => {
  return new Promise((resolve, reject) => {
    if (window.load) return resolve(window.load);

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => {
      if (window.load) resolve(window.load);
      else reject(new Error("Cashfree SDK loaded but 'load' not found."));
    };
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK."));
    document.head.appendChild(script);
  });
};

// Checkout
function CashfreeCheckoutForm({ selectedPlan }) {
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
      const cashfreeLoad = await loadCashfreeSdk();

      const { data } = await axios.post(
        "https://vistafluence.onrender.com/api/cashfree/create-order",
        {
          amount: selectedPlan.price,
          userId: user._id,
          planName: selectedPlan.name,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone,
        }
      );

      if (!data.payment_session_id) {
        console.error("Missing payment session!");
        setLoading(false);
        return;
      }

      const cashfree = await cashfreeLoad({ mode: "production" });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self",
      });
    } catch (err) {
      console.error("PAYMENT ERROR:", err.response?.data || err.message);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full mt-4 py-3 rounded-xl font-semibold bg-fuchsia-700 text-white shadow-lg flex items-center justify-center disabled:opacity-50 hover:bg-fuchsia-800 transition duration-300"
    >
      {loading && <Spinner />}
      {loading ? "Processing..." : `Buy Now - ₹${selectedPlan.price}`}
    </button>
  );
}

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]); 
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white text-center mb-10">
          Select Your Vistafluence Plan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan)}
              className={`relative flex flex-col justify-between h-full rounded-2xl p-6 cursor-pointer transition border transform hover:scale-[1.01]
                ${
                  selectedPlan.name === plan.name
                    ? "bg-slate-800 text-white border-fuchsia-600 border-2 shadow-fuchsia-900/50 shadow-2xl"
                    : "bg-slate-900 text-white border-gray-700 shadow-lg"
                }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-xl">{plan.name}</h3>
                  <input
                    type="radio"
                    readOnly
                    checked={selectedPlan.name === plan.name}
                    className="w-5 h-5 accent-fuchsia-600 cursor-pointer"
                  />
                </div>

                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black">₹{plan.price}</span>
                  <span className="text-base ml-2 text-gray-400">/mo</span>
                </div>

                <div className="flex items-baseline mt-1 text-sm">
                  <span className="line-through text-gray-500 mr-2">₹{plan.oldPrice}</span>
                  <p className="text-fuchsia-400 font-semibold">{plan.discount}</p>
                </div>
              </div>

              {selectedPlan.name === plan.name ? (
                <CashfreeCheckoutForm selectedPlan={selectedPlan} />
              ) : (
                <button className="w-full mt-4 py-3 rounded-xl font-semibold bg-gray-700 text-gray-300">
                  Select Plan
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold mb-8 text-white">
            100K+ Influencers Already Taking The Benefits
          </h3>

          <div className="flex flex-wrap justify-center gap-6">
            {influencers.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Influencer ${idx + 1}`}
                className="w-20 h-20 rounded-full border-4 border-orange-400 shadow-xl object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
