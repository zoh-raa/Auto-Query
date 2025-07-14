module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define("Customer", {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    login_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: "customers"
  });


  return Customer;
};
