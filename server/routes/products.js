const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Product } = require('../models');
const upload = multer({ dest: 'uploads/' });

// POST /staff/products
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { productName, productId, productNumber, productDescription, quantity } = req.body;
    const image = req.file;

    if (!productName || !productId || !productNumber || !productDescription || !image || !quantity) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const newProduct = await Product.create({
      productName,
      productId,
      productNumber,
      productDescription,
      quantity,
      imageUrl: image.filename,
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

module.exports = router;