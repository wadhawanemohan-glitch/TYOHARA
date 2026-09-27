const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const MONGO_URI =
  "mongodb://127.0.0.1:27017/GiftWalaDB";

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected.");

    const adminEmail = "mohanwadhawane@gmail.com";
    const adminPassword = "Seema@123";

    const existingAdmin = await User.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      console.log(
        "Admin account already exists."
      );

      console.log(
        "Role:",
        existingAdmin.role
      );

      process.exit(0);
    }

    const hashedPassword =
      await bcrypt.hash(
        adminPassword,
        10
      );

    const admin = new User({
      name: "GiftWala Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();

    console.log(
      "================================"
    );

    console.log(
      "Admin account created successfully!"
    );

    console.log(
      "Email:",
      adminEmail
    );

    console.log(
      "Password:",
      adminPassword
    );

    console.log(
      "Role:",
      admin.role
    );

    console.log(
      "================================"
    );

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