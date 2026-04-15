import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

// Correct API Base URL
const API_BASE_URL = "https://vistafluence.onrender.com/api/instamojo";

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // INR Formatter
  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Payment Status Styling
  const getStatusClasses = (status) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case "success":
      case "succeeded":
        return "bg-green-500/80 text-white";
      case "failed":
        return "bg-red-600/80 text-white";
      case "pending":
      case "processing":
      default:
        return "bg-yellow-400/80 text-slate-900";
    }
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
          `${API_BASE_URL}/my-orders/${user._id}`
        );
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        console.error(
          "[MyOrders] Fetch Orders Error:",
          err.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // 🔄 Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
        <svg
          className="animate-spin h-8 w-8 text-fuchsia-500"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
        <span className="ml-3 font-medium">Loading orders...</span>
      </div>
    );
  }

  // ❌ Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-500 flex justify-center items-center">
        <p className="p-4 bg-slate-800 rounded-xl shadow-xl border border-red-500/50">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white mb-8 text-center">
          🛒 My Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 p-6 border border-dashed border-fuchsia-600 rounded-xl max-w-md mx-auto bg-slate-800/50 shadow-lg backdrop-blur-md">
            <p className="mb-4 text-lg text-white">🎁 No orders yet!</p>
            <p className="text-sm">
              Explore our plans to start your journey.
            </p>
            <a
              href="/plans"
              className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 text-white rounded-md hover:scale-105 transition-transform duration-200 font-semibold shadow-lg"
            >
              View Plans
            </a>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-gray-700 hover:border-fuchsia-400 transition-transform hover:scale-[1.02]"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-fuchsia-400">
                    {order.plan} Plan
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusClasses(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-300">
                  <p>
                    <span className="font-semibold text-white">Amount:</span>{" "}
                    <span className="text-lg text-green-400 font-bold">
                      {formatINR(order.amount)}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-white">
                      Transaction ID:
                    </span>{" "}
                    {order.transactionId}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Order Date:</span>{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Customer Details */}
                <div className="mt-4 border-t border-gray-700 pt-3">
                  <h4 className="font-semibold text-fuchsia-400 mb-2">
                    Customer Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-400">
                    {order.userName && (
                      <p>
                        <span className="text-white">Name:</span>{" "}
                        {order.userName}
                      </p>
                    )}
                    {order.userEmail && (
                      <p>
                        <span className="text-white">Email:</span>{" "}
                        {order.userEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}