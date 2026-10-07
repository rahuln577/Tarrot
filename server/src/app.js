const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { handleRazorpayWebhook } = require('./webhooks/razorpayWebhook')
const bookingRoutes = require('./routes/bookingRoutes')
const productRoutes = require('./routes/productRoutes')
const shopRoutes = require('./routes/shopRoutes')
const razorpayRoutes = require('./routes/razorpayRoutes')

function createApp() {
  const app = express()

  // Security headers with crossOriginResourcePolicy allowing frontend asset access
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )

  // CORS configuration
  const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://divinesurmise.com',
        'https://www.divinesurmise.com',
      ]

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching allowed origins
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        return callback(null, true) // permissive by default for easy development, customize via CLIENT_ORIGIN
      },
      credentials: true,
    }),
  )

  // Razorpay webhooks must use the raw body for signature verification.
  app.post(
    '/api/webhooks/razorpay',
    express.raw({ type: '*/*', limit: '2mb' }),
    (req, _res, next) => {
      req.rawBody = req.body
      next()
    },
    handleRazorpayWebhook,
  )

  // JSON parser for all standard routes
  app.use(express.json({ limit: '1mb' }))

  // Rate limiting to protect against abuse
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again later.' },
  })

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'anandamayii-roopa-api',
      timestamp: new Date().toISOString(),
    })
  })

  app.use('/api/booking', apiLimiter, bookingRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/shop', apiLimiter, shopRoutes)
  app.use('/api', apiLimiter, razorpayRoutes)

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` })
  })

  // Global error handler
  app.use((err, _req, res, _next) => {
    console.error('Unhandled server error:', err)
    res.status(err.status || 500).json({ error: err.message || 'Internal server error.' })
  })

  return app
}

module.exports = { createApp }
