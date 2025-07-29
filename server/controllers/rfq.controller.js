const db = require('../models');
const { generateQRCode } = require('../utils/qrcode');

const RFQ = db.RFQ;
const RFQItem = db.RFQItem;
const Customer = db.Customer;

exports.createRFQ = async (req, res) => {
  try {
    console.log("📥 Create RFQ request body:", req.body);
    const { items, comments } = req.body;
    const customerId = req.user.id;

    // Step 1: Create RFQ without rfq_number yet
    const rfq = await RFQ.create({
      customerId,
      remarks: comments || "",
      rfq_number: "TEMP" // Temporary value just to bypass NOT NULL
    });

    // Step 2: Generate rfq_number using ID
    const paddedId = rfq.id.toString().padStart(5, '0');
    rfq.rfq_number = `RFQ${paddedId}`;

    // Step 3: Add RFQ items
    for (let item of items) {
      await RFQItem.create({
        rfqId: rfq.id,
        product_name: item.product_name,
        quantity: item.quantity,
        remarks: item.remarks || ""
      });
    }

    // Step 4: Generate QR code
    const qrData = rfq.rfq_number;
    const qrCode = await generateQRCode(qrData);
    rfq.qr_code = qrCode;

    // Step 5: Save final RFQ
    await rfq.save();

    // Step 6: Refetch with items for frontend
    const createdRFQ = await RFQ.findOne({
      where: { id: rfq.id },
      include: [RFQItem]
    });

    res.json({
      message: "RFQ created successfully",
      qr_code: qrCode,
      rfq: createdRFQ
    });

  } catch (err) {
    console.error("❌ RFQ creation failed:", err);
    res.status(500).json({ message: "Failed to create RFQ" });
  }
};

exports.getMyRFQs = async (req, res) => {
  try {
    const rfqs = await RFQ.findAll({
      where: { customerId: req.user.id },
      include: RFQItem,
      order: [['createdAt', 'DESC']]
    });
    res.json(rfqs);
  } catch (err) {
    console.error("❌ getMyRFQs error:", err);
    res.status(500).json({ message: "Failed to fetch RFQs" });
  }
};

exports.getAllRFQs = async (req, res) => {
  try {
    const rfqs = await RFQ.findAll({
      include: [{ model: Customer }, { model: RFQItem }],
      order: [['createdAt', 'DESC']]
    });
    res.json(rfqs);
  } catch (err) {
    console.error("❌ getAllRFQs error:", err);
    res.status(500).json({ message: "Failed to fetch all RFQs" });
  }
};

exports.updateRFQ = async (req, res) => {
  try {
    const { id } = req.params;
    await RFQ.update(req.body, { where: { id } });
    res.json({ message: "RFQ updated" });
  } catch (err) {
    console.error("❌ updateRFQ error:", err);
    res.status(500).json({ message: "Failed to update RFQ" });
  }
};

exports.deleteRFQ = async (req, res) => {
  try {
    const { id } = req.params;
    const rfq = await RFQ.findByPk(id);

    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    if (rfq.customerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Not your RFQ" });
    }

    await RFQItem.destroy({ where: { rfqId: rfq.id } });
    await rfq.destroy();

    res.json({ message: "RFQ deleted successfully" });
  } catch (err) {
    console.error("❌ deleteRFQ error:", err);
    res.status(500).json({ message: "Failed to delete RFQ" });
  }
};

exports.getRFQById = async (req, res) => {
  try {
    const { id } = req.params;

    const rfq = await RFQ.findOne({
      where: { id },
      include: [RFQItem, Customer],
    });

    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    res.json(rfq);
  } catch (err) {
    console.error('❌ getRFQById error:', err);
    res.status(500).json({ message: 'Failed to fetch RFQ' });
  }
};
