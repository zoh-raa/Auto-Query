const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const products = []; // 🧠 In-memory storage

// POST /staff/products
router.post('/', upload.single('image'), (req, res) => {
  const { productName, productId, productNumber, productDescription, quantity } = req.body;
  const image = req.file;

  if (!productName || !productId || !productNumber || !productDescription || !image || !quantity) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const newProduct = {
    productName,
    productId,
    productNumber,
    productDescription,
    quantity,
    imageUrl: image.filename,
  };

  products.push(newProduct); // Save it

  res.status(201).json({ message: 'Product created successfully' });
});

// ✅ GET /staff/products — show all products
router.get('/', (req, res) => {
  res.json(products);
});

module.exports = router;
