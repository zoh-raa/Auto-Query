const db = require('../models');
const Review = db.Review;

// Get all reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll();
        res.json(reviews);
    } catch (err) {
        console.error("Fetch Reviews Error:", err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Create a review
exports.createReview = async (req, res) => {
    try {
        console.log("🚀 Incoming review body:", req.body); // See full body

        const { name, email, text, rating } = req.body;

        if (!name || !email || !text || !rating) {
            console.log("❌ Missing fields:", { name, email, text, rating });
            return res.status(400).json({ error: "All fields are required." });
        }

        const review = await Review.create({ name, email, text, rating });
        console.log("✅ Review created:", review.toJSON());
        res.status(201).json(review);
    } catch (err) {
        console.error("❌ Create Review Error:", err);
        res.status(500).json({ error: "Failed to create review", details: err.message });
    }
};


// Update a review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        await Review.update(req.body, { where: { id } });
        res.sendStatus(200);
    } catch (err) {
        console.error("Update Review Error:", err);
        res.status(500).json({ error: 'Failed to update review' });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await Review.destroy({ where: { id } });
        res.sendStatus(200);
    } catch (err) {
        console.error("Delete Review Error:", err);
        res.status(500).json({ error: 'Failed to delete review' });
    }
};
