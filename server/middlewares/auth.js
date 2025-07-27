const { verify } = require("jsonwebtoken");

function validateToken(req, res, next) {
let accessToken = req.headers["authorization"];

if (!accessToken) {
return res.status(401).json({ message: "User not logged in." });
}


// ✅ Strip Bearer prefix if it exists
if (accessToken.startsWith("Bearer ")) {
accessToken = accessToken.slice(7);
}

try {
const validToken = verify(accessToken, process.env.APP_SECRET);
req.user = validToken;
next();
} catch (err) {
return res.status(401).json({ message: "Invalid token." });
}
}

module.exports = { validateToken };
