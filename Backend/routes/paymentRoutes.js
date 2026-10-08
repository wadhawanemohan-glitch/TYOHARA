const express = require("express");

const {
  getRazorpay,
  isValidSignature
} = require("../config/razorpay");

const config = require("../config/env");

const {
  priceCart,
  CartError
} = require("../utils/pricing");

const router = express.Router();


// =====================================================
// CREATE RAZORPAY ORDER
//
// The customer sends the cart (productId + quantity only).
// The amount is calculated here from real product prices,
// so it cannot be changed from the browser.
// =====================================================

router.post("/create-order", async (req, res) => {

  try {

    const razorpay = getRazorpay();

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Online payments are unavailable right now."
      });
    }

    const pricing = await priceCart(req.body?.items);

    const order = await razorpay.orders.create({

      amount: Math.round(pricing.total * 100),

      currency: "INR",

      receipt: "TYOHARA_" + Date.now(),

      payment_capture: 1

    });

    return res.status(200).json({

      success: true,

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },

      pricing: {
        subtotal: pricing.subtotal,
        delivery: pricing.delivery,
        total: pricing.total
      },

      key: config.RAZORPAY_KEY_ID

    });

  } catch (error) {

    if (error instanceof CartError) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error(
      "Razorpay create order error:",
      error?.error?.description || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order."
    });

  }

});


// =====================================================
// VERIFY RAZORPAY PAYMENT SIGNATURE
//
// Kept for compatibility. The final check (signature,
// amount and paid status) happens again when the order
// is saved in POST /api/orders.
// =====================================================

router.post("/verify", (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body || {};

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({
      success: false,
      message: "Payment verification details are missing."
    });
  }

  if (
    !isValidSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Payment signature verification failed."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully.",
    payment: {
      razorpay_order_id,
      razorpay_payment_id
    }
  });

});


module.exports = router;
