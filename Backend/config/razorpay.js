const crypto = require("crypto");
const Razorpay = require("razorpay");

const config = require("./env");

let instance = null;

// Returns a Razorpay client, or null when keys are missing.
const getRazorpay = () => {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    return null;
  }

  if (!instance) {
    instance = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET
    });
  }

  return instance;
};

// Checks the signature Razorpay returns after a payment.
const isValidSignature = (orderId, paymentId, signature) => {
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    !config.RAZORPAY_KEY_SECRET
  ) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

module.exports = {
  getRazorpay,
  isValidSignature
};
