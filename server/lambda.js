const serverlessExpress = require('@vendia/serverless-express')
const { createApp } = require('./src/app')
const { connectToDatabase } = require('./src/config/db')

let serverlessExpressInstance

async function setup(event, context) {
  // Prevent Lambda from waiting for MongoDB background socket idle events
  context.callbackWaitsForEmptyEventLoop = false

  // Connect to DB (cached across warm container invocations)
  await connectToDatabase()

  if (!serverlessExpressInstance) {
    const app = createApp()
    serverlessExpressInstance = serverlessExpress({
      app,
      binarySettings: {
        contentTypes: [
          'application/octet-stream',
          'image/*',
          'font/*',
          'application/pdf',
        ],
      },
    })
  }

  return serverlessExpressInstance(event, context)
}

exports.handler = async (event, context, callback) => {
  return setup(event, context, callback)
}
