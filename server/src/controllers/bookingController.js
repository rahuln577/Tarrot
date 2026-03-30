const Razorpay = require('razorpay')
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET } = require('../config/env')
const User = require('../models/User')
const Appointment = require('../models/Appointment')

function getAmountInRupees(input) {
  const n = Number(input)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return n
}

async function createBookingOrder(req, res) {
  try {
    const { name, email, serviceType, scheduledAt, durationMinutes, amountInRupees } = req.body || {}

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Missing `email`.' })
    }
    if (!serviceType || typeof serviceType !== 'string') {
      return res.status(400).json({ error: 'Missing `serviceType`.' })
    }
    if (!scheduledAt) {
      return res.status(400).json({ error: 'Missing `scheduledAt` (ISO string).' })
    }

    const when = new Date(scheduledAt)
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ error: 'Invalid `scheduledAt`.' })
    }

    const duration = durationMinutes ? Number(durationMinutes) : 60
    const finalDuration = Number.isFinite(duration) && duration > 0 ? duration : 60

    // Frontend can send exact price; if not, default to 1 paise (0.01 INR) for testing.
    const inferred = getAmountInRupees(amountInRupees) ?? 0.01;
    const amount = inferred

    if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
      return res.status(500).json({ error: 'Razorpay env vars missing on server.' })
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $setOnInsert: { name: name?.toString().trim(), email: email.toLowerCase().trim() } },
      { upsert: true, new: true },
    )

    const appointment = await Appointment.create({
      user: user._id,
      userEmail: user.email,
      serviceType,
      scheduledAt: when,
      durationMinutes: finalDuration,
      status: 'Pending',
    })

    // Temporarily bypass Razorpay payment for testing appointment logic
    /*
    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_SECRET })

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: appointment._id.toString(),
      notes: { appointmentId: appointment._id.toString() },
    })

    appointment.razorpayOrderId = order.id
    */

    appointment.status = 'Confirmed'
    await appointment.save()

    return res.json({
      keyId: 'test',
      orderId: 'test-order',
      amount: Math.round(amount * 100),
      currency: 'INR',
      appointmentId: appointment._id.toString(),
    })
  } catch (err) {
    console.error('createBookingOrder error:', err)
    return res.status(500).json({ error: 'Failed to create booking order.' })
  }
}

async function getBookingStatus(req, res) {
  try {
    const { appointmentId } = req.params
    const appointment = await Appointment.findById(appointmentId).select(
      'status scheduledAt serviceType googleMeetLink',
    )

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' })
    }

    return res.json({
      appointmentId: appointment._id.toString(),
      status: appointment.status,
      scheduledAt: appointment.scheduledAt,
      serviceType: appointment.serviceType,
      googleMeetLink: appointment.googleMeetLink || null,
    })
  } catch (err) {
    console.error('getBookingStatus error:', err)
    return res.status(500).json({ error: 'Failed to get booking status.' })
  }
}

module.exports = { createBookingOrder, getBookingStatus }

