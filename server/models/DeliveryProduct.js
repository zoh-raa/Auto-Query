module.exports = (sequelize, DataTypes) => {
  const DeliveryProduct = sequelize.define("DeliveryProduct", {
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    item: { type: DataTypes.STRING, allowNull: false },
    remarks: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: "delivery_products"
  });

  DeliveryProduct.associate = (models) => {
    DeliveryProduct.belongsTo(models.Delivery, { foreignKey: 'deliveryId' });
  };

  return DeliveryProduct;
};
