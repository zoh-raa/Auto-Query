// routes/products.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { Product } = require("../models");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure /uploads folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/**
 * @route GET /staff/products
 * @desc Fetch all products
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/**
 * @route POST /staff/products
 * @desc Create a new product
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { productName, productId, productNumber, productDescription, quantity, productBrand, price } = req.body;

    const newProduct = await Product.create({
      productName,
      productId,
      productNumber,
      productDescription,
      quantity,
      productBrand,
      price,
      imageUrl: req.file ? req.file.filename : null,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

/**
 * @route PUT /staff/products/:id
 * @desc Update an existing product by productId
 */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params; // <-- productId from URL

    const product = await Product.findOne({ where: { productId: id } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.update({
      productName: req.body.productName,
      productNumber: req.body.productNumber,
      productDescription: req.body.productDescription,
      quantity: req.body.quantity,
      productBrand: req.body.productBrand,
      price: req.body.price,
      imageUrl: req.file ? req.file.filename : product.imageUrl, // keep old image if not replaced
    });

    res.json(product);
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

/**
 * @route DELETE /staff/products/:id
 * @desc Delete a product by productId
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // <-- productId from URL

    const deleted = await Product.destroy({ where: { productId: id } });
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

/**
 * @route GET /staff/products/:productId
 * @desc Get details for a single product
 */
router.get("/:productId", async (req, res) => {
  try {
    const product = await Product.findOne({ where: { productId: req.params.productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;