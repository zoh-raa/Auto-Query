// models/Product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    productNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Product;
};