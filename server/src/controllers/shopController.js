const Product = require('../models/Product')
const Order = require('../models/Order')
const { MIN_AMOUNT_PAISE, getRazorpayClient, mapRazorpayError, RAZORPAY_KEY_ID } = require('../services/razorpayClient')

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

    const subtotal = product.price * qty
    const amountPaise = Math.round(subtotal * 100)
    if (amountPaise < MIN_AMOUNT_PAISE) {
      return res.status(400).json({ error: `Amount must be at least ${MIN_AMOUNT_PAISE} paise.` })
    }

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

    const razorpay = getRazorpayClient()
    const order = await razorpay.orders.create({
      amount: amountPaise,
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
    const mapped = mapRazorpayError(err)
    return res.status(mapped.statusCode).json({ error: mapped.error })
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
