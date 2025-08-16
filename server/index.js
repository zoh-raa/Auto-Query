// index.js (Backend entry point)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Enable CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3003'], // Allow both common ports
    credentials: true
}));

// API routes


// Simple Route
app.get("/", (req, res) => {
  res.send("Is Running");
});

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('../client/images')); // Serve client images

// Load Routes
const customerRoute = require('./routes/customer');
const fileRoute = require('./routes/file');
const reviewRoute = require('./routes/review.route'); // use full CRUD route
const staffRoute = require('./routes/staff');
const staffProductsRoute = require('./routes/products');
const rfqRoute = require('./routes/rfq');
const cartRoutes = require('./routes/cart');
const productRoute = require('./routes/product.route'); // use the correct product route with search
const deliveryRoute = require('./routes/delivery');

const aiRecommendRoute = require('./routes/aiRecommend');
const chatbotRoute = require('./routes/chatbot');

// Register routes
app.use('/customer', customerRoute);
app.use('/file', fileRoute);
app.use('/review', reviewRoute);
app.use('/staff', staffRoute);
app.use('/staff/products', staffProductsRoute);
app.use('/rfq', rfqRoute);
app.use('/cart', cartRoutes);
app.use('/product', productRoute);

app.use('/ai', aiRecommendRoute);
app.use('/api/chatbot', chatbotRoute);
app.use('/api/delivery', deliveryRoute);

// Database sync & server start
const db = require('./models');
const { Customer, Review, Product, LoginAttempt, Staff, Cart, RFQ, RFQItem, Delivery, DeliveryProduct, PasswordResetOtp } = db;

(async () => {
  try {
    await Customer.sync({ alter: true });
    await Review.sync({ alter: true });
    await LoginAttempt.sync({ alter: true });
    await Staff.sync({ alter: true });
    await Cart.sync({ alter: true });
    await Product.sync({ alter: true });
    await RFQ.sync({ alter: true });
    await RFQItem.sync({ alter: true });
    await Delivery.sync({ alter: true });
    await DeliveryProduct.sync({ alter: true });
    await PasswordResetOtp.sync({ alter: true });

    const port = process.env.APP_PORT || 3001;
    app.listen(port, () => {
      console.log(`⚡ Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.log("❌ Error during model sync:", err);
  }
})();
