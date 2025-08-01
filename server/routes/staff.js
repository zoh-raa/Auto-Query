const express = require('express');
const router = express.Router();
const { Staff } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateToken } = require('../middlewares/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const axios = require('axios'); // ✅ Import this if not already
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { LoginAttempt } = require('../models'); // ✅ Required for /security-logs


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

    return res.status(201).json({
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

  } catch (err) {
    console.error("❌ Registration error:", err);
    return res.status(500).json({ message: "Server error during registration" });
  }
});



router.post('/login', async (req, res) => {
  const { staff_id, password } = req.body;

  try {
    const staff = await Staff.findOne({ where: { staff_id } });
    if (!staff) return res.status(400).json({ message: "Staff not found" });

    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

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
  const { email } = req.body;

  try {
    // Get latest login
    const latestLogin = await LoginAttempt.findOne({
      where: { email },
      order: [['createdAt', 'DESC']]
    });

    // Get first login
    const firstLogin = await LoginAttempt.findOne({
      where: { email },
      order: [['createdAt', 'ASC']]
    });

    // Get total login count
    const totalLogins = await LoginAttempt.count({ where: { email } });

    // If no logins at all, assume high inactivity risk
    if (!firstLogin) return res.json({ likelihood: 99 });

    // Calculate account age in days (based on first login)
    const accountAgeDays = Math.max(
      (Date.now() - new Date(firstLogin.createdAt)) / (1000 * 60 * 60 * 24),
      1 // prevent divide-by-zero
    );

    // Calculate average logins per day
    const loginsPerDay = totalLogins / accountAgeDays;

    // Simple inverse logic: fewer logins per day → higher inactivity likelihood
    let likelihood = 100 - Math.min(loginsPerDay * 100, 99); // cap at 99%

    // Round and ensure bounds
    likelihood = Math.max(1, Math.min(99, Math.round(likelihood)));

    res.json({ likelihood });
  } catch (err) {
    console.error("❌ Failed to compute likelihood:", err.message);
    res.status(500).json({ message: "Failed to calculate inactivity likelihood" });
  }
});




// GET /staff/security-logs
router.get("/security-logs", async (req, res) => {
  try {
    const logs = await LoginAttempt.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const logsWithGeo = await Promise.all(logs.map(async log => {
      try {
        const geoRes = await axios.get(`https://ipapi.co/${log.ip}/json/`);
        return {
          ...log.dataValues,
          latitude: geoRes.data.latitude,
          longitude: geoRes.data.longitude
        };
      } catch {
        return {
          ...log.dataValues,
          latitude: null,
          longitude: null
        };
      }
    }));

    res.json(logsWithGeo);
  } catch (err) {
    console.error("❌ Failed to fetch security logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
