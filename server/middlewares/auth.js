const { verify } = require("jsonwebtoken");

function validateToken(req, res, next) {
  const accessToken = req.headers["authorization"];
  if (!accessToken)
    return res.status(401).json({ message: "User not logged in." });

  try {
    const validToken = verify(accessToken, process.env.APP_SECRET);
    req.user = validToken;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
}

module.exports = { validateToken };
