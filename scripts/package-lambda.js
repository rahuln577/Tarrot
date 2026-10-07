const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist-lambda')
const zipPath = path.join(rootDir, 'lambda.zip')

console.log('📦 Packaging backend for AWS Lambda...')

// 1. Clean previous build
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true })
}
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath)
}

fs.mkdirSync(distDir, { recursive: true })

// 2. Copy server code and package.json
console.log('Copying server files...')
execSync(`cp -R "${path.join(rootDir, 'server')}" "${distDir}/"`)
execSync(`cp "${path.join(rootDir, 'package.json')}" "${distDir}/package.json"`)

if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) {
  execSync(`cp "${path.join(rootDir, 'package-lock.json')}" "${distDir}/package-lock.json"`)
}

// Security: Strip local .env from package so secrets are never accidentally zipped
const serverEnvInDist = path.join(distDir, 'server', '.env')
if (fs.existsSync(serverEnvInDist)) {
  fs.unlinkSync(serverEnvInDist)
  console.log('🔒 Excluded local server/.env from ZIP (configure secrets in AWS Console / SSM).')
}

// 3. Include node_modules
if (fs.existsSync(path.join(rootDir, 'node_modules'))) {
  console.log('Copying node_modules...')
  execSync(`cp -R "${path.join(rootDir, 'node_modules')}" "${distDir}/"`)
} else {
  console.log('Installing production dependencies...')
  execSync('npm install --omit=dev', { cwd: distDir, stdio: 'inherit' })
}

// 4. Create ZIP
console.log('Compressing into lambda.zip...')
execSync(`cd "${distDir}" && zip -r -q "${zipPath}" .`)

// 5. Clean temporary build directory
fs.rmSync(distDir, { recursive: true, force: true })

console.log(`\n✅ Successfully generated lambda.zip at:`)
console.log(`${zipPath}`)
console.log('\nYou can deploy this package to AWS Lambda:')
console.log('  aws lambda update-function-code --function-name <YOUR_LAMBDA_NAME> --zip-file fileb://lambda.zip')
console.log('Or upload directly via the AWS Lambda Console.')
