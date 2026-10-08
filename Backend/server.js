// Must be first: loads .env and validates required settings
const config = require("./config/env");

const express = require("express");
const cors = require("cors");

const connectMongoDB = require("./config/mongodb");

const {
  securityHeaders,
  createRateLimiter
} = require("./middleware/security");

const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");

// Needed so rate limiting sees the real visitor IP
// when the server runs behind a hosting proxy.
app.set("trust proxy", config.TRUST_PROXY);

app.use(securityHeaders);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools without an Origin header (health checks, curl)
      if (!origin || config.FRONTEND_URLS.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    }
  })
);

app.use(express.json({ limit: "50kb" }));


// =========================
// RATE LIMITS
// =========================

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many login attempts. Please try again in a few minutes."
});

const paymentLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: "Too many payment attempts. Please try again later."
});

app.use("/api", generalLimiter);


// =========================
// ROUTES
// =========================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "TYOHARA Backend is Running"
  });
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentLimiter, paymentRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reviews", reviewRoutes);


// =========================
// NOT FOUND AND ERRORS
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Invalid JSON, oversized body, etc.
app.use((error, req, res, next) => {

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request is too large"
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid request body"
    });
  }

  console.error("Unhandled error:", error.message);

  res.status(500).json({
    success: false,
    message: "Something went wrong"
  });
});


const startServer = async () => {
  try {
    await connectMongoDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `TYOHARA Backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Server could not start:", error.message);
    process.exit(1);
  }
};

startServer();
