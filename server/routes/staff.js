const express = require('express');
const router = express.Router();
const { Staff } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateToken } = require('../middlewares/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { LoginAttempt } = require('../models');
require('dotenv').config();
const axios = require('axios'); // ✅ Import this if not already
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");


router.post('/register', async (req, res) => {
  const { staff_id, email, password, name, role } = req.body;

  try {
    const existingStaff = await Staff.findOne({ where: { email } });
    if (existingStaff) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await Staff.create({
      staff_id,
      email,
      password: hashedPassword,
      name,
      role: role || "admin"
    });

    const token = jwt.sign(
  { id: newStaff.id, role: 'staff' },
  process.env.APP_SECRET,
  { expiresIn: '1h' }
);

  res.status(201).json({
    message: "Staff registered successfully",
    accessToken: token,
    staff: {
      id: newStaff.id,
      name: newStaff.name,
      email: newStaff.email,
      staff_id: newStaff.staff_id,
      role: newStaff.role
    }
  });

    res.status(201).json({ message: "Staff registered successfully", staff: {
      id: newStaff.id,
      name: newStaff.name,
      email: newStaff.email,
      staff_id: newStaff.staff_id,
      role: newStaff.role
    }});

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});


router.post('/login', async (req, res) => {
  const { staff_id, password } = req.body;

  try {
    const staff = await Staff.findOne({ where: { staff_id } });
    if (!staff) return res.status(400).json({ message: "Staff not found" });

    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    // ✅ Get IP and Geo info using ipapi.co
    let ip = "Unknown";
    let location = "Unknown";

    try {
      const geoRes = await axios.get("https://ipapi.co/json/");
      ip = geoRes.data.ip;
      location = `${geoRes.data.city}, ${geoRes.data.region}, ${geoRes.data.country_name}`;
    } catch (geoErr) {
      console.warn("🌐 IPAPI lookup failed:", geoErr.message);
    }

    const device = req.headers['user-agent'] || "Unknown";

    // ✅ Log attempt
    await LoginAttempt.create({
      email: staff.email,
      ip,
      location,
      device,
      anomaly_score: "Low"
    });


    // ✅ Return response
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
        staff_id: staff.staff_id,
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
    console.log("✅ /staff/customers called by", req.user?.id);
    const customers = await Customer.findAll({
      attributes: ['id','name','email', 'login_count']
    });
    console.log("✅ Customers retrieved:", customers.length);
    res.json(customers);
  } catch (err) {
    console.error("❌ Failed to fetch customers:", err);
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

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

router.post('/inactivity-likelihood', async (req, res) => {
  const { email, login_count } = req.body;

  const prompt = `Estimate the likelihood (as a % from 0 to 100) that a user is becoming inactive based on this info:
- Email: ${email}
- Login count: ${login_count}

Return only a number (no explanation).`;

  const input = {
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31", // ✅ REQUIRED
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 20,
      temperature: 0.2
    })
  };

  try {
    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);

    const raw = await response.body.transformToString();
    const match = raw.match(/\d+/);
    const likelihood = match ? parseInt(match[0]) : 50;

    res.json({ likelihood });
  } catch (err) {
    console.error("❌ Bedrock SDK error:", err?.message || err);
    res.status(500).json({ message: "SDK-based Bedrock call failed." });
  }
});




// GET /staff/security-logs
router.get("/security-logs", async (req, res) => {
  try {
    const logs = await LoginAttempt.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(logs);
  } catch (err) {
    console.error("❌ Failed to fetch security logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
