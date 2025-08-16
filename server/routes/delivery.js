
const express = require('express');
const router = express.Router();
const { Customer, Delivery, DeliveryProduct } = require('../models');
const { validateToken } = require('../middlewares/auth');

///// CUSTOMER ROUTES /////

// Create delivery + products (customer)
router.post('/', validateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied: customers only' });
    }

    const { delivery, products } = req.body;
    if (!delivery || !products || products.length === 0) {
      return res.status(400).json({ message: 'Missing delivery or products' });
    }

    const newDelivery = await Delivery.create({
      rfqId: delivery.rfqId,
      poNumber: delivery.poNumber,
      assignedTo: delivery.assignedTo,
      deliveryDate: delivery.deliveryDate,
      timing: delivery.timing,
      location: delivery.location,
      description: delivery.description,
      phone: delivery.phone,
      deliveryProvider: delivery.deliveryProvider,
      customerId: req.user.id,
      status: delivery.status || 'Pending',
    });

    for (const p of products) {
      await DeliveryProduct.create({
        deliveryId: newDelivery.id,
        quantity: p.quantity,
        item: p.item,
        remarks: p.remarks || '',
      });
    }

    res.status(201).json({ message: 'Delivery created', deliveryId: newDelivery.id });
  } catch (error) {
    console.error('Create delivery error (customer):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my deliveries (customer)
router.get('/my', validateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied: customers only' });
    }

    const deliveriesRaw = await Delivery.findAll({
      where: { customerId: req.user.id },
      include: [
        { model: DeliveryProduct, as: 'products', attributes: ['quantity', 'item', 'remarks'] },
        { model: Customer, attributes: ['name', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const deliveries = deliveriesRaw.map(d => ({
      id: d.id,
      rfqId: d.rfqId,
      poNumber: d.poNumber,
      assignedTo: d.assignedTo,
      deliveryDate: d.deliveryDate,
      timing: d.timing,
      location: d.location,
      description: d.description,
      phone: d.phone,
      deliveryProvider: d.deliveryProvider,
      status: d.status,
      user: {
        name: d.Customer?.name || '',
        email: d.Customer?.email || '',
        phone: d.phone || d.Customer?.phone || '',
      },
      products: d.products.map(p => ({
        quantity: p.quantity,
        item: p.item,
        remarks: p.remarks,
      })),
    }));

    res.json(deliveries);
  } catch (error) {
    console.error('Fetch deliveries error (customer):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete delivery by ID (customer)
router.delete('/my/:id', validateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied: customers only' });
    }

    const deliveryId = req.params.id;
    const delivery = await Delivery.findOne({
      where: { id: deliveryId, customerId: req.user.id },
    });

    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    // Delete associated products first
    await DeliveryProduct.destroy({ where: { deliveryId } });
    await delivery.destroy();

    res.json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    console.error('Delete delivery error (customer):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

///// STAFF ROUTES /////

// Get all deliveries (staff)
router.get('/staff/all', validateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied: staff only' });
    }

    const deliveriesRaw = await Delivery.findAll({
      include: [
        { model: DeliveryProduct, as: 'products', attributes: ['quantity', 'item', 'remarks'] },
        { model: Customer, attributes: ['name', 'email', 'phone'] },
      ],
      order: [
        ['createdAt', 'DESC'], // sort deliveries
        [{ model: DeliveryProduct, as: 'products' }, 'id', 'ASC'] // keep products in same order as added
      ],
    });

    const deliveries = deliveriesRaw.map(d => ({
      id: d.id,
      rfqId: d.rfqId,
      poNumber: d.poNumber,
      assignedTo: d.assignedTo,
      deliveryDate: d.deliveryDate,
      timing: d.timing,
      location: d.location,
      description: d.description,
      phone: d.phone,
      deliveryProvider: d.deliveryProvider,
      status: d.status,
      user: {
        name: d.Customer?.name || '',
        email: d.Customer?.email || '',
        phone: d.phone || d.Customer?.phone || '',
      },
      products: d.products.map(p => ({
        quantity: p.quantity,
        item: p.item,
        remarks: p.remarks,
      })),
    }));

    res.json(deliveries);
  } catch (error) {
    console.error('Fetch all deliveries error (staff):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update delivery (staff)
router.put('/staff/:id', validateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied: staff only' });
    }

    const id = req.params.id;
    const { poNumber, assignedTo, deliveryDate, timing, location, description, deliveryProvider, phone, status } = req.body;
console.log('PUT /staff/:id body:', req.body);
    const delivery = await Delivery.findByPk(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    await delivery.update({ poNumber, assignedTo, deliveryDate, timing, location, description, deliveryProvider, phone, status });

    res.json({ message: 'Delivery updated' });
  } catch (error) {
    console.error('Update delivery error (staff):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete delivery (staff)
router.delete('/staff/:id', validateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied: staff only' });
    }

    const id = req.params.id;
    const delivery = await Delivery.findByPk(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    await DeliveryProduct.destroy({ where: { deliveryId: id } });
    await delivery.destroy();

    res.json({ message: 'Delivery deleted' });
  } catch (error) {
    console.error('Delete delivery error (staff):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
