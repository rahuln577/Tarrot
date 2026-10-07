require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
require('dotenv').config({ path: require('path').join(__dirname, '.env') })

const { PORT } = require('./src/config/env')
const { connectToDatabase } = require('./src/config/db')
const { createApp } = require('./src/app')
const { seedProductsIfEmpty } = require('./src/config/seedProducts')

async function main() {
  await connectToDatabase()
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
