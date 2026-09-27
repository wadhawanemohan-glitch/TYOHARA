const express = require("express");

const Order = require("../models/Order");

const {
  verifyToken,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// CREATE NEW ORDER
// ======================================================

router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder
    });

  } catch (error) {

    console.error(
      "Error creating order:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
});


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

      console.error(
        "Error fetching orders:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message
      });
    }
  }
);


// ======================================================
// GET ORDERS BY CUSTOMER EMAIL
// ======================================================

router.get(
  "/customer/:email",
  async (req, res) => {
    try {

      const email =
        req.params.email;

      const orders =
        await Order.find({
          "customer.email": email
        }).sort({
          orderDate: -1
        });

      res.json({
        success: true,
        count: orders.length,
        orders: orders
      });

    } catch (error) {

      console.error(
        "Error fetching customer orders:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch customer orders",
        error: error.message
      });
    }
  }
);


// ======================================================
// GET ORDER BY ORDER ID
// CUSTOMER ORDER TRACKING
// ======================================================

router.get(
  "/:orderId",
  async (req, res) => {
    try {

      const order =
        await Order.findOne({
          orderId: req.params.orderId
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      res.json({
        success: true,
        order: order
      });

    } catch (error) {

      console.error(
        "Error fetching order:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
        error: error.message
      });
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
            orderId: req.params.orderId
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
        order: updatedOrder
      });

    } catch (error) {

      console.error(
        "Error updating order status:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update order status",
        error: error.message
      });
    }
  }
);


module.exports = router;