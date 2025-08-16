module.exports = (sequelize, DataTypes) => {
  const Delivery = sequelize.define("Delivery", {
    rfqId: { type: DataTypes.INTEGER, allowNull: false },
    poNumber: { type: DataTypes.STRING, allowNull: false },
    assignedTo: { type: DataTypes.STRING, allowNull: true },
    deliveryDate: { type: DataTypes.DATEONLY, allowNull: true },
    timing: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    deliveryProvider: { type: DataTypes.STRING, allowNull: true },
 status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending',
  }
  }, {
    tableName: "deliveries"
  });

  Delivery.associate = models => {
    Delivery.belongsTo(models.Customer, { foreignKey: 'customerId' });
    Delivery.hasMany(models.DeliveryProduct, {
      foreignKey: 'deliveryId',
      as: 'products' // alias added
    });
  };

  return Delivery;
};
