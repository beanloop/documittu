/* eslint no-console: "off", prefer-template: "off" */
// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production'

const chalk = require('chalk')
const filesize = require('filesize')
const fs = require('fs')
const gzipSize = require('gzip-size').sync
const path = require('path')
const recursive = require('recursive-readdir')
const rimrafSync = require('rimraf').sync
const stripAnsi = require('strip-ansi')
const webpack = require('webpack')

const paths = require('../config/paths')
const webpackConfig = require('../config/webpack.prod')


// Input: /User/dan/app/build/static/js/main.82be8.js
// Output: /static/js/main.js
function removeFileNameHash(fileName) {
  return fileName
    .replace(paths.appDocs, '')
    .replace(/\/?(.*)(\.\w+)(\.js|\.css)/, (match, p1, p2, p3) => p1 + p3)
}

// Input: 1024, 2048
// Output: "(+1 KB)"
function getDifferenceLabel(currentSize, previousSize) {
  const FIFTY_KILOBYTES = 1024 * 50
  const difference = currentSize - previousSize
  const fileSize = !Number.isNaN(difference) ? filesize(difference) : 0
  if (difference >= FIFTY_KILOBYTES) {
    return chalk.red('+' + fileSize)
  } else if (difference < FIFTY_KILOBYTES && difference > 0) {
    return chalk.yellow('+' + fileSize)
  } else if (difference < 0) {
    return chalk.green(fileSize)
  } else {
    return ''
  }
}

// Print a detailed summary of build files.
function printFileSizes(stats, previousSizeMap) {
  const assets = stats.toJson().assets
    .filter(asset => /\.(js|css)$/.test(asset.name))
    .map(asset => {
      const fileContents = fs.readFileSync(paths.appDocs + '/' + asset.name)
      const size = gzipSize(fileContents)
      const previousSize = previousSizeMap[removeFileNameHash(asset.name)]
      const difference = getDifferenceLabel(size, previousSize)
      return {
        folder: path.join('build', path.dirname(asset.name)),
        name: path.basename(asset.name),
        size,
        sizeLabel: filesize(size) + (difference ? ' (' + difference + ')' : '')
      }
    })
  assets.sort((a, b) => b.size - a.size)
  const longestSizeLabelLength = Math.max.apply(null,
    assets.map(a => stripAnsi(a.sizeLabel).length)
  )
  assets.forEach(asset => {
    let sizeLabel = asset.sizeLabel
    const sizeLength = stripAnsi(sizeLabel).length
    if (sizeLength < longestSizeLabelLength) {
      const rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength)
      sizeLabel += rightPadding
    }
    console.log(
      '  ' + sizeLabel +
      '  ' + chalk.dim(asset.folder + path.sep) + chalk.cyan(asset.name)
    )
  })
}

// Create the production build and print the deployment instructions.
function buildWebpack(previousSizeMap) {
  console.log('Creating an optimized production build...')
  webpack(webpackConfig).run((err, stats) => {
    if (err) {
      console.error('Failed to create a production build. Reason:')
      console.error(err.message || err)
      process.exit(1)
    }

    console.log(chalk.green('Compiled successfully.'))
    console.log()

    console.log('File sizes after gzip:')
    console.log()
    printFileSizes(stats, previousSizeMap)
    console.log()

    const openCommand = process.platform === 'win32' ? 'start' : 'open'
    const homepagePath = require(paths.appPackageJson).homepage
    const publicPath = webpackConfig.output.publicPath
    if (publicPath !== '/') {
      // "homepage": "http://mywebsite.com/project"
      console.log(`The project was built assuming it is hosted at ${chalk.green(publicPath)}.`)
      console.log(`You can control this with the ${chalk.green('homepage')} field in your ${chalk.cyan('package.json')}.`)
      console.log()
      console.log(`The ${chalk.cyan(paths.appDocs)} folder is ready to be deployed.`)
      console.log()
    } else {
      // no homepage or "homepage": "http://mywebsite.com"
      console.log('The project was built assuming it is hosted at the server root.')
      if (homepagePath) {
        // "homepage": "http://mywebsite.com"
        console.log(`You can control this with the ${chalk.green('homepage')} field in your ${chalk.cyan('package.json')}.`)
        console.log()
      } else {
        // no homepage
        console.log(`To override this, specify the ${chalk.green('homepage')} in your ${chalk.cyan('package.json')}.`)
        console.log()
      }
      console.log(`The ${chalk.cyan(paths.appDocs)} folder is ready to be deployed.`)
      console.log('You may also serve it locally with a static server:')
      console.log()
      console.log(`  ${chalk.cyan('npm')} install -g pushstate-server`)
      console.log(`  ${chalk.cyan('pushstate-server')} ${paths.appDocs}`)
      console.log(`  ${chalk.cyan(openCommand)} http://localhost:9000`)
      console.log()
    }
  })
}

function build() {
  // First, read the current file sizes in build directory.
  // This lets us display how much they changed later.
  recursive(paths.appDocs, (err, fileNames) => {
    const previousSizeMap = (fileNames || [])
      .filter(fileName => /\.(js|css)$/.test(fileName))
      .reduce((memo, fileName) => {
        const contents = fs.readFileSync(fileName)
        const key = removeFileNameHash(fileName)
        memo[key] = gzipSize(contents)
        return memo
      }, {})

    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    rimrafSync(paths.appDocs + '/static/*')

    // Start the webpack build
    buildWebpack(previousSizeMap)
  })
}

build()
