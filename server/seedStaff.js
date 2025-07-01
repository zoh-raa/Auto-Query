const bcrypt = require('bcrypt');
const { Staff } = require('./models'); // adjust path if needed
const db = require('./models');

(async () => {
  try {
    await db.sequelize.authenticate(); // ensure DB connection

    const hashedPassword = await bcrypt.hash('ilovecars82', 10); // your desired password

    const [staff, created] = await Staff.findOrCreate({
      where: { email: 'teststaff@amsmotors.com' },
      defaults: {
        name: 'Test Staff',
        password: hashedPassword
      }
    });

    console.log(created ? '✅ Staff seeded!' : 'ℹ️ Staff already exists.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed staff:', err);
    process.exit(1);
  }
})();
