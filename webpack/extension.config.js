//@ts-check

'use strict';

const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const IgnoreDynamicRequire = require('webpack-ignore-dynamic-require');

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
      hints: false
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
    plugins: [
      new IgnoreDynamicRequire()
    ]
  }
];

module.exports = (env, argv) => {
  for (const configItem of config) {
    configItem.mode = argv.mode;

    if (argv.mode === 'production') {
      configItem.devtool = "hidden-source-map";

      configItem.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: "extension.html",
        openAnalyzer: false
      }));
    }
  }

  return config;
};