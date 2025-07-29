const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mydb', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL, // 'http://localhost:3000'
    credentials: true // ✅ allow credentials
}));

// Simple Route
app.get("/", (req, res) => {
    res.send("Is Running");
});

// for displaying parts
app.use('/uploads', express.static('uploads'));

// Load Routes
const customerRoute = require('./routes/customer');
const fileRoute = require('./routes/file');
const reviewRoute = require('./routes/review'); // ✅ New line
const staffRoute = require('./routes/staff');
const rfqRoute = require('./routes/rfq');
const cartRoutes = require('./routes/cart');
const productRoute = require('./routes/products'); // im gonna crashout if upload dont work

app.use("/customer", customerRoute);
app.use("/file", fileRoute);
app.use("/review", reviewRoute); // ✅ New line
app.use("/staff", staffRoute);
app.use("/staff/products", productRoute);


// Database sync & server start
const db = require('./models');
const { Customer, Review, LoginAttempt, Staff } = db; // ⬅️ only sync these (skip Staff)

(async () => {
  try {
    await Customer.sync({ alter: true });
    await Review.sync({ alter: true }); // optional: only if your Review model changed
    await LoginAttempt.sync({ alter: true }); // ✅ add this line
    await Staff.sync({ alter: true });

    const port = process.env.APP_PORT || 3001;
    app.listen(port, () => {
      console.log(`⚡ Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.log("❌ Error during model sync:", err);
  }
})();

    
const staffRoutes = require('./routes/staff');    
app.use('/staff', staffRoutes);