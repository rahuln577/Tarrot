const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const {
  IAMClient,
  GetRoleCommand,
  CreateRoleCommand,
  AttachRolePolicyCommand,
} = require('@aws-sdk/client-iam')
const {
  LambdaClient,
  GetFunctionCommand,
  CreateFunctionCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  AddPermissionCommand,
  waitUntilFunctionUpdated,
} = require('@aws-sdk/client-lambda')
const {
  ApiGatewayV2Client,
  GetApisCommand,
  CreateApiCommand,
  CreateIntegrationCommand,
  CreateRouteCommand,
} = require('@aws-sdk/client-apigatewayv2')

const rootDir = path.resolve(__dirname, '..')

// Load environment files
require('dotenv').config({ path: path.join(rootDir, '.env') })
require('dotenv').config({ path: path.join(rootDir, 'server', '.env') })
require('dotenv').config({ path: path.join(rootDir, '.env.aws') })

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1'
const FUNCTION_NAME = 'anandamayii-roopa-api'
const ROLE_NAME = 'anandamayii-tarot-lambda-role'
const API_NAME = 'anandamayii-roopa-api'

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
}

if (!credentials.accessKeyId || !credentials.secretAccessKey) {
  console.error('\n❌ Missing AWS credentials!')
  console.error('Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.')
  console.error('You can provide them by running:')
  console.error('  export AWS_ACCESS_KEY_ID="your-key-id"')
  console.error('  export AWS_SECRET_ACCESS_KEY="your-secret-key"')
  console.error('  export AWS_REGION="ap-south-1" # optional, defaults to ap-south-1')
  console.error('Or save them in a .env.aws file in the project root:\n')
  console.error('  AWS_ACCESS_KEY_ID=AKIA...\n  AWS_SECRET_ACCESS_KEY=...\n  AWS_REGION=ap-south-1\n')
  process.exit(1)
}

const clientConfig = { region: REGION, credentials }
const iam = new IAMClient(clientConfig)
const lambda = new LambdaClient(clientConfig)
const apigw = new ApiGatewayV2Client(clientConfig)

function getBackendEnvironmentVariables() {
  const envConfig = require(path.join(rootDir, 'server', 'src', 'config', 'env.js'))
  const envVars = {}

  // List of keys to pass to Lambda
  const keys = [
    'MONGODB_URI',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CALENDAR_ID',
    'GOOGLE_OWNER_EMAIL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_FROM',
    'CLIENT_ORIGIN',
  ]

  for (const k of keys) {
    const val = process.env[k] || envConfig[k]
    if (val !== undefined && val !== null) {
      envVars[k] = String(val)
    }
  }

  // Ensure CLIENT_ORIGIN is set
  if (!envVars.CLIENT_ORIGIN) {
    envVars.CLIENT_ORIGIN = '*'
  }

  return envVars
}

async function getOrCreateRole() {
  console.log(`Checking IAM Role: ${ROLE_NAME}...`)
  try {
    const res = await iam.send(new GetRoleCommand({ RoleName: ROLE_NAME }))
    console.log(`✅ Using existing IAM role: ${res.Role.Arn}`)
    return res.Role.Arn
  } catch (err) {
    if (err.name !== 'NoSuchEntityException') throw err
  }

  console.log(`Creating IAM Role: ${ROLE_NAME}...`)
  const assumeRolePolicy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'lambda.amazonaws.com' },
        Action: 'sts:AssumeRole',
      },
    ],
  })

  const createRes = await iam.send(
    new CreateRoleCommand({
      RoleName: ROLE_NAME,
      AssumeRolePolicyDocument: assumeRolePolicy,
      Description: 'Execution role for Anandamayii Tarot API Lambda',
    }),
  )

  await iam.send(
    new AttachRolePolicyCommand({
      RoleName: ROLE_NAME,
      PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    }),
  )

  console.log(`✅ Created IAM role: ${createRes.Role.Arn}`)
  console.log('Waiting 10s for IAM role replication...')
  await new Promise((r) => setTimeout(r, 10000))
  return createRes.Role.Arn
}

async function packageCode() {
  console.log('\nPackaging backend into lambda.zip...')
  execSync('node scripts/package-lambda.js', { stdio: 'inherit', cwd: rootDir })
  const zipPath = path.join(rootDir, 'lambda.zip')
  return fs.readFileSync(zipPath)
}

