const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/momo/charge", async (req, res) => {
  try {
    const { email, amount, phone, provider, orderId } = req.body;

    console.log("PAYSTACK KEY EXISTS:", !!process.env.PAYSTACK_SECRET_KEY);
    console.log("PAYSTACK KEY STARTS WITH:", process.env.PAYSTACK_SECRET_KEY?.slice(0, 7));

    if (!email || !amount || !phone || !provider || !orderId) {
      return res.status(400).json({
        message: "Email, amount, phone, provider, and orderId are required",
      });
    }

    const amountInPesewas = Math.round(Number(amount) * 100);

    const response = await axios.post(
      "https://api.paystack.co/charge",
      {
        email,
        amount: amountInPesewas,
        currency: "GHS",
        reference: `MONNI_${orderId}_${Date.now()}`,
        mobile_money: {
          phone,
          provider,
        },
        metadata: {
          orderId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    console.log("MOMO CHARGE ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      message: "MoMo charge failed",
      error: err.response?.data || err.message,
    });
  }
});

router.get("/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    console.log("VERIFY PAYMENT ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      message: "Payment verification failed",
      error: err.response?.data || err.message,
    });
  }
});

module.exports = router;