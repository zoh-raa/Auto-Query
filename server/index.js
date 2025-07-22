const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'public' directory (for images, styles, etc.)
app.use(express.static('public'));

// Enable CORS (Cross-Origin Resource Sharing) for all origins
// Useful for allowing your frontend (even on different domain/port) to access the API
// WARNING: Allowing all origins can be insecure; restrict it for production use
app.use(cors());

// Alternative strict CORS usage (commented out):
// Uncomment and set CLIENT_URL in your .env to restrict allowed origins
// app.use(cors({ origin: process.env.CLIENT_URL }));

// Import route handlers and mount them on specific URL paths
const tutorialRoute = require('./routes/tutorial');
app.use("/tutorial", tutorialRoute);

const userRoute = require('./routes/user');
app.use("/user", userRoute);

const fileRoute = require('./routes/file');
app.use("/file", fileRoute);

const deliveryRoutes = require('./routes/delivery');
app.use('/api/delivery', deliveryRoutes);

const chatbotRoutes = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRoutes);

// Add this for RFQ API:
const rfqRoutes = require('./routes/rfq');
app.use('/api/rfq', rfqRoutes);

// Basic root route to verify server is running
app.get("/", (req, res) => {
  res.send("Welcome to the learning space.");
});

// Import Sequelize models and database instance
const db = require('./models');

// Get port number from environment variable or default to 3001
const port = process.env.APP_PORT || 3001;

// Sync Sequelize models with the database
// { alter: true } updates the tables to match models without dropping them
// Sync Sequelize models with the database
db.sequelize.sync({ force: true })
  .then(() => {
    // Start the Express server after successful database sync
    app.listen(port, () => {
      console.log(`⚡ Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // Log error if database sync or server startup fails
    console.log(err);
  });
