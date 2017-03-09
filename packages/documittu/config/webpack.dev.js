/* eslint prefer-template: "off" */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const AnalyzerPlugin = require('./analyzer-plugin')
const paths = require('./paths')
const getClientEnvironment = require('react-scripts/config/env');
const VirtualModulePlugin = require('virtual-module-webpack-plugin');

var publicUrl = '';
// Get environment variables to inject into our app.
var env = getClientEnvironment(publicUrl);

// // @remove-on-eject-begin
// // `path` is not used after eject - see https://github.com/facebookincubator/create-react-app/issues/1174
// var path = require('path');
// // @remove-on-eject-end

// // Webpack uses `publicPath` to determine where the app is being served from.
// // In development, we always serve from the root. This makes config easier.
// var publicPath = '/';
// // `publicUrl` is just like `publicPath`, but we will provide it to our app
// // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// // Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.

// // This is the development configuration.
// // It is focused on developer experience and fast rebuilds.
// // The production configuration is different and lives in a separate file.
// module.exports = {
//   // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
//   // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
//   // devtool: 'cheap-module-source-map',
//   devtool: 'none',
//   // These are the "entry points" to our application.
//   // This means they will be the "root" imports that are included in JS bundle.
//   // The first two entry points enable "hot" CSS and auto-refreshes for JS.
//   entry: [
//     // Include an alternative client for WebpackDevServer. A client's job is to
//     // connect to WebpackDevServer by a socket and get notified about changes.
//     // When you save a file, the client will either apply hot updates (in case
//     // of CSS changes), or refresh the page (in case of JS changes). When you
//     // make a syntax error, this client will display a syntax error overlay.
//     // Note: instead of the default WebpackDevServer client, we use a custom one
//     // to bring better experience for Create React App users. You can replace
//     // the line below with these two lines if you prefer the stock client:
//     // require.resolve('webpack-dev-server/client') + '?/',
//     // require.resolve('webpack/hot/dev-server'),
//     require.resolve('react-dev-utils/webpackHotDevClient'),
//     // We ship a few polyfills by default:
//     require.resolve('react-scripts/config/polyfills'),
//     // Finally, this is your app's code:
//     paths.appEntry,
//     // We include the app code last so that if there is a runtime error during
//     // initialization, it doesn't blow up the WebpackDevServer client, and
//     // changing JS code would still trigger a refresh.
//   ],
//   output: {
//     // Next line is not used in dev but WebpackDevServer crashes without it:
//     path: paths.appDocs,
//     // Add /* filename */ comments to generated require()s in the output.
//     pathinfo: true,
//     // This does not produce a real file. It's just the virtual path that is
//     // served by WebpackDevServer in development. This is the JS bundle
//     // containing code from all our entry points, and the Webpack runtime.
//     filename: 'static/js/bundle.js',
//     // This is the URL that app is served from. We use "/" in development.
//     publicPath: publicPath
//   },
//   resolve: {
//     // This allows you to set a fallback for where Webpack should look for modules.
//     // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
//     // We placed these paths second because we want `node_modules` to "win"
//     // if there are any conflicts. This matches Node resolution mechanism.
//     // https://github.com/facebookincubator/create-react-app/issues/253
//     modules: ['node_modules'].concat(paths.nodePaths),
//     // These are the reasonable defaults supported by the Node ecosystem.
//     // We also include JSX as a common component filename extension to support
//     // some tools, although we do not recommend using it, see:
//     // https://github.com/facebookincubator/create-react-app/issues/290
//     extensions: ['.ts', '.tsx', '.js', '.json', '.jsx'],
//     alias: {
//       // Support React Native Web
//       // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
//       'react-native': 'react-native-web'
//     }
//   },
//   // @remove-on-eject-begin
//   // Resolve loaders (webpack plugins for CSS, images, transpilation) from the
//   // directory of `react-scripts` itself rather than the project directory.
//   resolveLoader: {
//     modules: [
//       paths.ownNodeModules,
//       // Lerna hoists everything, so we need to look in our app directory
//       paths.appNodeModules
//     ]
//   },
//   // @remove-on-eject-end
//   module: {
//     rules: [
//       // Disable require.ensure as it's not a standard language feature.
//       { parser: { requireEnsure: false } },
//       // ** ADDING/UPDATING LOADERS **
//       // The "url" loader handles all assets unless explicitly excluded.
//       // The `exclude` list *must* be updated with every change to loader extensions.
//       // When adding a new loader, you must add its `test`
//       // as a new entry in the `exclude` list for "url" loader.

