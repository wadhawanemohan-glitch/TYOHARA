const express = require("express");

const User = require("../models/User");
const Order = require("../models/Order");

const {
  verifyToken,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// GET ALL CUSTOMERS
// ADMIN ONLY
// ======================================================

router.get(
  "/",
  verifyToken,
  adminOnly,
  async (req, res) => {
    try {

      // Get only customer accounts
      // Password is explicitly excluded
      const users = await User.find(
        {
          role: "customer"
        },
        {
          password: 0
        }
      ).sort({
        createdAt: -1
      });


      // Get all orders
      const orders =
        await Order.find(
          {},
          {
            "customer.email": 1,
            total: 1
          }
        );


      // Create customer information
      const customers = users.map(
        (user) => {

          const customerOrders =
            orders.filter(
              (order) =>
                order.customer?.email
                  ?.toLowerCase() ===
                user.email.toLowerCase()
            );


          const totalSpent =
            customerOrders.reduce(
              (total, order) =>
                total +
                Number(order.total || 0),
              0
            );


          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,

            orderCount:
              customerOrders.length,

            totalSpent:
              totalSpent
          };
        }
      );


      // Summary
      const totalCustomers =
        customers.length;

      const totalOrders =
        customers.reduce(
          (total, customer) =>
            total + customer.orderCount,
          0
        );

      const totalSpent =
        customers.reduce(
          (total, customer) =>
            total + customer.totalSpent,
          0
        );


      res.json({
        success: true,

        summary: {
          totalCustomers,
          totalOrders,
          totalSpent
        },

        customers
      });

    } catch (error) {

      console.error(
        "Error fetching customers:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch customers",
      });
    }
  }
);


module.exports = router;