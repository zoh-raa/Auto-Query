const express = require('express');
const router = express.Router();
const { getCart, saveCart } = require('../controllers/cart.controller');
const { validateToken } = require('../middlewares/auth');

router.get("/", validateToken, getCart);
router.post("/", validateToken, saveCart);

module.exports = router;
