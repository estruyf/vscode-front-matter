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
      vscode: 'commonjs vscode'
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
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: "extension.html",
        openAnalyzer: false
      })
    ]
  },
  {
    name: 'panelWebView',
    target: 'web',
    entry: './src/panelWebView/index.tsx',
    output: {
      filename: 'panelWebView.js',
      path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [{
            loader: 'ts-loader'
          }]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false
          }
        }
      ]
    },
    performance: {
      maxEntrypointSize: 400000,
      maxAssetSize: 400000
    },
    // optimization: {
    //   splitChunks: {
    //     cacheGroups: {
    //       vendors: {
    //         test: /node_modules/,
    //         chunks: 'initial',
    //         filename: 'vendors.[contenthash].js',
    //         priority: 1,
    //         maxInitialRequests: 2, // create only one vendor file
    //         minChunks: 1,
    //       }
    //     }
    //   }
    // },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: "viewpanel.html",
        openAnalyzer: false
      })
    ]
  }
];

module.exports = (env, argv) => {
  for (const configItem of config) {
    configItem.mode = argv.mode;
  }

  return config;
};