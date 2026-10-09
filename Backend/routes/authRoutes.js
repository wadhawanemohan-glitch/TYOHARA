const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  EMAIL_VERIFICATION_ENABLED
} = require("../config/env");

const { verifyCaptcha } = require("../utils/captcha");

const {
  MAX_ATTEMPTS,
  codeMatches,
  issueCode
} = require("../utils/emailVerification");

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// bcrypt only uses the first 72 bytes of a password
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

const CAPTCHA_MESSAGE =
  "Please complete the captcha and try again.";


const cleanEmail = (value) =>
  typeof value === "string"
    ? value.trim().toLowerCase()
    : "";


const signToken = (user) =>
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


const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});


// =========================
// REGISTER
// =========================

router.post("/register", async (req, res) => {
  try {

    const captchaOk = await verifyCaptcha(
      req.body?.captchaToken,
      req.ip
    );

    if (!captchaOk) {
      return res.status(400).json({
        success: false,
        message: CAPTCHA_MESSAGE
      });
    }

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
      await User.findOne({ email }).select("+verifySentAt");

    // An email that was never confirmed can be signed up again
    // (new details, new code). A confirmed one cannot.
    const retryingUnverified =
      Boolean(existingUser) &&
      EMAIL_VERIFICATION_ENABLED &&
      existingUser.emailVerified === false;

    if (existingUser && !retryingUnverified) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    let user;

    if (retryingUnverified) {

      user = existingUser;
      user.name = name;
      user.password = hashedPassword;

    } else {

      // Role is never taken from the request: new accounts
      // are always customers.
      user = new User({
        name,
        email,
        password: hashedPassword,
        emailVerified: !EMAIL_VERIFICATION_ENABLED
      });
    }

    await user.save();

    if (!EMAIL_VERIFICATION_ENABLED) {
      return res.status(201).json({
        success: true,
        message: "Account created successfully"
      });
    }

    // Email verification is on: send the 6-digit code
    let result;

    try {

      result = await issueCode(user);

    } catch (error) {

      console.error("Verification email failed:", error.message);

      return res.status(502).json({
        success: false,
        message:
          "We could not send the verification email. Please try again in a moment."
      });
    }

    res.status(201).json({
      success: true,
      verificationRequired: true,
      email: user.email,
      message: result.sent
        ? "We sent a 6-digit code to your email."
        : "A code was sent a moment ago. Please check your inbox and spam folder."
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
// VERIFY EMAIL
// =========================

router.post("/verify-email", async (req, res) => {
  try {

    const email = cleanEmail(req.body?.email);

    const code =
      typeof req.body?.code === "string"
        ? req.body.code.trim()
        : "";

    if (!EMAIL_PATTERN.test(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Please enter the 6-digit code."
      });
    }

    const user = await User.findOne({ email }).select(
      "+verifyCodeHash +verifyCodeExpires +verifyAttempts"
    );

    if (!user || !user.verifyCodeHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code."
      });
    }

    if (user.emailVerified !== false) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: "Email is already verified. Please log in."
      });
    }

    if (
      !user.verifyCodeExpires ||
      user.verifyCodeExpires.getTime() < Date.now() ||
      user.verifyAttempts >= MAX_ATTEMPTS
    ) {
      return res.status(400).json({
        success: false,
        message: "This code has expired. Please request a new one."
      });
    }

    if (!codeMatches(email, code, user.verifyCodeHash)) {

      user.verifyAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect code. Please check and try again."
      });
    }

    user.emailVerified = true;
    user.verifyCodeHash = undefined;
    user.verifyCodeExpires = undefined;
    user.verifyAttempts = 0;
    user.verifySentAt = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
      token: signToken(user),
      user: publicUser(user)
    });

  } catch (error) {

    console.error(
      "Verify email error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Verification failed"
    });
  }
});


// =========================
// SEND A NEW CODE
// =========================

router.post("/resend-code", async (req, res) => {
  try {

    const email = cleanEmail(req.body?.email);

    if (EMAIL_PATTERN.test(email) && EMAIL_VERIFICATION_ENABLED) {

      const user =
        await User.findOne({ email }).select("+verifySentAt");

      if (user && user.emailVerified === false) {

        try {
          await issueCode(user);
        } catch (error) {
          console.error("Resend email failed:", error.message);
        }
      }
    }

    // Same answer whether or not the email exists
    res.json({
      success: true,
      message:
        "If this email is waiting for verification, a new code has been sent."
    });

  } catch (error) {

    console.error(
      "Resend code error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Could not send a new code"
    });
  }
});


// =========================
// LOGIN
// =========================

router.post("/login", async (req, res) => {
  try {

    const captchaOk = await verifyCaptcha(
      req.body?.captchaToken,
      req.ip
    );

    if (!captchaOk) {
      return res.status(400).json({
        success: false,
        message: CAPTCHA_MESSAGE
      });
    }

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
      await User.findOne({ email }).select("+verifySentAt");

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

    // Password is right, but the email was never confirmed
    if (EMAIL_VERIFICATION_ENABLED && user.emailVerified === false) {

      try {
        await issueCode(user);
      } catch (error) {
        console.error("Login code email failed:", error.message);
      }

      return res.status(403).json({
        success: false,
        needsVerification: true,
        email: user.email,
        message: "Please verify your email to continue."
      });
    }

    res.json({
      success: true,
      message: "Login successful",

      token: signToken(user),

      user: publicUser(user)
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
