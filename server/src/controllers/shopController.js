const Razorpay = require('razorpay')
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET } = require('../config/env')
const Product = require('../models/Product')
const Order = require('../models/Order')

async function createShopOrder(req, res) {
  try {
    const { name, email, productId, quantity } = req.body || {}

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Missing `email`.' })
    }
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'Missing `productId`.' })
    }

    const q = quantity ? Number(quantity) : 1
    const qty = Number.isFinite(q) && q > 0 ? Math.floor(q) : 1

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
      return res.status(500).json({ error: 'Razorpay env vars missing on server.' })
    }

    const subtotal = product.price * qty

    const orderDoc = await Order.create({
      userEmail: email.toLowerCase().trim(),
      userName: name?.toString().trim(),
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

    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_SECRET })
    const order = await razorpay.orders.create({
      amount: Math.round(subtotal * 100), // paise
      currency: 'INR',
      receipt: orderDoc._id.toString(),
      notes: { shopOrderId: orderDoc._id.toString() },
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
    return res.status(500).json({ error: 'Failed to create shop order.' })
  }
}

async function getShopOrderStatus(req, res) {
  try {
    const { shopOrderId } = req.params
    const order = await Order.findById(shopOrderId).select('status subtotal currency')
    if (!order) return res.status(404).json({ error: 'Order not found.' })
    return res.json({
      shopOrderId: order._id.toString(),
      status: order.status,
      subtotal: order.subtotal,
      currency: order.currency,
    })
  } catch (err) {
    console.error('getShopOrderStatus error:', err)
    return res.status(500).json({ error: 'Failed to get order status.' })
  }
}

module.exports = { createShopOrder, getShopOrderStatus }

