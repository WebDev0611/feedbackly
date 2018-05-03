'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StatsPlugin = require('stats-webpack-plugin');


var config = {
  entry: [
    path.join(__dirname, 'app/index.js')
  ],

  output: {
    path: path.join(__dirname, '../public/dist/'),
    filename: 'survey-editor.min.js',
    publicPath: '/'
  },
  externals : {
    lodash: '_'
  },
  plugins: [
    new ExtractTextPlugin('survey-editor.min.css'),
  ],
  devServer: {
      stats: { chunks: false }
  },
  stats: {
    assets: false,
    children: false,
    chunks: false,
    hash: false,
    modules: false,
    publicPath: false,
    timings: true,
    version: false,
    warnings: true,
},


  module: {
    loaders: [
      {
        test: /\.yml$/,
        use: [
          'json-loader',
          'yaml-loader'
        ]
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [ 'es2015', { modules: false } ],
            "react",
            "stage-1"
          ],
          "plugins": ["react-hot-loader/babel", "transform-decorators-legacy","transform-object-rest-spread"]
        }

      }, {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!sass-loader'
        })
      }, {
        test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      }, {
        test: /\.(ttf|eot|svg)(\?[a-z0-9#=&.]+)?$/,
        loader: 'file-loader',
        query: {
          name: '[name].[hash].[ext]',
          outputPath: 'react_assets/',
          publicPath: '/dist/react_assets/'
        },

      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        loader: "file-loader",
        query: {
          name: '[name].[hash].[ext]',
          outputPath: 'react_assets/',
          publicPath: '/dist/react_assets/'
        },

      }

    ]
  },
};
module.exports = config;
