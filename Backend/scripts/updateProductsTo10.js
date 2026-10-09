require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const products = [
  {
    productId: 1,
    name: "Artisan Coffee Gift Box",
    price: 799,
    category: "Birthday",
    type: "Coffee Gift",
    description: "A premium artisan coffee gift box, perfect for coffee lovers and special occasions.",
    image: "/images/artisan-coffee-gift-box.jpeg",
    rating: 4.8,
    reviews: 0,
    stock: 30
  },
  {
    productId: 2,
    name: "Baby Gift Basket",
    price: 699,
    category: "Baby",
    type: "Baby Gift",
    description: "A lovely baby gift basket thoughtfully arranged for welcoming a little one.",
    image: "/images/baby-gift-basket.jpeg",
    rating: 4.8,
    reviews: 0,
    stock: 30
  },
  {
    productId: 3,
    name: "Custom Engraved Gardening Gift Set",
    price: 899,
    category: "Personalized",
    type: "Gardening Gift",
    description: "A personalized engraved gardening gift set made for gardening enthusiasts.",
    image: "/images/engraved-gardening-gift-set.jpeg",
    rating: 4.9,
    reviews: 0,
    stock: 25
  },
  {
    productId: 4,
    name: "Handcrafted Artist Gift Set",
    price: 999,
    category: "Creative",
    type: "Artist Gift",
    description: "A handcrafted gift set designed for artists, creators, and people who love handmade gifts.",
    image: "/images/handcrafted-artist-gift-set.jpeg",
    rating: 4.8,
    reviews: 0,
    stock: 25
  },
  {
    productId: 5,
    name: "Luxury Leather Travel Gift Set",
    price: 1499,
    category: "Travel",
    type: "Leather Gift",
    description: "A premium leather travel gift set for stylish and practical gifting.",
    image: "/images/luxury-leather-travel-gift-set.jpeg",
    rating: 4.9,
    reviews: 0,
    stock: 20
  },
  {
    productId: 6,
    name: "Movie Gift Hamper",
    price: 799,
    category: "Entertainment",
    type: "Movie Gift",
    description: "A fun movie-themed gift hamper with snacks and treats for a perfect movie night.",
    image: "/images/movie-gift-hamper.jpeg",
    rating: 4.7,
    reviews: 0,
    stock: 35
  },
  {
    productId: 7,
    name: "Personalized Cocktail Kit",
    price: 1299,
    category: "Personalized",
    type: "Cocktail Gift",
    description: "A stylish personalized cocktail kit designed for memorable celebrations and gifting.",
    image: "/images/personalized-cocktail-kit.jpeg",
    rating: 4.8,
    reviews: 0,
    stock: 20
  },
  {
    productId: 8,
    name: "Customized Pet Lover Gift Hamper",
    price: 999,
    category: "Personalized",
    type: "Pet Gift",
    description: "A customized gift hamper created especially for pet lovers.",
    image: "/images/pet-lover-gift-hamper.jpeg",
    rating: 4.9,
    reviews: 0,
    stock: 25
  },
  {
    productId: 9,
    name: "Tea Connoisseur Gift Set",
    price: 899,
    category: "Tea",
    type: "Tea Gift",
    description: "A carefully presented tea gift set for tea lovers and relaxing moments.",
    image: "/images/tea-connoisseur-gift-set.jpeg",
    rating: 4.8,
    reviews: 0,
    stock: 30
  },
  {
    productId: 10,
    name: "Tech Enthusiast Gift Box",
    price: 1499,
    category: "Technology",
    type: "Tech Gift",
    description: "A modern technology-themed gift box for gadget lovers and tech enthusiasts.",
    image: "/images/tech-enthusiast-gift-box.jpeg",
    rating: 4.8,
    reviews: 0,
    stock: 20
  }
];

const updateProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/TYOHARADB");

    console.log("MongoDB Connected Successfully");

    for (const product of products) {
      const result = await Product.updateOne(
        { productId: product.productId },
        { $set: product },
        { upsert: true }
      );

      console.log(
        `Product ${product.productId}: matched=${result.matchedCount}, modified=${result.modifiedCount}, upserted=${result.upsertedCount}`
      );
    }

    console.log("10 products updated successfully ✅");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Product update failed ❌");
    console.error(error.message);
    process.exit(1);
  }
};

updateProducts();