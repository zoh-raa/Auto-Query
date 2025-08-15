// utils/mailer.js
const sgMail = require('@sendgrid/mail');

// Set your API key from env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMail({ to, subject, html, text }) {
  try {
    const msg = {
      to,
      from: process.env.MAIL_FROM || process.env.GMAIL_USER, // verified sender
      subject,
      text,
      html
    };

    await sgMail.send(msg);
    console.log('[mailer] Email sent via SendGrid API');
    return { ok: true };
  } catch (err) {
    console.error('[mailer] SendGrid API error:', err.response?.body || err.message);
    throw err;
  }
}

module.exports = { sendMail };
