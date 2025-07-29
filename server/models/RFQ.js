module.exports = (sequelize, DataTypes) => {
  const RFQ = sequelize.define("RFQ", {
    rfq_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Pending'
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  RFQ.associate = (models) => {
    RFQ.belongsTo(models.Customer, { foreignKey: 'customerId' });
    RFQ.hasMany(models.RFQItem, { foreignKey: 'rfqId' });
  };

  return RFQ;
};
