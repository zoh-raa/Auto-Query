// server/routes/staffQuery.js
const express = require('express');
const router = express.Router();
const { RFQ, RFQItem, Customer } = require('../models'); // your models

router.post('/query', async (req, res) => {
  const { query } = req.body;
  let results;

  try {
    if (/pending/i.test(query)) {
      results = await RFQ.findAll({ where: { status: 'pending' }, include: [RFQItem, Customer] });
    } else if (/approved/i.test(query)) {
      results = await RFQ.findAll({ where: { status: 'approved' }, include: [RFQItem, Customer] });
    } else if (/customer (\w+)/i.test(query)) {
      const customerName = query.match(/customer (\w+)/i)[1];
      results = await RFQ.findAll({ include: [{ model: Customer, where: { name: customerName } }, RFQItem] });
    } else {
      results = [];
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to query RFQs' });
  }
});

module.exports = router;
