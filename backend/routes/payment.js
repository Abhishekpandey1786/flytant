const express = require("express");
const Stripe = require("stripe");

const router = express.Router();
const stripe = Stripe("sk_test_51S53C2F5Veqs61IyK6SQxo9PapQtticfUICwQr4eDQEHMLdMT3Ga0MKZ8dtND1AA9tAE30aCcS7DmJhOb0Ub0s9D00PQfw88Rk");

// Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    console.log("Body received:", req.body); // debug
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "Amount or currency missing" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount), // Stripe smallest unit
      currency,
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
