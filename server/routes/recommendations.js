// server/routes/recommendations.js
const express = require('express');
const router = express.Router();
const { RFQItem } = require('../models');
const { sequelize } = require('../models');

router.get('/top-products', async (req, res) => {
  try {
    const topProducts = await RFQItem.findAll({
      attributes: ['product_name', [sequelize.fn('COUNT', sequelize.col('product_name')), 'count']],
      group: 'product_name',
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 3
    });
    res.json(topProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

module.exports = router;
