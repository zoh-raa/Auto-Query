module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define("Cart", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    items: {
      type: DataTypes.JSON,  // Store cart items as JSON array
      allowNull: false,
      defaultValue: []
    }
  });

  Cart.associate = (models) => {
    Cart.belongsTo(models.Customer, { foreignKey: 'userId' });
  };

  return Cart;
};
