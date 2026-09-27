const mongoose = require("mongoose");
const Product = require("../models/Product");

const productImages = {
  1: "/images/celebration-hamper.jpg",
  2: "/images/chocolate-box.jpg",
  3: "/images/personalized-gift.jpg",
  4: "/images/teddy-gift.jpg",
  5: "/images/rakhi-box.jpg",
  6: "/images/dry-fruit-hamper.jpg",
  7: "/images/christmas-box.jpg",
  8: "/images/eid-hamper.jpg"
};

const updateProductImages = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/GiftWalaDB");

    console.log("MongoDB Connected Successfully");

    for (const [productId, image] of Object.entries(productImages)) {
      const result = await Product.updateOne(
        { productId: Number(productId) },
        { $set: { image } }
      );

      console.log(
        `Product ${productId}: ${result.modifiedCount} updated`
      );
    }

    console.log("All product images updated successfully ✅");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Update failed ❌");
    console.error(error.message);
    process.exit(1);
  }
};

updateProductImages();