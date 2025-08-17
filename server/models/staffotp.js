// models/staffotp.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('staffotp', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    staffId: { type: DataTypes.INTEGER, allowNull: false },
    purpose: { type: DataTypes.ENUM('reset_password','reveal_staff_id'), allowNull: false },
    codeHash: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    usedAt: { type: DataTypes.DATE, allowNull: true },
  }, { tableName: 'staffotp', timestamps: true });
};
