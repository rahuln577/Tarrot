const mongoose = require('mongoose')
const Product = require('../models/Product')
const Order = require('../models/Order')
const { MIN_AMOUNT_PAISE, getRazorpayClient, mapRazorpayError, RAZORPAY_KEY_ID } = require('../services/razorpayClient')

async function createShopOrder(req, res) {
  try {
    const { name, email, productId, quantity } = req.body || {}

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' })
    }
    if (!productId || typeof productId !== 'string' || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid or missing productId.' })
    }

    const q = quantity ? Number(quantity) : 1
    if (!Number.isInteger(q) || q < 1 || q > 100) {
      return res.status(400).json({ error: 'Quantity must be an integer between 1 and 100.' })
    }
    const qty = q

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    const subtotal = product.price * qty
    const amountPaise = Math.round(subtotal * 100)
    if (amountPaise < MIN_AMOUNT_PAISE) {
      return res.status(400).json({ error: `Amount must be at least ${MIN_AMOUNT_PAISE} paise.` })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = name ? name.toString().trim() : ''

    const orderDoc = await Order.create({
      userEmail: cleanEmail,
      userName: cleanName,
      items: [
        {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: qty,
        },
      ],
      subtotal,
      currency: 'INR',
      status: 'Pending',
    })

    const razorpay = getRazorpayClient()
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: orderDoc._id.toString(),
      notes: {
        shopOrderId: orderDoc._id.toString(),
        productId: product._id.toString(),
        productName: product.name,
        quantity: String(qty),
        customerName: cleanName,
        customerEmail: cleanEmail,
      },
    })

    orderDoc.razorpayOrderId = order.id
    await orderDoc.save()

    return res.json({
      keyId: RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      shopOrderId: orderDoc._id.toString(),
      product: { id: product._id.toString(), name: product.name },
    })
  } catch (err) {
    console.error('createShopOrder error:', err)
    const mapped = mapRazorpayError(err)
    return res.status(mapped.statusCode).json({ error: mapped.error })
  }
}

async function getShopOrderStatus(req, res) {
  try {
    const { shopOrderId } = req.params

    if (!mongoose.Types.ObjectId.isValid(shopOrderId)) {
      return res.status(400).json({ error: 'Invalid shop order ID format.' })
    }

    const order = await Order.findById(shopOrderId).select(
      'status subtotal currency items razorpayOrderId razorpayPaymentId',
    )
    if (!order) return res.status(404).json({ error: 'Order not found.' })

    return res.json({
      shopOrderId: order._id.toString(),
      status: order.status,
      subtotal: order.subtotal,
      currency: order.currency,
      items: order.items,
      paid: order.status === 'Paid',
    })
  } catch (err) {
    console.error('getShopOrderStatus error:', err)
    return res.status(500).json({ error: 'Failed to get order status.' })
  }
}

module.exports = { createShopOrder, getShopOrderStatus }
