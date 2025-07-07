// Export a function that defines the Product model, receiving the Sequelize instance and DataTypes
module.exports = (sequelize, DataTypes) => {
  
  // Define the 'Product' model with its schema/fields
  const Product = sequelize.define('Product', {
    // Foreign key to link product to a delivery; cannot be null
    deliveryId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    // Name of the product item; required string
    item: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    // Quantity of the product (optional integer)
    quantity: DataTypes.INTEGER,
    // Target price for the product (optional float number)
    targetPrice: DataTypes.FLOAT,
    // Specification details (optional string)
    spec: DataTypes.STRING,
  });

  // Define associations between models
  Product.associate = (models) => {
    // Each product belongs to one delivery, linked by deliveryId foreign key
    Product.belongsTo(models.Delivery, { foreignKey: 'deliveryId' });
  };

  // Return the defined model to be used elsewhere
  return Product;
};
