module.exports = (sequelize, DataTypes) => {
  const LoginAttempt = sequelize.define("LoginAttempt", {
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING
    },
    device: {
      type: DataTypes.STRING
    },
    anomaly_score: {
      type: DataTypes.STRING // e.g., 'Low', 'Medium', 'High'
    }
  });

  return LoginAttempt;
};
