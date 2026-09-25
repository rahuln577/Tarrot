const { RAZORPAY_WEBHOOK_SECRET } = require('../config/env')
const { confirmPaymentByOrderId } = require('../services/paymentConfirmation')
const crypto = require('crypto')

function verifyRazorpaySignature({ rawBodyBuffer, signatureHeader, secret }) {
  if (!signatureHeader || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBodyBuffer).digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(signatureHeader, 'utf8')
  if (a.length !== b.length) return false

  return crypto.timingSafeEqual(a, b)
}

async function handleRazorpayWebhook(req, res) {
  try {
    const signatureHeader = req.headers['x-razorpay-signature']
    const rawBodyBuffer = req.body

    if (!Buffer.isBuffer(rawBodyBuffer)) {
      return res.status(400).json({ error: 'Webhook body must be raw JSON buffer.' })
    }

    const verified = verifyRazorpaySignature({
      rawBodyBuffer,
      signatureHeader,
      secret: RAZORPAY_WEBHOOK_SECRET,
    })

    if (!verified) {
      return res.status(400).json({ error: 'Invalid Razorpay signature.' })
    }

    const event = JSON.parse(rawBodyBuffer.toString('utf8'))
    const eventName = event.event

    if (eventName !== 'payment.captured') {
      return res.json({ ok: true })
    }

    const paymentEntity = event?.payload?.payment?.entity
    const razorpayOrderId = paymentEntity?.order_id
    const razorpayPaymentId = paymentEntity?.id

    if (!razorpayOrderId) {
      return res.status(400).json({ error: 'Missing razorpay order id.' })
    }

    await confirmPaymentByOrderId({ razorpayOrderId, razorpayPaymentId })
    return res.json({ ok: true })
  } catch (err) {
    console.error('handleRazorpayWebhook error:', err)
    return res.status(500).json({ error: 'Webhook handling failed.' })
  }
}

module.exports = { handleRazorpayWebhook }
