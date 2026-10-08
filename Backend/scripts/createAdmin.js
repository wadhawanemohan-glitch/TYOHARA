// =====================================================
// CREATE (OR PROMOTE) AN ADMIN ACCOUNT
//
// Usage (from the Backend folder):
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' node scripts/createAdmin.js
//
// On Windows PowerShell:
//   $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a-long-password"; node scripts/createAdmin.js
//
// MONGO_URI is read from Backend/.env. Never write real
// passwords into this file or commit them to git.
// =====================================================

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/GiftWalaDB";

const adminEmail = (process.env.ADMIN_EMAIL || "")
  .trim()
  .toLowerCase();

const adminPassword = process.env.ADMIN_PASSWORD || "";

const adminName = process.env.ADMIN_NAME || "TYOHARA Admin";


const createAdmin = async () => {

  if (!adminEmail || !adminPassword) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables first."
    );
    process.exit(1);
  }

  if (adminPassword.length < 12 || adminPassword.length > 72) {
    console.error(
      "ADMIN_PASSWORD must be 12 to 72 characters."
    );
    process.exit(1);
  }

  try {

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected.");

    const existingAdmin = await User.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      console.log(
        "An account with this email already exists."
      );

      console.log("Role:", existingAdmin.role);

      process.exit(0);
    }

    const hashedPassword =
      await bcrypt.hash(adminPassword, 10);

    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();

    console.log("Admin account created successfully.");
    console.log("Email:", adminEmail);
    console.log("Role:", admin.role);

    process.exit(0);

  } catch (error) {

    console.error(
      "Error creating admin:",
      error.message
    );

    process.exit(1);
  }
};

createAdmin();
