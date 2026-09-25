const Appointment = require('../models/Appointment')
const User = require('../models/User')
const Order = require('../models/Order')
const { createMeetEvent } = require('./googleCalendar')
const { sendMeetEmails, sendSimpleEmails } = require('./emailService')

async function confirmPaymentByOrderId({ razorpayOrderId, razorpayPaymentId }) {
  const appointment = await Appointment.findOne({ razorpayOrderId })

  if (appointment) {
    if (appointment.status === 'Confirmed') {
      appointment.razorpayPaymentId = appointment.razorpayPaymentId || razorpayPaymentId
      if (razorpayPaymentId && appointment.razorpayPaymentId !== razorpayPaymentId) {
        appointment.razorpayPaymentId = razorpayPaymentId
        await appointment.save()
      }
      return { kind: 'appointment', id: appointment._id.toString(), alreadyConfirmed: true }
    }

    const user = await User.findById(appointment.user)
    const userEmail = user?.email || appointment.userEmail

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

    return { kind: 'appointment', id: appointment._id.toString(), alreadyConfirmed: false }
  }

  const order = await Order.findOne({ razorpayOrderId })
  if (!order) {
    return { kind: 'none' }
  }

  if (order.status !== 'Paid') {
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
  } else if (razorpayPaymentId && !order.razorpayPaymentId) {
    order.razorpayPaymentId = razorpayPaymentId
    await order.save()
  }

  return { kind: 'shop', id: order._id.toString() }
}

module.exports = { confirmPaymentByOrderId }
