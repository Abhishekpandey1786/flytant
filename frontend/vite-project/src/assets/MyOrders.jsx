import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
// यदि आप React Router का उपयोग कर रहे हैं, तो Link को import करें 
// import { Link } from "react-router-dom"; 
import { AuthContext } from "./AuthContext";

// Define the base URL for the API
const API_BASE_URL = "https://vistafluence.onrender.com/api/cashfree";

export default function MyOrders() {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Helper function to format the date/time
     * यह function ISO Date string को लेता है और User-friendly format में बदलता है।
     */
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        // new Date() ISO string को सफलतापूर्वक Parse कर लेता है
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // 12-घंटे का format (जैसे AM/PM)
        });
    };

    /**
     * Helper function to determine the color class for the order status badge
     */
    const getStatusClasses = (status) => {
        const lowerStatus = status ? status.toLowerCase() : '';
        switch (lowerStatus) {
            case "succeeded":
                return "bg-green-600 text-white"; 
            case "failed":
                return "bg-red-600 text-white";   
            case "pending": 
            case "created": // यदि API 'created' status भेजता है
            case "processing":
            default:
                return "bg-yellow-500 text-slate-900"; 
        }
    };
    
    /**
     * Function to handle invoice download
     * यह Cashfree order ID का उपयोग करके Backend API को कॉल करता है
     */
    const handleDownloadInvoice = (orderId) => {
        const downloadUrl = `${API_BASE_URL}/download-invoice/${orderId}`;
        window.open(downloadUrl, '_blank');
    };


    useEffect(() => {
        // 1. Logged in न होने पर तुरंत रोकें
        if (!user || !user._id) { 
            setLoading(false);
            setError("Please log in to view your orders.");
            return;
        }
        
        // 2. Loading state सेट करें
        setLoading(true);
        setError(null);
        
        const fetchOrders = async () => {
            try {
                // API कॉल में authenticated user ID का उपयोग करें
                const response = await axios.get(
                    `${API_BASE_URL}/orders/${user._id}`
                );
                // 3. Data state में सेट करें
                setOrders(response.data);

            } catch (err) {
                // 4. Error प्रबंधन
                setError("Failed to fetch orders. Please try again later.");
                console.error("[MyOrders] Fetch Orders Error:", err.response?.data || err.message);
            } finally {
                // 5. Loading समाप्त
                setLoading(false);
            }
        };

        fetchOrders();
        
        // Dependency Array: केवल user._id बदलने पर fetch करें
    }, [user?._id]); 

    
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-fuchsia-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading orders...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-red-500 flex justify-center items-center">
                <p className="p-4 bg-slate-800 rounded-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 sm:px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg">
                    <span role="img" aria-label="shopping cart">🛒</span> My Orders
                </h2>
                <hr className="border-gray-700" />
                
                {orders.length === 0 ? (
                    // खाली ऑर्डर्स के लिए बेहतर UI
                    <div className="text-center text-gray-400 mt-10 p-6 border border-dashed border-fuchsia-600 rounded-lg max-w-md mx-auto">
                        <p className="mb-4 text-lg">
                            <span role="img" aria-label="gift">🎁</span> **Looks like you haven't placed any orders yet!**
                        </p>
                        <p className="text-sm">
                            Go explore our plans to start your journey.
                        </p>
                        {/* /plans को अपनी वास्तविक routing path से बदलें */}
                        <a href="/plans" className="mt-4 inline-block px-6 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 transition duration-150 font-semibold shadow-lg">
                            View Plans
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6 mt-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-slate-800 rounded-lg p-6 shadow-xl border border-gray-700 hover:border-fuchsia-700 transition duration-300"
                            >
                                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                                    <h3 className="text-2xl font-bold text-fuchsia-400">
                                        {order.planName || 'N/A'} Plan
                                    </h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wider ${getStatusClasses(order.status)}`}
                                    >
                                        {order.status || 'N/A'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-gray-400">
                                    
                                    {/* Financial Details */}
                                    <p className="sm:col-span-2 md:col-span-1">
                                        <span className="font-semibold text-white">Amount:</span>{" "}
                                        <span className="text-lg text-green-400 font-bold">₹{order.amount}</span>
                                    </p>
                                    <p className="sm:col-span-2 md:col-span-1">
                                        <span className="font-semibold text-white">Order ID:</span>{" "}
                                        {order.orderId || 'N/A'}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-white">Cashfree ID:</span>{" "}
                                        {order.cfOrderId || 'N/A'}
                                    </p>

                                    {/* Customer Details */}
                                    <div className="col-span-full border-t border-gray-700 pt-3 mt-3">
                                        <h4 className="font-semibold text-fuchsia-300 mb-1">Customer Details:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2">
                                            {order.customerName && (
                                                <p>
                                                    <span className="font-medium text-white">Name:</span>{" "}
                                                    {order.customerName}
                                                </p>
                                            )}
                                            {order.customerEmail && (
                                                <p>
                                                    <span className="font-medium text-white">Email:</span>{" "}
                                                    {order.customerEmail}
                                                </p>
                                            )}
                                            {order.customerPhone && (
                                                <p>
                                                    <span className="font-medium text-white">Phone:</span>{" "}
                                                    {order.customerPhone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Payment IDs and Dates */}
                                    <p>
                                        <span className="font-semibold text-white">Order Created:</span>{" "}
                                        {formatDate(order.createdAt)}
                                    </p>
                                    {/* यहाँ formatDate का उपयोग किया जा रहा है, जो सही है */}
                                    {order.paidAt && order.status === 'succeeded' && (
                                        <p>
                                            <span className="font-semibold text-white">Paid On:</span>{" "}
                                            {formatDate(order.paidAt)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end mt-4">
                                    {order.status === 'succeeded' ? (
                                        <button 
                                            onClick={() => handleDownloadInvoice(order.orderId)} 
                                            className="px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 transition duration-150 text-sm flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v7a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            Download Invoice
                                        </button>
                                    ) : (
                                        <span className="text-sm text-gray-500 italic">No invoice available for {order.status} orders.</span>
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