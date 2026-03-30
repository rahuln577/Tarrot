const crypto = require('crypto')
const Appointment = require('../models/Appointment')
const User = require('../models/User')
const Order = require('../models/Order')
const { RAZORPAY_WEBHOOK_SECRET } = require('../config/env')
const { createMeetEvent } = require('../services/googleCalendar')
const { sendMeetEmails, sendSimpleEmails } = require('../services/emailService')

function verifyRazorpaySignature({ rawBodyBuffer, signatureHeader, secret }) {
  if (!signatureHeader || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBodyBuffer).digest('hex')

  // Razorpay sends hex string. Compare in constant time.
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

    // Only confirm appointment after successful payment webhook.
    if (eventName !== 'payment.captured') {
      return res.json({ ok: true })
    }

    const paymentEntity = event?.payload?.payment?.entity
    const razorpayOrderId = paymentEntity?.order_id
    const razorpayPaymentId = paymentEntity?.id

    if (!razorpayOrderId) {
      return res.status(400).json({ error: 'Missing razorpay order id.' })
    }

    // First try to confirm as an appointment booking.
    const appointment = await Appointment.findOne({ razorpayOrderId })

    if (appointment) {
      // Idempotency: if already confirmed, do nothing.
      if (appointment.status === 'Confirmed') return res.json({ ok: true })

      const user = await User.findById(appointment.user)
      const userEmail = user?.email || appointment.userEmail

      // Create Google Meet link from booking time.
      const startDateTime = appointment.scheduledAt.toISOString()
      const endDateTime = new Date(
        appointment.scheduledAt.getTime() + appointment.durationMinutes * 60_000,
      ).toISOString()

      const summary = `Tarot Session with Anandamayii Roopa`
      const description = `Service: ${appointment.serviceType}\nAppointment ID: ${appointment._id}\nPayment ID: ${razorpayPaymentId}`

      const { googleEventId, meetLink } = await createMeetEvent({
        summary,
        description,
        startDateTime,
        endDateTime,
        attendees: [{ email: userEmail }],
      })

      // Email both the user and the owner (owner comes from env).
      const ownerEmail = process.env.GOOGLE_OWNER_EMAIL
      const toEmails = [userEmail, ownerEmail].filter(Boolean)

      await sendMeetEmails({
        toEmails,
        subject: 'Your Google Meet Tarot Session',
        bodyText: `Hello,\n\nYour tarot session is confirmed.\n\nJoin link: ${meetLink}\n\nScheduled for: ${appointment.scheduledAt.toISOString()}\n\n— Anandamayii Roopa`,
      })

      appointment.status = 'Confirmed'
      appointment.razorpayPaymentId = razorpayPaymentId
      appointment.googleEventId = googleEventId
      appointment.googleMeetLink = meetLink
      await appointment.save()

      return res.json({ ok: true })
    }

    // Next try as a crystal shop order.
    const order = await Order.findOne({ razorpayOrderId })
    if (!order) {
      return res.status(200).json({ ok: true, message: 'Order not found for payment.' })
    }

    if (order.status === 'Paid') return res.json({ ok: true })

    order.status = 'Paid'
    order.razorpayPaymentId = razorpayPaymentId
    await order.save()

    const ownerEmail = process.env.GOOGLE_OWNER_EMAIL
    const toEmails = [order.userEmail, ownerEmail].filter(Boolean)

    await sendSimpleEmails({
      toEmails,
      subject: 'Your Crystal Shop Order is Confirmed',
      bodyText: `Hello,\n\nThank you for your purchase. Your crystal order is confirmed.\n\nOrder subtotal: ${order.subtotal} ${order.currency}\n\nItems:\n${order.items
        .map((it) => `- ${it.name} × ${it.quantity}`)
        .join('\n')}\n\n— Anandamayii Roopa`,
    })

    return res.json({ ok: true })
  } catch (err) {
    console.error('handleRazorpayWebhook error:', err)
    return res.status(500).json({ error: 'Webhook handling failed.' })
  }
}

module.exports = { handleRazorpayWebhook }

