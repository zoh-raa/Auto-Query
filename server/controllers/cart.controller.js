const db = require('../models');
const Cart = db.Cart;

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });

    if (!cart) {
      return res.json({ items: [] });
    }

    // Parse items from JSON string before sending to client
    const parsedCart = {
      ...cart.toJSON(),
      items: JSON.parse(cart.items),
    };

    res.json(parsedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveCart = async (req, res) => {
  const { items } = req.body; // Array of { productId, quantity, remarks }

  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: JSON.stringify(items), // Store as string
      });
    } else {
      cart.items = JSON.stringify(items); // Update as string
      await cart.save();
    }

    // Return the updated cart with items parsed back to object
    const parsedCart = {
      ...cart.toJSON(),
      items: JSON.parse(cart.items),
    };

    res.json(parsedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
