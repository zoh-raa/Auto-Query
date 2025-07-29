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
// ✅ Claude-based anomaly scoring
const classifyAnomaly = require('../utils/anomalyClassifier'); // at top of file


router.get('/login-history/:id', async (req, res) => {
  console.log("🎯 Hit /api/customer/login-history/:id route", req.params.id); // ✅ add this

  const { id } = req.params;

  try {
    const customer = await Customer.findByPk(id, {
      attributes: ['id', 'email', 'login_count']
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const logins = await LoginAttempt.findAll({
      where: { email: customer.email },
      // ✅ Correct
      attributes: ['createdAt']

    });

    const monthlyCounts = Array(12).fill(0);
      logins.forEach(({ createdAt }) => {
      const month = new Date(createdAt).getMonth();
      monthlyCounts[month]++;
  });


    const start_month_index = monthlyCounts.findIndex(count => count > 0);

    res.json({
      login_count: customer.login_count,
      monthly_logins: monthlyCounts,
      start_month_index: start_month_index === -1 ? 0 : start_month_index
    });

  } catch (err) {
    console.error('Login history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // ✅ Check if email already exists in Customer table
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new customer
    const newCustomer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      login_count: 0,
      address: ""
    });

    res.status(201).json({ message: `Email ${newCustomer.email} was registered successfully.` });

  } catch (err) {
    console.error("❌ Customer registration error:", err);
    res.status(500).json({ message: "Server error during customer registration" });
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

   const previousLogin = await LoginAttempt.findOne({
      where: { email: customer.email },
      order: [['createdAt', 'DESC']]
    });

    const sameDevice = previousLogin?.device === device;
    const sameIP = previousLogin?.ip === ip;
    const sameLocation = previousLogin?.location === location;

    const anomaly_score = await classifyAnomaly({ sameDevice, sameIP, sameLocation });

    // ✅ Save login with AI score
    await LoginAttempt.create({
      email: customer.email,
      ip,
      location,
      device,
      anomaly_score
    });

    const userInfo = {
    id: customer.id,
    email: customer.email,
    name: customer.name
  };



    // ✅ Continue login flow
   const accessToken = sign(
  { id: customer.id, role: 'customer' }, // ✅ Add role here
  process.env.APP_SECRET,
  { expiresIn: process.env.TOKEN_EXPIRES_IN }
);

    res.json({ accessToken, user: userInfo });
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ errors: err.errors || [err.message] });
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
