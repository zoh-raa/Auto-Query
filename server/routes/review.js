const express = require('express');
const router = express.Router();
const db = require('../models');
const { Review } = db;

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll({ order: [['createdAt', 'DESC']] });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a new review
router.post('/', async (req, res) => {
  try {
    const { name, email, text, rating } = req.body;
    if (!name || !email || !text || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const review = await Review.create({ name, email, text, rating });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

module.exports = router;
