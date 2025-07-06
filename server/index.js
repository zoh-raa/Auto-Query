const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL // or use "*" for public access during development
}));

// Simple Route
app.get("/", (req, res) => {
    res.send("Is Running");
});

// Load Routes
const tutorialRoute = require('./routes/tutorial');
const userRoute = require('./routes/user');
const fileRoute = require('./routes/file');
const reviewRoute = require('./routes/review.route'); // ✅ New line

app.use("/tutorial", tutorialRoute);
app.use("/user", userRoute);
app.use("/file", fileRoute);
app.use("/review", reviewRoute); // ✅ New line
app.use("/reviews", reviewRoute);



// Database sync & server start
const db = require('./models');
db.sequelize.sync({ alter: true })
    .then(() => {
        let port = process.env.APP_PORT || 5000;
        app.listen(port, () => {
            console.log(`⚡ Server running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
