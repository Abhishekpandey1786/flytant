import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export default function MyOrders() {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Format the date cleanly
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

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
                setOrders(response.data);
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
            <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
                Loading orders...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-red-500 flex justify-center items-center">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg">
                    My Orders
                </h2>

                {orders.length === 0 ? (
                    <p className="text-center text-gray-400">You have no orders yet.</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-slate-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-fuchsia-700 transition duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-fuchsia-400">
                                        {order.planName} Plan
                                    </h3>

                                    {/* Status Badge */}
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wider
                                            ${
                                                order.status === "succeeded"
                                                    ? "bg-green-500 text-white"
                                                    : order.status === "failed"
                                                    ? "bg-red-500 text-white"
                                                    : "bg-yellow-500 text-slate-900"
                                            }
                                        `}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-400">

                                    {/* Financial Details */}
                                    <p>
                                        <span className="font-semibold text-white">Amount:</span>{" "}
                                        ₹{order.amount}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-white">Order ID:</span>{" "}
                                        {order.orderId}
                                    </p>

                                    {/* Customer Details */}
                                    {order.customerName && (
                                        <p>
                                            <span className="font-semibold text-white">Name:</span>{" "}
                                            {order.customerName}
                                        </p>
                                    )}

                                    {order.customerEmail && (
                                        <p>
                                            <span className="font-semibold text-white">Email:</span>{" "}
                                            {order.customerEmail}
                                        </p>
                                    )}

                                    {order.customerPhone && (
                                        <p>
                                            <span className="font-semibold text-white">Phone:</span>{" "}
                                            {order.customerPhone}
                                        </p>
                                    )}

                                    {/* Cashfree Order ID */}
                                    {order.cfOrderId && (
                                        <p className="col-span-1 md:col-span-2">
                                            <span className="font-semibold text-white">Cashfree ID:</span>{" "}
                                            {order.cfOrderId}
                                        </p>
                                    )}

                                    {/* Create & Paid Dates */}
                                    <p>
                                        <span className="font-semibold text-white">Order Created:</span>{" "}
                                        {formatDate(order.createdAt)}
                                    </p>

                                    {order.paidAt && order.status === "succeeded" && (
                                        <p>
                                            <span className="font-semibold text-white">Paid On:</span>{" "}
                                            {formatDate(order.paidAt)}
                                        </p>
                                    )}
                                </div>

                                {/* ⭐ Invoice Download Button */}
                                {order.status === "succeeded" && (
                                    <a
                                        href={`https://vistafluence.onrender.com/pdfs/${order.orderId}.pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-block bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Download Invoice
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
