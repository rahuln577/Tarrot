require('dotenv').config()

function get(name) {
  return process.env[name]
}

const PORT = Number(process.env.PORT || 5000)

const env = {
  PORT,
  MONGODB_URI: get('MONGODB_URI'),

  RAZORPAY_KEY_ID: get('RAZORPAY_KEY_ID'),
  RAZORPAY_SECRET: get('RAZORPAY_SECRET'),
  RAZORPAY_WEBHOOK_SECRET: get('RAZORPAY_WEBHOOK_SECRET'),

  GOOGLE_CLIENT_EMAIL: get('GOOGLE_CLIENT_EMAIL'),
  GOOGLE_PRIVATE_KEY: get('GOOGLE_PRIVATE_KEY'),
  GOOGLE_CALENDAR_ID: get('GOOGLE_CALENDAR_ID'),
  GOOGLE_OWNER_EMAIL: get('GOOGLE_OWNER_EMAIL'),

  SMTP_HOST: get('SMTP_HOST'),
  SMTP_PORT: get('SMTP_PORT') ? Number(get('SMTP_PORT')) : undefined,
  SMTP_USER: get('SMTP_USER'),
  SMTP_PASS: get('SMTP_PASS'),
  EMAIL_FROM: get('EMAIL_FROM'),
}

module.exports = env

// Named exports for convenience
module.exports.PORT = PORT
module.exports.MONGODB_URI = env.MONGODB_URI

