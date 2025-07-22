'use strict';

// Export a function defining the Delivery model, taking Sequelize instance and DataTypes
module.exports = (sequelize, DataTypes) => {
  const Delivery = sequelize.define('Delivery', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    rfqId: { type: DataTypes.STRING, allowNull: false },
    poNumber: { type: DataTypes.STRING, allowNull: false },
    deliveryProvider: { type: DataTypes.STRING, allowNull: false },
    assignedTo: DataTypes.STRING,
    deliveryDate: DataTypes.DATE,
    dueDate: DataTypes.DATE,
    location: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
  });

  Delivery.associate = (models) => {
    Delivery.belongsTo(models.User, { foreignKey: 'userId' });
    Delivery.hasMany(models.Product, { foreignKey: 'deliveryId', onDelete: 'CASCADE' });
  };

  return Delivery;
};
