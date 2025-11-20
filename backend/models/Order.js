const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    customerName: {
        type: String
    },

    customerEmail: {
        type: String
    },

    customerPhone: {
        type: String
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

    cfOrderId: {
        type: String
    },

    paymentId: {
        type: String,
        sparse: true
    },

    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'],
        default: 'pending'
    },

    invoiceUrl: {
        type: String // /pdfs/orderid.pdf
    },

    paidAt: {
        type: Date // payment hone ki exact date/time
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
