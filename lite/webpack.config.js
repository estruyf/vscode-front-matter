//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'webworker', // Web extension target
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension-web.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'nosources-source-map',
  externals: {
    vscode: 'commonjs vscode' // The vscode-module is created on-the-fly and must be excluded
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically
      path: false,
      fs: false,
      os: false,
      crypto: false,
      stream: false,
      assert: false,
      buffer: false,
      util: false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  performance: {
    hints: false
  }
};

module.exports = config;
