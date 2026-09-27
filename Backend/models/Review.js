const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true
    },

    productName: {
      type: String,
      required: true
    },

    customerName: {
      type: String,
      required: true
    },

    customerEmail: {
      type: String,
      required: true
    },

    orderId: {
      type: String,
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    review: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: "reviews"
  }
);

module.exports = mongoose.model(
  "Review",
  reviewSchema
);