const Product = require('../models/Product')

async function listProducts(req, res) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 })
    return res.json({ products })
  } catch (err) {
    console.error('listProducts error:', err)
    return res.status(500).json({ error: 'Failed to list products.' })
  }
}

module.exports = { listProducts }

