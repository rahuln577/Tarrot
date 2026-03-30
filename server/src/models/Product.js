const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true }, // in INR (major unit); convert to paise for Razorpay
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Product', productSchema)

