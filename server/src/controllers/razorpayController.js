const { RAZORPAY_KEY_SECRET } = require('../config/env')
const {
  MIN_AMOUNT_PAISE,
  getRazorpayClient,
  verifyCheckoutSignature,
  mapRazorpayError,
} = require('../services/razorpayClient')
const { confirmPaymentByOrderId } = require('../services/paymentConfirmation')

async function createOrder(req, res) {
  try {
    const { amount, currency, receipt } = req.body || {}
    const amountPaise = Number(amount)

    if (!Number.isFinite(amountPaise) || amountPaise < MIN_AMOUNT_PAISE) {
      return res.status(400).json({ error: `Amount must be at least ${MIN_AMOUNT_PAISE} paise.` })
    }

    const razorpay = getRazorpayClient()
    const order = await razorpay.orders.create({
      amount: Math.round(amountPaise),
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
    })

    return res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (err) {
    console.error('createOrder error:', err)
    const mapped = mapRazorpayError(err)
    return res.status(mapped.statusCode).json({ error: mapped.error })
  }
}

async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}

    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay env vars missing on server.' })
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature.' })
    }

    const valid = verifyCheckoutSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    if (!valid) {
      return res.status(400).json({ error: 'Invalid payment signature.', paid: false })
    }

    try {
      await confirmPaymentByOrderId({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      })
    } catch (confirmErr) {
      console.error('Payment confirmed but fulfillment failed:', confirmErr)
    }

    return res.json({
      success: true,
      paid: true,
      razorpay_order_id,
      razorpay_payment_id,
    })
  } catch (err) {
    console.error('verifyPayment error:', err)
    return res.status(500).json({ error: 'Failed to verify payment.' })
  }
}

module.exports = { createOrder, verifyPayment }
