const { createApp } = require('../server/src/app')
const { connectToDatabase } = require('../server/src/config/db')

let app

module.exports = async (req, res) => {
  // Ensure cached MongoDB connection is active
  await connectToDatabase()

  if (!app) {
    app = createApp()
  }

  return app(req, res)
}
