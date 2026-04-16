import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = "https://vistafluence.onrender.com/api/instamojo";

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. INR Formatter
  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // 2. Format Date
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

  // 3. Expiry & Validity Logic
  // Agar plan "Basic" hai toh 30 din, "Premium" hai toh 365 din (aap change kar sakte hain)
  const getPlanDuration = (planName) => {
    const p = planName?.toLowerCase();
    if (p === "basic") return 30;
    if (p === "premium") return 365;
    return 30; // Default
  };

  const calculateExpiry = (createdAt, planName) => {
    if (!createdAt) return { date: "N/A", daysLeft: 0 };
    
    const startDate = new Date(createdAt);
    const duration = getPlanDuration(planName);
    const expiryDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
    
    const today = new Date();
    const diffTime = expiryDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      date: expiryDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      isExpired: daysLeft <= 0
    };
  };

  // 4. Status Styling
  const getStatusClasses = (status) => {
    const s = status?.toLowerCase();
    if (s === "success" || s === "credit") return "bg-green-500/20 text-green-400 border border-green-500/50";
    if (s === "failed") return "bg-red-500/20 text-red-400 border border-red-500/50";
    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/my-orders/${user._id}`,
          { headers: { 'Cache-Control': 'no-cache' } }
        );
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Orders load nahi ho paaye. Please refresh karein.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?._id]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center">
        <div className="animate-spin h-12 w-12 border-t-4 border-cyan-500 border-solid rounded-full mb-4"></div>
        <p className="text-slate-400 animate-pulse">Syncing your subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h2 className="text-5xl font-black text-white tracking-tight mb-2">My <span className="text-fuchsia-500">Orders</span></h2>
          <p className="text-slate-400">Manage your active plans and billing history</p>
        </header>

        {orders.length === 0 ? (
          <div className="text-center p-16 border border-slate-800 rounded-3xl bg-slate-900/50 backdrop-blur-sm">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-white mb-2">No active orders found</h3>
            <p className="text-slate-500 mb-8">You haven't subscribed to any plan yet.</p>
            <a href="/plans" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-full font-bold transition-all">Explore Plans</a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const info = calculateExpiry(order.createdAt, order.plan);
              return (
                <div key={order._id} className="group relative bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300">
                  
                  {/* Decorative Gradient Bar */}
                  <div className={`h-1.5 w-full ${info.isExpired ? 'bg-red-500' : 'bg-gradient-to-r from-fuchsia-500 to-cyan-500'}`}></div>

                  <div className="p-6 md:p-8">
                    {/* TOP SECTION */}
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{order.plan} Plan</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${getStatusClasses(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Order ID: {order.orderId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-white">{formatINR(order.amount)}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Billed Amount</p>
                      </div>
                    </div>

                    {/* MAIN DETAILS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Purchase Date</label>
                        <p className="text-sm text-slate-200 font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transaction ID</label>
                        <p className="text-sm text-slate-300 font-mono truncate">{order.transactionId}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                        <p className="text-sm text-slate-200 font-medium">{info.date}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subscription Status</label>
                        <p className={`text-sm font-black ${info.isExpired ? 'text-red-500' : 'text-cyan-400'}`}>
                          {info.isExpired ? "EXPIRED" : `${info.daysLeft} DAYS REMAINING`}
                        </p>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-6 flex flex-wrap justify-between items-center gap-4 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p>Verified Payment via Instamojo</p>
                      </div>
                      <p className="text-slate-500">
                        Account: <span className="text-slate-300 font-medium">{order.userEmail}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}