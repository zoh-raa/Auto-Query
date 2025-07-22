'use strict';

// Export a function that defines the Product model, receiving the Sequelize instance and DataTypes
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    deliveryId: { type: DataTypes.INTEGER, allowNull: false },
    item: { type: DataTypes.STRING, allowNull: false },
    quantity: DataTypes.INTEGER,
    targetPrice: DataTypes.FLOAT,
    spec: DataTypes.STRING,
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Delivery, { foreignKey: 'deliveryId' });
  };

  return Product;
};
