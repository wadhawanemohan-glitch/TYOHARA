const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
  JWT_SECRET,
  JWT_EXPIRES_IN
} = require("../config/env");

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// bcrypt only uses the first 72 bytes of a password
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;


const cleanEmail = (value) =>
  typeof value === "string"
    ? value.trim().toLowerCase()
    : "";


// =========================
// REGISTER
// =========================

router.post("/register", async (req, res) => {
  try {

    const name =
      typeof req.body?.name === "string"
        ? req.body.name.trim().replace(/\s+/g, " ")
        : "";

    const email = cleanEmail(req.body?.email);

    const password = req.body?.password;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required"
      });
    }

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must be 2 to 80 characters"
      });
    }

    if (!EMAIL_PATTERN.test(email) || email.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    if (
      typeof password !== "string" ||
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Password must be ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters`
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Role is never taken from the request: new accounts
    // are always customers.
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully"
    });

  } catch (error) {

    console.error(
      "Register error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
});


// =========================
// LOGIN
// =========================

router.post("/login", async (req, res) => {
  try {

    const email = cleanEmail(req.body?.email);

    const password = req.body?.password;

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required"
      });
    }

    const user =
      await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token =
      jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN
        }
      );

    res.json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});


module.exports = router;
