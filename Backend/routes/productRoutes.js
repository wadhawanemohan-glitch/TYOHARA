const express = require("express");

const Product = require("../models/Product");

const {
  verifyToken,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// =========================================
// GET ALL PRODUCTS
// =========================================

router.get("/", async (req, res) => {
  try {

    const products =
      await Product.find().sort({
        productId: 1
      });

    res.json({
      success: true,
      count: products.length,
      products: products
    });

  } catch (error) {

    console.error(
      "Error fetching products:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });

  }
});


// =========================================
// GET SINGLE PRODUCT
// =========================================

router.get(
  "/:productId",
  async (req, res) => {

    try {

      const product =
        await Product.findOne({
          productId:
            Number(req.params.productId)
        });


      if (!product) {

        return res.status(404).json({
          success: false,
          message: "Product not found"
        });

      }


      res.json({
        success: true,
        product: product
      });

    } catch (error) {

      console.error(
        "Error fetching product:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
        error: error.message
      });

    }

  }
);


// =========================================
// ADD PRODUCT
// =========================================

router.post(
  "/",
  verifyToken,
  adminOnly,
  async (req, res) => {

    try {

      const {
        productId,
        name,
        price,
        category,
        type,
        description,
        stock
      } = req.body;


      if (
        !productId ||
        !name ||
        price === undefined ||
        !category
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Product ID, name, price and category are required"
        });

      }


      const existingProduct =
        await Product.findOne({
          productId: Number(productId)
        });


      if (existingProduct) {

        return res.status(400).json({
          success: false,
          message:
            "Product ID already exists"
        });

      }


      const product =
        new Product({

          productId:
            Number(productId),

          name:
            name.trim(),

          price:
            Number(price),

          category:
            category.trim(),

          type:
            type?.trim() || "",

          description:
            description?.trim() || "",

          stock:
            Number(stock || 0),

          // New products start with
          // no customer reviews.
          rating: 0,
          reviews: 0

        });


      const savedProduct =
        await product.save();


      res.status(201).json({

        success: true,

        message:
          "Product added successfully",

        product:
          savedProduct

      });

    } catch (error) {

      console.error(
        "Error adding product:",
        error.message
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to add product",

        error:
          error.message

      });

    }

  }
);


// =========================================
// UPDATE PRODUCT
// =========================================

router.put(
  "/:productId",
  verifyToken,
  adminOnly,
  async (req, res) => {

    try {

      const {
        name,
        price,
        category,
        type,
        description,
        stock
      } = req.body;


      if (
        !name ||
        price === undefined ||
        !category
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Product name, price and category are required"
        });

      }


      const updatedProduct =
        await Product.findOneAndUpdate(

          {
            productId:
              Number(req.params.productId)
          },

          {
            name:
              name.trim(),

            price:
              Number(price),

            category:
              category.trim(),

            type:
              type?.trim() || "",

            description:
              description?.trim() || "",

            stock:
              Number(stock || 0)

          },

          {
            new: true,
            runValidators: true
          }

        );


      if (!updatedProduct) {

        return res.status(404).json({

          success: false,

          message:
            "Product not found"

        });

      }


      res.json({

        success: true,

        message:
          "Product updated successfully",

        product:
          updatedProduct

      });

    } catch (error) {

      console.error(
        "Error updating product:",
        error.message
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to update product",

        error:
          error.message

      });

    }

  }
);


// =========================================
// DELETE PRODUCT
// =========================================

router.delete(
  "/:productId",
  verifyToken,
  adminOnly,
  async (req, res) => {

    try {

      const deletedProduct =
        await Product.findOneAndDelete({

          productId:
            Number(req.params.productId)

        });


      if (!deletedProduct) {

        return res.status(404).json({

          success: false,

          message:
            "Product not found"

        });

      }


      res.json({

        success: true,

        message:
          "Product deleted successfully",

        product:
          deletedProduct

      });

    } catch (error) {

      console.error(
        "Error deleting product:",
        error.message
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to delete product",

        error:
          error.message

      });

    }

  }
);


module.exports = router;