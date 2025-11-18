// PaymentSuccess.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        // 2 sec wait (optional UI feel)
        setTimeout(() => {
            navigate("/my-orders");
        }, 1500);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-2xl">
            Payment Successful! Redirecting to your Orders...
        </div>
    );
}
