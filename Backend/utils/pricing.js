const Product = require("../models/Product");

const config = require("../config/env");

const MAX_LINES = 50;
const MAX_QUANTITY_PER_LINE = 20;

class CartError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "CartError";
    this.status = status;
  }
}

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// -----------------------------------------------------
// Builds a trusted price breakdown from the product
// database. Only productId and quantity are taken from
// the customer; names, prices and totals never are.
// -----------------------------------------------------

const priceCart = async (rawItems) => {

  if (
    !Array.isArray(rawItems) ||
    rawItems.length === 0 ||
    rawItems.length > MAX_LINES
  ) {
    throw new CartError("Your cart is empty or invalid.");
  }

  // Merge duplicate products into one line
  const quantities = new Map();

  for (const item of rawItems) {

    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);

    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_LINE
    ) {
      throw new CartError("Invalid product or quantity in cart.");
    }

    quantities.set(
      productId,
      (quantities.get(productId) || 0) + quantity
    );
  }

  const products = await Product.find({
    productId: { $in: [...quantities.keys()] }
  });

  const productMap = new Map(
    products.map((product) => [product.productId, product])
  );

  const lineItems = [];

  for (const [productId, quantity] of quantities) {

    const product = productMap.get(productId);

    if (!product) {
      throw new CartError(
        "A product in your cart is no longer available. Please refresh your cart.",
        409
      );
    }

    if (quantity > MAX_QUANTITY_PER_LINE) {
      throw new CartError("Invalid product or quantity in cart.");
    }

    if (config.ENFORCE_STOCK && product.stock < quantity) {
      throw new CartError(
        product.stock > 0
          ? `Only ${product.stock} of "${product.name}" left in stock.`
          : `"${product.name}" is out of stock.`,
        409
      );
    }

    if (!Number.isFinite(product.price) || product.price < 0) {
      throw new CartError(
        "A product in your cart has an invalid price.",
        409
      );
    }

    lineItems.push({
      productId: product.productId,
      name: product.name,
      price: product.price,
      quantity
    });
  }

  const subtotal = roundMoney(
    lineItems.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0
    )
  );

  const delivery =
    subtotal >= config.FREE_DELIVERY_THRESHOLD
      ? 0
      : config.DELIVERY_CHARGE;

  const total = roundMoney(subtotal + delivery);

  return {
    lineItems,
    subtotal,
    delivery,
    total
  };
};

module.exports = {
  priceCart,
  CartError,
  roundMoney
};
