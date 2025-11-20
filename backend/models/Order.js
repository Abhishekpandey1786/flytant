// models/Order.js (Updated Schema)

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    planName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    // --- Naye Fields Yahan Jodien ---
    customerName: {
        type: String,
        required: false // Ya true agar aap frontend se iski guarantee lete hain
    },
    customerEmail: {
        type: String,
        required: true // Email aam taur par zaroori hota hai
    },
    customerPhone: {
        type: String,
        required: false
    },
    // --- End Naye Fields ---

    paymentId: {
        type: String,
        unique: true,
        sparse: true
    }, 
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'],
        default: 'pending'
    },
    // Cashfree order ID ke liye
    cfOrderId: { 
        type: String,
        unique: true,
        sparse: true
    }, 
    // Payment success hone ka exact samay
    paidAt: { 
        type: Date 
    }, 
    
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Order', OrderSchema);