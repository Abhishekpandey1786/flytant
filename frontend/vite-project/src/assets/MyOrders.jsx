import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function MyOrders() {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !user._id) {
            setLoading(false);
            setError("Please log in to view your orders.");
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get(
                    `https://vistafluence.onrender.com/api/cashfree/orders/${user._id}`
                );

                // Filter only successful orders
                const realOrders = response.data.filter(
                    (o) => o.status === "succeeded"
                );

                setOrders(realOrders);
            } catch (err) {
                setError("Failed to fetch orders. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center text-xl">
                Loading your orders...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-red-500 flex justify-center items-center text-xl">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-4xl font-bold text-white text-center mb-10 drop-shadow-lg">
                    My Orders
                </h2>

                {orders.length === 0 ? (
                    <p className="text-center text-gray-400 text-lg">
                        You have no successful orders yet.
                    </p>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl shadow-xl p-6 transition hover:shadow-2xl hover:scale-[1.01] duration-300"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-semibold text-white">
                                        {order.planName}
                                    </h3>

                                    <span
                                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                            order.status === "succeeded"
                                                ? "bg-green-500 text-white"
                                                : order.status === "failed"
                                                ? "bg-red-500 text-white"
                                                : "bg-yellow-500 text-white"
                                        }`}
                                    >
                                        {order.status === "succeeded" && <CheckCircle size={16} />}
                                        {order.status === "failed" && <XCircle size={16} />}
                                        {order.status === "pending" && <Clock size={16} />}
                                        {order.status}
                                    </span>
                                </div>

                                {/* Details Section */}
                                <div className="grid sm:grid-cols-2 gap-4 text-gray-300">
                                    <p>
                                        <span className="font-semibold text-white">Order ID:</span>{" "}
                                        {order.orderId}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-white">Session ID:</span>{" "}
                                        {order.paymentSessionId || "N/A"}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-white">Payment Method:</span>{" "}
                                        {order.paymentMethod || "N/A"}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-white">Customer Email:</span>{" "}
                                        {order.customerEmail || "N/A"}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-white">Customer Name:</span>{" "}
                                        {order.customerName || "N/A"}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-white">Phone:</span>{" "}
                                        {order.customerPhone || "N/A"}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-white">Date:</span>{" "}
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-white">Amount Paid:</span>{" "}
                                        <span className="text-green-400 font-bold text-lg">
                                            ₹{order.amount}
                                        </span>
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-slate-700 my-4"></div>

                                {/* Footer */}
                                <div className="flex justify-end">
                                    <button className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">
                                        View Invoice
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
