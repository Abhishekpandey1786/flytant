const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },

    orderId: { type: String, required: true, unique: true },
    cfOrderId: { type: String },

    paymentId: { type: String, unique: true, sparse: true },

    customerName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },

    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'],
        default: 'pending'
    },

    paidAt: { type: Date },

    invoiceUrl: { type: String },

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
