const express = require('express');
const router = express.Router();
const { Staff } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateToken } = require('../middlewares/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) return res.status(400).json({ message: "Staff not found" });

    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

const token = jwt.sign(
  { id: staff.id, role: 'staff' },
  process.env.APP_SECRET,
  { expiresIn: '1h' }
);


    res.json({
      accessToken: token,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: 'staff'
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get('/auth', validateToken, async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.user.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.json({
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: 'staff'
      }
    });
  } catch (err) {
    console.error("Staff auth error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const { Customer } = require('../models'); // 👈 add this at the top if missing

// GET /staff/customers
router.get('/customers', validateToken, async (req, res) => {
  try {
    const customers = await Customer.findAll({
      attributes: ['id', 'email', 'login_count']
    });
    res.json(customers);
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



router.post('/generate-insight', async (req, res) => {
  const { customers } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const prompt = `Here is a list of customer login counts:\n\n${customers
      .map(c => `- ${c.email}: ${c.login_count} logins`)
      .join('\n')}\n\nPlease give a short summary of patterns, engagement levels, and highlight the least active user.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = await result.response;
    const summary = response.text();

    res.json({ insight: summary });
  } catch (err) {
    console.error("❌ Gemini error:", err);
    res.status(500).json({ message: "Insight generation failed." });
  }
});



module.exports = router;
