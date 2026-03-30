const nodemailer = require('nodemailer')
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = require('../config/env')

async function sendEmails({ toEmails, subject, bodyText }) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP env vars missing.')
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })

  const mailOptions = {
    from: EMAIL_FROM || SMTP_USER,
    to: toEmails.join(','),
    subject,
    text: bodyText,
  }

  await transporter.sendMail(mailOptions)
}

async function sendMeetEmails({ toEmails, subject, bodyText }) {
  return sendEmails({ toEmails, subject, bodyText })
}

async function sendSimpleEmails({ toEmails, subject, bodyText }) {
  return sendEmails({ toEmails, subject, bodyText })
}

module.exports = { sendMeetEmails, sendSimpleEmails }

