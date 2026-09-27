const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    quantity: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },

    customer: {
      name: {
        type: String,
        required: true
      },

      phone: {
        type: String,
        required: true
      },

      email: {
        type: String,
        required: true
      },

      address: {
        type: String,
        required: true
      },

      city: {
        type: String,
        required: true
      },

      state: {
        type: String,
        required: true
      },

      pincode: {
        type: String,
        required: true
      }
    },

    items: {
      type: [orderItemSchema],
      required: true
    },

    subtotal: {
      type: Number,
      required: true
    },

    delivery: {
      type: Number,
      required: true
    },

    total: {
      type: Number,
      required: true
    },

    paymentMethod: {
      type: String,
      required: true
    },
    status: {
  type: String,
  enum: [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
  ],
  default: "Pending"
},

    orderDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: "orders"
  }
);

module.exports = mongoose.model("Order", orderSchema);