const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");

const CustomRequest = require("../models/CustomRequest");

const {
  verifyToken,
  optionalAuth,
  adminOnly
} = require("../middleware/authMiddleware");

const { createRateLimiter } = require("../middleware/security");
const { verifyCaptcha } = require("../utils/captcha");

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Indian mobile numbers, with or without +91 / 0, spaces or dashes
const PHONE_PATTERN = /^(?:\+?91|0)?[6-9]\d{9}$/;

const submitLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message:
    "You have sent several requests. Please try again after some time."
});


const text = (value, max) =>
  typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, max)
    : "";

// Keeps line breaks for the long description
const longText = (value, max) =>
  typeof value === "string"
    ? value.trim().replace(/[ \t]+/g, " ").slice(0, max)
    : "";

const newRequestId = () =>
  "CR-" + crypto.randomBytes(4).toString("hex").toUpperCase();

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};


// ======================================================
// SUBMIT A CUSTOM GIFT IDEA (anyone)
// ======================================================

router.post(
  "/",
  submitLimiter,
  optionalAuth,
  async (req, res) => {
    try {

      const body = req.body || {};

      // Hidden field that only robots fill in: pretend it worked
      if (body.website) {
        return res.status(201).json({
          success: true,
          requestId: "CR-00000000"
        });
      }

      const captchaOk = await verifyCaptcha(
        body.captchaToken,
        req.ip
      );

      if (!captchaOk) {
        return res.status(400).json({
          success: false,
          message: "Please complete the captcha and try again."
        });
      }

      const name = text(body.name, 80);
      const phone = text(body.phone, 20).replace(/[\s-]/g, "");
      const email = text(body.email, 120).toLowerCase();
      const description = longText(body.description, 2000);
      const referenceLink = text(body.referenceLink, 300);

      if (name.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Please enter your name."
        });
      }

      if (!PHONE_PATTERN.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit mobile number."
        });
      }

      if (email && !EMAIL_PATTERN.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address."
        });
      }

      if (description.length < 15) {
        return res.status(400).json({
          success: false,
          message:
            "Please describe your idea in a little more detail (at least 15 characters)."
        });
      }

      if (referenceLink && !isHttpUrl(referenceLink)) {
        return res.status(400).json({
          success: false,
          message:
            "The reference link must start with http:// or https://"
        });
      }

      let neededBy;

      if (body.neededBy) {

        neededBy = new Date(body.neededBy);

        if (Number.isNaN(neededBy.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Please choose a valid date."
          });
        }
      }

      const request = await CustomRequest.create({
        requestId: newRequestId(),
        userId: req.user?.userId,
        name,
        phone,
        email,
        occasion: text(body.occasion, 60),
        giftType: text(body.giftType, 60),
        budget: text(body.budget, 40),
        neededBy,
        description,
        referenceLink
      });

      res.status(201).json({
        success: true,
        requestId: request.requestId
      });

    } catch (error) {

      console.error(
        "Custom request error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Could not send your request. Please try again."
      });
    }
  }
);


// ======================================================
// LIST ALL REQUESTS (admin only)
// ======================================================

router.get(
  "/",
  verifyToken,
  adminOnly,
  async (req, res) => {
    try {

      const requests = await CustomRequest.find({})
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();

      res.json({
        success: true,
        requests
      });

    } catch (error) {

      console.error(
        "List custom requests error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Could not load requests"
      });
    }
  }
);


// ======================================================
// UPDATE STATUS / QUOTE / NOTE (admin only)
// ======================================================

router.patch(
  "/:id",
  verifyToken,
  adminOnly,
  async (req, res) => {
    try {

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request id"
        });
      }

      const update = {};

      if (req.body?.status !== undefined) {

        if (!CustomRequest.STATUSES.includes(req.body.status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid status"
          });
        }

        update.status = req.body.status;
      }

      if (req.body?.adminNote !== undefined) {
        update.adminNote = longText(req.body.adminNote, 1000);
      }

      if (req.body?.quotedPrice !== undefined) {

        if (req.body.quotedPrice === "" || req.body.quotedPrice === null) {

          update.quotedPrice = undefined;

        } else {

          const price = Number(req.body.quotedPrice);

          if (!Number.isFinite(price) || price < 0 || price > 10000000) {
            return res.status(400).json({
              success: false,
              message: "Invalid price"
            });
          }

          update.quotedPrice = price;
        }
      }

      const set = {};
      const unset = {};

      Object.entries(update).forEach(([key, value]) => {
        if (value === undefined) {
          unset[key] = "";
        } else {
          set[key] = value;
        }
      });

      const request = await CustomRequest.findByIdAndUpdate(
        req.params.id,
        {
          ...(Object.keys(set).length ? { $set: set } : {}),
          ...(Object.keys(unset).length ? { $unset: unset } : {})
        },
        { new: true }
      ).lean();

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found"
        });
      }

      res.json({
        success: true,
        request
      });

    } catch (error) {

      console.error(
        "Update custom request error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Could not update request"
      });
    }
  }
);


module.exports = router;
