const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Customer, PasswordResetOtp} = require('../models');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/auth');
require('dotenv').config();
const { LoginAttempt } = require('../models');
const axios = require('axios'); // if not already
// ✅ Claude-based anomaly scoring
const classifyAnomaly = require('../utils/anomalyClassifier'); // at top of file
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailer');
const OTP_TTL_MIN = parseInt(process.env.RESET_OTP_TTL_MINUTES || '10', 10);
const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));



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

router.post('/google-login', async (req, res) => {
  const { name, email, googleId } = req.body;

  try {
    if (!name || !email || !googleId) {
      return res.status(400).json({ message: "Missing Google login data." });
    }

    let customer = await Customer.findOne({ where: { email } });

    if (!customer) {
      // First-time Google login → register
      customer = await Customer.create({
        name,
        email,
        password: googleId, // placeholder for now
        login_count: 1,
        address: ""
      });
    } else {
      // Returning user → update login count
      await Customer.increment('login_count', { where: { id: customer.id } });
    }

    // Optional: log Google login like regular login (no anomaly scoring for now)

     // write a LoginAttempt for Google sign in
    try {
      // extract client ip
      let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0].trim();
      if (ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];
      if (ip === '::1') ip = '127.0.0.1';

      // geo lookup
      let location = 'Localhost';
      if (ip && ip !== '127.0.0.1') {
        try {
          const geoRes = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 1500 });
          const city = geoRes.data.city || 'Unknown';
          const region = geoRes.data.region || 'Unknown';
          const country = geoRes.data.country_name || 'Unknown';
          location = `${city}, ${region}, ${country}`;
        } catch (e) {
          console.warn('Geo lookup failed:', e.message);
        }
      }

      const device = req.headers['user-agent'] || 'Unknown';

      const row = await LoginAttempt.create({
        email: customer.email,
        ip,
        location,
        device,
        anomaly_score: 0
      });
      console.log('Google LoginAttempt id:', row.id);
    } catch (e) {
      console.warn('Could not write Google LoginAttempt:', e.message);
    }

    const userInfo = { id: customer.id, email: customer.email, name: customer.name };

    const accessToken = sign(
      { id: customer.id, role: 'customer' },
      process.env.APP_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN }
    );

    return res.json({ accessToken, user: userInfo });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Internal server error' });
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

router.post('/google-register', async (req, res) => {
  const { name, email, googleId } = req.body;

  if (!name || !email || !googleId) {
    return res.status(400).json({ message: "Missing Google registration data." });
  }

  try {
    const existingCustomer = await Customer.findOne({ where: { email } });

    if (existingCustomer) {
      // ❌ Email already in DB → conflict
      return res.status(409).json({ message: "Email already registered. Please log in instead." });
    }

    const newCustomer = await Customer.create({
      name,
      email,
      password: googleId, // placeholder
      login_count: 1,
      address: ""
    });

    const accessToken = sign(
      { id: newCustomer.id, role: 'customer' },
      process.env.APP_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN }
    );

    const userInfo = {
      id: newCustomer.id,
      email: newCustomer.email,
      name: newCustomer.name
    };

    return res.status(201).json({ accessToken, user: userInfo });
  } catch (err) {
    console.error('❌ Google register error:', err);
    res.status(500).json({ message: 'Internal server error' });
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

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (ip.includes("::ffff:")) ip = ip.split("::ffff:")[1];
    if (ip === '::1' || ip === '127.0.0.1') ip = '127.0.0.1';

    let location = "Unknown";
    try {
      if (ip && ip !== '127.0.0.1') {
        const geoRes = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 1500 });
        location = `${geoRes.data.city || 'Unknown'}, ${geoRes.data.region || 'Unknown'}, ${geoRes.data.country_name || 'Unknown'}`;
      } else {
        location = 'Localhost';
      }
    } catch (e) {
      console.warn("IPAPI lookup failed:", e.message);
    }

    const device = req.headers['user-agent'] || "Unknown";

    let anomaly_score = 0;
    try {
      const previousLogin = await LoginAttempt.findOne({
        where: { email: customer.email },
        order: [['createdAt', 'DESC']]
      });
      const sameDevice = previousLogin?.device === device;
      const sameIP = previousLogin?.ip === ip;
      const sameLocation = previousLogin?.location === location;
      anomaly_score = await classifyAnomaly({ sameDevice, sameIP, sameLocation });
    } catch (e) {
      console.warn("Anomaly scoring failed:", e.message);
    }

    try {
      const row = await LoginAttempt.create({
        email: customer.email,
        ip,
        location,
        device,
        anomaly_score
      });
      console.log("LoginAttempt inserted id:", row.id);
    } catch (dbErr) {
      console.error("Failed to insert LoginAttempt:", dbErr);
      // continue, do not block user login
    }

    const userInfo = { id: customer.id, email: customer.email, name: customer.name };

    const accessToken = sign(
      { id: customer.id, role: 'customer' },
      process.env.APP_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN }
    );

    res.json({ accessToken, user: userInfo });
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ errors: err.errors || [err.message] });
  }
});


