const VirtualModulePlugin = require('virtual-module-webpack-plugin');
const paths = require('./paths')

function AnalyzerPlugin(options) {
  this.virtualModulePlugin = new VirtualModulePlugin({
    contents: 'module.exports.apiData = {name: "Jesper!!!!"}',
    path: paths.template + '/src/index.tsx'
  })
  // throw Error('AnalyzerPlugin ' + paths.template + '/src/$analyze-result.js');
}

AnalyzerPlugin.prototype.apply = function(compiler) {
  console.log('AnalyzerPlugin.prototype.apply');
  this.virtualModulePlugin.apply(compiler)

  compiler.plugin('before-run', function() {
    // https://github.com/webpack/webpack/blob/master/lib/Compiler.js
    console.log('Hello World!');
  });
};

module.exports = AnalyzerPlugin
