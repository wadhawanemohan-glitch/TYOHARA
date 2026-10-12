const mongoose = require("mongoose");

// A customer's idea for a customised gift. No payment is taken here:
// TYOHARA contacts the customer, agrees the design and price, and only
// then the order is arranged.

const STATUSES = [
  "new",
  "contacted",
  "quoted",
  "accepted",
  "in-progress",
  "ready",
  "completed",
  "declined"
];

const customRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      default: ""
    },

    occasion: {
      type: String,
      trim: true,
      maxlength: 60,
      default: ""
    },

    giftType: {
      type: String,
      trim: true,
      maxlength: 60,
      default: ""
    },

    budget: {
      type: String,
      trim: true,
      maxlength: 40,
      default: ""
    },

    neededBy: {
      type: Date
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    // Link to photos or inspiration (Google Drive, Instagram, Pinterest...)
    referenceLink: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ""
    },

    status: {
      type: String,
      enum: STATUSES,
      default: "new"
    },

    // Filled in by the admin
    quotedPrice: {
      type: Number,
      min: 0
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    }
  },
  {
    timestamps: true,
    collection: "customrequests"
  }
);

customRequestSchema.index({ createdAt: -1 });

const CustomRequest = mongoose.model(
  "CustomRequest",
  customRequestSchema
);

CustomRequest.STATUSES = STATUSES;

module.exports = CustomRequest;
