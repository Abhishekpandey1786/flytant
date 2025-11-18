import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
    { name: "Basic", title: "Billed Monthly", price: 3, oldPrice: 4, discount: "Get 20% Off" },
    { name: "Standard", title: "Billed Monthly", price: 5, oldPrice: 7, discount: "Get 30% Off" },
    { name: "Advance", title: "Billed Monthly", price: 9, oldPrice: 18, discount: "Get 40% Off" },
    { name: "Premium", title: "Billed Monthly", price: 19, oldPrice: 39, discount: "Get 50% Off" },
];

const influencers = [p1, p2, p3, p4, p5, p6, p7, p8];

function CashfreeCheckoutForm({ selectedPlan }) {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handlePayment = async () => {
        if (!user || !user._id) {
            alert("Please log in to make a payment.");
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.post(
                "https://vistafluence.onrender.com/api/cashfree/create-order",
                {
                    amount: selectedPlan.price,
                    userId: user._id,
                    planName: selectedPlan.name,
                }
            );

            if (data && data.payment_link) {
                window.location.href = data.payment_link; // redirect to Cashfree Hosted Checkout
            } else {
                alert("Something went wrong!");
            }
        } catch (error) {
            alert("Payment failed: " + error.message);
        }

        setLoading(false);
    };

    return (
        <div className="mt-6 space-y-4">
            <button
                onClick={handlePayment}
                disabled={loading}
                className="relative w-full mt-4 py-3 rounded-xl font-semibold bg-fuchsia-700 text-white shadow-lg hover:shadow-fuchsia-800/50"
            >
                {loading ? "Processing..." : `Buy Now - ₹${selectedPlan.price}`}
            </button>
        </div>
    );
}

export default function SubscriptionPlans() {
    const [selectedPlan, setSelectedPlan] = useState(plans[0]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
            <div className="max-w-6xl mx-auto">
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
                            key={plan.name}
                            onClick={() => setSelectedPlan(plan)}
                            className={`relative rounded-2xl p-6 cursor-pointer border transition transform hover:-translate-y-1 ${
                                selectedPlan.name === plan.name
                                    ? "bg-slate-900 text-white shadow-xl border-2 border-fuchsia-800"
                                    : "bg-slate-900 text-white shadow-lg border border-gray-700"
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-base sm:text-lg">{plan.name}</h3>
                                <input
                                    type="radio"
                                    checked={selectedPlan.name === plan.name}
                                    onChange={() => setSelectedPlan(plan)}
                                    className="w-4 h-4 accent-fuchsia-600"
                                />
                            </div>

                            <div className="mt-4 flex items-baseline">
                                <span className="text-2xl sm:text-3xl font-bold text-white">
                                    ₹{plan.price}
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

                            {selectedPlan.name === plan.name && (
                                <CashfreeCheckoutForm selectedPlan={selectedPlan} />
                            )}
                        </div>
                    ))}
                </div>

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
