const express = require("express");

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const {
  verifyToken,
  optionalAuth,
  adminOnly
} = require("../middleware/authMiddleware");

const { createRateLimiter } = require("../middleware/security");

const {
  getRazorpay,
  isValidSignature
} = require("../config/razorpay");

const {
  priceCart,
  CartError
} = require("../utils/pricing");

const {
  PAYMENT_METHODS,
  ValidationError,
  validateCustomer,
  generateOrderId,
  generateAccessKey,
  safeEqual,
  escapeRegex,
  fullOrderView,
  publicOrderView
} = require("../utils/orderHelpers");

const router = express.Router();


const placeOrderLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many order attempts. Please try again later."
});

const lookupLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many lookups. Please try again later."
});


const sendError = (res, error, fallbackMessage) => {

  if (
    error instanceof CartError ||
    error instanceof ValidationError
  ) {
    return res.status(error.status).json({
      success: false,
      message: error.message
    });
  }

  console.error(fallbackMessage, error.message);

  return res.status(500).json({
    success: false,
    message: fallbackMessage
  });
};


// Is this logged-in user the person who placed the order?
const ownsOrder = async (user, order) => {

  if (!user) {
    return false;
  }

  if (
    order.userId &&
    String(order.userId) === String(user.userId)
  ) {
    return true;
  }

  const account = await User.findById(user.userId).select("email");

  return Boolean(
    account &&
    order.customer?.email &&
    account.email.toLowerCase() ===
      order.customer.email.toLowerCase()
  );
};


// ======================================================
// CREATE NEW ORDER
//
// The customer only sends WHAT they want (productId and
// quantity), WHERE it goes, and (for online payments) the
// Razorpay payment proof. Prices, totals and payment status
// are all decided here on the server.
// ======================================================

router.post(
  "/",
  placeOrderLimiter,
  optionalAuth,
  async (req, res) => {
    try {

      const body = req.body || {};

      const customer = validateCustomer(body.customer);

      const paymentKind =
        PAYMENT_METHODS[body.paymentMethod];

      if (!paymentKind) {
        throw new ValidationError(
          "Please choose a valid payment method."
        );
      }

      const paymentFields = {
        paymentStatus: "Pending"
      };

      const proof = body.razorpay || {};

      const razorpayOrderId = proof.order_id;
      const razorpayPaymentId = proof.payment_id;
      const razorpaySignature = proof.signature;


      // -----------------------------------------------
      // ONLINE PAYMENT, STEP 1: signature + duplicate check
      // (done before pricing, so a retry after a network
      // problem still finds the order that already exists)
      // -----------------------------------------------

      if (paymentKind === "online") {

        if (
          !isValidSignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
          )
        ) {
          throw new ValidationError(
            "Payment verification failed."
          );
        }

        const existing = await Order.findOne({
          razorpayOrderId
        }).select("+accessKey");

        if (existing) {
          return res.status(200).json({
            success: true,
            message: "Order already placed",
            order: {
              ...fullOrderView(existing),
              accessKey: existing.accessKey
            }
          });
        }
      }


      // Prices and totals always come from the database
      const pricing = await priceCart(body.items);


      // -----------------------------------------------
      // ONLINE PAYMENT, STEP 2: amount really paid
      // -----------------------------------------------

      if (paymentKind === "online") {

        const razorpay = getRazorpay();

        if (!razorpay) {
          return res.status(503).json({
            success: false,
            message: "Online payments are unavailable right now."
          });
        }

        const expectedPaise = Math.round(pricing.total * 100);

        const razorpayOrder =
          await razorpay.orders.fetch(razorpayOrderId);

        const amountMatches =
          razorpayOrder.currency === "INR" &&
          razorpayOrder.amount === expectedPaise &&
          razorpayOrder.amount_paid === expectedPaise &&
          razorpayOrder.status === "paid";

        if (!amountMatches) {

          console.error(
            "Payment/order mismatch",
            razorpayOrderId,
            razorpayPaymentId
          );

          return res.status(409).json({
            success: false,
            message:
              "We could not confirm your payment for this order total. " +
              "If money was deducted, please contact support with payment ID " +
              razorpayPaymentId +
              "."
          });
        }

        paymentFields.paymentStatus = "Paid";
        paymentFields.razorpayOrderId = razorpayOrderId;
        paymentFields.razorpayPaymentId = razorpayPaymentId;
      }


      // -----------------------------------------------
      // SAVE ORDER
      // -----------------------------------------------

      const accessKey = generateAccessKey();

      let savedOrder = null;

      for (let attempt = 0; attempt < 3 && !savedOrder; attempt++) {

        try {

          savedOrder = await new Order({
            orderId: generateOrderId(),
            userId: req.user?.userId,
            customer,
            items: pricing.lineItems,
            subtotal: pricing.subtotal,
            delivery: pricing.delivery,
            total: pricing.total,
            paymentMethod: body.paymentMethod,
            status: "Pending",
            accessKey,
            ...paymentFields
          }).save();

        } catch (error) {

          if (error.code !== 11000) {
            throw error;
          }

          // Same payment submitted twice at the same moment
          if (
            error.keyPattern?.razorpayOrderId ||
            error.keyPattern?.razorpayPaymentId
          ) {
            const duplicate = await Order.findOne({
              razorpayOrderId: paymentFields.razorpayOrderId
            }).select("+accessKey");

            if (duplicate) {
              return res.status(200).json({
                success: true,
                message: "Order already placed",
                order: {
                  ...fullOrderView(duplicate),
                  accessKey: duplicate.accessKey
                }
              });
            }
          }

          // Otherwise the random order ID collided: try again
        }
      }

      if (!savedOrder) {
        throw new Error("Could not generate a unique order ID");
      }


      // -----------------------------------------------
      // REDUCE STOCK (never below zero)
      // -----------------------------------------------

      await Promise.all(
        pricing.lineItems.map((line) =>
          Product.updateOne(
            { productId: line.productId },
            [
              {
                $set: {
                  stock: {
                    $max: [
                      0,
                      { $subtract: ["$stock", line.quantity] }
                    ]
                  }
                }
              }
            ]
          ).catch((error) =>
            console.error(
              "Stock update failed for product",
              line.productId,
              error.message
            )
          )
        )
      );


      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: {
          ...fullOrderView(savedOrder),
          accessKey
        }
      });

    } catch (error) {
      sendError(res, error, "Failed to create order");
    }
  }
);


