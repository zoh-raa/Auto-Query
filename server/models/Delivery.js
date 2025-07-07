// Export a function defining the Delivery model, taking Sequelize instance and DataTypes
module.exports = (sequelize, DataTypes) => {
  // Define the Delivery model schema with fields and data types
  const Delivery = sequelize.define('Delivery', {
    // Foreign key referencing the User who created/owns the delivery (required)
    userId: { type: DataTypes.INTEGER, allowNull: false },

    // RFQ (Request for Quote) identifier (required)
    rfqId: { type: DataTypes.STRING, allowNull: false },

    // Purchase Order number (required)
    poNumber: { type: DataTypes.STRING, allowNull: false },

    // Delivery service provider name (required)
    deliveryProvider: { type: DataTypes.STRING, allowNull: false },

    // Person assigned to handle the delivery (optional)
    assignedTo: DataTypes.STRING,

    // Scheduled delivery date (optional)
    deliveryDate: DataTypes.DATE,

    // Due date for the delivery (optional)
    dueDate: DataTypes.DATE,

    // Delivery location/address (required)
    location: { type: DataTypes.STRING, allowNull: false },

    // Delivery type, e.g. 'Private' or 'Public' (required)
    type: { type: DataTypes.STRING, allowNull: false },

    // Optional detailed description or notes about the delivery
    description: DataTypes.TEXT,

    // Status of the delivery with default value 'pending'
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
  });

  // Define associations with other models
  Delivery.associate = (models) => {
    // Delivery belongs to a User via foreign key 'userId'
    Delivery.belongsTo(models.User, { foreignKey: 'userId' });

    // Delivery has many Product records linked by 'deliveryId' foreign key
    Delivery.hasMany(models.Product, { foreignKey: 'deliveryId' });
  };

  // Return the defined model
  return Delivery;
};
