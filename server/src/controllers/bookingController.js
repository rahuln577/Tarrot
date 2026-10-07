const mongoose = require('mongoose')
const Appointment = require('../models/Appointment')
const User = require('../models/User')
const { MIN_AMOUNT_PAISE, getRazorpayClient, mapRazorpayError, RAZORPAY_KEY_ID } = require('../services/razorpayClient')
const { getServiceByType, getAllServices } = require('../config/services')

async function listServices(req, res) {
  return res.json({ services: getAllServices() })
}

async function createBookingOrder(req, res) {
  try {
    const { name, email, serviceType, scheduledAt } = req.body || {}

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' })
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' })
    }
    if (!serviceType || typeof serviceType !== 'string') {
      return res.status(400).json({ error: 'Missing serviceType.' })
    }

    const service = getServiceByType(serviceType)
    if (!service) {
      return res.status(400).json({
        error: `Invalid serviceType '${serviceType}'. Available services: ${getAllServices().map((s) => s.serviceType).join(', ')}`,
      })
    }

    if (!scheduledAt) {
      return res.status(400).json({ error: 'Missing scheduledAt (ISO date string).' })
    }

    const when = new Date(scheduledAt)
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduledAt date format.' })
    }

    // Use authoritative server-side pricing and duration
    const priceInRupees = service.priceInRupees
    const durationMinutes = service.durationMinutes
    const amountPaise = Math.round(priceInRupees * 100)

    if (amountPaise < MIN_AMOUNT_PAISE) {
      return res.status(400).json({ error: `Amount must be at least ${MIN_AMOUNT_PAISE} paise.` })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = name.trim()

    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { $setOnInsert: { name: cleanName, email: cleanEmail } },
      { upsert: true, new: true },
    )

    const appointment = await Appointment.create({
      user: user._id,
      userEmail: user.email,
      serviceType: service.serviceType,
      scheduledAt: when,
      durationMinutes,
      status: 'Pending',
    })

    const razorpay = getRazorpayClient()
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: appointment._id.toString(),
      notes: {
        appointmentId: appointment._id.toString(),
        serviceType: service.serviceType,
        customerName: cleanName,
        customerEmail: cleanEmail,
      },
    })

    appointment.razorpayOrderId = order.id
    await appointment.save()

    return res.json({
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      appointmentId: appointment._id.toString(),
      service: {
        serviceType: service.serviceType,
        label: service.label,
        priceInRupees: service.priceInRupees,
        durationMinutes: service.durationMinutes,
      },
    })
  } catch (err) {
    console.error('createBookingOrder error:', err)
    const mapped = mapRazorpayError(err)
    return res.status(mapped.statusCode).json({ error: mapped.error })
  }
}

async function getBookingStatus(req, res) {
  try {
    const { appointmentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ error: 'Invalid appointment ID format.' })
    }

    const appointment = await Appointment.findById(appointmentId).select(
      'status scheduledAt serviceType googleMeetLink razorpayOrderId razorpayPaymentId',
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
      paid: appointment.status === 'Confirmed',
    })
  } catch (err) {
    console.error('getBookingStatus error:', err)
    return res.status(500).json({ error: 'Failed to get booking status.' })
  }
}

module.exports = { listServices, createBookingOrder, getBookingStatus }
