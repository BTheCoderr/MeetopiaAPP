'use strict'

// Static EAS configuration gate; never invokes a build or submission.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const mobileRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(mobileRoot, '..', '..')
const ignore = fs.readFileSync(path.join(repoRoot, '.easignore'), 'utf8')
const rules = new Set(ignore.split(/\r?\n/).map(value => value.trim()))
for (const nativeDir of ['/apps/mobile/ios/', '/apps/mobile/android/']) {
  assert(rules.has(nativeDir), `EAS must exclude stale native directory: ${nativeDir}`)
}
assert(rules.has('/apps/mobile/.env'), 'Do not upload mobile local environment variables')

const eas = JSON.parse(fs.readFileSync(path.join(mobileRoot, 'eas.json'), 'utf8'))
assert.equal(eas.cli.appVersionSource, 'local')
assert.equal(eas.build.production.ios.image, 'sdk-58')
assert.notEqual(eas.build.production.autoSubmit, true)
assert.equal(eas.submit.production.ios.ascAppId, '6747625372')

const publicConfig = JSON.parse(execFileSync('npx', ['expo', 'config', '--type', 'public', '--json'], {
  cwd: mobileRoot,
  encoding: 'utf8',
}))
assert.equal(publicConfig.slug, 'meetopia-app')
assert.equal(publicConfig.ios.bundleIdentifier, 'com.meetopia.app')
assert(Number(publicConfig.ios.buildNumber) >= 18, 'iOS build number must exceed rejected build 17')
assert.equal(publicConfig.extra.eas.projectId, '37e69074-d079-4c60-a3c4-5d468645bcf1')
const names = (publicConfig.plugins || []).map(plugin => Array.isArray(plugin) ? plugin[0] : plugin)
assert(names.includes('@config-plugins/react-native-webrtc'), 'EAS CNG must configure native WebRTC')
console.log('Expo/EAS configuration verified; no build or upload initiated.')
