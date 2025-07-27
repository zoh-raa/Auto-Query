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
db.sequelize.sync({ alter: true })
    .then(() => {
        let port = process.env.APP_PORT || 3001;
        app.listen(port, () => {
            console.log(`⚡ Server running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
    
const staffRoutes = require('./routes/staff');    
app.use('/staff', staffRoutes);