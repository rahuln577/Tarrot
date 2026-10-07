const Appointment = require('../models/Appointment')
const User = require('../models/User')
const Order = require('../models/Order')
const { createMeetEvent } = require('./googleCalendar')
const { sendMeetEmails, sendSimpleEmails } = require('./emailService')

async function confirmPaymentByOrderId({ razorpayOrderId, razorpayPaymentId }) {
  if (!razorpayOrderId) {
    throw new Error('razorpayOrderId is required to confirm payment')
  }

  // 1. Check Appointment first
  const existingAppointment = await Appointment.findOne({ razorpayOrderId })

  if (existingAppointment) {
    // If already confirmed, update paymentId if needed and return early (idempotent)
    if (existingAppointment.status === 'Confirmed') {
      if (razorpayPaymentId && !existingAppointment.razorpayPaymentId) {
        existingAppointment.razorpayPaymentId = razorpayPaymentId
        await existingAppointment.save()
      }
      return {
        kind: 'appointment',
        id: existingAppointment._id.toString(),
        alreadyConfirmed: true,
        appointment: existingAppointment,
      }
    }

    // Atomically transition status to Confirmed to avoid race condition with simultaneous webhook
    const appointment = await Appointment.findOneAndUpdate(
      { razorpayOrderId, status: { $ne: 'Confirmed' } },
      {
        $set: {
          status: 'Confirmed',
          ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
        },
      },
      { new: true },
    )

    if (!appointment) {
      // Another concurrent process just confirmed it
      const current = await Appointment.findOne({ razorpayOrderId })
      return {
        kind: 'appointment',
        id: current ? current._id.toString() : existingAppointment._id.toString(),
        alreadyConfirmed: true,
        appointment: current,
      }
    }

    // Payment is now securely CONFIRMED in DB!
    // Next, fulfill side effects (Google Meet & Email) safely:
    let meetLink = appointment.googleMeetLink || null
    let googleEventId = appointment.googleEventId || null

    try {
      const user = await User.findById(appointment.user)
      const userEmail = user?.email || appointment.userEmail

      const startDateTime = appointment.scheduledAt.toISOString()
      const endDateTime = new Date(
        appointment.scheduledAt.getTime() + appointment.durationMinutes * 60_000,
      ).toISOString()

      const summary = `Tarot Session with Anandamayii Roopa`
      const description = `Service: ${appointment.serviceType}\nAppointment ID: ${appointment._id}\nPayment ID: ${razorpayPaymentId || appointment.razorpayPaymentId || 'N/A'}`

      try {
        const meetResult = await createMeetEvent({
          summary,
          description,
          startDateTime,
          endDateTime,
          attendees: userEmail ? [{ email: userEmail }] : [],
        })
        googleEventId = meetResult.googleEventId
        meetLink = meetResult.meetLink

        appointment.googleEventId = googleEventId
        appointment.googleMeetLink = meetLink
        await appointment.save()
      } catch (meetErr) {
        console.error('Google Meet event creation failed (non-fatal):', meetErr.message || meetErr)
      }

      // Send confirmation email
      try {
        const ownerEmail = process.env.GOOGLE_OWNER_EMAIL
        const toEmails = [userEmail, ownerEmail].filter(Boolean)
        if (toEmails.length > 0) {
          const bodyText = meetLink
            ? `Hello,\n\nYour tarot session is confirmed!\n\nJoin link: ${meetLink}\n\nScheduled for: ${appointment.scheduledAt.toISOString()}\n\n— Anandamayii Roopa`
            : `Hello,\n\nYour tarot session is confirmed!\n\nScheduled for: ${appointment.scheduledAt.toISOString()}\n\nYour Google Meet invite will be shared shortly.\n\n— Anandamayii Roopa`

          await sendMeetEmails({
            toEmails,
            subject: 'Your Google Meet Tarot Session Confirmation',
            bodyText,
          })
        }
      } catch (emailErr) {
        console.error('Confirmation email delivery failed (non-fatal):', emailErr.message || emailErr)
      }
    } catch (fulfillmentErr) {
      console.error('Post-payment fulfillment error (non-fatal):', fulfillmentErr)
    }

    return {
      kind: 'appointment',
      id: appointment._id.toString(),
      alreadyConfirmed: false,
      appointment,
    }
  }

  // 2. Check Shop Order
  const existingOrder = await Order.findOne({ razorpayOrderId })
  if (!existingOrder) {
    return { kind: 'none' }
  }

  if (existingOrder.status === 'Paid') {
    if (razorpayPaymentId && !existingOrder.razorpayPaymentId) {
      existingOrder.razorpayPaymentId = razorpayPaymentId
      await existingOrder.save()
    }
    return { kind: 'shop', id: existingOrder._id.toString(), alreadyConfirmed: true, order: existingOrder }
  }

  // Atomically transition status to Paid
  const order = await Order.findOneAndUpdate(
    { razorpayOrderId, status: { $ne: 'Paid' } },
    {
      $set: {
        status: 'Paid',
        ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
      },
    },
    { new: true },
  )

  if (!order) {
    const current = await Order.findOne({ razorpayOrderId })
    return { kind: 'shop', id: current ? current._id.toString() : existingOrder._id.toString(), alreadyConfirmed: true, order: current }
  }

  // Send shop order email safely
  try {
    const ownerEmail = process.env.GOOGLE_OWNER_EMAIL
    const toEmails = [order.userEmail, ownerEmail].filter(Boolean)

    if (toEmails.length > 0) {
      const itemsList = (order.items || [])
        .map((it) => `- ${it.name} × ${it.quantity} (₹${it.price})`)
        .join('\n')

      await sendSimpleEmails({
        toEmails,
        subject: 'Your Crystal Shop Order is Confirmed',
        bodyText: `Hello,\n\nThank you for your purchase! Your crystal order is confirmed.\n\nOrder Total: ₹${order.subtotal} ${order.currency}\n\nItems:\n${itemsList}\n\n— Anandamayii Roopa`,
      })
    }
  } catch (emailErr) {
    console.error('Shop order confirmation email delivery failed (non-fatal):', emailErr.message || emailErr)
  }

  return { kind: 'shop', id: order._id.toString(), alreadyConfirmed: false, order }
}

module.exports = { confirmPaymentByOrderId }
