const crypto = require("crypto");

// Payment methods the shop accepts, mapped to how they are paid.
const PAYMENT_METHODS = {
  "Cash on Delivery": "cod",
  "UPI": "online",
  "Credit / Debit Card": "online"
};


class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
  }
}


const text = (value, min, max, label) => {

  if (typeof value !== "string") {
    throw new ValidationError(`${label} is required.`);
  }

  const cleaned = value.trim().replace(/\s+/g, " ");

  if (cleaned.length < min || cleaned.length > max) {
    throw new ValidationError(
      `${label} must be between ${min} and ${max} characters.`
    );
  }

  return cleaned;
};


// Returns a clean customer object or throws ValidationError.
const validateCustomer = (raw) => {

  if (!raw || typeof raw !== "object") {
    throw new ValidationError("Customer details are required.");
  }

  const phone = String(
    typeof raw.phone === "string" ? raw.phone : ""
  ).replace(/[\s\-()+]/g, "");

  if (!/^\d{10,13}$/.test(phone)) {
    throw new ValidationError("Please enter a valid phone number.");
  }

  const pincode = typeof raw.pincode === "string"
    ? raw.pincode.trim()
    : "";

  if (!/^\d{6}$/.test(pincode)) {
    throw new ValidationError("Please enter a valid 6-digit pincode.");
  }

  const email = text(raw.email, 5, 120, "Email").toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("Please enter a valid email address.");
  }

  return {
    name: text(raw.name, 2, 80, "Name"),
    phone,
    email,
    address: text(raw.address, 5, 250, "Address"),
    city: text(raw.city, 2, 80, "City"),
    state: text(raw.state, 2, 80, "State"),
    pincode
  };
};


// Hard to guess: 12 random hex characters.
const generateOrderId = () =>
  "TY" + crypto.randomBytes(6).toString("hex").toUpperCase();


const generateAccessKey = () =>
  crypto.randomBytes(16).toString("hex");


const safeEqual = (a, b) => {

  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");

  return (
    bufferA.length === bufferB.length &&
    crypto.timingSafeEqual(bufferA, bufferB)
  );
};


const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


// "Mohan Raman Wadhawane" -> "Mohan R."
const maskName = (name) => {

  const parts = String(name || "").trim().split(/\s+/);

  if (!parts[0]) {
    return "Customer";
  }

  return parts[1]
    ? `${parts[0]} ${parts[1][0].toUpperCase()}.`
    : parts[0];
};


// Everything about an order EXCEPT secrets.
const fullOrderView = (order) => {

  const plain = order.toObject
    ? order.toObject()
    : { ...order };

  delete plain.accessKey;
  delete plain.__v;

  return plain;
};


// What anyone with just an order ID may see (order tracking).
// No phone, email, street address or payment references.
const publicOrderView = (order) => ({

  orderId: order.orderId,

  status: order.status,

  paymentMethod: order.paymentMethod,

  paymentStatus: order.paymentStatus,

  items: order.items,

  subtotal: order.subtotal,

  delivery: order.delivery,

  total: order.total,

  orderDate: order.orderDate,

  customer: {
    name: maskName(order.customer?.name),
    city: order.customer?.city,
    state: order.customer?.state
  }
});


module.exports = {
  PAYMENT_METHODS,
  ValidationError,
  validateCustomer,
  generateOrderId,
  generateAccessKey,
  safeEqual,
  escapeRegex,
  maskName,
  fullOrderView,
  publicOrderView
};
