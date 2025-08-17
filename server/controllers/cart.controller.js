// cart.controller.js - Cart CRUD (no AI)
const db = require('../models');
const Cart = db.Cart;
const Product = db.Product;

// --- Get Cart ---
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.json({ items: [] });

    const parsedCart = {
      ...cart.toJSON(),
      items: Array.isArray(cart.items) ? cart.items : JSON.parse(cart.items)
    };

    // Enrich items with product info
    const enrichedItems = await Promise.all(
      parsedCart.items.map(async (item) => {
        const product = await Product.findOne({ where: { productId: item.productId } });
        return {
          ...item,
          name: product?.productName || "Unknown Product",
          price: product?.price || 0,
          image: product?.imageUrl ? `/uploads/${product.imageUrl}` : "/images/no-image.png",
        };
      })
    );

    res.json({
      ...parsedCart,
      items: enrichedItems,
    });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ error: err.message });
  }
};

// --- Save Cart ---
exports.saveCart = async (req, res) => {
  const { items } = req.body;

  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    const cartItems = Array.isArray(items) ? items : [];

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: cartItems });
    } else {
      cart.items = cartItems;
      await cart.save();
    }

    // Enrich items with product info
    const parsedCart = {
      ...cart.toJSON(),
      items: Array.isArray(cart.items) ? cart.items : JSON.parse(cart.items)
    };
    const enrichedItems = await Promise.all(
      parsedCart.items.map(async (item) => {
        const product = await Product.findOne({ where: { productId: item.productId } });
        return {
          ...item,
          name: product?.productName || "Unknown Product",
          price: product?.price || 0,
          image: product?.imageUrl ? `/uploads/${product.imageUrl}` : "/images/no-image.png",
        };
      })
    );

    res.json({
      cart: { ...parsedCart, items: enrichedItems },
      message: "Cart saved successfully"
    });

  } catch (err) {
    console.error("Save cart error:", err);
    res.status(500).json({
      error: err.message,
      message: "Failed to save cart"
    });
  }
};

// --- Clear Cart ---
exports.clearCart = async (req, res) => {
  try {
    await Cart.update({ items: [] }, { where: { userId: req.user.id } });
    res.json({ message: "Cart cleared successfully", items: [] });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: err.message });
  }
};
