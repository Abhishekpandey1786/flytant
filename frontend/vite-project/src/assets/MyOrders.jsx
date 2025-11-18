import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export default function MyOrders() {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!user?._id) return;

        axios.get(`https://vistafluence.onrender.com/api/cashfree/orders/${user._id}`)
            .then(res => setOrders(res.data))
            .catch(err => console.log(err));
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <h1 className="text-3xl text-center mb-6">My Orders</h1>

            {orders.length === 0 && (
                <p className="text-center text-gray-400">No orders found.</p>
            )}

            <div className="space-y-6">
                {orders.map(order => (
                    <div
                        key={order._id}
                        className="bg-slate-800 p-6 rounded-xl border border-slate-700"
                    >
                        <div className="flex justify-between mb-3">
                            <h2 className="text-xl">{order.planName}</h2>
                            <span className={`px-3 py-1 rounded text-sm ${
                                order.status === "succeeded" ? "bg-green-500" : "bg-yellow-500"
                            }`}>
                                {order.status}
                            </span>
                        </div>

                        <p><strong>Order ID:</strong> {order.orderId}</p>
                        <p><strong>Amount:</strong> ₹{order.amount}</p>
                        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

                        {order.status === "succeeded" && order.paymentDetails && (
                            <div className="mt-4 bg-slate-900 p-4 rounded border border-slate-700">
                                <h3 className="text-green-400 text-lg mb-2">Payment Details</h3>

                                <p><strong>Payment ID:</strong> {order.paymentId}</p>
                                <p><strong>Method:</strong> {order.paymentDetails.method}</p>
                                {order.paymentDetails.bank && (
                                    <p><strong>Bank:</strong> {order.paymentDetails.bank}</p>
                                )}
                                {order.paymentDetails.wallet && (
                                    <p><strong>Wallet:</strong> {order.paymentDetails.wallet}</p>
                                )}
                                {order.paymentDetails.utr && (
                                    <p><strong>UTR:</strong> {order.paymentDetails.utr}</p>
                                )}
                                {order.paymentDetails.referenceId && (
                                    <p><strong>Reference ID:</strong> {order.paymentDetails.referenceId}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
