import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";
import { AuthContext } from "./AuthContext";

import p1 from "./image/p1.webp";
import p2 from "./image/p2.webp";
// import p3 from "./image/p3.webp";  // <-- FIX THIS OR COMMENT
import p4 from "./image/p4.webp";
import p5 from "./image/p5.webp";
import p6 from "./image/p6.webp";
import p7 from "./image/p7.webp";
import p8 from "./image/p8.webp";

let cashfreePromise = load({ mode: "production" }); // 🚀 Load only once

const influencers = [p1, p2, p4, p5, p6, p7, p8]; // 🚀 p3 removed (bug fix)

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
);

function CashfreeCheckoutForm({ selectedPlan }) {
    const [loading, setLoading] = useState(false);
    const locked = useRef(false);
    const { user } = useContext(AuthContext);

    const handlePayment = async () => {
        if (locked.current) return; // 🚀 Prevent double clicks
        locked.current = true;

        if (!user || !user._id) {
            alert("Please login first");
            locked.current = false;
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
                    customerName: user.name,
                    customerEmail: user.email,
                    customerPhone: user.phone,
                }
            );

            if (!data.payment_session_id) {
                alert("Payment session missing!");
                setLoading(false);
                locked.current = false;
                return;
            }

            const cashfree = await cashfreePromise;

            await cashfree.checkout({
                paymentSessionId: data.payment_session_id,
                redirectTarget: "_self",
            });

        } catch (err) {
            console.log("PAYMENT ERROR:", err);
            alert("Payment failed!");
            setLoading(false);
            locked.current = false;
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl font-semibold bg-fuchsia-700 text-white shadow-lg flex items-center justify-center disabled:opacity-50"
        >
            {loading && <Spinner />}
            {loading ? "Processing..." : `Buy Now - ₹${selectedPlan.price}`}
        </button>
    );
}

export default function SubscriptionPlans() {
    const [selectedPlan, setSelectedPlan] = useState(plans[0]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
            <div className="max-w-6xl mx-auto">

                <h2 className="text-3xl font-extrabold text-white text-center mb-6">
                    Subscription Plans
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            onClick={() => setSelectedPlan(plan)}
                            className={`relative rounded-2xl p-6 cursor-pointer transition border
                                ${selectedPlan.name === plan.name
                                    ? "bg-slate-900 text-white border-fuchsia-700 border-2"
                                    : "bg-slate-900 text-white border-gray-700"
                                }`}
                        >
                            <div className="flex justify-between">
                                <h3 className="font-medium text-lg">{plan.name}</h3>
                                <input
                                    type="radio"
                                    checked={selectedPlan.name === plan.name}
                                    onChange={() => setSelectedPlan(plan)}
                                />
                            </div>

                            <div className="mt-4 flex items-baseline">
                                <span className="text-3xl font-bold">₹{plan.price}</span>
                                <span className="line-through ml-3 text-gray-500">₹{plan.oldPrice}</span>
                            </div>

                            <p className="mt-2 text-sm text-fuchsia-300">{plan.discount}</p>
                        </div>
                    ))}
                </div>

                <CashfreeCheckoutForm selectedPlan={selectedPlan} /> {/* 🚀 Form always at bottom */}

                <div className="mt-16 text-center">
                    <h3 className="text-3xl font-bold mb-8 text-white">
                        100K+ Influencers Already Taking The Benefits
                    </h3>

                    <div className="flex flex-wrap justify-center gap-6">
                        {influencers.map((src, idx) => (
                            <img key={idx} src={src} className="w-20 h-20 rounded-full border-4 border-orange-400 shadow-lg" />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
