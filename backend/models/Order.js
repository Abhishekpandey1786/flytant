// models/Order.js

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    // --- USER/ORDER DETAILS ---
    userId: {
        type: String,
        required: true
    },
    planName: {
        type: String,
        required: true
    },
    amount: {
        type: Number, // ✅ Amount will be stored as a number (as per previous fix)
        required: true
    },
    
    // 💡 Customer Details for better record-keeping
    customerName: {
        type: String,
        required: true // Assuming name is always provided
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },

    // --- CASHFREE/PAYMENT GATEWAY DETAILS ---
    orderId: {
        type: String, // Your custom order ID (e.g., ORDER_1700...)
        required: true,
        unique: true
    },
    cfOrderId: {
        type: String, // 💡 Cashfree specific Order ID (essential for reconciliation)
        unique: true,
        sparse: true
    },
    paymentId: {
        type: String, // Cashfree specific Transaction ID (received via Webhook)
        unique: true,
        sparse: true
    }, 
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'],
        default: 'pending'
    },

    // --- TIMESTAMPS ---
    createdAt: {
        type: Date,
        default: Date.now
    },
    paymentTime: {
        type: Date, // 💡 Actual time when the payment was completed (received via Webhook)
        required: false
    }
});

module.exports = mongoose.model('Order', OrderSchema);