'use strict';

const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackManifestPlugin = require('webpack-manifest-plugin').WebpackManifestPlugin;

const config = [{
  name: 'panel',
  target: 'web',
  entry: './src/panelWebView/index.tsx',
  output: {
    filename: 'panel.[name].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, '../dist')
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    fallback: {
      "path": require.resolve("path-browserify")
    }
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
        use: ['style-loader', 'css-loader', {
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              plugins: {
                'postcss-import': {},
                'tailwindcss/nesting': {},
                tailwindcss: {
                  config: path.resolve(__dirname, '../tailwind.panel.js')
                },
                autoprefixer: {},
              },
            },
          },
        }]
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
    hints: false
  },
  plugins: [
    new WebpackManifestPlugin({
      publicPath: "",
      fileName: "panel.manifest.json"
    })
  ],
  devServer: {
    compress: true,
    port: 9001,
    hot: true,
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (error.message === "ResizeObserver loop limit exceeded") {
            return false;
          }

          return true;
        }
      }
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
        reportFilename: "viewpanel.html",
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