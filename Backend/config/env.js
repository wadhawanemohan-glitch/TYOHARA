// =====================================================
// ENVIRONMENT CONFIGURATION
// Loads .env first, then validates everything the server
// needs. Require this file BEFORE any file that reads
// process.env (routes, middleware, etc.).
// =====================================================

require("dotenv").config();

const INSECURE_DEFAULTS = [
  "giftwala_secret_key",
  "secret",
  "changeme",
  "change-me"
];

const missing = ["MONGO_URI", "JWT_SECRET"].filter(
  (name) => !process.env[name]
);

if (missing.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missing.join(", ")}`
  );
  console.error(
    "Set them in Backend/.env (local) or in your hosting dashboard (production). See Backend/.env.example."
  );
  process.exit(1);
}

if (INSECURE_DEFAULTS.includes(process.env.JWT_SECRET)) {
  console.error(
    "JWT_SECRET is set to an insecure default value. Generate a long random secret and set it as JWT_SECRET."
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn(
    "WARNING: JWT_SECRET is shorter than 32 characters. Use a longer random value."
  );
}

if (
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {
  console.warn(
    "WARNING: Razorpay keys are not set. Online payments are disabled; only Cash on Delivery will work."
  );
}


const toNumber = (value, fallback) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : fallback;
};


module.exports = {

  JWT_SECRET: process.env.JWT_SECRET,

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  // Comma-separated list of allowed website origins
  FRONTEND_URLS: (
    process.env.FRONTEND_URL || "http://localhost:5173"
  )
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean),

  // Number of reverse proxies in front of the server
  // (Render, Railway, etc. = 1). Needed for correct rate limiting.
  TRUST_PROXY: toNumber(process.env.TRUST_PROXY, 1),

  // Delivery rules (server is the single source of truth)
  FREE_DELIVERY_THRESHOLD: toNumber(
    process.env.FREE_DELIVERY_THRESHOLD,
    1000
  ),

  DELIVERY_CHARGE: toNumber(
    process.env.DELIVERY_CHARGE,
    60
  ),

  // Set ENFORCE_STOCK=false to stop checking product stock
  ENFORCE_STOCK: process.env.ENFORCE_STOCK !== "false",

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",

  RAZORPAY_KEY_SECRET:
    process.env.RAZORPAY_KEY_SECRET || ""
};
