
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Customer, Delivery, DeliveryProduct } = require('../models');
const { validateToken } = require('../middlewares/auth');
const { formatDeliveryForPrompt, fallbackSummary, heuristicDelayRisk, callAI, generatePoliteMessage } = require('../utils/openai');
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


// AI message generation for delivery
router.post("/my/:id/ai-message", validateToken, async (req, res) => {
  const deliveryId = req.params.id;
  console.log("[AI Message] Requested delivery ID:", deliveryId);

  try {
    // Fetch delivery
    const delivery = await Delivery.findOne({
      where: { id: deliveryId, customerId: req.user.id },
      include: [
        { model: DeliveryProduct, as: "products" },
        { model: Customer, as: "Customer" }  // match the model & alias
      ],
    });

    if (!delivery) {
      console.warn("[AI Message] Delivery not found for ID:", deliveryId);
      return res.status(404).json({ message: "Delivery not found" });
    }

    console.log("[AI Message] Delivery fetched successfully:", delivery.toJSON());

    // Format delivery text for AI
    const deliveryText = formatDeliveryForPrompt(delivery);
    console.log("[AI Message] Delivery formatted for AI:", deliveryText);

    let politeMessage = "Unable to generate AI message.";

    try {
      politeMessage = await generatePoliteMessage(deliveryText, req.body.tone || 'friendly');
      console.log("[AI Message] Polite message generated:", politeMessage);
    } catch (aiErr) {
      console.error("[AI Message] OpenAI failed, using fallback:", aiErr);
      politeMessage = fallbackSummary(delivery);
    }

    return res.json({ message: politeMessage });

  } catch (err) {
    console.error("[AI Message] Unexpected error:", err);
    return res.status(500).json({
      message: "Unable to generate message at this time.",
      error: err.message,
    });
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
        { model: Customer, as: 'Customer', attributes: ['name', 'email', 'phone'] },
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

    // Auto-set cancelledBy if status is Cancelled
    const updatedData = {
      poNumber,
      assignedTo,
      deliveryDate,
      timing,
      location,
      description,
      deliveryProvider,
      phone,
      status,
      cancelledBy: status === 'Cancelled' ? 'staff' : null
    };

    await delivery.update(updatedData);

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


//Route 
// Staff: AI summary for all pending/in-progress deliveries
router.get("/staff/ai-summary", validateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "staff") {
      return res.status(403).json({ message: "Access denied: staff only" });
    }

    const deliveries = await Delivery.findAll({
      where: { status: { [Op.in]: ["Pending", "In Progress"] } },
      include: [
        { model: DeliveryProduct, as: "products" },
        { model: Customer },
      ],
    });

    if (!deliveries.length) {
      return res.json({ summary: "No pending or in-progress deliveries." });
    }

    const summaries = await Promise.all(
      deliveries.map(async (d) => {
        try {
          // Short prompt for AI: only ask for smart insight, no repeating fields
          const prompt = `You are a staff assistant. Provide a short, actionable insight for this delivery. 
Do NOT repeat PO number, date, time, items, or customer info. Focus on key things staff should know or check.`;

          const aiSummaryText = await callAI({ delivery: d, systemPrompt: prompt });

          const risk = heuristicDelayRisk(d);

          let suggestedAction = "";
          if (risk.riskLevel === "High")
            suggestedAction = "Urgent action required: start implementing corrective steps and report progress regularly.";
          else if (risk.riskLevel === "Medium")
            suggestedAction = "Monitor closely and provide updates to ensure on-time completion.";
          else
            suggestedAction = "No immediate action needed.";

          return {
            poNumber: d.poNumber,
            status: d.status,
            deliveryDate: d.deliveryDate || "N/A",
            timing: d.timing || "N/A",
            mainItems: (d.products || []).map(p => `${p.quantity}x ${p.item}`).join(", ") || "N/A",
            aiInsight: aiSummaryText,
            riskLevel: risk.riskLevel,
            suggestedAction,
          };
        } catch (err) {
          console.error("callAI failed for delivery", d.id, err);
          return {
            poNumber: d.poNumber,
            status: d.status,
            deliveryDate: d.deliveryDate || "N/A",
            timing: d.timing || "N/A",
            mainItems: (d.products || []).map(p => `${p.quantity}x ${p.item}`).join(", ") || "N/A",
            aiInsight: "Fallback summary used.",
            riskLevel: heuristicDelayRisk(d).riskLevel,
            suggestedAction: "Fallback summary used",
          };
        }
      })
    );

    res.json({
      summary: summaries
        .map(s => `📦 **PO** ${s.poNumber} (**${s.status}**) | Date: ${s.deliveryDate} | Time: ${s.timing}\n | Items: ${s.mainItems}\n | Risk: ${s.riskLevel}\nAI Insight: ${s.aiInsight}\nSuggested Action: ${s.suggestedAction}`)
        .join("\n\n")
    });
  } catch (error) {
    console.error("AI summary (staff) error:", error);
    res.json({ summary: "Unable to generate AI summary. Showing basic info.", error: error.message });
  }
});


// Staff: AI summary for a single delivery by ID
router.get("/staff/:id/ai-summary", validateToken, async (req, res) => {
  if (!req.user || req.user.role !== "staff") {
    return res.status(403).json({ message: "Access denied: staff only" });
  }

  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        { model: DeliveryProduct, as: "products" },
        { model: Customer },
      ],
    });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    let summaryText;
    try {
      // Try AI summary first
      const formatted = formatDeliveryForPrompt(delivery);
      const prompt = `suggested actions:\n${formatted}`;
      summaryText = await callAI({ delivery, systemPrompt: prompt });
    } catch (aiErr) {
      console.error("AI call failed for delivery", delivery.id, aiErr);
      summaryText = fallbackSummary(delivery); // fallback if AI fails
    }

    // Always compute risk
    const risk = heuristicDelayRisk(delivery);

    // Generate suggestions based on risk
    const suggestions = [];
    if (risk.riskLevel === "High") suggestions.push("Contact delivery provider to confirm timing.");
    else if (risk.riskLevel === "Medium") suggestions.push("Monitor delivery status closely.");
    else suggestions.push("No immediate action required.");

    res.json({
      summary: summaryText,
      risk,
      suggestions,
    });

  } catch (error) {
    console.error("Unexpected error in AI summary route:", error);
    // Return fallback info even if unexpected error occurs
    res.json({
      summary: "Unable to generate AI summary. Showing basic info.",
      risk: { riskScore: 0, riskLevel: "Low", color: "green" },
      suggestions: ["Fallback summary used"],
      error: error.message,
    });
  }
});


router.get("/staff/:id/ai-delay", validateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "staff") return res.status(403).json({ message: "Access denied: staff only" });

    const delivery = await Delivery.findByPk(req.params.id, {
      include: [{ model: DeliveryProduct, as: "products" }],
    });
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    const risk = heuristicDelayRisk(delivery);
    res.json({ risk });
  } catch (error) {
    console.error("AI delay (delivery) error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;