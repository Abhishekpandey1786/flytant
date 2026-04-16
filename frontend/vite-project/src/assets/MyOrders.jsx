import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = "https://vistafluence.onrender.com/api/instamojo";

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

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

  const getStatusClasses = (status) => {
    const s = status?.toLowerCase();
    if (s === "success" || s === "credit") return "bg-green-500/80 text-white";
    if (s === "failed") return "bg-red-600/80 text-white";
    return "bg-yellow-400/80 text-slate-900";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      // Check if user is loaded from Context
      if (!user?._id) {
        console.log("Waiting for user context...");
        return; 
      }

      try {
        setLoading(true);
        console.log(`📡 Fetching orders for: ${user._id}`);
        
        const response = await axios.get(`${API_BASE_URL}/my-orders/${user._id}`);
        
        console.log("📦 Data received from server:", response.data);
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error("❌ API Error:", err.response?.data || err.message);
        setError("Orders load nahi ho paaye. Please refresh karein.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?._id]); // Dependency on user ID

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-fuchsia-500 mr-3"></div>
        <span>Orders check ho rahe hain...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white mb-8 text-center">🛒 My Orders</h2>

        {orders.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 p-10 border border-dashed border-gray-700 rounded-xl bg-slate-900/50">
            <p className="text-xl text-white mb-4">Koi orders nahi mile!</p>
            <p>Agar aapne payment kar di hai, toh 1-2 minute wait karke refresh karein.</p>
            <a href="/plans" className="mt-6 inline-block px-8 py-3 bg-fuchsia-600 text-white rounded-lg font-bold">
              Plans Dekhein
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-fuchsia-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-fuchsia-400">{order.plan} Plan</h3>
                    <p className="text-sm text-gray-500 mt-1">Transaction: {order.transactionId}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${getStatusClasses(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-10 mt-6 border-t border-slate-800 pt-4">
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Amount</p>
                    <p className="text-xl font-bold text-white">{formatINR(order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Date</p>
                    <p className="text-white">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Email</p>
                    <p className="text-white">{order.userEmail || "N/A"}</p>
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