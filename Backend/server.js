const authRoutes =
  require("./routes/authRoutes");

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const paymentRoutes = require("./routes/paymentRoutes");

const connectMongoDB = require("./config/mongodb");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "GiftWala Backend is Running"
  });
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reviews", reviewRoutes);

const startServer = async () => {
  try {
    await connectMongoDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `GiftWala Backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Server could not start.");
    console.error(error);
  }
};

startServer();