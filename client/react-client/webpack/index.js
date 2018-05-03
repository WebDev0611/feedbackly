const webpack = require("webpack");
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require('autoprefixer');
var Visualizer = require('webpack-visualizer-plugin');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const extractStyles = new ExtractTextPlugin('react-client.min.css');

module.exports = (env, devBuild) => {
    var config = {
        entry: [path.resolve('react-client/index.js')],
        output: { filename: 'react-client.min.js', path: path.resolve('dist/') },
        module: {
            rules: [
                {
                    test: /\.yml/,
                    loader: 'json-loader!yaml-loader'
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['es2015', { modules: false }], 'stage-0', 'react'
                        ],
                        plugins: ['lodash']

                    }
                },
                {
                    test: /\.(sass|scss)$/,
                    enforce: "pre",
                    use: "import-glob-loader"
                },
                {
                    test: /\.(sass|s?css)$/,
                    use: extractStyles.extract({
                        use: [

                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: devBuild,
                                minimize: !devBuild,
                                discardComments: {
                                  removeAll: !devBuild
                                }
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [autoprefixer]
                            }
                        },
                        { loader: 'resolve-url-loader'},
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        },
                        ]})
                },

                {         test: /\.(jpe?g|png|gif|svg)$/i, use: 'ignore-loader' }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(devBuild ? 'development' : 'production'),
                'process.env.CLIENT_URL': JSON.stringify(env.CLIENT_URL)
            }),
            extractStyles,
            new Visualizer(),
            new LodashModuleReplacementPlugin({
                'paths': true
            })            
        ],
        resolve: {
            modules: ['node_modules', 'react-client/']
        },
        watch: devBuild,
        cache: devBuild,
        devtool: devBuild ? 'eval-source-map' : '',
    };
    if (!devBuild) config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    return config;

}
