// =====================================================
// CLEAR TEST DATA: ALL ORDERS, REVIEWS AND CUSTOMERS
//
// Deletes every order, every review and every customer account.
// KEEPS: admin accounts and all products (their ratings go back
// to zero). This cannot be undone.
//
// Step 1 - look first (nothing is deleted):
//   node scripts/resetStore.js
//
// Step 2 - delete, by typing the database name it showed you:
//   CONFIRM_RESET=<database name> node scripts/resetStore.js
//   PowerShell: $env:CONFIRM_RESET="<database name>"; node scripts/resetStore.js
//
// MONGO_URI is read from Backend/.env, so check the database name
// in the output is the LIVE one before you confirm.
// =====================================================

require("dotenv").config();

const mongoose = require("mongoose");

const Order = require("../models/Order");
const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/TYOHARADB";


const run = async () => {

  try {

    await mongoose.connect(MONGO_URI);

    const dbName = mongoose.connection.name;

    const [orders, reviews, customers, admins, products] =
      await Promise.all([
        Order.countDocuments({}),
        Review.countDocuments({}),
        User.countDocuments({ role: "customer" }),
        User.countDocuments({ role: "admin" }),
        Product.countDocuments({})
      ]);

    console.log("Database:", dbName);
    console.log("");
    console.log("Will DELETE:");
    console.log("  Orders:   ", orders);
    console.log("  Reviews:  ", reviews);
    console.log("  Customers:", customers);
    console.log("Will KEEP:");
    console.log("  Admin accounts:", admins);
    console.log("  Products:      ", products, "(ratings reset to 0)");
    console.log("");

    if (process.env.CONFIRM_RESET !== dbName) {

      console.log(
        "Nothing was deleted. To go ahead, run again with CONFIRM_RESET=" +
        dbName
      );

      await mongoose.disconnect();
      process.exit(0);
    }

    const deletedOrders = await Order.deleteMany({});
    const deletedReviews = await Review.deleteMany({});
    const deletedCustomers = await User.deleteMany({ role: "customer" });

    await Product.updateMany({}, { $set: { rating: 0, reviews: 0 } });

    console.log("Done.");
    console.log("  Orders deleted:   ", deletedOrders.deletedCount);
    console.log("  Reviews deleted:  ", deletedReviews.deletedCount);
    console.log("  Customers deleted:", deletedCustomers.deletedCount);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {

    console.error("Reset failed:", error.message);

    process.exit(1);
  }
};

run();
