module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define("Staff", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    staff_id: {
      type: DataTypes.STRING,
      allowNull: true,       // let Sequelize generate it after create
      unique: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    // models/staff.js  (add this field)
    phone: { 
      type: DataTypes.STRING(20), 
      allowNull: false, 
      unique: true }, // E.164 e.g. +15551234567

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("admin", "moderator", "viewer"),
      defaultValue: "admin"
    }
  }, {
    tableName: 'staff',
    timestamps: false
  });

  // Auto-generate staff_id after row is created
  Staff.addHook('afterCreate', async (staff, options) => {
    try {
      const seq = 100 + staff.id; // 101 for first staff
      const yy = new Date().getFullYear().toString().slice(-2); // e.g. "25"
      const genId = `AMS${yy}S${seq}`;
      await staff.update({ staff_id: genId }, { transaction: options?.transaction });
    } catch (e) {
      console.error('❌ Failed to generate staff_id:', e);
    }
  });

  return Staff;
};
