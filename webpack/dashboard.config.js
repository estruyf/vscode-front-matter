'use strict';

/* eslint-disable */
const path = require('path');
const {
  ProvidePlugin
} = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackManifestPlugin = require('webpack-manifest-plugin').WebpackManifestPlugin;
const ESLintPlugin = require('eslint-webpack-plugin');

const config = [{
  name: 'dashboard',
  target: 'web',
  entry: './src/dashboardWebView/index.tsx',
  output: {
    filename: 'dashboard.[name].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, '../dist')
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    fallback: {
      "assert": require.resolve("assert"),
      "path": require.resolve("path-browserify"),
      "process/browser": require.resolve("process/browser"),
    }
  },
  module: {
    rules: [{
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader'
      }]
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader', 'postcss-loader']
    },
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    }
    ]
  },
  performance: {
    hints: false
  },
  plugins: [
    new ProvidePlugin({
      // Make a global `process` variable that points to the `process` package,
      // because the `util` package expects there to be a global variable named `process`.
      // Thanks to https://stackoverflow.com/a/65018686/14239942
      process: 'process/browser'
    }),
    new WebpackManifestPlugin({
      publicPath: "",
      fileName: "dashboard.manifest.json"
    }),
    new ESLintPlugin({
      extensions: ['ts', 'tsx'],
      exclude: ['node_modules', 'dist'],
      emitWarning: false,
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
}];

module.exports = (env, argv) => {
  for (const configItem of config) {
    configItem.mode = argv.mode;

    if (argv.mode === 'production') {
      configItem.devtool = "hidden-source-map";

      configItem.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: "dashboard.html",
        openAnalyzer: false
      }));

      configItem.optimization = {
        splitChunks: {
          chunks: 'all',
        },
      };
    }
  }

  return config;
};