const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const router = express.Router();


// =====================================================
// RAZORPAY INSTANCE
// =====================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

router.post("/create-order", async (req, res) => {

  try {

    const { amount } = req.body;


    if (!amount || Number(amount) <= 0) {

      return res.status(400).json({
        success: false,
        message: "Valid amount is required."
      });

    }


    const options = {

      amount:
        Math.round(Number(amount) * 100),

      currency: "INR",

      receipt:
        "TYOHARA_" +
        Date.now(),

      payment_capture: 1

    };


    const order =
      await razorpay.orders.create(
        options
      );


    return res.status(200).json({

      success: true,

      order: {

        id: order.id,

        amount: order.amount,

        currency: order.currency

      },

      key:
        process.env.RAZORPAY_KEY_ID

    });

  } catch (error) {

    console.error(
      "Razorpay create order error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to create Razorpay order."

    });

  }

});


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

router.post("/verify", async (req, res) => {

  try {

    const {

      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature

    } = req.body;


    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Payment verification details are missing."

      });

    }


    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");


    if (
      generatedSignature !==
      razorpay_signature
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Payment signature verification failed."

      });

    }


    return res.status(200).json({

      success: true,

      message:
        "Payment verified successfully.",

      payment: {

        razorpay_order_id,

        razorpay_payment_id

      }

    });

  } catch (error) {

    console.error(
      "Razorpay verification error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Payment verification failed."

    });

  }

});


module.exports = router;