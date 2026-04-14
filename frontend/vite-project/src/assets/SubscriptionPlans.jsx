import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const plans = [
  { name: "Basic", price: 10, oldPrice: 40, discount: "20% Off" }, // Price > ₹9 for Live
  { name: "Standard", price: 49, oldPrice: 99, discount: "50% Off" },
  { name: "Advance", price: 99, oldPrice: 199, discount: "50% Off" },
  { name: "Premium", price: 199, oldPrice: 399, discount: "50% Off" },
];

function InstamojoCheckoutForm({ selectedPlan }) {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const handlePayment = async () => {
    if (!user) return alert("Please login first");
    setLoading(true);

    try {
      const { data } = await axios.post("https://vistafluence.onrender.com/api/instamojo/pay", {
        plan: selectedPlan,
        userId: user._id,
        email: user.email,
        userName: user.name,
        phone: user.phone
      });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("CORS or Connection Error. Check console.");
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading} className="w-full bg-fuchsia-700 p-3 rounded-xl text-white">
      {loading ? "Redirecting..." : `Pay ₹${selectedPlan.price}`}
    </button>
  );
}

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} onClick={() => setSelectedPlan(plan)} className={`p-6 border rounded-2xl ${selectedPlan.name === plan.name ? 'border-fuchsia-600 bg-slate-900' : 'border-gray-700'}`}>
            <h3 className="font-bold text-xl">{plan.name}</h3>
            <div className="text-3xl font-black mt-2">₹{plan.price}</div>
            {selectedPlan.name === plan.name && <InstamojoCheckoutForm selectedPlan={selectedPlan} />}
          </div>
        ))}
      </div>
    </div>
  );
}