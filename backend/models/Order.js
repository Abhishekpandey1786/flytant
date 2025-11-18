// models/Order.js

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

    // ❗️ FIX: paymentId should NOT be unique (webhook retry may cause duplicate)
    paymentId: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Order', OrderSchema);
