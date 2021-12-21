//@ts-check

'use strict';

const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = [
  {
    name: 'dashboard',
    target: 'web',
    entry: './src/dashboardWebView/index.tsx',
    output: {
      filename: 'dashboardWebView.js',
      path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx'],
      fallback: { "path": require.resolve("path-browserify") }
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
          use: ['style-loader', 'css-loader', 'postcss-loader']
        }
      ]
    },
    performance: {
      maxEntrypointSize: 400000,
      maxAssetSize: 400000
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: "dashboard.html",
        openAnalyzer: false
      })
    ],
    devServer: {
      compress: true,
      port: 9000,
      hot: true,
      allowedHosts: "all",
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    }
  }
];

module.exports = (env, argv) => {
  for (const configItem of config) {
    configItem.mode = argv.mode;
  }

  return config;
};