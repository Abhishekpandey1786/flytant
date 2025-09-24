import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

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
                const response = await axios.get(`http://localhost:5000/api/razorpay/orders/${user._id}`);
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
        return <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">Loading orders...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-slate-950 text-red-500 flex justify-center items-center">{error}</div>;
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
                                className="bg-slate-800 rounded-lg p-6 shadow-lg border border-gray-700"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-white">
                                        {order.planName}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'succeeded' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-gray-400 space-y-2">
                                    <p>
                                        <span className="font-semibold text-white">Order ID:</span> {order.orderId}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-white">Amount:</span> ₹{(order.amount / 100).toFixed(2)}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-white">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}