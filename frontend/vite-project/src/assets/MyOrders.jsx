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
      maximumFractionDigits: 2,
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
      hour12: true,
    });
  };

  const getPlanDuration = (planName) => {
    const p = planName?.toLowerCase();
    if (p === "basic") return 30;
    if (p === "premium") return 365;
    return 30;
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
        const response = await axios.get(`${API_BASE_URL}/my-orders/${user._id}`);
        setOrders(response.data);
      } catch (err) {
        setError("Orders load nahi ho paaye.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 text-center">
        <div className="animate-spin h-10 w-10 border-t-4 border-fuchsia-800 border-solid rounded-full mb-4"></div>
        <p className="text-slate-400">Syncing your subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 uppercase">My Orders</h2>
          <p className="text-slate-400 text-sm md:text-base">Active plans and billing history</p>
        </header>

        {orders.length === 0 ? (
          <div className="text-center p-8 md:p-16 border border-slate-800 rounded-3xl bg-slate-900/50 backdrop-blur-sm">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">No active orders</h3>
            <p className="text-slate-500 mb-6 text-sm">Explore our premium plans to get started.</p>
            <button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2.5 rounded-full font-bold transition-all text-sm uppercase">Explore Plans</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const info = calculateExpiry(order.createdAt, order.plan);
              return (
                <div key={order._id} className="group bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300">
                  {/* Status Bar */}
                  <div className={`h-1.5 w-full ${info.isExpired ? 'bg-red-500' : 'bg-fuchsia-800'}`}></div>
                  
                  <div className="p-5 md:p-8">
                    {/* Header: Plan & Price */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
                      <div className="w-full sm:w-auto">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl md:text-2xl font-bold text-white uppercase">{order.plan} Plan</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase whitespace-nowrap ${getStatusClasses(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest break-all">Order ID: {order.orderId}</p>
                      </div>
                      <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0">
                        <p className="text-2xl md:text-3xl font-black text-white">{formatINR(order.amount)}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Billed Amount</p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Purchase Date</label>
                        <p className="text-xs md:text-sm text-slate-200 font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="overflow-hidden">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transaction ID</label>
                        <p className="text-xs md:text-sm text-slate-300 font-mono truncate hover:whitespace-normal transition-all" title={order.transactionId}>
                          {order.transactionId}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                        <p className="text-xs md:text-sm text-slate-200 font-medium">{info.date}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                        <p className={`text-xs md:text-sm font-black ${info.isExpired ? 'text-red-500' : 'text-fuchsia-600'}`}>
                          {info.isExpired ? "EXPIRED" : `${info.daysLeft} DAYS LEFT`}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] md:text-xs text-center md:text-left">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p>Verified Payment via Instamojo</p>
                      </div>
                      <p className="text-slate-500 italic">
                        Account: <span className="text-slate-300 font-medium break-all">{order.userEmail}</span>
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