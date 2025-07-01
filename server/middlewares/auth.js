const { verify } = require('jsonwebtoken');
require('dotenv').config();

const validateToken = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.sendStatus(401); // No Authorization header at all
    }

    const accessToken = authHeader.split(" ")[1]; // Bearer <token>
    if (!accessToken) {
      return res.sendStatus(401); // Malformed header
    }

    const payload = verify(accessToken, process.env.APP_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.sendStatus(403); // Forbidden: token invalid
  }
};

module.exports = { validateToken };