// Step 1. Request OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await Customer.findOne({ where: { email } });

    // Always respond 200 to avoid user enumeration
    if (user) {
      const otp = makeOtp();
      const otp_hash = await bcrypt.hash(otp, 10);
      const expires_at = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
      await PasswordResetOtp.create({ email, otp_hash, expires_at });

      // ✅ Console log for dev testing
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[PWD-RESET] OTP for ${email}: ${otp} (expires in ${OTP_TTL_MIN}m)`);
      }

      try {
        await sendMail({
          to: email,
          subject: 'Your AMS password reset code',
          text: `Your one time code is ${otp}. It expires in ${OTP_TTL_MIN} minutes.`,
          html: `<p>Your one time code is <b>${otp}</b>.</p><p>This code expires in ${OTP_TTL_MIN} minutes.</p>`
        });
      } catch (e) {
        console.warn('sendMail failed:', e.message);
      }
    }

    return res.json({ ok: true, message: 'If the email exists, an OTP has been sent.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});



/**
 * Step 2. Verify OTP returns short lived reset token
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const record = await PasswordResetOtp.findOne({
      where: { email, used: false },
      order: [['createdAt', 'DESC']]
    });
    if (!record) return res.status(400).json({ message: 'Invalid or expired code' });

    if (record.expires_at < new Date()) return res.status(400).json({ message: 'Code expired' });

    if (record.attempts >= 5) return res.status(429).json({ message: 'Too many attempts. Request a new code.' });

    const ok = await bcrypt.compare(otp, record.otp_hash);
    if (!ok) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: 'Incorrect code' });
    }

    // Sign a short reset token
    const resetToken = jwt.sign(
      { email, otpId: record.id, typ: 'pwdreset' },
      process.env.APP_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({ ok: true, resetToken });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Step 3. Reset password
 */
router.post('/reset-password', async (req, res) => {
  try {
    // Accept token from body.resetToken OR body.token OR query.token
    const resetToken = req.body?.resetToken || req.body?.token || req.query?.token;
    const { newPassword, confirmPassword } = req.body || {};

    if (!resetToken) return res.status(400).json({ message: 'Missing token' });
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.APP_SECRET); // must match the secret used when issuing
    } catch (err) {
      console.error('[RESET] JWT verify failed:', err.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // payload must contain email and otpId; ensure your "issue token" code sets these
    const { email, otpId } = payload || {};
    if (!email || !otpId) {
      console.error('[RESET] Token missing email or otpId', payload);
      return res.status(400).json({ message: 'Invalid reset request' });
    }

    const otpRec = await PasswordResetOtp.findByPk(otpId);
    if (!otpRec) return res.status(400).json({ message: 'Invalid reset request' });
    if (otpRec.used) return res.status(400).json({ message: 'Reset link already used' });
    if (otpRec.email !== email) return res.status(400).json({ message: 'Invalid reset request' });
    if (otpRec.expiresAt && new Date(otpRec.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Reset link expired' });
    }

    const user = await Customer.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid reset request' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    otpRec.used = true;
    await otpRec.save();

    const lockToken = jwt.sign({ email, typ: 'lock' }, process.env.APP_SECRET, { expiresIn: '2h' });
    const lockUrl = `${process.env.FRONTEND_BASE_URL}/lock-account?token=${lockToken}`;

    await sendMail({
      to: email,
      subject: 'Your password was changed',
      html: `
        <p>Your password was changed successfully.</p>
        <p>If this was not you, <a href="${lockUrl}">lock your account immediately</a>.</p>
      `
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error('[RESET] Server error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Optional. Lock account endpoint used by email link
 */
router.post('/lock-account', async (req, res) => {
  try {
    const { token } = req.body;
    const payload = jwt.verify(token, process.env.APP_SECRET);
    if (payload.typ !== 'lock') return res.status(400).json({ message: 'Bad token' });

    const user = await Customer.findOne({ where: { email: payload.email } });
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.is_locked = true; // add this field to Customer if you want
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: 'Invalid or expired token' });
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