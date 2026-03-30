const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },

    serviceType: { type: String, required: true }, // e.g. Love, Career, Personal Growth
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },

    // Razorpay
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },

    // Google Meet
    googleEventId: { type: String },
    googleMeetLink: { type: String },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Appointment', appointmentSchema)

