'use strict'

// ESLint 8 must ignore the repository-root flat config. Unix env prefixes
// in package.json scripts fail on Windows, so set the variable here.
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const mobileRoot = path.resolve(__dirname, '..')
const eslintBin = path.join(mobileRoot, 'node_modules', 'eslint', 'bin', 'eslint.js')
const result = spawnSync(process.execPath, [
  eslintBin,
  '.',
  '--config',
  '.eslintrc.js',
  '--ext',
  '.js,.jsx,.ts,.tsx',
], {
  cwd: mobileRoot,
  stdio: 'inherit',
  env: { ...process.env, ESLINT_USE_FLAT_CONFIG: 'false' },
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status === null ? 1 : result.status)
