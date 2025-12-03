import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = "https://vistafluence.onrender.com/api/cashfree";

export default function MyOrders() {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Format date helper
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

    // Badge color for status
    const getStatusClasses = (status) => {
        switch (status) {
            case "succeeded":
                return "bg-green-500 text-white";
            case "failed":
                return "bg-red-500 text-white";
            default:
                return "bg-yellow-500 text-slate-900";
        }
    };

    // Invoice Download
    const handleDownloadInvoice = (orderId) => {
        const url = `${API_BASE_URL}/download-invoice/${orderId}`;
        window.open(url, "_blank");
    };

    useEffect(() => {
        // 🚨 FIX: Check if user is loaded
        if (!user || !user._id) {
            setLoading(false);
            setError("Please log in to view your orders.");
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/orders/${user._id}`
                );
                setOrders(response.data);
            } catch (err) {
                setError("Failed to fetch orders. Please try again later.");
                console.error("Fetch Orders Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]); // 🚀 FIXED dependency — safe & correct

    // Loading UI
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
                <svg
                    className="animate-spin h-6 w-6 text-fuchsia-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                Loading orders...
            </div>
        );
    }

    // Error UI
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-red-500 flex justify-center items-center">
                <p className="p-4 bg-slate-800 rounded-lg">{error}</p>
            </div>
        );
    }

    // Main UI
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 text-center">
                    🛒 My Orders
                </h2>
                <hr className="border-gray-700" />

                {orders.length === 0 ? (
                    <p className="text-center text-gray-400 mt-10 p-4 border border-dashed border-gray-600 rounded-md">
                        You have no orders yet. Go purchase a plan!
                    </p>
                ) : (
                    <div className="space-y-6 mt-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-slate-800 rounded-lg p-6 shadow-xl border border-gray-700 hover:border-fuchsia-700 transition"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                                    <h3 className="text-2xl font-bold text-fuchsia-400">
                                        {order.planName} Plan
                                    </h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${getStatusClasses(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                {/* Order Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-gray-300">
                                    <p>
                                        <span className="font-semibold text-white">
                                            Amount:
                                        </span>{" "}
                                        <span className="text-green-400 font-bold">
                                            ₹{order.amount}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-semibold text-white">
                                            Order ID:
                                        </span>{" "}
                                        {order.orderId}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-white">
                                            Cashfree ID:
                                        </span>{" "}
                                        {order.cfOrderId || "N/A"}
                                    </p>

                                    {/* Customer */}
                                    <div className="col-span-full border-t border-gray-700 pt-3 mt-3">
                                        <h4 className="font-semibold text-fuchsia-300 mb-1">
                                            Customer Details:
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2">
                                            {order.customerName && (
                                                <p>
                                                    <span className="font-medium text-white">
                                                        Name:
                                                    </span>{" "}
                                                    {order.customerName}
                                                </p>
                                            )}
                                            {order.customerEmail && (
                                                <p>
                                                    <span className="font-medium text-white">
                                                        Email:
                                                    </span>{" "}
                                                    {order.customerEmail}
                                                </p>
                                            )}
                                            {order.customerPhone && (
                                                <p>
                                                    <span className="font-medium text-white">
                                                        Phone:
                                                    </span>{" "}
                                                    {order.customerPhone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <p>
                                        <span className="font-semibold text-white">
                                            Created:
                                        </span>{" "}
                                        {formatDate(order.createdAt)}
                                    </p>
                                    {order.paidAt && (
                                        <p>
                                            <span className="font-semibold text-white">
                                                Paid On:
                                            </span>{" "}
                                            {formatDate(order.paidAt)}
                                        </p>
                                    )}
                                </div>

                                {/* Invoice Button */}
                                <div className="flex justify-end mt-4">
                                    {order.status === "succeeded" ? (
                                        <button
                                            onClick={() =>
                                                handleDownloadInvoice(order.orderId)
                                            }
                                            className="px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 flex gap-2 text-sm"
                                        >
                                            Download Invoice
                                        </button>
                                    ) : (
                                        <span className="text-sm text-gray-500 italic">
                                            No invoice for {order.status} orders.
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
