const OrderSchema = new mongoose.Schema({
    userId: String,
    planName: String,
    amount: Number,
    orderId: String,
    cfOrderId: String,

    status: { type: String, default: "pending" },

    // Payment details
    paymentId: String,
    paymentMethod: String,
    paymentAmount: Number,
    paymentCurrency: String,
    paymentTime: String,
    bankReference: String,

}, { timestamps: true });