//       // "url" loader embeds assets smaller than specified size as data URLs to avoid requests.
//       // Otherwise, it acts like the "file" loader.
//       {
//         exclude: [
//           /\.html$/,
//           /\.(js|jsx)$/,
//           /\.(ts|tsx)$/,
//           /\.css$/,
//           /\.scss$/,
//           /\.json$/,
//           /\.svg$/,
//           /\.md$/,
//         ],
//         loader: 'url-loader',
//         options: {
//           limit: 10000,
//           name: 'static/media/[name].[hash:8].[ext]'
//         }
//       },
//       // Process JS with Babel.
//       {
//         test: /\.(js|jsx)$/,
//         include: [paths.appDocs, paths.template],
//         exclude: /node_modules/,
//         loader: 'babel-loader',
//         options: {
//           babelrc: false,
//           presets: [require.resolve('babel-preset-react-app')],
//           // This is a feature of `babel-loader` for webpack (not Babel itself).
//           // It enables caching results in ./node_modules/.cache/babel-loader/
//           // directory for faster rebuilds.
//           cacheDirectory: true
//         }
//       },
//       // Process TS with Typescript and Babel.
//       {
//         test: /\.(ts|tsx)$/,
//         include: [paths.appDocs, paths.template],
//         exclude: /node_modules/,
//         use: [
//           {
//             loader: 'babel-loader',
//             options: {
//               babelrc: false,
//               presets: [require.resolve('babel-preset-react-app')],
//               // This is a feature of `babel-loader` for webpack (not Babel itself).
//               // It enables caching results in ./node_modules/.cache/babel-loader/
//               // directory for faster rebuilds.
//               cacheDirectory: true
//             }
//           },
//           {
//             loader: 'ts-loader',
//             options: {
//               transpileOnly: true
//             }
//           }
//         ]
//       },
//       // "postcss" loader applies autoprefixer to our CSS.
//       // "css" loader resolves paths in CSS and adds assets as dependencies.
//       // "style" loader turns CSS into JS modules that inject <style> tags.
//       // In production, we use a plugin to extract that CSS to a file, but
//       // in development "style" loader enables hot editing of CSS.
//       {
//         test: /\.css$/,
//         use: [
//           'style-loader',
//           {
//             loader: 'css-loader',
//             options: {
//               importLoaders: 1
//             }
//           },
//           // {
//           //   loader: 'postcss-loader',
//           //   options: {
//           //     ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
//           //     plugins: function () {
//           //       return [
//           //         autoprefixer({
//           //           browsers: [
//           //             '>1%',
//           //             'last 4 versions',
//           //             'Firefox ESR',
//           //             'not ie < 9', // React doesn't support IE8 anyway
//           //           ]
//           //         })
//           //       ]
//           //     }
//           //   }
//           // }
//         ]
//       },
//       {
//         test: /\.scss$/,
//         use: [
//           'style-loader',
//           {
//             loader: 'css-loader',
//             options: {
//               importLoaders: 1,
//               modules: true,
//             }
//           },
//           // {
//           //   loader: 'postcss-loader',
//           //   options: {
//           //     ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
//           //     plugins: function () {
//           //       return [
//           //         autoprefixer({
//           //           browsers: [
//           //             '>1%',
//           //             'last 4 versions',
//           //             'Firefox ESR',
//           //             'not ie < 9', // React doesn't support IE8 anyway
//           //           ]
//           //         })
//           //       ]
//           //     }
//           //   }
//           // },
//           'sass-loader',
//         ]
//       },
//       // "file" loader for svg
//       {
//         test: /\.svg$/,
//         loader: 'file-loader',
//         options: {
//           name: 'static/media/[name].[hash:8].[ext]'
//         }
//       },
//       {
//         test: /\.md$/,
//         exclude: /node_modules/,
//         use: [
//           {
//             loader: 'babel-loader',
//             options: {
//               babelrc: false,
//               presets: [require.resolve('babel-preset-react-app')],
//               // This is a feature of `babel-loader` for webpack (not Babel itself).
//               // It enables caching results in ./node_modules/.cache/babel-loader/
//               // directory for faster rebuilds.
//               cacheDirectory: true
//             }
//           },
//           'react-markdown-loader'
//         ],
//       },
//       // ** STOP ** Are you adding a new loader?
//       // Remember to add the new extension(s) to the "url" loader exclusion list.
//     ]
//   },
//   plugins: [
//     // Makes some environment variables available in index.html.
//     // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
//     // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
//     // In development, this will be an empty string.
//     new InterpolateHtmlPlugin(env.raw),
//     // Generates an `index.html` file with the <script> injected.
//     new HtmlWebpackPlugin({
//       inject: true,
//       template: paths.templateHtml,
//     }),
//     // Makes some environment variables available to the JS code, for example:
//     // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
//     new webpack.DefinePlugin(env.stringified),
//     // This is necessary to emit hot updates (currently CSS only):
//     new webpack.HotModuleReplacementPlugin(),
//     // Watcher doesn't work well if you mistype casing in a path so we use
//     // a plugin that prints an error when you attempt to do this.
//     // See https://github.com/facebookincubator/create-react-app/issues/240
//     new CaseSensitivePathsPlugin(),
//     // If you require a missing module and then `npm install` it, you still have
//     // to restart the development server for Webpack to discover it. This plugin
//     // makes the discovery automatic so you don't have to restart.
//     // See https://github.com/facebookincubator/create-react-app/issues/186
//     new WatchMissingNodeModulesPlugin(paths.appNodeModules),
//   ],
//   // Some libraries import Node modules but don't use them in the browser.
//   // Tell Webpack to provide empty mocks for them so importing them works.
//   node: {
//     fs: 'empty',
//     net: 'empty',
//     tls: 'empty'
//   },
//   // Turn off performance hints during development because we don't do any
//   // splitting or minification in interest of speed. These warnings become
//   // cumbersome.
//   performance: {
//     hints: false
//   },
//   watchOptions: {
//     ignored: /node_modules/,
//   }
// };


// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
  // This makes the bundle appear split into separate modules in the devtools.
  // We don't use source maps here because they can be confusing:
  // https://github.com/facebookincubator/create-react-app/issues/343#issuecomment-237241875
  // You may want 'cheap-module-source-map' instead if you prefer source maps.
  devtool: 'eval',
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // The first two entry points enable "hot" CSS and auto-refreshes for JS.
  entry: [
    // Include WebpackDevServer client. It connects to WebpackDevServer via
    // sockets and waits for recompile notifications. When WebpackDevServer
    // recompiles, it sends a message to the client by socket. If only CSS
    // was changed, the app reload just the CSS. Otherwise, it will refresh.
    // The "?/" bit at the end tells the client to look for the socket at
    // the root path, i.e. /sockjs-node/. Otherwise visiting a client-side
    // route like /todos/42 would make it wrongly request /todos/42/sockjs-node.
    // The socket server is a part of WebpackDevServer which we are using.
    // The /sockjs-node/ path I'm referring to is hardcoded in WebpackDevServer.
    require.resolve('webpack-dev-server/client') + '?/',
    // Include Webpack hot module replacement runtime. Webpack is pretty
    // low-level so we need to put all the pieces together. The runtime listens
    // to the events received by the client above, and applies updates (such as
    // new CSS) to the running application.
    require.resolve('webpack/hot/dev-server'),
    // We ship a few polyfills by default.
    require.resolve('react-scripts/config/polyfills'),
    // Finally, this is your app's code:
    paths.appEntry,
    // We include the app code last so that if there is a runtime error during
    // initialization, it doesn't blow up the WebpackDevServer client, and
    // changing JS code would still trigger a refresh.
  ],
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appDocs,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/bundle.js',
    // In development, we always serve from the root. This makes config easier.
    publicPath: '/'
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
    // We use `fallback` instead of `root` because we want `node_modules` to "win"
    // if there any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    fallback: paths.nodePaths,
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '', '.scss'],
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web'
    }
  },
  // Resolve loaders (webpack plugins for CSS, images, transpilation) from the
  // directory of `react-scripts` itself rather than the project directory.
  // You can remove this after ejecting.
  resolveLoader: {
    root: paths.ownNodeModules,
    moduleTemplates: ['*-loader']
  },
  module: {
    // First, run the linter.
    // It's important to do this before Babel processes the JS.
    // preLoaders: [
    //   {
    //     test: /\.(js|jsx)$/,
    //     loader: 'eslint',
    //     include: paths.appSrc,
    //   }
    // ],
    loaders: [
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        include: [paths.appDocs, paths.template],
        exclude: /node_modules/,
        loader: 'babel',
        query: require('tscomp/config/babel.dev')
      },
      // Process TS with Typescript and Babel.
      {
        test: /\.(ts|tsx)$/,
        include: [paths.appDocs, paths.template],
        exclude: /node_modules/,
        loaders: [
          'babel?' + JSON.stringify(require('tscomp/config/babel.dev')),
          'ts',
        ],
      },
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader turns CSS into JS modules that inject <style> tags.
      // In production, we use a plugin to extract that CSS to a file, but
      // in development "style" loader enables hot editing of CSS.
      // {
      //   test: /\.css$/,
      //   loader: 'style!css!postcss'
      // },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.scss$/,
        loaders: [
          'style',
          'css?modules&importLoaders=1&localIdentName=[path][name]---[local]---[hash:base64:5]',
          'postcss',
          'sass',
        ]
      },
      // JSON is not enabled by default in Webpack but both Node and Browserify
      // allow it implicitly so we also enable it.
      {
        test: /\.json$/,
        loader: 'json'
      },
      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        exclude: /\/favicon.ico$/,
        loader: 'file',
        query: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      // A special case for favicon.ico to place it into build root directory.
      {
        test: /\/favicon.ico$/,
        include: [paths.appSrc],
        loader: 'file',
        query: {
          name: 'favicon.ico?[hash:8]'
        }
      },
      // "url" loader works just like "file" loader but it also embeds
      // assets smaller than specified size as data URLs to avoid requests.
      {
        test: /\.(mp4|webm)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      // "html" loader is used to process template page (index.html) to resolve
      // resources linked with <link href="./relative/path"> HTML tags.
      {
        test: /\.html$/,
        loader: 'html',
        query: {
          attrs: ['link:href'],
        }
      },
      {
        test: /\.md$/,
        include: [paths.appDocs],
        exclude: /node_modules/,
        loaders: [
          'babel?' + JSON.stringify(require('tscomp/config/babel.dev')),
          'documittu-markdown'
        ],
      },
    ]
  },
  // We use PostCSS for autoprefixing only.
  postcss: () => [
    autoprefixer({
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 10',
      ]
    }),
  ],
  plugins: [
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.templateHtml,
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `env.js`.
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules)
  ]
}
