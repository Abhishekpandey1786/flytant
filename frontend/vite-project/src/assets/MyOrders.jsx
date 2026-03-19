import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = "https://vistafluence.onrender.com/api/stripe";

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const getStatusClasses = (status) => {
    const lowerStatus = status ? status.toLowerCase() : "";
    switch (lowerStatus) {
      case "success":
      case "succeeded":
        return "bg-green-500/80 text-white shadow-lg";
      case "failed":
        return "bg-red-600/80 text-white shadow-lg";
      case "pending":
      case "created":
      case "processing":
      default:
        return "bg-yellow-400/80 text-slate-900 shadow-lg";
    }
  };

  const handleDownloadInvoice = (orderId) => {
    const downloadUrl = `${API_BASE_URL}/download-invoice/${orderId}`;
    window.open(downloadUrl, "_blank");
  };

  useEffect(() => {
    if (!user || !user._id) {
      setLoading(false);
      setError("Please log in to view your orders.");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/my-orders/${user._id}`);
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        console.error("[MyOrders] Fetch Orders Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
        <svg
          className="animate-spin h-8 w-8 text-cyan-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="ml-3 text-cyan-300 font-medium">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-500 flex justify-center items-center">
        <p className="p-4 bg-slate-800 rounded-xl shadow-xl border border-red-500/50">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 mb-8 text-center drop-shadow-lg">
          🛒 My Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 p-6 border border-dashed border-fuchsia-600 rounded-xl max-w-md mx-auto bg-slate-800/50 shadow-lg backdrop-blur-md">
            <p className="mb-4 text-lg text-white">
              🎁 No orders yet!
            </p>
            <p className="text-sm">Explore our plans to start your journey.</p>
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
                className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-gray-700 hover:border-cyan-400 transition-transform hover:scale-[1.03] hover:shadow-cyan-500/30"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    {order.plan || "N/A"} Plan
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wide ${getStatusClasses(order.paymentStatus || order.status)}`}
                  >
                    {order.paymentStatus || order.status || "N/A"}
                  </span>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-300">
                  <p>
                    <span className="font-semibold text-white">Amount:</span>{" "}
                    <span className="text-lg text-green-400 font-bold">₹{order.amount}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-white">Order ID:</span>{" "}
                    {order.orderId || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Transaction:</span>{" "}
                    {order.transactionId || "N/A"}
                  </p>
                  <p className="col-span-full">
                    <span className="font-semibold text-white">Created:</span>{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Customer Details */}
                <div className="mt-4 border-t border-gray-700 pt-3">
                  <h4 className="font-semibold text-cyan-300 mb-2">Customer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-400">
                    {order.userName && <p><span className="text-white">Name:</span> {order.userName}</p>}
                    {order.userEmail && <p><span className="text-white">Email:</span> {order.userEmail}</p>}
                    {order.userPhoneNo && <p><span className="text-white">Phone:</span> {order.userPhoneNo}</p>}
                  </div>
                </div>

                {/* Invoice Button */}
                <div className="flex justify-end mt-4">
                  {order.paymentStatus?.toLowerCase() === "success" ? (
                    <button
                      onClick={() => handleDownloadInvoice(order.orderId)}
                      className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 text-white rounded-md hover:scale-105 transition-transform duration-200 text-sm font-semibold shadow-lg"
                    >
                      Download Invoice
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      No invoice available for pending/failed orders.
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
