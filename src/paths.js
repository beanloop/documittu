const path = require('path')

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebookincubator/create-react-app/issues/253.

// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders

// We will export `nodePaths` as an array of absolute paths.
// It will then be used by Webpack configs.
// Jest doesn’t need this because it already handles `NODE_PATH` out of the box.

const srcPath = 'src'
const buildPath = 'dist2'

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .map(p => path.resolve(p))

function resolveApp(relativePath) {
  return path.resolve(relativePath)
}
function resolveOwn(relativePath) {
  return path.resolve(__dirname, relativePath)
}
function resolveTemplate(relativePath) {
  return path.resolve(__dirname, '..', '..', 'template', relativePath)
}

module.exports = {
  srcPath,
  appDocs: resolveApp('docs'),
  template: resolveTemplate('.'),
  appDir: resolveApp('.'),
  appBuild: resolveApp(buildPath),
  appSrc: resolveApp(srcPath),
  appHtml: resolveTemplate('src/index.html'),
  appEntry: resolveApp('docs/index'),
  appDistIndexJs: resolveApp(`${buildPath}/index`),
  appPackageJson: resolveApp('package.json'),
  appTsConfig: resolveApp('tsconfig.json'),
  testsSetup: resolveApp(`${srcPath}/setupTests.js`),
  appNodeModules: resolveApp('node_modules'),
  // this is empty with npm3 but node resolution searches higher anyway:
  ownNodeModules: resolveOwn('../node_modules'),
  nodePaths,
}
