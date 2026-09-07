const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendResetEmail(to, resetLink) {
  await transporter.sendMail({
    from: `"Spendly" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your Spendly password',
    html: `
      <p>You requested a password reset for your Spendly account.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });
}

module.exports = sendResetEmail;