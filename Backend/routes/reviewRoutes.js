const express = require("express");

const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const {
  verifyToken
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET ALL REVIEWS FOR A PRODUCT
// GET /api/reviews/product/:productId
// =====================================================

router.get(
  "/product/:productId",
  async (req, res) => {
    try {
      const productId =
        Number(req.params.productId);

      const reviews =
        await Review.find({
          productId: productId
        }).sort({
          createdAt: -1
        });

      res.json({
        success: true,
        count: reviews.length,
        reviews: reviews
      });

    } catch (error) {

      console.error(
        "Error fetching reviews:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch reviews"
      });
    }
  }
);


// =====================================================
// CHECK WHETHER CUSTOMER CAN REVIEW PRODUCT
// GET /api/reviews/check/:productId/:orderId
// =====================================================

router.get(
  "/check/:productId/:orderId",
  verifyToken,
  async (req, res) => {

    try {

      const productId =
        Number(req.params.productId);

      const orderId =
        req.params.orderId;


      // ---------------------------------------------
      // Get logged-in customer
      // ---------------------------------------------

      const user =
        await User.findById(
          req.user.userId
        );

      if (!user) {

        return res.status(401).json({
          success: false,
          message:
            "Customer account not found"
        });

      }


      const customerEmail =
        user.email.toLowerCase();


      // ---------------------------------------------
      // Find order
      // ---------------------------------------------

      const order =
        await Order.findOne({
          orderId: orderId
        });

      if (!order) {

        return res.status(404).json({
          success: false,
          message:
            "Order not found"
        });

      }


      // ---------------------------------------------
      // Check order belongs to customer
      // ---------------------------------------------

      if (
        !order.customer?.email ||
        order.customer.email.toLowerCase() !==
        customerEmail
      ) {

        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to review this order"
        });

      }


      // ---------------------------------------------
      // Order must be delivered
      // ---------------------------------------------

      if (
        order.status !== "Delivered"
      ) {

        return res.json({
          success: true,
          canReview: false,
          reviewed: false,
          message:
            "Product can be reviewed after delivery"
        });

      }


      // ---------------------------------------------
      // Check product exists in order
      // ---------------------------------------------

      const orderItem =
        order.items.find(
          (item) =>
            Number(item.productId) ===
            productId
        );

      if (!orderItem) {

        return res.status(400).json({
          success: false,
          message:
            "This product was not part of this order"
        });

      }


      // ---------------------------------------------
      // Check existing review
      // ---------------------------------------------

      const existingReview =
        await Review.findOne({
          productId: productId,

          orderId: orderId,

          customerEmail:
            customerEmail
        });


      if (existingReview) {

        return res.json({
          success: true,
          canReview: false,
          reviewed: true,
          review: existingReview
        });

      }


      // ---------------------------------------------
      // Customer can review
      // ---------------------------------------------

      res.json({
        success: true,
        canReview: true,
        reviewed: false
      });


    } catch (error) {

      console.error(
        "Error checking review:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to check review status",
        error:
          error.message
      });
    }
  }
);


// =====================================================
// SUBMIT REVIEW
// POST /api/reviews
// =====================================================

router.post(
  "/",
  verifyToken,
  async (req, res) => {

    try {

      const {
        productId,
        orderId,
        rating,
        review
      } = req.body;


      // ---------------------------------------------
      // Get logged-in customer
      // ---------------------------------------------

      const user =
        await User.findById(
          req.user.userId
        );

      if (!user) {

        return res.status(401).json({
          success: false,
          message:
            "Customer account not found"
        });

      }


      const customerEmail =
        user.email.toLowerCase();


      const customerName =
        user.name;


      // ---------------------------------------------
      // Basic validation
      // ---------------------------------------------

      if (
        !productId ||
        !orderId ||
        !rating ||
        !review ||
        !review.trim()
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Product, order, rating and review are required"
        });

      }


      // ---------------------------------------------
      // Validate rating
      // ---------------------------------------------

      const numericRating =
        Number(rating);

      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 1 and 5"
        });

      }


      // ---------------------------------------------
      // Find product
      // ---------------------------------------------

      const product =
        await Product.findOne({
          productId:
            Number(productId)
        });

      if (!product) {

        return res.status(404).json({
          success: false,
          message:
            "Product not found"
        });

      }


      // ---------------------------------------------
      // Find order
      // ---------------------------------------------

      const order =
        await Order.findOne({
          orderId: orderId
        });

      if (!order) {

        return res.status(404).json({
          success: false,
          message:
            "Order not found"
        });

      }


      // ---------------------------------------------
      // Check order belongs to customer
      // ---------------------------------------------

      if (
        !order.customer?.email ||
        order.customer.email.toLowerCase() !==
        customerEmail
      ) {

        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to review this order"
        });

      }


      // ---------------------------------------------
      // Order must be delivered
      // ---------------------------------------------

      if (
        order.status !== "Delivered"
      ) {

        return res.status(400).json({
          success: false,
          message:
            "You can review the product only after delivery"
        });

      }


      // ---------------------------------------------
      // Check product exists in order
      // ---------------------------------------------

      const orderItem =
        order.items.find(
          (item) =>
            Number(item.productId) ===
            Number(productId)
        );

      if (!orderItem) {

        return res.status(400).json({
          success: false,
          message:
            "This product was not part of this order"
        });

      }


      // ---------------------------------------------
      // Prevent duplicate review
      // ---------------------------------------------

      const existingReview =
        await Review.findOne({
          productId:
            Number(productId),

          orderId:
            orderId,

          customerEmail:
            customerEmail
        });


      if (existingReview) {

        return res.status(400).json({
          success: false,
          message:
            "You have already reviewed this product for this order"
        });

      }


      // ---------------------------------------------
      // Create review
      // ---------------------------------------------

      const newReview =
        new Review({

          productId:
            Number(productId),

          productName:
            product.name,

          customerName:
            customerName,

          customerEmail:
            customerEmail,

          orderId:
            orderId,

          rating:
            numericRating,

          review:
            review.trim()

        });


      const savedReview =
        await newReview.save();


      // ---------------------------------------------
      // Get all reviews for product
      // ---------------------------------------------

      const allReviews =
        await Review.find({
          productId:
            Number(productId)
        });


      const reviewCount =
        allReviews.length;


      // ---------------------------------------------
      // Calculate average rating
      // ---------------------------------------------

      const totalRating =
        allReviews.reduce(
          (total, item) =>
            total +
            Number(item.rating),
          0
        );


      const averageRating =
        reviewCount > 0
          ? Number(
              (
                totalRating /
                reviewCount
              ).toFixed(1)
            )
          : 0;


      // ---------------------------------------------
      // Update product
      // ---------------------------------------------

      await Product.findOneAndUpdate(
        {
          productId:
            Number(productId)
        },
        {
          rating:
            averageRating,

          reviews:
            reviewCount
        }
      );


      // ---------------------------------------------
      // Success response
      // ---------------------------------------------

      res.status(201).json({

        success: true,

        message:
          "Review submitted successfully",

        review:
          savedReview,

        productRating:
          averageRating,

        reviewCount:
          reviewCount

      });


    } catch (error) {

      console.error(
        "Error submitting review:",
        error.message
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to submit review",

        error:
          error.message

      });
    }
  }
);


module.exports = router;