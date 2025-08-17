// utils/sms.js
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendVerification(to) {
  try {
    const res = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to, channel: 'sms' });
    console.log('✅ sendVerification:', res.sid, res.status);
    return res;
  } catch (e) {
    console.error('❌ sendVerification error:', e.status, e.code, e.message);
    throw e;
  }
}

async function checkVerification(to, code) {
  try {
    const res = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to, code });
    console.log('✅ checkVerification:', res.sid, res.status);
    return res;
  } catch (e) {
    console.error('❌ checkVerification error:', e.status, e.code, e.message);
    throw e;
  }
}

module.exports = { sendVerification, checkVerification };
