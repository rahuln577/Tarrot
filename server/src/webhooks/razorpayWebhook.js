const { RAZORPAY_WEBHOOK_SECRET } = require('../config/env')
const { confirmPaymentByOrderId } = require('../services/paymentConfirmation')
const crypto = require('crypto')

function verifyRazorpaySignature({ rawBodyBuffer, signatureHeader, secret }) {
  if (!signatureHeader || !secret || !rawBodyBuffer) return false
  try {
    const expected = crypto.createHmac('sha256', secret).update(rawBodyBuffer).digest('hex')

    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(String(signatureHeader), 'utf8')
    if (a.length !== b.length) return false

    return crypto.timingSafeEqual(a, b)
  } catch (err) {
    console.error('Signature verification error:', err)
    return false
  }
}

async function handleRazorpayWebhook(req, res) {
  try {
    const signatureHeader = req.headers['x-razorpay-signature']

    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured on the server.')
      return res.status(500).json({ error: 'Webhook secret not configured on server.' })
    }

    let rawBodyBuffer = req.rawBody || req.body
    if (typeof rawBodyBuffer === 'string') {
      rawBodyBuffer = Buffer.from(rawBodyBuffer, 'utf8')
    } else if (!Buffer.isBuffer(rawBodyBuffer) && typeof rawBodyBuffer === 'object') {
      rawBodyBuffer = Buffer.from(JSON.stringify(rawBodyBuffer), 'utf8')
    }

    if (!rawBodyBuffer || !Buffer.isBuffer(rawBodyBuffer)) {
      return res.status(400).json({ error: 'Webhook body must be raw JSON buffer or string.' })
    }

    const verified = verifyRazorpaySignature({
      rawBodyBuffer,
      signatureHeader,
      secret: RAZORPAY_WEBHOOK_SECRET,
    })

    if (!verified) {
      console.warn('Invalid Razorpay webhook signature received.')
      return res.status(400).json({ error: 'Invalid Razorpay signature.' })
    }

    let event
    try {
      event = JSON.parse(rawBodyBuffer.toString('utf8'))
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload in webhook.' })
    }

    const eventName = event.event
    console.log(`Razorpay webhook received: ${eventName}`)

    let razorpayOrderId = null
    let razorpayPaymentId = null

    if (eventName === 'payment.captured') {
      const paymentEntity = event?.payload?.payment?.entity
      razorpayOrderId = paymentEntity?.order_id
      razorpayPaymentId = paymentEntity?.id
    } else if (eventName === 'order.paid') {
      const orderEntity = event?.payload?.order?.entity
      razorpayOrderId = orderEntity?.id
      razorpayPaymentId = event?.payload?.payment?.entity?.id || null
    } else {
      // Acknowledge other webhook events without error
      return res.json({ ok: true, ignored: eventName })
    }

    if (!razorpayOrderId) {
      return res.status(400).json({ error: 'Missing razorpay order id in webhook payload.' })
    }

    const result = await confirmPaymentByOrderId({ razorpayOrderId, razorpayPaymentId })
    return res.json({ ok: true, result })
  } catch (err) {
    console.error('handleRazorpayWebhook error:', err)
    return res.status(500).json({ error: 'Webhook handling failed.' })
  }
}

module.exports = { handleRazorpayWebhook }
