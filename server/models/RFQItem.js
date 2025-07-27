module.exports = (sequelize, DataTypes) => {
  const RFQItem = sequelize.define("RFQItem", {
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  RFQItem.associate = (models) => {
    RFQItem.belongsTo(models.RFQ, { foreignKey: 'rfqId' });
  };

  return RFQItem;
};
