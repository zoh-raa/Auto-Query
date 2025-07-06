const express = require('express');
const router = express.Router();
const { Review } = require('../models');

// Create review
router.post('/', async (req, res) => {
    try {
        const review = await Review.create(req.body);
        res.json(review);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.findAll({ order: [['createdAt', 'DESC']] });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Update review
router.put('/:id', async (req, res) => {
    try {
        await Review.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Review updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// Delete review
router.delete('/:id', async (req, res) => {
    try {
        await Review.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
