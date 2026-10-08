const mongoose = require("mongoose");

// Throws if the connection fails, so server.js can stop
// instead of running without a database.
const connectMongoDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB Connected Successfully");
};

module.exports = connectMongoDB;
