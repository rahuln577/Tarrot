const Product = require('../models/Product')

async function seedProductsIfEmpty() {
  const count = await Product.countDocuments()
  if (count > 0) return

  await Product.insertMany([
    {
      name: 'Rose Quartz',
      description: 'For love, self-worth, and emotional healing.',
      price: 1,
      currency: 'INR',
    },
    {
      name: 'Amethyst',
      description: 'For calm mind, spiritual insight, and protection.',
      price: 1,
      currency: 'INR',
    },
    {
      name: 'Clear Quartz',
      description: 'For clarity, intention-setting, and energy amplification.',
      price: 1,
      currency: 'INR',
    },
    {
      name: 'Citrine',
      description: 'For positivity, confidence, and abundance energy.',
      price: 1,
      currency: 'INR',
    },
  ])
}

module.exports = { seedProductsIfEmpty }

