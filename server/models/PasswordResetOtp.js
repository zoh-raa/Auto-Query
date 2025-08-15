module.exports = (sequelize, DataTypes) => {
  const PasswordResetOtp = sequelize.define('PasswordResetOtp', {
    email: { type: DataTypes.STRING, allowNull: false },
    otp_hash: { type: DataTypes.STRING, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    used: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
  return PasswordResetOtp;
};
