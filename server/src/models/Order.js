const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    userName: { type: String, trim: true },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true }, // major unit INR
        quantity: { type: Number, default: 1 },
      },
    ],

    subtotal: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Cancelled'],
      default: 'Pending',
      index: true,
    },

    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Order', orderSchema)

