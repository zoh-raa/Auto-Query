const express = require('express');
const router = express.Router();
const { User, Delivery, Product } = require('../models');

// GET all deliveries with associated user and products
router.get('/', async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'phone', 'email', 'company', 'role'] },
        { model: Product },
      ],
    });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single delivery by ID
router.get('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'phone', 'email', 'company', 'role'] },
        { model: Product },
      ],
    });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OPTIONAL: GET delivery by ID with only products (if you want separate route)
router.get('/:id/with-products', async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [Product],
    });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery with products.' });
  }
});

// POST create a new delivery with user and products
router.post('/', async (req, res) => {
  try {
    const { user, delivery, products } = req.body;

    if (!user || !user.firstName || !user.lastName || !user.phone || !user.email)
      return res.status(400).json({ error: 'Missing required user fields' });

    if (!delivery || !delivery.rfqId || !delivery.poNumber || !delivery.location || !delivery.type)
      return res.status(400).json({ error: 'Missing required delivery fields' });

    let existingUser = await User.findOne({ where: { email: user.email } });
    let createdUser = existingUser || await User.create(user);

    const createdDelivery = await Delivery.create({ ...delivery, userId: createdUser.id });

    if (Array.isArray(products) && products.length > 0) {
      await Product.bulkCreate(products.map(p => ({ ...p, deliveryId: createdDelivery.id })));
    }

    const fullDelivery = await Delivery.findByPk(createdDelivery.id, {
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'phone', 'email', 'company', 'role'] },
        { model: Product },
      ],
    });

    res.status(201).json(fullDelivery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update a delivery
router.put('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    await delivery.update(req.body);
    res.json({ message: 'Delivery updated successfully', delivery });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a delivery
router.delete('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    await delivery.destroy();
    res.json({ message: 'Delivery deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET delivery by RFQ ID with products
router.get('/rfq/:rfqId', async (req, res) => {
  const { rfqId } = req.params;
  try {
    const delivery = await Delivery.findOne({
      where: { rfqId },
      include: [Product],
    });
    if (!delivery) {
      return res.status(404).json({ error: 'RFQ not found' });
    }
    res.json({
      poNumber: delivery.poNumber,
      location: delivery.location,
      description: delivery.description,
      products: delivery.Products || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
