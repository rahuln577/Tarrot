require('dotenv').config()

const mongoose = require('mongoose')
const { PORT, MONGODB_URI } = require('./src/config/env')
const { createApp } = require('./src/app')
const { seedProductsIfEmpty } = require('./src/config/seedProducts')

async function main() {
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI. Check server/.env')
  }

  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  await seedProductsIfEmpty()

  const app = createApp()
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('Server start failed:', err)
  process.exit(1)
})

