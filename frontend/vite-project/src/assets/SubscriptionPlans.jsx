import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";

// --- CASHFREE INTEGRATION KE LIYE BADLAV YAHAN HAIN ---
function CashfreeCheckoutForm({ selectedPlan }) {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleCashfreePayment = async () => {
        // 1. Login check
        if (!user || !user._id) {
            alert("Please log in to make a payment.");
            return;
        }

        // Cashfree mein amount 'rupees' mein bheja jata hai, server side par /100 kiya jayega.
        // Customer Details required hain. Assuming user object mein data hai.
        const customerDetails = {
            customer_id: user._id,
            customer_phone: user.phone || '9999999999', // Phone number required
            customer_email: user.email || 'customer@example.com', // Email required
            customer_name: user.name || 'Customer'
        };

        setLoading(true);
        try {
            // 2. Server se Cashfree Order aur Session ID create karna
            const { data } = await axios.post("https://vistafluence.onrender.com/api/payments/order", {
                // Server ko amount paise/rupees mein bhej rahe hain, server use /100 karega
                amount: selectedPlan.price * 100, // Assuming price is in Rupees, sending in Paise to server
                currency: "INR",
                planName: selectedPlan.name,
                userId: user._id,
                customerDetails: customerDetails,
            });

            const { paymentSessionId, orderId } = data;

            if (!paymentSessionId) {
                alert("Error creating payment session. Please try again.");
                setLoading(false);
                return;
            }

            // 3. Cashfree Handler initialize karna
            // Ensure window.CashFree is available (script tag added in index.html)
            const cashfree = new window.CashFree(paymentSessionId);

            // 4. Payment Gateway Open karna
            // Cashfree Pop-up mode ke liye
            cashfree.ready(() => {
                cashfree.checkout({
                    orderToken: paymentSessionId,
                    // Checkout ka pop-up mode. Aap 'redirect' bhi use kar sakte hain
                    mode: 'popup', 
                    // onOpen: () => { console.log("Cashfree Modal Opened"); },
                    // onIntegrate: () => { console.log("Integration done"); },
                    onClose: () => {
                        console.log("Cashfree Modal Closed");
                        
                        // Payment fail hone par ya user close karne par,
                        // order status verify karne ke liye aap yahan server call kar sakte hain.
                        // Lekin Webhook zyada reliable hai.

                        // Example: Server side verification call (optional, webhook is better)
                        // axios.get(`https://vistafluence.onrender.com/api/payments/order-status/${orderId}`)
                        //   .then(res => {
                        //       if (res.data.status === 'succeeded') {
                        //           alert('Payment successful!');
                        //           navigate('/my-orders');
                        //       } else if (res.data.status === 'failed') {
                        //           alert('Payment failed.');
                        //       }
                        //   });

                        setLoading(false);
                    },
                });
            });

        } catch (error) {
            console.error("Cashfree Payment Error:", error);
            alert("Payment initialization failed: " + (error.response?.data?.message || error.message));
        }
        setLoading(false); // Ye line agar cashfree.ready() fail ho jaye to zaroori hai
    };

    return (
        <div className="mt-6 space-y-4">
            <button
                onClick={handleCashfreePayment}
                disabled={loading}
                className="relative w-full mt-4 py-3 rounded-xl font-semibold bg-fuchsia-700 text-white shadow-lg hover:shadow-fuchsia-800/50"
            >
                {loading ? "Redirecting to Cashfree..." : `Buy Now - ₹${selectedPlan.price}`}
            </button>
        </div>
    );
}
// ----------------------------------------------------------------------------------

// --- SubscriptionPlans Component (jahan CashfreeCheckoutForm ka upyog ho raha hai) ---
export default function SubscriptionPlans() {
    const [selectedPlan, setSelectedPlan] = useState(plans[0]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
            <div className="max-w-6xl mx-auto">
                {/* ... other code (headings, influencers) ... */}
                
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
                            {/* ... price display ... */}
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
                            {/* Component Name Change */}
                            {selectedPlan.name === plan.name && (
                                <CashfreeCheckoutForm selectedPlan={selectedPlan} />
                            )}
                        </div>
                    ))}
                </div>
                {/* ... other code (influencers list) ... */}
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