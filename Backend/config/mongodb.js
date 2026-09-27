const mongoose = require("mongoose");

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed");
    console.error(error.message);
    throw error;
  }
};

module.exports = connectMongoDB;