async function deployLambda(roleArn, zipBuffer) {
  console.log(`\nChecking Lambda Function: ${FUNCTION_NAME}...`)
  const envVars = getBackendEnvironmentVariables()
  let functionArn

  try {
    const existing = await lambda.send(new GetFunctionCommand({ FunctionName: FUNCTION_NAME }))
    console.log(`Function exists. Updating function code...`)
    const updateCodeRes = await lambda.send(
      new UpdateFunctionCodeCommand({
        FunctionName: FUNCTION_NAME,
        ZipFile: zipBuffer,
        Architectures: ['arm64'],
      }),
    )
    functionArn = updateCodeRes.FunctionArn

    console.log('Waiting for code update to finish...')
    await waitUntilFunctionUpdated({ client: lambda, maxWaitTime: 60 }, { FunctionName: FUNCTION_NAME })

    console.log('Updating function configuration and environment variables...')
    const updateConfigRes = await lambda.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: FUNCTION_NAME,
        Timeout: 30,
        MemorySize: 512,
        Environment: { Variables: envVars },
      }),
    )
    functionArn = updateConfigRes.FunctionArn
    console.log('✅ Lambda function updated successfully.')
  } catch (err) {
    if (err.name !== 'ResourceNotFoundException') throw err

    console.log(`Creating Lambda function ${FUNCTION_NAME}...`)
    const createRes = await lambda.send(
      new CreateFunctionCommand({
        FunctionName: FUNCTION_NAME,
        Runtime: 'nodejs20.x',
        Role: roleArn,
        Handler: 'server/lambda.handler',
        Code: { ZipFile: zipBuffer },
        Timeout: 30,
        MemorySize: 512,
        Architectures: ['arm64'],
        Environment: { Variables: envVars },
        Description: 'Anandamayii Roopa Tarot Booking API',
      }),
    )
    functionArn = createRes.FunctionArn
    console.log(`✅ Lambda function created: ${functionArn}`)
  }

  return functionArn
}

async function setupApiGateway(functionArn) {
  console.log(`\nConfiguring Amazon API Gateway (HTTP API v2)...`)
  let apiId
  let apiEndpoint

  const apis = await apigw.send(new GetApisCommand({}))
  const existingApi = apis.Items?.find((a) => a.Name === API_NAME)

  if (existingApi) {
    apiId = existingApi.ApiId
    apiEndpoint = existingApi.ApiEndpoint
    console.log(`✅ Using existing API Gateway: ${apiEndpoint} (ID: ${apiId})`)
  } else {
    console.log(`Creating new HTTP API: ${API_NAME}...`)
    const createApiRes = await apigw.send(
      new CreateApiCommand({
        Name: API_NAME,
        ProtocolType: 'HTTP',
        CorsConfiguration: {
          AllowOrigins: ['*'],
          AllowMethods: ['*'],
          AllowHeaders: ['*'],
          MaxAge: 3600,
        },
      }),
    )
    apiId = createApiRes.ApiId
    apiEndpoint = createApiRes.ApiEndpoint
    console.log(`✅ Created API Gateway: ${apiEndpoint} (ID: ${apiId})`)

    // Create Lambda integration
    const integrationRes = await apigw.send(
      new CreateIntegrationCommand({
        ApiId: apiId,
        IntegrationType: 'AWS_PROXY',
        IntegrationUri: functionArn,
        PayloadFormatVersion: '2.0',
      }),
    )

    // Create default proxy route: $default
    await apigw.send(
      new CreateRouteCommand({
        ApiId: apiId,
        RouteKey: '$default',
        Target: `integrations/${integrationRes.IntegrationId}`,
      }),
    )
    console.log(`✅ Created proxy route '$default' pointing to Lambda integration.`)
  }

  // Ensure Lambda has permission to be invoked by API Gateway
  try {
    await lambda.send(
      new AddPermissionCommand({
        FunctionName: FUNCTION_NAME,
        StatementId: `apigateway-invoke-${apiId}`,
        Action: 'lambda:InvokeFunction',
        Principal: 'apigateway.amazonaws.com',
        SourceArn: `arn:aws:execute-api:${REGION}:*:${apiId}/*`,
      }),
    )
    console.log('✅ Granted API Gateway permission to invoke Lambda.')
  } catch (permErr) {
    if (permErr.name === 'ResourceConflictException') {
      // Permission already exists
    } else {
      console.warn('Note on permission:', permErr.message)
    }
  }

  return apiEndpoint
}

async function main() {
  console.log('==================================================')
  console.log(`🚀 DEPLOYING ANANDAMAYII API TO AWS LAMBDA (${REGION})`)
  console.log('==================================================')

  const roleArn = await getOrCreateRole()
  const zipBuffer = await packageCode()
  const functionArn = await deployLambda(roleArn, zipBuffer)
  const apiEndpoint = await setupApiGateway(functionArn)

  // Update client/.env.production with live API endpoint
  const clientProdEnvPath = path.join(rootDir, 'client', '.env.production')
  const clientEnvContent = `VITE_API_BASE_URL=${apiEndpoint}\n`
  fs.writeFileSync(clientProdEnvPath, clientEnvContent)

  console.log('\n==================================================')
  console.log('🎉 DEPLOYMENT COMPLETE!')
  console.log('==================================================')
  console.log(`\n🔗 Live API Gateway Endpoint:`)
  console.log(`   ${apiEndpoint}`)
  console.log(`\n🏥 Health Check:`)
  console.log(`   ${apiEndpoint}/api/health`)
  console.log(`\n💳 Razorpay Webhook URL:`)
  console.log(`   ${apiEndpoint}/api/webhooks/razorpay`)
  console.log(`\n📁 Updated client/.env.production with VITE_API_BASE_URL.`)
  console.log('==================================================\n')
}

main().catch((err) => {
  console.error('\n❌ Deployment failed:', err)
  process.exit(1)
})
