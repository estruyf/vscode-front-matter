//@ts-check

'use strict';

const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = [
  {
    name: 'extension',
    target: 'node',
    entry: './src/extension.ts',
    output: {
      path: path.resolve(__dirname, '../dist'),
      libraryTarget: 'commonjs2',
      filename: 'extension.js',
      devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    devtool: 'nosources-source-map',
    externals: {
      vscode: 'commonjs vscode',
      'applicationinsights-native-metrics': 'commonjs applicationinsights-native-metrics'
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [{
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{
          loader: 'ts-loader'
        }]
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      }]
    },
    performance: {
      maxEntrypointSize: 400000,
      maxAssetSize: 400000
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /node_modules/,
            chunks: 'initial',
            filename: 'vendors.[contenthash].js',
            priority: 1,
            maxInitialRequests: 2, // create only one vendor file
            minChunks: 1,
          }
        }
      }
    },
    plugins: []
  }
];

module.exports = (env, argv) => {
  for (const configItem of config) {
    configItem.mode = argv.mode;

    if (argv.mode === 'production') {
      configItem.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: "extension.html",
        openAnalyzer: false
      }));
    }
  }

  return config;
};