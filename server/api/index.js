const { createApp } = require('../src/app')
const { connectToDatabase } = require('../src/config/db')

let app

module.exports = async (req, res) => {
  // Ensure database connection is active
  await connectToDatabase()

  if (!app) {
    app = createApp()
  }

  return app(req, res)
}
