const mongoose = require('mongoose')
const { MONGODB_URI } = require('./env')

let cachedPromise = null

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI. Please configure the MongoDB connection string.')
  }

  // If connection is already open and ready (readyState: 1), reuse it
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  // If a connection attempt is currently in-flight, await the existing promise
  if (cachedPromise) {
    await cachedPromise
    return mongoose.connection
  }

  cachedPromise = mongoose
    .connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .catch((err) => {
      cachedPromise = null
      throw err
    })

  await cachedPromise
  return mongoose.connection
}

module.exports = { connectToDatabase }
