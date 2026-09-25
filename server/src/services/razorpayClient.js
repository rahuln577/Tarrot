const crypto = require('crypto')
const Razorpay = require('razorpay')
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('../config/env')

const MIN_AMOUNT_PAISE = 100

function getRazorpayClient() {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const err = new Error('Razorpay env vars missing on server.')
    err.statusCode = 500
    throw err
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  })
}

function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  if (!RAZORPAY_KEY_SECRET) return false
  const payload = `${orderId}|${paymentId}`
  const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(payload).digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(String(signature || ''), 'utf8')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

function mapRazorpayError(err) {
  const status = Number(err?.statusCode || err?.status)
  const description = err?.error?.description || err?.message || 'Razorpay API error.'
  if (status === 401) {
    return { statusCode: 401, error: 'Razorpay authentication failed.' }
  }
  if (status >= 400 && status < 500) {
    return { statusCode: status, error: description }
  }
  return { statusCode: 500, error: description }
}

module.exports = {
  MIN_AMOUNT_PAISE,
  getRazorpayClient,
  verifyCheckoutSignature,
  mapRazorpayError,
  RAZORPAY_KEY_ID,
}
