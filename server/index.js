const express = require('express');
const cors = require('cors');
const path = require('path'); // Add this missing import
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL
}));

// Root route (fixes "Cannot GET /")
app.get("/", (req, res) => {
    res.send(`
        <h1>Auto-Query Server</h1>
        <p>Server is running successfully!</p>
        <ul>
            <li><a href="/parts">Parts Management</a></li>
            <li><a href="/tutorial">Tutorial</a></li>
            <li><a href="/user">User</a></li>
            <li><a href="/file">File</a></li>
        </ul>
    `);
});

// Parts route (fixed)
app.get("/parts", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'parts.html'));
});

// Routes
const tutorialRoute = require('./routes/tutorial');
app.use("/tutorial", tutorialRoute);
const userRoute = require('./routes/user');
app.use("/user", userRoute);
const fileRoute = require('./routes/file');
app.use("/file", fileRoute);

const db = require('./models');
db.sequelize.sync({ alter: true })
    .then(() => {
        let port = process.env.APP_PORT || 3000; // Add default port
        app.listen(port, () => {
            console.log(`⚡ Server running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });