'use strict';

// Import core Node.js modules for filesystem and path handling
const fs = require('fs');
const path = require('path');

// Import Sequelize ORM library
const Sequelize = require('sequelize');

// Load environment variables from a .env file into process.env
require('dotenv').config();

// Get the basename of this file (e.g., 'index.js') for filtering later
const basename = path.basename(__filename);

// Object to hold all loaded models
const db = {};

// Initialize Sequelize instance with DB credentials and config from environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Database name
  process.env.DB_USER,     // DB username
  process.env.DB_PWD,      // DB password
  {
    host: process.env.DB_HOST,  // DB host address
    port: process.env.DB_PORT,  // DB port number
    dialect: 'mysql',            // Specify MySQL dialect
    logging: false,              // Disable SQL logging to console
    timezone: '+08:00'           // Set timezone (e.g., Singapore timezone)
  }
);

// Read all files in the current directory (usually 'models' folder)
fs
  .readdirSync(__dirname)
  // Filter files: skip hidden files, skip this file itself, only .js files
  .filter(file =>
    file.indexOf('.') !== 0 &&    // exclude hidden files
    file !== basename &&           // exclude this file itself (index.js)
    file.slice(-3) === '.js'       // only JS files
  )
  // For each model file, import it and initialize with sequelize instance and DataTypes
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model; // Store the model by its name
  });

// After all models are imported, check if they have associations defined
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    // Call the associate method, passing all models, so associations can be setup
    db[modelName].associate(db);
  }
});

// Export the Sequelize instance and all loaded models
db.sequelize = sequelize;  // Sequelize connection instance
db.Sequelize = Sequelize;  // Sequelize library for reference

module.exports = db;
