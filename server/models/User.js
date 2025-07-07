module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    company: DataTypes.STRING,
    role: DataTypes.STRING,
  });

  return User;
};// Export a function that defines the User model, receiving Sequelize instance and DataTypes
module.exports = (sequelize, DataTypes) => {
  
  // Define the 'User' model with its schema/fields
  const User = sequelize.define('User', {
    // User's first name; required string, cannot be null
    firstName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    // User's last name; required string, cannot be null
    lastName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    // User's phone number; required string, cannot be null
    phone: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    // User's email; required string, must be unique to prevent duplicates
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    // Optional company name for the user
    company: DataTypes.STRING,
    // Optional role of the user (e.g., admin, customer)
    role: DataTypes.STRING,
  });

  // Return the defined User model for use elsewhere
  return User;
};

