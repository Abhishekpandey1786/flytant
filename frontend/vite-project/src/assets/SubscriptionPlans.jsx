import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const plans = [
  { name: "Basic", price: 1, oldPrice: 4, discount: "20% Off" },
  { name: "Standard", price: 5, oldPrice: 7, discount: "30% Off" },
  { name: "Advance", price: 9, oldPrice: 18, discount: "40% Off" },
  { name: "Premium", price: 19, oldPrice: 39, discount: "50% Off" },
];

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
    setLoading(true);

    try {
      const { data } = await axios.post(
        "https://vistafluence.onrender.com/api/instamojo/pay",
        {
          plan: selectedPlan,
          userId: user._id,
          email: user.email,
          userName: user.name,
          phone: user.phone || "9999999999"
        }
      );

      if (data.url) {
        window.location.href = data.url; // Redirect to Instamojo
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Payment failed to initialize.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full mt-4 py-3 rounded-xl font-semibold bg-fuchsia-700 text-white shadow-lg flex items-center justify-center disabled:opacity-50 hover:bg-fuchsia-800 transition-colors"
    >
      {loading && <Spinner />}
      {loading ? "Redirecting..." : `Pay Now - ₹${selectedPlan.price}`}
    </button>
  );
}

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan)}
              className={`p-6 rounded-2xl cursor-pointer border transition-all ${
                selectedPlan.name === plan.name ? "bg-slate-900 border-fuchsia-700 ring-2 ring-fuchsia-500" : "bg-slate-900/50 border-gray-700"
              }`}
            >
              <h3 className="text-white font-bold text-xl mb-4">{plan.name}</h3>
              <div className="text-white text-4xl font-black">₹{plan.price}</div>
              <div className="text-gray-500 line-through">₹{plan.oldPrice}</div>
              <p className="text-fuchsia-400 text-sm mt-2">{plan.discount}</p>
              
              {selectedPlan.name === plan.name && (
                <InstamojoCheckoutForm selectedPlan={selectedPlan} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}