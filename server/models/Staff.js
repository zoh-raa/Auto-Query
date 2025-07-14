module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define("Staff", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    staff_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "admin"
    }
  }, {
    tableName: 'staff', // ensure it maps to your manually created table
    timestamps: false   // set to true if your table has createdAt/updatedAt
  });

  return Staff;
};
