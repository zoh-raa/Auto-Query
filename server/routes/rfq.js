// routes/rfq.js

const express = require('express');
const router = express.Router();
const { Delivery, Product } = require('../models');

// GET RFQ details and its products by rfqId
router.get('/:rfqId', async (req, res) => {
  const { rfqId } = req.params;

  try {
    const delivery = await Delivery.findOne({
      where: { rfqId },
      include: [{ model: Product }]
    });

    if (!delivery) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    res.json({
      rfqId: delivery.rfqId,
      poNumber: delivery.poNumber,
      location: delivery.location,
      description: delivery.description,
      Products: delivery.Products
    });
  } catch (err) {
    console.error('[RFQ FETCH ERROR]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
