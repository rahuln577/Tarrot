const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { handleRazorpayWebhook } = require('./webhooks/razorpayWebhook')
const bookingRoutes = require('./routes/bookingRoutes')
const productRoutes = require('./routes/productRoutes')
const shopRoutes = require('./routes/shopRoutes')

function createApp() {
  const app = express()

  app.use(cors())

  // Razorpay webhooks must use the raw body for signature verification.
  app.post(
    '/api/webhooks/razorpay',
    bodyParser.raw({ type: 'application/json' }),
    handleRazorpayWebhook,
  )

  app.use(express.json())

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  app.use('/api/booking', bookingRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/shop', shopRoutes)

  return app
}

module.exports = { createApp }

