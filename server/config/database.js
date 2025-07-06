const { Sequelize } = require('sequelize');

// Set your MySQL credentials here
const sequelize = new Sequelize('learning', 'learning', 'mysql', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
