const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer"
    },

    // Accounts created before email verification existed (and the
    // admin) count as verified. New signups are saved as false
    // when email verification is switched on.
    emailVerified: {
      type: Boolean,
      default: true
    },

    // Email verification code (only a hash is stored)
    verifyCodeHash: { type: String, select: false },

    verifyCodeExpires: { type: Date, select: false },

    verifyAttempts: { type: Number, default: 0, select: false },

    verifySentAt: { type: Date, select: false }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);