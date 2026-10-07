require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
require('dotenv').config({ path: require('path').join(__dirname, '.env') })

const { connectToDatabase } = require('./src/config/db')
const { seedProductsIfEmpty } = require('./src/config/seedProducts')
const mongoose = require('mongoose')

async function runSeed() {
  console.log('Connecting to database for seeding...')
  await connectToDatabase()
  console.log('Database connected. Checking products...')
  await seedProductsIfEmpty()
  console.log('Product seeding completed.')
  await mongoose.disconnect()
  console.log('Database disconnected.')
  process.exit(0)
}

runSeed().catch((err) => {
  console.error('Seeding error:', err)
  process.exit(1)
})
