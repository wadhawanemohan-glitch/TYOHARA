const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    occasion: {
  type: String,
  default: ""
},

    type: {
      type: String
    },

    description: {
      type: String
    },

    image: {
      type: String,
      default: ""
    },

    rating: {
      type: Number
    },

    reviews: {
      type: Number,
      default: 0
    },

    stock: {
      type: Number,
      default: 0
    }
  },
  {
    collection: "products"
  }
);

module.exports = mongoose.model("Product", productSchema);