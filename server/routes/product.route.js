
// product.route.js

const express = require('express');
const router = express.Router();
const { Product } = require('../models');  // Assuming you have a Product model
const { Op } = require('sequelize');  // To use Sequelize operators


// Search for products by part name (or part number, vehicle, or VIN)
router.get('/search', async (req, res) => {
    const { query } = req.query;  // Get the search query from the URL

    if (!query) {
        return res.status(400).json({ message: 'No search query provided' });
    }

    // Require minimum 3 characters for search
    if (query.trim().length < 3) {
        return res.status(400).json({ message: 'Search query must be at least 3 characters long' });
    }

    try {
        // Search for the product by name OR brand (case-insensitive)
        const results = await Product.findAll({
            where: {
                [Op.or]: [
                    { productName: { [Op.like]: `%${query}%` } },
                    { productBrand: { [Op.like]: `%${query}%` } }
                ]
            }
        });

        if (!results || results.length === 0) {
            return res.status(404).json({ message: `No parts found for "${query}"` });
        }

        res.json(results);  // Return matching parts
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to search products' });
    }
});

// Get a single product by productId
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ where: { productId: req.params.id } });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch product', error: error.message });
    }
});

// Add demo data route (for testing)
router.post('/seed', async (req, res) => {
    try {
        // Clear existing products first
        await Product.destroy({ where: {} });
        
        const demoProducts = [
            {
                productName: 'Yamaha Aerox 155 Exhaust System',
                productId: 'YMH-AX155-EXH-001',
                productNumber: 'YMH001',
                productDescription: 'High-performance exhaust system for Yamaha Aerox 155. Stainless steel construction with improved sound and performance.',
                quantity: 5,
                imageUrl: '/images/aerox-exhaust.jpg',
                productBrand: 'Yamaha',
                price: 150.00
            },
            {
                productName: 'Yamaha Aerox Carbon Fiber Exhaust',
                productId: 'YMH-AX155-CFE-002',
                productNumber: 'YMH002',
                productDescription: 'Lightweight carbon fiber exhaust for Yamaha Aerox. Reduces weight while improving performance.',
                quantity: 3,
                imageUrl: '/images/yamahaexhaust1.jpg',
                productBrand: 'Yamaha',
                price: 280.00
            },
            {
                productName: 'Honda PCX 160 Brake Pads',
                productId: 'HND-PCX160-BP-003',
                productNumber: 'HND003',
                productDescription: 'Premium brake pads for Honda PCX 160. Long-lasting and reliable stopping power.',
                quantity: 10,
                imageUrl: '/images/hondapads.jpg',
                productBrand: 'Honda',
                price: 45.00
            },
            {
                productName: 'Honda Air Filter',
                productId: 'HND-AIR-FILTER-004',
                productNumber: 'HND004',
                productDescription: 'High-quality air filter for Honda motorcycles. Improves engine performance and fuel efficiency.',
                quantity: 8,
                imageUrl: '/images/hondafilter.jpg',
                productBrand: 'Honda',
                price: 25.00
            }
        ];

        await Product.bulkCreate(demoProducts); // Create fresh data

        res.json({ message: 'Products added successfully', count: demoProducts.length });
    } catch (error) {
        console.error('Error seeding products:', error);
        res.status(500).json({ message: 'Failed to seed products', error: error.message });
    }
});

// Search for products by part name (or part number, vehicle, or VIN)
router.get('/search', async (req, res) => {
    const { query } = req.query;  // Get the search query from the URL

    if (!query) {
        return res.status(400).json({ message: 'No search query provided' });
    }

    // Require minimum 3 characters for search
    if (query.trim().length < 3) {
        return res.status(400).json({ message: 'Search query must be at least 3 characters long' });
    }

    try {
        // Search for the product by name OR brand (case-insensitive)
        const results = await Product.findAll({
            where: {
                [Op.or]: [
                    { productName: { [Op.like]: `%${query}%` } },
                    { productBrand: { [Op.like]: `%${query}%` } }
                ]
            }
        });

        if (!results || results.length === 0) {
            return res.status(404).json({ message: `No parts found for "${query}"` });
        }

        res.json(results);  // Return matching parts
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to search products' });
    }
});

module.exports = router;
