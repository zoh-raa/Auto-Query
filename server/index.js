const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// Load Routes
const customerRoute = require('./routes/customer');
const fileRoute = require('./routes/file');
const reviewRoute = require('./routes/review'); // ✅ New line
const staffRoute = require('./routes/staff');

app.use("/customer", customerRoute);
app.use("/file", fileRoute);
app.use("/review", reviewRoute); // ✅ New line
app.use("/staff", staffRoute);



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
