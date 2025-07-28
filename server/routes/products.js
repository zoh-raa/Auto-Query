const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Product } = require('../models');
const upload = multer({ dest: 'uploads/' });

// POST /staff/products
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { productName, productId, productNumber, productDescription, quantity, productBrand, price } = req.body;

    if (!productName || !productId || !productNumber || !productDescription || !quantity || !productBrand || !price) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const newProduct = await Product.create({
      productName,
      productId,
      productNumber,
      productDescription,
      quantity,
      productBrand,
      price,
      imageUrl: req.file ? req.file.filename : null
    });

    res.status(201).json({ message: 'Product saved', product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /staff/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /staff/products/:productId
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ where: { productId: req.params.productId } });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// DELETE /staff/products/:productId
router.delete('/:productId', async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { productId: req.params.productId } });
    if (deleted) return res.json({ message: 'Deleted' });
    res.status(404).json({ message: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;