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
const productRoute = require('./routes/product.route');
app.use('/product', productRoute);

// Simple Route
app.get("/", (req, res) => {
    res.send("Is Running");
});

// for displaying parts
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('../client/images')); // Serve client images

// Load Routes
const customerRoute = require('./routes/customer');
const fileRoute = require('./routes/file');
const staffRoute = require('./routes/staff');
const rfqRoute = require('./routes/rfq');
const cartRoutes = require('./routes/cart');
const reviewRoute = require('./routes/review.route');



app.use('/rfq', rfqRoute); // ✅ This makes POST /rfq available
app.use("/customer", customerRoute);
app.use("/file", fileRoute);
app.use("/staff", staffRoute);
app.use('/cart', cartRoutes);
app.use('/reviews', reviewRoute);




// Database sync & server start
const db = require('./models');
const { Customer, Review, LoginAttempt, Staff, Cart, Product, RFQ, RFQItem, PasswordResetOtp } = db; // ⬅️ only sync these (skip Staff)

(async () => {
  try {
    await Customer.sync({ alter: true });
    await Review.sync({ alter: true }); // optional: only if your Review model changed
    await LoginAttempt.sync({ alter: true }); // ✅ add this line
    await Staff.sync({ alter: true });
    await Cart.sync({ alter: true });
    await Product.sync({ alter: true });
    await RFQ.sync({ alter: true });
    await RFQItem.sync({ alter: true });
    await PasswordResetOtp.sync({ alter: true });

    const port = process.env.APP_PORT || 5000;
    app.listen(port, () => {
      console.log(`⚡ Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.log("❌ Error during model sync:", err);
  }
})();

    