// ======================================================
// GET ALL ORDERS
// ADMIN ONLY
// ======================================================

router.get(
  "/",
  verifyToken,
  adminOnly,
  async (req, res) => {
    try {

      const orders =
        await Order.find().sort({
          orderDate: -1
        });

      res.json({
        success: true,
        count: orders.length,
        orders: orders
      });

    } catch (error) {
      sendError(res, error, "Failed to fetch orders");
    }
  }
);


// ======================================================
// GET ORDERS BY CUSTOMER EMAIL
// LOGIN REQUIRED: customers only see their own orders
// ======================================================

router.get(
  "/customer/:email",
  verifyToken,
  async (req, res) => {
    try {

      const requestedEmail =
        String(req.params.email).trim().toLowerCase();

      const emailMatch = {
        "customer.email": new RegExp(
          "^" + escapeRegex(requestedEmail) + "$",
          "i"
        )
      };

      let filter = emailMatch;

      if (req.user.role !== "admin") {

        const account =
          await User.findById(req.user.userId).select("email");

        if (
          !account ||
          account.email.toLowerCase() !== requestedEmail
        ) {
          return res.status(403).json({
            success: false,
            message: "You can only view your own orders."
          });
        }

        // Include orders placed while logged in,
        // even if a different email was typed at checkout.
        filter = {
          $or: [
            emailMatch,
            { userId: account._id }
          ]
        };
      }

      const orders =
        await Order.find(filter).sort({
          orderDate: -1
        });

      res.json({
        success: true,
        count: orders.length,
        orders: orders.map(fullOrderView)
      });

    } catch (error) {
      sendError(res, error, "Failed to fetch customer orders");
    }
  }
);


// ======================================================
// GET ORDER BY ORDER ID
//
// Full details: admin, the customer who owns the order, or
// anyone holding the order's secret ?key= (given only to the
// person who placed it).
// Everyone else gets a limited tracking view.
// ======================================================

router.get(
  "/:orderId",
  lookupLimiter,
  optionalAuth,
  async (req, res) => {
    try {

      const orderId = String(req.params.orderId).trim();

      const order = await Order.findOne({
        orderId
      }).select("+accessKey");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      const hasKey =
        typeof req.query.key === "string" &&
        Boolean(order.accessKey) &&
        safeEqual(req.query.key, order.accessKey);

      const allowedFullView =
        hasKey ||
        req.user?.role === "admin" ||
        (await ownsOrder(req.user, order));

      res.json({
        success: true,
        order: allowedFullView
          ? fullOrderView(order)
          : publicOrderView(order)
      });

    } catch (error) {
      sendError(res, error, "Failed to fetch order");
    }
  }
);


// ======================================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// ======================================================

router.put(
  "/:orderId/status",
  verifyToken,
  adminOnly,
  async (req, res) => {
    try {

      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
      ];

      if (
        typeof status !== "string" ||
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status"
        });
      }

      const updatedOrder =
        await Order.findOneAndUpdate(
          {
            orderId: String(req.params.orderId)
          },
          {
            status: status
          },
          {
            new: true
          }
        );

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      res.json({
        success: true,
        message:
          "Order status updated successfully",
        order: fullOrderView(updatedOrder)
      });

    } catch (error) {
      sendError(res, error, "Failed to update order status");
    }
  }
);


module.exports = router;
