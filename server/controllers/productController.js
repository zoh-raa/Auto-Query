const { Product } = require('../models');

// Update an existing product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // productId from URL
    const updated = await Product.update(req.body, {
      where: { productId: id }
    });

    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findByPk(id);
    res.json(product);
  } catch (error) {
    console.error('❌ Update failed:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};
