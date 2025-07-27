const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Customer } = require('../models');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/auth');
require('dotenv').config();
const { LoginAttempt } = require('../models');
const axios = require('axios'); // if not already

// POST /customer/register
router.post("/register", async (req, res) => {
  let data = req.body;

  const validationSchema = yup.object({
    name: yup.string().trim().min(3).max(50).required()
      .matches(/^[a-zA-Z '-,.]+$/, "Name only allows letters, spaces and characters: ' - , ."),
    email: yup.string().trim().lowercase().email().max(50).required(),
    password: yup.string().trim().min(8).max(50).required()
      .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "Password must contain at least 1 letter and 1 number")
  });

  try {
    data = await validationSchema.validate(data, { abortEarly: false });

    const existing = await Customer.findOne({ where: { email: data.email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists." });
    }

    data.password = await bcrypt.hash(data.password, 10);
    data.address = "";
    data.login_count = 0;

    const result = await Customer.create(data);
    res.json({ message: `Email ${result.email} was registered successfully.` });
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

router.post("/login", async (req, res) => {
  let data = req.body;

  const validationSchema = yup.object({
    email: yup.string().trim().lowercase().email().max(50).required(),
    password: yup.string().trim().min(8).max(50).required()
  });

  try {
    data = await validationSchema.validate(data, { abortEarly: false });

    const errorMsg = "Email or password is not correct.";
    const customer = await Customer.findOne({ where: { email: data.email } });

    if (!customer || !(await bcrypt.compare(data.password, customer.password))) {
      return res.status(400).json({ message: errorMsg });
    }

    await Customer.increment('login_count', { where: { id: customer.id } });

    let location = "Unknown";
    let ip = "Unknown";
    try {
      const geoRes = await axios.get("https://ipapi.co/json/");
      ip = geoRes.data.ip;
      location = `${geoRes.data.city}, ${geoRes.data.region}, ${geoRes.data.country_name}`;
    } catch (geoErr) {
      console.warn("🌐 IPAPI lookup failed:", geoErr.message);
    }
    const device = req.headers['user-agent'] || "Unknown";

    await LoginAttempt.create({
      email: customer.email,
      ip,
      location,
      device,
      anomaly_score: "Low"
    });


    // ✅ Continue login flow
    const userInfo = {
      id: customer.id,
      email: customer.email,
      name: customer.name
    };

    const accessToken = sign(userInfo, process.env.APP_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRES_IN
    });

    res.json({ accessToken, user: userInfo });
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ errors: err.errors || [err.message] });
  }
});

router.get('/login-history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Step 1: Get customer record (from Customer table)
    const customer = await Customer.findByPk(id, {
      attributes: ['id', 'email', 'login_count']
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Step 2: Get login attempts (from LoginAttempt table) using email
    const logins = await LoginAttempt.findAll({
      where: { email: customer.email },
      attributes: ['timestamp']
    });

    // Step 3: Count logins by month
    const monthlyCounts = Array(12).fill(0);
    logins.forEach(({ timestamp }) => {
      const month = new Date(timestamp).getMonth(); // 0 = Jan
      monthlyCounts[month]++;
    });

    // Step 4: Respond with both login_count and monthly login history
    res.json({
      login_count: customer.login_count,
      monthly_logins: monthlyCounts
    });
  } catch (err) {
    console.error('Login history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



// ✅ Add this route for /customer/auth
router.get("/auth", validateToken, (req, res) => {
  console.log("✅ /customer/auth called:", req.user);
  Customer.findByPk(req.user.id)
  .then((customer) => {
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ user: customer });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  });

});

// PATCH /customer/:id (secure)
router.patch("/:id", validateToken, async (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden: Not your profile." });
  }

  try {
    const { name, phone, address } = req.body;
const [updated] = await Customer.update(
  { name, phone, address },
  { where: { id: req.params.id } }
);


    if (updated) {
      res.json({ message: "Customer updated successfully." });
    } else {
      res.status(404).json({ message: "Customer not found." });
    }
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({ errors: err.errors || [err.message] });
  }
});

module.exports = router;
