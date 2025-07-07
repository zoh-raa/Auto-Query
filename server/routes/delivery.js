const express = require('express');
const router = express.Router();
const { User, Delivery, Product } = require('../models'); // Import Sequelize models

// GET all deliveries, including associated user and products
router.get('/', async (req, res) => {
  try {
    // Fetch all deliveries with related User and Product data
    const deliveries = await Delivery.findAll({
      include: [
        // Include User info but limit attributes for privacy
        { model: User, attributes: ['firstName', 'lastName', 'phone', 'email', 'company', 'role'] },
        { model: Product }, // Include all related products
      ],
    });
    res.json(deliveries); // Send deliveries as JSON response
  } catch (err) {
    // Return 500 Internal Server Error on failure
    res.status(500).json({ error: err.message });
  }
});

// POST create new delivery along with user and products
router.post('/', async (req, res) => {
  try {
    // Extract user, delivery, and products info from request body
    const { user, delivery, products } = req.body;

    // Validate required user fields are present
    if (!user || !user.firstName || !user.lastName || !user.phone || !user.email)
      return res.status(400).json({ error: 'Missing required user fields' });

    // Validate required delivery fields are present
    if (!delivery || !delivery.rfqId || !delivery.poNumber || !delivery.location || !delivery.type)
      return res.status(400).json({ error: 'Missing required delivery fields' });

    // Check if user with given email already exists
    let existingUser = await User.findOne({ where: { email: user.email } });
    let createdUser;
    if (existingUser) {
      // Use existing user if found
      createdUser = existingUser;
    } else {
      // Otherwise, create a new user record
      createdUser = await User.create(user);
    }

    // Create the delivery record linked to the user
    const createdDelivery = await Delivery.create({
      ...delivery,
      userId: createdUser.id,
    });

    // If products are provided, bulk create them linking to deliveryId
    if (Array.isArray(products) && products.length > 0) {
      await Product.bulkCreate(
        products.map((p) => ({ ...p, deliveryId: createdDelivery.id }))
      );
    }

    // Retrieve the full delivery record including associated User and Products
    const fullDelivery = await Delivery.findByPk(createdDelivery.id, {
      include: [User, Product],
    });

    // Respond with the created delivery and related info
    res.status(201).json(fullDelivery);
  } catch (err) {
    console.error(err);
    // Return 500 error on any failure
    res.status(500).json({ error: err.message });
  }
});

// PUT update a delivery's details by ID
router.put('/:id', async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const updates = req.body;

    // Find delivery by primary key (ID)
    const delivery = await Delivery.findByPk(deliveryId);
    if (!delivery) {
      // Return 404 if delivery not found
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Update delivery with new fields from request body
    await delivery.update(updates);

    // Return success message and updated delivery
    res.json({ message: 'Delivery updated successfully', delivery });
  } catch (err) {
    // Return 500 error on failure
    res.status(500).json({ error: err.message });
  }
});

// DELETE a delivery by ID
router.delete('/:id', async (req, res) => {
  try {
    const deliveryId = req.params.id;

    // Find delivery to delete
    const delivery = await Delivery.findByPk(deliveryId);
    if (!delivery) {
      // Return 404 if not found
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Remove delivery record from database
    await delivery.destroy();

    // Return success confirmation
    res.json({ message: 'Delivery deleted successfully' });
  } catch (err) {
    // Return 500 error on failure
    res.status(500).json({ error: err.message });
  }
});

// Export the router to be used in main app
module.exports = router;
