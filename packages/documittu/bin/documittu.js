#!/usr/bin/env node
/* eslint no-console: "off" */
const spawn = require('cross-spawn')
const script = process.argv[2]
const args = process.argv.slice(3)

switch (script) {
  case 'build':
  case 'start':
    const result = spawn.sync(
      'node',
      [require.resolve(`../scripts/${script}`)].concat(args),
      {stdio: 'inherit'}
    )
    process.exit(result.status)

    break
  default:
    console.log(`Unknown command "${script}". Supported commands are build, watch`)
    console.log('Perhaps you need to update tscomp?')

    break
}
