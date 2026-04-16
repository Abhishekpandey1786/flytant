import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

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
    const s = status?.toLowerCase();
    if (s === "success" || s === "credit") return "bg-green-500/80 text-white";
    if (s === "failed") return "bg-red-600/80 text-white";
    return "bg-yellow-400/80 text-slate-900";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      // 1. Check if user is actually available
      if (!user?._id) {
        // If AuthContext is still loading the user, don't stop the loading spinner yet
        console.log("Waiting for user ID...");
        return;
      }

      try {
        setLoading(true);
        console.log("📡 Fetching orders for User ID:", user._id);

        const response = await axios.get(
          `${API_BASE_URL}/my-orders/${user._id}`,
          { headers: { 'Cache-Control': 'no-cache' } } // Prevent browser caching
        );

        console.log("📦 Orders found:", response.data);
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error("❌ Fetch Error:", err.response?.data || err.message);
        setError("Orders load nahi ho paaye. Please refresh karein.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Use user?._id as dependency for precision
  }, [user?._id]); 

  // 🔄 Loading State
  if (loading && !user?._id) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center">
        <div className="animate-spin h-10 w-10 border-t-4 border-fuchsia-500 rounded-full mb-4"></div>
        <span className="font-medium">Authenticating User...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center">
        <div className="animate-spin h-10 w-10 border-t-4 border-cyan-500 rounded-full mb-4"></div>
        <span className="font-medium">Fetching your orders...</span>
      </div>
    );
  }

  // ❌ Error State
  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-500 flex justify-center items-center">
        <div className="p-6 bg-slate-800 rounded-xl shadow-xl border border-red-500/50 text-center">
          <p className="mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white mb-8 text-center">🛒 My Orders</h2>

        {orders.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 p-10 border border-dashed border-fuchsia-600 rounded-2xl max-w-md mx-auto bg-slate-800/30 backdrop-blur-md shadow-2xl">
            <p className="mb-4 text-xl text-white font-semibold">🎁 No orders yet!</p>
            <p className="text-sm mb-6 text-gray-400">
              Explore our plans to start your professional journey with us.
            </p>
            <a
              href="/plans"
              className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-300 font-bold shadow-[0_0_20px_rgba(192,38,211,0.5)]"
            >
              View Plans
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 mt-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700 hover:border-fuchsia-500/50 transition-all duration-300 group"
              >
                {/* Header Section */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 uppercase tracking-tight">
                      {order.plan} Plan
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">TXN: {order.transactionId}</p>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${getStatusClasses(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-y border-slate-700/50">
                  <div className="space-y-1">
                    <p className="text-slate-500 text-xs font-bold uppercase">Amount Paid</p>
                    <p className="text-2xl font-black text-green-400">
                      {formatINR(order.amount)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-xs font-bold uppercase">Purchase Date</p>
                    <p className="text-slate-200 font-medium">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 text-xs font-bold uppercase">Account Email</p>
                    <p className="text-slate-200 truncate font-medium">
                      {order.userEmail || "Not Provided"}
                    </p>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 flex justify-between items-center">
                   <p className="text-xs text-slate-500 italic">Order processed via Instamojo Secure Gateway</p>
                   {order.userName && (
                     <p className="text-xs text-slate-400 font-medium italic">Billed to: <span className="text-fuchsia-300">{order.userName}</span></p>
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